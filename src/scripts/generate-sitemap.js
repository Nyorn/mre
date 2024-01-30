import fs from 'fs';

// Ваши статические маршруты
const staticRoutes = [
  '/',
  '/contacts',
  '/about',
  '/objects',
  '/objects/studiya-izida-palas',
  '/objects/apartamenty-v-byala2',
  '/objects/apartamenty-v-byala',
  '/objects/studiya-v-byala',
  '/objects/apartamenty-sanraiz2',
  '/objects/apartamenty-byala',
  '/objects/apartamenty-obzor',
  '/objects/apartamenty-sanraiz',
  '/objects/apartamenty-fortuna-keip',
  '/objects/cascades',
  '/objects/elitoniya',
  '/objects/admiral-plaza',
  '/objects/khavana-vlas',
  '/objects/mezonet-galeriya',
  '/objects/obzor-chernomorska',
  '/objects/zolotye-peski',
  '/objects/diamant',
  '/objects/vip-style',
  '/objects/revierra-fort-1-line',
  '/objects/dolche-vita-2',
  '/objects/appartamenty-arlend',
  '/objects/appartament-koloni',
  '/objects/byala-porto'
];

let date = new Date().toISOString().split('T')[0];

function getSitemapXML(domain, routes) {
  let sitemap = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n";
  sitemap += "<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n";
  routes.forEach(route => {
    sitemap += getSitemapUrl(domain + route);
  });
  sitemap += "\n</urlset>";
  return sitemap;
}

function getSitemapUrl(location) {
  return "<url>\n" +
    `<loc>${location}</loc>\n` +
    `<lastmod>${date}</lastmod>\n` +
    "</url>";
}

const routes = staticRoutes;
const sitemap = getSitemapXML("https://sea-estate.com", routes);

// Записываем sitemap в нужную директорию
// Поменяйте путь в зависимости от вашей конфигурации
fs.writeFileSync('build/sitemap.xml', sitemap);

