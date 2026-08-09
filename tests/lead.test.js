/*
 * Unit tests for the lead-intake helpers (P0.5).
 *
 * Node's built-in test runner — no new dependency, no dev server, no provider
 * key, and no email is ever sent: every function under test is pure.
 *
 *   npm test        (or: node --test tests/)
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
	MIN_FILL_MS,
	MAX_FORM_AGE_MS,
	buildEmail,
	buildLogLine,
	escapeHtml,
	intentLabel,
	isValidEmail,
	isValidLeadId,
	normalizeAddress,
	normalizePayload,
	normalizePhone,
	sanitizeHeaderValue,
	sanitizeText,
	spamReason,
	validateLead
} from '../src/lib/server/lead.js';

const CR = String.fromCharCode(13);
const LF = String.fromCharCode(10);
const NUL = String.fromCharCode(0);
const TAB = String.fromCharCode(9);

/* ---------------- header injection ---------------- */

test('sanitizeHeaderValue removes CR and LF so headers cannot be forged', () => {
	const attack = `Заявка${CR}${LF}Bcc: attacker@evil.com`;
	const safe = sanitizeHeaderValue(attack);
	assert.ok(!safe.includes(CR), 'CR must not survive');
	assert.ok(!safe.includes(LF), 'LF must not survive');
	assert.equal(safe, 'Заявка Bcc: attacker@evil.com');
});

test('sanitizeHeaderValue strips NUL and other control characters', () => {
	assert.equal(sanitizeHeaderValue(`a${NUL}b${TAB}c`), 'a b c');
});

test('sanitizeHeaderValue caps length', () => {
	assert.equal(sanitizeHeaderValue('x'.repeat(50), 10).length, 10);
});

test('a lead-controlled object name cannot inject a header into the subject', () => {
	const payload = normalizePayload({
		object_name: `Вилла${CR}${LF}Bcc: attacker@evil.com`,
		intent: 'full_cost'
	});
	const { subject } = buildEmail({
		payload,
		phone: '+359888123456',
		leadId: '11111111-2222-4333-8444-555555555555',
		receivedAt: '2026-08-09T00:00:00.000Z'
	});
	assert.ok(!subject.includes(CR));
	assert.ok(!subject.includes(LF));
});

/* ---------------- text handling ---------------- */

test('sanitizeText keeps newlines in the message but drops other controls', () => {
	const out = sanitizeText(`строка1${LF}строка2${NUL}`, 100);
	assert.ok(out.includes(LF), 'newline is meaningful in a message body');
	assert.ok(!out.includes(NUL));
});

test('escapeHtml neutralises markup', () => {
	assert.equal(escapeHtml('<script>alert(1)</script>'), '&lt;script&gt;alert(1)&lt;/script&gt;');
	assert.equal(escapeHtml(`a&b"c'd`), 'a&amp;b&quot;c&#39;d');
});

test('email body escapes lead-controlled values', () => {
	const payload = normalizePayload({
		name: '<b>Иван</b>',
		message: '<img src=x onerror=alert(1)>',
		intent: 'selection'
	});
	const { html, text } = buildEmail({
		payload,
		phone: '+359888123456',
		leadId: '11111111-2222-4333-8444-555555555555',
		receivedAt: '2026-08-09T00:00:00.000Z'
	});
	assert.ok(!html.includes('<img src=x'), 'raw tag must not reach the html body');
	assert.ok(html.includes('&lt;img src=x'));
	assert.ok(!html.includes('<b>Иван</b>'));
	// The plain-text part is not HTML, so it legitimately carries raw text.
	assert.ok(text.includes('<img src=x onerror=alert(1)>'));
});

/* ---------------- addresses ---------------- */

test('isValidEmail accepts a normal address and rejects malformed ones', () => {
	assert.equal(isValidEmail('leads@sea-estate.com'), true);
	assert.equal(isValidEmail('no-at-sign'), false);
	assert.equal(isValidEmail('a@b'), false);
	assert.equal(isValidEmail(`a@b.c${CR}${LF}Bcc: x@y.z`), false);
});

test('normalizeAddress supports display-name form and rejects junk', () => {
	assert.equal(normalizeAddress('leads@sea-estate.com'), 'leads@sea-estate.com');
	assert.equal(
		normalizeAddress('Sea Estate <leads@sea-estate.com>'),
		'Sea Estate <leads@sea-estate.com>'
	);
	assert.equal(normalizeAddress('Sea Estate <not-an-email>'), null);
	assert.equal(normalizeAddress(''), null);
	assert.equal(normalizeAddress(undefined), null);
});

/* ---------------- phone ---------------- */

test('normalizePhone accepts international formats and strips separators', () => {
	assert.equal(normalizePhone('+359 888 123 456'), '+359888123456');
	assert.equal(normalizePhone('+7 (912) 345-67-89'), '+79123456789');
});

