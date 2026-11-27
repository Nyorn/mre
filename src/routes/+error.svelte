<script>
	import { page } from '$app/state';
	import { stage } from '#lib/stage/state.svelte.js';
	$effect(() => {
		stage.dim = 0.6;
	});
</script>

<svelte:head><title>{page.status} · Sea Estate</title></svelte:head>

<article class="page">
	<p class="kicker">{page.status}</p>
	<h1>Здесь только море</h1>
	<p>Такой страницы нет. Возможно, объект уже продан.</p>
	<a class="cta" href="/"><span>Ко всем объектам</span><span class="arr">→</span></a>
</article>

<style>
	.page {
		min-height: 100dvh;
		display: grid;
		align-content: end;
		justify-items: start;
		gap: 18px;
		padding: 120px var(--gutter) 80px;
	}
	.kicker {
		color: var(--accent);
	}
	h1 {
		font-size: clamp(40px, 6vw, 84px);
		font-weight: 500;
		letter-spacing: -0.045em;
		line-height: 0.95;
	}
	p {
		color: var(--muted);
	}
</style>
