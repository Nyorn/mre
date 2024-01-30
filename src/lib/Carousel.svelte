<script>
  import { onMount } from 'svelte';
  import { modalStack } from '$lib/store.js';
    export let slug; // Принимаем slug как
    let images = []; // Массив изображений
      let isLoading = images.map(() => true); // Массив для отслеживания загрузки изображений
  let elemCarousel; // HTMLDivElement;
  let currentIndex = 0; // Track the current index of the displayed image
console.log("Slug:", slug);




  onMount(async () => {
     await loadGalleryData();
     initializeLoadingState();
   });


  async function loadGalleryData() {
     try {
       const response = await fetch(`/api/getGallery?slug=${slug}`);
       if (response.ok) {
         const data = await response.json();
         images = data.images;
         isLoading = images.map(() => false); // Изменено на false
           console.log("Loaded images:", images); // Добавьте лог для проверки загруженных изображений
       } else {
         console.error('Ошибка при получении данных галереи:', response);
       }
     } catch (error) {
       console.error('Ошибка загрузки галереи:', error);
     }
   }

  function carouselLeft() {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    scrollToIndex(currentIndex);
  }

  function carouselRight() {
    currentIndex = (currentIndex + 1) % images.length;
    scrollToIndex(currentIndex);
  }

  function carouselThumbnail(index) {
    currentIndex = index;
    scrollToIndex(currentIndex);
  }

  function openFullSizeImage(imageUrl, index) {
      console.log('Opening full-size image with URL:', imageUrl, 'and index:', index);
   modalStack.open('imageView', { imageUrl, images, currentIndex: index });
  }

  function scrollToIndex(index) {
    const x = elemCarousel.clientWidth * index;
    elemCarousel.scroll(x, 0);
  }

  function handleImageLoad(index) {
    isLoading[index] = false; // Обновление состояния загрузки
  }
  function initializeLoadingState() {
    isLoading = images.map(() => true);
    images.forEach((img, index) => loadImage(img, index));
  }

  function loadImage(url, index) {
    const img = new Image();
    img.src = url;
    img.onload = () => {
      isLoading[index] = false;
    };
    img.onerror = () => {
      handleImageError(index);
    };
  }


  function handleImageError(index) {
    isLoading[index] = false; // Предполагаем, что изображение не загрузилось
  }

</script>


<!-- Контейнер карусели -->
<!-- Контейнер карусели -->
<div class="carousel">
  <!-- Кнопка: Влево -->
  <button type="button" class="carousel-button left" on:click={carouselLeft}>
    <i class="fa-solid fa-arrow-left arrow-icon" />
  </button>
  <!-- Главные изображения -->
  <div bind:this={elemCarousel} class="carousel-container">
    {#each images as image, i (image)}
      <div class="image-wrapper">
        {#if isLoading[i]}
          <div role="status" class="image-placeholder">
            <div class="flex items-center justify-center w-full h-full bg-gray-300 rounded dark:bg-gray-700">
              <svg class="w-10 h-10 text-gray-200 dark:text-gray-600" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 18">
                <path d="M18 0H2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm-5.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm4.376 10.481A1 1 0 0 1 16 15H4a1 1 0 0 1-.895-1.447l3.5-7A1 1 0 0 1 7.468 6a.965.965 0 0 1 .9.5l2.775 4.757 1.546-1.887a1 1 0 0 1 1.618.1l2.541 4a1 1 0 0 1 .028 1.011Z"/>
              </svg>
            </div>
          </div>
        {/if}
          <img
            class="carousel-image {isLoading[i] ? 'hidden' : ''}"
            src={image}
            alt="Image {i}"
            loading="lazy"
            on:load={() => handleImageLoad(i)}
            on:click={() => openFullSizeImage(image, i)}
            on:error={() => handleImageError(i)}
          />

      </div>
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
      {#if isLoading[i]}
        <div role="status" class="thumbnail-placeholder">
          <div role="status" class="image-placeholder">
            <div class="flex items-center justify-center w-full h-full bg-gray-300 rounded dark:bg-gray-700">
              <svg class="w-10 h-10 text-gray-200 dark:text-gray-600" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 18">
                <path d="M18 0H2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm-5.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm4.376 10.481A1 1 0 0 1 16 15H4a1 1 0 0 1-.895-1.447l3.5-7A1 1 0 0 1 7.468 6a.965.965 0 0 1 .9.5l2.775 4.757 1.546-1.887a1 1 0 0 1 1.618.1l2.541 4a1 1 0 0 1 .028 1.011Z"/>
              </svg>
            </div>
          </div>
        </div>

      {:else}
        <img
          class="thumbnail-image"
          src={image}
          alt="Thumbnail {i}"
          loading="lazy"
          on:load={() => handleImageLoad(i)}
        />
      {/if}
    </button>
  {/each}
</div>




<style>
    .hidden {
        display: none;
    }
    .image-placeholder {
        width: 100%; /* Match the width of the carousel images */
        height: 100%; /* Match the height of the carousel images */
        background-color: #E5E7EB; /* Light gray background */
        border-radius: 10px; /* Rounded corners */
        display: flex;
        align-items: center;
        justify-content: center;

    }
    .thumbnail-placeholder {
        width: 100px;
        height: 100px;
        background-color: #E5E7EB; /* Светло-серый фон */
        border-radius: 10px; /* Скругленные углы */
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .image-wrapper {
        flex: none; /* Override any flex settings */
        width: 100%; /* Each image wrapper should take the full width of the carousel container */
        height: 800px; /* Height can be auto to maintain aspect ratio */
        position: relative;
    }
    .carousel {
        position: relative;
    }

    .carousel-image {
        width: 100%;
        height: auto; /* Adjust height to maintain aspect ratio */
        object-fit: cover;
        border-radius: 10px;
    }
    .carousel-image:hover {
        cursor: zoom-in; /* Изменение курсора на лупу при наведении */
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
        z-index: 10;

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
        overflow-x: hidden; /* Hide the overflow to prevent multiple images from showing */
        scroll-snap-type: x mandatory;
        scroll-behavior: smooth;
        width: 100%; /* Ensure the container takes the full width of its parent */
    }

    .carousel-image {
        max-width: 100%; /* Image should not exceed the width of the wrapper */
        max-height: 800px; /* Optional: Limit the height to the viewport height */
        object-fit: cover; /* Cover the area without stretching the image */
        width: 100%; /* Uniform width */
        min-height: 800px; /* Maintain aspect ratio */
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




