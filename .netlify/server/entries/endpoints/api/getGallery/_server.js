import { c as contentfulFetch } from "../../../../chunks/contentful-fetch.js";
async function GET({ url }) {
  const slug = url.searchParams.get("slug");
  if (!slug) {
    return new Response(JSON.stringify({ error: "Slug is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
  console.log("Requested slug:", slug);
  const contentfulQuery = `
  {
    objectCollection(where: {slug: "${slug}"}) {
      items {
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
  `;
  try {
    const response = await contentfulFetch(contentfulQuery);
    if (response.ok && response.data.objectCollection.items.length > 0) {
      const images = response.data.objectCollection.items[0].galleryCollection.items.map((item) => item.url);
      return new Response(JSON.stringify({ images }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    } else {
      return new Response(JSON.stringify({ error: "Gallery not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
export {
  GET
};
