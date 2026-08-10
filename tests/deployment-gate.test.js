import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
	readContext,
	isProductionContext,
	isDeployPreviewContext,
	resolveAnalyticsGate
} from '../src/lib/deployment-gate.js';
import { resolvePreviewGate } from '../src/lib/preview-comparer.js';
import { BUILD_CONTEXT } from '../src/lib/build-context.js';

/* ---------------------------------------------------------------------------
 * Analytics — fails closed everywhere except a real production deploy
 * ------------------------------------------------------------------------ */

test('production is the only context that loads analytics', () => {
	assert.equal(resolveAnalyticsGate('production'), true);
});

test('a deploy preview sends nothing to the production property', () => {
	// This is the concrete leak: preview URLs carry ?preview_theme=, and those
	// were landing in production GA.
	assert.equal(resolveAnalyticsGate('deploy-preview'), false);
});

test('every other context fails closed', () => {
	for (const context of ['branch-deploy', 'dev', 'staging', 'preview', '', 'PRODUCTION_LIKE']) {
		assert.equal(
			resolveAnalyticsGate(context),
			false,
			`context "${context}" should not enable analytics`
		);
	}
	assert.equal(resolveAnalyticsGate(''), false);
	assert.equal(resolveAnalyticsGate(), false);
	assert.equal(resolveAnalyticsGate(undefined), false);
});

test('an unknown future context cannot start reporting by default', () => {
	assert.equal(resolveAnalyticsGate('edge-canary-2029'), false);
});

test('the production context is matched exactly, not by prefix', () => {
	assert.equal(resolveAnalyticsGate('production-mirror'), false);
	assert.equal(resolveAnalyticsGate('not-production'), false);
});

test('case and padding from CI are tolerated', () => {
	assert.equal(resolveAnalyticsGate(' Production '), true);
	assert.equal(readContext(' Deploy-Preview '), 'deploy-preview');
});

test('context predicates agree with the raw reader', () => {
	assert.equal(isProductionContext('production'), true);
	assert.equal(isProductionContext('deploy-preview'), false);
	assert.equal(isDeployPreviewContext('deploy-preview'), true);
	assert.equal(isDeployPreviewContext('production'), false);
	assert.equal(readContext(), '');
});

/* ---------------------------------------------------------------------------
 * Preview comparer — the local override must be unreachable from any build
 * ------------------------------------------------------------------------ */

test('production still vetoes the comparer, dev flag or not', () => {
	assert.equal(resolvePreviewGate('production', { dev: true }), false);
	assert.equal(
		resolvePreviewGate('production', { dev: true, override: 'true' }),
		false
	);
});

test('a deploy preview enables the comparer without any override', () => {
	assert.equal(resolvePreviewGate('deploy-preview', { dev: false }), true);
});

test('the override works under a genuine vite dev', () => {
	assert.equal(
		resolvePreviewGate('', { dev: true, override: 'true' }),
		true
	);
});

test('the override is dead in every deployed context', () => {
	/*
	 * `dev` is compiled to false in any built artifact, so this is the property
	 * that matters: setting the variable on a branch deploy, on `netlify dev`,
	 * on a self-hosted build or on an unknown context does nothing.
	 */
	for (const context of ['branch-deploy', 'dev', 'staging', '', 'edge-canary-2029']) {
		assert.equal(
			resolvePreviewGate(context, { dev: false, override: 'true' }),
			false,
			`override must not be reachable with CONTEXT="${context}" in a build`
		);
	}
});

test('omitting the runtime argument defaults to not-dev', () => {
	// A caller that forgets to pass `dev` must get the safe answer.
	assert.equal(resolvePreviewGate('', { override: 'true' }), false);
	assert.equal(resolvePreviewGate('deploy-preview'), true);
});

test('dev must be exactly true, not merely truthy', () => {
	for (const value of ['true', 1, {}, 'yes']) {
		assert.equal(
			resolvePreviewGate('', { dev: value, override: 'true' }),
			false,
			`dev=${JSON.stringify(value)} must not unlock the override`
		);
	}
});

test('the override still needs the exact string true under dev', () => {
	assert.equal(resolvePreviewGate('', { dev: true, override: '1' }), false);
	assert.equal(resolvePreviewGate('', { dev: true, override: 'TRUE' }), false);
	assert.equal(resolvePreviewGate('', { dev: true }), false);
});

/* ---------------------------------------------------------------------------
 * The two gates are independent
 * ------------------------------------------------------------------------ */

test('a deploy preview shows the comparer and sends no analytics', () => {
	assert.equal(resolvePreviewGate('deploy-preview', { dev: false }), true);
	assert.equal(resolveAnalyticsGate('deploy-preview'), false);
});

test('production sends analytics and shows no comparer', () => {
	assert.equal(resolvePreviewGate('production', { dev: false }), false);
	assert.equal(resolveAnalyticsGate('production'), true);
});

test('no context enables both at once', () => {
	for (const context of ['production', 'deploy-preview', 'branch-deploy', 'dev', '', 'unknown']) {
		for (const dev of [true, false]) {
			const both =
				resolvePreviewGate(context, { dev, override: 'true' }) && resolveAnalyticsGate(context);
			assert.equal(both, false, `comparer + analytics both on for "${context}" (dev=${dev})`);
		}
	}
});

/* ---------------------------------------------------------------------------
 * The runtime-context bug this contract exists to prevent
 * ------------------------------------------------------------------------ */

test('the gates take a context value, not an env object', () => {
	/*
	 * The regression, in one assertion. These used to read env.CONTEXT from
	 * $env/dynamic/private; Netlify does not put CONTEXT in the SSR function's
	 * runtime env, so on a real deploy they saw nothing. Passing the old shape
	 * must now read as "no context" rather than quietly working in tests while
	 * failing in production.
	 */
	assert.equal(resolveAnalyticsGate({ CONTEXT: 'production' }), false);
	assert.equal(resolvePreviewGate({ CONTEXT: 'deploy-preview' }, { dev: false }), false);
});

test('an absent context disables analytics AND the comparer', () => {
	// What the deployed site actually did before the fix.
	assert.equal(resolveAnalyticsGate(''), false);
	assert.equal(resolvePreviewGate('', { dev: false }), false);
});

test('the build-time constant defaults to empty outside a bundler', () => {
	// node:test has no Vite define, so the module must not throw on import.
	assert.equal(typeof BUILD_CONTEXT, 'string');
});
