<script>
	/*
	 * Static hero. Replaces the 5-slide Splide/Three.js shader carousel.
	 *
	 * Typography-only by decision, not by omission. brand-delta.v1 §7 is explicit:
	 * "В inspected sources нет достаточного rights register, поэтому существующие
	 * CMS/repo media нельзя автоматически считать cleared." No asset in this repo
	 * or in the Contentful space has a rights record, so shipping one here would
	 * be exactly the stock/demo placeholder the brief forbids. The moment a
	 * rights-cleared asset with a capture date exists, it drops into the media
	 * slot below the lead — the layout already reserves the room.
	 *
	 * The copy bundle is a prop so the preview comparer can swap it without this
	 * component knowing anything about previews.
	 */
	import { openEnquiry, INTENT } from '$lib/enquiry.js';
	import { HERO_CTA, HERO_ENQUIRY_SCENARIO } from '$lib/home-copy.js';

	/** @type {{ eyebrow: string, h1: string, lead: string }} */
	export let copy;

	/*
	 * Reserved when the comparer is on. Copy variants differ in line count, and
	 * restoring a stored variant after hydration would otherwise shift the page.
	 * Production renders one variant and needs no reservation.
	 */
	export let reserveHeight = false;
</script>

<section class="hero" aria-labelledby="hero-heading">
	<div class="qc-container">
		<div class="hero-copy" class:reserve={reserveHeight}>
			<p class="qc-label">{copy.eyebrow}</p>
			<h1 id="hero-heading" class="qc-display-1 hero-h1">{copy.h1}</h1>
			<p class="qc-body-lg hero-lead">{copy.lead}</p>
		</div>

		<div class="hero-actions">
			<button
				type="button"
				class="qc-cta qc-cta-primary"
				on:click={() =>
					openEnquiry({ intent: INTENT.SELECTION, scenario: HERO_ENQUIRY_SCENARIO })}
			>
				{HERO_CTA.primary}
			</button>
			<a class="qc-cta qc-cta-secondary" href="#process">{HERO_CTA.secondary}</a>
		</div>
	</div>
</section>

<style>
	.hero {
		background: var(--qc-surface);
		padding: var(--qc-space-7) var(--qc-gutter) var(--qc-space-6);
		border-bottom: 1px solid var(--qc-border);
	}

	.hero-copy {
		max-width: 24ch;
	}

	/* Height reservation for the preview comparer only — see reserveHeight. */
	.hero-copy.reserve {
		min-height: 268px;
	}

	.hero-h1 {
		margin: var(--qc-space-3) 0 0;
		/* global.css centres h1/h2; the Quiet Coast shell is left-aligned. */
		text-align: left;
	}

	.hero-lead {
		margin: var(--qc-space-4) 0 0;
		max-width: 58ch;
	}

	.hero-actions {
		margin-top: var(--qc-space-6);
		display: flex;
		flex-wrap: wrap;
		gap: var(--qc-space-3);
	}

	.hero-actions > :global(*) {
		flex: 1 1 auto;
	}

	@media (min-width: 480px) {
		.hero-actions > :global(*) {
			flex: 0 0 auto;
		}
	}

	@media (min-width: 768px) {
		.hero {
			padding: var(--qc-space-9) var(--qc-gutter) var(--qc-space-8);
		}

		.hero-copy {
			max-width: 20ch;
		}

		.hero-copy.reserve {
			min-height: 340px;
		}

		.hero-lead {
			max-width: 62ch;
		}
	}
</style>
