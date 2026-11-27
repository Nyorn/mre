import { error } from '@sveltejs/kit';
import { getProperties } from '#lib/server/properties.js';

export function entries() {
	return getProperties().map((p) => ({ slug: p.slug }));
}

export function load({ params }) {
	const property = getProperties().find((p) => p.slug === params.slug);
	if (!property) error(404, 'Объект не найден');
	return { property };
}
