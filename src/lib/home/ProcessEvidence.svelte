<script>
	/*
	 * "Как мы работаем" — target of the hero's secondary CTA (#process), and the
	 * evidence block product-flow-delta.v1 §4 requires between the scenario entry
	 * and the enquiry.
	 *
	 * Ordered rows, not a four-across card grid: these steps happen in sequence,
	 * and a symmetric grid says "four parallel features" while hiding the order
	 * at every breakpoint below 1024. A numbered list with rules says what it is.
	 *
	 * CLAIMS (Bob's review, applied):
	 *  - "проверяем" → "уточняем" throughout. We request status and costs from
	 *    the owner or partner; we do not independently verify them, and the
	 *    stronger verb claimed that we do.
	 *  - The evidence panel no longer promises a published source or a checked
	 *    date. Neither field exists in the content model yet, so promising them
	 *    would be a claim about a capability we do not have. It states what is
	 *    true now: some data is available, some is not, and we say which.
	 *  - No response-time promise anywhere: there is no measured SLA to publish.
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
			title: 'Уточняем документы и расходы',
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

		<ol class="step-rows">
			{#each steps as step, i}
				<li class="step-row">
					<span class="step-index qc-data" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
					<div class="step-text">
						<h3 class="qc-heading-3 step-title">{step.title}</h3>
						<p class="qc-body step-body">{step.body}</p>
					</div>
				</li>
			{/each}
		</ol>

		<div class="qc-panel evidence">
			<h3 class="qc-heading-3 evidence-title">Что мы показываем и чего пока не показываем</h3>
			<ul class="evidence-list qc-body">
				<li>
					Показываем те данные об объекте, которые у нас есть от собственника или партнёра.
				</li>
				<li>
					Где данных нет или они устарели, мы пишем это прямо, а не подставляем
					приблизительное значение.
				</li>
				<li>
					Доходность, окупаемость и основания для ВНЖ мы не обещаем: это предмет отдельной
					работы под конкретный объект и конкретного покупателя.
				</li>
			</ul>
		</div>
	</div>
</section>

<style>
	.process {
		background: var(--qc-surface);
		border-bottom: var(--qc-rule-weight, 1px) solid var(--qc-border);
	}

	.heading {
		margin: var(--qc-space-2) 0 0;
		text-align: left;
	}

	.step-rows {
		list-style: none;
		margin: var(--qc-space-6) 0 0;
		padding: 0;
		border-top: var(--qc-rule-weight, 1px) solid var(--qc-border);
	}

	.step-row {
		display: flex;
		align-items: flex-start;
		gap: var(--qc-space-4);
		padding: var(--qc-space-5) 0;
		border-bottom: var(--qc-rule-weight, 1px) solid var(--qc-border);
		min-width: 0;
	}

	.step-index {
		flex: 0 0 auto;
		color: var(--qc-muted);
		font-variant-numeric: tabular-nums;
		/* Aligns with the cap height of the row title. */
		padding-top: 4px;
		min-width: 2.5ch;
	}

	.step-text {
		min-width: 0;
	}

	.step-title {
		margin: 0;
	}

	.step-body {
		margin: var(--qc-space-2) 0 0;
		max-width: 68ch;
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
		max-width: 72ch;
		/* Panel background is --qc-surface-subtle: body text stays Ink 700. */
		color: var(--qc-ink-700);
	}

	@media (min-width: 768px) {
		.step-row {
			gap: var(--qc-space-6);
		}

		.step-index {
			min-width: 4ch;
		}
	}
</style>
