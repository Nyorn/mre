<script>
  export let imageUrl;
  export let images = [];
  export let currentIndex;

  $: if (images.length > 0 && typeof currentIndex === 'number') {
    imageUrl = images[currentIndex];
  }

  function goToNextImage() {
    currentIndex = (currentIndex + 1) % images.length;
  }

  function goToPreviousImage() {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
  }
</script>

{#if imageUrl}
  <div class="p-4">
    <button on:click={goToPreviousImage}>Previous</button>
    <img src={imageUrl} alt="Full Size Image" class="max-w-full h-auto mx-auto" />
    <button on:click={goToNextImage}>Next</button>
  </div>
{:else}
  <p>No image URL provided.</p>
{/if}



<style>
    .image-viewer img {

        object-fit: contain;
        z-index: 1005;
        position: relative;
    }
    .image-viewer button {
      z-index: 1005;
    }
</style>
