<script>
	/*
	 * Home — Quiet Coast shell.
	 *
	 * This route previously loaded three scripts before it could show anything:
	 * Three.js from unpkg, a Splide shader carousel from /static, and a five-image
	 * preload gated behind a hard 1500ms setTimeout that also locked body scroll.
	 * All of it is gone. What replaces it is a static hero, the scenario entry,
	 * process/evidence, enquiry and a footer — the IA in product-flow-delta.v1 §4.
	 *
	 * Shared modules the carousel used (Carousel, Preloader, InfoBlock) are NOT
	 * deleted: other routes and the layout still reference them. Home simply stops
	 * importing them, which tests/home-legacy-free.test.js pins down statically.
	 *
	 * LAYOUT CONTRACT for the comparer:
	 *   - Initial render has zero unexpected shift. The variant comes from the
	 *     query, resolved on the server, and nothing is restored from storage
	 *     afterwards, so the first paint is already final.
	 *   - The comparer BAR is server-rendered here, not inside the dynamically
	 *     imported dialog. Its height at first paint is its final height at every
	 *     breakpoint because it is the same DOM — no reserved slot to get wrong.
	 *   - Changing COPY must not move anything: the hero reserves a measured slot.
	 *   - Changing THEME may reflow lower sections, because the approved B and C
	 *     directions genuinely differ in density and spacing. Allowed only as the
	 *     direct result of that input.
	 */
	import { onMount } from 'svelte';
	import ScenarioEntry from '$lib/ScenarioEntry.svelte';
	import QuietCoastHeader from '$lib/home/QuietCoastHeader.svelte';
	import HomeHero from '$lib/home/HomeHero.svelte';
	import ProcessEvidence from '$lib/home/ProcessEvidence.svelte';
	import EnquirySection from '$lib/home/EnquirySection.svelte';
	import QuietCoastFooter from '$lib/home/QuietCoastFooter.svelte';
	import PreviewBar from '$lib/home/PreviewBar.svelte';
	import { openEnquiry, INTENT } from '$lib/enquiry.js';
	import { previewTheme } from '$lib/store.js';
	import { DEFAULT_THEME, DEFAULT_COPY } from '$lib/preview-comparer.js';
	import '$lib/styles/home-themes.css';
	import '$lib/styles/preview-comparer.css';

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

	/* Publish for the modal host, which lives outside .qc-home. */
	$: previewTheme.set(previewEnabled ? theme : '');

	/* Server sends the resolved bundle; the table only exists in a preview. */
	$: heroCopy =
		(previewEnabled && data?.heroCopyTable?.[copy]) ||
		data?.heroCopy || { eyebrow: '', h1: '', lead: '' };

	let ComparerDialog = null;
	let comparerOpen = false;
	let comparerOpener = null;

	onMount(async () => {
		if (!previewEnabled) return;
		const module = await import('$lib/PreviewComparerDialog.svelte');
		ComparerDialog = module.default;
	});

	function openComparer(triggerEl) {
		comparerOpener = triggerEl;
		comparerOpen = true;
	}

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
		<PreviewBar {theme} {copy} open={comparerOpen} onOpen={openComparer} />
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

{#if previewEnabled && ComparerDialog}
	<svelte:component
		this={ComparerDialog}
		{theme}
		{copy}
		bind:open={comparerOpen}
		opener={comparerOpener}
		on:change={onVariantChange}
	/>
{/if}

<style>
	/*
	 * The shell is opaque and full-height on purpose. global.css paints two
	 * radial gradients on <body> with background-attachment: fixed. Rather than
	 * editing a global that every other route depends on, home covers it.
	 *
	 * No overflow-x: hidden here. That was masking real horizontal overflow
	 * instead of fixing it. Overflow is prevented at the source (min-width: 0 on
	 * flex/grid children, no forced word breaks), and the QA script asserts
	 * scrollWidth === clientWidth at 320px.
	 */
	.qc-home {
		position: relative;
		min-height: 100vh;
		background: var(--qc-surface);
		font-family: var(--qc-font-ui);
		color: var(--qc-ink-700);
	}

	.qc-home :global(main) {
		display: block;
	}

	.qc-skip-link {
		position: absolute;
		/* Translated out of view rather than left: -9999px, which was itself real
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
</style>
