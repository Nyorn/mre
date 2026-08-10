import { sveltekit } from '@sveltejs/kit/vite';

/*
 * Deployment context, captured at BUILD time.
 *
 * Netlify sets CONTEXT ("production" | "deploy-preview" | "branch-deploy" |
 * "dev") for the build, and it is fixed for the life of that deploy. It is NOT
 * present in the SSR function's runtime process.env, which is what
 * `$env/dynamic/private` reads — so gates that consulted dynamic env resolved
 * against an empty value on a real deploy. Confirmed against the live deploy
 * preview for PR #3: the comparer never appeared, and by the same mechanism a
 * production deploy would have shipped with GA/GTM switched off.
 *
 * A Vite `define` inlines the value into the bundle at build time, which is
 * exactly the right lifetime for a per-deploy constant. `$env/static/private`
 * would also inline it, but it hard-fails the build when the variable is
 * absent, and CONTEXT is absent every time someone builds locally. Falling back
 * to '' here keeps local builds working and fails closed.
 *
 * This value is NOT a secret — it is a deploy-context name like "production".
 * Credentials must never travel this way: Contentful stays on
 * `$env/dynamic/private` so no token can be inlined into a build artifact.
 */
const NETLIFY_BUILD_CONTEXT = process.env.CONTEXT ?? '';

const config = {
	plugins: [sveltekit()],
	define: {
		__NETLIFY_BUILD_CONTEXT__: JSON.stringify(NETLIFY_BUILD_CONTEXT)
	},
	ssr: {
		noExternal: ['@splidejs/splide-shader-carousel']
	}
};

export default config;
