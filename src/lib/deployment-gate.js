/*
 * Deployment-context decisions, in one place.
 *
 * Netlify sets CONTEXT per deploy — "production", "deploy-preview",
 * "branch-deploy", or "dev" under `netlify dev` — and it is fixed for the life
 * of that deploy.
 *
 * WHY THESE TAKE A STRING, NOT AN ENV OBJECT.
 *
 * They used to read `env.CONTEXT` from `$env/dynamic/private`, i.e. the SSR
 * function's runtime process.env. Netlify does not put CONTEXT there: it is a
 * build-time variable. Verified against the live PR #3 deploy preview, where
 * the comparer never rendered because the gate saw an empty context — and by
 * the same mechanism a production deploy would have evaluated
 * `'' === 'production'` as false and shipped with GA/GTM disabled.
 *
 * The context is therefore captured at build time (see build-context.js and the
 * Vite `define` in vite.config.js) and passed in. These functions stay pure and
 * take an explicit value, so every branch is unit-testable without a build and
 * without pretending an env object exists.
 *
 * Contentful credentials deliberately do NOT follow this path: they stay on
 * `$env/dynamic/private` so no token is ever inlined into a build artifact.
 * A context name is not a secret; a Delivery token is.
 */

/** Normalised deployment context, or '' when there is none. */
export function readContext(context) {
	return String(context ?? '')
		.trim()
		.toLowerCase();
}

/** True only for a real Netlify production deploy. */
export function isProductionContext(context) {
	return readContext(context) === 'production';
}

/** True only for a Netlify deploy preview. */
export function isDeployPreviewContext(context) {
	return readContext(context) === 'deploy-preview';
}

/**
 * May analytics load?
 *
 * Fails closed: production is the only context that gets a yes. Deploy previews,
 * branch deploys, `netlify dev`, plain `vite dev` and any unrecognised or
 * missing context all get no, so review traffic never reaches the production GA
 * property and a future context name cannot start reporting by default.
 *
 * A production deploy still loads GTM and gtag exactly as before — that is the
 * behaviour the runtime bug was silently taking away.
 *
 * @param {string} context  deployment context, from BUILD_CONTEXT
 */
export function resolveAnalyticsGate(context) {
	return isProductionContext(context);
}
