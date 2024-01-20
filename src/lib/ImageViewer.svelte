<script>
  export let imageUrl;

  // Логируем URL изображения при его изменении
  $: if (imageUrl) {
    console.log("ImageViewer imageUrl:", imageUrl);
  }
</script>

<!-- In ImageViewer.svelte, check for imageUrl before rendering -->
{#if imageUrl}
  <div class="p-4">
    <img src={imageUrl} alt="Full Size Image" class="max-w-full h-auto mx-auto" />
  </div>
{:else}
  <p>No image URL provided.</p>
{/if}


<style>
    .image-viewer img {
        max-width: 90%;
        max-height: 80vh;
        object-fit: contain;
        z-index: 1005;
        position: relative;
    }
</style>
