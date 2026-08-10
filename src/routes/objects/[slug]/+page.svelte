<script>
	/*
	 * Object detail — Slice A (P0.3 + P0.7).
	 *
	 * Two things changed here and both are deliberate:
	 *
	 * 1. Mobile overflow. The measured overflow sources in this file were a
	 *    fixed `width="400"` map iframe and `img { max-width: 400px }`, both of
	 *    which exceed a 390px viewport. `global.css` sets `overflow-x: hidden`
	 *    on :root, which *hides* the symptom without removing the oversized
	 *    boxes, so the fix is done on the elements themselves.
	 *
	 * 2. CTA context. The old CTA passed only `objectName` + `url`, so the form
	 *    could not say which object a request belonged to. It now carries
	 *    object id, slug, name, intent and landing URL through the shared
	 *    enquiry contract.
	 *
	 * Honesty: this branch has no `checkedAt` field, so the page must not claim
	 * the price or availability was verified. It says so explicitly instead.
	 */
	import Carousel from '$lib/Carousel.svelte';
	import { openEnquiry, INTENT } from '$lib/enquiry.js';
	import CmsUnavailable from '$lib/CmsUnavailable.svelte';

	export let data;

	const baseUrl = 'https://sea-estate.com/objects/';

	$: object = data && data.object ? data.object : null;

	// object_id: `key` is the only id-like field this branch's query returns.
	// Slug is always sent alongside it as a stable identifier.
	$: objectId = object ? object.key || '' : '';
	$: objectUrl = object ? `${baseUrl}${object.slug}` : '';

	$: title = object
		? `${object.name} — ${object.city} | Sea Real Estate`
		: 'Объект — Sea Real Estate';
	$: description = object
		? `${object.type} в городе ${object.city}. Площадь ${object.area}, спален: ${object.bedrooms}. Уточните цену и наличие у консультанта Sea Real Estate.`
		: 'Информация об объекте недвижимости в Болгарии.';

	// Price is shown only when present; never render a bare 0 as a price.
	$: hasPrice = object && object.price !== null && object.price !== undefined && object.price !== '' && Number(object.price) !== 0;

	function requestPriceAndAvailability() {
		openEnquiry({
			intent: INTENT.FULL_COST,
			objectId,
			objectSlug: object.slug,
			objectName: object.name,
			url: objectUrl
		});
	}

	function requestViewing() {
		openEnquiry({
			intent: INTENT.OBJECT_VIEWING,
			objectId,
			objectSlug: object.slug,
			objectName: object.name,
			url: objectUrl
		});
	}
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
</svelte:head>

