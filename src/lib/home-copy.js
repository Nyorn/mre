/*
 * Home hero copy bundles.
 *
 * Three variants exist so partners can compare positioning on an otherwise
 * identical page. IA, CTA labels, CTA targets and media are deliberately NOT
 * part of a bundle — only the eyebrow, H1 and lead change, so a comparison
 * isolates the message instead of confounding it with layout differences.
 *
 * Claims discipline (product-flow-delta.v1 §3, brand-delta.v1 §6): no price,
 * yield, distance, availability, legal/ВНЖ statement and no response-time
 * promise appears in any variant. "scenario" is the production default and the
 * only bundle the live site can render.
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
		h1: 'Объекты у моря с проверяемыми данными',
		lead:
			'Показываем источник и дату проверки там, где они есть, и прямо отмечаем, где данных пока нет. Без обещаний о доходности и сроках.'
	},
	compare: {
		eyebrow: 'Побережье Болгарии',
		h1: 'Сравните объекты у моря по цене и расходам',
		lead:
			'Сравниваем конкретные объекты и полную стоимость владения — такса, налог, коммунальные — до разговора с менеджером.'
	}
};

/** Shared across every variant: the comparison must not move the CTA. */
export const HERO_CTA = {
	primary: 'Подобрать объекты',
	secondary: 'Как мы работаем'
};

/** Scenario text attached to the hero enquiry, so the lead carries its origin. */
export const HERO_ENQUIRY_SCENARIO = 'Подбор объектов под сценарий владения';
