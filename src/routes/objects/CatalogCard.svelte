<script>
	/*
	 * Catalog card — Quiet Coast.
	 *
	 * What it replaces: a <figure> with a fixed 850–900px height on a #111827
	 * panel, an <h1> per card (so a catalog page shipped 20+ h1s), cyan gradient
	 * buttons with glow shadows, a hover-swap second image that downloaded a
	 * full-size photo per card for a hover effect, click handlers on <p> and
	 * <h1> elements, an "open in new tab" link — and, most consequentially, an
	 * `{#if object.photo}` around EVERYTHING, so an object without a photo
	 * rendered a completely empty card. It also printed `Цена:{price} €`
	 * unconditionally, so a missing price rendered "Цена: €".
	 *
	 * Structure now: <li><article>, media 4:3, one h2, facts only when known,
	 * one link. Presentation rules live in catalog-format.js and are unit-tested,
	 * because that is where a page starts telling small lies.
	 */
	import { onMount } from 'svelte';
	import {
		formatPrice,
		buildFacts,
		buildKicker,
		imageAlt,
		hasPhoto,
		withPreviewQuery
	} from '$lib/catalog-format.js';

	export let object;
	/** Current location.search, so internal links keep the preview variant. */
	export let search = '';
	/** Only the first card's image is a priority fetch; the rest lazy-load. */
	export let priority = false;

	$: price = formatPrice(object?.price);
	$: facts = buildFacts(object);
	$: kicker = buildKicker(object);
	$: alt = imageAlt(object);
	$: photo = hasPhoto(object);
	$: href = withPreviewQuery(`/objects/${object?.slug ?? ''}`, search);

	/*
	 * Broken-image fallback that works BEFORE hydration.
	 *
	 * Svelte's on:error only binds once the component hydrates, so an image that
	 * fails during the server-rendered first paint — the common case on a slow
	 * or blocked CDN — left a broken-image icon until JS arrived, or forever if
	 * it never did. The inline `onerror` attribute below is parsed with the
	 * markup and fires immediately: it flags the wrapper, and CSS swaps in the
	 * placeholder that is already in the DOM. No JavaScript of ours needs to
	 * have run.
	 */
	const ON_ERROR = "this.closest('.media')?.classList.add('media-failed')";

	let mediaEl;
	let failed = false;

	function markFailed() {
		failed = true;
		mediaEl?.classList.add('media-failed');
	}

	/*
	 * The error EVENT is not enough on its own.
	 *
	 * Three cases fire no error for us to hear: a warm cache where the image
	 * already failed and the browser replays the failure before our listener
	 * exists; a back/forward restore, where the element is reinstated in its
	 * final state; and hydration itself, which happens after the inline handler
	 * may already have run and been discarded. In all of them `complete` is true
	 * while `naturalWidth` is 0 — the canonical "decoded nothing" signal — so we
	 * check it once on mount as well as listening.
	 */
	onMount(() => {
		const img = mediaEl?.querySelector('img');
		if (img && img.complete && img.naturalWidth === 0) markFailed();
	});
</script>

