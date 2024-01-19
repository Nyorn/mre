<script>
  import { modalStack } from '$lib/store.js';
  import FeedbackForm from '$lib/FeedbackForm.svelte';

  function closeModal() {
    modalStack.close();
  }

  let objectName = '';

  $: if ($modalStack.length > 0 && $modalStack[$modalStack.length - 1].type === 'feedback') {
    const modalData = $modalStack[$modalStack.length - 1].data;
    objectName = modalData.objectName || '';
  }
</script>

{#if $modalStack.length > 0 && $modalStack[$modalStack.length - 1].type === 'feedback'}
  <div class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
    <div class="variant-glass-secondary relative p-4 shadow-lg rounded-lg" style="width: 50%; max-width: 600px;">
      <button class="absolute top-0 right-0 m-2" on:click={closeModal}>X</button>
      <FeedbackForm {objectName} />
    </div>
  </div>
{/if}
