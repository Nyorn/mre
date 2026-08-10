/*
 * Root layout load: decides on the server whether analytics may load.
 *
 * Previously GTM, gtag and the noscript pixel were unconditional, so every
 * deploy preview and every local dev session reported into the production GA
 * property — and with the preview comparer that now includes URLs carrying
 * ?preview_theme=, i.e. internal review traffic polluting production data.
 *
 * The decision is made here, from a server-only env var, and travels to the
 * client as a boolean. It fails closed: only a real Netlify production deploy
 * gets true.
 */
import { env } from '$env/dynamic/private';
import { resolveAnalyticsGate } from '$lib/deployment-gate.js';

export function load() {
	return { analyticsEnabled: resolveAnalyticsGate(env) };
}
