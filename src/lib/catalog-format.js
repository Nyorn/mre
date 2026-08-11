/*
 * Catalog presentation rules, as pure functions.
 *
 * These exist separately from the card component because they are the part that
 * can quietly lie. The legacy card printed `Цена:{object.price} €` straight from
 * the CMS, so a missing price rendered "Цена: €", a zero rendered "Цена:0 €",
 * and `Площадь: undefined м²` was one absent field away. Everything here refuses
 * to render a fact it does not have, and every rule is unit-tested rather than
 * eyeballed on whichever objects happen to be published today.
 *
 * No rule invents anything. There is no fallback price, no "от", no estimate,
 * and no derived claim about the coast, the building or the investment case.
 */

/** A price is renderable only if it is a finite number strictly above zero. */
export function hasPrice(value) {
	const n = typeof value === 'string' ? Number(value) : value;
	return typeof n === 'number' && Number.isFinite(n) && n > 0;
}

/**
 * Price line for a card.
 *
 * Known -> grouped digits plus €. Unknown, zero, negative or non-numeric ->
 * "Цена по запросу", which is a statement about our knowledge and not about the
 * object. Never "0 €", never an empty amount.
 */
export function formatPrice(value) {
	if (!hasPrice(value)) {
		return { known: false, text: 'Цена по запросу' };
	}
	const n = typeof value === 'string' ? Number(value) : value;
	// Narrow no-break spaces as thousands separators; ru-RU grouping, no decimals.
	const grouped = Math.round(n)
		.toString()
		.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
	return { known: true, text: `${grouped} €` };
}

/** Positive finite integer, e.g. bedrooms or floor numbers. */
function positiveInt(value) {
	const n = typeof value === 'string' ? Number(value) : value;
	return typeof n === 'number' && Number.isFinite(n) && n > 0 && Number.isInteger(n) ? n : null;
}

/** Positive finite number, e.g. area in m². */
function positiveNumber(value) {
	const n = typeof value === 'string' ? Number(value) : value;
	return typeof n === 'number' && Number.isFinite(n) && n > 0 ? n : null;
}

/**
 * The three facts this slice is allowed to show, and only when known:
 * area, bedrooms, floor. Anything absent is omitted entirely rather than
 * rendered as an empty or zero value.
 *
 * Floor is shown as "N из M" only when both are known; a floor without a
 * building height is still useful and renders alone.
 */
export function buildFacts(object = {}) {
	const facts = [];

	const area = positiveNumber(object.area);
	if (area !== null) {
		facts.push({ key: 'area', label: 'Площадь', value: `${area} м²` });
	}

	const bedrooms = positiveInt(object.bedrooms);
	if (bedrooms !== null) {
		facts.push({ key: 'bedrooms', label: 'Спальни', value: String(bedrooms) });
	}

	const floor = positiveInt(object.floor);
	if (floor !== null) {
		const maxFloor = positiveInt(object.maxFloor);
		facts.push({
			key: 'floor',
			label: 'Этаж',
			value: maxFloor !== null ? `${floor} из ${maxFloor}` : String(floor)
		});
	}

	return facts;
}

/** Type and city, in the order the card shows them; empties dropped. */
export function buildKicker(object = {}) {
	return [object.type, object.city].map((v) => (typeof v === 'string' ? v.trim() : '')).filter(Boolean);
}

/**
 * Accessible alt text.
 *
 * Order matters. A CMS-authored description is the only text that actually
 * describes the picture, so it wins. Otherwise the image is decorative relative
 * to the heading right beside it — the name is already announced — and a
 * generic "Фото объекта: <name>" would just make a screen reader say the name
 * twice. In that case alt is empty, which is the correct markup for an image
 * that adds nothing the surrounding text does not already say.
 */
export function imageAlt(object = {}) {
	const described = object?.photo?.description;
	if (typeof described === 'string' && described.trim()) return described.trim();
	return '';
}

/** True when the object has a usable photo URL. */
export function hasPhoto(object = {}) {
	const url = object?.photo?.url;
	return typeof url === 'string' && url.trim().length > 0;
}

