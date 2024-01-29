<script>
  import Modal from '$lib/Modal.svelte'
  import Footer from '../lib/Footer.svelte'
  import Nav from '../lib/Nav.svelte'
  import FeedbackModal from '$lib/FeedbackModal.svelte';
  import { modalStack } from '$lib/store.js';
  import ScrollToTopButton from '../lib/ScrollToTopButton.svelte';
  import '@fortawesome/fontawesome-free/css/all.css';
  import Preloader from '$lib/Preloader.svelte';
  import { setContext, onMount } from 'svelte';
  import { writable } from 'svelte/store';
  import { loading } from '$lib/store.js';
  import Icon from 'svelte-awesome/components/Icon.svelte';
  import phone from 'svelte-awesome/icons/phone';

  setContext('loading', loading);
  onMount(() => {
    loading.set(true); // Включаем прелоадер при каждом посещении страницы
    window.addEventListener('load', () => {
    setTimeout(() => {
      loading.set(false); // Правильное обновление значения хранилища
    }, 2000); // Например, 3 секунды загрузки
  }); });
</script>
<svelte:head>






  <script src="https://unpkg.com/three@0.140.2/build/three.min.js"></script>
</svelte:head>
<Preloader {loading}/>
<Nav />
<main>
  <slot />
  <Footer />


</main>
<Modal />
<button type="button" class="callback text-white bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-teal-300 dark:focus:ring-teal-800 shadow-lg shadow-teal-500/50 dark:shadow-lg dark:shadow-teal-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 fixed bottom-5 right-10" button on:click={() => modalStack.open('feedback', {})}>
  <Icon data={phone} style="width: 30px; height: 30px;"/> Обратный звонок
</button>
<ScrollToTopButton />
<style global>
  @import './global.css';
.callback {
    box-shadow: 0 0 10px 0 #12ad9d;
    z-index: 9999;
}
</style>
