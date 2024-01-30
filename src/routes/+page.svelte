<script>

	import Preloader from '$lib/Preloader.svelte';
	import FeedbackForm from '$lib/FeedbackForm.svelte';
	import InfoBlock from '$lib/InfoBlock.svelte';
	import { onMount } from 'svelte';
	import '@splidejs/svelte-splide/css/splide.min.css';
	import '@splidejs/splide/css';
	import { loading } from '$lib/store.js';
	import { getContext, setContext } from 'svelte';

	let alwaysShowPreloader = true; // Новая переменная состояния для контроля прелоадера

	let contentVisible = false;
	let splide;
	let currentSlide = 0;


	const overlaysContent = [
		{
			title: 'Погружение в райскую природу:',
			paragraph: 'Инвестируйте в свой уголок среди изумрудных гор и бескрайних пляжей Черного моря.',
			button: 'Подробнее',
			link: 'https://sea-estate.com/objects'
		},
		{
			title: 'Разнообразие недвижимости:',
			paragraph: 'От стильных апартаментов до вилл с потрясающим видом на море - мы предлагаем разнообразие вариантов, чтобы воплотить ваши мечты в реальность.',
			button: 'Подробнее',
			link: 'https://sea-estate.com/objects'
		},
		{
			title: 'Инвестиции с умом: ',
			paragraph: 'Наша команда экспертов поможет вам сделать выгодные инвестиции в болгарскую недвижимость, обеспечивая стабильный доход и рост капитала.',
			button: 'Подробнее',
			link: 'https://sea-estate.com/objects'
		},
		{
			title: 'Простой процесс сделки: ',
			paragraph: 'Мы делаем покупку недвижимости в Болгарии легкой и прозрачной. Надежное сопровождение сделки от начала до конца.',
			button: 'Подробнее',
			link: 'https://sea-estate.com/objects'
		},
		{
			title: 'Обретите свой уголок под солнцем с нами.',
			paragraph: 'Выберите Болгарию для вашего нового дома или инвестиций! ',
			button: 'Подробнее',
			link: 'https://sea-estate.com/objects'
		}
	];
	const images = [
		'https://images.ctfassets.net/31g2btibassa/5S3oxQ5YnMis48RHU5EDlW/c7a173da23f0e7a283af64c74c883e49/6.jpg',
		'https://images.ctfassets.net/31g2btibassa/3IR96Tct5EEWK2kvkr0zMR/6a4cc78c2a240fe39aa58c8291dc424b/5.jpg',
		'https://images.ctfassets.net/31g2btibassa/7rKPPYiTx6mu5o4EzpKOKB/130193a6f8580c8d9df2a9fac5ee66e9/7.jpg',
		'https://images.ctfassets.net/31g2btibassa/2PdBBJGQCso03iFHKP5F1a/0906cf5525eef4c8b8517393836aac88/8.jpg',
		'https://images.ctfassets.net/31g2btibassa/3RYCIJ4Yta5z88joncN01a/f1297e242ddde87e95f8b2109cfea084/9.jpg',

	];

	function preloadImages() {
		return Promise.all(
			images.map((src) => {
				return new Promise((resolve, reject) => {
					const img = new Image();
					img.src = src;
					img.onload = resolve;
					img.onerror = reject;
				});
			})
		);
	}

	// Инициализируем слайдер после монтирования компонента
	onMount(async () => {
		loading.set(true); // Явно устанавливаем состояние загрузки
		document.body.style.overflow = 'hidden';
		try {
			await preloadImages();
		} catch (error) {
			console.error('Ошибка при загрузке изображений:', error);
		}
		setTimeout(() => {
			loading.set(false); // Скрываем прелоадер после 2 секунд
			document.body.style.overflow = '';
		}, 1500);

		// Function to handle hiding of preloader and showing content


		// Initialize the Splide carousel
		setTimeout(() => {
			if (SplideShaderCarousel && SplideShaderCarousel.shaders && SplideShaderCarousel.shaders.dissolveShader) {
				const { dissolveShader } = SplideShaderCarousel.shaders;
				splide = new SplideShaderCarousel('.splide', dissolveShader, {
					gradient: 'vertical',
					type: 'fade',
					height: '90vh',
					rewind: true,
					continuous: true,
					autoplay: true,
					pauseOnHover: false,
					arrows: false,
					speed: 1750,
					mask: '/wave01.jpg'
				});
				splide.on('move', (newIndex) => {
					currentSlide = newIndex;
				});
				splide.mount();
			} else {
				console.error('SplideShaderCarousel or dissolveShader is not available');
			}
		}, 1000);

		// Cleanup function
		return () => {
			document.body.style.overflow = '';
			window.removeEventListener('load', handleContentLoaded);
		};
	});


