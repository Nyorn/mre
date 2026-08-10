<script>
	/*
	 * Home — Quiet Coast shell.
	 *
	 * This route previously loaded three scripts before it could show anything:
	 * Three.js from unpkg, a Splide shader carousel from /static, and a five-image
	 * preload gated behind a hard 1500ms setTimeout that also locked body scroll.
	 * All of it is gone from this page. What replaces it is a static hero, the
	 * scenario entry, process/evidence, enquiry and a footer — the IA in
	 * product-flow-delta.v1 §4, in that order.
	 *
	 * Shared modules the carousel used (Carousel.svelte, Preloader.svelte,
	 * InfoBlock.svelte) are NOT deleted: other routes and the layout still
	 * reference them. Home simply stops importing them, which tests/home-legacy-
	 * free.test.js pins down statically.
	 *
	 * Landmarks: this page owns its own header/main/footer. +layout.svelte hands
	 * the home route the bare slot precisely so the skip link can be the first
	 * focusable element and there is exactly one <main>.
	 */
	import ScenarioEntry from '$lib/ScenarioEntry.svelte';
	import QuietCoastHeader from '$lib/home/QuietCoastHeader.svelte';
	import HomeHero from '$lib/home/HomeHero.svelte';
	import ProcessEvidence from '$lib/home/ProcessEvidence.svelte';
	import EnquirySection from '$lib/home/EnquirySection.svelte';
	import QuietCoastFooter from '$lib/home/QuietCoastFooter.svelte';
	import PreviewComparer from '$lib/PreviewComparer.svelte';
	import { HERO_COPY } from '$lib/home-copy.js';
	import { DEFAULT_THEME, DEFAULT_COPY } from '$lib/preview-comparer.js';
	import '$lib/styles/home-themes.css';

	export let data;

	$: previewEnabled = data?.previewComparer === true;
	$: variant = data?.variant ?? { theme: DEFAULT_THEME, copy: DEFAULT_COPY };

	/*
	 * Production is pinned, not merely defaulted: even if a variant somehow
	 * arrived in the payload, a non-preview render uses quiet/scenario.
	 */
	let theme = DEFAULT_THEME;
	let copy = DEFAULT_COPY;

	$: theme = previewEnabled ? variant.theme : DEFAULT_THEME;
	$: copy = previewEnabled ? variant.copy : DEFAULT_COPY;

	$: heroCopy = HERO_COPY[copy] ?? HERO_COPY[DEFAULT_COPY];

	function onVariantChange(event) {
		theme = event.detail.theme;
		copy = event.detail.copy;
	}

	const PRODUCTION_HOME = 'https://sea-estate.com/';
</script>

<svelte:head>
	<title>Sea Estate — недвижимость на побережье Болгарии под ваш сценарий владения</title>
	<meta
		name="description"
		content="Подбор и сопровождение недвижимости на болгарском побережье — для жизни, отдыха, аренды или переезда. Начинаем с задачи, а не с каталога."
	/>
	<!-- A deploy preview must never compete with the live home page in search. -->
	{#if previewEnabled}
		<meta name="robots" content="noindex,nofollow" />
	{/if}
	<link rel="canonical" href={PRODUCTION_HOME} />
</svelte:head>

<a class="qc-skip-link" href="#main">Перейти к основному содержанию</a>

<div class="qc-home" data-preview-theme={previewEnabled ? theme : null}>
	{#if previewEnabled}
		<PreviewComparer
			theme={variant.theme}
			copy={variant.copy}
			themeSource={variant.themeSource}
			copySource={variant.copySource}
			on:change={onVariantChange}
		/>
	{/if}

	<QuietCoastHeader />

	<main id="main">
		<HomeHero copy={heroCopy} reserveHeight={previewEnabled} />
		<ScenarioEntry />
		<ProcessEvidence />
		<EnquirySection />
	</main>

	<QuietCoastFooter />
</div>

<style>
	/*
	 * The shell is opaque and full-height on purpose. global.css paints two
	 * radial gradients on <body> (secondary + error hues) with
	 * background-attachment: fixed. Rather than editing a global that every
	 * other route still depends on, home covers it with its own surface.
	 */
	.qc-home {
		position: relative;
		min-height: 100vh;
		background: var(--qc-surface);
		font-family: var(--qc-font-ui);
		color: var(--qc-ink-700);
		/* Nothing inside home may push a horizontal scrollbar. */
		overflow-x: hidden;
	}

	.qc-home :global(main) {
		display: block;
	}

	.qc-skip-link {
		position: absolute;
		left: -9999px;
		top: 0;
		z-index: 1300;
		padding: 12px 16px;
		background: var(--qc-surface);
		color: var(--qc-ink-950);
		border: 2px solid var(--qc-focus);
		border-radius: 0 0 6px 0;
		font-family: var(--qc-font-ui);
		font-size: 16px;
		text-decoration: none;
	}

	.qc-skip-link:focus {
		left: 0;
	}
</style>
