<script>
  import { modalStack } from '$lib/store.js';
  import FeedbackForm from '$lib/FeedbackForm.svelte';

  function closeModal() {
    modalStack.close();
  }

  let objectName = '';

  $: if ($modalStack.length > 0 && $modalStack[$modalStack.length - 1].type === 'feedback') {
    const modalData = $modalStack[$modalStack.length - 1].data;
    objectName = modalData.objectName || ''; // Ensure fallback to empty string
  }
</script>


{#if $modalStack.length > 0 && $modalStack[$modalStack.length - 1].type === 'feedback'}
  <div class="feedback-modal-container">
    <button class="feedback-close-button absolute top-0 right-0 m-2" on:click={closeModal}>X</button>
    <div class="p-4 shadow-lg rounded-lg bg-white">
      <FeedbackForm {objectName} />
    </div>
  </div>
{/if}

<style>

    .feedback-modal-container {
        position: relative;/* Использование fixed для позиционирования на всём экране */
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%); /* Центрирование модального окна */
        width: 50%; /* Пример ширины */
        max-width: 600px; /* Пример максимальной ширины */
        z-index: 10; /* Убедитесь, что оно выше других элементов */
    }



        .feedback-close-button {
        position: absolute;
        top: 1rem;
        right: 1rem;
        background: red;
    color: white;
        border: none;
        border-radius: 50%;
        width: 30px;
        height: 30px;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        z-index: 20;
    }
</style>

