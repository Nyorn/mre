<script>
	/*
	 * Preview-only partner comparer.
	 *
	 * This component is rendered only when the server-side deployment-context
	 * gate said yes (see preview-comparer.js). It is never present in production
	 * markup, so there is nothing here for a visitor to switch on.
	 *
	 * Placement: the trigger lives in a bar in normal document flow above the
	 * header, not in a floating overlay. A fixed affordance would eventually sit
	 * on top of a CTA or the enquiry form at some viewport; an in-flow bar cannot.
	 *
	 * Side effects owned here, all preview-scoped:
	 *   - localStorage under a versioned key, two allowlisted ids, no PII;
	 *   - a canonical ?preview_theme=&preview_copy= URL via SvelteKit's
	 *     replaceState, so reviewers can share an exact combination and the back
	 *     button is not polluted with one entry per click;
	 *   - clipboard, on explicit user action only.
	 * No analytics event is emitted, and no data or media is re-fetched: a switch
	 * changes CSS custom properties and one text bundle.
	 */
	import { createEventDispatcher, onMount, tick } from 'svelte';
	import { replaceState } from '$app/navigation';
	import {
		PREVIEW_STORAGE_KEY,
		THEME_IDS,
		COPY_IDS,
		THEME_LABELS,
		COPY_LABELS,
		DEFAULT_THEME,
		DEFAULT_COPY,
		parseStoredPreview,
		serializeStoredPreview,
		buildPreviewSearch,
		buildShareUrl
	} from '$lib/preview-comparer.js';

	/** Server-resolved starting point. */
	export let theme = DEFAULT_THEME;
	export let copy = DEFAULT_COPY;
	/** 'query' | 'storage' | 'default' — a query link outranks stored state. */
	export let themeSource = 'default';
	export let copySource = 'default';

	const dispatch = createEventDispatcher();

	let open = false;
	let dialogEl;
	let triggerEl;
	let announcement = '';
	let shareUrl = '';

	function announce(text) {
		// Re-trigger the live region even when the text repeats.
		announcement = '';
		tick().then(() => {
			announcement = text;
		});
	}

	function persist(next) {
		try {
			localStorage.setItem(PREVIEW_STORAGE_KEY, serializeStoredPreview(next));
		} catch {
			// Private mode or a full quota: the session still works, it just
			// will not survive a reload. Not worth interrupting a reviewer for.
		}
	}

	function syncUrl(next) {
		if (typeof window === 'undefined') return;
		shareUrl = buildShareUrl(window.location.origin, window.location.pathname, next);
		try {
			replaceState(buildPreviewSearch(next), {});
		} catch {
			// Shallow routing unavailable (e.g. router not yet initialised).
			// The share field above is built from the variant, not from the URL,
			// so a reviewer can still copy the right link.
		}
	}

	function apply(next, { store = true } = {}) {
		theme = next.theme;
		copy = next.copy;
		if (store) persist(next);
		syncUrl(next);
		dispatch('change', next);
	}

	function onThemeChange(id) {
		apply({ theme: id, copy });
		announce(`Тема: ${THEME_LABELS[id]}`);
	}

	function onCopyChange(id) {
		apply({ theme, copy: id });
		announce(`Текст первого экрана: ${COPY_LABELS[id]}`);
	}

	function reset() {
		try {
			localStorage.removeItem(PREVIEW_STORAGE_KEY);
		} catch {
			// nothing to clean up
		}
		apply({ theme: DEFAULT_THEME, copy: DEFAULT_COPY }, { store: false });
		announce('Сброшено к производственному варианту: Quiet Coast, сценарий владения.');
	}

	async function copyLink() {
		const url = shareUrl || buildShareUrl('', '/', { theme, copy });
		try {
			await navigator.clipboard.writeText(url);
			announce('Ссылка скопирована.');
		} catch {
			announce('Скопировать автоматически не удалось. Ссылка выделена в поле ниже.');
			const field = dialogEl?.querySelector('.share-input');
			if (field) {
				field.focus();
				field.select();
			}
		}
	}

	/* ---------------- dialog: focus management ---------------- */

	function focusable() {
		if (!dialogEl) return [];
		return Array.from(
			dialogEl.querySelectorAll(
				'button, [href], input:not([type="hidden"]), select, textarea, [tabindex]:not([tabindex="-1"])'
			)
		).filter((el) => !el.hasAttribute('disabled') && el.offsetParent !== null);
	}

	async function openDialog() {
		triggerEl = document.activeElement;
		open = true;
		await tick();
		focusable()[0]?.focus();
	}

	function closeDialog() {
		open = false;
		// Focus returns to the control that opened the dialog, not to the top.
		triggerEl?.focus?.();
	}

	function onKeydown(event) {
		if (event.key === 'Escape') {
			event.stopPropagation();
			closeDialog();
			return;
		}

		if (event.key !== 'Tab') return;

		const items = focusable();
		if (items.length === 0) return;

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

	onMount(() => {
		/*
		 * Storage restore happens after hydration on purpose: the server already
		 * rendered the query-resolved variant, so a shared link paints correctly
		 * on the first frame. Storage only fills an axis the URL did not pin.
		 */
		const stored = parseStoredPreview(
			(() => {
				try {
					return localStorage.getItem(PREVIEW_STORAGE_KEY);
				} catch {
					return null;
				}
			})()
		);

		const next = {
			theme: themeSource === 'query' ? theme : stored.theme || theme,
			copy: copySource === 'query' ? copy : stored.copy || copy
		};

		if (next.theme !== theme || next.copy !== copy) {
			apply(next, { store: false });
		} else {
			syncUrl(next);
		}
	});
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
			on:click={openDialog}
		>
			Выбрать вариант
		</button>
	</div>
</div>

{#if open}
	<!-- Backdrop is decorative; Escape and the close button are the real exits. -->
	<div class="pc-backdrop" role="presentation" on:click={closeDialog}></div>

	<div
		class="pc-dialog"
		role="dialog"
		aria-modal="true"
		aria-labelledby="pc-dialog-title"
		bind:this={dialogEl}
		on:keydown={onKeydown}
	>
		<div class="pc-dialog-head">
			<h2 id="pc-dialog-title" class="pc-dialog-title">Вариант оформления</h2>
			<button type="button" class="pc-button pc-close" on:click={closeDialog}>Закрыть</button>
		</div>

		<div class="pc-dialog-body">
			<fieldset class="pc-fieldset">
				<legend class="pc-legend">Тема</legend>
				{#each THEME_IDS as id}
					<label class="pc-option">
						<input
							type="radio"
							name="preview-theme"
							value={id}
							checked={theme === id}
							on:change={() => onThemeChange(id)}
						/>
						<span>{THEME_LABELS[id]}</span>
					</label>
				{/each}
			</fieldset>

			<fieldset class="pc-fieldset">
				<legend class="pc-legend">Текст первого экрана</legend>
				{#each COPY_IDS as id}
					<label class="pc-option">
						<input
							type="radio"
							name="preview-copy"
							value={id}
							checked={copy === id}
							on:change={() => onCopyChange(id)}
						/>
						<span>{COPY_LABELS[id]}</span>
					</label>
				{/each}
			</fieldset>

			<div class="pc-share">
				<label class="pc-legend" for="pc-share-url">Ссылка на этот вариант</label>
				<input id="pc-share-url" class="share-input" type="text" readonly value={shareUrl} />
			</div>

			<div class="pc-actions">
				<button type="button" class="pc-button" on:click={copyLink}>Скопировать ссылку</button>
				<button type="button" class="pc-button" on:click={reset}>Сбросить</button>
			</div>

			<p class="pc-live" aria-live="polite">{announcement}</p>
		</div>
	</div>
{/if}

<style>
	/*
	 * Neutral control tokens throughout: the comparer must not read as part of
	 * the brand being compared, and it must look identical in all three themes.
	 */
	.pc-bar {
		background: #1f2933;
		color: #f2f5f7;
		padding: var(--qc-space-2) var(--qc-gutter);
		font-family: var(--qc-font-ui);
	}

	.pc-bar-inner {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--qc-space-2) var(--qc-space-4);
	}

	.pc-note {
		margin: 0;
		font-size: 13px;
		line-height: 19px;
		flex: 1 1 320px;
	}

	.pc-badge {
		display: inline-block;
		background: #f2f5f7;
		color: #1f2933;
		font-size: 11px;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		padding: 2px 6px;
		border-radius: 4px;
		margin-right: var(--qc-space-2);
	}

	.pc-current {
		margin: 0;
		font-size: 13px;
		font-weight: 600;
		white-space: nowrap;
	}

	.pc-button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-height: 44px;
		padding: 0 var(--qc-space-4);
		border-radius: 6px;
		border: 1px solid #55606b;
		background: #f2f5f7;
		color: #1f2933;
		font-family: inherit;
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
	}

	.pc-button:hover {
		background: #ffffff;
	}

	.pc-button:focus-visible,
	.pc-option input:focus-visible,
	.share-input:focus-visible {
		outline: 3px solid #7cc4ff;
		outline-offset: 2px;
	}

	.pc-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(16, 24, 32, 0.55);
		z-index: 1200;
	}

	.pc-dialog {
		position: fixed;
		z-index: 1201;
		background: #ffffff;
		color: #1f2933;
		font-family: var(--qc-font-ui);
		border: 1px solid #55606b;
		max-height: 90vh;
		overflow-y: auto;

		/* Mobile default: bottom sheet. */
		left: 0;
		right: 0;
		bottom: 0;
		border-radius: 12px 12px 0 0;
		padding: var(--qc-space-5) var(--qc-space-4) var(--qc-space-6);
	}

	.pc-dialog-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--qc-space-3);
	}

	.pc-dialog-title {
		margin: 0;
		font-size: 18px;
		line-height: 24px;
		font-weight: 700;
	}

	.pc-dialog-body {
		display: grid;
		gap: var(--qc-space-5);
		margin-top: var(--qc-space-5);
	}

	.pc-fieldset {
		border: 1px solid #ccd3da;
		border-radius: 8px;
		padding: var(--qc-space-3) var(--qc-space-4) var(--qc-space-4);
		margin: 0;
	}

	.pc-legend {
		font-size: 12px;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: #3d4852;
		padding: 0 var(--qc-space-1);
	}

	.pc-option {
		display: flex;
		align-items: center;
		gap: var(--qc-space-3);
		min-height: 44px;
		font-size: 15px;
		cursor: pointer;
	}

	.pc-option input {
		width: 20px;
		height: 20px;
		accent-color: #1f2933;
		flex: 0 0 auto;
	}

	.pc-share {
		display: grid;
		gap: var(--qc-space-2);
	}

	.share-input {
		width: 100%;
		min-height: 44px;
		padding: 0 var(--qc-space-3);
		border: 1px solid #ccd3da;
		border-radius: 6px;
		font-family: inherit;
		font-size: 14px;
		color: #1f2933;
		background: #f7f9fa;
	}

	.pc-actions {
		display: flex;
		flex-wrap: wrap;
		gap: var(--qc-space-3);
	}

	.pc-live {
		margin: 0;
		font-size: 13px;
		line-height: 19px;
		color: #3d4852;
		min-height: 19px;
	}

	/* Desktop: centred dialog rather than a sheet. */
	@media (min-width: 768px) {
		.pc-dialog {
			left: 50%;
			right: auto;
			bottom: auto;
			top: 50%;
			transform: translate(-50%, -50%);
			width: min(520px, calc(100vw - 48px));
			border-radius: 12px;
			padding: var(--qc-space-5);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.pc-button {
			transition: none;
		}
	}
</style>
