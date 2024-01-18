<script>
  import { superForm } from 'sveltekit-superforms/client';

  export let form;
  console.log('Form data in FeedbackForm:', form); // Добавлено логирование
  if (!form || !form.values) {
    // Установите начальные значения или обработайте ошибку
    form = { values: { name: '', email: '' }, errors: {} };
  }
  // Инициализируем форму
  const { values, errors, isSubmitting, handleSubmit, enhance } = superForm(form, { dataType: 'json' });

  async function onSubmit(data) {
    // Обработка отправки формы
    console.log(data);
  }
</script>

<form class="max-w-lg mx-auto p-4" form use:handleSubmit={onSubmit} use:enhance>
  <div class="mb-4">
    <label for="name" class="block text-gray-700 text-sm font-bold mb-2">Имя:</label>
    <input type="text" id="name" bind:value={values.name} class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
    {#if errors.name}
      <p class="text-red-500 text-xs italic">{errors.name}</p>
    {/if}
  </div>

  <div class="mb-6">
    <label for="email" class="block text-gray-700 text-sm font-bold mb-2">Email:</label>
    <input type="email" id="email" bind:value={values.email} class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
    {#if errors.email}
      <p class="text-red-500 text-xs italic">{errors.email}</p>
    {/if}
  </div>

  <div class="flex items-center justify-between">
    <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="submit" disabled={isSubmitting}>
      Отправить
    </button>
  </div>
</form>
