<script>
  import Carousel from '$lib/Carousel.svelte';
  import { modalStack } from '$lib/store.js';

  export let data;
  export let object; // Данные текущего объекта

  $: images = object.galleryCollection?.items.map(item => item.url) || [];

  function closeModal() {
    modalStack.close();
  }
</script>





    <div class="content">


     <div class="object-card-modal grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
        <div>

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


      <button class="mt-4 px-4 py-2 bg-blue-500 text-white rounded shadow" on:click={closeModal}>Закрыть</button>
          <button class="variant-ghost-tertiary p-2 bg-indigo-600 text-white rounded" on:click={() => {
  console.log("Opening modal with object name:", object.name);
  modalStack.open('feedback', { objectName: object.name, key: object.key });
}}>
            Заказать осмотр
          </button>
    </div>
  </div>

</div>


<style>
    .content {
        position: relative;
        background: darkgray;
        max-height: 90vh;
        overflow-y: scroll;

    }

     .object-card-modal {
         position: relative;

        max-width:1840px; /* Example max-width */
         /* ... other styles ... */
     }
</style>



