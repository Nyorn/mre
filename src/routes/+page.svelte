<script>
	import { stage } from '#lib/stage/state.svelte.js';
	import { formatDistance } from '#lib/geo/math.js';

	let { data } = $props();
	const words = ['Дом', 'на', 'первой', 'линии'];
	const listOn = $derived(stage.phase === 'over' || !stage.webgl);
	let scrolled = $state(0);
	const heroOn = $derived(
		((['intro', 'turn', 'over'].includes(stage.phase) && !stage.explore) || !stage.webgl) && scrolled < 0.08
	);
	const DAY = [
		{ name: 'Рассвет', time: '06:10', at: 0 },
		{ name: 'День', time: '13:00', at: 0.34 },
		{ name: 'Закат', time: '19:40', at: 0.68 },
		{ name: 'Ночь', time: '23:30', at: 1 }
	];
	const active = $derived(DAY.reduce((b, d, i) => (Math.abs(d.at - scrolled) < Math.abs(DAY[b].at - scrolled) ? i : b), 0));
	function onScroll() {
		const max = document.documentElement.scrollHeight - innerHeight;
		scrolled = max > 0 ? Math.min(1, scrollY / max) : 0;
		stage.day = scrolled;
	}
	function jump(at) {
		const max = document.documentElement.scrollHeight - innerHeight;
		scrollTo({ top: at * max, behavior: 'smooth' });
	}
	$effect(() => {
		stage.dim = 0;
		onScroll();
		return () => (stage.day = 0);
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

<svelte:window onscroll={onScroll} onresize={onScroll} />

<div class="story" class:on={(stage.phase === 'over' && !stage.explore) || !stage.webgl}>
	<section class="chapter c1" aria-labelledby="c1">
		<small>День · побережье</small>
		<h2 id="c1">378 километров моря</h2>
		<p>
			От Дуранкулака на севере до Резово у турецкой границы. Скалы и тихие бухты на севере, длинные песчаные пляжи на
			юге. Мы берём в работу только то, что стоит у воды.
		</p>
	</section>
	<section class="chapter c2" aria-labelledby="c2">
		<small>Закат · метраж</small>
		<h2 id="c2">Честное расстояние до воды</h2>
		<p>
			«Первая линия» в объявлениях часто значит «где-то недалеко». Мы меряем путь от дома до реальной береговой линии
			по картам OpenStreetMap и показываем его на макете.
		</p>
	</section>
	<section class="chapter c3" aria-labelledby="c3">
		<small>Ночь · подбор</small>
		<h2 id="c3">Огни, которые станут вашими</h2>
		<p>Расскажите, какой берег вам ближе. Подберём объект, покажем его вживую и проведём сделку до ключей.</p>
		<a class="cta" href="/kontakty">Подобрать объект</a>
	</section>
</div>

<nav class="day" class:on={stage.phase === 'over' && stage.webgl && !stage.explore} aria-label="Время суток на макете">
	{#each DAY as d, i}
		<button class:act={i === active} onclick={() => jump(d.at)}>
			<i></i><span>{d.name}</span><b>{d.time}</b>
		</button>
	{/each}
</nav>

<section class="index" class:on={listOn} class:away={scrolled > 0.08} id="objects" aria-labelledby="objh">
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
	/* the story makes <main> tall: let clicks fall through to the map and its labels */
	:global(main:has(.story)) {
		pointer-events: none;
	}
	.story {
		position: relative;
		z-index: 2;
		pointer-events: none;
		padding-top: 100vh;
		opacity: 0;
		transition: opacity 0.8s var(--ease);
	}
	.story.on {
		opacity: 1;
	}
	.chapter {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
		padding: 0 var(--gutter) clamp(110px, 16vh, 170px);
		max-width: calc(560px + 2 * var(--gutter));
	}
	.chapter small {
		font-size: 11px;
		letter-spacing: 0.2em;
		text-transform: uppercase;
		color: var(--accent);
	}
	.chapter h2 {
		margin: 12px 0 16px;
		font-weight: 500;
		font-size: clamp(34px, 4.6vw, 64px);
		line-height: 1;
		letter-spacing: -0.035em;
		text-shadow: 0 2px 30px rgba(0, 0, 0, 0.6);
	}
	.chapter p {
		font-size: 17px;
		line-height: 1.55;
		color: rgba(236, 239, 232, 0.85);
		text-shadow: 0 1px 14px rgba(0, 0, 0, 0.8);
		max-width: 470px;
	}
	.cta {
		pointer-events: auto;
		align-self: flex-start;
		margin-top: 24px;
		padding: 13px 20px;
		border: 1px solid var(--accent);
		color: var(--ink);
		text-decoration: none;
		background: rgba(3, 9, 13, 0.4);
		backdrop-filter: blur(6px);
		transition: background 0.3s;
	}
	.cta:hover {
		background: rgba(255, 190, 120, 0.15);
	}
	.day {
		position: fixed;
		left: 50%;
		top: 72px;
		translate: -50% 0;
		z-index: 9;
		display: flex;
		gap: 2px;
		padding: 4px;
		border: 1px solid var(--line);
		background: rgba(3, 9, 13, 0.45);
		backdrop-filter: blur(8px);
		border-radius: 999px;
		opacity: 0;
		pointer-events: none;
		transition: opacity 0.6s var(--ease);
	}
	.day.on {
		opacity: 1;
		pointer-events: auto;
	}
	.day button {
		display: flex;
		align-items: center;
		gap: 7px;
		padding: 6px 12px;
		border-radius: 999px;
		border: 0;
		background: none;
		color: var(--muted);
		font: inherit;
		font-size: 12.5px;
		cursor: pointer;
		transition:
			background 0.4s,
			color 0.4s;
	}
	.day button b {
		display: none;
		font-weight: 400;
		font-variant-numeric: tabular-nums;
		opacity: 0.7;
	}
	.day button i {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: currentColor;
		opacity: 0.6;
	}
	.day button.act {
		background: rgba(255, 190, 120, 0.14);
		color: var(--ink);
	}
	.day button.act b {
		display: inline;
	}
	.day button.act i {
		background: var(--accent);
		box-shadow: 0 0 8px var(--accent);
		opacity: 1;
	}
	@media (max-width: 760px) {
		.day {
			top: auto;
			bottom: 14px;
		}
		.day button span {
			display: none;
		}
		.day button.act span {
			display: inline;
		}
		.chapter {
			padding-bottom: 90px;
			background: linear-gradient(transparent 45%, rgba(3, 9, 13, 0.75) 80%);
		}
		.index.on.away {
			opacity: 0;
			pointer-events: none;
		}
	}
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
