/*
 * Lead intake — pure server-side helpers (P0.5).
 *
 * Lives under src/lib/server/ so SvelteKit refuses to bundle it into client
 * code: nothing here may ever reach the browser.
 *
 * Everything in this file is pure (no env, no network, no SvelteKit imports)
 * so it can be unit-tested with `node --test` without a dev server and without
 * a provider key. The endpoint in src/routes/api/lead/+server.js does the I/O.
 *
 * TRUTHFULNESS NOTE, and it matters for the copy this module produces:
 * there is no durable storage here. A lead exists only as an outbound email.
 * If the provider rejects the request, the lead is lost. Nothing in this file
 * may generate text claiming the lead was stored, queued, or guaranteed to
 * arrive. See docs/real-estate/resend-lead-delivery.v1.md.
 */

/** Maximum accepted request body. Anything larger is refused before parsing. */
export const MAX_BODY_BYTES = 16 * 1024;

/** A human needs at least this long to fill the form; faster is treated as a bot. */
export const MIN_FILL_MS = 3000;

/** A form page older than this is treated as stale (or a replayed bot payload). */
export const MAX_FORM_AGE_MS = 12 * 60 * 60 * 1000;

/** Per-field caps. Longer values are truncated, not rejected, except where validated. */
export const LIMITS = {
	name: 120,
	phone: 32,
	message: 2000,
	object_name: 200,
	object_id: 100,
	object_slug: 200,
	intent: 40,
	scenario: 200,
	landing_url: 500,
	utm: 160,
	content_id: 100,
	subject: 180
};

/*
 * Control characters are detected by code point rather than by a regex escape
 * class. A literal control byte in source is invisible and easy to corrupt, and
 * escape sequences get rewritten by some editors; comparing code points cannot
 * be mangled and is obviously correct on inspection.
 */
const TAB = 9;
const NEWLINE = 10;
const DEL = 127;
const UNIT_SEPARATOR = 31;

/** True for C0 controls (0-31) and DEL (127). */
function isControlCode(code) {
	return code <= UNIT_SEPARATOR || code === DEL;
}

/** Replace or drop control characters, optionally keeping tab and newline. */
function stripControls(input, { replacement = '', keepNewlines = false } = {}) {
	let out = '';
	for (const ch of String(input)) {
		const code = ch.codePointAt(0);
		if (!isControlCode(code)) {
			out += ch;
			continue;
		}
		if (keepNewlines && (code === TAB || code === NEWLINE)) {
			out += ch;
			continue;
		}
		out += replacement;
	}
	return out;
}

/**
 * Remove everything that could break out of a header line.
 *
 * CR/LF are the header-injection vector: a value containing "\r\nBcc: x@y"
 * would otherwise append a header. Every other C0 control and DEL is stripped
 * for the same reason. Applied to every value that reaches a mail header
 * (subject, from, to), including values that come from our own environment.
 */
export function sanitizeHeaderValue(value, max = 998) {
	if (value === null || value === undefined) return '';
	return stripControls(value, { replacement: ' ' })
		.replace(/\s+/g, ' ')
		.trim()
		.slice(0, max);
}

/**
 * Strip control characters from free text that stays in the body (not headers).
 * Newline and tab are preserved: the message is rendered with `pre-wrap`, so
 * the author's line breaks are meaningful.
 */
export function sanitizeText(value, max) {
	if (value === null || value === undefined) return '';
	let out = stripControls(value, { keepNewlines: true }).trim();
	if (typeof max === 'number') out = out.slice(0, max);
	return out;
}

/** HTML-escape a lead-controlled value before it goes into the email body. */
export function escapeHtml(value) {
	return String(value === null || value === undefined ? '' : value)
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
}