</script>
<svelte:head>


	<title>Sea Real Estate: Элитная Недвижимость на Первой Линии Моря в Болгарии</title>

	<meta name="description"
				content="Sea Real Estate предлагает эксклюзивную недвижимость в туристических зонах Болгарии. Лучшие предложения на первой и второй линии от моря. Узнайте больше!" />


	<script src="/splide-shader-carousel.min.js" defer></script>
</svelte:head>


<section class="splide" aria-label="Splide Shader Carousel Example" class:loaded={!loading}>
	<div class="splide__track">
		<ul class="splide__list">
			<li class="splide__slide"><img
				src="https://images.ctfassets.net/31g2btibassa/5S3oxQ5YnMis48RHU5EDlW/c7a173da23f0e7a283af64c74c883e49/6.jpg"
				alt="Image 1" class="w-full" /></li>
			<li class="splide__slide"><img
				src="https://images.ctfassets.net/31g2btibassa/3IR96Tct5EEWK2kvkr0zMR/6a4cc78c2a240fe39aa58c8291dc424b/5.jpg"
				alt="Image 2" class="w-full" /></li>
			<li class="splide__slide"><img
				src="https://images.ctfassets.net/31g2btibassa/7rKPPYiTx6mu5o4EzpKOKB/130193a6f8580c8d9df2a9fac5ee66e9/7.jpg"
				alt="Image 3" class="w-full" /></li>
			<li class="splide__slide"><img
				src="https://images.ctfassets.net/31g2btibassa/2PdBBJGQCso03iFHKP5F1a/0906cf5525eef4c8b8517393836aac88/8.jpg"
				alt="Image 4" class="w-full" /></li>
			<li class="splide__slide"><img
				src="https://images.ctfassets.net/31g2btibassa/3RYCIJ4Yta5z88joncN01a/f1297e242ddde87e95f8b2109cfea084/9.jpg"
				alt="Image 5" class="w-full" /></li>
		</ul>
	</div>
	<div class="overlay"
			 style={`left: ${currentSlide * (100 / (overlaysContent.length - 1))}%; transform: translateX(-${currentSlide === 0 ? 0 : currentSlide === overlaysContent.length - 1 ? 500 : 250}px);`}>
		<h2>{overlaysContent[currentSlide].title}</h2>
		<div class="divider"></div>
		<p>{overlaysContent[currentSlide].paragraph}</p>
		<a href="{overlaysContent[currentSlide].link}" class="learn-more">
			{overlaysContent[currentSlide].button}
			<span class="arrow-right"></span>
		</a>


	</div>
	<div class="progress-bar" />
</section>

<InfoBlock />
<FeedbackForm />


