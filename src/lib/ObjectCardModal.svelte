<script>
  import { modalStack } from '$lib/store.js';

    export let object; // Данные текущего объекта
  console.log()
    function closeModal() {
    modalStack.close();
  }
  $: console.log('Данные для модального окна объекта:', object);
    // Функции для других действий, например, открытия формы обратной связи, просмотра изображений и т.д.
</script>

<div class="modal-overlay">
  <div class="modal-window">
    <h1>{object.name}</h1>
    <img src={object.photo.url} alt={object.photo.description} />
    <p>Город: {object.city}</p>
    <p>Площадь: {object.area}</p>
    <p>Спальни: {object.bedrooms}</p>
    <p>Этаж: {object.floor} из {object.maxFloor}</p>
    <p>Лифт: {object.elevator ? 'Есть' : 'Нет'}</p>
    <p>Цена: {object.price}</p>
    <!-- Дополнительные данные об объекте -->

    <button on:click={closeModal}>Закрыть</button>
  </div>
</div>


<style>
    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .modal-window {
        background: black;
        padding: 20px;
        border-radius: 10px;
        max-width: 600px;
        width: 100%;
    }
</style>
