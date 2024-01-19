<script>
  import { modalStore } from '$lib/store.js';
  // Логика компонента ObjectCardModal...

  function openFeedbackModal() {
    modalStore.open('feedback', { /* данные для формы */ });
  }

  function openImageViewerModal(imageData) {
    modalStore.open('imageViewer', imageData);
  }
</script>