<style>

	.progress-bar {
		display: none;
		position: absolute;
		top: 50%;
		left: 0;
		width: 100%;
		height: 4px;
		background-color: white;
		z-index: 10;
	}

	.divider {
		height: 4px; /* Невидимый элемент, служащий якорем для выравнивания */
		width: 100%;
		background-color: white;
	}

	.overlay {
		backdrop-filter: blur(10px);
		border-radius: 15px;
		position: absolute;
		bottom: 50%;
		background-color: rgba(0, 0, 0, 0.5);
		padding: 20px;
		max-width: 500px;
		width: 500px;
		margin: auto;
		text-align: center;
		transition: left 1s ease;
		transform: translateX(-50%);
		min-height: 200px;
		max-height: 90vh; /* 90% of the viewport height */
	}

	.overlay h2 {
		font-size: 32px;
		line-height: 1.1;
		margin-bottom: 20px;
		margin-top: 0;
		min-height: 40px;
	}

	.overlay p {
		font-size: 16px;
		line-height: 1.5;
		margin-top: 20px; /* Переопределяем в JS */
		margin-bottom: 20px;
	}



	/* Существующие стили */

	.learn-more {
		position: relative;
		padding-left: 50px; /* Пространство для линии слева от текста */
		padding-right: 40px;
		padding-top: 5px;
		padding-bottom: 5px; /* Пространство для стрелки справа от текста */
		display: inline-block;
		cursor: pointer;
		background-color: transparent; /* Фон кнопки */
		color: white; /* Цвет текста кнопки */
		text-decoration: none; /* Убираем подчеркивание */
		border-radius: 5px; /* Скругляем углы */
		border: #12ad9d solid 2px;
		margin-top: 10px; /* Отступ сверху */
		transition: transform 0.4s cubic-bezier(0.75, 0.02, 0.5, 1); /* Плавность анимации перемещения */
		box-shadow: 0 0 10px 0 #12ad9d;
	}

	.learn-more::before {
		content: "";
		position: absolute;
		top: 50%;
		left: -50px; /* Фиксированная позиция линии слева от кнопки */
		transform: translateY(-50%);
		width: 45px; /* Ширина линии */
		height: 2px; /* Высота линии */
		background: #12ad9d; /* Цвет линии */
		z-index: -1; /* Линия находится под текстом кнопки */
		transition: width 0.4s cubic-bezier(0.75, 0.02, 0.5, 1); /* Плавность анимации линии */
		box-shadow: 0 0 10px 0 #12ad9d;
	}

	.learn-more::after {
		content: "";
		position: absolute;
		top: 50%;
		right: 0px;
		transform: translateY(-50%) translateX(100%);
		width: 0;
		height: 18px;
		background-image: url("data:image/svg+xml,%3Csvg width='42' height='18' viewBox='0 0 42 18' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0.810791 8.67636L40.1891 8.67636M40.1891 8.67636L33.3612 0.892578M40.1891 8.67636L33.3612 16.4601' stroke='%2312ad9d' stroke-width='2'/%3E%3C/svg%3E%0A");
		background-repeat: no-repeat;
		background-position: center;
		background-size: contain;
		transition: width 0.4s cubic-bezier(0.75, 0.02, 0.5, 1), right 0.4s cubic-bezier(0.75, 0.02, 0.5, 1);
		opacity: 0;

	}


	.learn-more:hover {
		transform: translateX(-35px); /* Перемещение кнопки влево */
	}

	.learn-more:hover::before {
		width: 0; /* Скрываем линию при наведении */
	}

	.learn-more:hover::after {
		width: 46px; /* Длина стрелки */
		right: -2px; /* Положение стрелки при наведении */
		opacity: 1; /* Стрелка видна */

	}


	@media (min-width: 1080px) {

		.progress-bar {
			display: none;
			position: absolute;
			top: 45%; /* Располагаем прогресс бар на нужной высоте */
			left: 0;
			width: 100%;
			height: 4px;
			background-color: white;
			z-index: 10;
		}
	}

	/* Стили для адаптации подложки на меньших экранах */
	@media (max-width: 1080px) {
		.overlay {
			left: 50% !important;
			transform: translateX(-50%) !important;
			bottom: 30%;
		}

		.progress-bar {
			display: none;
		}
	}



	/* Медиа-запрос для мобильных устройств */
	@media (max-width: 530px) {
		.overlay {
			max-width: 300px; /* Убедитесь, что на мобильных устройствах высота также автоматическая */


		}
	}

	@media (max-width: 330px) {
		.overlay {
			max-width: 300px; /* Убедитесь, что на мобильных устройствах высота также автоматическая */
		}
	}
</style>




