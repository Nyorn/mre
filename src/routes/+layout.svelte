<script>
  /*
   * Route-aware shell.
   *
   * Home now owns its own header, main and footer so it can be one coherent
   * Quiet Coast surface with a working skip link and exactly one <main>. Every
   * other route keeps the existing chrome untouched — this is a gate, not a
   * rewrite, and nothing shared is deleted.
   *
   * The artificial 1500ms preloader is GONE, not merely gated. Every route in
   * this app is server-rendered: the HTML arrives complete, so a timer that
   * hides finished content for a second and a half is pure added latency, and
   * it also locked body scroll while it ran. Preloader.svelte itself is kept —
   * it is a shared module and deleting it is a separate decision — but nothing
   * renders it any more.
   */
  import Modal from '$lib/Modal.svelte'
  import Footer from '../lib/Footer.svelte'
  import Nav from '../lib/Nav.svelte'
  import { modalStack } from '$lib/store.js';
  import ScrollToTopButton from '../lib/ScrollToTopButton.svelte';
  import '@fortawesome/fontawesome-free/css/all.css';
  import { setContext, onMount } from 'svelte';
  import { loading } from '$lib/store.js';
  import { page } from '$app/stores';
  import Icon from 'svelte-awesome/components/Icon.svelte';
  import phone from 'svelte-awesome/icons/phone';
  setContext('loading', loading);

  /*
   * Server-decided, from the Netlify deployment context. Fails closed: only a
   * real production deploy loads GTM/gtag, so deploy previews and local dev no
   * longer report into the production property. Production behaviour is
   * unchanged — same containers, same config call.
   */
  export let data;
  $: analyticsEnabled = data?.analyticsEnabled === true;

  /*
   * Routes that render their own Quiet Coast header/main/footer. They get the
   * bare slot so the skip link can be the first focusable element and there is
   * exactly one <main>. Everything still on the legacy chrome — /objects,
   * object detail, /404 — keeps Nav/main/Footer untouched.
   */
  const OWN_SHELL_ROUTES = ['/', '/contacts', '/about'];
  $: isHome = $page.route?.id === '/';
  $: ownsShell = OWN_SHELL_ROUTES.includes($page.route?.id);

  onMount(() => {
    // No forced wait and no scroll lock anywhere: the server already sent the
    // finished page. The store is cleared for any component still reading it.
    loading.set(false);
    document.body.classList.remove('no-scroll');

    if (analyticsEnabled) {
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());

      gtag('config', 'G-2EQQHPBC9X');
    }
  });

</script>
<svelte:head>

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Comfortaa:wght@300..700&display=swap" rel="stylesheet">

  {#if analyticsEnabled}
  <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
  })(window,document,'script','dataLayer','GTM-57S8XWJV');</script>

  <script async src="https://www.googletagmanager.com/gtag/js?id=G-2EQQHPBC9X"></script>
  {/if}

</svelte:head>
<!-- Google Tag Manager (noscript) -->

<!-- End Google Tag Manager (noscript) -->
{#if analyticsEnabled}
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-57S8XWJV"
                  height="0" width="0" style="display:none;visibility:hidden" title="Google Tag Manager"></iframe></noscript>
{/if}

{#if ownsShell}
  <!-- These routes render their own header/main/footer (Quiet Coast shell). -->
  <slot />
{:else}
  <Nav />
  <main id="main">
    <slot />
    <Footer />
  </main>
{/if}

<Modal />

{#if !ownsShell}
  <button type="button" class="callback text-white bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-teal-300 dark:focus:ring-teal-800 shadow-lg shadow-teal-500/50 dark:shadow-lg dark:shadow-teal-800/80 font-medium rounded-lg text-sm  text-center me-2 mb-2 fixed bottom-5 right-10" button on:click={() => modalStack.open('feedback', {})}>
    <Icon data={phone} style="width: 30px; height: 30px;"/>
  </button>
  <ScrollToTopButton />
{/if}
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
