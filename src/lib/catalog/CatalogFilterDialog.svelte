<script>
	/*
	 * Full filters — a real dialog, replacing FullFilterModal.
	 *
	 * The component it replaces was a bare <div> on a radial-gradient dark
	 * surface: no role, no aria-modal, no accessible name, no focus management,
	 * no Escape, and a background that stayed focusable and readable behind it.
	 *
	 * This is the same pattern already used by the lead modal and the preview
	 * comparer: role=dialog + aria-modal, a VISIBLE heading referenced by
	 * aria-labelledby, focus moved in on open and returned to the opener on
	 * close, a Tab trap, Escape and backdrop close, and the page inerted while
	 * open. Bottom sheet on mobile, centred dialog from 768px.
	 *
	 * The `full-filter` payload is byte-identical to the legacy component, so the
	 * page's predicate chain is untouched.
	 */
	import { createEventDispatcher, onDestroy, tick } from 'svelte';

	const dispatch = createEventDispatcher();

	export let open = false;
	/** Focus returns here on close. */
	export let opener = null;

	let dialogEl;
	let wasOpen = false;

	const types = ['Аппартамент', 'Мезонит', 'Дом', 'Гараж', 'Вилла'];
	const cities = ['Бяла', 'Обзор', 'Равда', 'Солнечный берег', 'Святой Влас', 'Золотые пески'];

	let city = '';
	let type = '';
	let price = '';
	let bedrooms = '';
	let area = '';
	let bathrooms = '';
	let parking = '';
	let minPrice = '';
	let maxPrice = '';
	let minArea = '';
	let maxArea = '';
	let minFloor = '';
	let maxFloorValue = '';

	/* Amenities, as real checkboxes with real labels. */
	let elevator = false;
	let pool = false;
	let fromBuilder = false;
	let heat = false;
	let security = false;
	let conserj = false;
	let video = false;
	let fitness = false;
	let restoraunts = false;
	let playground = false;
	let tv = false;
	let internet = false;

	const AMENITIES = [
		{ key: 'elevator', label: 'Лифт' },
		{ key: 'pool', label: 'Бассейн' },
		{ key: 'fromBuilder', label: 'От застройщика' },
		{ key: 'heat', label: 'Отопление' },
		{ key: 'security', label: 'Охрана' },
		{ key: 'conserj', label: 'Консьерж' },
		{ key: 'video', label: 'Видеонаблюдение' },
		{ key: 'fitness', label: 'Фитнес' },
		{ key: 'restoraunts', label: 'Рестораны' },
		{ key: 'playground', label: 'Детская площадка' },
		{ key: 'tv', label: 'Телевидение' },
		{ key: 'internet', label: 'Интернет' }
	];

	/* Bound through an object so the checkbox list stays a loop. */
	let flags = {
		elevator, pool, fromBuilder, heat, security, conserj,
		video, fitness, restoraunts, playground, tv, internet
	};

	function payload() {
		return {
			city,
			type,
			price: price || undefined,
			bedrooms: bedrooms || undefined,
			elevator: flags.elevator || undefined,
			area: area || undefined,
			bathrooms: bathrooms || undefined,
			pool: flags.pool || undefined,
			parking,
			heating: undefined,
			fromBuilder: flags.fromBuilder || undefined,
			minPrice: minPrice || undefined,
			maxPrice: maxPrice || undefined,
			minArea: minArea || undefined,
			maxArea: maxArea || undefined,
			minFloor: minFloor || undefined,
			maxFloorValue: maxFloorValue || undefined,
			heat: flags.heat || undefined,
			security: flags.security || undefined,
			conserj: flags.conserj || undefined,
			video: flags.video || undefined,
			fitness: flags.fitness || undefined,
			restoraunts: flags.restoraunts || undefined,
			playground: flags.playground || undefined,
			tv: flags.tv || undefined,
			internet: flags.internet || undefined
		};
	}

	function apply() {
		dispatch('full-filter', payload());
		close();
	}

	function resetAll() {
		city = type = price = bedrooms = area = bathrooms = parking = '';
		minPrice = maxPrice = minArea = maxArea = minFloor = maxFloorValue = '';
		flags = Object.fromEntries(AMENITIES.map((a) => [a.key, false]));

		dispatch('full-filter', {
			city: '',
			type: '',
			price: undefined,
			bedrooms: undefined,
			elevator: undefined,
			area: undefined,
			bathrooms: undefined,
			pool: undefined,
			parking: '',
			heating: undefined,
			fromBuilder: undefined,
			minPrice: undefined,
			maxPrice: undefined,
			minArea: undefined,
			maxArea: undefined,
			minFloor: undefined,
			maxFloorValue: undefined,
			heat: undefined,
			security: undefined,
			conserj: undefined,
			video: undefined,
			fitness: undefined,
			restoraunts: undefined,
			playground: undefined,
			tv: undefined,
			internet: undefined
		});
	}

	/* ------------------------- focus + inertness ------------------------- */

	function focusable() {
		if (!dialogEl) return [];
		return Array.from(
			dialogEl.querySelectorAll(
				'button, [href], input:not([type="hidden"]), select, textarea, [tabindex]:not([tabindex="-1"])'
			)
		).filter((el) => !el.hasAttribute('disabled') && el.offsetParent !== null);
	}

	function backgroundNodes() {
		if (typeof document === 'undefined') return [];
		return Array.from(document.querySelectorAll('.qc-home > *')).filter(
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
		await tick();
		setBackgroundInert(true);
		focusable()[0]?.focus();
	}

	export function close() {
		open = false;
		// Un-inert first: focus cannot land inside an inert subtree.
		setBackgroundInert(false);
		opener?.focus?.();
		dispatch('close');
	}

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

	function onBackdrop(event) {
		if (event.target === event.currentTarget) close();
	}
</script>

{#if open}
	<div class="backdrop" role="presentation" on:click={onBackdrop}></div>

	<div
		class="dialog"
		role="dialog"
		aria-modal="true"
		aria-labelledby="full-filters-title"
		bind:this={dialogEl}
		on:keydown={onKeydown}
	>
		<div class="head">
			<h2 id="full-filters-title" class="qc-heading-3 title">Все фильтры</h2>
			<button type="button" class="qc-cta qc-cta-neutral close" on:click={close} aria-label="Закрыть все фильтры">
				Закрыть
			</button>
		</div>

		<div class="body">
			<div class="grid">
				<div class="field">
					<label class="qc-caption label" for="ff-city">Город</label>
					<select id="ff-city" class="control" bind:value={city}>
						<option value="">Любой город</option>
						{#each cities as option}<option value={option}>{option}</option>{/each}
					</select>
				</div>

				<div class="field">
					<label class="qc-caption label" for="ff-type">Тип</label>
					<select id="ff-type" class="control" bind:value={type}>
						<option value="">Любой тип</option>
						{#each types as option}<option value={option}>{option}</option>{/each}
					</select>
				</div>

				<div class="field">
					<label class="qc-caption label" for="ff-bedrooms">Спальни</label>
					<input id="ff-bedrooms" class="control" type="number" min="0" bind:value={bedrooms} />
				</div>

				<div class="field">
					<label class="qc-caption label" for="ff-bathrooms">Санузлы</label>
					<input id="ff-bathrooms" class="control" type="number" min="0" bind:value={bathrooms} />
				</div>

				<div class="field">
					<label class="qc-caption label" for="ff-min-price">Цена от, €</label>
					<input id="ff-min-price" class="control" type="number" min="0" bind:value={minPrice} />
				</div>

				<div class="field">
					<label class="qc-caption label" for="ff-max-price">Цена до, €</label>
					<input id="ff-max-price" class="control" type="number" min="0" bind:value={maxPrice} />
				</div>

				<div class="field">
					<label class="qc-caption label" for="ff-min-area">Площадь от, м²</label>
					<input id="ff-min-area" class="control" type="number" min="0" bind:value={minArea} />
				</div>

				<div class="field">
					<label class="qc-caption label" for="ff-max-area">Площадь до, м²</label>
					<input id="ff-max-area" class="control" type="number" min="0" bind:value={maxArea} />
				</div>

				<div class="field">
					<label class="qc-caption label" for="ff-min-floor">Этаж от</label>
					<input id="ff-min-floor" class="control" type="number" min="0" bind:value={minFloor} />
				</div>

				<div class="field">
					<label class="qc-caption label" for="ff-max-floor">Этаж до</label>
					<input id="ff-max-floor" class="control" type="number" min="0" bind:value={maxFloorValue} />
				</div>

				<div class="field">
					<label class="qc-caption label" for="ff-parking">Парковка</label>
					<input id="ff-parking" class="control" type="text" bind:value={parking} />
				</div>
			</div>

			<fieldset class="amenities">
				<legend class="qc-caption legend">Удобства</legend>
				{#each AMENITIES as amenity}
					<label class="checkbox">
						<input type="checkbox" bind:checked={flags[amenity.key]} />
						<span>{amenity.label}</span>
					</label>
				{/each}
			</fieldset>
		</div>

		<div class="actions">
			<button type="button" class="qc-cta qc-cta-primary" on:click={apply}>Показать объекты</button>
			<button type="button" class="qc-cta qc-cta-secondary" on:click={resetAll}>Сбросить всё</button>
		</div>
	</div>
{/if}

<style>
	.backdrop {
		position: fixed;
		inset: 0;
		background: rgba(16, 24, 32, 0.55);
		z-index: 1200;
	}

	.dialog {
		position: fixed;
		z-index: 1201;
		background: var(--qc-surface);
		color: var(--qc-ink-700);
		border: 1px solid var(--qc-border-strong);
		font-family: var(--qc-font-ui);
		display: flex;
		flex-direction: column;

		/* Mobile: bottom sheet. */
		left: 0;
		right: 0;
		bottom: 0;
		max-height: 90vh;
		border-radius: 12px 12px 0 0;
	}

	.head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--qc-space-3);
		padding: var(--qc-space-4);
		border-bottom: 1px solid var(--qc-border);
	}

	.title {
		margin: 0;
	}

	.close {
		flex: 0 0 auto;
	}

	.body {
		padding: var(--qc-space-4);
		overflow-y: auto;
	}

	.grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--qc-space-3);
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: 4px;
		min-width: 0;
	}

	.label {
		color: var(--qc-ink-700);
	}

	.control {
		min-height: 44px;
		width: 100%;
		padding: 0 var(--qc-space-3);
		background: var(--qc-surface);
		color: var(--qc-ink-950);
		/* 3:1 interactive boundary, not the decorative hairline. */
		border: 1px solid var(--qc-border-strong);
		border-radius: var(--qc-cta-radius, 8px);
		font-family: inherit;
		font-size: 16px;
	}

	.control:focus-visible,
	.checkbox input:focus-visible {
		outline: 3px solid var(--qc-focus);
		outline-offset: 2px;
	}

	.amenities {
		margin: var(--qc-space-5) 0 0;
		border: 1px solid var(--qc-border);
		border-radius: var(--qc-radius, 8px);
		padding: var(--qc-space-3) var(--qc-space-4) var(--qc-space-4);
		display: grid;
		grid-template-columns: 1fr;
		gap: 2px;
	}

	.legend {
		color: var(--qc-ink-700);
		padding: 0 var(--qc-space-1);
	}

	.checkbox {
		display: flex;
		align-items: center;
		gap: var(--qc-space-3);
		min-height: 44px;
		font-size: 16px;
		color: var(--qc-ink-950);
		cursor: pointer;
	}

	.checkbox input {
		width: 20px;
		height: 20px;
		accent-color: var(--qc-sea-700);
		flex: 0 0 auto;
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: var(--qc-space-3);
		padding: var(--qc-space-4);
		border-top: 1px solid var(--qc-border);
	}

	.actions > :global(*) {
		flex: 1 1 auto;
	}

	@media (min-width: 768px) {
		.dialog {
			left: 50%;
			right: auto;
			bottom: auto;
			top: 50%;
			transform: translate(-50%, -50%);
			width: min(680px, calc(100vw - 48px));
			border-radius: 12px;
		}

		.grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}

		.amenities {
			grid-template-columns: repeat(3, minmax(0, 1fr));
		}

		.actions > :global(*) {
			flex: 0 0 auto;
		}
	}
</style>
