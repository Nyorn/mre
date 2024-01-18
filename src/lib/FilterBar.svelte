<script>
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

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
</script>

<div class="filter-bar">
  <select bind:value={city}>
    <option value="">Выберите город</option>
    {#each cities as city}
      <option value={city}>{city}</option>
    {/each}
  </select>
  <input type="number" placeholder="Мин. цена" bind:value={minPrice} />
  <input type="number" placeholder="Макс. цена" bind:value={maxPrice} />
  <input type="number" placeholder="Кол-во спален" bind:value={bedrooms} />
  <input type="number" placeholder="Мин. площадь" bind:value={minArea} />
  <input type="number" placeholder="Макс. площадь" bind:value={maxArea} />
  <input type="number" placeholder="Мин. этаж" bind:value={minFloor} />
  <input type="number" placeholder="Макс. этаж" bind:value={maxFloorValue} />
  <button on:click={applyFilters}>Применить фильтры</button>
  <button on:click={openFullFilters}>Полные фильтры</button>
  <button on:click={resetFilters}>Сбросить фильтры</button>
</div>

<style>
    .filter-bar {
        /* Стилизация фильтр-бара */
    }
</style>
