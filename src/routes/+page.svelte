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
	 *
	 * BUNDLE: the comparer is imported dynamically and only after mount, so a
	 * production build never fetches its chunk. SSR and the first client render
	 * both emit an empty reserved slot, which is why this does not produce a
	 * hydration mismatch — the two renders agree, and the bar fills a slot whose
	 * height was already reserved, so nothing moves. The hero copy comes from the
	 * server payload rather than a client import, keeping the other two copy
	 * bundles out of the browser entirely.
	 */
	import { onMount } from 'svelte';
	import ScenarioEntry from '$lib/ScenarioEntry.svelte';
	import QuietCoastHeader from '$lib/home/QuietCoastHeader.svelte';
	import HomeHero from '$lib/home/HomeHero.svelte';
	import ProcessEvidence from '$lib/home/ProcessEvidence.svelte';
	import EnquirySection from '$lib/home/EnquirySection.svelte';
	import QuietCoastFooter from '$lib/home/QuietCoastFooter.svelte';
	import { openEnquiry, INTENT } from '$lib/enquiry.js';
	import { DEFAULT_THEME, DEFAULT_COPY } from '$lib/preview-comparer.js';
	import '$lib/styles/home-themes.css';

	export let data;

	$: previewEnabled = data?.previewComparer === true;
	$: serverVariant = data?.variant ?? { theme: DEFAULT_THEME, copy: DEFAULT_COPY };

	/*
	 * Production is pinned, not merely defaulted: a non-preview render uses
	 * quiet/scenario regardless of what arrived in the payload.
	 */
	let theme = DEFAULT_THEME;
	let copy = DEFAULT_COPY;

	$: theme = previewEnabled ? serverVariant.theme : DEFAULT_THEME;
	$: copy = previewEnabled ? serverVariant.copy : DEFAULT_COPY;

	/* Server sends the resolved bundle; the table only exists in a preview. */
	$: heroCopy =
		(previewEnabled && data?.heroCopyTable?.[copy]) || data?.heroCopy || { eyebrow: '', h1: '', lead: '' };

	let PreviewComparerComponent = null;

	onMount(async () => {
		if (!previewEnabled) return;
		const module = await import('$lib/PreviewComparer.svelte');
		PreviewComparerComponent = module.default;
	});

	function onVariantChange(event) {
		theme = event.detail.theme;
		copy = event.detail.copy;
	}

	function openHeroEnquiry() {
		openEnquiry({ intent: INTENT.SELECTION, scenario: data?.heroScenario || '' });
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
		<!-- Height reserved so the late-mounted bar cannot shift the page. -->
		<div class="comparer-slot">
			{#if PreviewComparerComponent}
				<svelte:component
					this={PreviewComparerComponent}
					theme={serverVariant.theme}
					copy={serverVariant.copy}
					themeSource={serverVariant.themeSource}
					copySource={serverVariant.copySource}
					on:change={onVariantChange}
				/>
			{/if}
		</div>
	{/if}

	<QuietCoastHeader />

	<main id="main">
		<HomeHero
			copy={heroCopy}
			ctaPrimary={data?.heroCta?.primary}
			ctaSecondary={data?.heroCta?.secondary}
			onPrimary={openHeroEnquiry}
			reserveHeight={previewEnabled}
		/>
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
	 *
	 * No overflow-x: hidden here. That was masking real horizontal overflow
	 * instead of fixing it — the page still scrolled sideways on some elements,
	 * the mask just hid the scrollbar. Overflow is now prevented at the source
	 * (min-width: 0 on flex/grid children, wrapping long words), and the QA
	 * script asserts scrollWidth === clientWidth at 320px.
	 */
	.qc-home {
		position: relative;
		min-height: 100vh;
		background: var(--qc-surface);
		font-family: var(--qc-font-ui);
		color: var(--qc-ink-700);
	}

	/*
	 * Matches the rendered height of the comparer bar at each breakpoint, so the
	 * dynamically imported component drops into space that already exists.
	 */
	.comparer-slot {
		min-height: 96px;
	}

	@media (min-width: 768px) {
		.comparer-slot {
			min-height: 60px;
		}
	}

	.qc-home :global(main) {
		display: block;
	}

	.qc-skip-link {
		position: absolute;
		/* Off-canvas without widening the page: left:-9999px would create real
		   horizontal overflow measurable at 320px. */
		left: 0;
		top: 0;
		transform: translateY(-200%);
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
		transform: translateY(0);
	}

	@media (prefers-reduced-motion: reduce) {
		.qc-skip-link {
			transition: none;
		}
	}
</style>
