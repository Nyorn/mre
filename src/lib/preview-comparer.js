/*
 * Preview-only partner comparer — gate and variant resolver.
 *
 * Two separate decisions live here, and keeping them separate is the point:
 *
 *   1. resolvePreviewGate(env) — MAY the comparer exist at all?
 *      Answered on the server from the Netlify deployment context. Nothing a
 *      visitor can send (query string, cookie, localStorage, header) reaches
 *      this function, and no PUBLIC_* variable is consulted, so the switcher
 *      cannot be turned on from the outside on the production site.
 *
 *   2. resolvePreviewVariant({ enabled, query, stored }) — WHICH bundle shows?
 *      Only ever consulted when (1) already said yes. When `enabled` is false
 *      this returns the production defaults and ignores both inputs, which is
 *      the property the unit tests pin down.
 *
 * Everything here is pure: no window, no document, no fetch. The callers own
 * the side effects.
 */

// Relative, not $lib: this module is imported directly by node:test, which does
// not resolve Vite aliases.
import { isProductionContext, isDeployPreviewContext } from './deployment-gate.js';

/** Bumped only when the stored shape changes; an unknown version is discarded. */
export const PREVIEW_STORAGE_KEY = 'seaEstate.preview.v1';

export const QUERY_THEME = 'preview_theme';
export const QUERY_COPY = 'preview_copy';

/** Full-token bundles. Never mixed: one id selects a complete palette. */
export const THEME_IDS = ['quiet', 'mediterranean', 'atlas'];

/** Hero text bundles. Also never mixed: one id selects H1 + lead together. */
export const COPY_IDS = ['scenario', 'evidence', 'compare'];

export const DEFAULT_THEME = 'quiet';
export const DEFAULT_COPY = 'scenario';

export const THEME_LABELS = {
	quiet: 'Quiet Coast',
	mediterranean: 'Mediterranean Modern',
	atlas: 'Coastal Atlas'
};

export const COPY_LABELS = {
	scenario: 'Сценарий владения',
	evidence: 'Проверяемые данные',
	compare: 'Сравнение объектов'
};

/**
 * Is the comparer allowed to render?
 *
 * Three ordered rules, and the order is the security property:
 *
 *   1. production  → never. Hard veto, evaluated first, so a misconfigured
 *      override variable cannot switch the switcher on for the live site.
 *   2. deploy-preview → yes. This is the intended surface.
 *   3. anything else → only under a genuine `vite dev`, and only with the
 *      server-only override set.
 *
 * Rule 3 is why `dev` is a required input rather than something inferred from
 * env. `dev` comes from $app/environment, which the bundler resolves to a
 * constant: true for `vite dev`, false in every built artifact. So the override
 * is dead code in any deployed context — branch deploys, `netlify dev`, a
 * self-hosted build, or a context name that does not exist yet. Previously it
 * was reachable in all of those, which is the hole this closes.
 *
 * @param {Record<string, string | undefined>} env
 * @param {{ dev?: boolean }} runtime  `dev` from $app/environment
 * @returns {boolean}
 */
export function resolvePreviewGate(env = {}, { dev = false } = {}) {
	if (isProductionContext(env)) return false;
	if (isDeployPreviewContext(env)) return true;

	// Never reachable from a build: `dev` is compiled to false in every artifact.
	if (dev !== true) return false;

	return String(env.SEA_ESTATE_PREVIEW_COMPARER || '').trim() === 'true';
}

/** @returns {string | null} the id when it is on the allowlist, else null. */
export function allowTheme(value) {
	return THEME_IDS.includes(value) ? value : null;
}

/** @returns {string | null} the id when it is on the allowlist, else null. */
export function allowCopy(value) {
	return COPY_IDS.includes(value) ? value : null;
}

/**
 * Read the two allowlisted parameters out of a query string.
 * Anything unrecognised — wrong name, wrong value, repeated key — yields null
 * for that axis rather than an error, so a mangled link degrades to defaults.
 *
 * @param {string | URLSearchParams} search
 */
export function parseQueryPreview(search) {
	const params =
		search instanceof URLSearchParams ? search : new URLSearchParams(String(search || ''));

	return {
		theme: allowTheme(params.get(QUERY_THEME)),
		copy: allowCopy(params.get(QUERY_COPY))
	};
}

/**
 * Parse the versioned localStorage record. Corrupt JSON, a foreign shape or an
 * out-of-allowlist id all degrade to null rather than throwing, because this
 * runs on a visitor's machine where the value may be anything.
 *
 * @param {string | null} raw
 */
export function parseStoredPreview(raw) {
	if (!raw) return { theme: null, copy: null };

	let parsed;
	try {
		parsed = JSON.parse(raw);
	} catch {
		return { theme: null, copy: null };
	}

	if (!parsed || typeof parsed !== 'object') return { theme: null, copy: null };
	if (parsed.v !== 1) return { theme: null, copy: null };

	return {
		theme: allowTheme(parsed.theme),
		copy: allowCopy(parsed.copy)
	};
}

/** Serialize for localStorage. Only two ids are ever written — no PII. */
export function serializeStoredPreview({ theme, copy } = {}) {
	return JSON.stringify({
		v: 1,
		theme: allowTheme(theme) || DEFAULT_THEME,
		copy: allowCopy(copy) || DEFAULT_COPY
	});
}

/**
 * Resolve the active bundle.
 *
 * Priority when enabled: query allowlist → stored preference → defaults.
 * The two axes resolve independently, so `?preview_theme=atlas` alone keeps the
 * stored (or default) copy rather than silently resetting it.
 *
 * When disabled, both inputs are ignored entirely. That is the production
 * guarantee: a crafted URL or a leftover localStorage record from a preview
 * session cannot change what the live site renders.
 *
 * @param {{ enabled?: boolean, query?: {theme?: string|null, copy?: string|null}, stored?: {theme?: string|null, copy?: string|null} }} input
 */
export function resolvePreviewVariant({ enabled = false, query = {}, stored = {} } = {}) {
	if (!enabled) {
		return {
			theme: DEFAULT_THEME,
			copy: DEFAULT_COPY,
			themeSource: 'default',
			copySource: 'default'
		};
	}

	const queryTheme = allowTheme(query.theme);
	const queryCopy = allowCopy(query.copy);
	const storedTheme = allowTheme(stored.theme);
	const storedCopy = allowCopy(stored.copy);

	return {
		theme: queryTheme || storedTheme || DEFAULT_THEME,
		copy: queryCopy || storedCopy || DEFAULT_COPY,
		themeSource: queryTheme ? 'query' : storedTheme ? 'storage' : 'default',
		copySource: queryCopy ? 'query' : storedCopy ? 'storage' : 'default'
	};
}

/**
 * Canonical query string for a variant: always both keys, always in this order,
 * so two reviewers comparing the same combination get byte-identical links.
 */
export function buildPreviewSearch({ theme, copy } = {}) {
	const params = new URLSearchParams();
	params.set(QUERY_THEME, allowTheme(theme) || DEFAULT_THEME);
	params.set(QUERY_COPY, allowCopy(copy) || DEFAULT_COPY);
	return `?${params.toString()}`;
}

/**
 * Shareable link for the current combination.
 * Any pre-existing query parameters are dropped on purpose — a preview link
 * should carry the two variant ids and nothing else (no utm, no session junk).
 */
export function buildShareUrl(origin, pathname, variant) {
	return `${origin || ''}${pathname || '/'}${buildPreviewSearch(variant)}`;
}
