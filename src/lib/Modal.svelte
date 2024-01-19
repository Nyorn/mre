<!-- This component manages the overlay and the close button for all modals -->
<script>
  import { modalStack } from '$lib/store.js';
  import FeedbackForm from '$lib/FeedbackForm.svelte';
  import ObjectCardModal from '$lib/ObjectCardModal.svelte';

  function closeModal() {
    modalStack.close();
  }
</script>

{#if $modalStack.length > 0}
  <div class="modal-overlay">
    {#each $modalStack as modalItem}
      <div class="modal-window">
        {#if modalItem.type === 'feedback'}
          <FeedbackForm objectName={modalItem.data.objectName || ''} />
        {:else if modalItem.type === 'objectCard'}
          <ObjectCardModal object={modalItem.data} />
        {/if}
        <button class="close-button" on:click={closeModal}>X</button>
      </div>
    {/each}
  </div>
{/if}

<style>

        .modal-overlay {
            position: fixed;
            inset: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            background-color: rgba(0, 0, 0, 0.5);
            z-index: 1000;
    }
    .modal-window {
        position: absolute;
        margin: auto;

        border-radius: 8px;
        z-index: 1001;
        /* Do not set width here if you want different widths for different modals */
    }

    .close-button {
        position: absolute;
        top: 1rem;
        right: 1rem;
        /* Rest of your styles for close button */
    }
</style>
