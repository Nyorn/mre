<script>
  import { createEventDispatcher } from 'svelte';
  import { isFullFilterVisible } from './store.js';

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
    isFullFilterVisible.set(false); // Установка значения в false
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
      <div class="filter-group">
        <div class="filter-item">
      <select bind:value={city}>
        <option value="">Выберите город</option>
        {#each cities as cityOption}
          <option value={cityOption}>{cityOption}</option>
        {/each}
      </select>
        </div>
        <div class="filter-item">
          <input type="number" placeholder="Кол-во спален" bind:value={bedrooms} />
        </div>
        <div class="filter-item">
          <input type="number" placeholder="Кол-во санузлов" bind:value={bathrooms} />
        </div>
        <div class="filter-item">

          <select bind:value={parking}>
            <option value="">Выберите паркинг</option>
            {#each parkings as parkingOption}
              <option value={parkingOption}>{parkingOption}</option>
            {/each}
          </select>
        </div>
        <div class="filter-item">
          <label>
            <input type="checkbox" bind:checked={elevator} /> Наличие лифта
          </label>

        </div>
          <div class="filter-item">
          <label>
            <input type="checkbox" bind:checked={fromBuilder} /> От застройщика
          </label>
          </div>

      </div>

      <div class="filter-group">
        <div class="filter-item">
      <input type="number" placeholder="Мин. цена" bind:value={minPrice} />
      <input type="number" placeholder="Макс. цена" bind:value={maxPrice} />
</div>
        <div class="filter-item">

      <input type="number" placeholder="Мин. площадь" bind:value={minArea} />
      <input type="number" placeholder="Макс. площадь" bind:value={maxArea} />
          </div>
        <div class="filter-item">

      <input type="number" placeholder="Мин. этаж" bind:value={minFloor} />
      <input type="number" placeholder="Макс. этаж" bind:value={maxFloorValue} />
</div>
      </div>



      <div class="filter-group">
        <div class="filter-item">

      <label>
        <input type="checkbox" bind:checked={heat} /> Центральное отопление
      </label>
        </div>
                <div class="filter-item">

      <label>
        <input type="checkbox" bind:checked={pool} /> Наличие бассейна
      </label>
                </div>
        <div class="filter-item">

      <label><input type="checkbox" bind:checked={security} /> Охрана</label>
        </div>
                <div class="filter-item">

      <label><input type="checkbox" bind:checked={conserj} /> Консьерж</label>
                </div>
                <div class="filter-item">

      <label><input type="checkbox" bind:checked={video} /> Видеонаблюдение</label>
                </div>
                <div class="filter-item">

      <label><input type="checkbox" bind:checked={fitness} /> Фитнес центр рядом</label>
                </div>
                <div class="filter-item">

      <label><input type="checkbox" bind:checked={restoraunts} /> Рестораны рядом</label>
                </div>
                <div class="filter-item">

      <label><input type="checkbox" bind:checked={playground} /> Детская площадка рядом</label>
                  </div>
                <div class="filter-item">

      <label><input type="checkbox" bind:checked={tv} /> Спутниковое ТВ</label>
                  </div>
                <div class="filter-item">

      <label><input type="checkbox" bind:checked={internet} /> Интернет</label>
                  </div>

      </div>
<div class="modal-buttons">
      <button on:click={applyFullFilters}>Применить</button>
      <button on:click={resetFullFilters}>Сбросить фильтры</button>
      <button on:click={close}>Закрыть</button>
</div>
    </div>
  </div>
{/if}

<style>
    .modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.9); /* Полупрозрачный фон */
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    }

    .modal-content {
        background-color: rgb(var(--color-surface-900));
        color: #fff;
        background-image: radial-gradient(at 100% 0%, rgba(var(--color-secondary-500) / 0.33) 0px, transparent 50%), radial-gradient(at 2% 1%, rgba(var(--color-error-500) / 0.33) 0px, transparent 50%);
        padding: 20px;
        border-radius: 8px;
        max-width: 90%;
        max-height: 90vh;
        overflow-y: auto;
    }

    /* Стили для группировки элементов */
    .filter-group {
        display: flex;
        flex-wrap: wrap;
        gap: 20px;
        margin-bottom: 15px;
        justify-content: center; /* Центрирование групп фильтров */
    }

    .filter-item {
        flex: 1 1 45%; /* Адаптивное изменение ширины элемента */
        max-width: 200px; /* Максимальная ширина элемента */
        display: flex;
        flex-direction: column; /* Расположение элементов в столбец */
    }

    /* Стили для элементов выбора (select) и ввода (input) */
    select, input {
        background-color: #222; /* Темный фон для полей */
        border: 1px solid #444; /* Граница поля */
        color: #ddd; /* Цвет текста */
        padding: 8px;
        margin-bottom: 10px; /* Отступ между полями */
        border-radius: 4px; /* Скругление углов */
    }

    .modal-buttons {
        display: flex;
        justify-content: center; /* Центрирование кнопок по горизонтали */
        gap: 10px; /* Расстояние между кнопками */
        margin-top: 20px; /* Отступ сверху */
    }

    .modal-buttons button {
        padding: 10px 15px; /* Паддинг для кнопок */
        border: none;
        border-radius: 4px; /* Скругленные углы */
        cursor: pointer;
        background-color: #007bff; /* Синий фон для кнопок */
        color: white; /* Белый текст */
        transition: background-color 0.3s; /* Анимация фона при наведении */
    }

    .modal-buttons button:hover {
        background-color: #0056b3; /* Затемнение фона при наведении */
    }

    @media (max-width: 600px) {
        .modal-content {
            max-width: 100%;
        }

        .filter-group {
            flex-direction: column;
        }

        .filter-item {
            flex: 1 1 100%; /* Полная ширина на мобильных устройствах */
        }
    }
</style>

