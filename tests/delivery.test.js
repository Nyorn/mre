/*
 * Delivery + idempotency tests (P0).
 *
 * These drive the real delivery path with an injected Resend mock: no network,
 * no provider key, no email is ever sent. The mock behaves the way Resend
 * documents an idempotency key to behave — same key + same body collapses to
 * the original result, same key + different body is a 409 conflict.
 *
 *   npm test
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
	buildResendRequestBody,
	classifyResendOutcome,
	deliverLead,
	normalizePayload
} from '../src/lib/server/lead.js';

const LEAD_ID = '11111111-2222-4333-8444-555555555555';
const FROM = 'Sea Estate <leads@sea-estate.com>';
const TO = 'operator@example.com';

function samplePayload(overrides = {}) {
	return normalizePayload({
		name: 'Тест Тестов',
		phone: '+359888123456',
		message: 'Интересует объект',
		object_name: 'QA объект',
		object_id: 'SE-1',
		intent: 'full_cost',
		form_started_at: 1_000_000_000,
		...overrides
	});
}

/**
 * Minimal stand-in for Resend's idempotency semantics.
 * Records every call so tests can assert how many messages were created.
 */
function createResendMock() {
	const seen = new Map(); // Idempotency-Key -> body
	const calls = [];
	return {
		calls,
		created: () => seen.size,
		fetchImpl: async (url, init) => {
			const key = init.headers['Idempotency-Key'];
			const body = init.body;
			calls.push({ key, body });
			if (seen.has(key)) {
				// Same key, different bytes => conflict. Same bytes => original result.
				if (seen.get(key) !== body) return { status: 409, ok: false };
				return { status: 200, ok: true };
			}
			seen.set(key, body);
			return { status: 200, ok: true };
		}
	};
}

/* ---------------- byte stability ---------------- */

test('the Resend body is byte-identical for identical user data', () => {
	const a = buildResendRequestBody({
		payload: samplePayload(),
		phone: '+359888123456',
		leadId: LEAD_ID,
		from: FROM,
		to: TO
	});
	const b = buildResendRequestBody({
		payload: samplePayload(),
		phone: '+359888123456',
		leadId: LEAD_ID,
		from: FROM,
		to: TO
	});
	assert.equal(a, b, 'two builds of the same lead must produce the same bytes');
});

test('the Resend body stays stable across a clock change', async () => {
	const first = buildResendRequestBody({
		payload: samplePayload(),
		phone: '+359888123456',
		leadId: LEAD_ID,
		from: FROM,
		to: TO
	});
	await new Promise((r) => setTimeout(r, 25));
	const second = buildResendRequestBody({
		payload: samplePayload(),
		phone: '+359888123456',
		leadId: LEAD_ID,
		from: FROM,
		to: TO
	});
	assert.equal(first, second, 'nothing derived from the clock may enter the body');
});

test('the body carries no timestamp field at all', () => {
	const body = buildResendRequestBody({
		payload: samplePayload(),
		phone: '+359888123456',
		leadId: LEAD_ID,
		from: FROM,
		to: TO
	});
	assert.ok(!/Принято/.test(body), 'the misleading "Принято (UTC)" row must be gone');
	assert.ok(!/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(body), 'no ISO timestamp may appear');
});

test('different user data produces different bytes', () => {
	const base = buildResendRequestBody({
		payload: samplePayload(),
		phone: '+359888123456',
		leadId: LEAD_ID,
		from: FROM,
		to: TO
	});
	const edited = buildResendRequestBody({
		payload: samplePayload({ message: 'Другое сообщение' }),
		phone: '+359888123456',
		leadId: LEAD_ID,
		from: FROM,
		to: TO
	});
	assert.notEqual(base, edited);
});

/* ---------------- two repeated POSTs ---------------- */

