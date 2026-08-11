<script>
  /*
   * Catalog — Quiet Coast shell (Slice 1).
   *
   * The filter and sort PREDICATES below are carried over UNCHANGED on purpose.
   * They are the load-bearing part for real data, and rewriting them while the
   * shell changes would make any regression impossible to attribute.
   *
   * The filter CONTROLS were replaced after Cypress's review: the legacy
   * FilterBar/FullFilterModal/SortModal had placeholder-only labels, icon-only
   * buttons with no accessible name below 920px, dropdowns without
   * aria-expanded/controls, sub-44px targets and a dark surface. The
   * replacements in $lib/catalog emit byte-identical event payloads, so the
   * predicates never had to change.
   *
   * The preview theme is applied to this root from the server-resolved variant,
   * so the preview_theme/preview_copy carried across catalog links actually does
   * something here. The switcher itself stays on home: per the v3 contract the
   * shareable URL is the source of truth and storage is never restored.
   *
   * Untouched by design: the CMS degraded/noindex contract and the detail route.
   */
  import CatalogFilterBar from '$lib/catalog/CatalogFilterBar.svelte';
  import CatalogSortControl from '$lib/catalog/CatalogSortControl.svelte';
  import CatalogFilterDialog from '$lib/catalog/CatalogFilterDialog.svelte';
  import CmsUnavailable from '$lib/CmsUnavailable.svelte';
  import CatalogCard from './CatalogCard.svelte';
  import QuietCoastHeader from '$lib/home/QuietCoastHeader.svelte';
  import QuietCoastFooter from '$lib/home/QuietCoastFooter.svelte';
  import { openEnquiry, INTENT } from '$lib/enquiry.js';
  import { describeCount, sortObjects } from '$lib/catalog-format.js';
  import { page } from '$app/stores';
  import '$lib/styles/quiet-shell.css';
  /*
   * The theme bundles themselves. The catalog root already carried
   * data-preview-theme, but without these rules loaded on this route the
   * attribute selected nothing: all three directions rendered identical Quiet
   * Coast tokens. Importing them here is what makes the carried query real.
   */
  import '$lib/styles/home-themes.css';

  export let data;

  let showFullFilters = false;
  let fullFiltersOpener = null;
  // An outage yields an empty list plus data.cmsError; both paths must be safe.
  let filteredData = data.objects || [];
  let sortOptions = {};
  let lastFilterOptions = {};

  $: total = (data.objects || []).length;
  $: count = describeCount(filteredData.length, total);
  $: search = $page.url.search;

  /* Production never enables the gate, so the attribute is simply absent. */
  $: previewEnabled = data?.previewEnabled === true;
  $: previewTheme = previewEnabled ? (data?.variant?.theme ?? null) : null;

  /* ---- existing filter/sort semantics, carried over verbatim ---- */

  /*
   * `activeSort` is a parameter only so handleSort can pass a fresh value in the
   * same tick. It used to be named `sortOptions`, which SHADOWED the module
   * state of the same name: every call from the filter bar or the full-filter
   * dialog passed no second argument, so the default {} silently discarded the
   * visitor's sort choice and the list snapped back to CMS order.
   */
  function handleFilter(event, activeSort = sortOptions) {
    lastFilterOptions = event ? event.detail : lastFilterOptions;
    const { city, price, type, bedrooms, elevator, area, bathrooms, pool, parking, fromBuilder, minPrice, maxPrice, minArea, maxArea, minFloor, maxFloorValue, heat, security, conserj, video, fitness, restoraunts, playground, tv, internet } = event.detail;

    filteredData = (data.objects || []).filter(object => {
      let bedroomsNum = bedrooms ? parseInt(bedrooms, 10) : null;
      let bathroomsNum = bathrooms ? parseInt(bathrooms, 10) : null;
      let matchesPrice = (minPrice === undefined || object.price >= minPrice) &&
        (maxPrice === undefined || object.price <= maxPrice);
      let matchesArea = (minArea === undefined || object.area >= minArea) &&
        (maxArea === undefined || object.area <= maxArea);
      let matchesFloor = (minFloor === undefined || object.floor >= minFloor) &&
        (maxFloorValue === undefined || object.floor <= maxFloorValue)

      let matchesCity = !city || object.city === city;
      let matchesType = !type || object.type === type;
      let matchesBedrooms = bedroomsNum === null || object.bedrooms === bedroomsNum;
      let matchesElevator = elevator === undefined || object.elevator === elevator;
      let matchesBathrooms = bathroomsNum === null || object.bathrooms === bathroomsNum;
      let matchesPool = pool === undefined || object.pool === pool;
      let matchesParking = !parking || object.parking === parking;
      let matchesFromBuilder = fromBuilder === undefined || object.fromBuilder === fromBuilder;
      let matchesHeating = heat === undefined || object.heat === heat;
      let matchesSecurity = security === undefined || object.security === security;
      let matchesConserj = conserj === undefined || object.conserj === conserj;
      let matchesVideo = video === undefined || object.video === video;
      let matchesFitness = fitness === undefined || object.fitness === fitness;
      let matchesRestoraunts = restoraunts === undefined || object.restoraunts === restoraunts;
      let matchesPlayground = playground === undefined || object.playground === playground;
      let matchesTv = tv === undefined || object.tv === tv;
      let matchesInternet = internet === undefined || object.internet === internet;

      return matchesCity &&
        matchesType &&
        matchesPrice &&
        matchesBedrooms &&
        matchesElevator &&
        matchesArea &&
        matchesBathrooms &&
        matchesPool &&
        matchesParking &&
        matchesHeating &&
        matchesFloor &&
        matchesFromBuilder &&
        matchesSecurity &&
        matchesConserj &&
        matchesVideo &&
        matchesFitness &&
        matchesRestoraunts &&
        matchesPlayground &&
        matchesTv &&
        matchesInternet;
    });

    // Ordering rules live in catalog-format.js and are unit-tested there.
    filteredData = sortObjects(filteredData, activeSort);
  }

  function openFullFilters(event) {
    // Remember the trigger so the dialog can return focus to it on close.
    fullFiltersOpener = event?.detail?.opener ?? document.activeElement;
    showFullFilters = true;
  }

  function handleFullFilter(event) {
    handleFilter(event);
  }

  function handleSort(event) {
    sortOptions = event.detail;
    handleFilter({ detail: lastFilterOptions }, sortOptions);
  }

  /*
   * Reset clears the FILTERS. The sort is a separate choice the visitor made and
   * is deliberately preserved — and re-applied, so the order on screen matches
   * the control that is still showing it.
   */
  function resetFilters() {
    lastFilterOptions = {};
    filteredData = sortObjects(data.objects || [], sortOptions);
  }