const EMAIL_RE = /^[^\s@<>",;:]+@[^\s@<>",;:]+\.[^\s@<>",;:]+$/;

/** Bare address check. Deliberately strict: these values build mail headers. */
export function isValidEmail(value) {
	const v = sanitizeHeaderValue(value, 320);
	return v.length > 0 && v.length <= 320 && EMAIL_RE.test(v);
}

/**
 * Validate a configured sender/recipient, accepting either `a@b.c` or
 * `Display Name <a@b.c>`. Returns a sanitized value or null when unusable.
 */
export function normalizeAddress(value) {
	const raw = sanitizeHeaderValue(value, 320);
	if (!raw) return null;
	const angle = raw.match(/^(.*)<([^<>]+)>$/);
	if (angle) {
		const display = sanitizeHeaderValue(angle[1], 120).replace(/"/g, '');
		const addr = sanitizeHeaderValue(angle[2], 320);
		if (!isValidEmail(addr)) return null;
		return display ? `${display} <${addr}>` : addr;
	}
	return isValidEmail(raw) ? raw : null;
}

/** UUID v4 shape, used as correlation id and provider idempotency key. */
export function isValidLeadId(value) {
	return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
		String(value || '')
	);
}

/** Phone: leading +, then 7-15 digits once separators are removed. */
export function normalizePhone(value) {
	const raw = sanitizeText(value, LIMITS.phone);
	const compact = raw.replace(/[\s()\-.]/g, '');
	return /^\+\d{7,15}$/.test(compact) ? compact : null;
}

/** Reduce an arbitrary JSON body to the fields we accept, with caps applied. */
export function normalizePayload(raw) {
	const body = raw && typeof raw === 'object' ? raw : {};
	const str = (k, max) => sanitizeText(body[k], max);
	return {
		lead_id: sanitizeText(body.lead_id, 64),
		name: str('name', LIMITS.name),
		phone: str('phone', LIMITS.phone),
		message: str('message', LIMITS.message),
		consent: body.consent === true,
		// Anti-spam
		website: str('website', 200), // honeypot: must stay empty
		form_started_at: Number(body.form_started_at) || 0,
		// Context (optional - "при наличии")
		object_id: str('object_id', LIMITS.object_id),
		object_slug: str('object_slug', LIMITS.object_slug),
		object_name: str('object_name', LIMITS.object_name),
		intent: str('intent', LIMITS.intent),
		scenario: str('scenario', LIMITS.scenario),
		landing_url: str('landing_url', LIMITS.landing_url),
		content_id: str('content_id', LIMITS.content_id),
		utm_source: str('utm_source', LIMITS.utm),
		utm_medium: str('utm_medium', LIMITS.utm),
		utm_campaign: str('utm_campaign', LIMITS.utm),
		utm_content: str('utm_content', LIMITS.utm),
		utm_term: str('utm_term', LIMITS.utm)
	};
}

/**
 * Server-side validation. The client validates too, but the client is not a
 * trust boundary — this is the one that decides.
 */
export function validateLead(payload) {
	const errors = {};
	if (!payload.name) errors.name = 'Укажите имя.';
	const phone = normalizePhone(payload.phone);
	if (!payload.phone) errors.phone = 'Укажите телефон.';
	else if (!phone) errors.phone = 'Неверный формат телефона. Пример: +359888123456';
	if (!payload.message) errors.message = 'Коротко опишите задачу.';
	return { ok: Object.keys(errors).length === 0, errors, phone };
}

/**
 * Anti-spam. Returns a reason string when the submission must not be sent.
 *
 * `form_started_at` is REQUIRED (P1). Previously an absent value was tolerated,
 * which meant the cheapest possible abuse — a raw scripted POST that simply
 * omits the field — skipped the timing check entirely. A real form always sends
 * it, so its absence is itself a signal.
 *
 * Known limitation, stated rather than hidden: the value is supplied by the
 * client and can be forged. It stops naive bots and instant replays, not a
 * determined attacker. A signed server-issued token would be stronger and is
 * listed as follow-up work in the doc.
 */
export function spamReason(payload, now = Date.now()) {
	if (payload.website) return 'honeypot';
	const started = payload.form_started_at;
	if (!started || !Number.isFinite(started) || started <= 0) return 'missing_timing';
	const elapsed = now - started;
	if (elapsed < 0) return null; // clock skew - not evidence of a bot
	if (elapsed < MIN_FILL_MS) return 'too_fast';
	if (elapsed > MAX_FORM_AGE_MS) return 'stale_form';
	return null;
}

const INTENT_LABELS = {
	selection: 'Подбор объектов',
	full_cost: 'Цена и полная стоимость',
	residence_assessment: 'Переезд',
	object_viewing: 'Просмотр объекта',
	general_question: 'Общий вопрос'
};

/** Human label for an intent code; unknown codes fall back to the raw value. */
export function intentLabel(intent) {
	return INTENT_LABELS[intent] || intent || 'Общий вопрос';
}

/**
 * Build the operator notification.
 *
 * Every lead-controlled value is HTML-escaped for the html part, and the
 * subject is header-sanitized. The subject is built from object/scenario, both
 * of which are lead-influenced, so it must never be passed through raw.
 *
 * BYTE-STABILITY (P0 idempotency): this function must be a pure function of
 * `payload`, `phone` and `leadId`. No timestamp, no random value, nothing read
 * from the clock or the environment may enter the output, because the result
 * becomes the request body sent to Resend under a fixed Idempotency-Key. If two
 * retries of the same lead produced different bytes, Resend would answer 409
 * instead of collapsing the duplicate.
 *
 * That is why there is no "received at" row: a per-request timestamp is exactly
 * the kind of changing server material that breaks it. The moment the provider
 * accepted the message is recorded by the message's own Date header, which is
 * authoritative and costs us nothing.
 */
export function buildEmail({ payload, phone, leadId }) {
	const topic = payload.object_name || payload.scenario || intentLabel(payload.intent);
	const subject = sanitizeHeaderValue(
		`Заявка Sea Estate — ${topic} [${String(leadId).slice(0, 8)}]`,
		LIMITS.subject
	);

	const rows = [
		['Имя', payload.name],
		['Телефон', phone],
		['Задача', intentLabel(payload.intent)],
		['Объект', payload.object_name],
		['ID объекта', payload.object_id],
		['Slug объекта', payload.object_slug],
		['Сценарий', payload.scenario],
		['Страница', payload.landing_url],
		['content_id', payload.content_id],
		['utm_source', payload.utm_source],
		['utm_medium', payload.utm_medium],
		['utm_campaign', payload.utm_campaign],
		['utm_content', payload.utm_content],
		['utm_term', payload.utm_term],
		// Technical form flag only. The site currently has no approved consent
		// text, so this row must never be read as legal evidence of consent.
		[
			'Флаг consent (техническое поле формы, не юридическое подтверждение)',
			payload.consent ? 'установлен' : 'не установлен'
		],
		['lead_id', leadId]
	].filter(([, v]) => v !== '' && v !== null && v !== undefined);

	const htmlRows = rows
		.map(
			([k, v]) =>
				`<tr><th align="left" style="padding:4px 12px 4px 0;vertical-align:top;color:#62777c;font-weight:600;">${escapeHtml(
					k
				)}</th><td style="padding:4px 0;color:#102a30;">${escapeHtml(v)}</td></tr>`
		)
		.join('');

	const html =
		`<div style="font-family:system-ui,sans-serif;font-size:15px;line-height:1.5;color:#102a30;">` +
		`<p style="margin:0 0 12px;">Новая заявка с сайта Sea Estate.</p>` +
		`<table style="border-collapse:collapse;margin:0 0 16px;">${htmlRows}</table>` +
		`<p style="margin:0 0 4px;color:#62777c;">Сообщение:</p>` +
		`<div style="white-space:pre-wrap;border-left:3px solid #d7e1df;padding-left:12px;">${escapeHtml(
			payload.message
		)}</div>` +
		`<p style="margin:16px 0 0;font-size:13px;color:#62777c;">` +
		`Сервер сайта не хранит копию этой заявки.</p>` +
		`</div>`;

	const text =
		'Новая заявка с сайта Sea Estate.\n\n' +
		rows.map(([k, v]) => `${k}: ${v}`).join('\n') +
		`\n\nСообщение:\n${payload.message}\n\n` +
		'Сервер сайта не хранит копию этой заявки.\n';

	return { subject, html, text };
}

export const RESEND_ENDPOINT = 'https://api.resend.com/emails';
export const RESEND_TIMEOUT_MS = 10000;

/**
 * Serialize the exact bytes sent to Resend for a given lead.
 *
 * Deterministic by construction: fixed key order, and every value derives from
 * the payload, the phone and the lead id. Two calls with equal inputs produce
 * an identical string, which is what makes the Idempotency-Key meaningful.
 */
export function buildResendRequestBody({ payload, phone, leadId, from, to }) {
	const { subject, html, text } = buildEmail({ payload, phone, leadId });
	return JSON.stringify({ from, to: [to], subject, html, text });
}

/**
 * Map a Resend HTTP status onto what we tell the caller.
 *
 * 409 is the interesting one. Resend answers it when the same Idempotency-Key
 * arrives with a *different* body — i.e. the visitor edited the form and
 * resubmitted. The first message was already sent, so this is neither a
 * delivery failure nor a duplicate to swallow: the honest outcome is "the
 * previous version was already sent, this edit needs a new lead id".
 */
export function classifyResendOutcome(status) {
	if (status >= 200 && status < 300) return 'sent';
	if (status === 409) return 'conflict_modified';
	if (status === 429 || status >= 500) return 'retryable';
	return 'permanent';
}

/**
 * Send one lead through Resend.
 *
 * `fetchImpl` is injected so tests can drive every branch — including two
 * repeated POSTs — without network access, a provider key, or a real send.
 */
export async function deliverLead({
	payload,
	phone,
	leadId,
	apiKey,
	from,
	to,
	fetchImpl = fetch,
	endpoint = RESEND_ENDPOINT,
	timeoutMs = RESEND_TIMEOUT_MS
}) {
	const body = buildResendRequestBody({ payload, phone, leadId, from, to });

	let response;
	try {
		response = await fetchImpl(endpoint, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${apiKey}`,
				'Content-Type': 'application/json',
				// Same lead_id + same bytes => Resend collapses the duplicate.
				'Idempotency-Key': leadId
			},
			body,
			signal: AbortSignal.timeout(timeoutMs)
		});
	} catch {
		return { outcome: 'unreachable', status: 0, body };
	}

	return { outcome: classifyResendOutcome(response.status), status: response.status, body };
}

/**
 * Log line for a lead. Deliberately excludes name, phone, message, email
 * addresses and any provider key - only correlation and outcome.
 */
export function buildLogLine({ leadId, event, status, attempt, extra }) {
	const parts = ['lead_intake', `event=${event}`, `lead_id=${sanitizeHeaderValue(leadId, 64)}`];
	if (status !== undefined && status !== null) {
		parts.push(`status=${sanitizeHeaderValue(status, 32)}`);
	}
	if (attempt !== undefined && attempt !== null) parts.push(`attempt=${Number(attempt) || 0}`);
	if (extra) parts.push(sanitizeHeaderValue(extra, 120));
	return parts.join(' ');
}
