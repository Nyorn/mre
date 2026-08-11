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
 *   2. resolvePreviewVariant({ enabled, query }) — WHICH bundle shows?
 *      Only ever consulted when (1) already said yes. When `enabled` is false
 *      this returns the production defaults and ignores the query, which is the
 *      property the unit tests pin down.
 *
 *      Resolution reads the QUERY ONLY. Stored state is deliberately not an
 *      input: a bare URL always renders quiet/scenario. See the storage note
 *      on PREVIEW_STORAGE_KEY below.
 *
 * Everything here is pure: no window, no document, no fetch. The callers own
 * the side effects.
 */

// Relative, not $lib: this module is imported directly by node:test, which does
// not resolve Vite aliases.
import { isProductionContext, isDeployPreviewContext } from './deployment-gate.js';

/*
 * Storage is WRITE-ONLY.
 *
 * The comparer records the last choice so a reviewer can see what they picked,
 * but nothing ever reads it back into a render. Restoring it after hydration
 * was the one remaining source of unexpected layout shift on initial load: the
 * server cannot see localStorage, so the first paint was always the default and
 * the restored variant arrived a frame later.
 *
 * The shareable query URL is the partner-facing source of truth instead. That
 * closes initial CLS without needing a server-readable cookie.
 */
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
 * `context` is a build-time constant (BUILD_CONTEXT), not a runtime env lookup.
 * Netlify omits CONTEXT from the SSR function's process.env, so the previous
 * dynamic-env version resolved against '' on a real deploy preview and rule 2
 * never fired — the comparer simply never appeared. Verified live on PR #3.
 *
 * Rule 3 is why `dev` is a separate input. It comes from $app/environment,
 * which the bundler resolves to a constant: true for `vite dev`, false in every
 * built artifact. So the override is dead code in any deployed context —
 * branch deploys, `netlify dev`, a self-hosted build, or a context name that
 * does not exist yet.
 *
 * `override` is read by the caller from `$env/dynamic/private`. Runtime env is
 * fine there precisely because it is only ever consulted under `vite dev`,
 * where process.env is fully populated.
 *
 * @param {string} context  deployment context, from BUILD_CONTEXT
 * @param {{ dev?: boolean, override?: string }} runtime
 * @returns {boolean}
 */
export function resolvePreviewGate(context, { dev = false, override = '' } = {}) {
	if (isProductionContext(context)) return false;
	if (isDeployPreviewContext(context)) return true;

	// Never reachable from a build: `dev` is compiled to false in every artifact.
	if (dev !== true) return false;

	return String(override ?? '').trim() === 'true';
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
 * Serialize for localStorage. Only two ids are ever written — no PII, and
 * nothing reads this back during a render.
 */
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
 * Priority when enabled: query allowlist → defaults. That is the whole list.
 * A bare URL renders quiet/scenario even if this browser previously chose
 * something else, which is what makes the server render and the first client
 * render identical and removes initial layout shift by construction.
 *
 * The two axes resolve independently, so `?preview_theme=atlas` alone leaves
 * the copy at its default rather than being rejected as incomplete.
 *
 * When disabled, the query is ignored entirely. That is the production
 * guarantee: a crafted URL cannot change what the live site renders.
 *
 * @param {{ enabled?: boolean, query?: {theme?: string|null, copy?: string|null} }} input
 */
export function resolvePreviewVariant({ enabled = false, query = {} } = {}) {
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

	return {
		theme: queryTheme || DEFAULT_THEME,
		copy: queryCopy || DEFAULT_COPY,
		themeSource: queryTheme ? 'query' : 'default',
		copySource: queryCopy ? 'query' : 'default'
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
