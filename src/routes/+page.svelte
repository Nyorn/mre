<script>
	import FeedbackForm from '$lib/FeedbackForm.svelte';
	import InfoBlock from '$lib/InfoBlock.svelte';
	import WebGLHero from '$lib/WebGLHero.svelte';

	// Photo: first slide of the existing Contentful carousel (real property image, CORS-enabled)
	const heroImage = 'https://images.ctfassets.net/31g2btibassa/5S3oxQ5YnMis48RHU5EDlW/c7a173da23f0e7a283af64c74c883e49/6.jpg';
</script>

<svelte:head>
	<title>Sea Real Estate — элитная недвижимость на первой линии Черного моря</title>
</svelte:head>

<WebGLHero src={heroImage} alt="Вилла на побережье Черного моря">
	<div class="eyebrow rv">Болгария · Черноморское побережье</div>
	<h1><span class="ln"><span>Жизнь <em>у самого</em></span></span><span class="ln"><span>моря.</span></span></h1>
	<p class="sub rv d1">Элитная недвижимость на первой и второй линии. Подбор, сделка и оформление документов — под ключ.</p>
	<div class="cta rv d2">
		<a class="btn primary" href="/objects">Смотреть объекты</a>
		<a class="btn ghost" href="#documents">Оформить документы</a>
	</div>
</WebGLHero>

<InfoBlock />
<FeedbackForm />

<style>
	:global(.hero.in) .ln > span { transform: none; }
	.ln { display: block; text-align: left; overflow: hidden; padding-bottom: 0.06em; }
	.ln > span { display: inline-block; transform: translateY(108%); transition: transform 1.2s cubic-bezier(0.2, 0.8, 0.2, 1); }
	.ln:nth-child(2) > span { transition-delay: 0.12s; }
	.rv { opacity: 0; transform: translateY(16px); transition: opacity 1s ease, transform 1.2s cubic-bezier(0.2, 0.8, 0.2, 1); }
	:global(.hero.in) .rv { opacity: 1; transform: none; }
	:global(.hero.in) .rv.d1 { transition-delay: 0.9s; }
	:global(.hero.in) .rv.d2 { transition-delay: 1.1s; }
	.eyebrow { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 12px; letter-spacing: 0.28em; text-transform: uppercase; color: #d9b36c; }
	h1 { text-align: left; font-family: Georgia, 'Times New Roman', serif; font-size: clamp(44px, 6.2vw, 84px); line-height: 1.02; font-weight: 400; margin: 22px 0 24px; }
	h1 em { color: #d9b36c; font-style: italic; }
	.sub { text-align: left; font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 18px; line-height: 1.55; max-width: 560px; opacity: 0.85; }
	.cta { margin-top: 40px; display: flex; gap: 16px; flex-wrap: wrap; font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 14px; letter-spacing: 0.08em; }
	.btn { padding: 16px 26px; border-radius: 2px; transition: transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1), background-color 0.4s, color 0.4s; }
	.btn:active { transform: scale(0.96); }
	.btn.primary { background: #d9b36c; color: #05101c; font-weight: 700; }
	.btn.ghost { border: 1px solid rgba(243, 234, 215, 0.5); color: #f3ead7; }
	@media (prefers-reduced-motion: reduce) {
		.ln > span, .rv { transform: none !important; opacity: 1 !important; transition: none !important; }
	}
</style>
