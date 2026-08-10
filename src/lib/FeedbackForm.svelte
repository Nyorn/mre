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
  import { freshStartedAt, retryStartedAt } from '$lib/form-timing.js';

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
    formStartedAt = freshStartedAt();
    leadId = newLeadId();
  });

  $: formErrors.name = !name ? 'Введите имя.' : '';
  $: formErrors.phone = !phone
    ? 'Введите телефон.'
    : (!/^\+\d{7,15}$/.test(phone.replace(/[\s()\-.]/g, '')) ? 'Неверный формат телефона. Пример: +359888123456' : '');
  $: formErrors.message = !message ? 'Оставьте сообщение.' : '';

  /*
   * P1 error timing. formErrors is computed eagerly so the submit guard below
   * stays exactly as it was, but showing those messages immediately meant an
   * untouched form greeted the visitor with three red errors. Messages now
   * appear once a field has been left, or once submit has been attempted.
   * Validation itself, and what the server receives, are unchanged.
   */
  let touched = { name: false, phone: false, message: false };
  let submitAttempted = false;

  const markTouched = (field) => { touched = { ...touched, [field]: true }; };

  /*
   * Plain reactive values, not a reactive helper function. `$: fn = (f) => ...`
   * re-creates the function but the template only re-reads it through a call,
   * which made the displayed error lag a state change. Three explicit
   * declarations are unambiguous and cheaper to read.
   */
  $: nameError = submitAttempted || touched.name ? formErrors.name || '' : '';
  $: phoneError = submitAttempted || touched.phone ? formErrors.phone || '' : '';
  $: messageError = submitAttempted || touched.message ? formErrors.message || '' : '';

  async function submitForm(event) {
    event.preventDefault();
    submitAttempted = true;
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
        const accepted =
          result.message ||
          'Почтовый сервис принял заявку к отправке. Доставка уведомления в офис ещё не подтверждена.';
        submissionResponse = objectName ? `${accepted} Объект: «${objectName}».` : accepted;
        // Only a confirmed hand-off to the provider clears the fields.
        name = phone = message = '';
        // Genuinely new enquiry from here on, so a fresh id and a fresh window.
        leadId = newLeadId();
        formStartedAt = freshStartedAt();
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
          formStartedAt = retryStartedAt();
          canRetry = true;
        }

        /*
         * A stale or missing window cannot be fixed by resending the same mark,
         * so restart it — backdated, because the message tells the visitor to
         * press Отправить immediately and a fresh Date.now() would come straight
         * back as too_fast. They keep everything they typed.
         */
        if (result.code === 'stale_form' || result.code === 'missing_timing') {
          formStartedAt = retryStartedAt();
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
      <input
        id="name"
        type="text"
        bind:value={name}
        name="name"
        class="input-style"
        aria-invalid={nameError ? 'true' : 'false'}
        aria-describedby={nameError ? 'name-error' : undefined}
        on:blur={() => markTouched('name')}
      />
      <span id="name-error" class={nameError ? 'error-message' : 'error-message hidden'}>{nameError}</span>
    </div>
  </div>
  <div class="input-container">
    <div class="field-container">
      <label for="phone" class="block text-sm font-medium">Телефон:</label>
      <input
        id="phone"
        type="tel"
        bind:value={phone}
        name="phone"
        class="input-style"
        aria-invalid={phoneError ? 'true' : 'false'}
        aria-describedby={phoneError ? 'phone-error' : undefined}
        on:blur={() => markTouched('phone')}
      />
      <span id="phone-error" class={phoneError ? 'error-message' : 'error-message hidden'}>{phoneError}</span>
    </div>
  </div>
  <div class="input-container">
    <div class="field-container mb-10">
      <label for="message" class="block text-sm font-medium">Сообщение:</label>
      <textarea
        id="message"
        bind:value={message}
        name="message"
        class="textarea-style"
        aria-invalid={messageError ? 'true' : 'false'}
        aria-describedby={messageError ? 'message-error' : undefined}
        on:blur={() => markTouched('message')}
      ></textarea>
      <span id="message-error" class={messageError ? 'error-message' : 'error-message hidden'}>{messageError}</span>
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
    /*
     * ONE SURFACE OWNER.
     *
     * The form used to paint its own panel and border. Inside the modal — which
     * also paints a surface and a border — that produced two nested frames, and
     * Cypress read the inner one as a second, unexplained container. The dialog
     * now owns surface, border, radius and padding; the form is transparent and
     * only lays out its fields. On /contacts, where the form is embedded
     * directly in the page, the section around it is the surface owner instead.
     */
    .feedback-form {
        background: transparent;
        border: 0;
        padding: 0;
        width: auto;
        max-width: 500px;
        color: var(--qc-ink-700, #344e54);
        font-family: var(--qc-font-ui, system-ui, sans-serif);
        /* Slice A: min-width was 500px, which overflows any viewport under
           500px until the 600px media query below kicks in. min() keeps the
           desktop width while never exceeding the viewport. */
        min-width: min(500px, 100%);
        margin: 10px auto;
    }

    .feedback-form :global(label) {
        color: var(--qc-ink-950, #102a30);
    }

    .object-context {
        margin: 0 0 8px;
        color: var(--qc-ink-700, #344e54);
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
        /* border-strong, not border: this is an interactive control boundary
           and needs 3:1 against the surface (WCAG 1.4.11). */
        border: 1px solid var(--qc-border-strong, #789197);
        padding: 10px 15px;
        /* 44px minimum target height. */
        min-height: 44px;
        border-radius: var(--qc-radius, 8px);
        background: var(--qc-surface, #fffdf8);
        color: var(--qc-ink-950, #102a30);
        font-family: inherit;
        font-size: 16px; /* below 16px iOS zooms the viewport on focus */
    }

    .input-style:focus-visible, .textarea-style:focus-visible {
        outline: 3px solid var(--qc-focus, #0b73b9);
        outline-offset: 2px;
    }

    .input-style[aria-invalid='true'], .textarea-style[aria-invalid='true'] {
        border-color: var(--qc-warning-text, #604c12);
        border-width: 2px;
    }

    .input-style::placeholder, .textarea-style::placeholder {
        color: var(--qc-muted, #62777c);
    }
    .input-container {
        margin-bottom: 8px;
    }
    /*
     * Errors are in normal flow, and reserve NOTHING while hidden.
     *
     * History worth keeping: they were position:absolute at bottom:-10px, so
     * the phone message — the only one long enough to wrap — overlapped the
     * next field at 320/390. Moving them into flow fixed the overlap, but the
     * two-line reservation I added then cost ~38px per field, ~114px of empty
     * space in a form that is valid. `display: none` while hidden removes that;
     * being in normal flow, a message that appears pushes content down instead
     * of covering it, which is the behaviour that mattered.
     */
    .error-message {
        display: block;
        /* #e83e8c on the old dark panel; on a light surface it is 3.4:1, so the
           error text moves to the warning ink, which is 7.5:1 here. */
        color: var(--qc-warning-text, #604c12);
        font-weight: 600;
        font-size: 14px;
        line-height: 19px;
        margin-top: 4px;
    }
    /* No reserved space: hidden errors take no room at all. */
    .error-message.hidden {
        display: none;
    }

    .submit-button {
        /* Same CTA system as the rest of the page; #007bff was 3.7:1 on white.
           Doubled selector is unnecessary here (no Tailwind preflight tie on a
           type=submit background in this component), but the colour comes from
           the token so it follows the active theme. */
        background-color: var(--qc-sea-700, #006b67);
        color: #ffffff;
        padding: 12px 24px;
        border: 1px solid var(--qc-sea-700, #006b67);
        border-radius: var(--qc-cta-radius, 8px);
        cursor: pointer;
        font-family: inherit;
        font-size: 16px;
        font-weight: 600;
        min-height: 48px;
        width: 100%;
        margin-top: 32px;
    }

    .submit-button:hover {
        /* Active theme's pressed tone. The legacy #007bff hover is gone. */
        background-color: var(--qc-sea-800, #005653);
        border-color: var(--qc-sea-800, #005653);
    }

    .submit-button:focus-visible {
        outline: 3px solid var(--qc-focus, #0b73b9);
        outline-offset: 2px;
    }

    .submit-button[disabled] {
        opacity: 0.75;
        cursor: default;
    }

    @media (max-width: 600px) {
        .feedback-form {
            max-width: 100%; /* Ширина на маленьких экранах */
            min-width: auto;
            padding: 20px; /* Меньший отступ */
        }
    }
</style>


