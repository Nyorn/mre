<script>
  import { createEventDispatcher, onMount, onDestroy } from 'svelte';
  import { isFullFilterVisible } from './store.js';
  import SortModal from './SortModal.svelte';
  import { clickOutsideAction } from "svelte-legos";
  import Icon from 'svelte-awesome/components/Icon.svelte';
  import filter from 'svelte-awesome/icons/filter';
  import check from 'svelte-awesome/icons/check';
  import close from 'svelte-awesome/icons/close';
  import sort from 'svelte-awesome/icons/sort';




  $: $isFullFilterVisible;
  let innerWidth;

  const dispatch = createEventDispatcher();
  let priceModal, areaModal, floorModal, sortModal;
  let showPriceFilter = false;
  let showAreaFilter = false;
  let showFloorFilter = false;
  // Остальные переменные состояния
  let lastClickedFilter = null;

  onMount(() => {
    innerWidth = window.innerWidth;
    window.addEventListener('resize', () => {
      innerWidth = window.innerWidth;
    });
  });

  // Открытие/закрытие фильтра цен


  function handleFilterClick(event) {
    const clickedElement = event.target;

    // Определение фильтра, на который нажали
    if (clickedElement.matches('.price-button')) {
      lastClickedFilter = lastClickedFilter === 'price' ? null : 'price';
    } else if (clickedElement.matches('.area-button')) {
      lastClickedFilter = lastClickedFilter === 'area' ? null : 'area';
    } else if (clickedElement.matches('.floor-button')) {
      lastClickedFilter = lastClickedFilter === 'floor' ? null : 'floor';
    } else {
      // Клик снаружи любого модального окна
      if (!clickedElement.closest('.modal')) lastClickedFilter = null;
    }

    // Обновление состояний фильтров
    showPriceFilter = lastClickedFilter === 'price';
    showAreaFilter = lastClickedFilter === 'area';
    showFloorFilter = lastClickedFilter === 'floor';
  }


  let city = '';
  let price = '';
  let type = '';
  let bedrooms = '';
  let area = '';
  let floor = '';
  let minPrice = '';
  let maxPrice = '';
  let minArea = '';
  let maxArea = '';
  let minFloor = '';
  let maxFloorValue = '';
  let sortOrder = ''; // переменная для хранения порядка сортировки
  let showSortModal = false;
  const types = ['Аппартамент', 'Мезонит', 'Дом', 'Гараж', 'Вилла'];
  const cities = ['Бяла', 'Обзор', 'Равда', 'Солнечный берег', 'Святой Влас', 'Золотые пески'];
  function applyFilters() {
    dispatch('filter', { city, price, bedrooms, area, floor, type,
      minPrice: minPrice || undefined,
      maxPrice: maxPrice || undefined,
      minArea: minArea || undefined,
      maxArea: maxArea || undefined,
      minFloor: minFloor || undefined,
      maxFloorValue: maxFloorValue || undefined,

    });

  }



  function openFullFilters() {
    isFullFilterVisible.set(true); // Установка значения в true
    dispatch('open-full-filters');
  }
  function resetFilters() {
    city = '';
    price = '';
    type = '';
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
      type: '',
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
    if (showPriceFilter) {
      showAreaFilter = false;
      showFloorFilter = false;
    }
  }

  // Открытие/закрытие фильтра площади
  function toggleAreaFilter() {
    showAreaFilter = !showAreaFilter;
    if (showAreaFilter) {
      showPriceFilter = false;
      showFloorFilter = false;
    }
  }

  // Открытие/закрытие фильтра этажа
  function toggleFloorFilter() {
    showFloorFilter = !showFloorFilter;
    if (showFloorFilter) {
      showPriceFilter = false;
      showAreaFilter = false;
    }
  }



  function applySort(sortOptions) {
    dispatch('sort', sortOptions);
  }

  function toggleSortModal(event) {
    event.stopPropagation(); // Предотвращение всплытия события
    showSortModal = !showSortModal;

    if (showSortModal && sortModal) {
      const buttonRect = event.target.getBoundingClientRect();
      sortModal.style.top = `${buttonRect.bottom + window.scrollY}px`;
      sortModal.style.left = `${buttonRect.left}px`;
      sortModal.style.position = 'absolute'; // Убедитесь, что у sortModal есть стиль position
    }
  }


  function handlePriceModalClickOutside() {
    showPriceFilter = false;
  }

  function handleAreaModalClickOutside() {
    showAreaFilter = false;
  }

  function handleFloorModalClickOutside() {
    showFloorFilter = false;
  }
  function handleButtonMouseUp(event) {
    // Сброс стилей кнопки
    event.target.blur();
  }
