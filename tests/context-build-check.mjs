/*
 * Build-level regression check for the Netlify deployment-context bug.
 *
 * The bug it exists to prevent: the preview and analytics gates read CONTEXT
 * from `$env/dynamic/private`, i.e. the SSR function's runtime process.env.
 * Netlify sets CONTEXT for the BUILD and does not put it there, so on the live
 * PR #3 deploy preview the comparer never rendered — and the same mechanism
 * would have shipped a production deploy with GA/GTM switched off.
 *
 * Unit tests cannot catch that: they call the resolver directly and would pass
 * with either wiring. The only honest check is to BUILD the way Netlify builds
 * and render the built server output.
 *
 * That is what this does. For each context it runs a real `vite build` with
 * CONTEXT set, then boots the emitted SvelteKit server exactly as
 * adapter-netlify's own handler does — `new Server(manifest)`, `server.init`,
 * `server.respond` — and asserts on the returned HTML.
 *
 * Not part of `npm test`: it runs two full builds. Run it directly.
 *
 *   node tests/context-build-check.mjs
 *
 * Contentful placeholders are supplied for the build only. They are never
 * written to disk and never reach a commit; Contentful credentials stay on
 * $env/dynamic/private and are read at request time, so nothing here can inline
 * a real token into an artifact.
 */

