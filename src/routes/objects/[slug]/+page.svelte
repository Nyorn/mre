

<script>
	import Carousel from '$lib/Carousel.svelte';
	import { modalStack } from '$lib/store.js'

	export let data;
	console.log("Data in slug.svelte:", data);

	if (!data || !data.object) {
		console.error("Data is not available or incorrect structure:", data);
	}

	// Получение массива ссылок на изображения из galleryCollection

	let imageUrls = [];
	$: if (data && data.object && data.object.galleryCollection) {
		imageUrls = data.object.galleryCollection.items.map(item => item.url);
	}
</script>

<h1 class="text-3xl md:text-4xl lg:text-5xl font-bold my-4">{data.object.name}</h1>
<section class="flex flex-col md:flex-row justify-center items-center md:items-start md:space-x-4 px-4 py-2">
	{#if data && data.object}
		<div class="w-full md:w-1/2">
		    <Carousel slug={data.object.slug} />


		</div>
		<div class="w-full md:w-1/2 mt-4 md:mt-0">
			<div class="p-4 rounded-lg shadow-md">
				<p class="text-sm md:text-base">Город: {data.object.city}</p>
				<p class="text-sm md:text-base">Цена: {data.object.price}</p>
				<p class="text-sm md:text-base">Этаж: {data.object.floor} из {data.object.maxFloor}</p>
				<p class="text-sm md:text-base">Площадь: {data.object.area}</p>
				<p class="text-sm md:text-base">Спален: {data.object.bedrooms}</p>
				<p class="text-sm md:text-base">Лифт: {data.object.elevator ? 'Есть' : 'Нет'}</p>
				<button class="variant-ghost-tertiary p-2 bg-indigo-600 text-white rounded mt-10 mb-10" button on:click={() => {
  console.log("Opening modal with object name:", data.object.name);
  modalStack.open('feedback', { objectName: data.object.name });
}}>
					Заказать осмотр
				</button>
				<div class="mt-115">
				<p class="text-base md:text-lg mt-110">{@html data.object.description}</p>
				<iframe
					width="400"
					height="400"
					title="Map"
					margin-top="115px"
					frameborder="0"
					scrolling="no"
					marginheight="0"
					marginwidth="0"
					src="https://maps.google.com/maps?q={data.object.location.lat},{data.object.location
			.lon}&z=12&amp;output=embed"
				/>

</div>
			</div>
		</div>
	{:else}
		<p>Информация об объекте не найдена.</p>
	{/if}
</section>

<hr />

<section class="center">


</section>

<style>
	.flex {
		display: flex;
		justify-content: space-around;
		align-items: center;
		width: 100%;
	}

	.center {
		text-align: center;
	}

	img {
		max-width: 400px;
		height: auto;
	}
</style>
