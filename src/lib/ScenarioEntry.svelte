<script>
	/*
	 * Scenario-first entry (Slice A, P0.1).
	 *
	 * HONESTY RULE, and the reason this component looks the way it does:
	 * `FilterBar.svelte` reads city / price / bedrooms / area / floor / type.
	 * It has no `scenario` parameter. So a link to `/objects?scenario=…` would
	 * render a catalog that silently ignores the scenario — a visually strong
	 * but functionally false path (ui-delta.v1 P0.2).
	 *
	 * Until verified scenario mapping exists, each scenario CTA therefore opens a
	 * scenario-tagged enquiry instead of pretending to filter. The one CTA that
	 * does navigate — "Смотреть каталог" — points at the real catalog, which
	 * genuinely exists.
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
				'Сравним конкретные объекты и полную стоимость владения: такса, налог, коммунальные.',
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

<section class="qc-section" aria-labelledby="scenario-heading">
	<div class="qc-container">
		<p class="qc-label">С чего начать</p>
		<h2 id="scenario-heading" class="qc-heading-2 heading">Выберите свою задачу</h2>
		<p class="qc-body-lg lede">
			Мы работаем от задачи, а не от каталога. Расскажите, что вам нужно — и мы предложим
			конкретные объекты с проверяемыми данными по цене и расположению.
		</p>

		<ul class="scenario-grid">
			{#each scenarios as item}
				<li class="qc-card scenario-card">
					<h3 class="qc-heading-3">{item.label}</h3>
					<p class="qc-body description">{item.description}</p>
					<button
						type="button"
						class="qc-cta qc-cta-secondary scenario-cta"
						on:click={() =>
							openEnquiry({
								intent: item.intent,
								scenario: item.scenario
							})}
					>
						{item.cta}
					</button>
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
	.heading {
		margin: 8px 0 0;
		text-align: left;
	}

	.lede {
		margin: 12px 0 0;
		max-width: 60ch;
	}

	.scenario-grid {
		list-style: none;
		margin: 32px 0 0;
		padding: 0;
		display: grid;
		gap: 16px;
		grid-template-columns: 1fr;
	}

	@media (min-width: 768px) {
		.scenario-grid {
			grid-template-columns: repeat(3, 1fr);
			gap: 24px;
		}
	}

	.scenario-card {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.description {
		flex: 1 1 auto;
		margin: 0;
	}

	.scenario-cta {
		width: 100%;
	}

	.catalog-row {
		margin-top: 32px;
		display: flex;
		flex-direction: column;
		gap: 12px;
		align-items: flex-start;
	}

	.catalog-note {
		margin: 0;
		max-width: 60ch;
	}
</style>
