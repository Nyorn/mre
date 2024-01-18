<script>
	export let photo;
	export let slug;
	export let name;
	export let bedrooms;
	export let area;
	export let city;
	export let elevator;
	export let price;
	export let floor;
	export let maxFloor;

</script>

{#if photo}
	<a href={`/objects/${slug}`}>
		<figure>
			<img src={photo.url} alt={photo.description} />
			<figcaption>
				<h1>{name}</h1>
				<p>Город: {city}</p>
				<p>Площадь: {area}</p>
				<p>Cпальни: {bedrooms}</p>
				<p>Этаж: {floor} из {maxFloor}</p>
				<p>Лифт: {elevator ? 'Есть' : 'Нет'}</p>
				<p>Цена: {price}</p>

			</figcaption>
		</figure>
	</a>
{:else}
	<a href={`/objects/${slug}`}>
		<figure>
			<!-- Здесь можете добавить изображение-заглушку или другой контент, если фото отсутствует -->
			<figcaption>
				<p>{name}</p>
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
