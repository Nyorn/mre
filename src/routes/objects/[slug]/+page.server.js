import { error } from '@sveltejs/kit'
import { documentToHtmlString } from '@contentful/rich-text-html-renderer'
import { contentfulFetch, resolveCmsFailure } from '$lib/contentful-fetch';


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

  /*
   * Two failures that used to look identical and must not.
   *
   * CMS unreachable -> the object may well exist; we simply cannot say. That is
   * a degraded page inside the shell with a retry, not a 500 and not a 404.
   * Telling a visitor "not found" when the catalog is down is a lie that also
   * invites search engines to drop a real URL.
   */
  if (!response.ok || !response.data || !response.data.objectCollection) {
    return { object: null, cmsError: resolveCmsFailure(response) };
  }

  /*
   * CMS answered and has no such slug -> genuinely missing. 404 stays 404.
   */
  if (!response.data.objectCollection.items.length) {
    throw error(404, 'Объект не найден');
  }

  const objectData = response.data.objectCollection.items[0];
  objectData.description = objectData.description
    ? documentToHtmlString(objectData.description.json)
    : '';

  return { object: objectData, cmsError: null };
}
