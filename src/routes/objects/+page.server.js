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
