<script>
	import { stage } from '#lib/stage/state.svelte.js';
	import { formatDistance } from '#lib/geo/math.js';

	let { data } = $props();
	const words = ['Дом', 'на', 'первой', 'линии'];
	const listOn = $derived(stage.phase === 'over' || !stage.webgl);
	const heroOn = $derived(['intro', 'turn', 'over'].includes(stage.phase) || !stage.webgl);
	$effect(() => {
		stage.dim = 0;
	});
</script>

<svelte:head>
	<title>Sea Estate — недвижимость на первой линии болгарского побережья</title>
	<meta
		name="description"
		content="Несколько отобранных объектов на Черноморском побережье Болгарии: Балчик, Свети Влас, Несебр, Созополь. У каждого честно измерено расстояние до моря."
	/>
</svelte:head>

<section class="hero" class:on={heroOn} style:--base={stage.phase === 'intro' ? '0.9s' : '0.05s'} aria-labelledby="h">
	<h1 id="h">
		{#each words as w, i}
			<span class="w" style:--i={i}><span>{w}</span></span>{' '}
		{/each}
	</h1>
	<p>Несколько объектов на болгарском побережье. У каждого честно измерено расстояние до воды.</p>
</section>

<section class="index" class:on={listOn} id="objects" aria-labelledby="objh">
	<h2 id="objh">Объекты на карте</h2>
	<ol>
		{#each data.properties as p (p.slug)}
			<li>
				<a href="/objects/{p.slug}">
					<span class="t">{p.title}</span>
					<em>{formatDistance(p.sea.meters)} до моря</em>
				</a>
			</li>
		{/each}
	</ol>
	<p class="note">Пока демо-объекты: данные условные, расстояния настоящие.</p>
</section>

<style>
	.hero {
		position: fixed;
		left: var(--gutter);
		bottom: clamp(110px, 16vh, 170px);
		max-width: 640px;
		pointer-events: none;
		opacity: 0;
		transition: opacity 0.8s var(--ease);
	}
	.hero.on {
		opacity: 1;
	}
	h1 {
		font-weight: 500;
		font-size: clamp(44px, 7.2vw, 108px);
		line-height: 0.94;
		letter-spacing: -0.045em;
	}
	.w {
		display: inline-block;
		overflow: hidden;
		vertical-align: top;
		padding-bottom: 0.06em;
	}
	.w > span {
		display: inline-block;
		translate: 0 105%;
	}
	.hero.on .w > span {
		translate: 0 0;
		transition: translate 1.3s var(--ease) calc(var(--base) + var(--i) * 0.2s);
	}
	.hero p {
		margin-top: 22px;
		font-size: 17px;
		line-height: 1.5;
		color: var(--muted);
		max-width: 430px;
		opacity: 0;
		transition: opacity 1.2s var(--ease) calc(var(--base) + 1.2s);
	}
	.hero.on p {
		opacity: 1;
	}
	.index {
		position: fixed;
		right: var(--gutter);
		bottom: 24px;
		width: min(360px, calc(100vw - 2 * var(--gutter)));
		opacity: 0;
		translate: 0 12px;
		pointer-events: none;
		transition:
			opacity 0.7s var(--ease),
			translate 0.9s var(--ease);
	}
	.index.on {
		opacity: 1;
		translate: 0 0;
		pointer-events: auto;
	}
	h2 {
		font-size: 13px;
		font-weight: 400;
		color: var(--muted);
		margin-bottom: 8px;
	}
	ol {
		list-style: none;
		border-top: 1px solid var(--line);
		background: linear-gradient(90deg, rgba(3, 9, 13, 0), rgba(3, 9, 13, 0.35));
	}
	li a {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		gap: 16px;
		padding: 12px 0;
		border-bottom: 1px solid var(--line);
		text-decoration: none;
		font-size: 15px;
		position: relative;
	}
	li a em {
		font-style: normal;
		font-size: 13px;
		color: var(--muted);
		font-variant-numeric: tabular-nums;
		white-space: nowrap;
		transition: color 0.3s;
	}
	li a::before {
		content: '';
		position: absolute;
		left: 0;
		bottom: -1px;
		height: 1px;
		width: 100%;
		background: var(--accent);
		box-shadow: 0 0 8px var(--accent);
		transform: scaleX(0);
		transform-origin: left;
		transition: transform 0.6s var(--ease);
	}
	li a:hover::before,
	li a:focus-visible::before {
		transform: scaleX(1);
	}
	li a:hover em {
		color: var(--accent);
	}
	.note {
		margin-top: 10px;
		font-size: 12px;
		color: var(--muted);
	}
	@media (max-width: 760px) {
		.hero {
			bottom: auto;
			top: 84px;
		}
		.hero p {
			font-size: 15px;
		}
		.index {
			bottom: 12px;
		}
		.index ol {
			background: rgba(3, 9, 13, 0.6);
			backdrop-filter: blur(8px);
		}
		li a {
			padding: 10px 8px;
			font-size: 14px;
		}
		.note {
			display: none;
		}
	}
	@media (max-height: 760px) and (min-width: 761px) {
		h1 {
			font-size: clamp(40px, 5.6vw, 84px);
		}
		.hero {
			bottom: auto;
			top: 96px;
		}
	}
</style>
