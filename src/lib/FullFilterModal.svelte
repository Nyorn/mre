<script>
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  export let showModal = false;

  let city = '';
  let price = undefined;
  let bedrooms = undefined;
  let elevator = false;
  let area = undefined;
  const cities = ['Бяла', 'Обзор', 'Равда', 'Солнечный берег', 'Святой Влас', 'Гавана Влас', 'Золотые пески'];
  let bathrooms = undefined;
  let pool = undefined;
  let parking = '';
  const parkings = ['Открытый', 'Закрытый', 'Есть', 'Нет'];
  let heating = undefined;
  let fromBuilder = undefined;
  let minPrice = undefined;
  let maxPrice = undefined;
  let minArea = undefined;
  let maxArea = undefined;
  let minFloor = undefined;
  let maxFloorValue = undefined;
  let heat = undefined;
  let security = undefined;
  let conserj = undefined;
  let video = undefined;
  let fitness = undefined;
  let restoraunts = undefined;
  let playground = undefined;
  let tv = undefined;
  let internet = undefined;


  function close() {
    showModal = false;
  }

  function applyFullFilters() {
    dispatch('full-filter', {
      city,
      price: price || undefined,
      bedrooms: bedrooms || undefined,
      elevator: elevator || undefined, // Ensure elevator is undefined if not set
      area: area || undefined,
      bathrooms: bathrooms || undefined,
      pool: pool || undefined,
      parking,
      heating: heating || undefined,
      fromBuilder: fromBuilder || undefined,
      minPrice: minPrice || undefined,
      maxPrice: maxPrice || undefined,
      minArea: minArea || undefined,
      maxArea: maxArea || undefined,
      minFloor: minFloor || undefined,
      maxFloorValue: maxFloorValue || undefined,
      heat: heat || undefined,
      security: security || undefined,
      conserj: conserj || undefined,
      video: video || undefined,
      fitness: fitness || undefined,
      restoraunts: restoraunts || undefined,
      playground: playground || undefined,
      tv: tv || undefined,
      internet: internet || undefined

    });
    close();
  }

  function resetFullFilters() {
    city = '';
    price = undefined;
    bedrooms = undefined;
    elevator = undefined;
    area = undefined;
    bathrooms = undefined;
    pool = undefined;
    parking = '';
    heating = undefined;
    fromBuilder = undefined;
    minPrice = undefined;
    maxPrice = undefined;
    minArea = undefined;
    maxArea = undefined;
    minFloor = undefined;
    maxFloorValue = undefined;
    heat = undefined;
    security = undefined;
    conserj = undefined;
    video = undefined;
    fitness = undefined;
    restoraunts = undefined;
    playground = undefined;
    tv = undefined;
    internet = undefined;

    dispatch('full-filter', {
      city: '',
      price: undefined,
      bedrooms: undefined,
      elevator: undefined,
      area: undefined,
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
      maxFloorValue: undefined,
      heat: undefined,
      security: undefined,
      conserj: undefined,
      video: undefined,
      fitness: undefined,
      restoraunts: undefined,
      playground: undefined,
      tv: undefined,
      internet: undefined

    });
    close();
  }
</script>

{#if showModal}
  <div class="modal">
    <div class="modal-content">
      <select bind:value={city}>
        <option value="">Выберите город</option>
        {#each cities as cityOption}
          <option value={cityOption}>{cityOption}</option>
        {/each}
      </select>
      <input type="number" placeholder="Мин. цена" bind:value={minPrice} />
      <input type="number" placeholder="Макс. цена" bind:value={maxPrice} />
      <input type="number" placeholder="Кол-во спален" bind:value={bedrooms} />
      <label>
        <input type="checkbox" bind:checked={elevator} /> Наличие лифта
      </label>
      <input type="number" placeholder="Мин. площадь" bind:value={minArea} />
      <input type="number" placeholder="Макс. площадь" bind:value={maxArea} />
      <input type="number" placeholder="Мин. этаж" bind:value={minFloor} />
      <input type="number" placeholder="Макс. этаж" bind:value={maxFloorValue} />
      <input type="number" placeholder="Кол-во санузлов" bind:value={bathrooms} />

      <label>
        <input type="checkbox" bind:checked={pool} /> Наличие бассейна
      </label>

        <select bind:value={parking}>
          <option value="">Выберите паркинг</option>
          {#each parkings as parkingOption}
            <option value={parkingOption}>{parkingOption}</option>
          {/each}
            </select>

      <label>
        <input type="checkbox" bind:checked={heating} /> Наличие отопления
      </label>
      <label>
        <input type="checkbox" bind:checked={fromBuilder} /> От застройщика
      </label>
      <label>
        <input type="checkbox" bind:checked={heat} /> Центральное отопление
      </label>
      <label><input type="checkbox" bind:checked={security} /> Охрана</label>
      <label><input type="checkbox" bind:checked={conserj} /> Консьерж</label>
      <label><input type="checkbox" bind:checked={video} /> Видеонаблюдение</label>
      <label><input type="checkbox" bind:checked={fitness} /> Фитнес центр рядом</label>
      <label><input type="checkbox" bind:checked={restoraunts} /> Рестораны рядом</label>
      <label><input type="checkbox" bind:checked={playground} /> Детская площадка рядом</label>
      <label><input type="checkbox" bind:checked={tv} /> Спутниковое ТВ</label>
      <label><input type="checkbox" bind:checked={internet} /> Интернет</label>

      <button on:click={applyFullFilters}>Применить</button>
      <button on:click={resetFullFilters}>Сбросить фильтры</button>
      <button on:click={close}>Закрыть</button>
    </div>
  </div>
{/if}

<style>
    .modal {
    /* Стилизация модального окна /
}
.modal-content {
/ Стилизация содержимого модального окна */
    }
</style>