</script>
{#if !$isFullFilterVisible}
<div class="filter-bar flex flex-wrap gap-2 p-2  text-white bg-[#1f2937] mb-5 content-center justify-center">
  <select bind:value={city} class="p-2 filter-box">
    <option value="">Выберите город</option>
    {#each cities as city}
      <option value={city}>{city}</option>
    {/each}
  </select>
  <select bind:value={type} class="p-2 filter-box">
    <option value="">Выберите тип</option>
    {#each types as type}
      <option value={type}>{type}</option>
    {/each}
  </select>

  <input type="number" placeholder="Кол-во спален" bind:value={bedrooms} class="p-2 bg-gray-800 text-white filter-box" />
  <div class="relative">
    <button class="price-button p-2 dropdown-button {showPriceFilter ? 'active' : ''}" on:click={togglePriceFilter}>
      {#if minPrice || maxPrice}
        <div class="">
                <span class="filter-button-text-xs">
        Цена:<br>
        {#if minPrice}
          мин - {minPrice}€<br>
        {/if}
        {#if maxPrice}
          макс - {maxPrice}€
        {/if}
                </span>
        </div>
      {:else}
        <span class="filter-button-text">Цена</span>
        <span class="icon-arrow-down">&#9660;</span>
      {/if}
    </button>
    {#if showPriceFilter}
      <div class="absolute left-0 mt-2 p-2 z-10" bind:this={priceModal} use:clickOutsideAction={handlePriceModalClickOutside}>
        <input type="number" placeholder="Мин. цена" bind:value={minPrice} class="p-1 mb-1"/>
        <input type="number" placeholder="Макс. цена" bind:value={maxPrice} class="p-1"/>
      </div>
    {/if}
  </div>
  <div class="relative">
    <button class="area-button p-2 dropdown-button {showAreaFilter ? 'active' : ''}" on:click={toggleAreaFilter}>
      {#if minArea || maxArea}
        <div class="area-modal">
                        <span class="filter-button-text-xs">

        Площадь:<br>
        {#if minArea}
          мин - {minArea}м²<br>
        {/if}
        {#if maxArea}
          макс - {maxArea}м²
        {/if}

      </span>
        </div>

      {:else}
       <span class="filter-button-text"> Площадь </span>
        <span class="icon-arrow-down">&#9660;</span>
      {/if}

    </button>

    {#if showAreaFilter}
      <div class="absolute left-0 mt-2 p-2 bg-black z-10" bind:this={areaModal} use:clickOutsideAction={handleAreaModalClickOutside}>
        <input type="number" placeholder="Мин. площадь" bind:value={minArea} class="p-1 mb-1"/>
        <input type="number" placeholder="Макс. площадь" bind:value={maxArea} class="p-1"/>
      </div>
    {/if}
  </div>
  <div class="relative">
    <button class="floor-button p-2  dropdown-button {showFloorFilter ? 'active' : ''}" on:click={toggleFloorFilter}>
      {#if minFloor || maxFloorValue}
        <div class="floor-modal">
        <span class="filter-button-text-xs">
        Этаж:<br>
        {#if minFloor}
          мин - {minFloor}<br>
        {/if}
        {#if maxFloorValue}
          макс - {maxFloorValue}
        {/if}
        </span>
        </div>
      {:else}
       <span class="filter-button-text"> Этаж </span>
        <span class="icon-arrow-down">&#9660;</span>
      {/if}
    </button>

    {#if showFloorFilter}
      <div class="absolute left-0 mt-2 p-2 z-10 flex flex-col" bind:this={floorModal} use:clickOutsideAction={handleFloorModalClickOutside}>
        <input type="number" placeholder="Мин. этаж" bind:value={minFloor} class="p-1 mb-1 bg-gray-800 text-white"/>
        <input type="number" placeholder="Макс. этаж" bind:value={maxFloorValue} class="p-1 bg-gray-800 text-white"/>
      </div>
    {/if}
  </div>
  <div class="btn-group variant-ghost-tetriary [&>*+*]:border-white-500">
  <button on:click={applyFilters} on:mouseup={handleButtonMouseUp} class="filter-button">
    {#if innerWidth < 920}
       <Icon data={check} />
    {:else}
      Применить фильтры
    {/if}
  </button>
  <button on:click={openFullFilters} on:mouseup={handleButtonMouseUp} class="filter-button">
    {#if innerWidth < 920}
      <Icon data={filter} />
    {:else}
    Полные фильтры
      {/if}
      </button>
  <button on:click={resetFilters} on:mouseup={handleButtonMouseUp} class="filter-button">
    {#if innerWidth < 920}
      <Icon data={close} />
    {:else}
    Сбросить фильтры
    {/if}
  </button>
    <button on:click={event => toggleSortModal(event)} on:mouseup={handleButtonMouseUp} class="filter-button">
    {#if innerWidth < 920}
      <Icon data={sort} />
    {:else}
      Сортировка
    {/if}
  </button>

  {#if showSortModal}
    <div bind:this={sortModal} class="sort-modal {showSortModal ? 'active' : ''}">
      <SortModal {showSortModal} {applySort} />
    </div>
  {/if}

  </div>
</div>

{/if}
<style>

    .button:hover {
        background: none;

    }
    .filter-button {
        height: 60px; /* Увеличенная высота */
        width: 200px; /* Уменьшенная ширина */
        /* Отступ слева */
        /* Внутренний отступ */
        white-space: normal; /* Перенос текста на новую строку */
        text-align: center; /* Центрирование текста */
        border: white 1px solid;
        outline: none;
        box-shadow: 0 0 5px 0 #e6f4fa;
        transition: background-color 0.2s, color 0.2s;

    }
    .filter-button .fa-icon {
        color: white; /* Цвет иконки */
        font-size: 20px; /* Размер иконки */
        margin-right: 5px; /* Отступ справа */

    }
    .filter-bar input, .filter-bar select {
        background-color: #030005;
        color: white;
    }

    .filter-bar button {
        height: 100%; /* Увеличенная высота */
        width: 120px; /* Уменьшенная ширина */
        /* Отступ слева */
       /* Внутренний отступ */
        white-space: normal; /* Перенос текста на новую строку */
        text-align: center; /* Центрирование текста */
    }
    .btn-group {
        border-radius: 0px;

        padding-top: 2px;
        padding-bottom: 4px;
        margin-top: -2px;


    }
    .filter-bar button {
        border: white 1px solid;
        outline: none;
        box-shadow: 0 0 5px 0 #e6f4fa;
        transition: background-color 0.2s, color 0.2s;

        /* Ensuring gradient backgrounds are applied */
        background-image: linear-gradient(to right, var(--tw-gradient-stops)); /* Using Tailwind's gradient utilities */
    }

    /* Styles for when the button is hovered or focused */
    .filter-bar button:hover, .filter-bar button:focus {

        color: white; /* Change text color on hover, if needed */
    }
    .btn-group .filter-button {
        margin: 0 5px; /* Add horizontal space between buttons */
        box-shadow: 0 0 5px 0 #e6f4fa; /* Adds a subtle shadow for volume */
        transition: transform 0.3s ease, box-shadow 0.3s ease; /* Smooth transition for interactive effects */

    }
    /* Увеличиваем padding в filter-bar для вмещения поднятой кнопки */


    /* Стили для кнопок при наведении */


    /* Interactive effect when the button is hovered or focused */
    .btn-group .filter-button:hover, .btn-group .filter-button:focus {
        transform: translateY(-2px); /* Slightly raise the button */
        box-shadow: 0px 6px 8px rgba(0, 0, 0, 0.25); /* Increase shadow for raised effect */
    }
    filter-bar button:hover, .filter-bar button:focus {
        background-color: inherit; /* Возвращает исходный цвет фона */
        color: white; /* Возвращает исходный цвет текста */
    }
    .dropdown-button .icon-arrow-down {
        display: inline-block;
        margin-left: 5px;



        /* Здесь можете добавить свои стили для стрелочки, например, использовать иконку или создать стрелочку с помощью CSS */
    }
    .dropdown-button:hover {
        background: none;

    }
    /* Стили для переворачивания стрелок */
    .dropdown-button.active .icon-arrow-down {
        transform: rotate(180deg);
        transition: transform 0.3s ease;
    }



    .dropdown-button .icon-arrow-down {
        transform: rotate(0deg);
        transition: transform 0.3s ease;
    }

    /* Стили для переворачивания стрелок при активации фильтра */
    .dropdown-button.active .icon-arrow-down {
        transform: rotate(180deg);
    }

    /* Убедитесь, что z-index фильтрбара позволяет отображать кнопки корректно */
    .filter-bar {
        z-index: 1; /* Пример */
        background-color: #030005;
        border-bottom: 1px solid #495361;

    }

    /* Стили для кнопок */
    .btn-group .filter-button {
        position: relative; /* Добавляем, если еще не присутствует */
        z-index: 2; /* Устанавливаем z-index выше, чем у filter-bar */
        /* Остальные стили */
    }
.filter-box {
    border-radius: 10px;
    padding: 10px;
    background-color: #051518;
    color: white;
    border: 1px solid #e6f4fa;
    box-shadow: 0 0 5px 0 #e6f4fa;
}
    .filter-button-text {
        font-size: medium; /* или другой размер, который вы используете по умолчанию */
    }

    /* Стили для меньшего размера текста */
    .filter-button-text-xs {
        font-size: 12px; /* Пример меньшего размера, xs */
        line-height: 0.01rem!important; /* Уменьшенный межстрочный интервал */
    }

    @media (max-width: 1024px) {
        /* Скрытие поля фильтра для спален, площади и этажа на планшетах */
        .filter-bar input[type="number"], .filter-bar .relative {
            display: none;
        }
    }

    @media (max-width: 920px) {
        .filter-bar button {
            width: 60px;
        }
    }
    @media (max-width: 670px) {
        .filter-bar {
            flex-wrap: wrap; /* Позволяет элементам переноситься на новую строку */
            justify-content: center; /* Выравнивание элементов по центру */
        }

        .btn-group {
            width: 100%; /* Заставляет группу кнопок занимать всю ширину */
            display: flex;
            justify-content: center; /* Выравнивание кнопок по центру внутри группы */
        }

        .filter-bar > * {
            flex-basis: 100%; /* Заставляет каждый элемент занимать всю ширину родителя */
            margin-bottom: 10px; /* Добавляет отступ снизу для каждого элемента */
        }

        .filter-bar button {
            flex-basis: auto; /* Восстанавливает исходный размер кнопок */
        }
    }



    @media (max-width: 480px) {
        /* Мобильная версия */
        .filter-bar {
            /* Столбцовое расположение элементов */
            align-items: center; /* Центрирование элементов */
        }

        .filter-bar select {
            width: 100%; /* Ширина элементов на всю ширину контейнера */
        }
    }


</style>


