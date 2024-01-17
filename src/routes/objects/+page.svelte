<script>
  import Header from '../../lib/Header.svelte';
  import Card from './Card.svelte';
  export let data;
  console.log(data); // Логирование полученных данных
</script>

<section class="max-w-[var(--max-width)] mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
  {#each data.objects as object}
    <Card photo={object.photo} name={object.name} slug={object.slug} />
  {/each}
</section>

<style>
    /* Если у вас есть дополнительные глобальные стили, вы можете оставить их здесь */
</style>
