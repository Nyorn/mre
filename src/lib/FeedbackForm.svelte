<script>
  /*
   * Slice A (P0.1 + P0.3): the form now receives enquiry context and carries it
   * through as hidden fields, so a request always says which object and which
   * intent it came from.
   *
   * Explicitly out of scope here: delivery. The existing production endpoint is
   * left exactly as it was — Slice A does not add email sending, a receiver or
   * a CRM. That is Slice B (P0.5), and until it lands the delivery target below
   * remains the one this branch already shipped with.
   */
  import { defaultMessageFor } from '$lib/enquiry.js';

  export let objectName = '';
  export let objectId = '';
  export let objectSlug = '';
  export let intent = 'general_question';
  export let scenario = '';
  export let url = '';

  let name = '';
  let phone = '+';
  let message = defaultMessageFor({ intent, objectName, scenario });
  let formErrors = {};
  let isSubmitting = false;
  let submissionResponse = '';
  let submissionState = 'idle'; // idle | success | error

  $: formErrors.name = !name ? 'Введите имя.' : '';
  $: formErrors.phone = !phone ? 'Введите телефон.' : (!/^\+\d{1,15}$/.test(phone) ? 'Неверный формат телефона.' : '');
  $: formErrors.message = !message ? 'Оставьте сообщение.' : '';

  async function submitForm(event) {
    event.preventDefault();
    if (Object.values(formErrors).some(error => error)) return;

    const formData = new FormData(event.target);
    isSubmitting = true;
    submissionResponse = '';
    submissionState = 'idle';

    try {
      const response = await fetch('https://usebasin.com/f/9f7c7790f8dd', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        },
      });

      if (response.ok) {
        submissionState = 'success';
        submissionResponse = objectName
          ? `Заявка отправлена по объекту «${objectName}». Мы свяжемся с вами по указанному телефону.`
          : 'Заявка отправлена. Мы свяжемся с вами по указанному телефону.';
        name = phone = message = ''; // Очистка формы после успешной отправки
      } else {
        submissionState = 'error';
        submissionResponse = 'Не удалось отправить заявку. Проверьте данные и попробуйте ещё раз.';
      }
    } catch (error) {
      submissionState = 'error';
      submissionResponse = 'Нет соединения с формой. Проверьте сеть и попробуйте ещё раз.';
    } finally {
      isSubmitting = false;
    }
  }
</script>

<form on:submit={submitForm} name="feedback-form" class="feedback-form flex flex-col space-y-4 text-gray-700" novalidate>
  <div class="input-container">
    <div class="field-container">
      <label for="name" class="block text-sm font-medium">Имя:</label>
      <input id="name" type="text" bind:value={name} name="name" class="input-style" />
      <span class={formErrors.name ? 'error-message' : 'error-message hidden'}>{formErrors.name}</span>
    </div>
  </div>
  <div class="input-container">
    <div class="field-container">
      <label for="phone" class="block text-sm font-medium">Телефон:</label>
      <input id="phone" type="tel" bind:value={phone} name="phone" class="input-style" />
      <span class={formErrors.phone ? 'error-message' : 'error-message hidden'}>{formErrors.phone}</span>
    </div>
  </div>
  <div class="input-container">
    <div class="field-container mb-10">
      <label for="message" class="block text-sm font-medium">Сообщение:</label>
      <textarea id="message" bind:value={message} name="message" class="textarea-style"></textarea>
      <span class={formErrors.message ? 'error-message' : 'error-message hidden'}>{formErrors.message}</span>
    </div>
  </div>
  {#if objectName}
    <p class="qc-caption object-context">Заявка по объекту: <strong>{objectName}</strong></p>
  {:else if scenario}
    <p class="qc-caption object-context">Заявка по задаче: <strong>{scenario}</strong></p>
  {/if}

  <!-- Enquiry context (Slice A). Carried with every request so the receiving
       side knows the object and the intent without guessing. -->
  <input type="hidden" name="url" value={url} />
  <input type="hidden" name="landing_url" value={url} />
  <input type="hidden" name="object_id" value={objectId} />
  <input type="hidden" name="object_slug" value={objectSlug} />
  <input type="hidden" name="object_name" value={objectName} />
  <input type="hidden" name="intent" value={intent} />
  <input type="hidden" name="scenario" value={scenario} />

  <button type="submit" class="submit-button mt-10" disabled={isSubmitting}>{isSubmitting ? 'Отправка...' : 'Отправить'}</button>

  {#if isSubmitting}
    <p class="form-status qc-state qc-state-info" role="status" aria-live="polite">Отправляем заявку…</p>
  {:else if submissionState === 'success'}
    <p class="form-status qc-state qc-state-success" role="status" aria-live="polite">{submissionResponse}</p>
  {:else if submissionState === 'error'}
    <p class="form-status qc-state qc-state-error" role="alert">{submissionResponse}</p>
  {/if}
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
        /* Slice A: min-width was 500px, which overflows any viewport under
           500px until the 600px media query below kicks in. min() keeps the
           desktop width while never exceeding the viewport. */
        min-width: min(500px, 100%);
        margin: 10px auto;
        color: #f8f9fa; /* Светлый цвет текста */
    }

    .object-context {
        margin: 0 0 8px;
        color: #cfd8dc;
    }

    .form-status {
        margin-top: 16px;
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