{#if data.cmsError}
	<CmsUnavailable failure={data.cmsError} level={1} />
{:else}


{#if object}
	<div class="qc-container detail-page">
		<h1 class="qc-display-1 object-title">{object.name}</h1>
		<p class="qc-label location-label">{object.city}</p>

		<div class="detail-layout">
			<div class="gallery-column">
				<Carousel slug={object.slug} />
			</div>

			<div class="facts-column">
				<div class="qc-panel facts-panel">
					<p class="qc-label">Основные факты</p>

					<p class="qc-heading-3 price">
						{#if hasPrice}
							{object.price}
						{:else}
							Цена по запросу
						{/if}
					</p>

					<!-- No checked_at exists on this branch, so we state that plainly
					     rather than implying the figures were verified today. -->
					<p class="qc-caption verify-note">Актуальность цены и наличия уточняется у консультанта</p>

					<dl class="fact-grid">
						<div class="fact"><dt class="qc-caption">Город</dt><dd class="qc-data">{object.city}</dd></div>
						<div class="fact"><dt class="qc-caption">Площадь</dt><dd class="qc-data">{object.area}</dd></div>
						<div class="fact"><dt class="qc-caption">Спален</dt><dd class="qc-data">{object.bedrooms}</dd></div>
						<div class="fact"><dt class="qc-caption">Этаж</dt><dd class="qc-data">{object.floor} из {object.maxFloor}</dd></div>
						<div class="fact"><dt class="qc-caption">Лифт</dt><dd class="qc-data">{object.elevator ? 'Есть' : 'Нет'}</dd></div>
					</dl>

					<div class="cta-stack">
						<button type="button" class="qc-cta qc-cta-primary qc-cta-detail" on:click={requestPriceAndAvailability}>
							Уточнить цену и наличие
						</button>
						<button type="button" class="qc-cta qc-cta-secondary qc-cta-detail" on:click={requestViewing}>
							Записаться на просмотр
						</button>
					</div>
				</div>

				{#if object.description}
					<div class="qc-body cms-description">{@html object.description}</div>
				{/if}

				{#if object.location && object.location.lat && object.location.lon}
					<div class="map-wrapper">
						<iframe
							class="map-frame"
							title="Карта расположения объекта: {object.name}"
							loading="lazy"
							frameborder="0"
							scrolling="no"
							src="https://maps.google.com/maps?q={object.location.lat},{object.location.lon}&z=12&amp;output=embed"
						/>
					</div>
				{/if}
			</div>
		</div>
	</div>
{:else}
	<div class="qc-container detail-page">
		<h1 class="qc-heading-2">Объект не найден</h1>
		<p class="qc-state qc-state-info empty-state">
			Возможно, объект снят с публикации или ссылка устарела.
			<a class="qc-link" href="/objects">Вернуться в каталог</a>.
		</p>
	</div>
{/if}
{/if}

<style>
	.detail-page {
		padding: 24px 16px 64px;
	}

	.object-title {
		margin: 0;
		text-align: left;
		/* Long CMS names must wrap rather than push the layout wider. */
		overflow-wrap: anywhere;
	}

	.location-label {
		margin: 8px 0 0;
	}

	.detail-layout {
		display: grid;
		grid-template-columns: 1fr;
		gap: 24px;
		margin-top: 24px;
		/* min-width:0 on grid children is what actually stops wide content
		   (galleries, CMS tables) from expanding the track past the viewport. */
		align-items: start;
	}

	.gallery-column,
	.facts-column {
		min-width: 0;
	}

	@media (min-width: 768px) {
		.detail-layout {
			grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
			gap: 32px;
		}
	}

	.facts-panel {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.price {
		margin: 4px 0 0;
	}

	.verify-note {
		margin: 0;
	}

	.fact-grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 12px;
		margin: 12px 0 0;
	}

	.fact {
		min-width: 0;
	}

	.fact dt {
		margin: 0;
	}

	.fact dd {
		margin: 2px 0 0;
		overflow-wrap: anywhere;
	}

	.cta-stack {
		display: flex;
		flex-direction: column;
		gap: 12px;
		margin-top: 16px;
	}

	.cms-description {
		margin-top: 24px;
		overflow-wrap: anywhere;
	}

	/* CMS rich text can contain oversized media and wide tables — the two most
	   common real-world overflow sources on this page. */
	.cms-description :global(img),
	.cms-description :global(video),
	.cms-description :global(iframe) {
		max-width: 100%;
		height: auto;
	}

	.cms-description :global(table) {
		display: block;
		max-width: 100%;
		overflow-x: auto;
	}

	.map-wrapper {
		margin-top: 24px;
		max-width: 100%;
	}

	/* Was width="400" height="400" as HTML attributes — a hard 400px box that
	   overflows a 390px viewport. */
	.map-frame {
		display: block;
		width: 100%;
		max-width: 100%;
		aspect-ratio: 1 / 1;
		border: 1px solid var(--qc-border);
		border-radius: var(--qc-radius);
	}

	@media (min-width: 768px) {
		.map-frame {
			aspect-ratio: 4 / 3;
		}
	}

	.empty-state {
		margin-top: 16px;
		max-width: 60ch;
	}
</style>
