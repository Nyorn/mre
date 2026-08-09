/*
 * POST /api/lead — same-origin lead intake (P0.5).
 *
 * Replaces the browser's direct POST to UseBasin. The provider key never
 * reaches the client: it is read here, on the server, from private env.
 *
 * Env is read through $env/dynamic/private rather than $env/static/private on
 * purpose. Static private env is inlined at build time and a missing variable
 * fails the build, which would break local preview for anyone without a key.
 * Dynamic env is resolved at request time, so `npm run dev` works with no key
 * and this endpoint answers with a safe configuration error instead.
 *
 * WHAT THIS IS NOT: there is no durable storage and no retry queue. A lead
 * exists only as an outbound email. If Resend rejects or is unreachable, the
 * lead is lost and the response says so rather than claiming acceptance.
 */

import { env } from '$env/dynamic/private';
import { json } from '@sveltejs/kit';
import {
	MAX_BODY_BYTES,
	buildEmail,
	buildLogLine,
	isValidLeadId,
	normalizeAddress,
	normalizePayload,
	spamReason,
	validateLead
} from '$lib/server/lead.js';

const RESEND_ENDPOINT = 'https://api.resend.com/emails';
const RESEND_TIMEOUT_MS = 10000;

/** Same JSON envelope for every outcome, so the client has one shape to read. */
function reply(status, body) {
	return json(body, { status, headers: { 'cache-control': 'no-store' } });
}

export async function POST({ request, url }) {
	// --- Same-origin guard -------------------------------------------------
	// SvelteKit's built-in CSRF check covers form content types, not JSON.
	// A cross-site fetch cannot forge Origin, so this closes the gap.
	const origin = request.headers.get('origin');
	if (origin && origin !== url.origin) {
		return reply(403, {
			ok: false,
			status: 'rejected',
			code: 'bad_origin',
			message: 'Заявка отклонена: запрос пришёл с другого источника.'
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
	const leadId = isValidLeadId(payload.lead_id) ? payload.lead_id : crypto.randomUUID();

	// --- Anti-spam ---------------------------------------------------------
	// Deliberate trade-off: a caught bot receives the same shape as a success so
	// it gets no signal about what tripped. Nothing is sent and nothing is kept.
	// A hidden honeypot field cannot be filled by a human using the form.
	const spam = spamReason(payload);
	if (spam) {
		console.log(buildLogLine({ leadId, event: 'dropped', status: spam }));
		return reply(202, {
			ok: true,
			status: 'received',
			lead_id: leadId,
			message: 'Заявка принята.'
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
			message:
				'Приём заявок ещё не настроен на этом окружении. Заявка не отправлена — свяжитесь с нами по телефону.'
		});
	}

	// --- Send --------------------------------------------------------------
	const receivedAt = new Date().toISOString();
	const { subject, html, text } = buildEmail({ payload, phone, leadId, receivedAt });

	let response;
	try {
		response = await fetch(RESEND_ENDPOINT, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${apiKey}`,
				'Content-Type': 'application/json',
				// Same lead_id across client retries => Resend collapses duplicates.
				'Idempotency-Key': leadId
			},
			body: JSON.stringify({ from, to: [to], subject, html, text }),
			signal: AbortSignal.timeout(RESEND_TIMEOUT_MS)
		});
	} catch {
		// Network/timeout: transient, so the client may retry with the same lead_id.
		console.log(buildLogLine({ leadId, event: 'send_failed', status: 'unreachable', attempt: 1 }));
		return reply(503, {
			ok: false,
			status: 'not_sent',
			code: 'delivery_unreachable',
			retryable: true,
			message: 'Не удалось связаться с почтовым сервисом. Попробуйте ещё раз.'
		});
	}

	if (!response.ok) {
		// 429 and 5xx are worth another attempt; 4xx means the request itself is wrong.
		const retryable = response.status === 429 || response.status >= 500;
		console.log(
			buildLogLine({
				leadId,
				event: 'send_failed',
				status: String(response.status),
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
				? 'Почтовый сервис временно недоступен. Попробуйте ещё раз через минуту.'
				: 'Заявку отправить не удалось. Позвоните нам или попробуйте позже.'
		});
	}

	console.log(buildLogLine({ leadId, event: 'sent', status: String(response.status), attempt: 1 }));
	return reply(200, {
		ok: true,
		status: 'sent',
		lead_id: leadId,
		// Truthful: the provider accepted the message. That is not the same as an
		// operator having read it, and nothing here is stored on our side.
		message: 'Заявка отправлена в офис. Мы свяжемся с вами по указанному телефону.'
	});
}
