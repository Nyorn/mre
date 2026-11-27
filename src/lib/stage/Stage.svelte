<script>
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { stage, sceneRef } from './state.svelte.js';
	import { formatDistance, metersBetween } from '#lib/geo/math.js';
	import { PLACES, AIRPORTS } from '#lib/geo/places.js';

	const placeInfo = PLACES.map((pl) => {
		const ap = AIRPORTS.map((a) => ({ a, m: metersBetween([pl.lat, pl.lon], [a.lat, a.lon]) })).sort((x, y) => x.m - y.m)[0];
		return { ...pl, airport: `${Math.max(1, Math.round(ap.m / 1000))} км до аэропорта ${ap.a.name}` };
	});
	let hover = $state(-1);
	let cardEl = $state();
	let compassEl = $state();

	let { properties } = $props();

	let canvas;
	let pinsEl;
	let tapeEl;
	let horizonEl;
	let coordsEl;
	let townsEl;
	let clock = $state('');
	let tapeValue = $state('');
	let horizonDrawn = $state(false);

	const showPins = $derived(stage.phase === 'over' && page.url.pathname === '/');
	const pinPlaces = new Set(properties.map((p) => p.place));
	const showSkip = $derived(stage.phase === 'intro' || stage.phase === 'turn');
	const slugFromPath = (p) => (p.startsWith('/objects/') ? p.slice(9).replace(/[/]$/, '') : null);

	function layoutPins(frame) {
		if (!pinsEl) return;
		const els = pinsEl.children;
		const order = frame.pins.map((p, i) => i).filter((i) => frame.pins[i].vis).sort((a, b) => frame.pins[b].y - frame.pins[a].y);
		const placed = (lastPlaced = []);
		for (let i = 0; i < els.length; i++) els[i].style.visibility = 'hidden';
		for (const i of order) {
			const f = frame.pins[i], el = els[i];
			const w = el.__w || (el.__w = el.querySelector('.label').offsetWidth + 2);
			const h = 30;
			let lift = 0;
			const hit = (top) => placed.some((r) => !(f.x + w / 2 < r.l || f.x - w / 2 > r.r || top + h < r.t || top > r.b));
			while (hit(f.y - h - lift) && lift < 400) lift += h + 4;
			const top = f.y - h - lift;
			placed.push({ l: f.x - w / 2 - 6, r: f.x + w / 2 + 6, t: top - 2, b: top + h + 2 });
			el.style.transform = `translate(${f.x}px, ${f.y}px)`;
			el.style.setProperty('--lift', `${lift}px`);
			el.style.visibility = 'visible';
		}
	}

	let lastPlaced = [];
	let n = 0;
	function onFrame(frame) {
		if (showPins) layoutPins(frame);
		if (compassEl) compassEl.style.setProperty('--az', `${180 - (frame.view.az * 180) / Math.PI}deg`);
		if (cardEl && hover >= 0) {
			const f = frame.towns[hover];
			cardEl.style.transform = `translate(${Math.min(f.x + 14, innerWidth - 300)}px, ${f.y + 14}px)`;
		}
		if (townsEl && stage.phase === 'over') {
			const placed = [];
			for (let i = 0; i < frame.towns.length; i++) {
				const f = frame.towns[i], el = townsEl.children[i];
				el.style.transform = `translate(${f.x}px, ${f.y}px)`;
				const range = f.tier === 1 ? 1e9 : f.tier === 2 ? 150 : 200;
				const pinned = pinPlaces.has(f.name);
				const w2 = (el.__w || (el.__w = el.offsetWidth)) / 2 + 6;
				const overlap = placed.some((r) => Math.abs(r.x - f.x) < r.w + w2 && Math.abs(r.y - f.y) < 16);
				if (f.vis && f.d < range && !pinned && !overlap) placed.push({ x: f.x, y: f.y, w: w2 });
				else {
					el.style.visibility = 'hidden';
					continue;
				}
				const hw = el.offsetWidth / 2 + 8;
				const clash = showPins && lastPlaced.some((r) => !(f.x + hw < r.l || f.x - hw > r.r || f.y + 10 < r.t || f.y - 10 > r.b + 8));
				el.style.visibility = f.vis && !clash ? 'visible' : 'hidden';
			}
		}
		if (tapeEl) {
			tapeEl.style.transform = `translate(${frame.tape.x}px, ${frame.tape.y}px)`;
			tapeEl.style.opacity = frame.tape.vis ? '1' : '0';
		}
		if (horizonEl) horizonEl.style.top = `${frame.horizonY}px`;
		if (coordsEl && n++ % 6 === 0) {
			const [la, lo] = frame.latlon;
			coordsEl.textContent = `${la.toFixed(2)}° N · ${lo.toFixed(2)}° E`;
		}
	}

	function countTape(meters) {
		const t0 = performance.now(), dur = 1100;
		const step = (t) => {
			const k = Math.min(1, (t - t0) / dur), e = 1 - (1 - k) ** 3;
			tapeValue = formatDistance(Math.max(10, meters * e));
			if (k < 1) requestAnimationFrame(step);
		};
		requestAnimationFrame(step);
	}

	async function routeChanged(path, first) {
		const api = sceneRef.api;
		if (!api) return;
		const slug = slugFromPath(path);
		if (slug) {
			if (first) await api.intro({ skip: true });
			await api.focus(slug);
			const p = properties.find((x) => x.slug === slug);
			if (p && api.phase() === 'object') countTape(p.sea.meters);
		} else if (path === '/' && first) {
			const seen = sessionStorage.getItem('se-intro') === '1';
			sessionStorage.setItem('se-intro', '1');
			if (!seen) requestAnimationFrame(() => (horizonDrawn = true));
			await api.intro({ skip: seen });
		} else if (first) {
			await api.intro({ skip: true });
		} else {
			await api.overview();
		}
	}

	function hasWebGL() {
		try {
			const c = document.createElement('canvas');
			return !!(c.getContext('webgl2') || c.getContext('webgl'));
		} catch {
			return false;
		}
	}

	let lastPath = null;
	const matchMediaCoarse = typeof matchMedia !== 'undefined' && matchMedia('(pointer: coarse)').matches;
	$effect(() => {
		const path = page.url.pathname;
		if (!stage.ready || path === lastPath) return;
		const first = lastPath === null;
		lastPath = path;
		sceneRef.api?.setControls(path === '/');
		stage.explore = false;
		routeChanged(path, first);
	});

	onMount(() => {
		const fmt = new Intl.DateTimeFormat('ru-RU', { timeZone: 'Europe/Sofia', hour: '2-digit', minute: '2-digit' });
		const tickClock = () => (clock = fmt.format(new Date()));
		tickClock();
		const ci = setInterval(tickClock, 15000);

		const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
		const mobile = matchMedia('(max-width: 760px), (pointer: coarse)').matches;
		let disposed = false;
		const onMove = (e) => sceneRef.api?.setPointer(e.clientX / innerWidth - 0.5, e.clientY / innerHeight - 0.5);

		if (!hasWebGL()) {
			stage.webgl = false;
			stage.phase = 'over';
			stage.ready = true;
		} else {
			import('./coast-scene.js')
				.then(({ createCoastScene }) =>
					createCoastScene({
						canvas,
						properties,
						reduce,
						mobile,
						onFrame,
						onPhase: (p) => (stage.phase = p),
						onInteract: () => (stage.explore = true)
					})
				)
				.then((api) => {
					if (disposed) return api.destroy();
					sceneRef.api = api;
					if (import.meta.env.DEV) window.__se = { api, stage };
					canvas.addEventListener('webglcontextlost', () => {
						stage.webgl = false;
						stage.phase = 'over';
					});
					stage.ready = true;
				})
				.catch((err) => {
					console.error('[stage]', err);
					stage.webgl = false;
					stage.phase = 'over';
					stage.ready = true;
				});
		}
		addEventListener('pointermove', onMove);
		const onKey = (e) => {
			if (e.key === 'Escape' && showSkip) sceneRef.api?.skipIntro();
		};
		addEventListener('keydown', onKey);
		return () => {
			disposed = true;
			clearInterval(ci);
			removeEventListener('pointermove', onMove);
			removeEventListener('keydown', onKey);
			sceneRef.api?.destroy();
			sceneRef.api = null;
		};
	});

	const current = $derived(properties.find((x) => x.slug === slugFromPath(page.url.pathname)));
