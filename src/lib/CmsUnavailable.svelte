<script>
	/*
	 * Accessible "catalog temporarily unavailable" state.
	 *
	 * Replaces a bare HTTP 500. A 500 gives a visitor a dead end inside the
	 * framework's error shell: no navigation, no way to retry, no way to reach a
	 * human, and nothing for assistive tech to announce beyond "Internal Error".
	 * The same failure rendered inside the site shell keeps the header, the
	 * footer and the enquiry route reachable, which matters most precisely when
	 * the catalog is the thing that is broken.
	 *
	 * The message says the catalog is unavailable and nothing else. It does not
	 * blame a vendor, name a system, promise a restoration time, or state that
	 * objects exist and are merely hidden — none of that is known here.
	 *
	 * role="status" rather than role="alert": this is rendered on load, and an
	 * assertive live region would interrupt a screen reader mid-announcement.
	 */
	import { openEnquiry, INTENT } from '$lib/enquiry.js';
	import { invalidateAll } from '$app/navigation';

	/** @type {{ code?: string, status?: number, message: string }} */
	export let failure;

	/** Heading level so the page keeps a sane outline: detail pages pass 1. */
	export let level = 1;

	let retrying = false;

	async function retry() {
		retrying = true;
		try {
			// Re-runs the server load; no full reload, so the shell stays put.
			await invalidateAll();
		} finally {
			retrying = false;
		}
	}
</script>

<section class="qc-section cms-out" aria-labelledby="cms-out-heading">
	<div class="qc-container">
		<div class="qc-panel panel" role="status">
			<p class="qc-label">Каталог</p>

			{#if level === 1}
				<h1 id="cms-out-heading" class="qc-heading-2 heading">Каталог временно недоступен</h1>
			{:else}
				<h2 id="cms-out-heading" class="qc-heading-2 heading">Каталог временно недоступен</h2>
			{/if}

			<p class="qc-body message">{failure.message}</p>
			<p class="qc-body message">
				Попробуйте обновить страницу. Если каталог не открывается, опишите задачу в
				заявке или свяжитесь с нами.
			</p>

			<div class="actions">
				<button type="button" class="qc-cta qc-cta-primary" on:click={retry} disabled={retrying}>
					{retrying ? 'Обновляем…' : 'Повторить'}
				</button>
				<button
					type="button"
					class="qc-cta qc-cta-secondary"
					on:click={() =>
						openEnquiry({
							intent: INTENT.SELECTION,
							scenario: 'Каталог был недоступен — прошу прислать подборку'
						})}
				>
					Оставить заявку
				</button>
				<a class="qc-cta qc-cta-neutral" href="/contacts">Контакты</a>
			</div>

			{#if failure.status}
				<p class="qc-caption code">Код состояния: {failure.status}</p>
			{/if}
		</div>
	</div>
</section>

<style>
	.cms-out {
		background: var(--qc-surface);
	}

	.panel {
		max-width: 72ch;
	}

	.heading {
		margin: var(--qc-space-2) 0 0;
		text-align: left;
	}

	.message {
		margin: var(--qc-space-3) 0 0;
		color: var(--qc-ink-700);
	}

	.actions {
		margin-top: var(--qc-space-5);
		display: flex;
		flex-wrap: wrap;
		gap: var(--qc-space-3);
	}

	.actions > :global(*) {
		flex: 1 1 auto;
	}

	.code {
		margin: var(--qc-space-4) 0 0;
		color: var(--qc-ink-700);
	}

	@media (min-width: 480px) {
		.actions > :global(*) {
			flex: 0 0 auto;
		}
	}
</style>
