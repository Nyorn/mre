<script>
  import { modalStack } from '$lib/store.js';
  import FeedbackForm from '$lib/FeedbackForm.svelte';
  import ObjectCardModal from '$lib/ObjectCardModal.svelte';

  function closeModal() {
    modalStack.close();
  }
</script>

{#if $modalStack.length > 0}
  <div class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
    <div class="variant-glass-secondary relative p-4 shadow-lg rounded-lg" style="width: 50%; max-width: 600px;">
      <button class="absolute top-0 right-0 m-2" on:click={closeModal}>X</button>
      {#if $modalStack[$modalStack.length - 1].type === 'feedback'}
        <FeedbackForm objectName={$modalStack[$modalStack.length - 1].data.objectName} />
      {:else if $modalStack[$modalStack.length - 1].type === 'objectCard'}
        <ObjectCardModal object={$modalStack[$modalStack.length - 1].data} />
      {/if}
      <!-- Добавьте другие условия для разных типов модальных окон -->
    </div>
  </div>
{/if}
