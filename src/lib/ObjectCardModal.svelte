<script>
  import Carousel from '$lib/Carousel.svelte';
  import { modalStack } from '$lib/store.js';
  import { documentToHtmlString } from '@contentful/rich-text-html-renderer';
  import { clickOutsideAction } from "svelte-legos";

  export let data;
  export let object; // Данные текущего объекта
  $: htmlDescription = object && object.description
    ? documentToHtmlString(object.description.json)
    : '';
  $: images = object.galleryCollection?.items.map(item => item.url) || [];

  function closeModal() {
    modalStack.close();
  }
  console.log(object);
  function handleClickOutside() {
    console.log("Click outside detected");
    modalStack.close(); // Закрываем модальное окно
  }
</script>




{#if object}
    <div class="content">


     <div class="object-card-modal grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
        <div >

          {#if images.length > 0}
            <Carousel {images} />
          {:else}
            <img src={object.photo.url} alt={object.photo.description} class="w-full h-auto rounded-lg" />
          {/if}
        </div>
        <div class="p-4 space-y-4">
          <h1 class="text-2xl font-bold">{object.name}</h1>
      <p>Город: {object.city}</p>
      <p>Площадь: {object.area}</p>
      <p>Спальни: {object.bedrooms}</p>
      <p>Этаж: {object.floor} из {object.maxFloor}</p>
      <p>Лифт: {object.elevator ? 'Есть' : 'Нет'}</p>
      <p>Цена: {object.price}</p>
          <button class="variant-ghost-tertiary p-2 bg-indigo-600 text-white rounded" on:click={() => {
  console.log("Opening modal with object name:", object.name);
  modalStack.open('feedback', { objectName: object.name, key: object.key });
}}>
            Заказать осмотр
          </button>
          <p class="text-base md:text-lg">{@html htmlDescription}</p>




          <iframe
            width="400"
            height="400"
            title="Map"
            margin-top="115px"
            frameborder="0"
            scrolling="no"
            marginheight="0"
            marginwidth="0"
            src="https://maps.google.com/maps?q={object.location.lat},{object.location
			.lon}&z=12&amp;output=embed"
          />
          <button class="mt-4 px-4 py-2 bg-blue-500 text-white rounded shadow close-button" on:click={closeModal}>Закрыть</button>

        </div>
  </div>

</div>
{:else}
  <p>Данные объекта не доступны.</p>
{/if}


<style>
    .content {
        position: relative;
        background: darkgray;
        max-height: 90vh;
        overflow-y: scroll;
        border-radius: 10px;
    }

    .object-card-modal {
        position: relative;
        background-image: radial-gradient(at 100% 0%, rgba(var(--color-secondary-500) / 0.33) 0px, transparent 50%), radial-gradient(at 2% 1%, rgba(var(--color-error-500) / 0.33) 0px, transparent 50%);
        background-color: rgb(var(--color-surface-900));
        max-width: 1840px;
        padding: 20px; /* Дополнительный внутренний отступ */
        display: grid;
        grid-template-columns: repeat(1, 1fr); /* По умолчанию в одну колонку */
        gap: 20px;
    }

    iframe {
        margin-top: 20px; /* Отступ между описанием и картой */
        border-radius: 15px; /* Закругленные углы для карты */
        width: 100%; /* Полная ширина в контейнере */
        max-width: 400px; /* Максимальная ширина */
        height: 400px;
    }

    .close-button {
        display: block;
        margin: 10px auto 20px; /* Автоматические отступы слева и справа для центрирования, отступ сверху */
        width: fit-content; /* Ширина по содержимому */
        padding: 10px 20px; /* Паддинги кнопки */
        background-color: #007bff; /* Фон кнопки */
        color: white; /* Цвет текста */
        border: none; /* Убрать рамку */
        border-radius: 5px; /* Закругленные углы */
        cursor: pointer; /* Курсор в виде руки при наведении */
    }
    @media (min-width: 768px) {
        .object-card-modal {
            grid-template-columns: repeat(2, 1fr); /* На больших экранах - две колонки */
        }
    }
</style>




