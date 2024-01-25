import { c as create_ssr_component, a as add_attribute, e as escape, f as subscribe, i as createEventDispatcher, d as each, v as validate_component } from "../../../chunks/ssr.js";
import { i as isFullFilterVisible } from "../../../chunks/Carousel.svelte_svelte_type_style_lang.js";
/* empty css                                                         */
import "@contentful/rich-text-html-renderer";
import "../../../chunks/Modal.svelte_svelte_type_style_lang.js";
import "canvas-confetti";
const css$2 = {
  code: "figure.svelte-uwmrua.svelte-uwmrua{box-shadow:0 0 10px 0 #e6f4fa;height:900px;display:flex;flex-direction:column}.card.svelte-uwmrua.svelte-uwmrua{box-shadow:0 0 10px 0 #e6f4fa;width:100%;height:850px;display:flex;flex-direction:column;overflow:hidden}.card.svelte-uwmrua img.svelte-uwmrua{height:600px;object-fit:cover;width:100%}.card.svelte-uwmrua figcaption.svelte-uwmrua{padding:10px;flex-grow:1;display:flex;flex-direction:column;justify-content:space-between}.flex.justify-between.mt-4.svelte-uwmrua.svelte-uwmrua{display:flex;justify-content:space-between;flex-wrap:wrap}@media(max-width: 2300px){.flex.justify-between.mt-4.svelte-uwmrua.svelte-uwmrua{flex-direction:column}.flex.justify-between.mt-4.svelte-uwmrua button.svelte-uwmrua,.flex.justify-between.mt-4.svelte-uwmrua a.svelte-uwmrua{width:100%;margin-bottom:10px}}@media(max-width: 640px){.card.svelte-uwmrua.svelte-uwmrua{width:100%;height:auto}.card.svelte-uwmrua img.svelte-uwmrua{height:100%}}",
  map: null
};
const Card = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { object } = $$props;
  if ($$props.object === void 0 && $$bindings.object && object !== void 0)
    $$bindings.object(object);
  $$result.css.add(css$2);
  return `<figure class="card shadow-lg cursor-pointer  svelte-uwmrua">${object.photo ? `<div class="w-full h-96 overflow-hidden relative"><img${add_attribute("src", object.photo.url, 0)}${add_attribute("alt", object.photo.description, 0)} class="w-full h-full object-cover transition duration-300 ease-in-out svelte-uwmrua"> <img${add_attribute("src", object.altPhoto.url, 0)} alt="Alternate Photo" class="absolute top-0 left-0 w-full h-full object-cover opacity-0 hover:opacity-100 transition duration-300 ease-in-out svelte-uwmrua"></div> <figcaption class="text-left p-4 svelte-uwmrua"><h1 class="h1 text-3xl font-bold mb-3">${escape(object.name)}</h1> <p class="text-lg">Город: ${escape(object.city)}</p> <p class="text-lg">Площадь: ${escape(object.area)} м²</p> <p class="text-lg">Cпальни: ${escape(object.bedrooms)}</p> <p class="text-lg">Этаж: ${escape(object.floor)} из ${escape(object.maxFloor)}</p> <p class="text-lg">Лифт: ${escape(object.elevator ? "Есть" : "Нет")}</p> <h2 class="text-2xl font-bold mb-3">Цена:${escape(object.price)} €</h2> <div class="flex justify-between mt-4 svelte-uwmrua"><button type="button" class="text-white bg-gradient-to-r from-cyan-500 via-cyan-600 to-cyan-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-cyan-400 dark:focus:ring-cyan-900 shadow-lg shadow-cyan-500/50 dark:shadow-lg dark:shadow-cyan-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 svelte-uwmrua" data-svelte-h="svelte-13r5gte">Подробнее</button> <a${add_attribute("href", `/objects/${object.slug}`, 0)} target="_blank" class="text-white bg-gradient-to-r from-cyan-500 via-cyan-600 to-cyan-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-cyan-400 dark:focus:ring-cyan-900 shadow-lg shadow-cyan-500/50 dark:shadow-lg dark:shadow-cyan-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 svelte-uwmrua">Открыть в новой вкладке</a></div></figcaption>` : ``} </figure>`;
});
const css$1 = {
  code: '.filter-bar.svelte-tzx7vs input.svelte-tzx7vs,.filter-bar.svelte-tzx7vs select.svelte-tzx7vs{background-color:#051518;color:white}.filter-bar.svelte-tzx7vs button.svelte-tzx7vs{height:60px;width:120px;margin-left:10px;padding:5px;white-space:normal;text-align:center}@media(max-width: 1024px){.filter-bar.svelte-tzx7vs input[type="number"].svelte-tzx7vs,.filter-bar.svelte-tzx7vs .relative.svelte-tzx7vs{display:none}}@media(max-width: 480px){.filter-bar.svelte-tzx7vs.svelte-tzx7vs{flex-direction:column;align-items:center}.filter-bar.svelte-tzx7vs select.svelte-tzx7vs,.filter-bar.svelte-tzx7vs button.svelte-tzx7vs{width:100%}}',
  map: null
};
const FilterBar = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $isFullFilterVisible, $$unsubscribe_isFullFilterVisible;
  $$unsubscribe_isFullFilterVisible = subscribe(isFullFilterVisible, (value) => $isFullFilterVisible = value);
  createEventDispatcher();
  let bedrooms = "";
  const cities = [
    "Бяла",
    "Обзор",
    "Равда",
    "Солнечный берег",
    "Святой Влас",
    "Гавана Влас",
    "Золотые пески"
  ];
  $$result.css.add(css$1);
  $$unsubscribe_isFullFilterVisible();
  return `${!$isFullFilterVisible ? `<div class="filter-bar flex flex-wrap gap-2 p-2 bg-gray-700 text-white svelte-tzx7vs"><select class="p-2 bg-gray-800 svelte-tzx7vs"><option value="" data-svelte-h="svelte-1aiou29">Выберите город</option>${each(cities, (city) => {
    return `<option${add_attribute("value", city, 0)}>${escape(city)}</option>`;
  })}</select> <input type="number" placeholder="Кол-во спален" class="p-2 bg-gray-800 text-white svelte-tzx7vs"${add_attribute("value", bedrooms, 0)}> <div class="relative svelte-tzx7vs"><button class="p-2 bg-gray-800 svelte-tzx7vs">${`Цена`}</button> ${``}</div> <div class="relative svelte-tzx7vs"><button class="p-2 bg-gray-800 svelte-tzx7vs">${`Площадь`}</button> ${``}</div> <div class="relative svelte-tzx7vs"><button class="p-2 bg-gray-800 svelte-tzx7vs">${`Этаж`}</button> ${``}</div> <button class="svelte-tzx7vs" data-svelte-h="svelte-l9xd7u">Применить фильтры</button> <button class="svelte-tzx7vs" data-svelte-h="svelte-hlfod7">Полные фильтры</button> <button class="svelte-tzx7vs" data-svelte-h="svelte-1uhjrij">Сбросить фильтры</button></div>` : ``}`;
});
const css = {
  code: "section.svelte-1821nki{display:grid;gap:30px;padding:10px}",
  map: null
};
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { data } = $$props;
  let filteredData = data.objects;
  console.log("Данные объектов:", data.objects);
  if ($$props.data === void 0 && $$bindings.data && data !== void 0)
    $$bindings.data(data);
  $$result.css.add(css);
  return ` ${validate_component(FilterBar, "FilterBar").$$render($$result, {}, {}, {})} ${``} <section class="max-w-[var(--max-width)] mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 svelte-1821nki">${each(filteredData, (object) => {
    return `${validate_component(Card, "Card").$$render($$result, { object }, {}, {})}`;
  })} </section>`;
});
export {
  Page as default
};
