<script>
  import { getContext } from 'svelte';
  const loading = getContext('loading');

  // Функция для блокировки скролла
  function preventScroll() {
    if (typeof window !== 'undefined') {
      document.body.style.overflow = 'hidden';
    }
  }

  // Функция для разрешения скролла
  function allowScroll() {
    if (typeof window !== 'undefined') {
      document.body.style.overflow = '';
    }
  }

  // Подписываемся на состояние loading и обновляем стили для body
  $: if (typeof window !== 'undefined') {
    if ($loading) {
      preventScroll();
    } else {
      allowScroll();
    }
  }
</script>


{#if $loading}
<div class="preloader">
    <!-- Ваша анимация или лого здесь -->


    <div class="container">

      <svg class="loader" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 340 340">
        <circle cx="170" cy="170" r="160" stroke="#E2007C"/>
        <circle cx="170" cy="170" r="135" stroke="#404041"/>
        <circle cx="170" cy="170" r="110" stroke="#E2007C"/>
        <circle cx="170" cy="170" r="85" stroke="#404041"/>
      </svg>

    </div>


  </div>
{/if}


<style>
    .container {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        min-width: 100%;
        background-color: rgb(var(--color-surface-900));
        background-image: radial-gradient(at 100% 0%, rgba(var(--color-secondary-500) / 0.33) 0px, transparent 50%), radial-gradient(at 2% 1%, rgba(var(--color-error-500) / 0.33) 0px, transparent 50%);
        overflow-x: hidden;
    }

    .loader {
        max-width: 15rem;
        width: 100%;
        height: auto;
        stroke-linecap: round;
    }

    circle {
        fill: none;
        stroke-width: 3.5;
        animation-name: preloader;
        animation-duration: 3s;
        animation-iteration-count: infinite;
        animation-timing-function: ease-in-out;
        transform-origin: 170px 170px;
        will-change: transform;
    }

    circle:nth-of-type(1) {
        stroke-dasharray: 550px;
        animation-delay: -0.15s;
    }

    circle:nth-of-type(2) {
        stroke-dasharray: 500px;
        animation-delay: -0.3s;
    }

    circle:nth-of-type(3) {
        stroke-dasharray: 450px;
        animation-delay: -0.45s;
    }

    circle:nth-of-type(4) {
        stroke-dasharray: 300px;
        animation-delay: -0.6s;
    }

    @keyframes preloader {
        50% {
            transform: rotate(360deg);
        }
    }
    .loaded {
        animation: fadeOut 1s ease-out forwards;
    }

    @keyframes fadeOut {
        to {
            opacity: 0;
            visibility: hidden;
        }
    }
</style>