
	<script>
		import { createEventDispatcher } from 'svelte';
		export let object;
		import {modalStack} from '$lib/store.js';
		import Modal from '$lib/Modal.svelte'
		const dispatch = createEventDispatcher();
	 function openModal() {
	 console.log(object);
        console.log('Открываем модальное окно для объекта:', object);
    modalStack.open('objectCard', object);
      }
		function handleLoad(event) {
			if (event.target.complete) {
				dispatch('loaded');
			}
		}
		function onImageLoad(event) {
			if (event.target.complete) {
				// Если изображение уже загружено (например, из кеша)
				dispatch('loaded');
			}
		}
</script>

	<figure class="card shadow-lg cursor-pointer ">
		{#if object.photo}
		<div class="w-full h-96 overflow-hidden relative" on:click={openModal}>
			<img src={object.photo.url} alt={object.photo.description}
					 class="w-full h-full object-cover transition duration-300 ease-in-out" on:load={handleLoad} />

			<img src={object.altPhoto.url} alt="Alternate Photo"
					 class="absolute top-0 left-0 w-full h-full object-cover opacity-0 hover:opacity-100 transition duration-300 ease-in-out" />
		</div>
		<figcaption class="text-left p-4">
			<h1 class="h1 text-3xl font-bold mb-3" on:click={openModal}>{object.name}</h1>
			<p class="text-lg" on:click={openModal}>Город: {object.city}</p>
			<p class="text-lg" on:click={openModal}>Площадь: {object.area} м²</p>
			<p class="text-lg" on:click={openModal}> Cпальни: {object.bedrooms}</p>
			<p class="text-lg" on:click={openModal}>Этаж: {object.floor} из {object.maxFloor}</p>
			<p class="text-lg" on:click={openModal}>Лифт: {object.elevator ? 'Есть' : 'Нет'}</p>
			<h2 class="text-2xl font-bold mb-3" on:click={openModal}>Цена:{object.price} €</h2>
			<div class="flex justify-between mt-4">
				<button type="button" class="text-white bg-gradient-to-r from-cyan-500 via-cyan-600 to-cyan-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-cyan-400 dark:focus:ring-cyan-900 shadow-lg shadow-cyan-500/50 dark:shadow-lg dark:shadow-cyan-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2" on:click={openModal}>
					Подробнее
				</button>
				<a href={`/objects/${object.slug}`} target="_blank" class="text-white bg-gradient-to-r from-cyan-500 via-cyan-600 to-cyan-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-cyan-400 dark:focus:ring-cyan-900 shadow-lg shadow-cyan-500/50 dark:shadow-lg dark:shadow-cyan-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2">
					Открыть в новой вкладке
				</a>
			</div>
		</figcaption>
	{:else}
		<!-- Альтернативный контент для карточки без изображения -->
	{/if}
</figure>



<style>
	figure {
		box-shadow: 0 0 10px 0 #e6f4fa;
		height: 900px; /* Фиксированная высота карточки */
		display: flex;
		flex-direction: column;
	}

	 .card {
		 box-shadow: 0 0 10px 0 #e6f4fa;
		 width: 100%; /* Фиксированная ширина карточки */
		 height: 850px; /* Фиксированная высота карточки */
		 display: flex;
		 flex-direction: column;
		 overflow: hidden; /* Скрываем содержимое, выходящее за пределы */
		 background-color: #111827;

	 }

	.card img {
		height: 600px; /* Фиксированная высота изображения */
		object-fit: cover; /* Обрезка изображения для поддержания пропорций */
		width: 100%; /* Ширина изображения равна ширине карточки */
	}
	.card:hover {
		transform: scale(1.02); /* Увеличиваем масштаб на 5% при наведении курсора */
		transition: transform 0.3s ease; /* Добавляем плавную анимацию изменения масштаба */
	}
	.card figcaption {
		padding: 10px;
		flex-grow: 1; /* Остаток пространства занимает описание */
		display: flex;
		flex-direction: column;
		justify-content: space-between; /* Распределение пространства между заголовками и кнопками */
	}
	.flex.justify-between.mt-4 {
		display: flex;
		justify-content: space-between;
		flex-wrap: wrap; /* Добавляем перенос элементов */
	}

	@media (max-width: 2300px) {
		.flex.justify-between.mt-4 {
			flex-direction: column; /* Элементы выстраиваются в столбец */
		}

		.flex.justify-between.mt-4 button,
		.flex.justify-between.mt-4 a {
			width: 100%; /* Кнопки и ссылки занимают всю ширину контейнера */
			margin-bottom: 10px; /* Добавляем отступ снизу для каждой кнопки/ссылки */
		}
	}

	@media (max-width: 640px) {
		.card {
			width: 100%; /* Ширина карточки на мобильных устройствах */
			height: auto; /* Автоматическая высота карточки */
		}

		.card img {
			height: 100%; /* Меньшая высота изображения на мобильных устройствах */
		}
	}
</style>

