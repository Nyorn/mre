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
  function openFullSizeImage(imageUrl, index) {
    console.log("Opening image with URL:", imageUrl);
    modalStack.open('imageView', { imageUrl, images, currentIndex: index });
  }


</script>


<!-- Контейнер карусели -->
<div class="carousel">
  <!-- Кнопка: Влево -->
  <button type="button" class="carousel-button left" on:click={carouselLeft}>
    <i class="fa-solid fa-arrow-left arrow-icon" />
  </button>
  <!-- Главные изображения -->
  <div bind:this={elemCarousel} class="carousel-container">
    {#each images as image, i (image)}
      <img
        class="carousel-image"
        src={image}
        alt="Image"
        loading="lazy"
        on:click={() => openFullSizeImage(image, i)}
      />
    {/each}
  </div>
  <!-- Кнопка: Вправо -->
  <button type="button" class="carousel-button right" on:click={carouselRight}>
    <i class="fa-solid fa-arrow-right arrow-icon" />
  </button>
</div>

<!-- Миниатюры -->
<div class="thumbnails">
  {#each images as image, i}
    <button type="button" class="thumbnail-button" on:click={() => carouselThumbnail(i)}>
      <img
        class="thumbnail-image"
        src={image}
        alt="Thumbnail"
        loading="lazy"
      />
    </button>
  {/each}
</div>



<style>
    .carousel {
        position: relative;
    }

    .carousel-button {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        background-color: rgba(0, 0, 0, 0.5); /* Темный полупрозрачный фон */
        border-radius: 50%;
        border: none;
        cursor: pointer;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;

    }

    .arrow-icon {
        color: #fff; /* Белый цвет стрелки */

    }

    .carousel-button.left {
        left: 10px;
    }

    .carousel-button.right {
        right: 10px;
    }

    .carousel-container {
        display: flex;
        overflow-x: scroll;
        scroll-snap-type: x mandatory;
        margin: 0 auto;
        scroll-behavior: smooth;
    }

    .carousel-image {
        flex: 0 0 auto;
        scroll-snap-align: start;
        width: 100%;
        height: 800px; /* Увеличенная высота */
        object-fit: cover;
        border-radius: 10px;
    }

    .thumbnails {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
        overflow-y: auto;
        gap: 10px;
        padding: 10px 0;
        height: 220px;
        grid-auto-rows: 100px;
    }

    .thumbnail-button {
        border: none;
        background: none;
        padding: 0;
        cursor: pointer;
    }

    .thumbnail-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 10px; /* Скругленные углы */

    }

    @media (max-width: 768px) {
        .carousel-image {
            height: 250px;
        }
    }
</style>




