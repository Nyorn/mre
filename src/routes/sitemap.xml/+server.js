import { getProperties } from '#lib/server/properties.js';

export const prerender = true;

export function GET() {
	const urls = ['/', '/kak-kupit', '/kontakty', ...getProperties().map((p) => `/objects/${p.slug}`)];
	const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>https://sea-estate.com${u === '/' ? '' : u}</loc></url>`).join('n')}
</urlset>`;
	return new Response(body, { headers: { 'Content-Type': 'application/xml' } });
}
