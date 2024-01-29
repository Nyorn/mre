import { sitemapHook } from "sveltekit-sitemap";

const baseUrl = 'https://sea-estate.com';
const routes = [
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
  '/objects/appartamenty-arlend'
];

export const handle = async ({ event, resolve }) => {
  const sitemap = routes.reduce((acc, route) => {
    acc[route] = {}; // Можете добавить дополнительные настройки для каждого маршрута
    return acc;
  }, {});

  const getRobots = async () => {
    // Здесь вы можете настроить, какие маршруты будут разрешены или запрещены для индексации
    return {
      userAgent: '*', // Это применяется ко всем поисковым системам
      crawlDelay: 10, // Задержка между запросами к вашему сайту
      paths: {
        '/admin': false, // Запрет индексации страниц администрирования
        '/private': false, // Запрет индексации приватных страниц
        '/': true, // Разрешение индексации главной страницы
        // Добавьте другие маршруты по необходимости
      }
    };
  };

  if (event.url.pathname.startsWith('/sitemap.xml')) {
    return sitemapHook(sitemap); // Генерация sitemap.xml
  } else if (event.url.pathname.startsWith('/robots.txt')) {
    return sitemapHook(sitemap, { getRobots }); // Генерация robots.txt
  }

  return resolve(event);
};

