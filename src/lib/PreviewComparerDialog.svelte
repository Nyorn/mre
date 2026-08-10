<script>
	/*
	 * The comparer's dialog. Code-split: imported dynamically by the home page
	 * only when the server-side deployment gate said yes, so production never
	 * fetches this chunk. The bar that opens it is server-rendered separately
	 * (see home/PreviewBar.svelte) precisely so this component's arrival cannot
	 * move the page.
	 *
	 * Side effects owned here, all preview-scoped:
	 *   - localStorage under a versioned key, WRITE-ONLY: the latest choice is
	 *     recorded but never read back into a render. Restoring it after
	 *     hydration was the last source of unexpected initial layout shift, and
	 *     the shareable query URL is the partner-facing source of truth instead.
	 *   - a canonical ?preview_theme=&preview_copy= URL via SvelteKit's
	 *     replaceState, so the address bar always states the active combination
	 *     and the back button is not polluted with one entry per click.
	 *   - clipboard, on explicit user action only.
	 * No analytics event is emitted and no data or media is re-fetched.
	 *
	 * LAYOUT CONTRACT (see the doc for the full statement):
	 *   - changing COPY must not move anything: the hero reserves a measured slot;
	 *   - changing THEME may reflow lower sections, because the approved B and C
	 *     directions genuinely differ in density and spacing. That reflow is
	 *     allowed only as the direct result of this input.
	 */
	import { createEventDispatcher, onMount, onDestroy, tick } from 'svelte';
	import { replaceState } from '$app/navigation';
	import {
		PREVIEW_STORAGE_KEY,
		THEME_IDS,
		COPY_IDS,
		THEME_LABELS,
		COPY_LABELS,
		DEFAULT_THEME,
		DEFAULT_COPY,
		serializeStoredPreview,
		buildPreviewSearch,
		buildShareUrl
	} from '$lib/preview-comparer.js';

	export let theme = DEFAULT_THEME;
	export let copy = DEFAULT_COPY;
	export let open = false;
	/** The bar's trigger button: focus returns here, and it is inerted while open. */
	export let opener = null;

	const dispatch = createEventDispatcher();

	let dialogEl;
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
			// Private mode or a full quota. Nothing depends on this value being
			// readable, so there is nothing to recover from.
		}
	}

	function syncUrl(next) {
		if (typeof window === 'undefined') return;
		shareUrl = buildShareUrl(window.location.origin, window.location.pathname, next);
		try {
			replaceState(buildPreviewSearch(next), {});
		} catch {
			// Shallow routing unavailable. The share field is built from the
			// variant rather than from the URL, so the right link is still there.
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
		announce(
			`Тема: ${THEME_LABELS[id]}. Плотность и отступы у направлений отличаются, поэтому разделы ниже могут сместиться.`
		);
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

	/* ---------------- focus management ---------------- */

	function focusable() {
		if (!dialogEl) return [];
		return Array.from(
			dialogEl.querySelectorAll(
				'button, [href], input:not([type="hidden"]), select, textarea, [tabindex]:not([tabindex="-1"])'
			)
		).filter((el) => !el.hasAttribute('disabled') && el.offsetParent !== null);
	}

	/*
	 * Background inertness.
	 *
	 * `inert` removes a subtree from the focus order and the accessibility tree.
	 * The comparer's own bar is inerted too — it is background while the dialog
	 * is open, and leaving it reachable let a screen-reader user tab back onto
	 * the trigger behind an open modal. It is un-inerted before focus returns to
	 * it on close, which is the only ordering that works.
	 */
	function backgroundNodes() {
		if (typeof document === 'undefined') return [];
		const nodes = Array.from(document.querySelectorAll('.qc-home > *')).filter(
			(el) => !el.contains(dialogEl)
		);
		return nodes;
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
		await tick();
		setBackgroundInert(true);
		focusable()[0]?.focus();
	}

	function close() {
		open = false;
		// Un-inert first: focus cannot land inside an inert subtree.
		setBackgroundInert(false);
		opener?.focus?.();
		dispatch('close');
	}

	let wasOpen = false;
	$: if (typeof document !== 'undefined') {
		if (open && !wasOpen) {
			wasOpen = true;
			onOpened();
		} else if (!open && wasOpen) {
			wasOpen = false;
		}
	}

	onDestroy(() => {
		if (typeof document !== 'undefined') setBackgroundInert(false);
	});

	function onKeydown(event) {
		if (event.key === 'Escape') {
			event.stopPropagation();
			close();
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
		 * The URL is made canonical once, so the address bar always states the
		 * active combination even when the visitor arrived on a bare URL. This
		 * changes no rendered pixel: the variant is whatever the server already
		 * resolved from the query.
		 */
		syncUrl({ theme, copy });
	});
</script>

{#if open}
	<!-- Backdrop is decorative; Escape and the close button are the real exits. -->
	<div class="pc-backdrop" role="presentation" on:click={close}></div>

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
			<button type="button" class="pc-button pc-close" on:click={close}>Закрыть</button>
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
				<p class="pc-live">
					Ссылка — источник истины. Выбор сохраняется в этом браузере, но не применяется
					при следующем открытии: без параметров страница всегда откроется в Quiet Coast.
				</p>
			</div>

			<div class="pc-actions">
				<button type="button" class="pc-button" on:click={copyLink}>Скопировать ссылку</button>
				<button type="button" class="pc-button" on:click={reset}>Сбросить</button>
			</div>

			<p class="pc-live" aria-live="polite">{announcement}</p>
		</div>
	</div>
{/if}
