<script>
	/*
	 * Catalog filter bar — Quiet Coast.
	 *
	 * A port, not a rewrite of behaviour: the events and their payload keys are
	 * byte-identical to the legacy FilterBar, so the page's filter predicates are
	 * untouched. What changed is everything a keyboard or screen-reader user
	 * needs, which the old bar did not have:
	 *
	 *   - controls were labelled only by placeholder text and by the first
	 *     <option>, so once a value was chosen the control had no name at all;
	 *   - below 920px the Apply / Full filters / Sort buttons collapsed to bare
	 *     icons with no accessible name — three unlabelled buttons;
	 *   - the price/area/floor dropdown buttons carried no aria-expanded and no
	 *     aria-controls, so their popups were invisible to assistive tech;
	 *   - controls were well under 44px, and the surface was #1f2937 with
	 *     white-on-dark inputs.
	 *
	 * Labels here are persistent <label> elements, not placeholders. Icons never
	 * replace a name: at narrow widths the text is visually hidden but still the
	 * accessible name, and every icon button also carries an explicit aria-label.
	 */
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	const types = ['Аппартамент', 'Мезонит', 'Дом', 'Гараж', 'Вилла'];
	const cities = ['Бяла', 'Обзор', 'Равда', 'Солнечный берег', 'Святой Влас', 'Золотые пески'];

	/* State names match the legacy component so the payload cannot drift. */
	let city = '';
	let type = '';
	let bedrooms = '';
	let price = '';
	let area = '';
	let floor = '';
	let minPrice = '';
	let maxPrice = '';
	let minArea = '';
	let maxArea = '';
	let minFloor = '';
	let maxFloorValue = '';

	let openPanel = null; // 'price' | 'area' | 'floor' | null

	function togglePanel(name) {
		openPanel = openPanel === name ? null : name;
	}

	function closePanels() {
		openPanel = null;
	}

	/** Identical payload to the legacy bar. */
	function applyFilters() {
		dispatch('filter', {
			city,
			price,
			bedrooms,
			area,
			floor,
			type,
			minPrice: minPrice || undefined,
			maxPrice: maxPrice || undefined,
			minArea: minArea || undefined,
			maxArea: maxArea || undefined,
			minFloor: minFloor || undefined,
			maxFloorValue: maxFloorValue || undefined
		});
	}

	function resetFilters() {
		city = type = bedrooms = price = area = floor = '';
		minPrice = maxPrice = minArea = maxArea = minFloor = maxFloorValue = '';
		openPanel = null;

		dispatch('filter', {
			city: '',
			price: '',
			bedrooms: '',
			area: '',
			type: '',
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
			maxFloorFilter: undefined
		});
	}

	function openFullFilters() {
		dispatch('open-full-filters');
	}

	/* A range button's label states its current value, so the name stays true. */
	function rangeLabel(base, min, max, unit) {
		if (!min && !max) return base;
		const from = min ? `от ${min}${unit}` : '';
		const to = max ? `до ${max}${unit}` : '';
		return `${base}: ${[from, to].filter(Boolean).join(' ')}`;
	}

	$: priceLabel = rangeLabel('Цена', minPrice, maxPrice, ' €');
	$: areaLabel = rangeLabel('Площадь', minArea, maxArea, ' м²');
	$: floorLabel = rangeLabel('Этаж', minFloor, maxFloorValue, '');
</script>

