import { error } from '@sveltejs/kit'
import { documentToHtmlString } from '@contentful/rich-text-html-renderer'
import { contentfulFetch } from '$lib/contentful-fetch';


export async function load({ params }) {
  console.log("Slug in slug.server.js:", params.slug);
  const query = `
  {
       objectCollection(where: {slug: "${params.slug}"}) {
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
        url(transform: {
          format: AVIF
        })
        description
        }
    
      }
    }
  }
  `;
  const response = await contentfulFetch(query);
  console.log("Обработанный ответ от Contentful:", response);

  if (!response.ok) {
    console.error("Ошибка HTTP запроса:", response.status, response.statusText, response.error);
    throw error(response.status || 500, {
      message: response.statusText || 'Ошибка загрузки данных'
    });
  }

  if (!response.data || !response.data.objectCollection || !response.data.objectCollection.items.length) {
    console.error("Ответ от Contentful не содержит данных:", response.data);
    throw error(404, 'Данные не найдены');
  }

  const objectData = response.data.objectCollection.items[0];
  objectData.description = documentToHtmlString(objectData.description.json);

  return {
    object: objectData,
  };
}