<li class="card-item">
	<article class="qc-card card">
		<div class="media" class:media-empty={!photo} class:media-failed={failed} bind:this={mediaEl}>
			{#if photo}
				<img
					class="photo"
					src={object.photo.url}
					{alt}
					loading={priority ? 'eager' : 'lazy'}
					fetchpriority={priority ? 'high' : 'auto'}
					decoding="async"
					width="800"
					height="600"
					onerror={ON_ERROR}
					on:error={markFailed}
				/>
			{/if}
			<!--
			  Always in the DOM so the swap needs no JavaScript of ours: CSS hides
			  it when a photo is present and shows it the moment the wrapper is
			  flagged, or immediately when there is no photo at all.
			-->
			<!--
			  Two different facts, two different messages. "No photo" is a statement
			  about the CMS record; "could not load" is a statement about this
			  request. Showing the first when an image actually failed would tell
			  the visitor the listing has no photo, which is not true.
			  Both occupy the same 4:3 box, so neither causes a shift.
			-->
			{#if photo}
				<div class="placeholder failed-note" role="img" aria-label="Не удалось загрузить фотографию объекта">
					<span class="qc-caption placeholder-text">Не удалось загрузить фото</span>
				</div>
			{:else}
				<div class="placeholder" role="img" aria-label="Фотография объекта пока не добавлена">
					<span class="qc-caption placeholder-text">Фото пока нет</span>
				</div>
			{/if}
		</div>

		<div class="body">
			{#if kicker.length}
				<p class="qc-label kicker">{kicker.join(' · ')}</p>
			{/if}

			<h2 class="qc-heading-3 name">
				<a class="name-link" {href}>{object?.name ?? 'Объект'}</a>
			</h2>

			<p class="qc-data price" class:unknown={!price.known}>{price.text}</p>

			{#if facts.length}
				<dl class="facts">
					{#each facts as fact (fact.key)}
						<div class="fact">
							<dt class="qc-caption fact-label">{fact.label}</dt>
							<dd class="qc-body fact-value">{fact.value}</dd>
						</div>
					{/each}
				</dl>
			{/if}

			<p class="qc-caption disclaimer">Цена и наличие уточняются</p>

			<a class="qc-cta qc-cta-secondary card-cta" {href}>Смотреть объект</a>
		</div>
	</article>
</li>

<style>
	.card-item {
		display: flex;
		min-width: 0;
	}

	.card {
		display: flex;
		flex-direction: column;
		width: 100%;
		/* No fixed height. Cards stretch to the tallest in the row via the grid. */
		padding: 0;
		overflow: hidden;
		min-width: 0;
	}

	.media {
		/* Reserved geometry: identical for a photo, a broken URL and no photo. */
		position: relative;
		aspect-ratio: 4 / 3;
		width: 100%;
		background: var(--qc-surface-subtle);
		border-bottom: var(--qc-rule-weight, 1px) solid var(--qc-border);
		overflow: hidden;
	}

	/* A photo is present and loading fine: hide the standby placeholder. */
	.placeholder {
		display: none;
	}

	/*
	 * `media-failed` is added at RUNTIME by the inline onerror, so it never
	 * appears in the template — and Svelte prunes CSS for selectors it cannot
	 * see, which silently dropped these two rules and left a broken image
	 * showing with the placeholder hidden behind it. Wrapping just that token in
	 * :global() keeps the rules in the output. `media-empty` is in the template
	 * via class:, so it needs no such treatment.
	 */
	.media:global(.media-failed) .placeholder,
	.media-empty .placeholder {
		display: flex;
	}

	/* The failed image is removed from the box entirely, not left broken. */
	.media:global(.media-failed) .photo {
		display: none;
	}

	.photo {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	.placeholder {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		align-items: center;
		justify-content: center;
		background: var(--qc-surface-subtle);
	}

	.placeholder-text {
		color: var(--qc-ink-700);
	}

	.body {
		display: flex;
		flex-direction: column;
		gap: var(--qc-space-2);
		padding: var(--qc-space-4);
		flex: 1 1 auto;
		min-width: 0;
	}

	.kicker {
		margin: 0;
		color: var(--qc-muted);
	}

	.name {
		margin: 0;
		overflow-wrap: break-word;
	}

	.name-link {
		color: inherit;
		text-decoration: none;
	}

	.name-link:hover {
		text-decoration: underline;
		text-underline-offset: 3px;
	}

	.name-link:focus-visible {
		outline: 3px solid var(--qc-focus);
		outline-offset: 2px;
		border-radius: 4px;
	}

	.price {
		margin: 0;
		font-size: 18px;
		line-height: 24px;
		color: var(--qc-ink-950);
	}

	/* "Цена по запросу" is information, not a number: quieter, never emphasised. */
	.price.unknown {
		font-weight: 500;
		color: var(--qc-ink-700);
	}

	.facts {
		margin: var(--qc-space-1) 0 0;
		display: grid;
		gap: 2px;
	}

	.fact {
		display: flex;
		gap: var(--qc-space-2);
		align-items: baseline;
		min-width: 0;
	}

	.fact-label {
		flex: 0 0 auto;
		color: var(--qc-muted);
	}

	.fact-value {
		margin: 0;
		min-width: 0;
		overflow-wrap: break-word;
	}

	.disclaimer {
		margin: var(--qc-space-1) 0 0;
		color: var(--qc-ink-700);
	}

	.card-cta {
		margin-top: auto;
		width: 100%;
	}
</style>
