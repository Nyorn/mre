<script>
  export let objectName = '';
  export let key = ''; // Экспортированный параметр key

  let name = '';
  let email = '';
  let message = objectName ? `Осмотр объекта: ${objectName}` : '';
  let formErrors = {};

  // Реактивная валидация полей
  $: formErrors.name = !name ? 'Имя обязательно.' : '';
  $: formErrors.email = !email ? 'Email обязателен.' :
    (!/\S+@\S+\.\S+/.test(email) ? 'Неверный формат email.' : '');
  $: formErrors.message = !message ? 'Сообщение обязательно.' : '';

  // Функция отправки формы
  async function submitForm(event) {
    event.preventDefault();
    if (Object.values(formErrors).some(error => error)) return;
    const formData = { name, email, message, key };
    console.log('Form Submitted:', formData);
    // Здесь можно добавить логику отправки данных на сервер
  }
</script>

<form on:submit={submitForm} class="feedback-form flex flex-col space-y-4 text-grey-500" novalidate>
  <div class="field-container">
    <label for="name" class="block text-sm font-medium">Имя:</label>
    <input id="name" type="text" bind:value={name} class="input-style" />
    <span class={formErrors.name ? 'error-message' : 'error-message hidden'}>{formErrors.name}</span>
  </div>

  <div class="field-container">
    <label for="email" class="block text-sm font-medium">Email:</label>
    <input id="email" type="email" bind:value={email} class="input-style" />
    <span class={formErrors.email ? 'error-message' : 'error-message hidden'}>{formErrors.email}</span>
  </div>

  <div class="field-container">
    <label for="message" class="block text-sm font-medium">Сообщение:</label>
    <textarea id="message" bind:value={message} class="textarea-style"></textarea>
    <span class={formErrors.message ? 'error-message' : 'error-message hidden'}>{formErrors.message}</span>
  </div>

  <input type="hidden" bind:value={key} />
  <button type="submit" class="submit-button">Отправить</button>
</form>
<slot />

<style>
    .feedback-form {
        min-height: 320px; /* Пример минимальной высоты */
        width: 100%; /* Занимает всю ширину контейнера */
    }

    .field-container {
        width: 100%; /* Занимает всю ширину формы */
    }

    .input-style, .textarea-style {
        width: 100%; /* Занимает всю ширину родительского контейнера */
        background: black;
        /* Остальные стили для input и textarea */
    }

    .error-message {
        display: block; /* Занимает всю ширину, располагается под полем */
        min-height: 20px;
        color: red;
        font-size: 12px;
        margin-top: 4px;
    }

    .error-message.hidden {
        visibility: hidden;
    }

    .submit-button {
        /* Стили для кнопки отправки */
    }
</style>