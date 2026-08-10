<!--
  Modal host for every stacked modal: lead form, object card, image viewer.

  Rebuilt as a real dialog. What it was before, measured in Chrome:
    - no role, no aria-modal, no accessible name — assistive tech saw a div;
    - focus stayed on the page behind, so a keyboard user pressed Tab from the
      opener straight into the still-reachable page;
    - Escape did nothing;
    - the background was neither inert nor aria-hidden, so a screen reader read
      the whole home page "through" the modal;
    - the close control was a <button> whose click handler was bound to the
      inner <svg>, so clicking the button's own padding did nothing, and the
      target was well under 44x44;
    - the feedback branch dropped intent/scenario/object context on the floor.

  All of that is fixed here rather than in each opener, so every entry point —
  hero CTA, scenario cards, enquiry section, object detail, the floating
  call-back button on other routes — gets the same behaviour.
-->
<script>
  import { onDestroy, tick } from 'svelte';
  import { modalStack, previewTheme } from '$lib/store.js';
  import FeedbackForm from '$lib/FeedbackForm.svelte';
  import ObjectCardModal from '$lib/ObjectCardModal.svelte';
  import ImageViewer from '$lib/ImageViewer.svelte';

  let dialogEl;
  /** The element that had focus when the stack went from empty to non-empty. */
  let opener = null;
  let wasOpen = false;

  $: isOpen = $modalStack.length > 0;
  $: top = isOpen ? $modalStack[$modalStack.length - 1] : null;

  /* Accessible name per modal type. A dialog without a name is an unlabelled
     region; screen readers announce "dialog" and nothing else. */
  const NAMES = {
    feedback: 'Форма заявки',
    objectCard: 'Карточка объекта',
    imageView: 'Просмотр изображения'
  };
  $: dialogName = (top && NAMES[top.type]) || 'Диалог';

  function focusableIn(root) {
    if (!root) return [];
    return Array.from(
      root.querySelectorAll(
        'button, [href], input:not([type="hidden"]), select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    ).filter((el) => !el.hasAttribute('disabled') && el.offsetParent !== null);
  }

  /*
   * Background inertness.
   *
   * `inert` removes the subtree from focus order AND from the accessibility
   * tree, which is exactly what a modal needs. aria-hidden is set alongside it
   * for engines that do not support inert yet; together they cover both the
   * "tab reaches the page behind" and "screen reader reads through" failures.
   * The modal host itself lives outside these containers, so it stays reachable.
   */
  function backgroundNodes() {
    if (typeof document === 'undefined') return [];
    return Array.from(document.querySelectorAll('.qc-home, nav, main, footer')).filter(
      (el) => !el.contains(dialogEl)
    );
  }

  function setBackgroundInert(on) {
    for (const el of backgroundNodes()) {
      if (on) {
        el.setAttribute('inert', '');
        el.setAttribute('aria-hidden', 'true');
      } else {
        el.removeAttribute('inert');
        el.removeAttribute('aria-hidden');
      }
    }
  }

  async function onOpened() {
    opener = document.activeElement;
    await tick();
    setBackgroundInert(true);
    // Initial focus goes inside the dialog, on the first control.
    const first = focusableIn(dialogEl)[0];
    (first || dialogEl)?.focus?.();
  }

  function onClosed() {
    setBackgroundInert(false);
    // Return focus to whatever opened it.
    if (opener && typeof opener.focus === 'function' && document.contains(opener)) {
      opener.focus();
    }
    opener = null;
  }

  $: if (typeof document !== 'undefined') {
    if (isOpen && !wasOpen) {
      wasOpen = true;
      onOpened();
    } else if (!isOpen && wasOpen) {
      wasOpen = false;
      onClosed();
    }
  }

  onDestroy(() => {
    if (typeof document !== 'undefined' && wasOpen) setBackgroundInert(false);
  });

  function closeModal() {
    modalStack.close();
  }

  function onKeydown(event) {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      closeModal();
      return;
    }

    if (event.key !== 'Tab') return;

    const items = focusableIn(dialogEl);
    if (items.length === 0) {
      event.preventDefault();
      return;
    }

    const first = items[0];
    const last = items[items.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  /* Clicking the backdrop closes, but only the backdrop itself — not a click
     that started inside the dialog and drifted out. */
  function onBackdropClick(event) {
    if (event.target === event.currentTarget) closeModal();
  }
</script>

{#if isOpen && top}
  <div class="modal-overlay" role="presentation" on:click={onBackdropClick}>
    <!--
      data-preview-theme mirrors the home page's active direction. The modal
      renders here in the layout, outside .qc-home, so the theme tokens scoped to
      the home wrapper never reached it and the enquiry window stayed Quiet Coast
      under B and C — the one surface a partner scrutinises most. Production
      never sets the store, so the attribute is absent and this renders in the
      default palette.
    -->
    <div
      class="modal-window"
      data-preview-theme={$previewTheme || null}
      role="dialog"
      aria-modal="true"
      aria-label={dialogName}
      tabindex="-1"
      bind:this={dialogEl}
      on:keydown={onKeydown}
    >
      <!-- Handler is on the button, not on the inner svg, and the hit area is
           44x44 so the whole control responds. -->
      <button type="button" class="close-button" on:click={closeModal} aria-label="Закрыть">
        <svg class="close-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true" focusable="false">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div class="modal-content">
        {#if top.type === 'feedback'}
          <!--
            Full enquiry context. openEnquiry() has been building
            intent/scenario/object_id/object_slug since Slice A and /api/lead
            validates and prints all of them; this component used to forward
            only objectName and url, so every scenario enquiry reached the
            office with no intent and no scenario.
          -->
          <FeedbackForm
            objectName={top.data.objectName || ''}
            objectId={top.data.objectId || ''}
            objectSlug={top.data.objectSlug || ''}
            intent={top.data.intent || 'general_question'}
            scenario={top.data.scenario || ''}
            url={top.data.url || ''}
          />
        {:else if top.type === 'objectCard'}
          <ObjectCardModal object={top.data} />
        {:else if top.type === 'imageView'}
          {#if top.data && top.data.images && typeof top.data.currentIndex === 'number'}
            <ImageViewer
              imageUrl={top.data.imageUrl}
              images={top.data.images}
              currentIndex={top.data.currentIndex}
            />
          {:else}
            <p>Не удалось открыть изображение.</p>
          {/if}
        {/if}
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-overlay {
    position: fixed;
    inset: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 16px;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 1000;
    overflow-y: auto;
  }

  .modal-window {
    position: relative;
    background: var(--qc-surface, #ffffff);
    border: 1px solid var(--qc-border, transparent);
    border-radius: var(--qc-radius, 18px);
    max-width: min(560px, 100%);
    width: 100%;
    max-height: calc(100vh - 32px);
    overflow-y: auto;
    z-index: 1001;
  }

  .modal-window:focus {
    outline: none;
  }

  .modal-content {
    padding: 8px;
  }

  .close-button {
    position: absolute;
    top: 8px;
    right: 8px;
    /* 44x44 minimum target, and the handler lives here. */
    width: 44px;
    height: 44px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    border-radius: 8px;
    color: var(--qc-ink-950, #1f2933);
    cursor: pointer;
    z-index: 2;
  }

  .close-button:hover {
    background: rgba(31, 41, 51, 0.08);
  }

  .close-button:focus-visible {
    outline: 3px solid var(--qc-focus, #0b73b9);
    outline-offset: 2px;
  }

  .close-icon {
    width: 24px;
    height: 24px;
    pointer-events: none;
  }
</style>
