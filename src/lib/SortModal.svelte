<script>
  import { onMount } from 'svelte';
  export let showSortModal = false;
  export let applySort;
  let sortModal; // Добавляем переменную для ссылки на элемент модального окна
  let sortOptions = {
    price: null,
    area: null,
    floor: null
  };
  function handleClickOutside(event) {
    if (sortModal && !sortModal.contains(event.target)) {
      showSortModal = false;
    }
  }
  function toggleSortModal(button) {
    event.stopPropagation(); // Останавливаем всплытие события
    showSortModal = !showSortModal;
    sortButton = button;

    if (showSortModal) {
      positionSortModal();
    }
  }

  function setSortOption(type, direction) {
    sortOptions[type] = direction;
    applySort(sortOptions);
    highlightActiveButton();
  }

  function positionSortModal() {
    const buttonRect = sortButton.getBoundingClientRect();
    sortModal.style.top = `${buttonRect.bottom + window.scrollY}px`;
    sortModal.style.left = `${buttonRect.left}px`;
  }

  function resetSortOption(type) {
    sortOptions[type] = null;
    applySort(sortOptions);
    highlightActiveButton();
  }

  function highlightActiveButton() {


  }

  onMount(() => {
    window.addEventListener('click', handleClickOutside);
    return () => {
      window.removeEventListener('click', handleClickOutside);
    };
  });

</script>

{#if showSortModal}
  <div bind:this={sortModal} class="sort-modal">
    <div>Сортировать по:</div>
    <div class="sort-option">
      <div>Цена</div>
      <button class:active={sortOptions.price === 'asc'} on:click={() => setSortOption('price', 'asc')}>↑</button>
      <button class:active={sortOptions.price === 'desc'} on:click={() => setSortOption('price', 'desc')}>↓</button>
      <button on:click={() => resetSortOption('price')}>X</button>
    </div>
    <div class="sort-option">
      <div>Площадь</div>
      <button class:active={sortOptions.area === 'asc'} on:click={() => setSortOption('area', 'asc')}>↑</button>
      <button class:active={sortOptions.area === 'desc'} on:click={() => setSortOption('area', 'desc')}>↓</button>
      <button on:click={() => resetSortOption('area')}>X</button>
    </div>
    <div class="sort-option">
      <div>Этаж</div>
      <button class:active={sortOptions.floor === 'asc'} on:click={() => setSortOption('floor', 'asc')}>↑</button>
      <button class:active={sortOptions.floor === 'desc'} on:click={() => setSortOption('floor', 'desc')}>↓</button>
      <button on:click={() => resetSortOption('floor')}>X</button>
    </div>
  </div>
{/if}

<style>

        .sort-modal {
            position: absolute; /* Изменено с fixed на absolute */
            z-index: 101111!important;
            background-color: #111827;
            color: #fff;
            top:3%;
            right:20%;
            padding: 20px;
            border-radius: 8px;
            border: 1px solid #e6f4fa;
            box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
            width: auto; /* Установите ширину по умолчанию на auto или задайте конкретную ширину */
            overflow: hidden; /* предотвращает показ содержимого до окончания анимации */
            transition: height 0.1s ease-in-out; /* анимация изменения высоты */
             /* Изначально скрыто */
        }



        .sort-modal.active {
            display: block; /* Показать при активации */
            height: 200px;
        }

        .sort-option {
            display: grid;
            grid-template-columns: 120px repeat(3, 1fr); /* Fixed width for label, 1fr for each button */
            gap: 8px; /* Adjust gap size as needed */
            align-items: center;
            margin-bottom: 15px;
        }
        .sort-option > div {
            white-space: nowrap;
        }
        .sort-option > div:first-child {
            white-space: nowrap; /* Не переносить текст на новую строку */
            margin-right: 10px; /* Отступ справа от названия */
        }
        .sort-option button {
            min-width: 40px; /* Set a minimum width for buttons */
            height: 40px;
            border: 1px solid #ddd;
            border-radius: 4px;
            background-color: transparent;
            cursor: pointer;
            transition: background-color 0.1s;
        }

        .sort-option button:hover,
        .sort-option button.active {
            background-color: #007bff;
            color: white;
        }
        .sort-option button:nth-child(2),
        .sort-option button:nth-child(3),
        .sort-option button:nth-child(4) {
            width: 40px;
        }

        .sort-option button.active {
            background-color: #007bff; /* Active button background color */
            color: white; /* Active button text color */
        }
        @media (max-width: 600px) {
            .sort-modal {
                width: 90%;
                left: 5%;
            }
        }

</style>