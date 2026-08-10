/*
 * Root layout load: decides on the server whether analytics may load.
 *
 * GTM, gtag and the noscript pixel were unconditional, so every deploy preview
 * and every local dev session reported into the production GA property — and
 * with the preview comparer that includes URLs carrying ?preview_theme=.
 *
 * The context comes from BUILD_CONTEXT, a value inlined at build time, NOT from
 * the runtime env. Netlify omits CONTEXT from the SSR function's process.env,
 * so the previous `$env/dynamic/private` version evaluated
 * `'' === 'production'` on every deploy — meaning a production deploy would
 * have silently shipped with analytics disabled. That is the bug this fixes.
 *
 * Still fails closed: only a real Netlify production build gets true.
 */
import { BUILD_CONTEXT } from '$lib/build-context.js';
import { resolveAnalyticsGate } from '$lib/deployment-gate.js';

export function load() {
	return { analyticsEnabled: resolveAnalyticsGate(BUILD_CONTEXT) };
}
