<script>
  import { modalStack } from '$lib/store.js';
  import FeedbackForm from '$lib/FeedbackForm.svelte';

  function closeModal() {
    modalStack.close('feedback');
  }

  /*
   * Slice A: the modal now carries the full enquiry context (object + intent +
   * scenario + landing url), not just objectName/url.
   *
   * It also no longer gates rendering on a truthy `url`. The previous version
   * used an undeclared `isDataReady = !!url`, so any enquiry opened without an
   * object — including the floating call-back button in +layout.svelte, which
   * calls `modalStack.open('feedback', {})` — evaluated to false and the modal
   * never appeared. Scenario enquiries have no object by definition, so that
   * gate had to go.
   */
  let context = {
    intent: 'general_question',
    objectId: '',
    objectSlug: '',
    objectName: '',
    scenario: '',
    url: ''
  };

  $: isOpen =
    $modalStack.length > 0 && $modalStack[$modalStack.length - 1].type === 'feedback';

  $: if (isOpen) {
    const data = $modalStack[$modalStack.length - 1].data || {};
    context = {
      intent: data.intent || 'general_question',
      objectId: data.objectId || '',
      objectSlug: data.objectSlug || '',
      objectName: data.objectName || '',
      scenario: data.scenario || '',
      url: data.url || ''
    };
  }
</script>

{#if isOpen}
  <div class="feedback-modal-container" role="dialog" aria-modal="true" aria-label="Форма заявки">
    <button class="feedback-close-button" type="button" on:click={closeModal} aria-label="Закрыть форму заявки">
      <span aria-hidden="true">X</span>
    </button>
    <div class="modal-content">
      <FeedbackForm
        objectName={context.objectName}
        objectId={context.objectId}
        objectSlug={context.objectSlug}
        intent={context.intent}
        scenario={context.scenario}
        url={context.url}
      />
    </div>
  </div>
{/if}

<style>

    .feedback-modal-container {
        position: relative;/* Использование fixed для позиционирования на всём экране */
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%); /* Центрирование модального окна */
        width: 50%; /* Пример ширины */
        max-width: 600px; /* Пример максимальной ширины */
        z-index: 10; /* Убедитесь, что оно выше других элементов */
    }

    /* Slice A: below 600px a 50% width box with a 500px min-width form inside is
       a guaranteed horizontal overflow source. */
    @media (max-width: 600px) {
        .feedback-modal-container {
            width: 100%;
            max-width: 100%;
        }
    }

        .feedback-close-button {
        position: absolute;
        top: 1rem;
        right: 1rem;
        background: red;
    color: white;
        border: none;
        border-radius: 50%;
        width: 44px;
        height: 44px;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        z-index: 20;
    }
</style>
