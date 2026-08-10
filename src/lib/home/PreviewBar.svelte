<script>
	/*
	 * The comparer's in-flow bar, rendered by the page on the SERVER.
	 *
	 * This used to live inside the dynamically imported comparer, which meant it
	 * appeared one frame after hydration and pushed the header and hero down by
	 * its own height. Reserving a slot only approximated the fix, because the
	 * bar wraps differently at 320/390/768 and no single reserved height is right
	 * everywhere.
	 *
	 * Rendering the real markup server-side removes the problem rather than
	 * compensating for it: the height at first paint IS the final height, at every
	 * breakpoint, because it is the same DOM. Only the dialog — the bulk of the
	 * code — stays code-split, so production still never fetches that chunk.
	 *
	 * Presentational only: no state, no storage, no URL handling.
	 */
	import { THEME_LABELS, COPY_LABELS } from '$lib/preview-comparer.js';

	export let theme;
	export let copy;
	export let open = false;
	/** Called with the trigger element so the dialog can restore focus to it. */
	export let onOpen = () => {};

	let triggerEl;
</script>

<div class="pc-bar">
	<div class="qc-container pc-bar-inner">
		<p class="pc-note">
			<span class="pc-badge">Deploy preview</span>
			Сравнение вариантов оформления. На рабочем сайте этого переключателя нет.
		</p>

		<p class="pc-current">
			{THEME_LABELS[theme]} · {COPY_LABELS[copy]}
		</p>

		<button
			type="button"
			class="pc-button pc-trigger"
			aria-haspopup="dialog"
			aria-expanded={open}
			bind:this={triggerEl}
			on:click={() => onOpen(triggerEl)}
		>
			Выбрать вариант
		</button>
	</div>
</div>
