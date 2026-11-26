<script>
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { stage, sceneRef } from './state.svelte.js';
	import { formatDistance } from '#lib/geo/math.js';

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
		if (townsEl && stage.phase === 'over') {
			for (let i = 0; i < frame.towns.length; i++) {
				const f = frame.towns[i], el = townsEl.children[i];
				el.style.transform = `translate(${f.x}px, ${f.y}px)`;
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
	$effect(() => {
		const path = page.url.pathname;
		if (!stage.ready || path === lastPath) return;
		const first = lastPath === null;
		lastPath = path;
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
						onPhase: (p) => (stage.phase = p)
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

<div class="towns" class:on={showPins} bind:this={townsEl} aria-hidden="true">
	{#each ['Варна', 'Бургас', 'мыс Калиакра', 'мыс Эмине'] as t}<span>{t}</span>{/each}
</div>

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
	.towns span {
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
		.ticker {
			display: none;
		}
	}
</style>
