import { e as error } from "../../../chunks/index2.js";
import { c as contentfulFetch } from "../../../chunks/contentful-fetch.js";
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
`;
async function load() {
  console.log("Начало загрузки данных из Contentful");
  try {
    const response = await contentfulFetch(query);
    console.log("Данные получены от Contentful:", JSON.stringify(response, null, 2));
    if (!response.ok || !response.data || !response.data.objectCollection) {
      throw new Error("Ответ не содержит коллекции объектов");
    }
    const { items } = response.data.objectCollection;
    console.log("Полученные элементы из коллекции объектов:", items);
    return { objects: items };
  } catch (e) {
    console.error("Ошибка в функции load:", e);
    throw error(500, "Внутренняя ошибка сервера");
  }
}
export {
  load
};
