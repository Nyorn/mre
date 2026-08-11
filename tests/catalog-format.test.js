import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
	hasPrice,
	formatPrice,
	buildFacts,
	buildKicker,
	imageAlt,
	hasPhoto,
	withPreviewQuery,
	describeCount,
	sortObjects,
	SORT_KEYS,
	PRESERVED_QUERY_KEYS
} from '../src/lib/catalog-format.js';

/*
 * These rules are the difference between a catalog and a catalog that lies.
 * The legacy card interpolated CMS fields straight into markup, so a missing
 * price rendered "Цена: €", a zero rendered "Цена:0 €", and an absent area
 * rendered "Площадь: undefined м²". Every case below is one of those.
 */

/* ------------------------------------------------------------------ price - */

/*
 * Thousands are separated by U+202F, a NARROW NO-BREAK space. Written as an
 * escape here on purpose: pasted as a literal it is indistinguishable from a
 * normal space in review, and a plain space would also let a price wrap across
 * lines mid-number.
 */
const NNBSP = '\u202F';

test('a real price renders with grouped digits and €', () => {
	assert.deepEqual(formatPrice(85000), { known: true, text: `85${NNBSP}000 €` });
	assert.deepEqual(formatPrice(1250000), { known: true, text: `1${NNBSP}250${NNBSP}000 €` });
	assert.deepEqual(formatPrice(999), { known: true, text: '999 €' });
});

test('the thousands separator is non-breaking, so a price cannot wrap mid-number', () => {
	const text = formatPrice(85000).text;
	// Scoped to the separator: the space before € is a plain one, and should be.
	assert.equal(text.charCodeAt(2), 0x202f, 'thousands separator must be U+202F');
	assert.equal(/\d \d/.test(text), false, 'a plain space between digits would allow a break');
	assert.match(text, / €$/, 'the currency stays separated by a normal space');
});

test('numeric strings from the CMS are accepted', () => {
	assert.deepEqual(formatPrice('85000'), { known: true, text: `85${NNBSP}000 €` });
});

test('an unknown price never renders a number or a bare €', () => {
	for (const value of [null, undefined, '', 'по запросу', NaN, {}, []]) {
		const result = formatPrice(value);
		assert.equal(result.known, false, `${JSON.stringify(value)} must not count as a price`);
		assert.equal(result.text, 'Цена по запросу');
		assert.equal(/\d/.test(result.text), false, 'no digits may leak into an unknown price');
		assert.equal(result.text.includes('€'), false, 'no € on an unknown price');
	}
});

test('zero and negative prices are not prices', () => {
	// The specific bug: `Цена:{object.price} €` rendered "0 €" as a real offer.
	assert.equal(hasPrice(0), false);
	assert.equal(hasPrice(-1), false);
	assert.equal(formatPrice(0).text, 'Цена по запросу');
	assert.equal(formatPrice(-5000).text, 'Цена по запросу');
});

test('a decimal price is rounded rather than shown with cents', () => {
	assert.equal(formatPrice(85000.4).text, `85${NNBSP}000 €`);
});

/* ------------------------------------------------------------------ facts - */

test('only known facts appear', () => {
	const facts = buildFacts({ area: 62, bedrooms: 2, floor: 3, maxFloor: 7 });
	assert.deepEqual(
		facts.map((f) => `${f.label}: ${f.value}`),
		['Площадь: 62 м²', 'Спальни: 2', 'Этаж: 3 из 7']
	);
});

test('absent facts are omitted entirely, not rendered empty', () => {
	assert.deepEqual(buildFacts({}), []);
	assert.deepEqual(buildFacts({ area: null, bedrooms: undefined, floor: '' }), []);
});

test('no fact ever renders undefined, null or zero', () => {
	const facts = buildFacts({ area: 0, bedrooms: 0, floor: 0, maxFloor: 0 });
	assert.deepEqual(facts, [], 'zeroes are not facts worth printing');

	const rendered = buildFacts({ area: undefined, bedrooms: null, floor: NaN })
		.map((f) => f.value)
		.join(' ');
	assert.equal(/undefined|null|NaN/.test(rendered), false);
});

