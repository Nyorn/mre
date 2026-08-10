/*
 * Rate limiter tests (P1).
 *
 * The limiter is a brake, not a boundary — see rate-limit.js. These tests pin
 * the behaviour that matters: the bucket cannot be chosen by the caller, the
 * window actually expires, and unknown addresses fail OPEN into a shared bucket.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
	RATE_LIMIT_MAX,
	RATE_LIMIT_WINDOW_MS,
	UNKNOWN_KEY,
	clientKeyFromHeaders,
	createRateLimiter
} from '../src/lib/server/rate-limit.js';

function headers(map) {
	return { get: (name) => map[name.toLowerCase()] ?? null };
}

/* ---------------- address resolution ---------------- */

test('the platform header wins when present', () => {
	const key = clientKeyFromHeaders(
		headers({ 'x-nf-client-connection-ip': '203.0.113.9', 'x-forwarded-for': '1.2.3.4' })
	);
	assert.equal(key, '203.0.113.9');
});

test('a client cannot pick its own bucket by prepending X-Forwarded-For', () => {
	// The spoofed value is first; the address the proxy observed is last.
	const key = clientKeyFromHeaders(
		headers({ 'x-forwarded-for': '9.9.9.9, 203.0.113.9' })
	);
	assert.equal(key, '203.0.113.9', 'the rightmost entry is the one a client cannot forge');
});

test('a single-entry X-Forwarded-For still resolves', () => {
	assert.equal(clientKeyFromHeaders(headers({ 'x-forwarded-for': '198.51.100.7' })), '198.51.100.7');
});

test('junk and missing headers fall back to the shared unknown bucket', () => {
	assert.equal(clientKeyFromHeaders(headers({})), UNKNOWN_KEY);
	assert.equal(clientKeyFromHeaders(headers({ 'x-forwarded-for': 'not-an-ip' })), UNKNOWN_KEY);
	assert.equal(clientKeyFromHeaders(null), UNKNOWN_KEY);
});

test('an IPv4 port suffix is stripped and IPv6 is accepted', () => {
	assert.equal(clientKeyFromHeaders(headers({ 'x-forwarded-for': '198.51.100.7:51234' })), '198.51.100.7');
	assert.equal(
		clientKeyFromHeaders(headers({ 'x-forwarded-for': '2001:db8::1' })),
		'2001:db8::1'
	);
});

test('an out-of-range octet is not treated as an address', () => {
	assert.equal(clientKeyFromHeaders(headers({ 'x-forwarded-for': '999.1.1.1' })), UNKNOWN_KEY);
});

/* ---------------- limiting ---------------- */

test('requests are allowed up to the limit and refused after it', () => {
	const limiter = createRateLimiter();
	const now = 1_000_000;
	for (let i = 0; i < RATE_LIMIT_MAX; i++) {
		assert.equal(limiter.consume('203.0.113.9', now).allowed, true, `attempt ${i + 1} should pass`);
	}
	const blocked = limiter.consume('203.0.113.9', now);
	assert.equal(blocked.allowed, false);
	assert.ok(blocked.retryAfterSeconds > 0, 'a refusal tells the caller when to come back');
});

test('the window expires', () => {
	const limiter = createRateLimiter();
	const now = 1_000_000;
	for (let i = 0; i < RATE_LIMIT_MAX; i++) limiter.consume('203.0.113.9', now);
	assert.equal(limiter.consume('203.0.113.9', now).allowed, false);
	const later = now + RATE_LIMIT_WINDOW_MS + 1;
	assert.equal(limiter.consume('203.0.113.9', later).allowed, true, 'the window must slide');
});

test('addresses are limited independently', () => {
	const limiter = createRateLimiter();
	const now = 1_000_000;
	for (let i = 0; i < RATE_LIMIT_MAX; i++) limiter.consume('203.0.113.9', now);
	assert.equal(limiter.consume('203.0.113.9', now).allowed, false);
	assert.equal(limiter.consume('198.51.100.7', now).allowed, true, 'one abuser must not block others');
});

test('address-less requests share one bucket rather than bypassing the limit', () => {
	const limiter = createRateLimiter();
	const now = 1_000_000;
	for (let i = 0; i < RATE_LIMIT_MAX; i++) limiter.consume(UNKNOWN_KEY, now);
	assert.equal(limiter.consume(UNKNOWN_KEY, now).allowed, false);
});

test('the tracked-key map is bounded and degrades open, not closed', () => {
	const limiter = createRateLimiter({ maxKeys: 3, max: 1 });
	const now = 1_000_000;
	limiter.consume('1.1.1.1', now);
	limiter.consume('2.2.2.2', now);
	limiter.consume('3.3.3.3', now);
	const overflow = limiter.consume('4.4.4.4', now);
	assert.equal(overflow.allowed, true, 'a full table must not start rejecting real visitors');
	assert.ok(limiter.size() <= 3);
});
