<script>
	/*
	 * Home header for the Quiet Coast shell.
	 *
	 * Deliberately not the shared Nav: that one is a Flowbite/Tailwind bar with
	 * dark-theme classes, a dropdown built on a window click listener and an
	 * href="#" entry. Home owns its own header so the page can be a single
	 * coherent surface; every other route keeps the shared Nav untouched.
	 *
	 * No hamburger: three links plus a phone number wrap onto a second row below
	 * 600px, which removes a disclosure widget — and its focus management — from
	 * the critical path entirely. Every target is at least 44px tall.
	 *
	 * Links point at routes that exist in this build (/objects, /about,
	 * /contacts). The phone number is the one already published in the shared
	 * Footer, so it is not a new claim.
	 */
	const links = [
		{ href: '/objects', label: 'Каталог' },
		{ href: '/about', label: 'О компании' },
		{ href: '/contacts', label: 'Контакты' }
	];
</script>

<header class="qc-header">
	<div class="qc-container header-inner">
		<a class="brand" href="/">
			<span class="brand-name">Sea Estate</span>
			<span class="qc-caption brand-sub">Побережье Болгарии</span>
		</a>

		<nav aria-label="Основная навигация">
			<ul class="nav-list">
				{#each links as link}
					<li><a class="nav-link" href={link.href}>{link.label}</a></li>
				{/each}
			</ul>
		</nav>

		<a class="nav-link phone" href="tel:+359877580966">+359 877-580-966</a>
	</div>
</header>

<style>
	.qc-header {
		background: var(--qc-surface);
		border-bottom: 1px solid var(--qc-border);
		padding: var(--qc-space-3) var(--qc-gutter);
	}

	.header-inner {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--qc-space-3) var(--qc-space-5);
	}

	.brand {
		display: flex;
		flex-direction: column;
		gap: 2px;
		text-decoration: none;
		padding: var(--qc-space-2) 0;
		margin-right: auto;
	}

	.brand-name {
		font-family: var(--qc-font-display);
		font-size: 22px;
		line-height: 26px;
		font-weight: 600;
		letter-spacing: -0.01em;
		color: var(--qc-ink-950);
	}

	.brand-sub {
		letter-spacing: 0.06em;
		text-transform: uppercase;
		font-size: 11px;
	}

	.nav-list {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--qc-space-1) var(--qc-space-5);
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.nav-link {
		display: inline-flex;
		align-items: center;
		min-height: 44px;
		padding: 0 var(--qc-space-1);
		font-family: var(--qc-font-ui);
		font-size: 16px;
		font-weight: 500;
		color: var(--qc-ink-700);
		text-decoration: none;
	}

	.nav-link:hover {
		color: var(--qc-sea-800);
		text-decoration: underline;
		text-underline-offset: 3px;
	}

	.phone {
		font-weight: 600;
		color: var(--qc-sea-700);
		white-space: nowrap;
	}

	.brand:focus-visible,
	.nav-link:focus-visible {
		outline: 3px solid var(--qc-focus);
		outline-offset: 2px;
		border-radius: 4px;
	}

	/* Below this the brand keeps the first row and the links take the second. */
	@media (max-width: 599px) {
		.brand {
			flex: 1 0 100%;
			margin-right: 0;
		}
	}
</style>
