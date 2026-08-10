/*
 * Home load: decides whether the preview comparer may exist, and resolves the
 * variant server-side so a shared ?preview_theme= link is already correct on the
 * first paint (no flash, no hydration mismatch).
 *
 * $env/dynamic/private, not static: the same choice /api/lead makes. It is
 * server-only, never bundled into client code, and a missing variable yields
 * undefined instead of breaking the build the way $env/static/private would.
 *
 * When the gate is closed this returns the production defaults and does not even
 * look at the query string, so a crafted URL changes nothing on the live site.
 */
import { env } from '$env/dynamic/private';
import { resolvePreviewGate, resolvePreviewVariant, parseQueryPreview } from '$lib/preview-comparer.js';

export function load({ url }) {
	const previewComparer = resolvePreviewGate(env);

	const variant = resolvePreviewVariant({
		enabled: previewComparer,
		query: previewComparer ? parseQueryPreview(url.searchParams) : {}
	});

	return { previewComparer, variant };
}
