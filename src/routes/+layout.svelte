<script>
  import Modal from '$lib/Modal.svelte'
  import Footer from '../lib/Footer.svelte'
  import Nav from '../lib/Nav.svelte'
  import FeedbackModal from '$lib/FeedbackModal.svelte';
  import { modalStack } from '$lib/store.js';






</script>

<Nav />
<main>
  <slot />
  <Footer />


</main>
<Modal />
<button class="variant-ghost-tertiary fixed right-0 bottom-0 m-4 p-2 bg-indigo-600 text-white rounded" button on:click={() => modalStack.open('feedback', {})}>
  Обратная связь
</button>
<style global>
  @import './global.css';

</style>
