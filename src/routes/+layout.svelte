<script>
  import Modal from '$lib/Modal.svelte'
  import Footer from '../lib/Footer.svelte'
  import Nav from '../lib/Nav.svelte'
  import FeedbackModal from '$lib/FeedbackModal.svelte';
  import { modalStack } from '$lib/store.js';
  import ScrollToTopButton from '../lib/ScrollToTopButton.svelte';
  import '@fortawesome/fontawesome-free/css/all.css';





</script>
<svelte:head>


  <script src="https://unpkg.com/three@0.140.2/build/three.min.js"></script>
</svelte:head>

<Nav />
<main>
  <slot />
  <Footer />
  <form id="netlify-hidden-form" action="/" method="POST" data-netlify="true" style="display: none;">
    <input type="text" name="name" />
    <input type="email" name="email" />
    <textarea name="message"></textarea>
    <input type="text" name="key" />
    <input type="hidden" name="form-name" value="my-svelte-form" />
  </form>

</main>
<Modal />
<button type="button" class="text-white bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-teal-300 dark:focus:ring-teal-800 shadow-lg shadow-teal-500/50 dark:shadow-lg dark:shadow-teal-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 fixed bottom-5 right-10" button on:click={() => modalStack.open('feedback', {})}>
  Обратная связь
</button>
<ScrollToTopButton />
<style global>
  @import './global.css';

</style>
