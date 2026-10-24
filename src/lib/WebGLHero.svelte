<script>
	import { onMount } from 'svelte';
	import { mountHeroWebGL } from './hero-webgl.js';

	export let src;
	export let alt = '';

	let root;

	onMount(() => {
		requestAnimationFrame(() => root.classList.add('in'));
		const gl = mountHeroWebGL(root);
		return () => gl && gl.destroy();
	});
</script>

<section class="hero" bind:this={root} data-src={src}>
	<img class="hero-poster" {src} {alt} />
	<canvas class="hero-gl" aria-hidden="true"></canvas>
	<div class="hero-content">
		<slot />
	</div>
</section>

<style>
	.hero { position: relative; min-height: 88vh; min-height: 88svh; overflow: hidden; background: #05101c; color: #f3ead7; isolation: isolate; }
	.hero-poster, .hero-gl { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; z-index: -2; }
	.hero-gl { opacity: 0; transition: opacity 1.2s ease; }
	.hero.is-gl .hero-gl { opacity: 1; }
	.hero.is-gl .hero-poster { opacity: 0; }
	.hero-poster { transition: opacity 0.6s ease; }
	.hero::after { content: ""; position: absolute; inset: 0; z-index: -1; pointer-events: none; background: linear-gradient(90deg, rgba(5,16,28,.85) 0%, rgba(5,16,28,.4) 55%, rgba(5,16,28,.08) 100%); }
	.hero-content { position: absolute; left: 56px; top: 16%; max-width: 720px; }
	@media (max-width: 760px) { .hero-content { left: 24px; right: 24px; top: 14%; } }
	@media (prefers-reduced-motion: reduce) { .hero-gl { display: none; } }
</style>
