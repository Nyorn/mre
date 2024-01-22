import { c as create_ssr_component, e as escape, v as validate_component } from "../../../../chunks/ssr.js";
import { C as Carousel } from "../../../../chunks/Carousel.js";
import "../../../../chunks/Carousel.svelte_svelte_type_style_lang.js";
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
  let imageUrls = data.object.galleryCollection.items.map((item) => item.url);
  if ($$props.data === void 0 && $$bindings.data && data !== void 0)
    $$bindings.data(data);
  $$result.css.add(css);
  return `<h1 class="text-3xl md:text-4xl lg:text-5xl font-bold my-4">${escape(data.object.name)}</h1> <section class="flex flex-col md:flex-row justify-center items-center md:items-start md:space-x-4 px-4 py-2 svelte-2ufuas">${data && data.object ? `<div class="w-full md:w-1/2">${validate_component(Carousel, "Carousel").$$render($$result, { images: imageUrls }, {}, {})}</div> <div class="w-full md:w-1/2 mt-4 md:mt-0"><div class="p-4 rounded-lg shadow-md"><p class="text-sm md:text-base">Город: ${escape(data.object.city)}</p> <p class="text-sm md:text-base">Цена: ${escape(data.object.price)}</p> <p class="text-sm md:text-base">Этаж: ${escape(data.object.floor)} из ${escape(data.object.maxFloor)}</p> <p class="text-sm md:text-base">Площадь: ${escape(data.object.area)}</p> <p class="text-sm md:text-base">Спален: ${escape(data.object.bedrooms)}</p> <p class="text-sm md:text-base">Лифт: ${escape(data.object.elevator ? "Есть" : "Нет")}</p> <button class="variant-ghost-tertiary p-2 bg-indigo-600 text-white rounded mt-10 mb-10" button data-svelte-h="svelte-1ti2831">Заказать осмотр</button> <div class="mt-115"><p class="text-base md:text-lg mt-110"><!-- HTML_TAG_START -->${data.object.description}<!-- HTML_TAG_END --></p> <iframe width="400" height="400" title="Map" margin-top="115px" frameborder="0" scrolling="no" marginheight="0" marginwidth="0" src="${"https://maps.google.com/maps?q=" + escape(data.object.location.lat, true) + "," + escape(data.object.location.lon, true) + "&z=12&output=embed"}"></iframe></div></div></div>` : `<p data-svelte-h="svelte-1ha0hdy">Информация об объекте не найдена.</p>`}</section> <hr> <section class="center svelte-2ufuas" data-svelte-h="svelte-1ls1fxi"></section>`;
});
export {
  Page as default
};
