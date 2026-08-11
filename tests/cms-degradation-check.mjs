/*
 * Does the catalog degrade correctly when the CMS misbehaves?
 *
 * Three outcomes must stay distinct, and only one of them is an error:
 *   CMS unreachable / unauthorised -> 200, degraded state inside the shell
 *   CMS answers, slug has no match -> 404, genuinely not found
 *   CMS answers with an object     -> 200, the object
 *
 * And the indexing contract that rides on top of the first one: the degraded
 * page keeps HTTP 200 because the visitor gets a usable page, so `noindex` is
 * what stops a crawler indexing an empty catalog in place of the real one. It
 * must appear ONLY there — a healthy catalog, a healthy detail page and a
 * genuine 404 must stay indexable, or a CMS blip costs real URLs.
 *
 * They used to collapse into a single HTTP 500, which dropped the visitor into
 * the framework error shell with no header, no retry and no way to reach us —
 * and told search engines a real object URL was broken.
 *
 * A dev server cannot prove this: without credentials every path looks like an
 * outage. So this boots the BUILT server the way adapter-netlify does and stubs
 * global fetch for graphql.contentful.com only, which lets each branch be
 * driven deterministically. No credential is used and no real request is made.
 *
 * Not part of `npm test` — it needs a build present. Run:
 *   npm run build && node tests/cms-degradation-check.mjs
 */

import { existsSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const root = process.cwd();
const results = [];
const check = (ok, message) => {
	results.push(ok);
	console.log(`  ${ok ? 'pass' : 'FAIL'}  ${message}`);
};

const serverPath = path.join(root, '.netlify', 'server', 'index.js');
const manifestPath = path.join(root, '.netlify', 'server', 'manifest.js');
if (!existsSync(serverPath)) {
	console.error('No build found. Run `npm run build` first.');
	process.exit(2);
}

/* --- stub Contentful, leave every other fetch alone --------------------- */
const realFetch = globalThis.fetch;
let nextReply = null;

globalThis.fetch = async (input, init) => {
	const url = typeof input === 'string' ? input : input?.url || '';
	if (!url.includes('graphql.contentful.com')) return realFetch(input, init);

	const reply = nextReply;
	if (!reply) throw new Error('no stubbed Contentful reply configured');
	return new Response(JSON.stringify(reply.body), {
		status: reply.status,
		statusText: reply.statusText || '',
		headers: { 'content-type': 'application/json' }
	});
};

const { Server } = await import(pathToFileURL(serverPath).href);
const { manifest } = await import(pathToFileURL(manifestPath).href);

const server = new Server(manifest);
await server.init({
	// Present, so the client attempts a request and hits the stub rather than
	// short-circuiting on "not configured".
	env: { CONTENTFUL_SPACE_ID: 'stub_space', CONTENTFUL_ACCESS_TOKEN: 'stub_token' }
});

async function get(pathname) {
	const response = await server.respond(new Request(`http://localhost${pathname}`), {
		getClientAddress: () => '127.0.0.1'
	});
	return { status: response.status, html: await response.text() };
}

const NOINDEX = 'name="robots" content="noindex"';

const OBJECT = {
	name: 'Тестовый объект',
	slug: 'stub-object',
	key: 'stub-1',
	city: 'Бяла',
	price: null,
	description: null,
	photo: null,
	galleryCollection: { items: [] }
};

/* --- 1. CMS answers, slug missing -> genuine 404 ------------------------ */
nextReply = { status: 200, body: { data: { objectCollection: { items: [] } } } };
let r = await get('/objects/definitely-not-a-real-slug');
check(r.status === 404, `missing slug returns 404 (got ${r.status})`);
check(
	!r.html.includes('Каталог временно недоступен'),
	'missing slug does NOT claim the catalog is down'
);
check(!r.html.includes(NOINDEX), 'genuine 404 is NOT marked noindex');

/* --- 2. CMS answers with the object -> 200 ----------------------------- */
nextReply = { status: 200, body: { data: { objectCollection: { items: [OBJECT] } } } };
r = await get('/objects/stub-object');
check(r.status === 200, `existing slug returns 200 (got ${r.status})`);
check(r.html.includes('Тестовый объект'), 'existing slug renders the object');
check(!r.html.includes(NOINDEX), 'healthy detail page is NOT marked noindex');

/* --- 3. CMS unauthorised -> degraded, not 500 or 404 ------------------- */
nextReply = { status: 401, statusText: 'Unauthorized', body: { errors: [{ message: 'nope' }] } };
r = await get('/objects/stub-object');
check(r.status === 200, `revoked credentials give 200, not 500 (got ${r.status})`);
check(r.html.includes('Каталог временно недоступен'), 'detail shows the degraded state');
check(r.html.includes('Повторить'), 'detail offers a retry');
check(r.html.includes('Оставить заявку'), 'detail routes to the enquiry form');
check(!r.html.includes('Внутренняя ошибка сервера'), 'no framework 500 page');
check(r.html.includes(NOINDEX), 'degraded detail page IS marked noindex');

/* --- 4. list route, same outage --------------------------------------- */
nextReply = { status: 401, statusText: 'Unauthorized', body: { errors: [{ message: 'nope' }] } };
r = await get('/objects');
check(r.status === 200, `list returns 200 during an outage (got ${r.status})`);
check(r.html.includes('Каталог временно недоступен'), 'list shows the degraded state');
check(r.html.includes('Повторить'), 'list offers a retry');
check(r.html.includes(NOINDEX), 'degraded list IS marked noindex');

/* --- 5. list route, healthy CMS --------------------------------------- */
nextReply = { status: 200, body: { data: { objectCollection: { items: [OBJECT] } } } };
r = await get('/objects');
check(r.status === 200, `healthy list returns 200 (got ${r.status})`);
check(
	!r.html.includes('Каталог временно недоступен'),
	'healthy list does not show the degraded state'
);
check(!r.html.includes(NOINDEX), 'healthy list is NOT marked noindex');

/* --- 5b. the healthy catalog tells the truth about the object ---------- */
check(r.html.includes('Тестовый объект'), 'healthy list renders the object name');
check(r.html.includes('Смотреть объект'), 'each card offers one detail link');
check(r.html.includes('Цена и наличие уточняются'), 'the availability caveat is visible');
// OBJECT has no price and no area/bedrooms/floor, so nothing may be invented.
check(r.html.includes('Цена по запросу'), 'a missing price renders as "Цена по запросу"');
check(!/0\s*€/.test(r.html), 'no 0 € anywhere');
check(!/undefined|NaN/.test(r.html), 'no undefined/NaN leaked into the markup');
check(!/Площадь:\s*<\/dt>|Спальни:\s*<\/dt>/.test(r.html), 'no empty fact labels');
check(r.html.includes('qc-skip-link'), 'catalog renders the Quiet Coast skip link');
check(!r.html.includes('© 2024 Sea Real Estate'), 'legacy footer is gone from the catalog');
check(!/href="#"/.test(r.html), 'no # placeholder links on the catalog');

/* --- 5c. healthy CMS, zero published objects -> its own honest state ---- */
nextReply = { status: 200, body: { data: { objectCollection: { items: [] } } } };
r = await get('/objects');
check(r.status === 200, `empty catalog returns 200 (got ${r.status})`);
check(r.html.includes('Пока нет опубликованных'), 'empty catalog states it is empty');
check(
	!r.html.includes('Каталог временно недоступен'),
	'an empty catalog is NOT reported as a CMS outage'
);
check(!r.html.includes(NOINDEX), 'an empty but healthy catalog stays indexable');
check(r.html.includes('Оставить заявку'), 'empty catalog offers the enquiry route');

/* --- 6. nothing leaks -------------------------------------------------- */
nextReply = { status: 401, statusText: 'Unauthorized', body: { errors: [{ message: 'nope' }] } };
r = await get('/objects');
check(!r.html.includes('stub_token'), 'no credential appears in the rendered page');
check(!r.html.includes('Authorization'), 'no auth header name appears in the rendered page');

const failed = results.filter((x) => !x).length;
console.log(`\n${results.length - failed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
