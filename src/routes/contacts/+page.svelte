<script>
	/*
	 * Contacts — Quiet Coast shell.
	 *
	 * What this page used to be: three real phone numbers whose links pointed at
	 * flowbite.com and tailwindcss.com (starter-template leftovers), a
	 * support@mail.com address with an empty href, and the lead form dropped on
	 * the page with no heading, sitting on the legacy dark background.
	 *
	 * Every phone number and the email below are the ones already published in
	 * the site footer, so nothing here is invented. The demo links are gone and
	 * each number is now a real tel: link. support@mail.com is removed entirely
	 * rather than repointed — it is not a confirmed address.
	 *
	 * Deliberately absent: office address, opening hours, response times, prices
	 * and any legal or guarantee language. None of that is confirmed, and a
	 * contacts page is exactly where an invented detail does the most damage.
	 */
	import QuietCoastHeader from '$lib/home/QuietCoastHeader.svelte';
	import QuietCoastFooter from '$lib/home/QuietCoastFooter.svelte';
	import { openEnquiry, INTENT } from '$lib/enquiry.js';
	import '$lib/styles/quiet-shell.css';

	const phones = [
		{ label: '+359 895-340-006', href: 'tel:+359895340006' },
		{ label: '+359 877-580-966', href: 'tel:+359877580966' },
		{ label: '+38 (93) 053-55-25', href: 'tel:+38930535525' }
	];
</script>

<svelte:head>
	<title>Контакты — Sea Estate</title>
	<meta
		name="description"
		content="Связаться с Sea Estate: телефоны, электронная почта и форма заявки по подбору недвижимости на побережье Болгарии."
	/>
</svelte:head>

<a class="qc-skip-link" href="#main">Перейти к основному содержанию</a>

<div class="qc-home">
	<QuietCoastHeader />

	<main id="main">
		<section class="qc-section intro" aria-labelledby="contacts-heading">
			<div class="qc-container">
				<p class="qc-label">Контакты</p>
				<h1 id="contacts-heading" class="qc-heading-2 heading">Как с нами связаться</h1>
				<p class="qc-body-lg lead">
					Напишите или позвоните — расскажите, что вы ищете, и мы предложим варианты под
					вашу задачу. Если удобнее письменно, оставьте заявку: ответим тем же способом.
				</p>
			</div>
		</section>

		<section class="qc-section channels" aria-labelledby="channels-heading">
			<div class="qc-container">
				<h2 id="channels-heading" class="qc-heading-3 sub">Телефон и почта</h2>

				<ul class="channel-list">
					{#each phones as phone}
						<li class="channel-row">
							<span class="qc-caption channel-kind">Телефон</span>
							<a class="qc-link channel-value" href={phone.href}>{phone.label}</a>
						</li>
					{/each}
					<li class="channel-row">
						<span class="qc-caption channel-kind">Электронная почта</span>
						<a class="qc-link channel-value" href="mailto:sales@sea-estate.com">
							sales@sea-estate.com
						</a>
					</li>
				</ul>

				<div class="actions">
					<button
						type="button"
						class="qc-cta qc-cta-primary"
						on:click={() =>
							openEnquiry({
								intent: INTENT.GENERAL_QUESTION,
								scenario: 'Обращение со страницы контактов'
							})}
					>
						Оставить заявку
					</button>
					<a class="qc-cta qc-cta-secondary" href="/objects">Смотреть каталог</a>
				</div>

				<p class="qc-caption note">
					Мы не фиксируем срок ответа: он зависит от вопроса и от того, какие сведения нужно
					уточнить у собственника или партнёра.
				</p>
			</div>
		</section>
	</main>

	<QuietCoastFooter />
</div>

<style>
	.intro {
		background: var(--qc-surface);
		border-bottom: var(--qc-rule-weight, 1px) solid var(--qc-border);
	}

	.channels {
		background: var(--qc-surface);
	}

	.heading {
		margin: var(--qc-space-2) 0 0;
		text-align: left;
	}

	.lead {
		margin: var(--qc-space-4) 0 0;
		max-width: 62ch;
	}

	.sub {
		margin: 0;
		text-align: left;
	}

	.channel-list {
		list-style: none;
		margin: var(--qc-space-5) 0 0;
		padding: 0;
		border-top: var(--qc-rule-weight, 1px) solid var(--qc-border);
	}

	.channel-row {
		display: flex;
		flex-direction: column;
		gap: 2px;
		padding: var(--qc-space-3) 0;
		border-bottom: var(--qc-rule-weight, 1px) solid var(--qc-border);
		min-width: 0;
	}

	.channel-kind {
		color: var(--qc-muted);
	}

	.channel-value {
		display: inline-flex;
		align-items: center;
		min-height: 44px;
		font-family: var(--qc-font-ui);
		font-size: 18px;
		/* A long address must wrap rather than widen the page at 320px. */
		word-break: break-word;
	}

	.channel-value:focus-visible {
		outline: 3px solid var(--qc-focus);
		outline-offset: 2px;
		border-radius: 4px;
	}

	.actions {
		margin-top: var(--qc-space-6);
		display: flex;
		flex-wrap: wrap;
		gap: var(--qc-space-3);
	}

	.actions > :global(*) {
		flex: 1 1 auto;
	}

	.note {
		margin: var(--qc-space-4) 0 0;
		max-width: 68ch;
	}

	@media (min-width: 480px) {
		.actions > :global(*) {
			flex: 0 0 auto;
		}
	}

	@media (min-width: 768px) {
		.channel-row {
			flex-direction: row;
			align-items: baseline;
			gap: var(--qc-space-5);
		}

		.channel-kind {
			flex: 0 0 12rem;
		}
	}
</style>