</script>

<svelte:head>
  <title>Каталог объектов на побережье Болгарии — Sea Estate</title>
  <meta
    name="description"
    content="Объекты на болгарском побережье: город, площадь, спальни и этаж по каждому объекту. Цена и наличие уточняются."
  />

  <!--
    Degraded catalog only. HTTP stays 200 because the visitor gets a usable
    page, but a 200 that lists nothing is exactly what a crawler would happily
    index in place of the real catalog. noindex is scoped to this branch: a
    healthy catalog, a healthy detail page and a genuine 404 are untouched, so
    no real URL loses its indexability because the CMS blinked.
  -->
  {#if data.cmsError}
    <meta name="robots" content="noindex" />
  {/if}
</svelte:head>

<a class="qc-skip-link" href="#main">Перейти к основному содержанию</a>

<div class="qc-home" data-preview-theme={previewTheme}>
  <QuietCoastHeader />

  <main id="main">
    {#if data.cmsError}
      <CmsUnavailable failure={data.cmsError} level={1} />
    {:else}
      <section class="qc-section intro" aria-labelledby="catalog-heading">
        <div class="qc-container">
          <p class="qc-label">Каталог</p>
          <h1 id="catalog-heading" class="qc-heading-2 heading">Объекты на побережье Болгарии</h1>
          <p class="qc-body-lg lead">
            Опубликованные объекты. По каждому показываем только те данные, которые у нас
            есть: город, площадь, спальни и этаж. Цена и наличие уточняются.
          </p>
        </div>
      </section>

      <section class="qc-section results" aria-labelledby="results-heading">
        <div class="qc-container">
          <h2 id="results-heading" class="qc-heading-3 sub">Подбор по фильтрам</h2>

          <div class="filter-surface qc-panel">
            <CatalogFilterBar on:filter={handleFilter} on:open-full-filters={openFullFilters} />
            <div class="sort-row">
              <CatalogSortControl on:sort={handleSort} />
            </div>
          </div>

          <p class="qc-data count" role="status" aria-live="polite">{count.text}</p>

          {#if count.state === 'empty-catalog'}
            <div class="qc-panel state">
              <h3 class="qc-heading-3 state-title">Пока нет опубликованных объектов</h3>
              <p class="qc-body state-body">
                Сейчас в каталоге нет опубликованных объектов. Опишите задачу — ответим по
                вашему запросу.
              </p>
              <button
                type="button"
                class="qc-cta qc-cta-primary state-cta"
                on:click={() => openEnquiry({ intent: INTENT.SELECTION, scenario: 'Каталог пуст — прошу прислать подборку' })}
              >
                Оставить заявку
              </button>
            </div>
          {:else if count.state === 'empty-filtered'}
            <div class="qc-panel state">
              <h3 class="qc-heading-3 state-title">Ничего не найдено по выбранным фильтрам</h3>
              <p class="qc-body state-body">
                В каталоге {total} объектов, ни один не подходит под выбранные условия.
                Смягчите фильтры или опишите задачу.
              </p>
              <div class="state-actions">
                <button type="button" class="qc-cta qc-cta-secondary" on:click={resetFilters}>
                  Сбросить фильтры
                </button>
                <button
                  type="button"
                  class="qc-cta qc-cta-primary"
                  on:click={() => openEnquiry({ intent: INTENT.SELECTION, scenario: 'Не нашёл подходящий объект в каталоге' })}
                >
                  Подобрать вручную
                </button>
              </div>
            </div>
          {:else}
            <ul class="grid">
              {#each filteredData as object, i (object.slug || i)}
                <CatalogCard {object} {search} priority={i === 0} />
              {/each}
            </ul>
          {/if}
        </div>
      </section>

      <section class="qc-section enquiry" aria-labelledby="catalog-enquiry-heading">
        <div class="qc-container">
          <p class="qc-label">Заявка</p>
          <h2 id="catalog-enquiry-heading" class="qc-heading-2 heading">Не нашли подходящий объект?</h2>
          <p class="qc-body-lg lead">
            Опишите, что вы ищете. Цену и наличие по конкретным объектам уточняем отдельно.
          </p>
          <button
            type="button"
            class="qc-cta qc-cta-primary enquiry-cta"
            on:click={() => openEnquiry({ intent: INTENT.SELECTION, scenario: 'Подбор объектов из каталога' })}
          >
            Оставить заявку
          </button>
        </div>
      </section>
    {/if}
  </main>

  <QuietCoastFooter />
</div>

<!--
  Outside .qc-home on purpose. The dialog inerts `.qc-home > *` while open, and a
  dialog nested inside <main> would have been excluded from that sweep (it
  contains the dialog), leaving the page reachable behind the modal — the same
  trap the preview comparer hit.
-->
<CatalogFilterDialog
  bind:open={showFullFilters}
  opener={fullFiltersOpener}
  theme={previewTheme}
  on:full-filter={handleFullFilter}
/>

<style>
  .intro,
  .results {
    background: var(--qc-surface);
    border-bottom: var(--qc-rule-weight, 1px) solid var(--qc-border);
  }

  .enquiry {
    background: var(--qc-surface-subtle);
  }

  .heading {
    margin: var(--qc-space-2) 0 0;
    text-align: left;
  }

  .lead {
    margin: var(--qc-space-4) 0 0;
    max-width: 62ch;
  }

  .sub {
    margin: 0;
    text-align: left;
  }

  /*
   * FilterBar's own markup is untouched, so its legacy dark chrome
   * (bg-[#1f2937], text-white, bg-gray-800) is neutralised here instead. This is
   * presentation only and scoped to this page: the component keeps its logic,
   * its events and its field set.
   */
  .filter-surface {
    margin-top: var(--qc-space-4);
    padding: var(--qc-space-3);
  }

  .filter-surface :global(.filter-bar) {
    background: transparent !important;
    color: var(--qc-ink-950);
    margin-bottom: 0;
  }

  .filter-surface :global(select),
  .filter-surface :global(input),
  .filter-surface :global(button) {
    background: var(--qc-surface);
    color: var(--qc-ink-950);
    border: 1px solid var(--qc-border-strong);
    border-radius: var(--qc-cta-radius, 8px);
    /* Every control reaches the 44px target. */
    min-height: 44px;
    font-family: var(--qc-font-ui);
    font-size: 16px;
  }

  .filter-surface :global(select:focus-visible),
  .filter-surface :global(input:focus-visible),
  .filter-surface :global(button:focus-visible) {
    outline: 3px solid var(--qc-focus);
    outline-offset: 2px;
  }

  .sort-row {
    margin-top: var(--qc-space-3);
    display: flex;
  }

  .count {
    margin: var(--qc-space-5) 0 0;
    color: var(--qc-ink-700);
  }

  .grid {
    list-style: none;
    margin: var(--qc-space-4) 0 0;
    padding: 0;
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--qc-space-5);
  }

  .state {
    margin-top: var(--qc-space-4);
    max-width: 72ch;
  }

  .state-title {
    margin: 0;
  }

  .state-body {
    margin: var(--qc-space-3) 0 0;
    color: var(--qc-ink-700);
  }

  .state-cta,
  .state-actions {
    margin-top: var(--qc-space-5);
  }

  .state-actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--qc-space-3);
  }

  .enquiry-cta {
    margin-top: var(--qc-space-5);
  }

  @media (min-width: 640px) {
    .grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (min-width: 1024px) {
    .grid {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }
</style>
