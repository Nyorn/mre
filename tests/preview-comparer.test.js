import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
	PREVIEW_STORAGE_KEY,
	THEME_IDS,
	COPY_IDS,
	DEFAULT_THEME,
	DEFAULT_COPY,
	resolvePreviewGate,
	allowTheme,
	allowCopy,
	parseQueryPreview,
	serializeStoredPreview,
	resolvePreviewVariant,
	buildPreviewSearch,
	buildShareUrl
} from '../src/lib/preview-comparer.js';

/* ---------------------------------------------------------------------------
 * Gate — the property that keeps the switcher off production
 * ------------------------------------------------------------------------ */

test('a Netlify deploy preview opens the gate', () => {
	assert.equal(resolvePreviewGate('deploy-preview'), true);
});

test('the production context closes the gate', () => {
	assert.equal(resolvePreviewGate('production'), false);
});

test('production wins even when the local override is set', () => {
	// The override exists for `vite dev`. If it is ever set on the production
	// site by mistake, the deployment context must still veto it.
	assert.equal(
		resolvePreviewGate('production', { dev: true, override: 'true' }),
		false
	);
});

test('branch deploys and unknown contexts do not open the gate', () => {
	assert.equal(resolvePreviewGate('branch-deploy'), false);
	assert.equal(resolvePreviewGate('dev'), false);
	assert.equal(resolvePreviewGate(''), false);
	assert.equal(resolvePreviewGate(undefined), false);
	assert.equal(resolvePreviewGate(null), false);
});

test('the local override needs the exact string true, and a real dev server', () => {
	// The override is now confined to `vite dev`; see tests/deployment-gate.test.js
	// for the full matrix proving it is unreachable from any deployed context.
	assert.equal(resolvePreviewGate('', { dev: true, override: 'true' }), true);
	assert.equal(resolvePreviewGate('', { dev: true, override: '1' }), false);
	assert.equal(resolvePreviewGate('', { dev: true, override: 'TRUE' }), false);
	assert.equal(resolvePreviewGate('', { dev: true, override: 'yes' }), false);

	// Same variable, no dev server: no.
	assert.equal(resolvePreviewGate('', { dev: false, override: 'true' }), false);
});

test('the context comparison tolerates case and padding from the CI env', () => {
	assert.equal(resolvePreviewGate(' Deploy-Preview '), true);
	assert.equal(resolvePreviewGate(' PRODUCTION '), false);
});

/* ---------------------------------------------------------------------------
 * Allowlist
 * ------------------------------------------------------------------------ */

test('exactly three themes and three copy variants exist', () => {
	assert.deepEqual(THEME_IDS, ['quiet', 'mediterranean', 'atlas']);
	assert.deepEqual(COPY_IDS, ['scenario', 'evidence', 'compare']);
});

test('the defaults are the production pair', () => {
	assert.equal(DEFAULT_THEME, 'quiet');
	assert.equal(DEFAULT_COPY, 'scenario');
});

test('only allowlisted ids survive', () => {
	for (const id of THEME_IDS) assert.equal(allowTheme(id), id);
	for (const id of COPY_IDS) assert.equal(allowCopy(id), id);

	for (const bad of ['QUIET', 'atlas ', 'sunset', '', null, undefined, 0, {}, []]) {
		assert.equal(allowTheme(bad), null);
		assert.equal(allowCopy(bad), null);
	}
});

test('a theme id is not accepted as a copy id', () => {
	assert.equal(allowCopy('quiet'), null);
	assert.equal(allowTheme('scenario'), null);
});

test('an injection attempt through the query string is rejected, not echoed', () => {
	const parsed = parseQueryPreview(
		'preview_theme=%3Cscript%3Ealert(1)%3C%2Fscript%3E&preview_copy=../../etc/passwd'
	);
	assert.deepEqual(parsed, { theme: null, copy: null });
});

/* ---------------------------------------------------------------------------
 * Query parsing
 * ------------------------------------------------------------------------ */

test('both parameters are read from a query string', () => {
	assert.deepEqual(parseQueryPreview('?preview_theme=atlas&preview_copy=compare'), {
		theme: 'atlas',
		copy: 'compare'
	});
});

test('an absent or empty query yields nulls, not defaults', () => {
	// Defaulting is resolvePreviewVariant's job; the parser reports only facts.
	assert.deepEqual(parseQueryPreview(''), { theme: null, copy: null });
	assert.deepEqual(parseQueryPreview(undefined), { theme: null, copy: null });
	assert.deepEqual(parseQueryPreview('?utm_source=partner'), { theme: null, copy: null });
});

test('one valid axis is kept when the other is junk', () => {
	assert.deepEqual(parseQueryPreview('?preview_theme=mediterranean&preview_copy=nope'), {
		theme: 'mediterranean',
		copy: null
	});
});

test('a URLSearchParams instance is accepted directly', () => {
	const params = new URLSearchParams({ preview_theme: 'quiet', preview_copy: 'evidence' });
	assert.deepEqual(parseQueryPreview(params), { theme: 'quiet', copy: 'evidence' });
});

/* ---------------------------------------------------------------------------
 * Stored preference — write-only, never an input to a render
 * ------------------------------------------------------------------------ */

test('the storage key is versioned', () => {
	assert.equal(PREVIEW_STORAGE_KEY, 'seaEstate.preview.v1');
});

test('serializing keeps only the two allowlisted ids', () => {
	assert.deepEqual(JSON.parse(serializeStoredPreview({ theme: 'atlas', copy: 'evidence' })), {
		v: 1,
		theme: 'atlas',
		copy: 'evidence'
	});
});

