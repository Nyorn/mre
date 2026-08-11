import { env } from '$env/dynamic/private';
import { dev } from '$app/environment';
import { contentfulFetch, resolveCmsFailure } from '$lib/contentful-fetch';
import { BUILD_CONTEXT } from '$lib/build-context.js';
import { resolvePreviewGate, resolvePreviewVariant, parseQueryPreview } from '$lib/preview-comparer.js';

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

export async function load({ url }) {
  /*
   * Same preview contract as home, resolved on the server: the gate decides
   * whether a variant may apply at all, and the QUERY is the only input. Slice 1
   * carried preview_theme/preview_copy across catalog links; without this the
   * catalog ignored them, so the carried query was decorative. The switcher
   * itself stays on home — per the v3 contract the shareable URL is the source
   * of truth, and storage is never restored.
   */
  const previewEnabled = resolvePreviewGate(BUILD_CONTEXT, {
    dev,
    override: env.SEA_ESTATE_PREVIEW_COMPARER
  });
  const variant = resolvePreviewVariant({
    enabled: previewEnabled,
    query: previewEnabled ? parseQueryPreview(url.searchParams) : {}
  });

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
    return { objects: [], cmsError: resolveCmsFailure(response), previewEnabled, variant };
  }

  return {
    objects: response.data.objectCollection.items,
    cmsError: null,
    previewEnabled,
    variant
  };
}
