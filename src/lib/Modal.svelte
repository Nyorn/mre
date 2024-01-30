<!-- This component manages the overlay and the close button for all modals -->
<script>
  import { modalStack } from '$lib/store.js';
  import FeedbackForm from '$lib/FeedbackForm.svelte';
  import ObjectCardModal from '$lib/ObjectCardModal.svelte';
  import ImageViewer from '$lib/ImageViewer.svelte';
  import { clickOutsideAction } from "svelte-legos";
  function handleClickOutside() {
    console.log("Click outside detected");
    modalStack.close(); // Закрываем модальное окно
  }
  function closeModal() {
    console.log("Click outside detected on modal");
    modalStack.close();
  }
</script>

{#if $modalStack.length > 0}
  <div class="modal-overlay" use:clickOutsideAction on:clickoutside={closeModal}>
    {#each $modalStack as modalItem}
      <div class="modal-window">
        {#if modalItem.type === 'feedback'}
          <FeedbackForm objectName={modalItem.data.objectName || ''} />
        {:else if modalItem.type === 'objectCard'}
          <ObjectCardModal object={modalItem.data} />


        {:else if modalItem.type === 'imageView'}
          <div class="modal-overlay">
            <div class="image-viewer modal-window-full-image flex justify-center items-center">
              {#if modalItem.data && modalItem.data.images && typeof modalItem.data.currentIndex === 'number'}
                <ImageViewer
                  imageUrl={modalItem.data.imageUrl}
                  images={modalItem.data.images}
                  currentIndex={modalItem.data.currentIndex}
                />
              {:else}
                <p>Error: Missing data for imageView</p>
              {/if}
            </div>
          </div>
        {/if}
        <button class="close-button text-gray-700 hover:text-gray-900">
        <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" on:click={closeModal}>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
        </button>
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
        border-radius: 18px;
        z-index: 1001;
    }

    .close-button {
        position: absolute;
        top: 1rem;
        right: 1rem;
        color: black;
        border:none;
        /* Rest of your styles for close button */
    }
    .close-button:hover {
        cursor: pointer;
        background:transparent;
    }
        .modal-window-full-image {
            position: fixed;
            margin: auto;

            border-radius: 8px;
            z-index: 1002;
        }
</style>
