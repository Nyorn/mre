/*
 * Deployment-context decisions, in one place.
 *
 * Netlify sets CONTEXT per deploy and it is fixed for the life of that deploy:
 * "production", "deploy-preview", "branch-deploy", or "dev" under `netlify dev`.
 * A plain `vite dev` sets nothing at all.
 *
 * Both gates below are evaluated on the server from $env/dynamic/private and
 * handed to the client as a boolean. Nothing a visitor controls — query string,
 * cookie, localStorage, header — participates, and no PUBLIC_* variable is read.
 *
 * Pure functions: no env import here, callers pass the env object in. That is
 * what makes every branch unit-testable without spawning a build.
 */

/** Normalised deployment context, or '' when there is none. */
export function readContext(env = {}) {
	return String(env?.CONTEXT || '')
		.trim()
		.toLowerCase();
}

/** True only for a real Netlify production deploy. */
export function isProductionContext(env = {}) {
	return readContext(env) === 'production';
}

/** True only for a Netlify deploy preview. */
export function isDeployPreviewContext(env = {}) {
	return readContext(env) === 'deploy-preview';
}

/**
 * May analytics load?
 *
 * Fails closed: production is the only context that gets a yes. Deploy previews,
 * branch deploys, `netlify dev`, plain `vite dev` and any unrecognised context
 * all get no, so review traffic never reaches the production GA property and a
 * misconfigured or future context cannot start sending by default.
 *
 * This does not disable production analytics — a production deploy still
 * returns true and loads GTM and gtag exactly as before.
 *
 * @param {Record<string, string | undefined>} env
 */
export function resolveAnalyticsGate(env = {}) {
	return isProductionContext(env);
}
