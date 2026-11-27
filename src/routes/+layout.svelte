<script>
	import '../app.css';
	import { page } from '$app/state';
	import Stage from '#lib/stage/Stage.svelte';

	let { data, children } = $props();
	let y = $state(0);
	const nav = [
		{ href: '/', label: 'Объекты' },
		{ href: '/kak-kupit', label: 'Как купить' },
		{ href: '/kontakty', label: 'Связаться' }
	];
	const isActive = (href) => (href === '/' ? page.url.pathname === '/' || page.url.pathname.startsWith('/objects') : page.url.pathname.startsWith(href));
</script>

<svelte:head>
	<link rel="canonical" href="https://sea-estate.com{page.url.pathname === '/' ? '' : page.url.pathname}" />
</svelte:head>

<a class="skip-link" href="#main">К содержанию</a>

<svelte:window bind:scrollY={y} />

<Stage properties={data.properties} />

<header class:solid={y > 40 && page.url.pathname !== '/'}>
	<a class="mark" href="/" aria-label="Sea Estate, на главную"><i></i>Sea Estate</a>
	<nav aria-label="Основное">
		<ul>
			{#each nav as item}
				<li>
					<a href={item.href} aria-current={isActive(item.href) ? 'page' : undefined}>
						<span>{item.label}</span><span aria-hidden="true">{item.label}</span>
					</a>
				</li>
			{/each}
		</ul>
	</nav>
</header>

<main id="main">
	{@render children()}
</main>

<style>
	.skip-link {
		position: fixed;
		left: 12px;
		top: -60px;
		z-index: 60;
		background: var(--ink);
		color: var(--ground);
		padding: 8px 12px;
	}
	.skip-link:focus {
		top: 12px;
	}
	header {
		position: fixed;
		inset: 0 0 auto 0;
		z-index: 20;
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		padding: 22px var(--gutter);
		pointer-events: none;
		transition: background-color 0.4s var(--ease);
	}
	header.solid {
		background: rgba(6, 19, 26, 0.82);
		backdrop-filter: blur(10px);
		border-bottom: 1px solid var(--line);
		padding-block: 16px;
	}
	header > * {
		pointer-events: auto;
	}
	.mark {
		font-weight: 600;
		letter-spacing: -0.01em;
		font-size: 17px;
		text-decoration: none;
		display: flex;
		gap: 10px;
		align-items: center;
	}
	.mark i {
		width: 22px;
		height: 1.5px;
		background: var(--accent);
		box-shadow: 0 0 10px var(--accent);
	}
	ul {
		list-style: none;
		display: flex;
		gap: 26px;
		font-size: 14px;
	}
	nav a {
		text-decoration: none;
		position: relative;
		display: inline-block;
		overflow: hidden;
		vertical-align: top;
	}
	nav a span {
		display: block;
		transition: translate 0.45s var(--ease);
	}
	nav a span + span {
		position: absolute;
		inset: 0;
		translate: 0 100%;
		color: var(--accent);
	}
	nav a:hover span:first-child {
		translate: 0 -100%;
	}
	nav a:hover span + span {
		translate: 0 0;
	}
	nav a[aria-current='page']::after {
		content: '';
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		height: 1px;
		background: var(--accent);
	}
	main {
		position: relative;
		z-index: 5;
	}
	@media (max-width: 760px) {
		ul {
			gap: 16px;
			font-size: 13px;
		}
		nav li:first-child {
			display: none;
		}
	}
</style>
