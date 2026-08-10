<script>
	/*
	 * About — Quiet Coast shell.
	 *
	 * The previous version was the starter template's showpiece: purple
	 * gradients (#3800e7 / #8a15ff), animated glass panels, a .backdrop blur, a
	 * remote DM Mono webfont, decorative SVG orbits, and content padded to 100px
	 * inside a translucent black card. Worse, the whole page sat behind
	 * `{#if FontAwesomeIcon}` awaiting a dynamic import, so the server rendered
	 * an empty document and the text only appeared after hydration.
	 *
	 * The copy is preserved, minus one claim: "Инвестиционный опыт: Стратегии
	 * для устойчивого роста вашего капитала" is a financial promise with no
	 * evidence behind it, and brand-delta.v1 §6 puts yield and capital-growth
	 * language out of scope. It is dropped rather than softened, because the
	 * honest version of that bullet says nothing the others do not.
	 *
	 * Nothing is invented: no founding date, no team size, no office, no
	 * licences, no transaction counts, no prices.
	 */
	import QuietCoastHeader from '$lib/home/QuietCoastHeader.svelte';
	import QuietCoastFooter from '$lib/home/QuietCoastFooter.svelte';
	import { openEnquiry, INTENT } from '$lib/enquiry.js';
	import '$lib/styles/quiet-shell.css';

	const advantages = [
		{
			title: 'Опыт и экспертность',
			body: 'Мы работаем на болгарском рынке недвижимости и разбираемся в том, чем отличаются побережье, города и отдельные комплексы.'
		},
		{
			title: 'Индивидуальный подход',
			body: 'Начинаем с разбора вашей задачи и ограничений, а не с готового списка объектов.'
		},
		{
			title: 'Сопровождение сделки',
			body: 'Помогаем на переговорах и при оформлении, уточняем статус объекта и состав расходов у собственника или партнёра.'
		}
	];
</script>

<svelte:head>
	<title>О компании — Sea Estate</title>
	<meta
		name="description"
		content="Sea Estate — подбор и сопровождение недвижимости на побережье Болгарии: как мы работаем и чем помогаем."
	/>
</svelte:head>

<a class="qc-skip-link" href="#main">Перейти к основному содержанию</a>

<div class="qc-home">
	<QuietCoastHeader />

	<main id="main">
		<section class="qc-section intro" aria-labelledby="about-heading">
			<div class="qc-container">
				<p class="qc-label">О компании</p>
				<h1 id="about-heading" class="qc-heading-2 heading">Кто мы</h1>
				<p class="qc-body-lg lead">
					Мы — команда с личным опытом покупки и владения недвижимостью в Болгарии.
					Помогаем найти дом у моря под конкретную задачу: для жизни, отдыха, аренды или
					переезда.
				</p>
			</div>
		</section>

		<section class="qc-section advantages" aria-labelledby="advantages-heading">
			<div class="qc-container">
				<h2 id="advantages-heading" class="qc-heading-3 sub">Чем мы полезны</h2>

				<ul class="rows">
					{#each advantages as item}
						<li class="row">
							<h3 class="qc-heading-3 row-title">{item.title}</h3>
							<p class="qc-body row-body">{item.body}</p>
						</li>
					{/each}
				</ul>
			</div>
		</section>

		<section class="qc-section why" aria-labelledby="why-heading">
			<div class="qc-container">
				<h2 id="why-heading" class="qc-heading-3 sub">Почему побережье Болгарии</h2>
				<p class="qc-body why-body">
					Это побережье с морем, горами и городами, где можно жить круглый год или
					приезжать сезонно. Что именно подойдёт вам, зависит от сценария владения — с него
					мы и начинаем разговор.
				</p>

				<div class="qc-panel honest">
					<p class="qc-body honest-body">
						Мы не обещаем доходность, окупаемость или основания для ВНЖ: это предмет
						отдельной проверки под конкретный объект и конкретного покупателя.
					</p>
				</div>

				<div class="actions">
					<button
						type="button"
						class="qc-cta qc-cta-primary"
						on:click={() =>
							openEnquiry({
								intent: INTENT.GENERAL_QUESTION,
								scenario: 'Обращение со страницы «О компании»'
							})}
					>
						Оставить заявку
					</button>
					<a class="qc-cta qc-cta-secondary" href="/objects">Смотреть каталог</a>
					<a class="qc-cta qc-cta-neutral" href="/contacts">Контакты</a>
				</div>
			</div>
		</section>
	</main>

	<QuietCoastFooter />
</div>

<style>
	.intro,
	.advantages {
		background: var(--qc-surface);
		border-bottom: var(--qc-rule-weight, 1px) solid var(--qc-border);
	}

	.why {
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

	.rows {
		list-style: none;
		margin: var(--qc-space-5) 0 0;
		padding: 0;
		border-top: var(--qc-rule-weight, 1px) solid var(--qc-border);
	}

	.row {
		padding: var(--qc-space-4) 0;
		border-bottom: var(--qc-rule-weight, 1px) solid var(--qc-border);
		min-width: 0;
	}

	.row-title {
		margin: 0;
	}

	.row-body {
		margin: var(--qc-space-2) 0 0;
		max-width: 68ch;
	}

	.why-body {
		margin: var(--qc-space-4) 0 0;
		max-width: 68ch;
	}

	.honest {
		margin-top: var(--qc-space-5);
		max-width: 72ch;
	}

	.honest-body {
		margin: 0;
		color: var(--qc-ink-700);
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

	@media (min-width: 480px) {
		.actions > :global(*) {
			flex: 0 0 auto;
		}
	}
</style>
