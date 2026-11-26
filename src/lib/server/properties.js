// Build-time enrichment: distances are computed, never typed by hand.
import geo from '../../../static/geo/geo.json';
import { properties } from '#lib/data/properties.js';
import { nearestCoast, metersBetween, AIRPORTS } from '#lib/geo/math.js';

let cache;
export function getProperties() {
	if (cache) return cache;
	cache = properties.map((p) => {
		const coast = nearestCoast(geo, p.lat, p.lon);
		const airport = AIRPORTS.map((a) => ({ name: a.name, meters: metersBetween([p.lat, p.lon], a.at) })).sort(
			(a, b) => a.meters - b.meters
		)[0];
		return { ...p, sea: { meters: coast.meters, point: coast.point }, airport };
	});
	return cache;
}
