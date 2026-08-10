import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { compile } from 'svelte/compiler';

/*
 * Static evidence that the home route no longer pulls in the legacy hero stack.
 *
 * This walks the real import graph of src/routes/+page.svelte rather than
 * grepping one file, because "home does not import the carousel" is only true
 * if nothing home imports imports it either. If someone reintroduces Splide
 * three components deep, this fails.
 *
 * It is static analysis, not a browser test: it proves the modules are absent
 * from the graph, not that the rendered page looks right. Visual and a11y
 * verification is Cypress's gate — see the handoff doc.
 */

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const srcDir = path.join(root, 'src');
const libDir = path.join(srcDir, 'lib');

const ENTRY = path.join(srcDir, 'routes', '+page.svelte');

/*
 * Scan code, not prose.
 *
 * These files document what was removed ("the 5-slide Splide shader carousel",
 * 'href="#" placeholders'), so a naive source scan flags its own explanation.
 * Comments are stripped before any forbidden-pattern check; the raw source is
 * still what gets compiled.
 *
 * Line comments are only stripped when they start a line, so a `//` inside a
 * URL literal cannot swallow the rest of that line.
 */
function stripComments(source) {
	return source
		.replace(/<!--[\s\S]*?-->/g, '')
		.replace(/\/\*[\s\S]*?\*\//g, '')
		.split('\n')
		.filter((line) => !/^\s*\/\//.test(line))
		.join('\n');
}

/** Resolve an import specifier to a file inside src/, or null if external. */
function resolveSpecifier(specifier, fromFile) {
	if (specifier.startsWith('$lib/')) {
		return path.join(libDir, specifier.slice('$lib/'.length));
	}
	if (specifier.startsWith('./') || specifier.startsWith('../')) {
		return path.resolve(path.dirname(fromFile), specifier);
	}
	// $app/*, $env/*, node_modules — outside our source graph.
	return null;
}

function importsOf(source, fromFile) {
	const specifiers = [];
	// `import x from '...'`, `import { a } from '...'`, and bare `import '...'`.
	const re = /import\s+(?:[^'"]*?\sfrom\s+)?['"]([^'"]+)['"]/g;
	let match;
	while ((match = re.exec(source)) !== null) {
		const resolved = resolveSpecifier(match[1], fromFile);
		if (resolved) specifiers.push(resolved);
	}
	return specifiers;
}

/** Depth-first walk of the home module graph. */
function collectGraph(entry) {
	const seen = new Map();
	const queue = [entry];

	while (queue.length > 0) {
		const file = queue.pop();
		if (seen.has(file)) continue;
		if (!existsSync(file)) continue;

		const source = readFileSync(file, 'utf8');
		seen.set(file, source);

		for (const next of importsOf(source, file)) {
			if (!seen.has(next)) queue.push(next);
		}
	}

	return seen;
}

const graph = collectGraph(ENTRY);
const graphFiles = [...graph.keys()].map((f) => path.relative(root, f).replace(/\\/g, '/'));

test('the home import graph was actually resolved', () => {
	// Guard against the walker silently finding nothing and passing vacuously.
	assert.ok(graph.size >= 8, `expected a non-trivial graph, got ${graph.size}: ${graphFiles}`);
	assert.ok(graphFiles.includes('src/routes/+page.svelte'));
	assert.ok(graphFiles.includes('src/lib/home/HomeHero.svelte'));
	assert.ok(graphFiles.includes('src/lib/ScenarioEntry.svelte'));
	assert.ok(graphFiles.includes('src/lib/enquiry.js'));
});

test('no legacy hero module is in the home graph', () => {
	const forbidden = [
		'Carousel.svelte',
		'Preloader.svelte',
		'InfoBlock.svelte',
		'Hero.svelte',
		'ImageViewer.svelte'
	];

	for (const name of forbidden) {
		const hit = graphFiles.filter((f) => f.endsWith(`/${name}`));
		assert.deepEqual(hit, [], `${name} is reachable from home: ${hit}`);
	}
});

test('no carousel, shader or Three.js reference survives anywhere in the home graph', () => {
	const forbidden = [
		/splide/i,
		/SplideShaderCarousel/,
		/three(\.min)?\.js/i,
		/from ['"]three['"]/,
		/shader/i,
		/dissolveShader/,
		/wave01\.jpg/,
		/preloadImages/,
		/@egjs\/flicking/i
	];

	for (const [file, source] of graph) {
		const rel = path.relative(root, file).replace(/\\/g, '/');
		const code = stripComments(source);
		for (const pattern of forbidden) {
			assert.equal(
				pattern.test(code),
				false,
				`${rel} still matches ${pattern}`
			);
		}
	}
});

test('the home page no longer forces a wait or locks body scroll', () => {
	const home = stripComments(graph.get(ENTRY));
	assert.equal(/setTimeout/.test(home), false, 'home still schedules a forced delay');
	assert.equal(/document\.body\.style\.overflow/.test(home), false, 'home still locks scroll');
	assert.equal(/no-scroll/.test(home), false, 'home still applies the scroll lock class');
	assert.equal(/new Image\(/.test(home), false, 'home still preloads images imperatively');
});

test('no route renders the artificial timer preloader any more', () => {
	/*
	 * Every route is server-rendered, so a 1500ms timer that hides finished
	 * content — and locked body scroll while it ran — is pure added latency.
	 * The shared component file survives (deleting it is a separate decision),
	 * but nothing may render it and nothing may schedule the wait.
	 */
	const layout = stripComments(
		readFileSync(path.join(srcDir, 'routes', '+layout.svelte'), 'utf8')
	);

	assert.equal(/<Preloader/.test(layout), false, 'the layout still renders Preloader');
	assert.equal(/setTimeout/.test(layout), false, 'the layout still schedules a forced wait');
	assert.equal(/no-scroll'\)/.test(layout) && /add\(/.test(layout), false, 'the layout still locks scroll');

	// Shared modules survive for whoever else may need them.
	assert.ok(existsSync(path.join(libDir, 'Preloader.svelte')), 'shared Preloader was deleted');
	assert.ok(existsSync(path.join(libDir, 'Carousel.svelte')), 'shared Carousel was deleted');
	assert.ok(existsSync(path.join(libDir, 'InfoBlock.svelte')), 'shared InfoBlock was deleted');
});

test('contacts, about and the catalog render their own Quiet Coast shell', () => {
	const layout = stripComments(
		readFileSync(path.join(srcDir, 'routes', '+layout.svelte'), 'utf8')
	);
	assert.match(layout, /OWN_SHELL_ROUTES = \['\/', '\/contacts', '\/about', '\/objects'\]/);

	for (const route of ['contacts', 'about', 'objects']) {
		const source = readFileSync(path.join(srcDir, 'routes', route, '+page.svelte'), 'utf8');
		assert.match(source, /QuietCoastHeader/, `${route} has no Quiet Coast header`);
		assert.match(source, /QuietCoastFooter/, `${route} has no Quiet Coast footer`);
		assert.match(source, /qc-skip-link/, `${route} has no skip link`);
		assert.match(source, /<main id="main">/, `${route} has no main landmark`);
	}
});

test('contacts and about carry no starter-template leftovers', () => {
	for (const route of ['contacts', 'about']) {
		const source = stripComments(
			readFileSync(path.join(srcDir, 'routes', route, '+page.svelte'), 'utf8')
		);
		for (const pattern of [
			/flowbite\.com/i,
			/tailwindcss\.com/i,
			/support@mail\.com/i,
			/linear-gradient/i,
			/backdrop-filter/i,
			/fonts\.googleapis\.com/i,
			/#3800e7/i,
			/#8a15ff/i
		]) {
			assert.equal(
				pattern.test(source),
				false,
				`src/routes/${route}/+page.svelte still matches ${pattern}`
			);
		}
	}
});

test('no home surface ships a dead "#" link', () => {
	for (const [file, source] of graph) {
		const rel = path.relative(root, file).replace(/\\/g, '/');
		assert.equal(
			/href="#"/.test(stripComments(source)),
			false,
			`${rel} contains an href="#" placeholder`
		);
	}
});

test('the home graph declares exactly one H1', () => {
	const withH1 = [...graph]
		.filter(([, source]) => /<h1[\s>]/.test(source))
		.map(([file]) => path.relative(root, file).replace(/\\/g, '/'));

	assert.deepEqual(withH1, ['src/lib/home/HomeHero.svelte']);

	const heroSource = graph.get(path.join(libDir, 'home', 'HomeHero.svelte'));
	assert.equal((heroSource.match(/<h1[\s>]/g) || []).length, 1);
});

test('the home graph carries no legacy visual tokens', () => {
	// black/purple/gradient/glow/orb callback, per the slice brief.
	const forbidden = [
		/linear-gradient/i,
		/radial-gradient/i,
		/box-shadow:\s*0 0 \d+px/i,
		/bg-gradient-to-/,
		/from-teal-/,
		/dark:bg-gray-/
	];

	for (const [file, source] of graph) {
		const rel = path.relative(root, file).replace(/\\/g, '/');
		const code = stripComments(source);
		for (const pattern of forbidden) {
			assert.equal(pattern.test(code), false, `${rel} still matches ${pattern}`);
		}
	}
});

test('every Svelte component in the home graph compiles', () => {
	const components = [...graph.keys()].filter((f) => f.endsWith('.svelte'));
	assert.ok(components.length >= 6, `expected the full shell, got ${components.length}`);

	for (const file of components) {
		const rel = path.relative(root, file).replace(/\\/g, '/');
		assert.doesNotThrow(() => {
			compile(readFileSync(file, 'utf8'), { filename: rel, generate: 'ssr' });
		}, `${rel} failed to compile`);
	}
});

test('the changed shared components still compile', () => {
	for (const rel of ['src/routes/+layout.svelte', 'src/lib/Modal.svelte']) {
		const file = path.join(root, rel);
		assert.doesNotThrow(() => {
			compile(readFileSync(file, 'utf8'), { filename: rel, generate: 'ssr' });
		}, `${rel} failed to compile`);
	}
});

test('the enquiry modal forwards the full context', () => {
	// A scenario CTA that arrives without its intent is not a working flow.
	const modal = readFileSync(path.join(libDir, 'Modal.svelte'), 'utf8');
	for (const prop of ['objectName=', 'objectId=', 'objectSlug=', 'intent=', 'scenario=', 'url=']) {
		assert.ok(modal.includes(prop), `Modal.svelte does not forward ${prop}`);
	}
});

test('the preview comparer is not reachable from any other route', () => {
	// Only home may render it; a stray import elsewhere would put the switcher
	// on a page whose server load never evaluated the gate.
	const routesDir = path.join(srcDir, 'routes');
	const otherEntries = [
		'about/+page.svelte',
		'contacts/+page.svelte',
		'objects/+page.svelte',
		'objects/[slug]/+page.svelte',
		'+layout.svelte',
		'+error.svelte'
	];

	for (const rel of otherEntries) {
		const file = path.join(routesDir, rel);
		if (!existsSync(file)) continue;
		const source = readFileSync(file, 'utf8');
		assert.equal(
			/PreviewComparer|preview-comparer|home-themes\.css/.test(source),
			false,
			`${rel} references the preview comparer`
		);
	}
});