</script>

<div class="stage" class:fallback={!stage.webgl} aria-hidden="true">
	<canvas bind:this={canvas}></canvas>
	<div class="dim" style:opacity={stage.dim}></div>
</div>

<div class="curtain" class:off={stage.ready} aria-hidden="true"></div>

<div
	class="horizon"
	class:drawn={horizonDrawn}
	class:gone={stage.phase !== 'intro'}
	bind:this={horizonEl}
	aria-hidden="true"
></div>

<div class="towns" class:on={showPins} bind:this={townsEl}>
	{#each placeInfo as t, i}<button
			class="t{t.tier}"
			tabindex={showPins ? 0 : -1}
			onpointerenter={() => (hover = i)}
			onpointerleave={() => (hover = -1)}
			onfocus={() => (hover = i)}
			onblur={() => (hover = -1)}
			onclick={() => sceneRef.api?.flyToPlace(t.lat, t.lon)}>{t.name}</button
		>{/each}
</div>

{#if showPins && hover >= 0}
	{@const t = placeInfo[hover]}
	<aside class="card" bind:this={cardEl} aria-live="polite">
		<small>{t.kind}</small>
		<h3>{t.name}</h3>
		<p>{t.about}</p>
		<small class="ap">✈ {t.airport}</small>
	</aside>
{/if}

<nav class="pins" class:on={showPins} bind:this={pinsEl} aria-label="Объекты на карте">
	{#each properties as p (p.slug)}
		<a class="pin" href="/objects/{p.slug}" tabindex={showPins ? 0 : -1}>
			<span class="stem"></span>
			<span class="label">{p.place}</span>
		</a>
	{/each}
</nav>

<div class="tape" class:on={stage.phase === 'object' && current} bind:this={tapeEl} aria-hidden="true">
	<b>{tapeValue}</b> до моря
</div>

<p class="ticker" class:off={page.url.pathname !== '/'} aria-hidden="true">
	<span bind:this={coordsEl}>43.20° N · 27.91° E</span> · Варна {clock}
</p>

{#if showPins && stage.webgl}
	<div class="mapctl">
		{#if stage.explore}
			<button onclick={() => { stage.explore = false; sceneRef.api?.resetView(); }}>Вернуть общий вид</button>
		{:else}
			<span>Тяните карту · колесо — ближе · компас справа — ракурс</span>
		{/if}
	</div>
	<div class="compass" aria-label="Ракурс">
		<button aria-label="Наклонить выше" onclick={() => sceneRef.api?.orbit(0, -0.18)}>▲</button>
		<div class="row">
			<button aria-label="Повернуть влево" onclick={() => sceneRef.api?.orbit(-0.4, 0)}>⟲</button>
			<div
				class="dial"
				bind:this={compassEl}
				role="slider"
				tabindex="0"
				aria-valuenow="0"
				aria-label="Перетащите, чтобы вращать и наклонять"
				onpointerdown={(e) => {
					e.currentTarget.setPointerCapture(e.pointerId);
					let lx = e.clientX, ly = e.clientY;
					const mv = (ev) => {
						sceneRef.api?.orbit((ev.clientX - lx) * 0.012, (ly - ev.clientY) * -0.008);
						lx = ev.clientX;
						ly = ev.clientY;
					};
					const up = () => {
						e.currentTarget?.removeEventListener('pointermove', mv);
						removeEventListener('pointerup', up);
					};
					e.currentTarget.addEventListener('pointermove', mv);
					addEventListener('pointerup', up);
				}}
				ondblclick={() => { stage.explore = false; sceneRef.api?.resetView(); }}
			>
				<span class="n">С</span>
			</div>
			<button aria-label="Повернуть вправо" onclick={() => sceneRef.api?.orbit(0.4, 0)}>⟳</button>
		</div>
		<button aria-label="Наклонить ниже" onclick={() => sceneRef.api?.orbit(0, 0.18)}>▼</button>
	</div>
{/if}

{#if showSkip}
	<button class="skip" onclick={() => sceneRef.api?.skipIntro()}>Пропустить</button>
{/if}

<style>
	.stage {
		position: fixed;
		inset: 0;
		z-index: 0;
		background: radial-gradient(120% 80% at 80% 30%, #3a2b2b 0%, #0d1d24 45%, var(--ground) 100%);
	}
	canvas {
		width: 100%;
		height: 100%;
		display: block;
	}
	.fallback canvas {
		display: none;
	}
	.stage::after,
	.stage::before {
		content: '';
		position: absolute;
		inset: 0;
		z-index: 1;
		pointer-events: none;
	}
	.stage::after {
		background: radial-gradient(130% 100% at 50% 42%, transparent 50%, rgba(2, 6, 9, 0.6) 100%);
	}
	.stage::before {
		z-index: 2;
		opacity: 0.07;
		background: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>");
	}
	.towns {
		position: fixed;
		inset: 0;
		z-index: 3;
		pointer-events: none;
		opacity: 0;
		transition: opacity 0.8s var(--ease);
	}
	.towns.on {
		opacity: 1;
	}
	.mapctl {
		position: fixed;
		left: 50%;
		bottom: 20px;
		translate: -50% 0;
		z-index: 6;
		font-size: 12px;
		color: var(--muted);
		white-space: nowrap;
	}
	.mapctl button {
		color: var(--ink);
		border: 1px solid var(--line);
		background: rgba(3, 9, 13, 0.55);
		backdrop-filter: blur(6px);
		padding: 7px 12px;
		border-radius: 2px;
		font-size: 13px;
	}
	.mapctl button:hover {
		border-color: var(--accent);
	}
	.compass {
		position: fixed;
		right: var(--gutter);
		top: 96px;
		z-index: 6;
		display: grid;
		justify-items: center;
		gap: 4px;
		user-select: none;
	}
	.compass .row {
		display: flex;
		align-items: center;
		gap: 4px;
	}
	.compass button {
		width: 28px;
		height: 28px;
		color: var(--ink);
		background: rgba(3, 9, 13, 0.5);
		border: 1px solid var(--line);
		border-radius: 50%;
		font-size: 12px;
		backdrop-filter: blur(6px);
	}
	.compass button:hover {
		border-color: var(--accent);
	}
	.dial {
		width: 58px;
		height: 58px;
		border-radius: 50%;
		border: 1px solid var(--line);
		background:
			repeating-conic-gradient(from 0deg, rgba(236, 239, 232, 0.35) 0 1deg, transparent 1deg 30deg),
			radial-gradient(circle, rgba(3, 9, 13, 0.35) 55%, rgba(3, 9, 13, 0.6));
		backdrop-filter: blur(6px);
		cursor: grab;
		position: relative;
		rotate: var(--az, 0deg);
		touch-action: none;
	}
	.dial .n {
		position: absolute;
		left: 50%;
		top: 3px;
		translate: -50% 0;
		font-size: 10px;
		font-weight: 600;
		color: var(--accent);
	}
	.card {
		position: fixed;
		left: 0;
		top: 0;
		z-index: 7;
		width: 280px;
		padding: 14px 16px;
		background: rgba(6, 13, 18, 0.82);
		border: 1px solid var(--line);
		border-left: 2px solid var(--accent);
		backdrop-filter: blur(10px);
		pointer-events: none;
		animation: cardIn 0.25s var(--ease);
	}
	@keyframes cardIn {
		from {
			opacity: 0;
			translate: 0 6px;
		}
	}
	.card small {
		font-size: 10.5px;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--muted);
	}
	.card h3 {
		margin: 4px 0 6px;
		font-size: 20px;
		font-weight: 400;
		color: var(--ink);
	}
	.card p {
		margin: 0 0 10px;
		font-size: 13.5px;
		line-height: 1.45;
		color: rgba(236, 239, 232, 0.82);
	}
	.card .ap {
		letter-spacing: 0.04em;
		text-transform: none;
		color: var(--accent);
	}
	.towns button:hover,
	.towns button:focus-visible {
		color: var(--accent);
		outline: none;
	}
	.towns .t1 {
		font-size: 12.5px;
		letter-spacing: 0.24em;
		color: rgba(236, 239, 232, 0.8);
		font-weight: 500;
	}
	.towns .t3 {
		text-transform: none;
		letter-spacing: 0.04em;
		font-style: italic;
		font-size: 12px;
	}
	.towns button {
		pointer-events: auto;
		cursor: pointer;
		background: none;
		border: 0;
		padding: 4px 6px;
		font-family: inherit;
		position: absolute;
		left: 0;
		top: 0;
		translate: -50% -50%;
		font-size: 10.5px;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: rgba(236, 239, 232, 0.55);
		text-shadow: 0 1px 8px rgba(0, 0, 0, 0.9);
		white-space: nowrap;
		visibility: hidden;
	}
	.dim {
		position: absolute;
		inset: 0;
		background: var(--ground);
		pointer-events: none;
		transition: opacity 0.9s var(--ease);
	}
	.curtain {
		position: fixed;
		inset: 0;
		z-index: 40;
		background: #03090d;
		transition: opacity 1.4s var(--ease);
		pointer-events: none;
	}
	.curtain.off {
		opacity: 0;
	}
	.horizon {
		position: fixed;
		left: 0;
		right: 0;
		height: 1px;
		z-index: 2;
		background: linear-gradient(90deg, transparent, var(--accent) 20%, #fff2dc 55%, var(--accent) 85%, transparent);
		box-shadow: 0 0 14px var(--accent);
		transform: scaleX(0);
		transform-origin: left;
		opacity: 0.85;
		pointer-events: none;
		transition:
			transform 1.8s var(--ease) 0.5s,
			opacity 1.2s var(--ease);
	}
	.horizon.drawn {
		transform: scaleX(1);
	}
	.horizon.gone {
		opacity: 0;
	}
	.pins {
		position: fixed;
		inset: 0;
		z-index: 4;
		pointer-events: none;
		opacity: 0;
		transition: opacity 0.6s var(--ease);
	}
	.pins.on {
		opacity: 1;
	}
	.pins.on .pin {
		pointer-events: auto;
	}
	.pin {
		position: absolute;
		left: 0;
		top: 0;
		visibility: hidden;
		text-decoration: none;
		--lift: 0px;
	}
	.stem {
		position: absolute;
		left: 0;
		bottom: 0;
		width: 1px;
		height: calc(8px + var(--lift));
		background: linear-gradient(to top, var(--accent), rgba(255, 199, 122, 0.25));
	}
	.label {
		position: absolute;
		left: 0;
		bottom: calc(8px + var(--lift));
		translate: -50% 0;
		font-size: 13px;
		white-space: nowrap;
		padding: 6px 10px 6px 20px;
		background: rgba(3, 9, 13, 0.55);
		backdrop-filter: blur(6px);
		border: 1px solid var(--line);
		border-radius: 2px;
		transition: border-color 0.3s;
	}
	.label::before {
		content: '';
		position: absolute;
		left: 9px;
		top: 50%;
		width: 5px;
		height: 5px;
		margin-top: -2.5px;
		border-radius: 50%;
		background: var(--accent);
		box-shadow: 0 0 8px var(--accent);
	}
	.pin:hover .label,
	.pin:focus-visible .label {
		border-color: var(--accent);
	}
	.tape {
		position: fixed;
		left: 0;
		top: 0;
		z-index: 3;
		translate: -50% -50%;
		font-size: 13px;
		font-variant-numeric: tabular-nums;
		color: var(--accent);
		white-space: nowrap;
		text-shadow: 0 0 12px rgba(0, 0, 0, 0.85);
		pointer-events: none;
		visibility: hidden;
	}
	.tape.on {
		visibility: visible;
	}
	.tape b {
		font-size: 22px;
		font-weight: 500;
		letter-spacing: -0.02em;
	}
	.ticker {
		position: fixed;
		left: var(--gutter);
		bottom: 20px;
		z-index: 3;
		font-size: 12px;
		color: var(--muted);
		font-variant-numeric: tabular-nums;
		pointer-events: none;
	}
	.skip {
		position: fixed;
		right: var(--gutter);
		bottom: 20px;
		z-index: 41;
		font-size: 13px;
		color: var(--muted);
		border-bottom: 1px solid var(--line);
		padding: 4px 0;
	}
	.skip:hover {
		color: var(--ink);
		border-color: var(--ink);
	}
	.ticker.off {
		display: none;
	}
	@media (max-width: 760px) {
		.mapctl {
			left: auto;
			right: var(--gutter);
			translate: none;
			bottom: auto;
			top: 64px;
		}
		.mapctl span {
			display: none;
		}
		.compass {
			display: none;
		}
		.ticker {
			display: none;
		}
	}
</style>
