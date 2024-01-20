<script>
  import { modalStack } from '$lib/store.js';
  export let images = []; // Массив изображений, переданный как props
  let elemCarousel; // HTMLDivElement;


  function carouselLeft() {
    const x = elemCarousel.scrollLeft === 0
      ? elemCarousel.clientWidth * elemCarousel.childElementCount // loop
      : elemCarousel.scrollLeft - elemCarousel.clientWidth; // step left
    elemCarousel.scroll(x, 0);
  }

  function carouselRight() {
    const x = elemCarousel.scrollLeft === elemCarousel.scrollWidth - elemCarousel.clientWidth
      ? 0 // loop
      : elemCarousel.scrollLeft + elemCarousel.clientWidth; // step right
    elemCarousel.scroll(x, 0);
  }

  function carouselThumbnail(index) {
    elemCarousel.scroll(elemCarousel.clientWidth * index, 0);
  }
  // In Carousel.svelte, update the openFullSizeImage function to pass the correct data structure
  function openFullSizeImage(imageUrl) {
    console.log("Opening image with URL:", imageUrl);
    // The data structure should match what Modal.svelte expects for 'imageView' type
    modalStack.open('imageView', { imageUrl });
  }

</script>


<div class="card p-4 grid grid-cols-[auto_1fr_auto] gap-4 items-center">
  <!-- Button: Left -->
  <button type="button" class="btn-icon variant-filled" on:click={carouselLeft}>
    <i class="fa-solid fa-arrow-left" />
  </button>
  <!-- Full Images -->
  <div bind:this={elemCarousel} class="snap-x snap-mandatory scroll-smooth carousel-container">
    {#each images as image}
      <img
        class="snap-center w-[1024px] rounded-container-token carousel-image"
        src={image}
        alt="Image"
        loading="lazy"
        on:click={() => openFullSizeImage(image)}
      />
    {/each}
  </div>
  <!-- Button: Right -->
  <button type="button" class="btn-icon variant-filled" on:click={carouselRight}>
    <i class="fa-solid fa-arrow-right" />
  </button>
</div>

<div class="card p-4 grid grid-cols-6 gap-4">
  {#each images as image, i}
    <button type="button" on:click={() => carouselThumbnail(i)}>
      <img
        class="rounded-container-token"
        src={image}
        alt="Thumbnail"
        loading="lazy"
      />
    </button>
  {/each}
</div>

<style>
    .carousel-container {
        display: flex;
        overflow-x: hidden;
        scroll-snap-type: x mandatory;
        width: 100%;
        margin: 0 auto;


    }

    .carousel-image {
        flex: 0 0 100%;
        scroll-snap-align: start;
       width: 100%;
    }

</style>

