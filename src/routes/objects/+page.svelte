<script>
  import Header from '../../lib/Header.svelte';
  import Card from './Card.svelte';
  import FilterBar from '../../lib/FilterBar.svelte';
  import FullFilterModal from '../../lib/FullFilterModal.svelte';
  import SortModal from '../../lib/SortModal.svelte';

  import { onMount } from 'svelte';

  export let data;
  let loading = true; // Переменная для контроля отображения прелоадера
  let showSortModal = false;
  let showModal = false;
  let filteredData = data.objects; // Инициализация с полным списком объектов
  console.log("Данные объектов:", data.objects);
  let sortOptions = {}; // Добавьте этот объект для хранения опций сортировки
  let lastFilterOptions = {};
  let loadedImagesCount = 0;
  let totalImagesCount = data.objects.length;

  function handleImageLoaded() {
    loadedImagesCount++;
    if (loadedImagesCount >= totalImagesCount) {
      loading = false;
    }
  }

  function handleFilter(event, sortOptions = {}) {
    lastFilterOptions = event ? event.detail : lastFilterOptions;
    const { city, price, type, bedrooms, elevator, area, bathrooms, pool, parking, fromBuilder, minPrice, maxPrice, minArea, maxArea, minFloor, maxFloorValue, heat, security, conserj, video, fitness, restoraunts, playground, tv, internet } = event.detail;

    console.log("Received filter event with details:", event.detail);

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

      console.log(`Object ${object.name} filter match results:`, {
        matchesCity,
        matchesType,
        matchesPrice,
        matchesBedrooms,
        matchesElevator,
        matchesArea,
        matchesBathrooms,
        matchesPool,
        matchesParking,
        matchesFromBuilder,
        matchesFloor,
        matchesHeating,
        matchesSecurity,
        matchesConserj,
        matchesVideo,
        matchesFitness,
        matchesRestoraunts,
        matchesPlayground,
        matchesTv,
        matchesInternet
      });
      console.log(`Price filter value: ${priceNum}, Area filter value: ${areaNum}`);
      console.log(`Matches price: ${matchesPrice}, Matches area: ${matchesArea}`);
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

    console.log("Filtered and sorted data:", filteredData);
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
    console.log("Received full filter event with details:", event.detail);
    showModal = false; // Принудительно сбрасываем состояние
    setTimeout(() => showModal = true, 0); // Обновляем состояние асинхронно
  }

  function handleFullFilter(event) {
    console.log("Данные из FullFilterModal:", event.detail);
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




</svelte:head>



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

<style>
    section {
        display: grid;
        margin-top:50px;
        gap: 30px;
        padding: 10px;
    }
</style>