test('repeat POST with identical payload does not create a second email', async () => {
	const resend = createResendMock();
	const args = {
		payload: samplePayload(),
		phone: '+359888123456',
		leadId: LEAD_ID,
		apiKey: 'test-key-not-real',
		from: FROM,
		to: TO,
		fetchImpl: resend.fetchImpl
	};

	const first = await deliverLead(args);
	const second = await deliverLead({ ...args, payload: samplePayload() });

	assert.equal(first.outcome, 'sent');
	assert.equal(second.outcome, 'sent', 'an identical retry must not look like a failure');
	assert.equal(resend.calls.length, 2, 'both attempts reach the provider');
	assert.equal(resend.created(), 1, 'but only one message is created');
	assert.equal(resend.calls[0].body, resend.calls[1].body, 'identical bytes on both attempts');
	assert.equal(resend.calls[0].key, resend.calls[1].key, 'same idempotency key');
});

test('repeat POST with modified payload and the same lead_id reports a conflict, not a failure', async () => {
	const resend = createResendMock();
	const args = {
		payload: samplePayload(),
		phone: '+359888123456',
		leadId: LEAD_ID,
		apiKey: 'test-key-not-real',
		from: FROM,
		to: TO,
		fetchImpl: resend.fetchImpl
	};

	const first = await deliverLead(args);
	const second = await deliverLead({
		...args,
		payload: samplePayload({ message: 'Передумал: интересует другой объект' })
	});

	assert.equal(first.outcome, 'sent');
	assert.equal(
		second.outcome,
		'conflict_modified',
		'an edited resubmission is neither a duplicate nor a delivery failure'
	);
	assert.equal(resend.created(), 1, 'the edit must not silently create a second message');
});

test('a modified payload under a NEW lead_id does create a second email', async () => {
	const resend = createResendMock();
	const base = {
		phone: '+359888123456',
		apiKey: 'test-key-not-real',
		from: FROM,
		to: TO,
		fetchImpl: resend.fetchImpl
	};

	await deliverLead({ ...base, payload: samplePayload(), leadId: LEAD_ID });
	const second = await deliverLead({
		...base,
		payload: samplePayload({ message: 'Отредактировано' }),
		leadId: '99999999-8888-4777-8666-555555555555'
	});

	assert.equal(second.outcome, 'sent');
	assert.equal(resend.created(), 2, 'a new lead id is how an edited enquiry gets sent');
});

/* ---------------- outcome classification ---------------- */

test('classifyResendOutcome maps provider statuses to honest outcomes', () => {
	assert.equal(classifyResendOutcome(200), 'sent');
	assert.equal(classifyResendOutcome(202), 'sent');
	assert.equal(classifyResendOutcome(409), 'conflict_modified');
	assert.equal(classifyResendOutcome(429), 'retryable');
	assert.equal(classifyResendOutcome(500), 'retryable');
	assert.equal(classifyResendOutcome(503), 'retryable');
	assert.equal(classifyResendOutcome(422), 'permanent');
	assert.equal(classifyResendOutcome(401), 'permanent');
});

test('a network failure is reported as unreachable, never as sent', async () => {
	const result = await deliverLead({
		payload: samplePayload(),
		phone: '+359888123456',
		leadId: LEAD_ID,
		apiKey: 'test-key-not-real',
		from: FROM,
		to: TO,
		fetchImpl: async () => {
			throw new Error('network down');
		}
	});
	assert.equal(result.outcome, 'unreachable');
});

test('the provider key is sent as a header and never inside the body', async () => {
	let captured;
	await deliverLead({
		payload: samplePayload(),
		phone: '+359888123456',
		leadId: LEAD_ID,
		apiKey: 'test-key-not-real',
		from: FROM,
		to: TO,
		fetchImpl: async (url, init) => {
			captured = init;
			return { status: 200, ok: true };
		}
	});
	assert.equal(captured.headers.Authorization, 'Bearer test-key-not-real');
	assert.ok(!captured.body.includes('test-key-not-real'), 'key must not leak into the body');
	assert.equal(captured.headers['Idempotency-Key'], LEAD_ID);
});
