/*
 * The deployment context, frozen at build time.
 *
 * `__NETLIFY_BUILD_CONTEXT__` is replaced with a string literal by the Vite
 * `define` in vite.config.js, so by the time this module runs on the server the
 * value is already baked in — no process.env lookup, and therefore nothing for
 * the Netlify function runtime to omit.
 *
 * The `typeof` guard is what lets node:test import this module directly: with
 * no bundler in play the identifier simply does not exist, and the guard yields
 * '' rather than a ReferenceError. Unit tests exercise the gate functions with
 * explicit context strings instead of relying on this constant.
 *
 * Not a secret. It holds a context name such as "production"; credentials are
 * never routed through the bundler.
 */
export const BUILD_CONTEXT =
	typeof __NETLIFY_BUILD_CONTEXT__ === 'string' ? __NETLIFY_BUILD_CONTEXT__ : '';
