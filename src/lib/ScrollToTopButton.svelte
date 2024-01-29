<script>
  import { onMount } from 'svelte';
  import Icon from 'svelte-awesome/components/Icon.svelte';
  import arrowUp from 'svelte-awesome/icons/arrowUp';

  let showButton = false;

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function checkScroll() {
    showButton = window.pageYOffset > 100;
  }

  onMount(() => {
    window.addEventListener('scroll', checkScroll);
    return () => {
      window.removeEventListener('scroll', checkScroll);
    };
  });
</script>

{#if showButton}
  <button
    on:click={scrollToTop}
    class="top text-white bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-teal-300 dark:focus:ring-teal-800 shadow-lg shadow-teal-500/50 dark:shadow-lg dark:shadow-teal-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 fixed bottom-16 right-10">
    <Icon data={arrowUp} style="width: 30px; height: 30px;"/>
  </button>
{/if}

<style>
    button {
        transition: opacity 0.3s;
        margin-bottom: 40px;
        z-index: 20;

    }

</style>
