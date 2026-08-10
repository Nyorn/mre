import { contentfulFetch, resolveCmsFailure } from '$lib/contentful-fetch';

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
      type
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
     
      }
      }
}
`

export async function load() {
  const response = await contentfulFetch(query);

  /*
   * A CMS outage is not a server error for the visitor: it is a page that
   * cannot list objects right now. Throwing 500 dropped them into the framework
   * error shell with no header, no footer and no way to reach us. Returning a
   * described failure lets +page.svelte render it inside the site shell with a
   * retry and a route to the enquiry form.
   *
   * Nothing about the credential or the response body travels in this object.
   */
  if (!response.ok || !response.data || !response.data.objectCollection) {
    return { objects: [], cmsError: resolveCmsFailure(response) };
  }

  return { objects: response.data.objectCollection.items, cmsError: null };
}
