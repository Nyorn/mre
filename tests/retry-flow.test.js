/*
 * Retry-flow tests (P1 budget split + P2 instructed-retry timing).
 *
 * These pin two behaviours that are easy to regress and painful for a real
 * visitor: failing attempts must not consume the delivery allowance, and an
 * instructed retry must not immediately come back as "too fast".
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
	RATE_LIMIT_MAX,
	RAW_RATE_LIMIT_MAX,
	createRateLimiter
} from '../src/lib/server/rate-limit.js';
import { MIN_FILL_MS, normalizePayload, spamReason } from '../src/lib/server/lead.js';
import { RETRY_BACKDATE_MS, freshStartedAt, retryStartedAt } from '../src/lib/form-timing.js';

/* ---------------- A: failing attempts must not spend the delivery budget --- */

test('five failed attempts do not consume the delivery budget', () => {
	const raw = createRateLimiter({ max: RAW_RATE_LIMIT_MAX });
	const delivery = createRateLimiter({ max: RATE_LIMIT_MAX });
	const ip = '203.0.113.10';
	const now = 1_000_000;

	// Five requests that fail before reaching the provider: each charges the raw
	// budget and only peeks at the delivery budget.
	for (let i = 0; i < 5; i++) {
		assert.equal(raw.consume(ip, now).allowed, true, `raw attempt ${i + 1} allowed`);
		assert.equal(delivery.peek(ip, now).allowed, true, 'peeking must not charge');
	}

	// The sixth request is valid and reaches the provider.
	assert.equal(raw.consume(ip, now).allowed, true);
	const gate = delivery.peek(ip, now);
	assert.equal(gate.allowed, true, 'a valid enquiry after five failures must not be rate limited');
	delivery.consume(ip, now);
});

test('the delivery budget is spent only by confirmed sends', () => {
	const delivery = createRateLimiter({ max: RATE_LIMIT_MAX });
	const ip = '203.0.113.11';
	const now = 1_000_000;

	for (let i = 0; i < RATE_LIMIT_MAX; i++) {
		assert.equal(delivery.peek(ip, now).allowed, true);
		delivery.consume(ip, now); // simulate a successful send
	}
	assert.equal(delivery.peek(ip, now).allowed, false, 'the strict budget still applies to sends');
});

test('peek never changes the outcome of a later consume', () => {
	const limiter = createRateLimiter({ max: 2 });
	const ip = '203.0.113.12';
	const now = 1_000_000;
	for (let i = 0; i < 50; i++) limiter.peek(ip, now);
	assert.equal(limiter.consume(ip, now).allowed, true);
	assert.equal(limiter.consume(ip, now).allowed, true);
	assert.equal(limiter.consume(ip, now).allowed, false);
});

test('the raw budget is far higher than the delivery budget', () => {
	assert.ok(
		RAW_RATE_LIMIT_MAX > RATE_LIMIT_MAX * 4,
		'early junk must have much more headroom than confirmed sends'
	);
});

test('the raw budget still stops a flood of junk', () => {
	const raw = createRateLimiter({ max: RAW_RATE_LIMIT_MAX });
	const ip = '203.0.113.13';
	const now = 1_000_000;
	for (let i = 0; i < RAW_RATE_LIMIT_MAX; i++) raw.consume(ip, now);
	assert.equal(raw.consume(ip, now).allowed, false);
});

/* ---------------- B: instructed retry must not trip too_fast -------------- */

test('an immediate retry after 409 / stale / missing does not come back too_fast', () => {
	const now = 2_000_000_000;
	// The client restarts its window, then the visitor presses Отправить at once.
	const payload = normalizePayload({ form_started_at: retryStartedAt(now) });
	assert.equal(
		spamReason(payload, now),
		null,
		'doing exactly what the message says must not be punished'
	);
});

test('the naive reset this replaces would have been rejected', () => {
	const now = 2_000_000_000;
	const naive = normalizePayload({ form_started_at: freshStartedAt(now) });
	assert.equal(
		spamReason(naive, now),
		'too_fast',
		'this is the regression the backdated mark exists to prevent'
	);
});

test('the backdate clears the minimum fill time with margin', () => {
	assert.ok(
		RETRY_BACKDATE_MS > MIN_FILL_MS,
		'the retry mark must sit past the minimum fill time'
	);
});

test('a backdated retry mark is still fresh, not stale', () => {
	const now = 2_000_000_000;
	const payload = normalizePayload({ form_started_at: retryStartedAt(now) });
	assert.notEqual(spamReason(payload, now), 'stale_form');
});

test('a fresh window is still used for a genuinely new enquiry', () => {
	const now = 2_000_000_000;
	// After a real send the form starts over; typing takes time, so by the time
	// the visitor submits again the minimum fill has passed naturally.
	const started = freshStartedAt(now);
	const laterSubmit = now + MIN_FILL_MS + 1000;
	assert.equal(spamReason(normalizePayload({ form_started_at: started }), laterSubmit), null);
});
