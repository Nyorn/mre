<script>
	import { stage } from '#lib/stage/state.svelte.js';
	$effect(() => {
		stage.dim = 0.78;
	});
	const steps = [
		['Выбор и бронь', 'Смотрим объект вживую или по видео, проверяем документы собственника. Бронь фиксируется договором и небольшим задатком.'],
		['ЛНЧ и счёт', 'Иностранцу нужен личный номер (ЛНЧ) и банковский счёт в Болгарии. Регистрация в BULSTAT — в течение 7 дней после сделки.'],
		['Предварительный договор', 'Цена, сроки и порядок оплаты. Для новостроек проверяем стадию: разрешение на строительство и документ о вводе в эксплуатацию.'],
		['Нотариальный акт', 'Сделка у нотариуса. В тот же день нотариус подаёт акт в имущественный регистр.'],
		['После сделки', 'Местный налог, коммунальные договоры, при желании — управление и сдача в аренду.']
	];
	const costs = [
		['Местный налог на переход права', '2–2,5 % (зависит от общины)'],
		['Нотариус', 'около 1 %'],
		['Регистрация', '0,1 %'],
		['Перевод и юрист', 'по договорённости']
	];
</script>

<svelte:head>
	<title>Как купить недвижимость в Болгарии — шаги и расходы · Sea Estate</title>
	<meta name="description" content="Покупка недвижимости в Болгарии иностранцем: ЛНЧ, нотариальный акт, налоги и расходы сверх цены — по шагам." />
</svelte:head>

<article class="page">
	<p class="kicker">Как купить</p>
	<h1>Пять шагов до ключей</h1>
	<p class="draft">Черновик: цифры и порядок проверяются болгарским юристом перед публикацией.</p>

	<ol class="steps">
		{#each steps as [t, d], i}
			<li>
				<span class="n">{String(i + 1).padStart(2, '0')}</span>
				<h2>{t}</h2>
				<p>{d}</p>
			</li>
		{/each}
	</ol>

	<h2 class="sub">Расходы сверх цены</h2>
	<dl class="costs">
		{#each costs as [k, v]}
			<div><dt>{k}</dt><dd>{v}</dd></div>
		{/each}
	</dl>

	<a class="cta" href="/kontakty"><span>Задать вопрос</span><span class="arr">→</span></a>
</article>

<style>
	.page {
		max-width: 980px;
		padding: 140px var(--gutter) 120px;
		display: grid;
		gap: 28px;
		justify-items: start;
	}
	.kicker {
		color: var(--accent);
		font-size: 14px;
	}
	h1 {
		font-size: clamp(40px, 6vw, 84px);
		font-weight: 500;
		line-height: 0.95;
		letter-spacing: -0.045em;
	}
	.draft {
		font-size: 13px;
		color: var(--muted);
		border: 1px solid var(--line);
		padding: 6px 10px;
	}
	.steps {
		list-style: none;
		width: 100%;
		border-top: 1px solid var(--line);
	}
	.steps li {
		display: grid;
		grid-template-columns: 64px minmax(160px, 280px) 1fr;
		gap: 8px 24px;
		padding: 22px 0;
		border-bottom: 1px solid var(--line);
		align-items: baseline;
	}
	.n {
		font-variant-numeric: tabular-nums;
		color: var(--accent);
		font-size: 14px;
	}
	.steps h2 {
		font-size: 20px;
		font-weight: 500;
		letter-spacing: -0.01em;
	}
	.steps p {
		color: var(--muted);
		line-height: 1.55;
	}
	.sub {
		margin-top: 40px;
		font-size: 14px;
		font-weight: 400;
		color: var(--muted);
	}
	.costs {
		width: 100%;
		border-top: 1px solid var(--line);
	}
	.costs div {
		display: flex;
		justify-content: space-between;
		gap: 24px;
		padding: 14px 0;
		border-bottom: 1px solid var(--line);
	}
	.costs dd {
		font-variant-numeric: tabular-nums;
		text-align: right;
	}
	@media (max-width: 700px) {
		.steps li {
			grid-template-columns: 40px 1fr;
		}
		.steps p {
			grid-column: 2;
		}
	}
</style>
