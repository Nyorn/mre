/*
 * Contentful Delivery API client.
 *
 * SECURITY — why $env/dynamic/private, and why never $env/static/private.
 *
 * `$env/static/private` is inlined by the bundler at build time. That is what
 * put a live Delivery token as a string literal into
 * `.netlify/server/chunks/contentful-fetch.js`, a tracked file, so the token
 * shipped in every clone. It must not come back.
 *
 * `$env/dynamic/private` is read from the process at request time, so the built
 * artifact contains a property lookup and never a value. It stays server-only:
 * SvelteKit refuses to import it from client code.
 *
 * RUNTIME FALLBACK. On the live deploy preview the catalog returned 500 while
 * the same code worked when the values were passed to `server.init()` locally.
 * SvelteKit's dynamic env is populated from whatever the adapter hands to
 * `init()`, so anything that does not reach that object leaves `env` empty even
 * though `process.env` has it. Reading `process.env` as a second source costs
 * nothing, is still runtime-only, and inlines nothing — the two lookups are
 * equivalent in secrecy and differ only in plumbing.
 *
 * Data contract: unchanged on success. On failure the shape now carries `status`
 * and a machine-readable `code` so a route can tell "CMS unreachable" from
 * "no such object" — see resolveCmsFailure below. No response body, header or
 * credential is ever included in what is returned or logged.
 */
import { env } from '$env/dynamic/private';

/** Never logged, never returned — only used to decide config vs auth failure. */
function readCredentials() {
	const fromDynamic = (key) => (env && env[key]) || '';
	const fromProcess = (key) =>
		(typeof process !== 'undefined' && process.env && process.env[key]) || '';

	return {
		spaceId: fromDynamic('CONTENTFUL_SPACE_ID') || fromProcess('CONTENTFUL_SPACE_ID'),
		accessToken: fromDynamic('CONTENTFUL_ACCESS_TOKEN') || fromProcess('CONTENTFUL_ACCESS_TOKEN')
	};
}

/**
 * Failure codes a route may branch on. Deliberately coarse: enough to choose a
 * message and an HTTP status, never enough to describe the credential.
 */
export const CMS_ERROR = {
	NOT_CONFIGURED: 'cms_not_configured',
	UNAUTHORIZED: 'cms_unauthorized',
	UNAVAILABLE: 'cms_unavailable',
	MALFORMED: 'cms_malformed_response'
};

export const contentfulFetch = async (query) => {
	const { spaceId, accessToken } = readCredentials();

	/*
	 * Fail closed, and say which variable is missing — never what it holds.
	 * A preview without credentials lands here rather than sending an
	 * unauthenticated request and reporting a confusing 401.
	 */
	if (!spaceId || !accessToken) {
		const missing = [
			!spaceId && 'CONTENTFUL_SPACE_ID',
			!accessToken && 'CONTENTFUL_ACCESS_TOKEN'
		].filter(Boolean);

		console.error(`Contentful is not configured: missing ${missing.join(', ')}`);
		return {
			ok: false,
			status: 0,
			code: CMS_ERROR.NOT_CONFIGURED,
			error: `Contentful is not configured: missing ${missing.join(', ')}`
		};
	}

	const url = `https://graphql.contentful.com/content/v1/spaces/${spaceId}`;

	try {
		const response = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${accessToken}`
			},
			body: JSON.stringify({ query })
		});

		const jsonResponse = await response.json().catch(() => null);

		if (!jsonResponse || !jsonResponse.data) {
			/*
			 * Status is carried through so the server can distinguish a revoked
			 * key (401/403) from an outage (5xx) without anyone reading a log.
			 * The response body is deliberately NOT included: Contentful echoes
			 * the request in error payloads, and that used to be console.logged
			 * in full on every call, pushing request context into the log sink.
			 */
			const code =
				response.status === 401 || response.status === 403
					? CMS_ERROR.UNAUTHORIZED
					: response.status >= 500
						? CMS_ERROR.UNAVAILABLE
						: CMS_ERROR.MALFORMED;

			console.error(
				`Contentful returned no data (status ${response.status} ${response.statusText}, code ${code})`
			);

			return {
				ok: false,
				status: response.status,
				statusText: response.statusText,
				code,
				error: 'Данные отсутствуют в ответе'
			};
		}

		return {
			ok: response.ok,
			status: response.status,
			statusText: response.statusText,
			data: jsonResponse.data
		};
	} catch (error) {
		// Network/parse failure. The message does not carry the token.
		console.error('Ошибка при выполнении запроса к Contentful:', error?.message || 'unknown');
		return {
			ok: false,
			status: 0,
			code: CMS_ERROR.UNAVAILABLE,
			error: 'Нет связи с CMS'
		};
	}
};

/**
 * Turn a failed contentfulFetch result into what a page needs to render an
 * honest, accessible state. Never exposes credentials, headers or bodies.
 *
 * @param {{ok?: boolean, status?: number, code?: string}} response
 */
export function resolveCmsFailure(response) {
	const code = response?.code || CMS_ERROR.UNAVAILABLE;

	// One visitor-facing sentence per cause. No blame, no jargon, no promises.
	const message =
		code === CMS_ERROR.NOT_CONFIGURED || code === CMS_ERROR.UNAUTHORIZED
			? 'Каталог временно недоступен: не удалось подключиться к системе управления объектами.'
			: 'Каталог временно недоступен: система управления объектами не отвечает.';

	return {
		code,
		// Kept for operators reading the page source or a screenshot; harmless.
		status: Number.isFinite(response?.status) ? response.status : 0,
		message
	};
}
