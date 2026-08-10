import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
	readContext,
	isProductionContext,
	isDeployPreviewContext,
	resolveAnalyticsGate
} from '../src/lib/deployment-gate.js';
import { resolvePreviewGate } from '../src/lib/preview-comparer.js';

/* ---------------------------------------------------------------------------
 * Analytics — fails closed everywhere except a real production deploy
 * ------------------------------------------------------------------------ */

test('production is the only context that loads analytics', () => {
	assert.equal(resolveAnalyticsGate({ CONTEXT: 'production' }), true);
});

test('a deploy preview sends nothing to the production property', () => {
	// This is the concrete leak: preview URLs carry ?preview_theme=, and those
	// were landing in production GA.
	assert.equal(resolveAnalyticsGate({ CONTEXT: 'deploy-preview' }), false);
});

test('every other context fails closed', () => {
	for (const context of ['branch-deploy', 'dev', 'staging', 'preview', '', 'PRODUCTION_LIKE']) {
		assert.equal(
			resolveAnalyticsGate({ CONTEXT: context }),
			false,
			`context "${context}" should not enable analytics`
		);
	}
	assert.equal(resolveAnalyticsGate({}), false);
	assert.equal(resolveAnalyticsGate(), false);
	assert.equal(resolveAnalyticsGate({ CONTEXT: undefined }), false);
});

test('an unknown future context cannot start reporting by default', () => {
	assert.equal(resolveAnalyticsGate({ CONTEXT: 'edge-canary-2029' }), false);
});

test('the production context is matched exactly, not by prefix', () => {
	assert.equal(resolveAnalyticsGate({ CONTEXT: 'production-mirror' }), false);
	assert.equal(resolveAnalyticsGate({ CONTEXT: 'not-production' }), false);
});

test('case and padding from CI are tolerated', () => {
	assert.equal(resolveAnalyticsGate({ CONTEXT: ' Production ' }), true);
	assert.equal(readContext({ CONTEXT: ' Deploy-Preview ' }), 'deploy-preview');
});

test('context predicates agree with the raw reader', () => {
	assert.equal(isProductionContext({ CONTEXT: 'production' }), true);
	assert.equal(isProductionContext({ CONTEXT: 'deploy-preview' }), false);
	assert.equal(isDeployPreviewContext({ CONTEXT: 'deploy-preview' }), true);
	assert.equal(isDeployPreviewContext({ CONTEXT: 'production' }), false);
	assert.equal(readContext(), '');
});

/* ---------------------------------------------------------------------------
 * Preview comparer — the local override must be unreachable from any build
 * ------------------------------------------------------------------------ */

test('production still vetoes the comparer, dev flag or not', () => {
	assert.equal(resolvePreviewGate({ CONTEXT: 'production' }, { dev: true }), false);
	assert.equal(
		resolvePreviewGate(
			{ CONTEXT: 'production', SEA_ESTATE_PREVIEW_COMPARER: 'true' },
			{ dev: true }
		),
		false
	);
});

test('a deploy preview enables the comparer without any override', () => {
	assert.equal(resolvePreviewGate({ CONTEXT: 'deploy-preview' }, { dev: false }), true);
});

test('the override works under a genuine vite dev', () => {
	assert.equal(
		resolvePreviewGate({ SEA_ESTATE_PREVIEW_COMPARER: 'true' }, { dev: true }),
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
			resolvePreviewGate({ CONTEXT: context, SEA_ESTATE_PREVIEW_COMPARER: 'true' }, { dev: false }),
			false,
			`override must not be reachable with CONTEXT="${context}" in a build`
		);
	}
});

test('omitting the runtime argument defaults to not-dev', () => {
	// A caller that forgets to pass `dev` must get the safe answer.
	assert.equal(resolvePreviewGate({ SEA_ESTATE_PREVIEW_COMPARER: 'true' }), false);
	assert.equal(resolvePreviewGate({ CONTEXT: 'deploy-preview' }), true);
});

test('dev must be exactly true, not merely truthy', () => {
	for (const value of ['true', 1, {}, 'yes']) {
		assert.equal(
			resolvePreviewGate({ SEA_ESTATE_PREVIEW_COMPARER: 'true' }, { dev: value }),
			false,
			`dev=${JSON.stringify(value)} must not unlock the override`
		);
	}
});

test('the override still needs the exact string true under dev', () => {
	assert.equal(resolvePreviewGate({ SEA_ESTATE_PREVIEW_COMPARER: '1' }, { dev: true }), false);
	assert.equal(resolvePreviewGate({ SEA_ESTATE_PREVIEW_COMPARER: 'TRUE' }, { dev: true }), false);
	assert.equal(resolvePreviewGate({}, { dev: true }), false);
});

/* ---------------------------------------------------------------------------
 * The two gates are independent
 * ------------------------------------------------------------------------ */

test('a deploy preview shows the comparer and sends no analytics', () => {
	const env = { CONTEXT: 'deploy-preview' };
	assert.equal(resolvePreviewGate(env, { dev: false }), true);
	assert.equal(resolveAnalyticsGate(env), false);
});

test('production sends analytics and shows no comparer', () => {
	const env = { CONTEXT: 'production' };
	assert.equal(resolvePreviewGate(env, { dev: false }), false);
	assert.equal(resolveAnalyticsGate(env), true);
});

test('no context enables both at once', () => {
	for (const context of ['production', 'deploy-preview', 'branch-deploy', 'dev', '', 'unknown']) {
		const env = { CONTEXT: context, SEA_ESTATE_PREVIEW_COMPARER: 'true' };
		for (const dev of [true, false]) {
			const both = resolvePreviewGate(env, { dev }) && resolveAnalyticsGate(env);
			assert.equal(both, false, `comparer + analytics both on for "${context}" (dev=${dev})`);
		}
	}
});
