import { error } from '@sveltejs/kit'
import { documentToHtmlString } from '@contentful/rich-text-html-renderer'
import contentfulFetch from '$lib/contentful-fetch'


export async function load({ params }) {
  console.log("Slug in slug.server.js:", params.slug);
  const query = `
  {
    objectCollection(where: {slug:"${params.slug}"}) {
      items {
      name
      location {
        lat
        lon
      }
      city
      area
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
    galleryCollection {
        items {                  
        url(transform: {
          format: AVIF
        })
      
        }
      }
      }
    }
  }
  `

  const response = await contentfulFetch(query)
  console.log("Response status:", response.ok);

  if (!response.ok) {
    throw error(404, {
      message: response.statusText,
    })
  }

  const { data } = await response.json()
  console.log("Data:", data);
  const { items } = data.objectCollection

  const objectData = items[0]
  // convert description to HTML
  objectData.description = documentToHtmlString(objectData.description.json)

  return {
    object: data.objectCollection.items[0], // Проверьте, что такой доступ к данным корректен
  }
}
