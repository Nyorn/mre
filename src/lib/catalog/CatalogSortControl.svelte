<script>
	/*
	 * Sort control — named actions, not an icon.
	 *
	 * The legacy SortModal was opened by an icon-only button below 920px with no
	 * accessible name, positioned by writing style.top/left from a click event,
	 * and its options were unlabelled arrows. A native <select> is the honest
	 * control here: one persistent label, one accessible name, keyboard support
	 * for free, and every option states in words what it does.
	 *
	 * Emits the same `sort` payload shape the page already consumes:
	 * { price?: 'asc'|'desc', area?: 'asc'|'desc', floor?: 'asc'|'desc' }.
	 * An empty selection emits {} — the page's comparator then leaves order
	 * untouched, which is exactly what it did before.
	 */
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	const OPTIONS = [
		{ value: '', label: 'Без сортировки' },
		{ value: 'price:asc', label: 'Сначала дешевле' },
		{ value: 'price:desc', label: 'Сначала дороже' },
		{ value: 'area:asc', label: 'Сначала меньше площадь' },
		{ value: 'area:desc', label: 'Сначала больше площадь' },
		{ value: 'floor:asc', label: 'Сначала ниже этаж' },
		{ value: 'floor:desc', label: 'Сначала выше этаж' }
	];

	let selected = '';

	function onChange() {
		if (!selected) {
			dispatch('sort', {});
			return;
		}
		const [field, direction] = selected.split(':');
		dispatch('sort', { [field]: direction });
	}
</script>

<div class="sort">
	<label class="qc-caption sort-label" for="catalog-sort">Сортировка</label>
	<select id="catalog-sort" class="control" bind:value={selected} on:change={onChange}>
		{#each OPTIONS as option}
			<option value={option.value}>{option.label}</option>
		{/each}
	</select>
</div>

<style>
	.sort {
		display: flex;
		flex-direction: column;
		gap: 4px;
		min-width: 0;
		flex: 1 1 220px;
	}

	.sort-label {
		color: var(--qc-ink-700);
	}

	.control {
		min-height: 44px;
		width: 100%;
		padding: 0 var(--qc-space-3);
		background: var(--qc-surface);
		color: var(--qc-ink-950);
		/* Interactive boundary: 3:1, not the 1.31:1 hairline. */
		border: 1px solid var(--qc-border-strong);
		border-radius: var(--qc-cta-radius, 8px);
		font-family: var(--qc-font-ui);
		font-size: 16px;
	}

	.control:focus-visible {
		outline: 3px solid var(--qc-focus);
		outline-offset: 2px;
	}
</style>
