/*
 * Home load.
 *
 * Three jobs, all decided on the server:
 *
 *  1. May the preview comparer exist? Deployment-context gate, plus `dev` from
 *     $app/environment so the local override is confined to a real `vite dev`
 *     and is dead code in every built artifact.
 *  2. Which variant is active? The query is parsed here, so a shared
 *     ?preview_theme= link is already correct on the first paint — no flash and
 *     no hydration mismatch.
 *  3. Which hero copy do we send? The resolved bundle travels in the SSR
 *     payload. That is what keeps home-copy.js — including the two non-default
 *     bundles — out of the client bundle entirely: this module is server-only,
 *     so its imports never enter the browser graph.
 *
 * When the gate is closed this returns the production defaults, ships exactly
 * one copy bundle, and does not look at the query string at all.
 */
import { env } from '$env/dynamic/private';
import { dev } from '$app/environment';
import {
	resolvePreviewGate,
	resolvePreviewVariant,
	parseQueryPreview,
	DEFAULT_COPY
} from '$lib/preview-comparer.js';
import { HERO_COPY, HERO_CTA, HERO_ENQUIRY_SCENARIO } from '$lib/home-copy.js';

export function load({ url }) {
	const previewComparer = resolvePreviewGate(env, { dev });

	const variant = resolvePreviewVariant({
		enabled: previewComparer,
		query: previewComparer ? parseQueryPreview(url.searchParams) : {}
	});

	return {
		previewComparer,
		variant,
		heroCta: HERO_CTA,
		heroScenario: HERO_ENQUIRY_SCENARIO,
		heroCopy: HERO_COPY[variant.copy] || HERO_COPY[DEFAULT_COPY],
		/*
		 * Only a preview needs the other bundles, and only so the switcher can
		 * change copy without a round trip. Production ships one bundle.
		 */
		heroCopyTable: previewComparer ? HERO_COPY : null
	};
}
