<script>
	/*
	 * Enquiry section.
	 *
	 * One form instance per page: this section opens the same modal the hero and
	 * the scenario cards use, rather than embedding a second FeedbackForm inline.
	 * Two live forms on one page would mean two lead_ids, two timing windows and
	 * two idempotency keys for one visitor — a real way to break the P0.5
	 * guarantees, for no product gain.
	 *
	 * Delivery behaviour is untouched: the modal renders the existing
	 * FeedbackForm, which still POSTs same-origin to /api/lead.
	 *
	 * No response-time promise. The copy says what we do, and says plainly that
	 * the timing is not fixed, because no measured SLA exists to publish.
	 */
	import { openEnquiry, INTENT } from '$lib/enquiry.js';
</script>

<section class="qc-section enquiry" aria-labelledby="enquiry-heading">
	<div class="qc-container enquiry-inner">
		<div class="enquiry-copy">
			<p class="qc-label">Заявка</p>
			<h2 id="enquiry-heading" class="qc-heading-2 heading">Расскажите о задаче</h2>
			<p class="qc-body-lg lead">
				Опишите, что вы ищете. Мы уточним детали и подготовим варианты под ваш сценарий.
				Срок ответа не фиксируем — он зависит от вопроса и от того, что нужно проверить у
				собственника.
			</p>

			<button
				type="button"
				class="qc-cta qc-cta-primary enquiry-cta"
				on:click={() => openEnquiry({ intent: INTENT.GENERAL_QUESTION })}
			>
				Оставить заявку
			</button>
		</div>

		<div class="qc-panel contacts">
			<h3 class="qc-heading-3 contacts-title">Связаться напрямую</h3>
			<ul class="contacts-list">
				<li><a class="qc-link contact" href="tel:+359895340006">+359 895-340-006</a></li>
				<li><a class="qc-link contact" href="tel:+359877580966">+359 877-580-966</a></li>
				<li><a class="qc-link contact" href="mailto:sales@sea-estate.com">sales@sea-estate.com</a></li>
			</ul>
		</div>
	</div>
</section>

<style>
	.enquiry {
		background: var(--qc-surface-subtle);
		border-bottom: 1px solid var(--qc-border);
	}

	.enquiry-inner {
		display: grid;
		gap: var(--qc-space-6);
		grid-template-columns: 1fr;
		align-items: start;
	}

	.heading {
		margin: var(--qc-space-2) 0 0;
		text-align: left;
	}

	.lead {
		margin: var(--qc-space-4) 0 0;
		max-width: 60ch;
	}

	.enquiry-cta {
		margin-top: var(--qc-space-5);
		width: 100%;
	}

	.contacts {
		/* Panel sits on the subtle section background: lift it to the base surface. */
		background: var(--qc-surface);
		min-width: 0;
	}

	.contacts-title {
		margin: 0;
	}

	.contacts-list {
		list-style: none;
		margin: var(--qc-space-3) 0 0;
		padding: 0;
		display: grid;
		gap: var(--qc-space-1);
	}

	.contact {
		display: inline-flex;
		align-items: center;
		min-height: 44px;
		font-family: var(--qc-font-ui);
		font-size: 16px;
		word-break: break-word;
	}

	.contact:focus-visible {
		outline: 3px solid var(--qc-focus);
		outline-offset: 2px;
		border-radius: 4px;
	}

	@media (min-width: 480px) {
		.enquiry-cta {
			width: auto;
		}
	}

	@media (min-width: 1024px) {
		.enquiry-inner {
			grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr);
			gap: var(--qc-space-7);
		}
	}
</style>
