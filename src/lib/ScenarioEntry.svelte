<script>
	/*
	 * Scenario-first entry (Slice A, P0.1) — now editorial task rows rather than
	 * three equal cards.
	 *
	 * Three symmetric cards read as "pick one of three products" and give equal
	 * visual weight to three tasks that are not equally common. Full-width rows
	 * separated by rules read as a list of jobs, let each description breathe at
	 * 320px instead of being squeezed into a third of the width, and remove the
	 * equal-height card problem entirely.
	 *
	 * HONESTY RULE, unchanged and still the reason the CTAs behave this way:
	 * FilterBar.svelte reads city / price / bedrooms / area / floor / type. It
	 * has no `scenario` parameter, so a link to /objects?scenario=… would render
	 * a catalog that silently ignores the scenario — a visually strong but
	 * functionally false path (ui-delta.v1 P0.2). Until a verified scenario
	 * mapping exists each scenario CTA opens a scenario-tagged enquiry, and the
	 * one CTA that navigates points at the catalog, which genuinely exists.
	 *
	 * Claims: "уточняем", never "проверяем" — we ask the owner or partner, we do
	 * not run an independent verification.
	 */
	import { openEnquiry, INTENT } from '$lib/enquiry.js';

	const scenarios = [
		{
			label: 'Второй дом у моря',
			description:
				'Подберём варианты под сезонное проживание и расскажем, из чего складывается содержание.',
			cta: 'Подобрать второй дом',
			intent: INTENT.SELECTION,
			scenario: 'Ищу второй дом у моря'
		},
		{
			label: 'Сравнение объектов',
			description:
				'Сравним конкретные объекты и известные расходы на владение: такса, налог, коммунальные.',
			cta: 'Сравнить объекты и расходы',
			intent: INTENT.FULL_COST,
			scenario: 'Хочу сравнить объекты и расходы'
		},
		{
			label: 'Переезд',
			description:
				'Обсудим район, инфраструктуру и порядок сделки под постоянное проживание.',
			cta: 'Обсудить переезд',
			intent: INTENT.RESIDENCE_ASSESSMENT,
			scenario: 'Планирую переезд'
		}
	];
</script>

<section class="qc-section scenario" aria-labelledby="scenario-heading">
	<div class="qc-container">
		<p class="qc-label">С чего начать</p>
		<h2 id="scenario-heading" class="qc-heading-2 heading">Выберите свою задачу</h2>
		<p class="qc-body-lg lede">
			Мы работаем от задачи, а не от каталога. Расскажите, что вам нужно — и мы предложим
			конкретные объекты и покажем, какие данные по ним у нас есть.
		</p>

		<ul class="task-rows">
			{#each scenarios as item}
				<li class="task-row">
					<div class="task-text">
						<h3 class="qc-heading-3 task-title">{item.label}</h3>
						<p class="qc-body task-description">{item.description}</p>
					</div>
					<div class="task-action">
						<button
							type="button"
							class="qc-cta qc-cta-secondary task-cta"
							on:click={() =>
								openEnquiry({
									intent: item.intent,
									scenario: item.scenario
								})}
						>
							{item.cta}
						</button>
					</div>
				</li>
			{/each}
		</ul>

		<div class="catalog-row">
			<a class="qc-cta qc-cta-primary" href="/objects">Смотреть каталог</a>
			<p class="qc-caption catalog-note">
				В каталоге сейчас доступны фильтры по городу, цене, площади, этажу и числу спален.
				Подбор по задаче мы делаем вручную — по заявке.
			</p>
		</div>
	</div>
</section>

<style>
	.scenario {
		background: var(--qc-surface);
		border-bottom: var(--qc-rule-weight, 1px) solid var(--qc-border);
	}

	.heading {
		margin: var(--qc-space-2) 0 0;
		text-align: left;
	}

	.lede {
		margin: var(--qc-space-3) 0 0;
		max-width: 62ch;
	}

	.task-rows {
		list-style: none;
		margin: var(--qc-space-6) 0 0;
		padding: 0;
		border-top: var(--qc-rule-weight, 1px) solid var(--qc-border);
	}

	.task-row {
		display: flex;
		flex-direction: column;
		gap: var(--qc-row-gap, var(--qc-space-4));
		padding: var(--qc-space-5) 0;
		border-bottom: var(--qc-rule-weight, 1px) solid var(--qc-border);
		/* Keeps a long unbroken word from widening the row. */
		min-width: 0;
	}

	.task-text {
		min-width: 0;
	}

	.task-title {
		margin: 0;
	}

	.task-description {
		margin: var(--qc-space-2) 0 0;
		max-width: 68ch;
	}

	.task-action {
		min-width: 0;
	}

	.task-cta {
		width: 100%;
	}

	.catalog-row {
		margin-top: var(--qc-space-6);
		display: flex;
		flex-direction: column;
		gap: var(--qc-space-3);
		align-items: flex-start;
	}

	.catalog-note {
		margin: 0;
		max-width: 68ch;
	}

	@media (min-width: 480px) {
		.task-cta {
			width: auto;
		}
	}

	/* Editorial two-column row: text reads first, action sits to the side. */
	@media (min-width: 768px) {
		.task-row {
			flex-direction: row;
			align-items: baseline;
			justify-content: space-between;
			gap: var(--qc-space-6);
		}

		.task-text {
			flex: 1 1 auto;
		}

		.task-action {
			flex: 0 0 auto;
		}
	}
</style>
