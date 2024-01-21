<script>
  import { clickOutsideAction } from "svelte-legos";
  import { modalStack } from '$lib/store.js';
  export let imageUrl;
  export let images = [];
  export let currentIndex;

  $: if (images.length > 0 && typeof currentIndex === 'number') {
    imageUrl = images[currentIndex];
  }
  let hidden = false;

  function handleClickOutside() {
    console.log("Click outside detected");
    modalStack.close(); // Закрываем модальное окно
  }
  function goToNextImage() {
    currentIndex = (currentIndex + 1) % images.length;
  }
  function goToPreviousImage() {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
  }
</script>

{#if !hidden && imageUrl}
  <div class="modal" use:clickOutsideAction on:clickoutside={handleClickOutside}>
    <div class="image-container">
      <button class="previous" on:click={goToPreviousImage}>&larr;</button>
      <img src={imageUrl} alt="Full Size Image" class="image" />
      <button class="next" on:click={goToNextImage}>&rarr;</button>
    </div>
  </div>
{:else}
  <p>No image URL provided or modal is hidden.</p>
{/if}

<style>
    .modal {

        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
    }
    .modal .image-container {
        position: relative;
        display: flex;
        align-items: center;
    }
    .modal .image {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
    }
    .modal .previous, .modal .next {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        background: none;
        border: none;
        color: white;
        font-size: 24px;
        cursor: pointer;
        padding: 0 15px;
    }
    .modal .previous { left: 0; }
    .modal .next { right: 0; }
</style>
