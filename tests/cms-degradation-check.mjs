/*
 * Does the catalog degrade correctly when the CMS misbehaves?
 *
 * Three outcomes must stay distinct, and only one of them is an error:
 *   CMS unreachable / unauthorised -> 200, degraded state inside the shell
 *   CMS answers, slug has no match -> 404, genuinely not found
 *   CMS answers with an object     -> 200, the object
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

/* --- 2. CMS answers with the object -> 200 ----------------------------- */
nextReply = { status: 200, body: { data: { objectCollection: { items: [OBJECT] } } } };
r = await get('/objects/stub-object');
check(r.status === 200, `existing slug returns 200 (got ${r.status})`);
check(r.html.includes('Тестовый объект'), 'existing slug renders the object');

/* --- 3. CMS unauthorised -> degraded, not 500 or 404 ------------------- */
nextReply = { status: 401, statusText: 'Unauthorized', body: { errors: [{ message: 'nope' }] } };
r = await get('/objects/stub-object');
check(r.status === 200, `revoked credentials give 200, not 500 (got ${r.status})`);
check(r.html.includes('Каталог временно недоступен'), 'detail shows the degraded state');
check(r.html.includes('Повторить'), 'detail offers a retry');
check(r.html.includes('Оставить заявку'), 'detail routes to the enquiry form');
check(!r.html.includes('Внутренняя ошибка сервера'), 'no framework 500 page');

/* --- 4. list route, same outage --------------------------------------- */
nextReply = { status: 401, statusText: 'Unauthorized', body: { errors: [{ message: 'nope' }] } };
r = await get('/objects');
check(r.status === 200, `list returns 200 during an outage (got ${r.status})`);
check(r.html.includes('Каталог временно недоступен'), 'list shows the degraded state');
check(r.html.includes('Повторить'), 'list offers a retry');

/* --- 5. list route, healthy CMS --------------------------------------- */
nextReply = { status: 200, body: { data: { objectCollection: { items: [OBJECT] } } } };
r = await get('/objects');
check(r.status === 200, `healthy list returns 200 (got ${r.status})`);
check(
	!r.html.includes('Каталог временно недоступен'),
	'healthy list does not show the degraded state'
);

/* --- 6. nothing leaks -------------------------------------------------- */
nextReply = { status: 401, statusText: 'Unauthorized', body: { errors: [{ message: 'nope' }] } };
r = await get('/objects');
check(!r.html.includes('stub_token'), 'no credential appears in the rendered page');
check(!r.html.includes('Authorization'), 'no auth header name appears in the rendered page');

const failed = results.filter((x) => !x).length;
console.log(`\n${results.length - failed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
