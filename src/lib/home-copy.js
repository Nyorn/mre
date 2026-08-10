/*
 * Home hero copy bundles. Server-only: this module is imported by
 * +page.server.js, so the two non-production bundles never reach the client
 * bundle. The resolved bundle travels to the browser in the SSR payload.
 *
 * Three variants exist so partners can compare positioning on an otherwise
 * identical page. IA, CTA labels, CTA targets and media are deliberately NOT
 * part of a bundle — only the eyebrow, H1 and lead change, so a comparison
 * isolates the message instead of confounding it with layout differences.
 *
 * CLAIMS (Bob's review, applied verbatim):
 *
 *  - `evidence` no longer promises a source and a checked date. We do not have
 *    a published source field or a checked_at field, so "показываем источник и
 *    дату проверки" described a capability that does not exist. It now speaks
 *    only to what is actually true today: some data is available, some is not,
 *    and we say which is which.
 *  - `compare` no longer implies a complete cost picture. It offers the
 *    ownership costs that are available, not "полную стоимость владения".
 *  - "проверяем" is replaced by "уточняем" everywhere. We ask the owner or
 *    partner; we do not run an independent verification, and the stronger verb
 *    claimed one.
 *  - No price, yield, distance, availability, legal/ВНЖ statement, and no
 *    response-time promise appears in any variant.
 *
 * `scenario` is the production default and the only bundle the live site can
 * render.
 */

export const HERO_COPY = {
	scenario: {
		eyebrow: 'Побережье Болгарии',
		h1: 'Недвижимость у моря под ваш сценарий владения',
		lead:
			'Подбор и сопровождение недвижимости на болгарском побережье — для жизни, отдыха, аренды или переезда. Начинаем с вашей задачи, а не с каталога.'
	},
	evidence: {
		eyebrow: 'Побережье Болгарии',
		h1: 'Объекты у моря — с понятными данными',
		lead:
			'Показываем данные, которые у нас есть, и прямо говорим, чего мы пока не знаем. Недостающее уточняем у собственника или партнёра — без обещаний о доходности и сроках.'
	},
	compare: {
		eyebrow: 'Побережье Болгарии',
		h1: 'Сравните объекты у моря по цене и расходам',
		lead:
			'Сравниваем конкретные объекты и те расходы на владение, которые известны: такса, налог, коммунальные. Чего не знаем — уточняем и говорим об этом отдельно.'
	}
};

/** Shared across every variant: the comparison must not move the CTA. */
export const HERO_CTA = {
	primary: 'Подобрать объекты',
	secondary: 'Как мы работаем'
};

/** Scenario text attached to the hero enquiry, so the lead carries its origin. */
export const HERO_ENQUIRY_SCENARIO = 'Подбор объектов под сценарий владения';

export const DEFAULT_HERO_COPY_ID = 'scenario';