import { execFileSync, execSync } from 'node:child_process';
import { existsSync, rmSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');

const results = [];
const check = (ok, scope, message) => {
	results.push({ ok, scope, message });
	console.log(`  ${ok ? 'pass' : 'FAIL'}  ${message}`);
};

function build(context) {
	console.log(`\n=== building with CONTEXT=${context || '(unset)'} ===`);
	// Fresh output each time so nothing is inherited from the previous context.
	for (const dir of ['.svelte-kit', '.netlify', 'build']) {
		rmSync(path.join(root, dir), { recursive: true, force: true });
	}

	/*
	 * execSync with a single command string, not execFileSync with an args array
	 * plus shell:true. The latter emits DEP0190, and dropping the shell entirely
	 * cannot launch npm.cmd on Windows under Node 24. One fixed literal command,
	 * no interpolation, so there is nothing to escape.
	 */
	execSync('npm run build', {
		cwd: root,
		stdio: 'pipe',
		env: {
			...process.env,
			CONTEXT: context,
			// Placeholders only: the Contentful client reads these at request
			// time, so nothing is inlined into the artifact.
			CONTENTFUL_SPACE_ID: 'build_check_only',
			CONTENTFUL_ACCESS_TOKEN: 'build_check_only',
			// Must have no effect in a build: the override is dev-only.
			SEA_ESTATE_PREVIEW_COMPARER: 'true'
		}
	});
}

/*
 * Render in a CHILD PROCESS, one per build.
 *
 * Doing it in-process silently produced a wrong answer: a `?v=` cache-bust on
 * the entry module does not invalidate the chunks it statically imports, so the
 * second build rendered using the FIRST build's inlined context and "production"
 * came out looking exactly like a deploy preview. A fresh process is the only
 * way to guarantee the module graph belongs to the build under test.
 */
async function render(pathname) {
	const serverPath = path.join(root, '.netlify', 'server', 'index.js');
	const manifestPath = path.join(root, '.netlify', 'server', 'manifest.js');
	if (!existsSync(serverPath) || !existsSync(manifestPath)) {
		throw new Error('built server output not found; did the build fail?');
	}

	const out = execFileSync(process.execPath, [fileURLToPath(import.meta.url), '--render', pathname], {
		cwd: root,
		encoding: 'utf8',
		maxBuffer: 64 * 1024 * 1024,
		env: { ...process.env, SEA_ESTATE_BUILD_CHECK_CHILD: '1' }
	});

	const marker = out.indexOf('__RENDER_JSON__');
	if (marker === -1) throw new Error(`child renderer produced no result:\n${out.slice(0, 400)}`);
	return JSON.parse(out.slice(marker + '__RENDER_JSON__'.length));
}

/* Child mode: boot the built server exactly as adapter-netlify's handler does. */
if (process.argv.includes('--render')) {
	const pathname = process.argv[process.argv.indexOf('--render') + 1] || '/';
	const serverPath = path.join(root, '.netlify', 'server', 'index.js');
	const manifestPath = path.join(root, '.netlify', 'server', 'manifest.js');

	const { Server } = await import(pathToFileURL(serverPath).href);
	const { manifest } = await import(pathToFileURL(manifestPath).href);

	const server = new Server(manifest);
	await server.init({ env: {} });

	const response = await server.respond(
		new Request(`http://localhost${pathname}`, { headers: { host: 'localhost' } }),
		{ getClientAddress: () => '127.0.0.1' }
	);

	process.stdout.write('__RENDER_JSON__' + JSON.stringify({
		status: response.status,
		html: await response.text()
	}));
	process.exit(0);
}

const has = (html, needle) => html.includes(needle);

async function checkDeployPreview() {
	build('deploy-preview');

	const bare = await render('/');
	check(bare.status === 200, 'preview', `bare / returns 200 (got ${bare.status})`);
	check(has(bare.html, 'Deploy preview'), 'preview', 'comparer bar is rendered');
	check(
		has(bare.html, 'name="robots" content="noindex,nofollow"'),
		'preview',
		'noindex,nofollow is emitted'
	);
	check(
		!has(bare.html, 'googletagmanager.com/gtm.js'),
		'preview',
		'GTM is absent'
	);
	check(
		!has(bare.html, 'googletagmanager.com/gtag/js'),
		'preview',
		'gtag is absent'
	);
	check(!has(bare.html, 'ns.html?id=GTM'), 'preview', 'noscript pixel is absent');
	check(
		has(bare.html, 'data-preview-theme="quiet"'),
		'preview',
		'a bare URL still resolves to quiet (storage is never restored)'
	);

	/*
	 * The catalog resolves the same variant server-side, so the preview_theme
	 * carried across catalog links actually applies there. Only a build with
	 * CONTEXT=deploy-preview can show this: a default build has the gate closed.
	 */
	const catalog = await render('/objects?preview_theme=atlas&preview_copy=compare');
	check(
		has(catalog.html, 'data-preview-theme="atlas"'),
		'preview',
		'the catalog root applies the preview theme'
	);

	const themed = await render('/?preview_theme=atlas&preview_copy=compare');
	check(
		has(themed.html, 'data-preview-theme="atlas"'),
		'preview',
		'the query selects the theme server-side'
	);
	check(
		has(themed.html, 'Сравните объекты у моря'),
		'preview',
		'the query selects the copy bundle server-side'
	);
}

async function checkProduction() {
	build('production');

	const bare = await render('/');
	check(bare.status === 200, 'production', `bare / returns 200 (got ${bare.status})`);

	// The regression that mattered most: analytics must survive.
	check(
		has(bare.html, 'googletagmanager.com/gtm.js'),
		'production',
		'GTM is present'
	);
	check(
		has(bare.html, 'googletagmanager.com/gtag/js'),
		'production',
		'gtag is present'
	);
	check(has(bare.html, 'ns.html?id=GTM'), 'production', 'noscript pixel is present');

	check(!has(bare.html, 'Deploy preview'), 'production', 'comparer bar is absent');
	check(
		!has(bare.html, 'name="robots" content="noindex,nofollow"'),
		'production',
		'no noindex is emitted'
	);
	check(
		has(bare.html, 'rel="canonical" href="https://sea-estate.com/"'),
		'production',
		'canonical still points at the production home'
	);

	const craftedCatalog = await render('/objects?preview_theme=atlas&preview_copy=compare');
	check(
		!has(craftedCatalog.html, 'data-preview-theme'),
		'production',
		'the catalog ignores a crafted preview query'
	);

	const crafted = await render('/?preview_theme=atlas&preview_copy=compare');
	check(
		!has(crafted.html, 'data-preview-theme'),
		'production',
		'a crafted query sets no theme attribute'
	);
	check(
		!has(crafted.html, 'Сравните объекты у моря'),
		'production',
		'a crafted query cannot swap the copy bundle'
	);
	check(
		has(crafted.html, 'Недвижимость у моря под ваш сценарий владения'),
		'production',
		'production keeps the default headline'
	);
	check(
		!has(crafted.html, 'Deploy preview'),
		'production',
		'a crafted query cannot summon the comparer'
	);
	check(
		!has(crafted.html, 'seaEstate.preview.v1'),
		'production',
		'the storage key never reaches production HTML'
	);
}

async function checkNoInlinedSecret() {
	/*
	 * The context is inlined by design; a credential must never be. Both builds
	 * ran with placeholder Contentful values, so if the artifact contained them
	 * the wiring would be inlining credentials.
	 */
	const { execSync: exec } = await import('node:child_process');
	let hits = '';
	try {
		hits = exec('grep -rl build_check_only .netlify build', {
			cwd: root,
			encoding: 'utf8'
		}).trim();
	} catch {
		hits = ''; // grep exits non-zero when there are no matches
	}
	check(
		hits === '',
		'artifact',
		`no Contentful value is inlined into the build output${hits ? ` (found in: ${hits})` : ''}`
	);
}

async function main() {
	try {
		await checkDeployPreview();
		await checkProduction();
		await checkNoInlinedSecret();
	} finally {
		// Leave no build output behind; these paths are gitignored but a stale
		// tree confuses the next run.
		for (const dir of ['.svelte-kit', '.netlify', 'build']) {
			rmSync(path.join(root, dir), { recursive: true, force: true });
		}
	}

	const failed = results.filter((r) => !r.ok);
	console.log(`\n${results.length - failed.length} passed, ${failed.length} failed`);
	if (failed.length) process.exit(1);
}

if (!process.argv.includes('--render')) {
	main().catch((err) => {
		console.error(err);
		process.exit(2);
	});
}