<div class="bar" role="group" aria-label="Фильтры каталога">
	<div class="field">
		<label class="qc-caption field-label" for="filter-city">Город</label>
		<select id="filter-city" class="control" bind:value={city}>
			<option value="">Любой город</option>
			{#each cities as option}
				<option value={option}>{option}</option>
			{/each}
		</select>
	</div>

	<div class="field">
		<label class="qc-caption field-label" for="filter-type">Тип</label>
		<select id="filter-type" class="control" bind:value={type}>
			<option value="">Любой тип</option>
			{#each types as option}
				<option value={option}>{option}</option>
			{/each}
		</select>
	</div>

	<div class="field">
		<label class="qc-caption field-label" for="filter-bedrooms">Спальни</label>
		<input
			id="filter-bedrooms"
			class="control"
			type="number"
			min="0"
			inputmode="numeric"
			bind:value={bedrooms}
		/>
	</div>

	<!-- Range groups: the button names the filter AND its current value. -->
	<div class="field range">
		<span class="qc-caption field-label" id="filter-price-label">Цена</span>
		<button
			type="button"
			class="control range-button"
			aria-expanded={openPanel === 'price'}
			aria-controls="filter-price-panel"
			on:click={() => togglePanel('price')}
		>
			<span class="range-text">{priceLabel}</span>
			<span class="chevron" aria-hidden="true">▾</span>
		</button>
		{#if openPanel === 'price'}
			<div id="filter-price-panel" class="panel qc-panel" role="group" aria-labelledby="filter-price-label">
				<label class="qc-caption panel-label" for="filter-price-min">Мин. цена, €</label>
				<input id="filter-price-min" class="control" type="number" min="0" bind:value={minPrice} />
				<label class="qc-caption panel-label" for="filter-price-max">Макс. цена, €</label>
				<input id="filter-price-max" class="control" type="number" min="0" bind:value={maxPrice} />
				<button type="button" class="qc-cta qc-cta-secondary panel-done" on:click={closePanels}>
					Готово
				</button>
			</div>
		{/if}
	</div>

	<div class="field range">
		<span class="qc-caption field-label" id="filter-area-label">Площадь</span>
		<button
			type="button"
			class="control range-button"
			aria-expanded={openPanel === 'area'}
			aria-controls="filter-area-panel"
			on:click={() => togglePanel('area')}
		>
			<span class="range-text">{areaLabel}</span>
			<span class="chevron" aria-hidden="true">▾</span>
		</button>
		{#if openPanel === 'area'}
			<div id="filter-area-panel" class="panel qc-panel" role="group" aria-labelledby="filter-area-label">
				<label class="qc-caption panel-label" for="filter-area-min">Мин. площадь, м²</label>
				<input id="filter-area-min" class="control" type="number" min="0" bind:value={minArea} />
				<label class="qc-caption panel-label" for="filter-area-max">Макс. площадь, м²</label>
				<input id="filter-area-max" class="control" type="number" min="0" bind:value={maxArea} />
				<button type="button" class="qc-cta qc-cta-secondary panel-done" on:click={closePanels}>
					Готово
				</button>
			</div>
		{/if}
	</div>

	<div class="field range">
		<span class="qc-caption field-label" id="filter-floor-label">Этаж</span>
		<button
			type="button"
			class="control range-button"
			aria-expanded={openPanel === 'floor'}
			aria-controls="filter-floor-panel"
			on:click={() => togglePanel('floor')}
		>
			<span class="range-text">{floorLabel}</span>
			<span class="chevron" aria-hidden="true">▾</span>
		</button>
		{#if openPanel === 'floor'}
			<div id="filter-floor-panel" class="panel qc-panel" role="group" aria-labelledby="filter-floor-label">
				<label class="qc-caption panel-label" for="filter-floor-min">Мин. этаж</label>
				<input id="filter-floor-min" class="control" type="number" min="0" bind:value={minFloor} />
				<label class="qc-caption panel-label" for="filter-floor-max">Макс. этаж</label>
				<input id="filter-floor-max" class="control" type="number" min="0" bind:value={maxFloorValue} />
				<button type="button" class="qc-cta qc-cta-secondary panel-done" on:click={closePanels}>
					Готово
				</button>
			</div>
		{/if}
	</div>

	<div class="actions">
		<button type="button" class="qc-cta qc-cta-primary" on:click={applyFilters}>
			Применить фильтры
		</button>
		<button type="button" class="qc-cta qc-cta-secondary" on:click={openFullFilters}>
			Все фильтры
		</button>
		<button type="button" class="qc-cta qc-cta-neutral" on:click={resetFilters}>Сбросить</button>
	</div>
</div>

<style>
	.bar {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-end;
		gap: var(--qc-space-3);
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: 4px;
		min-width: 0;
		flex: 1 1 160px;
	}

	.range {
		position: relative;
	}

	.field-label {
		color: var(--qc-ink-700);
	}

	/*
	 * One control style for every input, select and range button. The border is
	 * --qc-border-strong, not --qc-border: an interactive boundary needs 3:1
	 * against the surface (WCAG 1.4.11) and the hairline is 1.31:1.
	 */
	.control {
		min-height: 44px;
		width: 100%;
		padding: 0 var(--qc-space-3);
		background: var(--qc-surface);
		color: var(--qc-ink-950);
		border: 1px solid var(--qc-border-strong);
		border-radius: var(--qc-cta-radius, 8px);
		font-family: var(--qc-font-ui);
		font-size: 16px;
		line-height: 24px;
	}

	.control:focus-visible {
		outline: 3px solid var(--qc-focus);
		outline-offset: 2px;
	}

	.range-button {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--qc-space-2);
		text-align: left;
		cursor: pointer;
	}

	.range-text {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.chevron {
		flex: 0 0 auto;
		color: var(--qc-ink-700);
	}

	.panel {
		position: absolute;
		top: calc(100% + 6px);
		left: 0;
		z-index: 20;
		width: min(260px, calc(100vw - 32px));
		background: var(--qc-surface);
		display: grid;
		gap: 4px;
	}

	.panel-label {
		color: var(--qc-ink-700);
		margin-top: var(--qc-space-2);
	}

	.panel-done {
		margin-top: var(--qc-space-3);
		width: 100%;
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: var(--qc-space-2);
		flex: 1 1 100%;
	}

	.actions > :global(*) {
		flex: 1 1 auto;
	}

	@media (min-width: 640px) {
		.actions {
			flex: 0 0 auto;
		}

		.actions > :global(*) {
			flex: 0 0 auto;
		}
	}
</style>
