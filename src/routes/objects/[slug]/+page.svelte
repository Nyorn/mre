<script>
	export let data;
	console.log("Data in slug.svelte:", data);
	if (!data || !data.object) {
		console.error("Data is not available or incorrect structure:", data);
	}
</script>

<h1>{data.object.name}</h1>

<section class="flex">

	{#if data && data.object}
	<p>{@html data.object.description}</p>
	<img src={data.object.photo.url} alt={data.object.photo.description} />
	{:else}
		<p>Информация об объекте не найдена.</p>
		{/if}
</section>

<hr />

<section class="center">
	<h2>Come visit us!</h2>
	<iframe
		width="400"
		height="400"
		title="Map"
		frameborder="0"
		scrolling="no"
		marginheight="0"
		marginwidth="0"
		src="https://maps.google.com/maps?q={data.object.location.lat},{data.object.location
			.lon}&z=12&amp;output=embed"
	/>
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
