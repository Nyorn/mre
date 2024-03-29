import { CONTENTFUL_SPACE_ID, CONTENTFUL_ACCESS_TOKEN } from '$env/static/private'

// lib/contentful-fetch.js
export const contentfulFetch = async (query) => {
  const url = `https://graphql.contentful.com/content/v1/spaces/${CONTENTFUL_SPACE_ID}`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${CONTENTFUL_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({ query }),
    });

    const jsonResponse = await response.json();
    console.log("JSON ответ от Contentful:", JSON.stringify(jsonResponse, null, 2));

    if (!jsonResponse.data) {
      console.error("Ответ от Contentful не содержит данных:", jsonResponse);
      return { ok: false, error: 'Данные отсутствуют в ответе' };
    }

    return {
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
      data: jsonResponse.data
    };
  } catch (error) {
    console.error("Ошибка при выполнении запроса к Contentful:", error);
    return { ok: false, error };
  }
};
