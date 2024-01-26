<script>
  import { onMount } from 'svelte';

  onMount(() => {
    console.log('onMount запущен');
    const form = document.getElementById('hidden-netlify-form');
    if (form) {
      console.log('Форма найдена, пытаюсь отправить...');
      form.submit(); // Автоматическая отправка при монтировании
    } else {
      console.log('Форма не найдена');
    }
  });
</script>

<form name="my-svelte-form" id="hidden-netlify-form" action="/" method="POST" data-netlify="true">
  <input type="hidden" name="name" value="Значение из вашего приложения" />
  <input type="hidden" name="email" value="Значение из вашего приложения" />
  <textarea name="message">Ваше сообщение</textarea>
  <input type="hidden" name="key" value="Значение ключа" />
</form>