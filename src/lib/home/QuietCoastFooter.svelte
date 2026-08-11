<script>
	/*
	 * Home footer for the Quiet Coast shell.
	 *
	 * Not the shared Footer: that one is a dark Tailwind block carrying two
	 * href="#" placeholders. A link that goes nowhere is worse than an absent
	 * link, so the privacy/terms row is replaced by one honest line stating the
	 * documents are not published yet. That is a release blocker recorded in
	 * resend-lead-delivery.v1, not something to paper over in markup.
	 *
	 * Every link here resolves to a route or contact that exists in this build.
	 */
	const year = 2026;
</script>

<footer class="qc-footer">
	<div class="qc-container footer-inner">
		<div class="footer-col">
			<p class="brand-name">Sea Estate</p>
			<p class="qc-caption brand-sub">
				Подбор и сопровождение недвижимости на болгарском побережье.
			</p>
		</div>

		<nav class="footer-col" aria-label="Разделы сайта">
			<h2 class="qc-label col-title">Разделы</h2>
			<ul class="footer-list">
				<li><a class="footer-link" href="/objects">Каталог</a></li>
				<li><a class="footer-link" href="/about">О компании</a></li>
				<li><a class="footer-link" href="/contacts">Контакты</a></li>
			</ul>
		</nav>

		<div class="footer-col">
			<h2 class="qc-label col-title">Контакты</h2>
			<ul class="footer-list">
				<li><a class="footer-link" href="tel:+359895340006">+359 895-340-006</a></li>
				<li><a class="footer-link" href="tel:+359877580966">+359 877-580-966</a></li>
				<li><a class="footer-link" href="mailto:sales@sea-estate.com">sales@sea-estate.com</a></li>
			</ul>
		</div>
	</div>

	<div class="qc-container footer-bottom">
		<p class="qc-caption legal">
			Политика конфиденциальности и условия использования ещё не опубликованы. До их
			публикации мы не размещаем ссылку-заглушку.
		</p>
		<p class="qc-caption legal">© {year} Sea Estate</p>
	</div>
</footer>

<style>
	.qc-footer {
		background: var(--qc-surface);
		border-top: 1px solid var(--qc-border);
		padding: var(--qc-space-7) var(--qc-gutter) var(--qc-space-6);
	}

	.footer-inner {
		display: grid;
		gap: var(--qc-space-6);
		grid-template-columns: 1fr;
	}

	.footer-col {
		min-width: 0;
	}

	.brand-name {
		margin: 0;
		font-family: var(--qc-font-display);
		font-size: 20px;
		line-height: 24px;
		font-weight: 600;
		color: var(--qc-ink-950);
	}

	.brand-sub {
		margin: var(--qc-space-2) 0 0;
		max-width: 42ch;
	}

	.col-title {
		margin: 0;
	}

	.footer-list {
		list-style: none;
		margin: var(--qc-space-2) 0 0;
		padding: 0;
	}

	.footer-link {
		display: inline-flex;
		align-items: center;
		min-height: 44px;
		font-family: var(--qc-font-ui);
		font-size: 16px;
		color: var(--qc-ink-700);
		text-decoration: none;
		word-break: break-word;
	}

	.footer-link:hover {
		color: var(--qc-sea-800);
		text-decoration: underline;
		text-underline-offset: 3px;
	}

	.footer-link:focus-visible {
		outline: 3px solid var(--qc-focus);
		outline-offset: 2px;
		border-radius: 4px;
	}

	.footer-bottom {
		margin-top: var(--qc-space-6);
		padding-top: var(--qc-space-4);
		border-top: 1px solid var(--qc-border);
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		gap: var(--qc-space-3);
	}

	.legal {
		margin: 0;
		max-width: 72ch;
	}

	@media (min-width: 768px) {
		.footer-inner {
			grid-template-columns: minmax(0, 2fr) minmax(0, 1fr) minmax(0, 1fr);
			gap: var(--qc-space-7);
		}
	}
</style>
