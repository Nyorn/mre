import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

/*
 * Regression guard for the credential leak.
 *
 * A live Contentful Delivery token reached this repository because
 * `$env/static/private` inlines values at build time and `build/` + `.netlify/`
 * were tracked, so every clone carried the secret in
 * `.netlify/server/chunks/contentful-fetch.js`.
 *
 * Two independent things have to stay true, and this file asserts both:
 *   1. no build output is tracked, and it is ignored;
 *   2. no source module inlines a private value at build time.
 *
 * Deliberately NO secret value, prefix, or fingerprint appears in this file.
 * The check is structural — shape and provenance — so the test itself can never
 * become the thing that leaks. It scans tracked text files for a quoted
 * high-entropy literal sitting next to credential vocabulary, which catches a
 * pasted token without ever needing to know what the real one was.
 */

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');

/*
 * Scan code, not prose. These modules explain in comments which env import is
 * forbidden and why, so a raw scan flags its own documentation.
 */
function stripComments(source) {
	return source
		.replace(/<!--[\s\S]*?-->/g, '')
		.replace(/\/\*[\s\S]*?\*\//g, '')
		.split('\n')
		.filter((line) => !/^\s*(\/\/|\*)/.test(line))
		.join('\n');
}

function git(args) {
	return execFileSync('git', args, { cwd: root, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
}

const trackedFiles = git(['ls-files'])
	.split('\n')
	.map((line) => line.trim())
	.filter(Boolean);

test('git is available and the tracked file list is real', () => {
	// Without this, every assertion below could pass vacuously.
	assert.ok(trackedFiles.length > 20, `implausible tracked file count: ${trackedFiles.length}`);
	assert.ok(trackedFiles.includes('package.json'));
	assert.ok(trackedFiles.includes('src/lib/contentful-fetch.js'));
});

test('no build output is tracked', () => {
	const artifacts = trackedFiles.filter(
		(f) => f === 'build' || f.startsWith('build/') || f === '.netlify' || f.startsWith('.netlify/')
	);
	assert.deepEqual(
		artifacts,
		[],
		`build output is tracked again (${artifacts.length} files). Build artifacts inline ` +
			`private env values; they must stay out of the index.`
	);
});

test('build output is ignored, so it cannot come back by accident', () => {
	const ignore = readFileSync(path.join(root, '.gitignore'), 'utf8');
	assert.match(ignore, /^\/build$/m);
	assert.match(ignore, /^\/\.netlify$/m);
});

test('no source module reads Contentful credentials through $env/static/private', () => {
	/*
	 * This is the actual root cause. $env/static/private is inlined by the
	 * bundler; $env/dynamic/private is read from the process at request time and
	 * never appears in an artifact.
	 */
	const offenders = trackedFiles
		.filter((f) => f.startsWith('src/') && /\.(js|ts|svelte)$/.test(f))
		.filter((f) => {
			const source = stripComments(readFileSync(path.join(root, f), 'utf8'));
			return (
				source.includes('$env/static/private') &&
				/CONTENTFUL|ACCESS_TOKEN|API_KEY|SECRET/i.test(source)
			);
		});

	assert.deepEqual(
		offenders,
		[],
		`these modules would inline a credential into the build output: ${offenders.join(', ')}`
	);
});

test('the Contentful client reads its credentials at runtime', () => {
	const source = stripComments(readFileSync(path.join(root, 'src/lib/contentful-fetch.js'), 'utf8'));
	assert.match(source, /\$env\/dynamic\/private/);
	assert.equal(source.includes('$env/static/private'), false);
	// And it must fail closed rather than sending an unauthenticated request.
	assert.match(source, /if \(!spaceId \|\| !accessToken\)/);
});

test('no tracked text file carries a credential-shaped literal', () => {
	/*
	 * Heuristic, on purpose: a quoted 32+ character high-entropy run within a few
	 * lines of credential vocabulary. Lockfiles, minified vendor assets and
	 * binaries are excluded — they are full of hashes and would only produce
	 * noise. If this ever fires, report the PATH to the reviewer, never the match.
	 */
	const KEYWORDS = /(contentful|authorization|bearer|access[_-]?token|api[_-]?key|secret|password)/i;
	const LITERAL = /["'`][A-Za-z0-9_-]{32,}["'`]/;

	const skip = [
		/package-lock\.json$/,
		/\.min\.(js|css)$/,
		/\.(png|jpg|jpeg|gif|avif|webp|ico|woff2?|ttf|eot|pdf|zip)$/i
	];

	const findings = [];
	let scanned = 0;

	for (const rel of trackedFiles) {
		if (skip.some((re) => re.test(rel))) continue;

		const abs = path.join(root, rel);
		if (!existsSync(abs)) continue;

		let source;
		try {
			source = readFileSync(abs, 'utf8');
		} catch {
			continue;
		}
		if (source.includes('\u0000')) continue; // binary, not a source file

		scanned++;
		const lines = source.split('\n');
		for (let i = 0; i < lines.length; i++) {
			if (!LITERAL.test(lines[i])) continue;
			const window = lines.slice(Math.max(0, i - 3), i + 4).join('\n');
			if (KEYWORDS.test(window)) {
				// Path and line only. The matched text is never recorded.
				findings.push(`${rel}:${i + 1}`);
			}
		}
	}

	// A vacuous pass would be worse than no test: prove files were really read.
	assert.ok(scanned > 20, `scan covered only ${scanned} files`);

	assert.deepEqual(
		findings,
		[],
		`credential-shaped literal near credential vocabulary at: ${findings.join(', ')}`
	);
});

test('the env example documents the variables without values', () => {
	const example = readFileSync(path.join(root, '.env.example'), 'utf8');
	assert.match(example, /CONTENTFUL_SPACE_ID/);
	assert.match(example, /CONTENTFUL_ACCESS_TOKEN/);

	// Every assignment must be empty or an obvious placeholder.
	for (const line of example.split('\n')) {
		const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
		if (!match) continue;
		const value = match[2].trim().replace(/^["']|["']$/g, '');
		if (value === '') continue;
		assert.ok(
			/^(your|placeholder|changeme|xxx|<|\.\.\.)/i.test(value) || value.length < 24,
			`${match[1]} in .env.example looks like a real value`
		);
	}
});
