import { getProperties } from '#lib/server/properties.js';

export function load() {
	return { properties: getProperties() };
}
