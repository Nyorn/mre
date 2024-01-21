<script>


	import FeedbackForm from '$lib/FeedbackForm.svelte';
	import InfoBlock from '$lib/InfoBlock.svelte';
	import { onMount } from 'svelte';
		import {SplideShaderCarousel, dissolveShader} from '@splidejs/splide-shader-carousel';
		import '@splidejs/svelte-splide/css/splide.min.css';
	import '@splidejs/splide/css';

		let splide;
	let currentSlide = 0;

	const overlaysContent = [
		{ title: 'Погружение в райскую природу:', paragraph: 'Инвестируйте в свой уголок среди изумрудных гор и бескрайних пляжей Черного моря.', button: 'Подробнее' },
		{ title: 'Разнообразие недвижимости:', paragraph: 'От стильных апартаментов до вилл с потрясающим видом на море - мы предлагаем разнообразие вариантов, чтобы воплотить ваши мечты в реальность.', button: 'Подробнее' },
		{ title: 'Инвестиции с умом: ', paragraph: 'Наша команда экспертов поможет вам сделать выгодные инвестиции в болгарскую недвижимость, обеспечивая стабильный доход и рост капитала.', button: 'Подробнее' },
		{ title: 'Простой процесс сделки: ', paragraph: 'Мы делаем покупку недвижимости в Болгарии легкой и прозрачной. Надежное сопровождение сделки от начала до конца.', button: 'Подробнее' },
		{ title: 'Обретите свой уголок под солнцем с нами.', paragraph:'Выберите Болгарию для вашего нового дома или инвестиций! ', button: 'Подробнее' }
	];
		// Инициализируем слайдер после монтирования компонента
		onMount(() => {
			splide = new SplideShaderCarousel('.splide', dissolveShader, {
				type: 'fade',
				height: '90vh',
				rewind: true,
				continuous: true,
				autoplay: true, // Включаем автовоспроизведение
				pauseOnHover: false, // Не останавливать при наведении
				arrows: false, // Убираем стрелки
				speed: 1750, // Скорость анимации в миллисекундах
		});
			splide.on('move', (newIndex) => {
				currentSlide = newIndex;
			});
		splide.mount();
	});
</script>
<link rel="stylesheet" href="node_modules/@splidejs/splide/dist/css/splide.min.css">
<section class="splide" aria-label="Splide Shader Carousel Example">
	<div class="splide__track">
		<ul class="splide__list">
			<li class="splide__slide"><img src="src/assets/5.jpg" alt="Image 1" class="w-full" /></li>
			<li class="splide__slide"><img src="src/assets/6.jpg" alt="Image 2" class="w-full" /></li>
			<li class="splide__slide"><img src="src/assets/7.jpg" alt="Image 3" class="w-full" /></li>
			<li class="splide__slide"><img src="src/assets/8.jpg" alt="Image 4" class="w-full" /></li>
			<li class="splide__slide"><img src="src/assets/9.jpg" alt="Image 5" class="w-full" /></li>
		</ul>
	</div>
	<div class="overlay" style={`left: ${currentSlide * (100 / (overlaysContent.length - 1))}%; transform: translateX(-${currentSlide === 0 ? 0 : currentSlide === overlaysContent.length - 1 ? 500 : 250}px);`}>
		<h2>{overlaysContent[currentSlide].title}</h2>
		<p>{overlaysContent[currentSlide].paragraph}</p>
		<button class="text-white bg-gradient-to-r from-cyan-500 via-cyan-600 to-cyan-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-cyan-400 dark:focus:ring-cyan-900 shadow-lg shadow-cyan-500/50 dark:shadow-lg dark:shadow-cyan-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2">{overlaysContent[currentSlide].button}</button>
	</div>
	<div class="progress-bar" />
</section>

<InfoBlock />
<FeedbackForm />



<style>
	.progress-bar {
		position: absolute;
		top: 45%; /* Располагаем прогресс бар на нужной высоте */
		left: 0;
		width: 100%;
		height: 4px;
		background-color: white;
		z-index: 10;
	}

	.overlay {
		backdrop-filter: blur(10px); /* Применяем блюр к фону */
		border-radius: 15px; /* Скругляем углы */
		position: absolute;
		bottom: 29%; /* Устанавливаем подложку на нужной высоте */
		background-color: rgba(0, 0, 0, 0.5);
		padding: 20px 20px 60px; /* Увеличиваем нижний отступ для подложки */
		max-width: 500px;
		width: 500px;
		margin: auto;
		text-align: center;
		transition: left 1s ease;
		transform: translateX(-50%);
		min-height: 420px;
	}

	.overlay h2 {
		font-size: 32px; /* Увеличиваем размер заголовка */
		margin-bottom: 55px; /* Уменьшаем расстояние между заголовком и прогресс баром */
		color: white;
	}

	.overlay p {
		margin-top: 55px; /* Увеличиваем расстояние между прогресс баром и параграфом */
		color: white;
	}

	.overlay button {
		background-color: white;
		border: none;
		padding: 10px 15px; /* Увеличиваем размер кнопки */
		margin-top: 30px;
		align-self: start; /* Располагаем кнопку ближе к левому краю */
	}

	.splide__pagination .splide__pagination__page {
		opacity: 1!important;
		z-index: 2000;
		color:black;/* Показываем пагинацию всегда */
	}
	.splide__pagination button {
		opacity: 1;
	}

</style>

