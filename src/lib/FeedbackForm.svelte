<script>
  /*
   * Slice A (P0.1 + P0.3) carried enquiry context. P0.5 changes where the
   * request goes: the browser now POSTs same-origin JSON to /api/lead instead
   * of posting a FormData straight to a third-party endpoint. No provider key
   * exists in client code — the server holds it.
   *
   * The client still validates, but only for fast feedback. The server decides.
   */
  import { onMount } from 'svelte';
  import { defaultMessageFor, readUtmParams } from '$lib/enquiry.js';

  export let objectName = '';
  export let objectId = '';
  export let objectSlug = '';
  export let intent = 'general_question';
  export let scenario = '';
  export let url = '';

  let name = '';
  let phone = '+';
  let message = defaultMessageFor({ intent, objectName, scenario });
  let website = ''; // honeypot — hidden from humans, tempting to bots
  let formErrors = {};
  let isSubmitting = false;
  let submissionResponse = '';
  let submissionState = 'idle'; // idle | success | error
  let canRetry = false;

  // When this form instance was rendered. The server compares it to now() to
  // reject submissions that arrive implausibly fast.
  let formStartedAt = 0;

  /*
   * One lead_id per logical enquiry, generated once and reused across retries.
   * The server passes it to Resend as Idempotency-Key, so pressing "retry"
   * after a timeout cannot produce a second notification for the same lead.
   * Regenerated only after a confirmed success.
   */
  let leadId = '';

  function newLeadId() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
    return '';
  }

  onMount(() => {
    formStartedAt = Date.now();
    leadId = newLeadId();
  });

  $: formErrors.name = !name ? 'Введите имя.' : '';
  $: formErrors.phone = !phone
    ? 'Введите телефон.'
    : (!/^\+\d{7,15}$/.test(phone.replace(/[\s()\-.]/g, '')) ? 'Неверный формат телефона. Пример: +359888123456' : '');
  $: formErrors.message = !message ? 'Оставьте сообщение.' : '';

  async function submitForm(event) {
    event.preventDefault();
    if (Object.values(formErrors).some(error => error)) return;

    isSubmitting = true;
    submissionResponse = '';
    submissionState = 'idle';
    canRetry = false;

    if (!leadId) leadId = newLeadId();

    const body = {
      lead_id: leadId,
      name,
      phone,
      message,
      website,
      form_started_at: formStartedAt,
      object_id: objectId,
      object_slug: objectSlug,
      object_name: objectName,
      intent,
      scenario,
      landing_url: url || (typeof window !== 'undefined' ? window.location.href : ''),
      ...readUtmParams()
    };

    try {
      const response = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(body)
      });

      const result = await response.json().catch(() => ({}));

      if (response.ok && result.ok) {
        submissionState = 'success';
        submissionResponse = objectName
          ? `${result.message || 'Заявка отправлена.'} Объект: «${objectName}».`
          : result.message || 'Заявка отправлена.';
        // Only a confirmed send clears the fields.
        name = phone = message = '';
        // New enquiry from here on, so a fresh id and timer.
        leadId = newLeadId();
        formStartedAt = Date.now();
      } else {
        submissionState = 'error';
        canRetry = result.retryable === true;
        if (result.errors) {
          formErrors = { ...formErrors, ...result.errors };
        }
        submissionResponse =
          result.message || 'Не удалось отправить заявку. Проверьте данные и попробуйте ещё раз.';

        /*
         * The visitor edited the form after a version had already been sent, so
         * the server refused to reuse the idempotency key. Their edit was NOT
         * sent. Mint a new lead id so pressing Отправить again sends the edited
         * version as a genuinely new enquiry rather than replaying the old one.
         */
        if (result.new_lead_required) {
          leadId = newLeadId();
          formStartedAt = Date.now();
          canRetry = true;
        }

        /*
         * A stale page cannot be fixed by resubmitting the same timestamp, so
         * refresh the timer here — the visitor keeps everything they typed.
         */
        if (result.code === 'stale_form' || result.code === 'missing_timing') {
          formStartedAt = Date.now();
        }
      }
    } catch (error) {
      submissionState = 'error';
      canRetry = true;
      submissionResponse = 'Не удалось отправить заявку: нет связи с сервером.';
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

  <!--
    Honeypot. Off-screen rather than display:none, because some bots skip
    hidden inputs. Hidden from assistive tech and from tab order, so a human
    using the form (including with a screen reader) never reaches it.
    P0.5: enquiry context is no longer sent as hidden inputs — the submit
    handler builds a JSON body, so duplicating it in the DOM would be dead code.
  -->
  <div class="hp-field" aria-hidden="true">
    <label for="website">Не заполняйте это поле</label>
    <input id="website" type="text" name="website" bind:value={website} tabindex="-1" autocomplete="off" />
  </div>

  <button type="submit" class="submit-button mt-10" disabled={isSubmitting}>{isSubmitting ? 'Отправка...' : 'Отправить'}</button>

  {#if isSubmitting}
    <p class="form-status qc-state qc-state-info" role="status" aria-live="polite">Отправляем заявку…</p>
  {:else if submissionState === 'success'}
    <p class="form-status qc-state qc-state-success" role="status" aria-live="polite">{submissionResponse}</p>
  {:else if submissionState === 'error'}
    <p class="form-status qc-state qc-state-error" role="alert">
      {submissionResponse}
      {#if canRetry}
        <br />
        <span class="retry-note">Данные остаются в полях страницы — нажмите «Отправить» ещё раз.</span>
      {/if}
    </p>
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

    .retry-note {
        display: inline-block;
        margin-top: 4px;
        font-size: 14px;
    }

    /* Honeypot: moved out of view rather than display:none, and kept out of the
       tab order and the accessibility tree. */
    .hp-field {
        position: absolute;
        left: -9999px;
        width: 1px;
        height: 1px;
        overflow: hidden;
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


