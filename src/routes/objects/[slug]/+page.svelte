<script>
	import { stage, sceneRef } from '#lib/stage/state.svelte.js';
	import { formatDistance } from '#lib/geo/math.js';
	import LeadForm from '#lib/LeadForm.svelte';

	let { data } = $props();
	const p = $derived(data.property);
	const arrived = $derived(stage.phase === 'object' || !stage.webgl);
	const price = $derived(p.price ? `${p.price.toLocaleString('ru-RU')} €` : 'по запросу');
	const facts = $derived([
		['До моря', formatDistance(p.sea.meters)],
		['Тип', p.type],
		['Площадь', p.area ? `${p.area} м²` : '—'],
		['Цена', price],
		['Этаж', p.floor ?? '—'],
		['До аэропорта', `${formatDistance(p.airport.meters)}, ${p.airport.name}`]
	]);
	const jsonLd = $derived(
		JSON.stringify({
			'@context': 'https://schema.org',
			'@type': 'RealEstateListing',
			name: p.title,
			description: p.description,
			url: `https://sea-estate.com/objects/${p.slug}`,
			about: {
				'@type': 'Accommodation',
				name: p.title,
				geo: { '@type': 'GeoCoordinates', latitude: p.lat, longitude: p.lon },
				address: { '@type': 'PostalAddress', addressLocality: p.place, addressCountry: 'BG' }
			}
		})
	);

	let y = $state(0);
	let vh = $state(800);
	$effect(() => {
		stage.dim = Math.min(0.72, (y / vh) * 0.8);
		sceneRef.api?.setPaused(y > vh * 1.6);
	});
	$effect(() => () => {
		stage.dim = 0;
		sceneRef.api?.setPaused(false);
	});
</script>

<svelte:window bind:scrollY={y} bind:innerHeight={vh} />

<svelte:head>
	<title>{p.title} — {formatDistance(p.sea.meters)} до моря · Sea Estate</title>
	<meta name="description" content="{p.title}, {p.place}. {p.line} До моря {formatDistance(p.sea.meters)}." />
	{@html `<script type="application/ld+json">${jsonLd}</script>`}
</svelte:head>

<article>
	<section class="first" class:on={arrived}>
		<a class="link-quiet back" href="/">← Всё побережье</a>
		<div class="head">
			{#if p.demo}<span class="demo-tag">Демо-объект, данные условные</span>{/if}
			<p class="place">{p.place}</p>
			<h1>{p.title}</h1>
			<p class="line">{p.line}</p>
		</div>
		<a class="scroll" href="#details">Подробнее <span aria-hidden="true">↓</span></a>
	</section>

	<div class="sheet" id="details">
		<section class="facts" aria-label="Главное">
			<dl>
				{#each facts as [k, v]}
					<div><dt>{k}</dt><dd>{v}</dd></div>
				{/each}
			</dl>
			<p class="fine">Расстояния по прямой, посчитаны по береговой линии OpenStreetMap.</p>
		</section>

		<section class="block">
			<h2>Об объекте</h2>
			<p class="lead">{p.description}</p>
		</section>

		<section class="block">
			<h2>Съёмка</h2>
			<div class="media-slot">
				<p>Здесь будет 3D-скан объекта по реальной съёмке и фотографии.</p>
			</div>
		</section>

		<section class="block">
			<h2>Рядом</h2>
			<ul class="near">
				{#each p.highlights as h}<li>{h}</li>{/each}
			</ul>
		</section>

		<section class="block">
			<h2>Покупка</h2>
			<p class="lead">
				Сколько стоит сделка сверх цены, какие документы нужны и сколько это занимает — по шагам.
			</p>
			<a class="link-quiet" href="/kak-kupit">Как купить недвижимость в Болгарии →</a>
		</section>

		<section class="block" id="lead">
			<h2>Узнать больше</h2>
			<LeadForm subject={p.title} />
		</section>
	</div>
</article>

<a class="sticky cta" href="#lead"><span>Узнать цену и условия</span><span class="arr">→</span></a>

<style>
	.first {
		min-height: 100dvh;
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
		padding: 96px var(--gutter) 56px;
		position: relative;
	}
	.back {
		position: absolute;
		top: 84px;
		left: var(--gutter);
	}
	.head {
		max-width: 680px;
		display: grid;
		gap: 12px;
		justify-items: start;
		opacity: 0;
		translate: 0 24px;
		transition:
			opacity 0.9s var(--ease),
			translate 1.1s var(--ease);
	}
	.first.on .head {
		opacity: 1;
		translate: 0 0;
	}
	.place {
		color: var(--accent);
		font-size: 14px;
	}
	h1 {
		font-size: clamp(40px, 6vw, 88px);
		font-weight: 500;
		line-height: 0.95;
		letter-spacing: -0.045em;
		text-wrap: balance;
	}
	.line {
		font-size: 18px;
		color: var(--muted);
		max-width: 460px;
	}
	.scroll {
		margin-top: 32px;
		font-size: 13px;
		color: var(--muted);
		text-decoration: none;
		align-self: flex-start;
	}
	.sheet {
		background: linear-gradient(180deg, rgba(6, 19, 26, 0.86), var(--sheet) 240px);
		backdrop-filter: blur(10px);
		border-top: 1px solid var(--line);
		padding: 56px var(--gutter) 140px;
		display: grid;
		gap: 72px;
	}
	.sheet > section {
		max-width: 1080px;
	}
	dl {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
		border-top: 1px solid var(--line);
	}
	dl div {
		padding: 16px 16px 16px 0;
		border-bottom: 1px solid var(--line);
	}
	dt {
		font-size: 12px;
		color: var(--muted);
	}
	dd {
		margin-top: 4px;
		font-size: 19px;
		font-variant-numeric: tabular-nums;
	}
	dl div:first-child dd {
		color: var(--accent);
	}
	.fine {
		margin-top: 10px;
		font-size: 12px;
		color: var(--muted);
	}
	.block {
		display: grid;
		grid-template-columns: minmax(140px, 260px) minmax(0, 640px);
		gap: 16px 40px;
		align-items: start;
	}
	.block > :not(h2) {
		grid-column: 2;
	}
	h2 {
		font-size: 14px;
		font-weight: 400;
		color: var(--muted);
		padding-top: 4px;
	}
	.lead {
		font-size: 20px;
		line-height: 1.5;
		letter-spacing: -0.01em;
		text-wrap: pretty;
	}
	.media-slot {
		aspect-ratio: 16 / 9;
		border: 1px dashed var(--line);
		display: grid;
		place-items: center;
		text-align: center;
		padding: 24px;
		color: var(--muted);
		font-size: 14px;
	}
	.near {
		list-style: none;
		border-top: 1px solid var(--line);
	}
	.near li {
		padding: 12px 0;
		border-bottom: 1px solid var(--line);
		font-size: 17px;
	}
	.sticky {
		position: fixed;
		right: var(--gutter);
		bottom: 20px;
		z-index: 15;
	}
	@media (max-width: 760px) {
		.first {
			padding-bottom: 104px;
		}
		.block {
			grid-template-columns: 1fr;
		}
		.block > :not(h2) {
			grid-column: 1;
		}
		.sticky {
			left: var(--gutter);
			bottom: max(12px, env(safe-area-inset-bottom));
		}
		.lead {
			font-size: 18px;
		}
	}
</style>
