/*
 * Enquiry context contract (Slice A, P0.1 + P0.3).
 *
 * One shared shape for every CTA that opens the enquiry form, so a scenario
 * entry from home and an object CTA from detail carry the same fields and the
 * receiving form never has to guess where the request came from.
 *
 * `intent` values are taken from the canonical vocabulary in
 * docs/real-estate/lead-qualification.schema.json so this does not invent a
 * second enum. Mapping notes:
 *   - "Уточнить цену и наличие"  -> full_cost           (cost/availability question)
 *   - "Записаться на просмотр"   -> object_viewing
 *   - "Подобрать второй дом"     -> selection
 *   - "Сравнить объекты/расходы" -> full_cost
 *   - "Обсудить переезд"         -> residence_assessment
 *
 * Deliberately NOT here: sending, storage, CRM. Slice A only carries context
 * into the existing form; delivery is Slice B (P0.5).
 */

import { modalStack } from '$lib/store.js';

export const INTENT = {
	SELECTION: 'selection',
	FULL_COST: 'full_cost',
	RESIDENCE_ASSESSMENT: 'residence_assessment',
	OBJECT_VIEWING: 'object_viewing',
	GENERAL_QUESTION: 'general_question'
};

const KNOWN_INTENTS = Object.values(INTENT);

/**
 * Build the context object handed to the enquiry form.
 * Every field is optional except intent; missing object context simply means
 * this is a scenario enquiry rather than an object enquiry.
 */
export function buildEnquiryContext({
	intent = INTENT.GENERAL_QUESTION,
	objectId = '',
	objectSlug = '',
	objectName = '',
	scenario = '',
	url = ''
} = {}) {
	return {
		intent: KNOWN_INTENTS.includes(intent) ? intent : INTENT.GENERAL_QUESTION,
		objectId: objectId || '',
		objectSlug: objectSlug || '',
		objectName: objectName || '',
		scenario: scenario || '',
		// Landing URL is only meaningful in the browser; server render leaves it empty.
		url: url || (typeof window !== 'undefined' ? window.location.href : '')
	};
}

/** Open the enquiry form with a fully-formed context. */
export function openEnquiry(context) {
	modalStack.open('feedback', buildEnquiryContext(context));
}

/**
 * Prefilled message text. Kept honest: for an object we name the object, for a
 * scenario we name the scenario, and we never assert anything about price,
 * availability or yield on the user's behalf.
 */
export function defaultMessageFor(context) {
	const { intent, objectName, scenario } = context;
	if (objectName) {
		if (intent === INTENT.OBJECT_VIEWING) {
			return `Хочу записаться на просмотр объекта: ${objectName}`;
		}
		return `Прошу уточнить цену и наличие по объекту: ${objectName}`;
	}
	if (scenario) {
		return `${scenario}. Расскажите, какие варианты возможны.`;
	}
	return '';
}