test('a floor without a building height still renders alone', () => {
	const facts = buildFacts({ floor: 3 });
	assert.deepEqual(facts.map((f) => f.value), ['3']);
	assert.equal(facts[0].value.includes('из'), false, 'must not invent a building height');
});

test('a non-integer floor or bedroom count is rejected', () => {
	assert.deepEqual(buildFacts({ bedrooms: 2.5, floor: 1.5 }), []);
});

test('area accepts a decimal, bedrooms does not', () => {
	assert.deepEqual(buildFacts({ area: 62.5 }).map((f) => f.value), ['62.5 м²']);
});

/* ----------------------------------------------------------------- kicker - */

test('the kicker joins only the parts that exist', () => {
	assert.deepEqual(buildKicker({ type: 'Апартаменты', city: 'Бяла' }), ['Апартаменты', 'Бяла']);
	assert.deepEqual(buildKicker({ city: 'Бяла' }), ['Бяла']);
	assert.deepEqual(buildKicker({ type: '  ', city: null }), []);
	assert.deepEqual(buildKicker({}), []);
});

/* ------------------------------------------------------------------ media - */

test('a CMS description becomes the alt text', () => {
	assert.equal(imageAlt({ photo: { url: 'x', description: 'Вид на море с балкона' } }), 'Вид на море с балкона');
});

test('without a description the image is decorative, not a duplicated name', () => {
	/*
	 * The heading beside it already announces the name; a generic
	 * "Фото объекта: <name>" would make a screen reader say it twice.
	 */
	assert.equal(imageAlt({ photo: { url: 'x' }, name: 'Апартаменты в Бяле' }), '');
	assert.equal(imageAlt({ photo: { url: 'x', description: '   ' } }), '');
	assert.equal(imageAlt({}), '');
});

test('a missing or empty photo url means no photo', () => {
	assert.equal(hasPhoto({ photo: { url: 'https://x/y.avif' } }), true);
	assert.equal(hasPhoto({ photo: { url: '   ' } }), false);
	assert.equal(hasPhoto({ photo: {} }), false);
	assert.equal(hasPhoto({}), false);
	assert.equal(hasPhoto({ photo: null }), false);
});

/* ------------------------------------------------------------------ links - */

test('only the two preview keys travel on internal links', () => {
	assert.deepEqual(PRESERVED_QUERY_KEYS, ['preview_theme', 'preview_copy']);
});

test('the preview variant survives navigation into a detail page', () => {
	assert.equal(
		withPreviewQuery('/objects/abc', '?preview_theme=atlas&preview_copy=compare'),
		'/objects/abc?preview_theme=atlas&preview_copy=compare'
	);
});

test('nothing else is carried forward', () => {
	// No utm, no filter state, nothing a visitor typed.
	assert.equal(
		withPreviewQuery('/objects/abc', '?utm_source=partner&city=Бяла&preview_theme=quiet'),
		'/objects/abc?preview_theme=quiet'
	);
});

test('a bare URL produces a bare link', () => {
	assert.equal(withPreviewQuery('/objects/abc', ''), '/objects/abc');
	assert.equal(withPreviewQuery('/objects/abc', undefined), '/objects/abc');
	assert.equal(withPreviewQuery('/objects/abc', '?utm_source=x'), '/objects/abc');
});

test('an existing query on the href is respected', () => {
	assert.equal(
		withPreviewQuery('/objects?page=2', '?preview_theme=atlas'),
		'/objects?page=2&preview_theme=atlas'
	);
});

test('a URLSearchParams instance works too', () => {
	assert.equal(
		withPreviewQuery('/objects/abc', new URLSearchParams({ preview_copy: 'evidence' })),
		'/objects/abc?preview_copy=evidence'
	);
});

