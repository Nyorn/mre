/*
 * Conservative in-process rate limit (P1).
 *
 * WHAT THIS IS: a cheap brake on unsophisticated repeat POSTing from one
 * address against one server instance.
 *
 * WHAT THIS IS NOT — and this must not be oversold to anyone:
 *   - It is per-process. Netlify runs SSR as functions across many short-lived
 *     instances, so the counter resets on cold start and is not shared between
 *     concurrent instances. Real throughput can exceed the nominal limit by a
 *     factor of however many instances are warm.
 *   - It therefore does nothing against distributed abuse from many addresses.
 *   - It is not a CAPTCHA and not a WAF. Turnstile and a durable store are
 *     deliberately NOT added here; both are Kim's decision.
 *
 * FAIL MODE — explicit: when the client address cannot be determined the
 * limiter FAILS OPEN (the request is allowed). Failing closed would block real
 * visitors behind proxies we do not recognise, and this control is a brake, not
 * a security boundary. Requests with no resolvable address are counted in one
 * shared bucket so a flood of address-less requests is still slowed.
 */

/*
 * TWO BUDGETS, on purpose.
 *
 * The strict budget protects the expensive thing: attempts that actually reach
 * the provider. It is consumed only by a confirmed send.
 *
 * The raw budget is much higher and is consumed by every request. It exists to
 * slow a flood of junk (bad JSON, failed validation, tripped timing checks)
 * without letting that junk eat the delivery allowance.
 *
 * Keeping these separate matters for a real person, not just for bots: someone
 * who mistypes their phone five times, or whose form goes stale, must still be
 * able to send the enquiry afterwards. Charging those failures to the delivery
 * budget would lock a legitimate visitor out of the one action that matters.
 */

/** Confirmed sends allowed per address inside the window. */
export const RATE_LIMIT_MAX = 5;

/** Total requests of any kind allowed per address inside the window. */
export const RAW_RATE_LIMIT_MAX = 40;

/** Sliding window length, shared by both budgets. */
export const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;

/** Hard cap on tracked addresses, so the map cannot grow without bound. */
export const RATE_LIMIT_MAX_KEYS = 5000;

/** Bucket used when no address could be resolved (see FAIL MODE above). */
export const UNKNOWN_KEY = 'unknown';

/** Only inspect this many X-Forwarded-For entries; the rest is noise or spoof. */
const MAX_XFF_ENTRIES = 10;

const IPV4 = /^\d{1,3}(\.\d{1,3}){3}$/;

function looksLikeIp(value) {
	if (!value) return false;
	if (IPV4.test(value)) {
		return value.split('.').every((part) => Number(part) <= 255);
	}
	// Loose IPv6 check: hex groups and colons only, at least one colon.
	return /^[0-9a-f:]+$/i.test(value) && value.includes(':');
}

/**
 * Strip a `:port` suffix, but only from IPv4.
 *
 * A blanket /:\d+$/ would corrupt IPv6: `2001:db8::1` would become `2001:db8:`
 * and then fail validation, silently dropping every IPv6 client into the shared
 * unknown bucket. Exactly one colon means host:port; more means IPv6.
 */
function stripIpv4Port(value) {
	const colons = (value.match(/:/g) || []).length;
	return colons === 1 ? value.replace(/:\d+$/, '') : value;
}

/**
 * Resolve the client address from proxy headers.
 *
 * On Netlify the platform appends the real peer to X-Forwarded-For, so the
 * LAST entry is the one the platform observed and the only one a client cannot
 * forge by sending its own X-Forwarded-For. Taking the first entry — the usual
 * mistake — would let any caller pick its own rate-limit bucket, which makes
 * the limiter worthless.
 */
export function clientKeyFromHeaders(headers) {
	const get = (name) => {
		if (!headers) return '';
		const value = typeof headers.get === 'function' ? headers.get(name) : headers[name];
		return (value || '').toString().trim();
	};

	// Netlify's own header is a single unforgeable value when present.
	const nfClient = get('x-nf-client-connection-ip');
	if (looksLikeIp(nfClient)) return nfClient;

	const xff = get('x-forwarded-for');
	if (xff) {
		const parts = xff
			.split(',')
			.slice(-MAX_XFF_ENTRIES)
			.map((p) => p.trim().replace(/^\[|\]$/g, ''))
			.filter(Boolean);
		for (let i = parts.length - 1; i >= 0; i--) {
			const candidate = stripIpv4Port(parts[i]);
			if (looksLikeIp(candidate)) return candidate;
		}
	}

	const real = get('x-real-ip');
	if (looksLikeIp(real)) return real;

	return UNKNOWN_KEY;
}

/** Create an isolated limiter. Tests get their own; the endpoint holds one. */
export function createRateLimiter({
	max = RATE_LIMIT_MAX,
	windowMs = RATE_LIMIT_WINDOW_MS,
	maxKeys = RATE_LIMIT_MAX_KEYS
} = {}) {
	/** @type {Map<string, number[]>} key -> timestamps inside the window */
	const hits = new Map();

	function prune(now) {
		for (const [key, stamps] of hits) {
			const live = stamps.filter((t) => now - t < windowMs);
			if (live.length === 0) hits.delete(key);
			else hits.set(key, live);
		}
	}

	/** Shared logic; `record` decides whether the attempt is charged. */
	function evaluate(key, now, record) {
		const bucket = key || UNKNOWN_KEY;

		if (hits.size >= maxKeys && !hits.has(bucket)) {
			prune(now);
			// Still full after pruning: fail open rather than deny real visitors.
			if (hits.size >= maxKeys) {
				return { allowed: true, remaining: 0, retryAfterSeconds: 0, degraded: true };
			}
		}

		const stamps = (hits.get(bucket) || []).filter((t) => now - t < windowMs);

		if (stamps.length >= max) {
			const oldest = stamps[0];
			const retryAfterSeconds = Math.max(1, Math.ceil((windowMs - (now - oldest)) / 1000));
			hits.set(bucket, stamps);
			return { allowed: false, remaining: 0, retryAfterSeconds };
		}

		if (record) stamps.push(now);
		hits.set(bucket, stamps);
		return { allowed: true, remaining: max - stamps.length, retryAfterSeconds: 0 };
	}

	return {
		/**
		 * Ask whether an attempt would be allowed WITHOUT charging it.
		 * Used for the delivery budget, which is only charged on a real send.
		 */
		peek(key, now = Date.now()) {
			return evaluate(key, now, false);
		},

		/** Charge one attempt against the budget and report the outcome. */
		consume(key, now = Date.now()) {
			return evaluate(key, now, true);
		},

		/** Test helper. */
		size() {
			return hits.size;
		}
	};
}
