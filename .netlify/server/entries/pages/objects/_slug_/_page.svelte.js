import { c as create_ssr_component, a as add_attribute, d as each, e as escape, v as validate_component } from "../../../../chunks/ssr.js";
import "../../../../chunks/Carousel.svelte_svelte_type_style_lang.js";
const css$1 = {
  code: ".hidden.svelte-gp961v{display:none}.image-placeholder.svelte-gp961v{width:100%;height:100%;background-color:#E5E7EB;border-radius:10px;display:flex;align-items:center;justify-content:center}.thumbnail-placeholder.svelte-gp961v{width:100px;height:100px;background-color:#E5E7EB;border-radius:10px;display:flex;align-items:center;justify-content:center}.image-wrapper.svelte-gp961v{flex:none;width:100%;height:800px;position:relative}.carousel.svelte-gp961v{position:relative}.carousel-image.svelte-gp961v{width:100%;height:auto;object-fit:cover}.carousel-button.svelte-gp961v{position:absolute;top:50%;transform:translateY(-50%);background-color:rgba(0, 0, 0, 0.5);border-radius:50%;border:none;cursor:pointer;width:40px;height:40px;display:flex;align-items:center;justify-content:center;z-index:10}.arrow-icon.svelte-gp961v{color:#fff}.carousel-button.left.svelte-gp961v{left:10px}.carousel-button.right.svelte-gp961v{right:10px}.carousel-container.svelte-gp961v{display:flex;overflow-x:hidden;scroll-snap-type:x mandatory;scroll-behavior:smooth;width:100%}.carousel-image.svelte-gp961v{max-width:100%;max-height:800px;object-fit:cover;width:100%;min-height:800px}.thumbnails.svelte-gp961v{display:grid;grid-template-columns:repeat(auto-fill, minmax(100px, 1fr));overflow-y:auto;gap:10px;padding:10px 0;height:220px;grid-auto-rows:100px}.thumbnail-button.svelte-gp961v{border:none;background:none;padding:0;cursor:pointer}.thumbnail-image.svelte-gp961v{width:100%;height:100%;object-fit:cover;border-radius:10px}@media(max-width: 768px){.carousel-image.svelte-gp961v{height:250px}}",
  map: null
};
const Carousel = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { slug } = $$props;
  let images = [];
  let isLoading = images.map(() => true);
  let elemCarousel;
  console.log("Slug:", slug);
  if ($$props.slug === void 0 && $$bindings.slug && slug !== void 0)
    $$bindings.slug(slug);
  $$result.css.add(css$1);
  return `  <div class="carousel svelte-gp961v"> <button type="button" class="carousel-button left svelte-gp961v" data-svelte-h="svelte-1sft7rd"><i class="fa-solid fa-arrow-left arrow-icon svelte-gp961v"></i></button>  <div class="carousel-container svelte-gp961v"${add_attribute("this", elemCarousel, 0)}>${each(images, (image, i) => {
    return `<div class="image-wrapper svelte-gp961v">${isLoading[i] ? `<div role="status" class="image-placeholder svelte-gp961v" data-svelte-h="svelte-19hrt40"><div class="flex items-center justify-center w-full h-full bg-gray-300 rounded dark:bg-gray-700"><svg class="w-10 h-10 text-gray-200 dark:text-gray-600" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 18"><path d="M18 0H2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm-5.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm4.376 10.481A1 1 0 0 1 16 15H4a1 1 0 0 1-.895-1.447l3.5-7A1 1 0 0 1 7.468 6a.965.965 0 0 1 .9.5l2.775 4.757 1.546-1.887a1 1 0 0 1 1.618.1l2.541 4a1 1 0 0 1 .028 1.011Z"></path></svg></div> </div>` : ``} <img class="${"carousel-image " + escape(isLoading[i] ? "hidden" : "", true) + " svelte-gp961v"}"${add_attribute("src", image, 0)} alt="${"Image " + escape(i, true)}" loading="lazy"> </div>`;
  })}</div>  <button type="button" class="carousel-button right svelte-gp961v" data-svelte-h="svelte-fw07o"><i class="fa-solid fa-arrow-right arrow-icon svelte-gp961v"></i></button></div>  <div class="thumbnails svelte-gp961v">${each(images, (image, i) => {
    return `<button type="button" class="thumbnail-button svelte-gp961v">${isLoading[i] ? `<div role="status" class="thumbnail-placeholder svelte-gp961v" data-svelte-h="svelte-1xuodw5"><div role="status" class="image-placeholder svelte-gp961v"><div class="flex items-center justify-center w-full h-full bg-gray-300 rounded dark:bg-gray-700"><svg class="w-10 h-10 text-gray-200 dark:text-gray-600" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 18"><path d="M18 0H2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm-5.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm4.376 10.481A1 1 0 0 1 16 15H4a1 1 0 0 1-.895-1.447l3.5-7A1 1 0 0 1 7.468 6a.965.965 0 0 1 .9.5l2.775 4.757 1.546-1.887a1 1 0 0 1 1.618.1l2.541 4a1 1 0 0 1 .028 1.011Z"></path></svg> </div></div> </div>` : `<img class="thumbnail-image svelte-gp961v"${add_attribute("src", image, 0)} alt="${"Thumbnail " + escape(i, true)}" loading="lazy">`} </button>`;
  })} </div>`;
});
const css = {
  code: ".flex.svelte-2ufuas{display:flex;justify-content:space-around;align-items:center;width:100%}.center.svelte-2ufuas{text-align:center}",
  map: null
};
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { data } = $$props;
  console.log("Data in slug.svelte:", data);
  if (!data || !data.object) {
    console.error("Data is not available or incorrect structure:", data);
  }
  let title;
  let description;
  if ($$props.data === void 0 && $$bindings.data && data !== void 0)
    $$bindings.data(data);
  $$result.css.add(css);
  {
    if (data && data.object && data.object.galleryCollection) {
      data.object.galleryCollection.items.map((item) => item.url);
    }
  }
  return `${$$result.head += `<!-- HEAD_svelte-1bfj62p_START -->${$$result.title = `<title>${escape(title)}</title>`, ""}<meta name="description"${add_attribute("content", description, 0)}><!-- HEAD_svelte-1bfj62p_END -->`, ""} <h1 class="text-3xl md:text-4xl lg:text-5xl font-bold my-4">${escape(data.object.name)}</h1> <section class="flex flex-col md:flex-row justify-center items-center md:items-start md:space-x-4 px-4 py-2 svelte-2ufuas">${data && data.object ? `<div class="w-full md:w-1/2">${validate_component(Carousel, "Carousel").$$render($$result, { slug: data.object.slug }, {}, {})}</div> <div class="w-full md:w-1/2 mt-4 md:mt-0"><div class="p-4 rounded-lg shadow-md"><p class="text-sm md:text-base">Город: ${escape(data.object.city)}</p> <p class="text-sm md:text-base">Цена: ${escape(data.object.price)}</p> <p class="text-sm md:text-base">Этаж: ${escape(data.object.floor)} из ${escape(data.object.maxFloor)}</p> <p class="text-sm md:text-base">Площадь: ${escape(data.object.area)}</p> <p class="text-sm md:text-base">Спален: ${escape(data.object.bedrooms)}</p> <p class="text-sm md:text-base">Лифт: ${escape(data.object.elevator ? "Есть" : "Нет")}</p> <button class="variant-ghost-tertiary p-2 bg-indigo-600 text-white rounded mt-10 mb-10" button data-svelte-h="svelte-1ti2831">Заказать осмотр</button> <div class="mt-115"><p class="text-base md:text-lg mt-110"><!-- HTML_TAG_START -->${data.object.description}<!-- HTML_TAG_END --></p> <iframe width="400" height="400" title="Map" margin-top="115px" frameborder="0" scrolling="no" marginheight="0" marginwidth="0" src="${"https://maps.google.com/maps?q=" + escape(data.object.location.lat, true) + "," + escape(data.object.location.lon, true) + "&z=12&output=embed"}"></iframe></div></div></div>` : `<p data-svelte-h="svelte-1ha0hdy">Информация об объекте не найдена.</p>`}</section> <hr> <section class="center svelte-2ufuas" data-svelte-h="svelte-1ls1fxi"></section>`;
});
export {
  Page as default
};