/* ------------------------------------------------------------------ count - */

test('an empty catalog and empty filter results are different states', () => {
	assert.equal(describeCount(0, 0).state, 'empty-catalog');
	assert.equal(describeCount(0, 24).state, 'empty-filtered');
});

test('a filtered count says how many of how many', () => {
	assert.deepEqual(describeCount(6, 24), { state: 'filtered', text: 'Показано 6 из 24' });
});

test('an unfiltered count states the total once', () => {
	assert.deepEqual(describeCount(24, 24), { state: 'all', text: 'Объектов: 24' });
});

/* ------------------------------------------------------------------- sort - */

const ITEMS = [
	{ slug: 'a', price: 250000, area: 140, floor: 1 },
	{ slug: 'b', price: 85000, area: 62, floor: 3 },
	{ slug: 'c', price: 0, area: null, floor: null }, // nothing sortable
	{ slug: 'd', price: 120000, area: 62, floor: 2 }
];
const order = (opts) => sortObjects(ITEMS, opts).map((x) => x.slug);

test('the three sortable keys are the ones the UI offers', () => {
	assert.deepEqual(SORT_KEYS, ['price', 'area', 'floor']);
});

test('no sort selected keeps the CMS order exactly', () => {
	// "Без сортировки" must be deterministic, not "whatever a 0-comparator does".
	assert.deepEqual(order({}), ['a', 'b', 'c', 'd']);
	assert.deepEqual(order(undefined), ['a', 'b', 'c', 'd']);
	assert.deepEqual(order({ price: 'sideways' }), ['a', 'b', 'c', 'd']);
});

test('sorting does not mutate the input', () => {
	const before = ITEMS.map((x) => x.slug);
	sortObjects(ITEMS, { price: 'asc' });
	assert.deepEqual(ITEMS.map((x) => x.slug), before);
});

test('cheapest first puts real prices in order', () => {
	assert.deepEqual(order({ price: 'asc' }).slice(0, 3), ['b', 'd', 'a']);
});

test('an unknown price is never the cheapest', () => {
	/*
	 * The specific defect: `a.price - b.price` treated a CMS zero as 0 €, so an
	 * unpublished price sorted to the very top of "cheapest first".
	 */
	assert.equal(order({ price: 'asc' })[0], 'b');
	assert.equal(order({ price: 'asc' }).at(-1), 'c');
});

test('an unknown price is never the most expensive either', () => {
	assert.equal(order({ price: 'desc' })[0], 'a');
	assert.equal(order({ price: 'desc' }).at(-1), 'c', 'unknown sorts last in BOTH directions');
});

test('unknown area and floor also sort last in both directions', () => {
	assert.equal(order({ area: 'asc' }).at(-1), 'c');
	assert.equal(order({ area: 'desc' }).at(-1), 'c');
	assert.equal(order({ floor: 'asc' }).at(-1), 'c');
	assert.equal(order({ floor: 'desc' }).at(-1), 'c');
});

test('a tie falls through to the next key, then to CMS order', () => {
	// b and d share area 62; floor then decides, ascending.
	assert.deepEqual(order({ area: 'asc', floor: 'asc' }).slice(0, 2), ['d', 'b']);
	// With no tiebreaker the CMS order survives (stable sort).
	assert.deepEqual(order({ area: 'asc' }).slice(0, 2), ['b', 'd']);
});

test('numeric strings from the CMS sort as numbers, not as text', () => {
	const items = [{ slug: 'x', price: '900' }, { slug: 'y', price: '1000' }];
	assert.deepEqual(sortObjects(items, { price: 'asc' }).map((i) => i.slug), ['x', 'y']);
});

test('a non-array input yields an empty list rather than throwing', () => {
	assert.deepEqual(sortObjects(undefined, { price: 'asc' }), []);
	assert.deepEqual(sortObjects(null), []);
});
