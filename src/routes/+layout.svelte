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
  let preloader;
  setContext('loading', loading);
  onMount(() => {
    loading.set(true);
    document.body.classList.add('no-scroll');
    setTimeout(() => {
      loading.set(false);
      document.body.classList.remove('no-scroll');
    }, 1500);
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());

    gtag('config', 'G-2EQQHPBC9X');
  });

</script>
<svelte:head>

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Comfortaa:wght@300..700&display=swap" rel="stylesheet">

  <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
  })(window,document,'script','dataLayer','GTM-57S8XWJV');</script>

  <script async src="https://www.googletagmanager.com/gtag/js?id=G-2EQQHPBC9X"></script>



</svelte:head>
<!-- Google Tag Manager (noscript) -->

<!-- End Google Tag Manager (noscript) -->
{#if $loading}
<Preloader bind:this={preloader} />
{/if}
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-57S8XWJV"
                  height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<Nav />
<main>
  <slot />
  <Footer />


</main>
<Modal />
<button type="button" class="callback text-white bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-teal-300 dark:focus:ring-teal-800 shadow-lg shadow-teal-500/50 dark:shadow-lg dark:shadow-teal-800/80 font-medium rounded-lg text-sm  text-center me-2 mb-2 fixed bottom-5 right-10" button on:click={() => modalStack.open('feedback', {})}>
  <Icon data={phone} style="width: 30px; height: 30px;"/>
</button>
<ScrollToTopButton />
<style global>
  @import './global.css';
.callback {
    box-shadow: 0 0 10px 0 #12ad9d;
    z-index: 9999;
    width: 60px;
    height: 60px;
    border-radius: 1000px;
}
</style>
