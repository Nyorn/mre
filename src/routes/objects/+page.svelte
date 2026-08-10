<script>
  import Header from '../../lib/Header.svelte';
  import Card from './Card.svelte';
  import FilterBar from '../../lib/FilterBar.svelte';
  import FullFilterModal from '../../lib/FullFilterModal.svelte';
  import SortModal from '../../lib/SortModal.svelte';
  import CmsUnavailable from '$lib/CmsUnavailable.svelte';

  import { onMount } from 'svelte';

  export let data;
  let loading = true; // Переменная для контроля отображения прелоадера
  let showSortModal = false;
  let showModal = false;
  // An outage yields an empty list plus data.cmsError; both paths must be safe.
  let filteredData = data.objects || [];
  let sortOptions = {}; // Добавьте этот объект для хранения опций сортировки
  let lastFilterOptions = {};
  let loadedImagesCount = 0;
  let totalImagesCount = (data.objects || []).length;

  function handleImageLoaded() {
    loadedImagesCount++;
    if (loadedImagesCount >= totalImagesCount) {
      loading = false;
    }
  }

  function handleFilter(event, sortOptions = {}) {
    lastFilterOptions = event ? event.detail : lastFilterOptions;
    const { city, price, type, bedrooms, elevator, area, bathrooms, pool, parking, fromBuilder, minPrice, maxPrice, minArea, maxArea, minFloor, maxFloorValue, heat, security, conserj, video, fitness, restoraunts, playground, tv, internet } = event.detail;

    filteredData = data.objects.filter(object => {
      let priceNum = price ? parseInt(price, 10) : null;
      let bedroomsNum = bedrooms ? parseInt(bedrooms, 10) : null;
      let areaNum = area ? parseInt(area, 10) : null;
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
        matchesHeating &&
        matchesSecurity &&
        matchesConserj &&
        matchesVideo &&
        matchesFitness &&
        matchesRestoraunts &&
        matchesPlayground &&
        matchesTv &&
        matchesInternet;
      // return matchesCity && matchesPrice && matchesBedrooms && matchesElevator && matchesArea && matchesBathrooms && matchesPool && matchesParking && matchesHeating &&  matchesFloor;
    });

    filteredData.sort((a, b) => {
      let result = 0;

    });

    applySorting(sortOptions);

  }

  function applySorting(sortOptions) {
    filteredData.sort((a, b) => {
      let result = 0;

      if (sortOptions.price) {
        result = sortOptions.price === 'asc' ? a.price - b.price : b.price - a.price;
        if (result !== 0) return result;
      }
      if (sortOptions.area) {
        // Убедитесь, что area является числом
        let areaA = parseFloat(a.area);
        let areaB = parseFloat(b.area);
        result = sortOptions.area === 'asc' ? areaA - areaB : areaB - areaA;
        if (result !== 0) return result;
      }
      if (sortOptions.floor) {
        // Убедитесь, что floor является числом
        let floorA = parseFloat(a.floor);
        let floorB = parseFloat(b.floor);
        result = sortOptions.floor === 'asc' ? floorA - floorB : floorB - floorA;
      }

      return result;
    });
  }

  function openFullFilters() {
    showModal = false; // Принудительно сбрасываем состояние
    setTimeout(() => showModal = true, 0); // Обновляем состояние асинхронно
  }

  function handleFullFilter(event) {
    handleFilter(event); // Повторное использование функции handleFilter для полной фильтрации
  }

  function applySort(newSortOptions) {
    sortOptions = newSortOptions;
    handleFilter({ detail: lastFilterOptions }, sortOptions);
  }

  function handleSort(event) {
    const newSortOptions = event.detail;
    handleFilter({ detail: lastFilterOptions }, newSortOptions);
  }

  function onDataLoaded() {
    loading = false; // Прячем прелоадер
  }

  onMount(() => {
    if (document.readyState === 'complete') {
      loading = false;
    } else {
      window.addEventListener('load', () => {
        loading = false;
      });
    }

    return () => {
      loadedImagesCount = 0;
      totalImagesCount = data.objects.length;
      loading = true;
    };
  });

</script>

<svelte:head>

  <title>Купить Квартиру в Обзоре, Бяле, Равде, Солнечном берегу, Золотых песках, Святом Власе | Sea Real Estate</title>

  <meta name="description" content="Ищете квартиру в Обзоре, Бяле или Равде? Золотых песках, на Солнечном берегу или Святом Власе? Обширный выбор недвижимости от Sea Real Estate. Охраняемые комплексы, бассейны, фитнес и многое другое" />

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

{#if data.cmsError}
  <CmsUnavailable failure={data.cmsError} level={1} />
{:else}

<FilterBar on:filter={handleFilter} on:sort={handleSort} on:open-full-filters={openFullFilters} />
<SortModal {showSortModal} {applySort} />
{#if showModal}
  <FullFilterModal showModal={showModal} on:full-filter={handleFullFilter}/>
{/if}

<section class="max-w-[var(--max-width)] mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4  gap-8">
  {#each filteredData as object}
    <Card object={object} on:loaded={handleImageLoaded}/>
  {/each}
</section>
{/if}

<style>
    section {
        display: grid;
        margin-top:50px;
        gap: 30px;
        padding: 10px;
    }
</style>