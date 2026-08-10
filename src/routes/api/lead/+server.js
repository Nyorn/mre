/*
 * POST /api/lead — same-origin lead intake (P0.5, hardened after review).
 *
 * The provider key exists only here, on the server. Env is read through
 * $env/dynamic/private rather than $env/static/private: static private env is
 * inlined at build time and a missing variable would break local preview, so
 * dev runs with no key and this endpoint answers a safe configuration error.
 *
 * WHAT THIS IS NOT: there is no durable storage and no retry queue. A lead
 * exists only as an outbound email. If Resend rejects or is unreachable the
 * lead is lost, and the response says so rather than claiming acceptance.
 */

import { randomUUID } from 'node:crypto';
import { env } from '$env/dynamic/private';
import { json } from '@sveltejs/kit';
import {
	MAX_BODY_BYTES,
	buildLogLine,
	deliverLead,
	isValidLeadId,
	normalizeAddress,
	normalizePayload,
	spamReason,
	validateLead
} from '$lib/server/lead.js';
import {
	RAW_RATE_LIMIT_MAX,
	clientKeyFromHeaders,
	createRateLimiter
} from '$lib/server/rate-limit.js';

/*
 * Two limiters per server instance. See rate-limit.js for why these are a brake
 * and not a boundary: per-process, reset on cold start, useless against
 * distributed abuse.
 *
 * rawLimiter   — charged by every request, high ceiling, slows junk floods.
 * deliveryLimiter — charged ONLY by a confirmed send, low ceiling.
 *
 * The split is what stops a visitor who mistyped their phone five times from
 * being locked out of actually sending the enquiry.
 */
const rawLimiter = createRateLimiter({ max: RAW_RATE_LIMIT_MAX });
const deliveryLimiter = createRateLimiter();

/** Same JSON envelope for every outcome, so the client has one shape to read. */
function reply(status, body, headers = {}) {
	return json(body, { status, headers: { 'cache-control': 'no-store', ...headers } });
}