test('serializing junk falls back to the production pair', () => {
	assert.deepEqual(JSON.parse(serializeStoredPreview({ theme: 'x', copy: 'y' })), {
		v: 1,
		theme: 'quiet',
		copy: 'scenario'
	});
	assert.deepEqual(JSON.parse(serializeStoredPreview()), {
		v: 1,
		theme: 'quiet',
		copy: 'scenario'
	});
});

test('nothing reads stored state back — the module exposes no parser', async () => {
	/*
	 * The contract change that closes initial CLS: a bare URL always renders
	 * quiet/scenario. Keeping a parser around would be an invitation to wire
	 * restore back in, so its absence is asserted rather than assumed.
	 */
	const module = await import('../src/lib/preview-comparer.js');
	assert.equal('parseStoredPreview' in module, false);
	assert.equal(typeof module.serializeStoredPreview, 'function');
});

/* ---------------------------------------------------------------------------
 * Variant resolution — priority, and the production guarantee
 * ------------------------------------------------------------------------ */

test('production ignores the query string entirely', () => {
	const resolved = resolvePreviewVariant({
		enabled: false,
		query: { theme: 'atlas', copy: 'compare' }
	});
	assert.deepEqual(resolved, {
		theme: 'quiet',
		copy: 'scenario',
		themeSource: 'default',
		copySource: 'default'
	});
});

test('a bare URL renders the production pair even in a preview', () => {
	/*
	 * The layout-shift contract. The server cannot see localStorage, so any
	 * stored variant could only be applied after hydration — one frame late,
	 * moving the page. Resolution therefore reads the query and nothing else.
	 */
	const resolved = resolvePreviewVariant({ enabled: true, query: {} });
	assert.equal(resolved.theme, 'quiet');
	assert.equal(resolved.copy, 'scenario');
	assert.equal(resolved.themeSource, 'default');
	assert.equal(resolved.copySource, 'default');
});

test('a stored preference passed in by mistake is ignored', () => {
	// The parameter no longer exists; an extra key must not resurrect it.
	const resolved = resolvePreviewVariant({
		enabled: true,
		query: {},
		stored: { theme: 'mediterranean', copy: 'evidence' }
	});
	assert.equal(resolved.theme, 'quiet');
	assert.equal(resolved.copy, 'scenario');
	assert.equal(resolved.themeSource, 'default');
	assert.equal(resolved.copySource, 'default');
});

test('the query is the only source, and both sources report as such', () => {
	const resolved = resolvePreviewVariant({
		enabled: true,
		query: { theme: 'atlas', copy: 'compare' }
	});
	assert.equal(resolved.theme, 'atlas');
	assert.equal(resolved.copy, 'compare');
	assert.equal(resolved.themeSource, 'query');
	assert.equal(resolved.copySource, 'query');
});

test('the two axes resolve independently', () => {
	// A link that pins only the theme leaves the copy at its default rather
	// than being rejected as incomplete.
	const resolved = resolvePreviewVariant({ enabled: true, query: { theme: 'atlas' } });
	assert.equal(resolved.theme, 'atlas');
	assert.equal(resolved.themeSource, 'query');
	assert.equal(resolved.copy, 'scenario');
	assert.equal(resolved.copySource, 'default');
});

test('an enabled preview with no inputs is the production pair', () => {
	const resolved = resolvePreviewVariant({ enabled: true });
	assert.deepEqual(resolved, {
		theme: 'quiet',
		copy: 'scenario',
		themeSource: 'default',
		copySource: 'default'
	});
});

test('no argument at all resolves to the production pair', () => {
	assert.equal(resolvePreviewVariant().theme, 'quiet');
	assert.equal(resolvePreviewVariant().copy, 'scenario');
});

test('all nine combinations resolve to themselves under preview', () => {
	let count = 0;
	for (const theme of THEME_IDS) {
		for (const copy of COPY_IDS) {
			const resolved = resolvePreviewVariant({ enabled: true, query: { theme, copy } });
			assert.equal(resolved.theme, theme);
			assert.equal(resolved.copy, copy);
			count++;
		}
	}
	assert.equal(count, 9);
});

test('all nine combinations collapse to quiet/scenario in production', () => {
	for (const theme of THEME_IDS) {
		for (const copy of COPY_IDS) {
			const resolved = resolvePreviewVariant({ enabled: false, query: { theme, copy } });
			assert.equal(resolved.theme, 'quiet');
			assert.equal(resolved.copy, 'scenario');
		}
	}
});

/* ---------------------------------------------------------------------------
 * Canonical links
 * ------------------------------------------------------------------------ */

test('a canonical search string always carries both keys in a fixed order', () => {
	assert.equal(
		buildPreviewSearch({ theme: 'atlas', copy: 'evidence' }),
		'?preview_theme=atlas&preview_copy=evidence'
	);
	assert.equal(
		buildPreviewSearch({ copy: 'evidence', theme: 'atlas' }),
		'?preview_theme=atlas&preview_copy=evidence'
	);
});

test('an incomplete variant still produces a valid canonical search', () => {
	assert.equal(buildPreviewSearch({}), '?preview_theme=quiet&preview_copy=scenario');
	assert.equal(
		buildPreviewSearch({ theme: 'bogus', copy: 'bogus' }),
		'?preview_theme=quiet&preview_copy=scenario'
	);
});

test('a share URL drops pre-existing parameters', () => {
	// Only the two variant ids travel — no utm, no session junk, no PII.
	const url = buildShareUrl('https://deploy-preview-3--sea.netlify.app', '/', {
		theme: 'mediterranean',
		copy: 'compare'
	});
	assert.equal(
		url,
		'https://deploy-preview-3--sea.netlify.app/?preview_theme=mediterranean&preview_copy=compare'
	);
	assert.equal(url.includes('utm'), false);
});
