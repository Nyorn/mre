<script>
  import { createEventDispatcher, onMount } from 'svelte';
  import { isFullFilterVisible } from './store.js';
  const dispatch = createEventDispatcher();
  $: $isFullFilterVisible;

  let showPriceFilter = false;
  let showAreaFilter = false;
  let showFloorFilter = false;
  let city = '';
  let price = '';
  let bedrooms = '';
  let area = '';
  let floor = '';
  let minPrice = '';
  let maxPrice = '';
  let minArea = '';
  let maxArea = '';
  let minFloor = '';
  let maxFloorValue = '';

  const cities = ['Бяла', 'Обзор', 'Равда', 'Солнечный берег', 'Святой Влас', 'Гавана Влас', 'Золотые пески'];
  function applyFilters() {
    dispatch('filter', { city, price, bedrooms, area, floor,
      minPrice: minPrice || undefined,
      maxPrice: maxPrice || undefined,
      minArea: minArea || undefined,
      maxArea: maxArea || undefined,
      minFloor: minFloor || undefined,
      maxFloorValue: maxFloorValue || undefined
    });

  }



  function openFullFilters() {
    isFullFilterVisible.set(true); // Установка значения в true
    dispatch('open-full-filters');
  }
  function resetFilters() {
    city = '';
    price = '';
    bedrooms = '';
    area = '';
    minPrice = '';
    maxPrice = '';
    minArea = '';
    maxArea = '';
    minFloor = '';
    maxFloorValue = '';

    dispatch('filter', {
      city: '',
      price: '',
      bedrooms: '',
      area: '',
      bathrooms: undefined,
      pool: undefined,
      parking: '',
      heating: undefined,
      fromBuilder: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      minArea: undefined,
      maxArea: undefined,
      minFloor: undefined,
      maxFloorFilter: undefined

    });
  }
  function togglePriceFilter() {
    showPriceFilter = !showPriceFilter;
  }

  function toggleAreaFilter() {
    showAreaFilter = !showAreaFilter;
  }

  function toggleFloorFilter() {
    showFloorFilter = !showFloorFilter;
  }
</script>
{#if !$isFullFilterVisible}
<div class="filter-bar flex flex-wrap gap-2 p-2 bg-gray-700 text-white">
  <select bind:value={city} class="p-2 bg-gray-800">
    <option value="">Выберите город</option>
    {#each cities as city}
      <option value={city}>{city}</option>
    {/each}
  </select>
  <input type="number" placeholder="Кол-во спален" bind:value={bedrooms} class="p-2 bg-gray-800 text-white" />
  <div class="relative">
    <button class="p-2 bg-gray-800" on:click={togglePriceFilter}>Цена</button>
    {#if showPriceFilter}
      <div class="absolute left-0 mt-2 p-2 bg-gray-800 z-10">
        <input type="number" placeholder="Мин. цена" bind:value={minPrice} class="p-1 mb-1"/>
        <input type="number" placeholder="Макс. цена" bind:value={maxPrice} class="p-1"/>
      </div>
    {/if}
  </div>
  <div class="relative">
    <button class="p-2 bg-gray-800" on:click={toggleAreaFilter}>Площадь</button>
    {#if showAreaFilter}
      <div class="absolute left-0 mt-2 p-2 bg-gray-800 z-10">
        <input type="number" placeholder="Мин. площадь" bind:value={minArea} class="p-1 mb-1"/>
        <input type="number" placeholder="Макс. площадь" bind:value={maxArea} class="p-1"/>
      </div>
    {/if}
  </div>
  <div class="relative">
    <button class="p-2 bg-gray-800" on:click={toggleFloorFilter}>Этаж</button>
    {#if showFloorFilter}
      <div class="absolute left-0 mt-2 p-2 bg-gray-800 z-10 flex flex-col">
        <input type="number" placeholder="Мин. этаж" bind:value={minFloor} class="p-1 mb-1 bg-gray-800 text-white"/>
        <input type="number" placeholder="Макс. этаж" bind:value={maxFloorValue} class="p-1 bg-gray-800 text-white"/>
      </div>
    {/if}


  <button on:click={applyFilters}>Применить фильтры</button>
  <button on:click={openFullFilters}>Полные фильтры</button>
  <button on:click={resetFilters}>Сбросить фильтры</button>
</div>
</div>
{/if}
<style>

    .filter-bar input, .filter-bar select {
        background-color: #051518;
        color: white;
    }
</style>
