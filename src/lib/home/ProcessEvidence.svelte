<script>
	/*
	 * "Как мы работаем" — the target of the hero's secondary CTA (#process), and
	 * the evidence block product-flow-delta.v1 §4 requires between the scenario
	 * entry and the enquiry.
	 *
	 * Claims discipline: every step describes what WE do, never what the market,
	 * a price or a legal status does. No response-time promise appears here —
	 * there is no measured SLA to publish, and inventing one would be the same
	 * class of error as a yield claim.
	 *
	 * The second panel is the honest counterpart: it states in plain terms what
	 * this site cannot confirm yet. That is the "explicit uncertainty" branch of
	 * the proof-first rule, not a disclaimer bolted on at the end.
	 */
	const steps = [
		{
			title: 'Разбираем задачу',
			body: 'Уточняем сценарий владения, бюджет и ограничения — до того, как показывать объекты.'
		},
		{
			title: 'Готовим подборку',
			body: 'Собираем варианты под задачу и объясняем, чем они отличаются и в чём компромисс.'
		},
		{
			title: 'Проверяем документы и расходы',
			body: 'Запрашиваем статус объекта и состав ежегодных расходов у собственника или партнёра.'
		},
		{
			title: 'Организуем просмотр и сделку',
			body: 'Согласуем просмотр, сопровождаем переговоры и оформление.'
		}
	];
</script>

<section id="process" class="qc-section process" aria-labelledby="process-heading">
	<div class="qc-container">
		<p class="qc-label">Процесс</p>
		<h2 id="process-heading" class="qc-heading-2 heading">Как мы работаем</h2>

		<ol class="steps">
			{#each steps as step, i}
				<li class="qc-card step">
					<span class="qc-data step-index" aria-hidden="true">{i + 1}</span>
					<h3 class="qc-heading-3 step-title">{step.title}</h3>
					<p class="qc-body step-body">{step.body}</p>
				</li>
			{/each}
		</ol>

		<div class="qc-panel evidence">
			<h3 class="qc-heading-3 evidence-title">Что мы показываем и чего пока не показываем</h3>
			<ul class="evidence-list qc-body">
				<li>
					Цену, статус и расположение публикуем со ссылкой на источник и датой проверки —
					там, где источник есть.
				</li>
				<li>
					Где данных нет или они устарели, мы пишем это прямо, а не подставляем
					приблизительное значение.
				</li>
				<li>
					Доходность, окупаемость и основания для ВНЖ мы не обещаем: это предмет отдельной
					проверки под конкретный объект и конкретного покупателя.
				</li>
			</ul>
		</div>
	</div>
</section>

<style>
	.process {
		background: var(--qc-surface);
		border-bottom: 1px solid var(--qc-border);
	}

	.heading {
		margin: var(--qc-space-2) 0 0;
		text-align: left;
	}

	.steps {
		list-style: none;
		margin: var(--qc-space-6) 0 0;
		padding: 0;
		display: grid;
		gap: var(--qc-space-4);
		grid-template-columns: 1fr;
		counter-reset: none;
	}

	.step {
		/* min-width:0 keeps a long word from widening the grid track. */
		min-width: 0;
	}

	.step-index {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		border-radius: 999px;
		background: var(--qc-sea-soft);
		color: var(--qc-ink-950);
	}

	.step-title {
		margin: var(--qc-space-3) 0 0;
	}

	.step-body {
		margin: var(--qc-space-2) 0 0;
	}

	.evidence {
		margin-top: var(--qc-space-6);
	}

	.evidence-title {
		margin: 0;
	}

	.evidence-list {
		margin: var(--qc-space-3) 0 0;
		padding-left: 1.25em;
		display: grid;
		gap: var(--qc-space-2);
		max-width: 76ch;
		/* Panel background is --qc-surface-subtle: body text stays Ink 700. */
		color: var(--qc-ink-700);
	}

	@media (min-width: 768px) {
		.steps {
			grid-template-columns: repeat(2, 1fr);
			gap: var(--qc-space-5);
		}
	}

	@media (min-width: 1024px) {
		.steps {
			grid-template-columns: repeat(4, 1fr);
		}
	}
</style>
