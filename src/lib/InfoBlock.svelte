<script>
  import { onMount } from 'svelte';
  import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';

  let FontAwesomeIcon;

  onMount(async () => {
    const module = await import('svelte-awesome');
    FontAwesomeIcon = module.default;
  });
</script>
{#if FontAwesomeIcon}
<div class="container mx-auto p-6 bg-white shadow-md rounded">
  <h1 class="text-3xl font-bold mb-2">Кто мы?</h1>
  <p class="mb-4">Мы - команда экспертов с личным опытом, специализирующихся на недвижимости в Болгарии. Наша миссия - помочь вам обрести дом, или сделать инвестицию в этом прекрасном уголке мира.</p>

  <div class="mb-4">
    <h3 class="text-2xl font-semibold mb-2">🌟 Наши Преимущества:</h3>
    <ul class="list-disc pl-5">
      <li class="mb-1"><FontAwesomeIcon icon={faCheckCircle} class="text-green-500 mr-2" />Опыт и Экспертность: Мы обладаем глубоким пониманием болгарского рынка недвижимости.</li>
      <li class="mb-1"><FontAwesomeIcon icon={faCheckCircle} class="text-green-500 mr-2" />Индивидуальный Подход: Покупка недвижимости у нас - это анализ ваших потребностей.</li>
      <li class="mb-1"><FontAwesomeIcon icon={faCheckCircle} class="text-green-500 mr-2" />Эксклюзивные Предложения: Широкий выбор недвижимости и уникальные предложения.</li>
      <li class="mb-1"><FontAwesomeIcon icon={faCheckCircle} class="text-green-500 mr-2" />Инвестиционный опыт: Стратегии для устойчивого роста вашего капитала.</li>
    </ul>
  </div>

  <div>
    <h3 class="text-xl font-semibold mb-2">🌍 Почему Болгария?</h3>
    <p>Болгария - это не просто страна с красивыми пейзажами, но и место, где можно найти свой уголок под солнцем. Откройте для себя все преимущества жизни в этой удивительной стране.</p>
    <h3 class="text-xl font-semibold mb-2 mt-5"> 📞 Свяжитесь с нами:
      Не теряйте времени и возможностей . Свяжитесь с нашей командой сегодня, и дайте нам возможность сделать ваш выбор недвижимости в Болгарии максимально удачным и приятным!</h3>
  </div>
</div>
{/if}
<style>
    .container {
        background: transparent;
    }
</style>
