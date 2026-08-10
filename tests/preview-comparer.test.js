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
	parseStoredPreview,
	serializeStoredPreview,
	resolvePreviewVariant,
	buildPreviewSearch,
	buildShareUrl
} from '../src/lib/preview-comparer.js';

/* ---------------------------------------------------------------------------
 * Gate — the property that keeps the switcher off production
 * ------------------------------------------------------------------------ */

test('a Netlify deploy preview opens the gate', () => {
	assert.equal(resolvePreviewGate({ CONTEXT: 'deploy-preview' }), true);
});

test('the production context closes the gate', () => {
	assert.equal(resolvePreviewGate({ CONTEXT: 'production' }), false);
});

test('production wins even when the local override is set', () => {
	// The override exists for `vite dev`. If it is ever set on the production
	// site by mistake, the deployment context must still veto it.
	assert.equal(
		resolvePreviewGate({ CONTEXT: 'production', SEA_ESTATE_PREVIEW_COMPARER: 'true' }),
		false
	);
});

test('branch deploys and unknown contexts do not open the gate', () => {
	assert.equal(resolvePreviewGate({ CONTEXT: 'branch-deploy' }), false);
	assert.equal(resolvePreviewGate({ CONTEXT: 'dev' }), false);
	assert.equal(resolvePreviewGate({ CONTEXT: '' }), false);
	assert.equal(resolvePreviewGate({}), false);
	assert.equal(resolvePreviewGate(), false);
});

test('the local override needs the exact string true', () => {
	assert.equal(resolvePreviewGate({ SEA_ESTATE_PREVIEW_COMPARER: 'true' }), true);
	assert.equal(resolvePreviewGate({ SEA_ESTATE_PREVIEW_COMPARER: '1' }), false);
	assert.equal(resolvePreviewGate({ SEA_ESTATE_PREVIEW_COMPARER: 'TRUE' }), false);
	assert.equal(resolvePreviewGate({ SEA_ESTATE_PREVIEW_COMPARER: 'yes' }), false);
});

test('the context comparison tolerates case and padding from the CI env', () => {
	assert.equal(resolvePreviewGate({ CONTEXT: ' Deploy-Preview ' }), true);
	assert.equal(resolvePreviewGate({ CONTEXT: ' PRODUCTION ' }), false);
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
 * Stored preference — versioned, hostile input tolerated
 * ------------------------------------------------------------------------ */

test('the storage key is versioned', () => {
	assert.equal(PREVIEW_STORAGE_KEY, 'seaEstate.preview.v1');
});

test('a well-formed record round-trips', () => {
	const raw = serializeStoredPreview({ theme: 'atlas', copy: 'evidence' });
	assert.deepEqual(parseStoredPreview(raw), { theme: 'atlas', copy: 'evidence' });
});

test('serializing junk falls back to the production pair', () => {
	assert.deepEqual(parseStoredPreview(serializeStoredPreview({ theme: 'x', copy: 'y' })), {
		theme: 'quiet',
		copy: 'scenario'
	});
	assert.deepEqual(parseStoredPreview(serializeStoredPreview()), {
		theme: 'quiet',
		copy: 'scenario'
	});
});

test('a record from a future or missing version is discarded', () => {
	assert.deepEqual(parseStoredPreview('{"v":2,"theme":"atlas","copy":"compare"}'), {
		theme: null,
		copy: null
	});
	assert.deepEqual(parseStoredPreview('{"theme":"atlas","copy":"compare"}'), {
		theme: null,
		copy: null
	});
});

test('corrupt storage never throws', () => {
	for (const raw of ['', null, 'not json', '[]', 'null', '"quiet"', '{"v":1}']) {
		assert.doesNotThrow(() => parseStoredPreview(raw));
	}
	assert.deepEqual(parseStoredPreview('not json'), { theme: null, copy: null });
	assert.deepEqual(parseStoredPreview('{"v":1}'), { theme: null, copy: null });
});

test('an out-of-allowlist id inside a valid record is dropped', () => {
	assert.deepEqual(parseStoredPreview('{"v":1,"theme":"neon","copy":"compare"}'), {
		theme: null,
		copy: 'compare'
	});
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

test('production ignores a leftover stored preference', () => {
	const resolved = resolvePreviewVariant({
		enabled: false,
		stored: { theme: 'mediterranean', copy: 'evidence' }
	});
	assert.equal(resolved.theme, 'quiet');
	assert.equal(resolved.copy, 'scenario');
});

test('query beats storage', () => {
	const resolved = resolvePreviewVariant({
		enabled: true,
		query: { theme: 'atlas', copy: 'compare' },
		stored: { theme: 'mediterranean', copy: 'evidence' }
	});
	assert.equal(resolved.theme, 'atlas');
	assert.equal(resolved.copy, 'compare');
	assert.equal(resolved.themeSource, 'query');
	assert.equal(resolved.copySource, 'query');
});

test('storage beats defaults when the query is silent', () => {
	const resolved = resolvePreviewVariant({
		enabled: true,
		stored: { theme: 'mediterranean', copy: 'evidence' }
	});
	assert.equal(resolved.theme, 'mediterranean');
	assert.equal(resolved.copy, 'evidence');
	assert.equal(resolved.themeSource, 'storage');
	assert.equal(resolved.copySource, 'storage');
});

test('the two axes resolve independently', () => {
	// A link that pins only the theme must not reset a stored copy choice.
	const resolved = resolvePreviewVariant({
		enabled: true,
		query: { theme: 'atlas' },
		stored: { theme: 'quiet', copy: 'compare' }
	});
	assert.equal(resolved.theme, 'atlas');
	assert.equal(resolved.themeSource, 'query');
	assert.equal(resolved.copy, 'compare');
	assert.equal(resolved.copySource, 'storage');
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
