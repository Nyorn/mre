<script>
	export let object;

	import { modalStack } from '$lib/store.js';
	import Modal from '$lib/Modal.svelte'
	function openModal() {
		console.log('Открываем модальное окно для объекта:', object);
		modalStack.open('objectCard', object);
	}
</script>

{#if object.photo}
	<figure>
		<img src={object.photo.url} alt={object.photo.description} />
		<figcaption>
			<h1>{object.name}</h1>
			<p>Город: {object.city}</p>
			<p>Площадь: {object.area}</p>
			<p>Cпальни: {object.bedrooms}</p>
			<p>Этаж: {object.floor} из {object.maxFloor}</p>
			<p>Лифт: {object.elevator ? 'Есть' : 'Нет'}</p>
			<p>Цена: {object.price}</p>
		</figcaption>
		<button on:click={openModal}>Подробнее</button>
		<a href={`/objects/${object.slug}`}><button>Открыть в отдельной вкладке</button></a>
	</figure>
{:else}
	<a href={`/objects/${object.slug}`}>
		<figure>
			<!-- Здесь можете добавить изображение-заглушку или другой контент, если фото отсутствует -->
			<figcaption>
				<p>{object.name}</p>
			</figcaption>
		</figure>
	</a>
{/if}

<style>
	figure {
		box-shadow: 0 0 10px 0 #e2e6e8;
	}

	a:hover img,
	a:active img {
		filter: sepia(0.6);
	}

	figcaption {
		text-align: center;
		padding: 10px;
	}



</style>
