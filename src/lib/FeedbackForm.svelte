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

<form on:submit={submitForm} class="feedback-form flex flex-col space-y-4 text-gray-700" novalidate>
  <div class="input-container">
  <div class="field-container">
    <label for="name" class="block text-sm font-medium">Имя:</label>
    <input id="name" type="text" bind:value={name} class="input-style" />
    <span class={formErrors.name ? 'error-message' : 'error-message hidden'}>{formErrors.name}</span>
  </div>
  </div>
  <div class="input-container">
  <div class="field-container">
    <label for="email" class="block text-sm font-medium">Email:</label>
    <input id="email" type="email" bind:value={email} class="input-style" />
    <span class={formErrors.email ? 'error-message' : 'error-message hidden'}>{formErrors.email}</span>
  </div>
  </div>
  <div class="input-container">
  <div class="field-container mb-10">
    <label for="message" class="block text-sm font-medium">Сообщение:</label>
    <textarea id="message" bind:value={message} class="textarea-style"></textarea>
    <span class={formErrors.message ? 'error-message' : 'error-message hidden'}>{formErrors.message}</span>
  </div>
  </div>
  <input type="hidden" bind:value={key} />
  <button type="submit" class="submit-button mt-10">Отправить</button>
</form>
<slot />

<style>
    .feedback-form {
        background: #2a2e35; /* Темный фон */
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.5); /* Тень для объемности */
        padding: 40px;
        width: auto;
        max-width: 500px;
        min-width: 500px;
        margin: 10px auto;
        color: #f8f9fa; /* Светлый цвет текста */
    }

    .field-container {
        margin-bottom: 15px;
    }

    .input-style, .textarea-style {
        width: 100%;
        border: 1px solid #4e555b; /* Светло-серая граница */
        padding: 10px 15px;
        border-radius: 4px;
        background: #1c2025; /* Еще более темный фон для полей */
        color: #f8f9fa; /* Светлый цвет текста */
    }

    .input-style::placeholder, .textarea-style::placeholder {
        color: #6c757d; /* Цвет placeholder */
    }
    .input-container {
        position: relative; /* Установите относительное позиционирование */
        margin-bottom: 20px; /* Отступ между полями */
    }
    .error-message {
        color: #e83e8c; /* Розовый цвет текста ошибки */
        font-size: 14px;
        margin-top: 2px;
        position: absolute; /* Абсолютное позиционирование */
        bottom: -10px; /* Расположение под полем ввода */
        left: 0; /* Выравнивание по левому краю */
    }
    .error-message.hidden {
        visibility: hidden;
    }

    .submit-button {
        background-color: #007bff;
        color: white;
        padding: 10px 15px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 16px;
        width: 100%;
        margin-top: 50px;
    }

    .submit-button:hover {
        background-color: #0056b3; /* Темно-синий при наведении */
    }
    @media (max-width: 600px) {
        .feedback-form {
            max-width: 100%; /* Ширина на маленьких экранах */
            min-width: auto;
            padding: 20px; /* Меньший отступ */
        }
    }
</style>