export async function POST({ request, url }) {
	// --- Same-origin guard -------------------------------------------------
	// SvelteKit's built-in CSRF check covers form content types, not JSON.
	// Origin must be present AND equal: a missing Origin is rejected rather
	// than trusted, because "absent" is exactly what a raw scripted POST sends.
	const origin = request.headers.get('origin');
	if (origin !== url.origin) {
		return reply(403, {
			ok: false,
			status: 'rejected',
			code: 'bad_origin',
			message: 'Заявка отклонена: запрос отправлен не с сайта.'
		});
	}

	// --- Shape guards ------------------------------------------------------
	const contentType = request.headers.get('content-type') || '';
	if (!contentType.includes('application/json')) {
		return reply(415, {
			ok: false,
			status: 'rejected',
			code: 'unsupported_media_type',
			message: 'Ожидается JSON.'
		});
	}

	const declaredLength = Number(request.headers.get('content-length') || 0);
	if (declaredLength > MAX_BODY_BYTES) {
		return reply(413, {
			ok: false,
			status: 'rejected',
			code: 'payload_too_large',
			message: 'Слишком длинная заявка. Сократите сообщение.'
		});
	}

	let raw;
	try {
		const text = await request.text();
		if (text.length > MAX_BODY_BYTES) {
			return reply(413, {
				ok: false,
				status: 'rejected',
				code: 'payload_too_large',
				message: 'Слишком длинная заявка. Сократите сообщение.'
			});
		}
		raw = JSON.parse(text);
	} catch {
		return reply(400, {
			ok: false,
			status: 'rejected',
			code: 'invalid_json',
			message: 'Не удалось прочитать заявку. Попробуйте ещё раз.'
		});
	}

	const payload = normalizePayload(raw);
	const leadId = isValidLeadId(payload.lead_id) ? payload.lead_id : randomUUID();

	// --- Raw request budget ------------------------------------------------
	// Charged by every request, including the ones rejected below. High ceiling:
	// this is here to slow a flood, not to punish a visitor fixing a typo.
	const clientKey = clientKeyFromHeaders(request.headers);
	const rawGate = rawLimiter.consume(clientKey);
	if (!rawGate.allowed) {
		console.log(buildLogLine({ leadId, event: 'rate_limited', status: 'raw' }));
		return reply(
			429,
			{
				ok: false,
				status: 'not_sent',
				code: 'rate_limited',
				retryable: true,
				message: 'Слишком много запросов с этого адреса. Попробуйте позже.'
			},
			{ 'retry-after': String(rawGate.retryAfterSeconds) }
		);
	}

	// --- Anti-spam ---------------------------------------------------------
	// The honeypot is answered neutrally: it cannot be filled by a human using
	// the form, so a bot learns nothing and no real user ever sees this branch.
	//
	// Timing failures are treated differently on purpose. A real person can trip
	// them — a fast typist, a stale tab left open over lunch — so they get an
	// honest error they can act on, and the client keeps their input.
	const spam = spamReason(payload);
	if (spam === 'honeypot') {
		console.log(buildLogLine({ leadId, event: 'dropped', status: 'honeypot' }));
		// Neutral by design: says only that the request was handled, and claims
		// nothing about sending or delivery.
		return reply(202, {
			ok: true,
			status: 'processed',
			lead_id: leadId,
			message: 'Запрос обработан.'
		});
	}
	if (spam === 'too_fast') {
		console.log(buildLogLine({ leadId, event: 'rejected', status: 'too_fast' }));
		return reply(400, {
			ok: false,
			status: 'not_sent',
			code: 'too_fast',
			retryable: true,
			message: 'Форма отправлена слишком быстро. Проверьте поля и нажмите «Отправить» ещё раз.'
		});
	}
	// stale_form / missing_timing: the client restarts its timing window and the
	// visitor presses Отправить again. Telling them to reload as well would be a
	// second, contradictory instruction — and reloading would lose what they typed.
	if (spam === 'stale_form') {
		console.log(buildLogLine({ leadId, event: 'rejected', status: 'stale_form' }));
		return reply(400, {
			ok: false,
			status: 'not_sent',
			code: 'stale_form',
			retryable: true,
			message: 'Страница была открыта долго. Нажмите «Отправить» ещё раз.'
		});
	}
	if (spam === 'missing_timing') {
		console.log(buildLogLine({ leadId, event: 'rejected', status: 'missing_timing' }));
		return reply(400, {
			ok: false,
			status: 'not_sent',
			code: 'missing_timing',
			retryable: true,
			message: 'Не удалось подтвердить отправку из формы. Нажмите «Отправить» ещё раз.'
		});
	}

	// --- Server-side validation -------------------------------------------
	const { ok: valid, errors, phone } = validateLead(payload);
	if (!valid) {
		console.log(buildLogLine({ leadId, event: 'rejected', status: 'validation_failed' }));
		return reply(400, {
			ok: false,
			status: 'rejected',
			code: 'validation_failed',
			message: 'Проверьте заполнение полей.',
			errors
		});
	}

	// --- Configuration -----------------------------------------------------
	// Missing or malformed configuration must never look like a delivered lead.
	const apiKey = (env.RESEND_API_KEY || '').trim();
	const from = normalizeAddress(env.LEAD_FROM_EMAIL);
	const to = normalizeAddress(env.LEAD_TO_EMAIL);
	if (!apiKey || !from || !to) {
		// Log which slot is unset — never the value.
		const missing = [
			!apiKey ? 'RESEND_API_KEY' : null,
			!from ? 'LEAD_FROM_EMAIL' : null,
			!to ? 'LEAD_TO_EMAIL' : null
		]
			.filter(Boolean)
			.join(',');
		console.log(
			buildLogLine({ leadId, event: 'not_configured', status: 'config', extra: `missing=${missing}` })
		);
		return reply(503, {
			ok: false,
			status: 'not_sent',
			code: 'lead_delivery_not_configured',
			message: 'Приём заявок на этом окружении не настроен. Заявка не принята к отправке.'
		});
	}

	// --- Delivery budget ---------------------------------------------------
	// Peeked, not charged: only a confirmed send below spends this budget, so
	// validation failures, timing rejections, conflicts and provider outages
	// never consume a visitor's ability to actually send.
	const deliveryGate = deliveryLimiter.peek(clientKey);
	if (!deliveryGate.allowed) {
		console.log(buildLogLine({ leadId, event: 'rate_limited', status: 'delivery' }));
		return reply(
			429,
			{
				ok: false,
				status: 'not_sent',
				code: 'rate_limited',
				retryable: true,
				message: 'Слишком много заявок подряд с этого адреса. Попробуйте позже.'
			},
			{ 'retry-after': String(deliveryGate.retryAfterSeconds) }
		);
	}

	// --- Send --------------------------------------------------------------
	const { outcome, status } = await deliverLead({ payload, phone, leadId, apiKey, from, to });

	if (outcome === 'sent') {
		deliveryLimiter.consume(clientKey);
		console.log(buildLogLine({ leadId, event: 'sent', status: String(status), attempt: 1 }));
		return reply(200, {
			ok: true,
			status: 'accepted_by_provider',
			lead_id: leadId,
			// Truthful boundary: the provider took the message for sending. That is
			// not delivery to the office inbox and not contact by a person.
			message:
				'Почтовый сервис принял заявку к отправке. Доставка уведомления в офис ещё не подтверждена.'
		});
	}

	if (outcome === 'conflict_modified') {
		// Same lead_id, different bytes: the earlier version was already accepted.
		// Reporting "not sent" here would be a lie, so we say what happened and
		// tell the client to send the edit as a separate enquiry.
		console.log(buildLogLine({ leadId, event: 'conflict', status: String(status) }));
		return reply(409, {
			ok: false,
			status: 'previous_version_accepted',
			code: 'content_changed',
			new_lead_required: true,
			message:
				'Почтовый сервис уже принял предыдущую версию заявки. Изменения не приняты — нажмите «Отправить», чтобы отправить их отдельной заявкой.'
		});
	}

	if (outcome === 'unreachable') {
		console.log(buildLogLine({ leadId, event: 'send_failed', status: 'unreachable', attempt: 1 }));
		return reply(503, {
			ok: false,
			status: 'not_sent',
			code: 'delivery_unreachable',
			retryable: true,
			message: 'Не удалось связаться с почтовым сервисом. Заявка не принята к отправке.'
		});
	}

	const retryable = outcome === 'retryable';
	console.log(
		buildLogLine({
			leadId,
			event: 'send_failed',
			status: String(status),
			attempt: 1,
			extra: retryable ? 'retryable' : 'permanent'
		})
	);
	return reply(retryable ? 503 : 502, {
		ok: false,
		status: 'not_sent',
		code: retryable ? 'delivery_temporarily_unavailable' : 'delivery_failed',
		retryable,
		message: retryable
			? 'Почтовый сервис временно недоступен. Заявка не принята к отправке.'
			: 'Заявка не принята к отправке.'
	});
}
