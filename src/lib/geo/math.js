// Shared geo math (server + client). Terrain uv space = web-mercator crop of meta.bbox.
const Z = 10;
const T = 2 ** Z * 256;
const lon2x = (lon) => ((lon + 180) / 360) * T;
const lat2y = (lat) => {
	const r = (lat * Math.PI) / 180;
	return ((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * T;
};

export function projection(meta) {
	const [S, N, W, E] = meta.bbox;
	const X0 = lon2x(W), X1 = lon2x(E), Y0 = lat2y(N), Y1 = lat2y(S);
	return {
		uv: (lat, lon) => [(lon2x(lon) - X0) / (X1 - X0), (lat2y(lat) - Y0) / (Y1 - Y0)],
		latlon: (u, v) => {
			const x = X0 + u * (X1 - X0), y = Y0 + v * (Y1 - Y0);
			const n = Math.PI - (2 * Math.PI * y) / T;
			return [(180 / Math.PI) * Math.atan(Math.sinh(n)), (x / T) * 360 - 180];
		}
	};
}

const R = 6371000;
export function metersBetween(a, b) {
	const la = (a[0] * Math.PI) / 180, lb = (b[0] * Math.PI) / 180;
	const dl = lb - la, dn = ((b[1] - a[1]) * Math.PI) / 180;
	const h = Math.sin(dl / 2) ** 2 + Math.cos(la) * Math.cos(lb) * Math.sin(dn / 2) ** 2;
	return 2 * R * Math.asin(Math.sqrt(h));
}

/** Nearest point on the OSM coastline to [lat, lon]. Returns { meters, point:[lat,lon] }. */
export function nearestCoast(geo, lat, lon) {
	const p = projection(geo.meta);
	const kx = Math.cos((lat * Math.PI) / 180) * 111320, ky = 110574;
	let best = Infinity, bp = null;
	for (const line of geo.coast) {
		let prev = null;
		for (const [u, v] of line) {
			const ll = p.latlon(u, v);
			const cur = [(ll[1] - lon) * kx, (ll[0] - lat) * ky];
			if (prev) {
				const dx = cur[0] - prev[0], dy = cur[1] - prev[1];
				const len = dx * dx + dy * dy || 1;
				const t = Math.max(0, Math.min(1, -(prev[0] * dx + prev[1] * dy) / len));
				const qx = prev[0] + dx * t, qy = prev[1] + dy * t;
				const d = qx * qx + qy * qy;
				if (d < best) { best = d; bp = [lat + qy / ky, lon + qx / kx]; }
			}
			prev = cur;
		}
	}
	return { meters: Math.sqrt(best), point: bp };
}

export const AIRPORTS = [
	{ name: 'аэропорт Варны', at: [43.2321, 27.8251] },
	{ name: 'аэропорт Бургаса', at: [42.5696, 27.5152] }
];

/** Round a distance the honest way: 10 m steps under 1 km, then 0.1 km. */
export function formatDistance(m) {
	if (m < 1000) return `${Math.max(10, Math.round(m / 10) * 10)} м`;
	return `${(m / 1000).toFixed(m < 10000 ? 1 : 0).replace('.', ',')} км`;
}
