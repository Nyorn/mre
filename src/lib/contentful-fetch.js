/*
 * Contentful Delivery API client.
 *
 * SECURITY — why $env/dynamic/private and not $env/static/private.
 *
 * `$env/static/private` is inlined by the bundler at build time. That is what
 * put a live Delivery token as a string literal into
 * `.netlify/server/chunks/contentful-fetch.js`, which was a tracked file in this
 * repository. The token was readable by anyone with repo access and travelled
 * with every clone.
 *
 * `$env/dynamic/private` is read from the process at request time. The built
 * artifact contains a property lookup, never the value, so no build output can
 * leak the credential again. It is still server-only: SvelteKit refuses to
 * import it from client code, so this cannot reach the browser bundle.
 *
 * The build no longer fails when the variables are absent, which is also why a
 * placeholder-free `npm run build` now works. Absence is handled here instead,
 * at the point where it actually matters.
 *
 * Data contract is unchanged: same signature, same success and failure shapes.
 * Callers in routes/objects/*, routes/api/getGallery need no edit.
 */
import { env } from '$env/dynamic/private';

export const contentfulFetch = async (query) => {
	const spaceId = env.CONTENTFUL_SPACE_ID;
	const accessToken = env.CONTENTFUL_ACCESS_TOKEN;

	/*
	 * Fail closed and say which variable is missing — never what it contains.
	 * A deploy preview without Contentful credentials lands here rather than
	 * sending an unauthenticated request and reporting a confusing 401.
	 */
	if (!spaceId || !accessToken) {
		const missing = [
			!spaceId && 'CONTENTFUL_SPACE_ID',
			!accessToken && 'CONTENTFUL_ACCESS_TOKEN'
		].filter(Boolean);

		console.error(`Contentful is not configured: missing ${missing.join(', ')}`);
		return { ok: false, error: `Contentful is not configured: missing ${missing.join(', ')}` };
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

		const jsonResponse = await response.json();

		if (!jsonResponse.data) {
			/*
			 * Deliberately not dumping the whole response. Contentful echoes the
			 * request in its error payloads, and this used to console.log the
			 * entire object on every call — in a serverless log that is both
			 * noisy and a way for request context to end up in a log sink.
			 */
			console.error(
				`Contentful response carried no data (status ${response.status} ${response.statusText})`
			);
			return { ok: false, error: 'Данные отсутствуют в ответе' };
		}

		return {
			ok: response.ok,
			status: response.status,
			statusText: response.statusText,
			data: jsonResponse.data
		};
	} catch (error) {
		// error here is a network/parse failure; it does not carry the token.
		console.error('Ошибка при выполнении запроса к Contentful:', error?.message || error);
		return { ok: false, error };
	}
};
