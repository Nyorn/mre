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
	 * WIDTH BUG, fixed here. This used to set `max-width: 20ch` on .hero-copy.
	 * `ch` resolves against the element's OWN font-size, and .hero-copy inherits
	 * the 16px UI font — so the column was ~160px wide, not the ~640px intended
	 * for a 64px display face. Measured result: the H1 wrapped to 7 lines and the
	 * hero rendered 1039px tall on desktop. The constraint is now expressed in
	 * rem, which does not depend on the inherited font-size.
	 *
	 * The copy bundle arrives as a prop so the preview comparer can swap it
	 * without this component knowing anything about previews.
	 */
	export let copy;

	/** Shared across all variants — the comparison must not move the CTA. */
	export let ctaPrimary = 'Подобрать объекты';
	export let ctaSecondary = 'Как мы работаем';

	/** Fires the enquiry flow; the page owns the intent/scenario mapping. */
	export let onPrimary = () => {};

	/*
	 * Height reservation, only when the comparer is on.
	 *
	 * Copy variants differ in line count, so restoring a stored variant after
	 * hydration — or switching one by hand — would otherwise move everything
	 * below the hero. The values are measured from the rendered variants at each
	 * breakpoint (see the QA script), not guessed, and cover the tallest bundle.
	 * Production renders one variant and reserves nothing.
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
			<button type="button" class="qc-cta qc-cta-primary" on:click={onPrimary}>
				{ctaPrimary}
			</button>
			<a class="qc-cta qc-cta-secondary" href="#process">{ctaSecondary}</a>
		</div>
	</div>
</section>

<style>
	.hero {
		background: var(--qc-surface);
		padding: var(--qc-space-7) var(--qc-gutter) var(--qc-space-6);
		border-bottom: var(--qc-rule-weight, 1px) solid var(--qc-border);
	}

	.hero-copy {
		/* rem, not ch: see the note above. */
		max-width: 34rem;
	}

	.hero-h1 {
		margin: var(--qc-space-3) 0 0;
		/* global.css centres h1/h2; the Quiet Coast shell is left-aligned. */
		text-align: left;
		/* Long Russian compounds must break rather than push the layout wide. */
		overflow-wrap: break-word;
	}

	.hero-lead {
		margin: var(--qc-space-4) 0 0;
		max-width: 60ch;
	}

	/* Measured reservations. Tallest variant per breakpoint, rounded up. */
	.hero-copy.reserve {
		min-height: 424px;
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
			padding: var(--qc-space-8) var(--qc-gutter) var(--qc-space-7);
		}

		.hero-copy {
			max-width: 46rem;
		}

		.hero-copy.reserve {
			min-height: 384px;
		}
	}

	@media (min-width: 1024px) {
		.hero-copy {
			max-width: 52rem;
		}

		.hero-copy.reserve {
			min-height: 352px;
		}
	}
</style>
