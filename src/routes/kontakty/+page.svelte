<script>
	import { stage } from '#lib/stage/state.svelte.js';
	import LeadForm from '#lib/LeadForm.svelte';
	$effect(() => {
		stage.dim = 0.7;
	});
</script>

<svelte:head>
	<title>Связаться · Sea Estate</title>
	<meta name="description" content="Вопрос по объекту или по покупке в Болгарии — оставьте контакт, ответим в течение рабочего дня." />
</svelte:head>

<article class="page">
	<p class="kicker">Связаться</p>
	<h1>Напишите, что ищете</h1>
	<p class="lead">Город, бюджет, для жизни или для аренды. Ответим в течение рабочего дня — по телефону, в WhatsApp или Telegram.</p>
	<div class="form"><LeadForm subject="Страница контактов" /></div>
</article>

<style>
	.page {
		max-width: 820px;
		padding: 140px var(--gutter) 120px;
		display: grid;
		gap: 24px;
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
	.lead {
		font-size: 19px;
		line-height: 1.5;
		color: var(--muted);
		max-width: 560px;
	}
	.form {
		margin-top: 24px;
	}
</style>
