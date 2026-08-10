<script>
  /*
   * Catalog — Quiet Coast shell (Slice 1).
   *
   * The filter and sort logic below is carried over UNCHANGED on purpose. It is
   * the one part of this page that is load-bearing for real data, and this slice
   * is a shell/presentation change: rewriting the predicate chain at the same
   * time would make any regression impossible to attribute. FilterBar,
   * FullFilterModal and SortModal are the existing components with the existing
   * events; only their surrounding surface is restyled, from this page's scope,
   * without touching their markup or logic.
   *
   * What did change: the page owns a Quiet Coast shell like /, /contacts and
   * /about; cards are semantic list items with reserved media geometry; result
   * count, empty-filter, empty-catalog and CMS-outage states are distinct and
   * honest; and internal links carry the preview variant forward.
   *
   * Untouched by design: the CMS degraded/noindex contract and the detail route.
   */
  import FilterBar from '../../lib/FilterBar.svelte';
  import FullFilterModal from '../../lib/FullFilterModal.svelte';
  import SortModal from '../../lib/SortModal.svelte';
  import CmsUnavailable from '$lib/CmsUnavailable.svelte';
  import CatalogCard from './CatalogCard.svelte';
  import QuietCoastHeader from '$lib/home/QuietCoastHeader.svelte';
  import QuietCoastFooter from '$lib/home/QuietCoastFooter.svelte';
  import { openEnquiry, INTENT } from '$lib/enquiry.js';
  import { describeCount } from '$lib/catalog-format.js';
  import { page } from '$app/stores';
  import '$lib/styles/quiet-shell.css';

  export let data;

  let showSortModal = false;
  let showModal = false;
  // An outage yields an empty list plus data.cmsError; both paths must be safe.
  let filteredData = data.objects || [];
  let sortOptions = {};
  let lastFilterOptions = {};

  $: total = (data.objects || []).length;
  $: count = describeCount(filteredData.length, total);
  $: search = $page.url.search;

  /* ---- existing filter/sort semantics, carried over verbatim ---- */

  function handleFilter(event, sortOptions = {}) {
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

    applySorting(sortOptions);
  }

  function applySorting(sortOptions) {
    filteredData = [...filteredData].sort((a, b) => {
      let result = 0;

      if (sortOptions.price) {
        result = sortOptions.price === 'asc' ? a.price - b.price : b.price - a.price;
        if (result !== 0) return result;
      }
      if (sortOptions.area) {
        let areaA = parseFloat(a.area);
        let areaB = parseFloat(b.area);
        result = sortOptions.area === 'asc' ? areaA - areaB : areaB - areaA;
        if (result !== 0) return result;
      }
      if (sortOptions.floor) {
        let floorA = parseFloat(a.floor);
        let floorB = parseFloat(b.floor);
        result = sortOptions.floor === 'asc' ? floorA - floorB : floorB - floorA;
      }

      return result;
    });
  }

  function openFullFilters() {
    showModal = false;
    setTimeout(() => showModal = true, 0);
  }

  function handleFullFilter(event) {
    handleFilter(event);
  }

  function applySort(newSortOptions) {
    sortOptions = newSortOptions;
    handleFilter({ detail: lastFilterOptions }, sortOptions);
  }

  function handleSort(event) {
    handleFilter({ detail: lastFilterOptions }, event.detail);
  }

  function resetFilters() {
    lastFilterOptions = {};
    sortOptions = {};
    filteredData = data.objects || [];
  }
</script>

<svelte:head>
  <title>Каталог объектов на побережье Болгарии — Sea Estate</title>
  <meta
    name="description"
    content="Объекты на болгарском побережье: город, площадь, спальни и этаж по каждому объекту. Цена и наличие уточняются по заявке."
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

<div class="qc-home">
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
            Здесь опубликованы объекты, которые есть у нас в работе. По каждому показываем
            только те данные, которые получили от собственника или партнёра: город, площадь,
            спальни и этаж. Цена и наличие уточняются по заявке.
          </p>
        </div>
      </section>

      <section class="qc-section results" aria-labelledby="results-heading">
        <div class="qc-container">
          <h2 id="results-heading" class="qc-heading-3 sub">Подбор по фильтрам</h2>

          <div class="filter-surface qc-panel">
            <FilterBar on:filter={handleFilter} on:sort={handleSort} on:open-full-filters={openFullFilters} />
          </div>

          <SortModal {showSortModal} {applySort} />
          {#if showModal}
            <FullFilterModal showModal={showModal} on:full-filter={handleFullFilter}/>
          {/if}

          <p class="qc-data count" role="status" aria-live="polite">{count.text}</p>

          {#if count.state === 'empty-catalog'}
            <div class="qc-panel state">
              <h3 class="qc-heading-3 state-title">Пока нет опубликованных объектов</h3>
              <p class="qc-body state-body">
                Каталог доступен, но опубликованных объектов сейчас нет. Оставьте заявку — мы
                пришлём подходящие варианты, как только они появятся.
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
                В каталоге {total} объектов, но ни один не подходит под выбранные условия.
                Смягчите фильтры или расскажите о задаче — подберём вручную.
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
            Расскажите, что вы ищете. Мы подберём варианты под вашу задачу и уточним цену и
            наличие у собственника или партнёра.
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
