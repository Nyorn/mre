import { contentfulFetch } from '$lib/contentful-fetch';
import fs from 'fs';
import path from 'path';

const objectsFolderPath = path.join(__dirname, 'src/routes/objects');

const query = `
{
  objectCollection {
    items {
      slug
    }
  }
}`;

async function fetchSlugs() {
  try {
    const response = await contentfulFetch(query);
    if (!response.ok || !response.data || !response.data.objectCollection) {
      throw new Error('Failed to retrieve object collection');
    }

    const slugs = response.data.objectCollection.items.map(item => item.slug);
    console.log("Retrieved slugs:", slugs);

    slugs.forEach(slug => {
      const pageContent = `
<script context="module">
  import { error } from '@sveltejs/kit';
  import { documentToHtmlString } from '@contentful/rich-text-html-renderer';
  import { contentfulFetch } from '$lib/contentful-fetch';
  import Carousel from '$lib/Carousel.svelte';
  import { modalStack } from '$lib/store.js';

  export async function load({ params }) {
    const slug = params.slug;
    const query = \`
    {
      objectCollection(where: {slug: "\${slug}"}) {
        items {
          name
          location {
            lat
            lon
          }
          city
          area
          type
          price
          floor
          maxFloor
          elevator
          bedrooms
          bathrooms
          pool
          parking
          fromBuilder
          heat
          security
          conserj
          video
          fitness
          restoraunts
          playground
          tv
          key
          internet
          slug
          description {
            json
          }
          photo {
            url(transform: { format: AVIF })
            description
          }
        }
      }
    }
    \`;
    const response = await contentfulFetch(query);
    if (!response.ok) {
      throw error(response.status, response.statusText);
    }
    if (!response.data.objectCollection.items.length) {
      throw error(404, 'Object not found');
    }
    const objectData = response.data.objectCollection.items[0];
    objectData.description = documentToHtmlString(objectData.description.json);

    const title = \`Откройте для себя эти уникальные \${objectData.type} в \${objectData.city} | Sea Real Estate\`;
    const description = \`Ищете \${objectData.type} в \${objectData.city}? Обширный выбор недвижимости от Sea Real Estate. Охраняемые комплексы, бассейны, фитнес и многое другое\`;

    return { props: { object: objectData, title, description } };
  }
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />
</svelte:head>


<!-- Ваш шаблон страницы объекта -->

<h1 class="text-3xl md:text-4xl lg:text-5xl font-bold my-4">{object.name}</h1>
<section class="flex flex-col md:flex-row justify-center items-center md:items-start md:space-x-4 px-4 py-2">
{#if object}
  <div class="w-full md:w-1/2 gallery">
    <Carousel slug={object.slug} />
  </div>
  <div class="w-full md:w-1/2 mt-4 md:mt-0">
    <div class="p-4 rounded-lg shadow-md">
      <!-- Информация об объекте -->
      <button class="variant-ghost-tertiary p-2 bg-indigo-600 text-white rounded mt-10 mb-10" on:click={() => {
        console.log("Opening modal with object name:", object.name);
        const objectUrl = `https://sea-estate.com/objects/${object.slug}`;
        modalStack.open('feedback', { objectName: object.name, url: objectUrl });
    }}>
  Заказать осмотр
  </button>
  <div class="mt-115 map">
    <p class="text-base md:text-lg mt-110">{@html object.description}</p>
    <iframe
      width="400"
      height="400"
      title="Map"
      margin-top="115px"
      frameborder="0"
      scrolling="no"
      marginheight="0"
      marginwidth="0"
      src={`https://maps.google.com/maps?q=${object.location.lat},${object.location.lon}&z=12&amp;output=embed`}
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
          .text-base {
          margin-top: 30px;
          margin-bottom: 50px;
        }


</style>
          `;
      const filePath = path.join(objectsFolderPath, `${slug}.svelte`);
      fs.writeFileSync(filePath, pageContent);
    });
  } catch (error) {
    console.error("Error fetching slugs:", error);
  }
}

fetchSlugs();