test('normalizePhone rejects too-short, missing-plus and non-numeric input', () => {
	assert.equal(normalizePhone('+12'), null);
	assert.equal(normalizePhone('359888123456'), null);
	assert.equal(normalizePhone('телефон'), null);
});

/* ---------------- validation ---------------- */

test('validateLead requires name, phone and message', () => {
	const result = validateLead(normalizePayload({}));
	assert.equal(result.ok, false);
	assert.ok(result.errors.name);
	assert.ok(result.errors.phone);
	assert.ok(result.errors.message);
});

test('validateLead passes a complete payload and returns the normalized phone', () => {
	const result = validateLead(
		normalizePayload({ name: 'Иван', phone: '+359 888 123 456', message: 'Интересует объект' })
	);
	assert.equal(result.ok, true);
	assert.deepEqual(result.errors, {});
	assert.equal(result.phone, '+359888123456');
});

test('normalizePayload truncates oversized fields and defaults consent to false', () => {
	const payload = normalizePayload({ name: 'x'.repeat(500), consent: 'yes' });
	assert.equal(payload.name.length, 120);
	assert.equal(payload.consent, false, 'only a real boolean true counts as consent');
	assert.equal(normalizePayload({ consent: true }).consent, true);
});

test('normalizePayload ignores unknown fields', () => {
	const payload = normalizePayload({ name: 'Иван', evil: 'drop table', __proto__: { x: 1 } });
	assert.equal(payload.evil, undefined);
});

/* ---------------- anti-spam ---------------- */

test('a filled honeypot is spam', () => {
	assert.equal(spamReason(normalizePayload({ website: 'http://spam' })), 'honeypot');
});

test('submitting faster than a human could is spam', () => {
	const now = 1_000_000_000;
	const payload = normalizePayload({ form_started_at: now - (MIN_FILL_MS - 500) });
	assert.equal(spamReason(payload, now), 'too_fast');
});

test('a plausible fill time passes', () => {
	const now = 1_000_000_000;
	const payload = normalizePayload({ form_started_at: now - (MIN_FILL_MS + 5000) });
	assert.equal(spamReason(payload, now), null);
});

test('a very old form is treated as stale', () => {
	const now = 1_000_000_000;
	const payload = normalizePayload({ form_started_at: now - (MAX_FORM_AGE_MS + 1000) });
	assert.equal(spamReason(payload, now), 'stale_form');
});

test('a missing timestamp is not punished, and clock skew is tolerated', () => {
	const now = 1_000_000_000;
	assert.equal(spamReason(normalizePayload({}), now), null);
	assert.equal(spamReason(normalizePayload({ form_started_at: now + 60_000 }), now), null);
});

/* ---------------- idempotency key ---------------- */

test('isValidLeadId accepts a UUID and rejects anything else', () => {
	assert.equal(isValidLeadId('11111111-2222-4333-8444-555555555555'), true);
	assert.equal(isValidLeadId('not-a-uuid'), false);
	assert.equal(isValidLeadId(''), false);
	assert.equal(isValidLeadId(`1111${CR}`), false);
});

/* ---------------- logging ---------------- */

test('log lines carry correlation and outcome but never PII', () => {
	const line = buildLogLine({
		leadId: '11111111-2222-4333-8444-555555555555',
		event: 'sent',
		status: '200',
		attempt: 1
	});
	assert.ok(line.includes('lead_id=11111111-2222-4333-8444-555555555555'));
	assert.ok(line.includes('event=sent'));
	assert.ok(line.includes('status=200'));
	for (const forbidden of ['Иван', '+359', '@', 'Bearer']) {
		assert.ok(!line.includes(forbidden), `log must not contain ${forbidden}`);
	}
});

test('log lines cannot be split across lines by injected input', () => {
	const line = buildLogLine({ leadId: `abc${CR}${LF}fake=1`, event: 'dropped', status: 'honeypot' });
	assert.ok(!line.includes(CR));
	assert.ok(!line.includes(LF));
});

/* ---------------- truthfulness of generated copy ---------------- */

test('the notification never claims the lead was stored or guaranteed', () => {
	const payload = normalizePayload({ name: 'Иван', message: 'тест', intent: 'full_cost' });
	const { html, text } = buildEmail({
		payload,
		phone: '+359888123456',
		leadId: '11111111-2222-4333-8444-555555555555',
		receivedAt: '2026-08-09T00:00:00.000Z'
	});
	for (const claim of ['сохранена', 'сохранён', 'гарантируем', 'гарантирована']) {
		assert.ok(!html.includes(claim), `html must not claim: ${claim}`);
		assert.ok(!text.includes(claim), `text must not claim: ${claim}`);
	}
	assert.ok(html.includes('не хранит'), 'the notification states there is no stored copy');
});

test('intentLabel maps known codes and falls back safely', () => {
	assert.equal(intentLabel('object_viewing'), 'Просмотр объекта');
	assert.equal(intentLabel(''), 'Общий вопрос');
	assert.equal(intentLabel('unknown_code'), 'unknown_code');
});
