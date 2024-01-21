import { error } from '@sveltejs/kit'
import contentfulFetch from '$lib/contentful-fetch'

const query = `
{
  objectCollection {
    items {
      name
      slug
      photo {
        url(transform: {
          format: AVIF
        })
        description
      }     
      city
      area
      bedrooms
      floor
      maxFloor
      elevator
      price
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
      location {
        lat
        lon
      }
      key
      description {
        json
      }
      internet
      altPhoto {
        url(transform: {
          format: AVIF
        })
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

export async function load() {
  const response = await contentfulFetch(query)

  if (!response.ok) {
    throw error(response.status, {
      message: response.statusText,
    })
  }
  console.log(response); // Логирование ответа от Contentful
  const { data } = await response.json()
  console.log(data);
  const { items } = data.objectCollection

  return {
    objects: items,
  }
}
