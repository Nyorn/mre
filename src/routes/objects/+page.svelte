<script>
  import Header from '../../lib/Header.svelte';
  import Card from './Card.svelte';
  export let data;
  console.log(data); // Логирование полученных данных

</script>

<Header />

<h2>Cities</h2>

<section>
  {#each data.objects as object}

    <Card photo={object.photo} name={object.name} slug={object.slug} />

  {/each}
</section>

<style>
    section {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
        grid-auto-rows: minmax(150px, auto);
        grid-gap: 30px;
        max-width: var(--max-width);
        margin: 0 auto;
    }
</style>