/* ---------------------------------------------------------------- links --- */

/** The only query parameters a catalog link is allowed to carry forward. */
export const PRESERVED_QUERY_KEYS = ['preview_theme', 'preview_copy'];

/**
 * Keep the preview variant across internal navigation.
 *
 * A reviewer comparing directions clicks from the catalog into a detail page
 * and back; losing the variant there makes the comparison useless. Only the two
 * allowlisted keys travel — no utm, no filter state, nothing a visitor typed —
 * and in production the server ignores them anyway, so this cannot leak a
 * preview surface into the live site.
 *
 * @param {string} href      internal path, e.g. /objects/some-slug
 * @param {string|URLSearchParams} search  current location search
 */
export function withPreviewQuery(href, search) {
	const current =
		search instanceof URLSearchParams ? search : new URLSearchParams(String(search || ''));

	const carried = new URLSearchParams();
	for (const key of PRESERVED_QUERY_KEYS) {
		const value = current.get(key);
		if (value) carried.set(key, value);
	}

	const query = carried.toString();
	if (!query) return href;
	return href.includes('?') ? `${href}&${query}` : `${href}?${query}`;
}

/**
 * Result-count line. Distinguishes "nothing matches your filters" from
 * "the catalog is empty", because they need different words and different
 * next steps.
 */
export function describeCount(shown, total) {
	if (total === 0) return { state: 'empty-catalog', text: 'Пока нет опубликованных объектов' };
	if (shown === 0) return { state: 'empty-filtered', text: 'Ничего не найдено по выбранным фильтрам' };
	if (shown === total) return { state: 'all', text: `Объектов: ${total}` };
	return { state: 'filtered', text: `Показано ${shown} из ${total}` };
}

/* ------------------------------------------------------------------ sort --- */

/** Sortable numeric value, or null when the field is not a usable number. */
function sortableNumber(value) {
	const n = typeof value === 'string' ? Number(value) : value;
	return typeof n === 'number' && Number.isFinite(n) ? n : null;
}

/**
 * Price is sortable only when it is a real price. A CMS zero means "not
 * published", not "free", so it must not sort to the top of "cheapest first" —
 * which is exactly what `a.price - b.price` did.
 */
function sortablePrice(value) {
	return hasPrice(value) ? Number(value) : null;
}

export const SORT_KEYS = ['price', 'area', 'floor'];

/**
 * Order the catalog.
 *
 * Rules, all of them deliberate:
 *
 *  - No sort selected -> the CMS order, unchanged. The array is copied but not
 *    sorted at all, so "Без сортировки" is deterministic rather than "whatever
 *    a comparator returning 0 happens to do".
 *  - Unknown values sort LAST in both directions. An object with no price is
 *    not the cheapest and not the most expensive; putting it at the end in
 *    either direction is the only honest position. The old comparator produced
 *    NaN for these and left the order arbitrary.
 *  - Ties fall through to the next selected key, then to the CMS order, which
 *    Array.prototype.sort preserves (stable since ES2019).
 *
 * @param {Array<object>} items
 * @param {{price?: 'asc'|'desc', area?: 'asc'|'desc', floor?: 'asc'|'desc'}} sortOptions
 */
export function sortObjects(items, sortOptions = {}) {
	const list = Array.isArray(items) ? [...items] : [];

	const active = SORT_KEYS.filter(
		(key) => sortOptions?.[key] === 'asc' || sortOptions?.[key] === 'desc'
	);
	if (active.length === 0) return list;

	const valueOf = (object, key) =>
		key === 'price' ? sortablePrice(object?.price) : sortableNumber(object?.[key]);

	return list.sort((a, b) => {
		for (const key of active) {
			const av = valueOf(a, key);
			const bv = valueOf(b, key);

			if (av === null && bv === null) continue; // both unknown: next key
			if (av === null) return 1; // unknown goes last, regardless of direction
			if (bv === null) return -1;

			if (av !== bv) return (av - bv) * (sortOptions[key] === 'asc' ? 1 : -1);
		}
		return 0; // stable: CMS order survives
	});
}
