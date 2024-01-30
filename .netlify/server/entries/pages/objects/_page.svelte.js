import { c as create_ssr_component, i as createEventDispatcher, a as add_attribute, e as escape, d as subscribe, f as each, v as validate_component } from "../../../chunks/ssr.js";
import { i as isFullFilterVisible } from "../../../chunks/store.js";
/* empty css                                                         */
/* empty css                                                     */
import "@contentful/rich-text-html-renderer";
import "../../../chunks/Svg.svelte_svelte_type_style_lang.js";
import "canvas-confetti";
const css$3 = {
  code: "figure.svelte-xsk0zz.svelte-xsk0zz{box-shadow:0 0 10px 0 #e6f4fa;height:900px;display:flex;flex-direction:column}.card.svelte-xsk0zz.svelte-xsk0zz{box-shadow:0 0 10px 0 #e6f4fa;width:100%;height:850px;display:flex;flex-direction:column;overflow:hidden;background-color:#111827}.card.svelte-xsk0zz img.svelte-xsk0zz{height:600px;object-fit:cover;width:100%}.card.svelte-xsk0zz.svelte-xsk0zz:hover{transform:scale(1.02);transition:transform 0.3s ease}.card.svelte-xsk0zz figcaption.svelte-xsk0zz{padding:10px;flex-grow:1;display:flex;flex-direction:column;justify-content:space-between}.flex.justify-between.mt-4.svelte-xsk0zz.svelte-xsk0zz{display:flex;justify-content:space-between;flex-wrap:wrap}@media(max-width: 2300px){.flex.justify-between.mt-4.svelte-xsk0zz.svelte-xsk0zz{flex-direction:column}.flex.justify-between.mt-4.svelte-xsk0zz button.svelte-xsk0zz,.flex.justify-between.mt-4.svelte-xsk0zz a.svelte-xsk0zz{width:100%;margin-bottom:10px}}@media(max-width: 640px){.card.svelte-xsk0zz.svelte-xsk0zz{width:100%;height:auto}.card.svelte-xsk0zz img.svelte-xsk0zz{height:100%}}",
  map: null
};
const Card = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { object } = $$props;
  createEventDispatcher();
  if ($$props.object === void 0 && $$bindings.object && object !== void 0)
    $$bindings.object(object);
  $$result.css.add(css$3);
  return `<figure class="card shadow-lg cursor-pointer  svelte-xsk0zz">${object.photo ? `<div class="w-full h-96 overflow-hidden relative"><img${add_attribute("src", object.photo.url, 0)}${add_attribute("alt", object.photo.description, 0)} class="w-full h-full object-cover transition duration-300 ease-in-out svelte-xsk0zz"> <img${add_attribute("src", object.altPhoto.url, 0)} alt="Alternate Photo" class="absolute top-0 left-0 w-full h-full object-cover opacity-0 hover:opacity-100 transition duration-300 ease-in-out svelte-xsk0zz"></div> <figcaption class="text-left p-4 svelte-xsk0zz"><h1 class="h1 text-3xl font-bold mb-3">${escape(object.name)}</h1> <p class="text-lg">Город: ${escape(object.city)}</p> <p class="text-lg">Площадь: ${escape(object.area)} м²</p> <p class="text-lg">Cпальни: ${escape(object.bedrooms)}</p> <p class="text-lg">Этаж: ${escape(object.floor)} из ${escape(object.maxFloor)}</p> <p class="text-lg">Лифт: ${escape(object.elevator ? "Есть" : "Нет")}</p> <h2 class="text-2xl font-bold mb-3">Цена:${escape(object.price)} €</h2> <div class="flex justify-between mt-4 svelte-xsk0zz"><button type="button" class="text-white bg-gradient-to-r from-cyan-500 via-cyan-600 to-cyan-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-cyan-400 dark:focus:ring-cyan-900 shadow-lg shadow-cyan-500/50 dark:shadow-lg dark:shadow-cyan-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 svelte-xsk0zz" data-svelte-h="svelte-13r5gte">Подробнее</button> <a${add_attribute("href", `/objects/${object.slug}`, 0)} target="_blank" class="text-white bg-gradient-to-r from-cyan-500 via-cyan-600 to-cyan-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-cyan-400 dark:focus:ring-cyan-900 shadow-lg shadow-cyan-500/50 dark:shadow-lg dark:shadow-cyan-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 svelte-xsk0zz">Открыть в новой вкладке</a></div></figcaption>` : ``} </figure>`;
});
const css$2 = {
  code: ".sort-modal.svelte-soyqh3.svelte-soyqh3{position:absolute;z-index:101111!important;background-color:#111827;color:#fff;top:3%;right:20%;padding:20px;border-radius:8px;border:1px solid #e6f4fa;box-shadow:0px 4px 6px rgba(0, 0, 0, 0.1);width:auto;overflow:hidden;transition:height 0.1s ease-in-out}.sort-option.svelte-soyqh3.svelte-soyqh3{display:grid;grid-template-columns:120px repeat(3, 1fr);gap:8px;align-items:center;margin-bottom:15px}.sort-option.svelte-soyqh3>div.svelte-soyqh3{white-space:nowrap}.sort-option.svelte-soyqh3>div.svelte-soyqh3:first-child{white-space:nowrap;margin-right:10px}.sort-option.svelte-soyqh3 button.svelte-soyqh3{min-width:40px;height:40px;border:1px solid #ddd;border-radius:4px;background-color:transparent;cursor:pointer;transition:background-color 0.1s}.sort-option.svelte-soyqh3 button.svelte-soyqh3:hover,.sort-option.svelte-soyqh3 button.active.svelte-soyqh3{background-color:#007bff;color:white}.sort-option.svelte-soyqh3 button.svelte-soyqh3:nth-child(2),.sort-option.svelte-soyqh3 button.svelte-soyqh3:nth-child(3),.sort-option.svelte-soyqh3 button.svelte-soyqh3:nth-child(4){width:40px}.sort-option.svelte-soyqh3 button.active.svelte-soyqh3{background-color:#007bff;color:white}@media(max-width: 600px){.sort-modal.svelte-soyqh3.svelte-soyqh3{width:90%;left:5%}}",
  map: null
};
const SortModal = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { showSortModal: showSortModal2 = false } = $$props;
  let { applySort } = $$props;
  let sortModal;
  if ($$props.showSortModal === void 0 && $$bindings.showSortModal && showSortModal2 !== void 0)
    $$bindings.showSortModal(showSortModal2);
  if ($$props.applySort === void 0 && $$bindings.applySort && applySort !== void 0)
    $$bindings.applySort(applySort);
  $$result.css.add(css$2);
  return `${showSortModal2 ? `<div class="sort-modal svelte-soyqh3"${add_attribute("this", sortModal, 0)}><div data-svelte-h="svelte-4qiqsu">Сортировать по:</div> <div class="sort-option svelte-soyqh3"><div class="svelte-soyqh3" data-svelte-h="svelte-1vkvq1c">Цена</div> <button class="${["svelte-soyqh3", ""].join(" ").trim()}" data-svelte-h="svelte-1bcw2bv">↑</button> <button class="${["svelte-soyqh3", ""].join(" ").trim()}" data-svelte-h="svelte-grtx6r">↓</button> <button class="svelte-soyqh3" data-svelte-h="svelte-1tv391i">X</button></div> <div class="sort-option svelte-soyqh3"><div class="svelte-soyqh3" data-svelte-h="svelte-1g3yqdf">Площадь</div> <button class="${["svelte-soyqh3", ""].join(" ").trim()}" data-svelte-h="svelte-jygrlp">↑</button> <button class="${["svelte-soyqh3", ""].join(" ").trim()}" data-svelte-h="svelte-nf573p">↓</button> <button class="svelte-soyqh3" data-svelte-h="svelte-7lyydy">X</button></div> <div class="sort-option svelte-soyqh3"><div class="svelte-soyqh3" data-svelte-h="svelte-tcpotv">Этаж</div> <button class="${["svelte-soyqh3", ""].join(" ").trim()}" data-svelte-h="svelte-1d9tl6n">↑</button> <button class="${["svelte-soyqh3", ""].join(" ").trim()}" data-svelte-h="svelte-i1ckyh">↓</button> <button class="svelte-soyqh3" data-svelte-h="svelte-9ripq9">X</button></div></div>` : ``}`;
});
const css$1 = {
  code: '.filter-button.svelte-164mzsk.svelte-164mzsk{height:60px;width:200px;white-space:normal;text-align:center;border:white 1px solid;outline:none;box-shadow:0 0 5px 0 #e6f4fa;transition:background-color 0.2s, color 0.2s}.filter-bar.svelte-164mzsk input.svelte-164mzsk,.filter-bar.svelte-164mzsk select.svelte-164mzsk{background-color:#030005;color:white}.filter-bar.svelte-164mzsk button.svelte-164mzsk{height:100%;width:120px;white-space:normal;text-align:center}.btn-group.svelte-164mzsk.svelte-164mzsk{border-radius:0px;padding-top:2px;padding-bottom:4px;margin-top:-2px}.filter-bar.svelte-164mzsk button.svelte-164mzsk{border:white 1px solid;outline:none;box-shadow:0 0 5px 0 #e6f4fa;transition:background-color 0.2s, color 0.2s;background-image:linear-gradient(to right, var(--tw-gradient-stops))}.filter-bar.svelte-164mzsk button.svelte-164mzsk:hover,.filter-bar.svelte-164mzsk button.svelte-164mzsk:focus{color:white}.btn-group.svelte-164mzsk .filter-button.svelte-164mzsk{margin:0 5px;box-shadow:0 0 5px 0 #e6f4fa;transition:transform 0.3s ease, box-shadow 0.3s ease}.btn-group.svelte-164mzsk .filter-button.svelte-164mzsk:hover,.btn-group.svelte-164mzsk .filter-button.svelte-164mzsk:focus{transform:translateY(-2px);box-shadow:0px 6px 8px rgba(0, 0, 0, 0.25)}.filter-bar.svelte-164mzsk button.svelte-164mzsk:focus{background-color:inherit;color:white}.dropdown-button.svelte-164mzsk .icon-arrow-down.svelte-164mzsk{display:inline-block;margin-left:5px}.dropdown-button.svelte-164mzsk.svelte-164mzsk:hover{background:none}.dropdown-button.active.svelte-164mzsk .icon-arrow-down.svelte-164mzsk{transform:rotate(180deg);transition:transform 0.3s ease}.dropdown-button.svelte-164mzsk .icon-arrow-down.svelte-164mzsk{transform:rotate(0deg);transition:transform 0.3s ease}.dropdown-button.active.svelte-164mzsk .icon-arrow-down.svelte-164mzsk{transform:rotate(180deg)}.filter-bar.svelte-164mzsk.svelte-164mzsk{z-index:1;background-color:#030005;border-bottom:1px solid #495361}.btn-group.svelte-164mzsk .filter-button.svelte-164mzsk{position:relative;z-index:2}.filter-box.svelte-164mzsk.svelte-164mzsk{border-radius:10px;padding:10px;background-color:#051518;color:white;border:1px solid #e6f4fa;box-shadow:0 0 5px 0 #e6f4fa}.filter-button-text.svelte-164mzsk.svelte-164mzsk{font-size:medium}.filter-button-text-xs.svelte-164mzsk.svelte-164mzsk{font-size:12px;line-height:0.01rem!important}@media(max-width: 1024px){.filter-bar.svelte-164mzsk input[type="number"].svelte-164mzsk,.filter-bar.svelte-164mzsk .relative.svelte-164mzsk{display:none}}@media(max-width: 920px){.filter-bar.svelte-164mzsk button.svelte-164mzsk{width:60px}}@media(max-width: 670px){.filter-bar.svelte-164mzsk.svelte-164mzsk{flex-wrap:wrap;justify-content:center}.btn-group.svelte-164mzsk.svelte-164mzsk{width:100%;display:flex;justify-content:center}.filter-bar.svelte-164mzsk>.svelte-164mzsk{flex-basis:100%;margin-bottom:10px}.filter-bar.svelte-164mzsk button.svelte-164mzsk{flex-basis:auto}}@media(max-width: 480px){.filter-bar.svelte-164mzsk.svelte-164mzsk{align-items:center}.filter-bar.svelte-164mzsk select.svelte-164mzsk{width:100%}}',
  map: null
};
const FilterBar = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $isFullFilterVisible, $$unsubscribe_isFullFilterVisible;
  $$unsubscribe_isFullFilterVisible = subscribe(isFullFilterVisible, (value) => $isFullFilterVisible = value);
  createEventDispatcher();
  let bedrooms = "";
  const types = ["Аппартамент", "Мезонит", "Дом", "Гараж", "Вилла"];
  const cities = ["Бяла", "Обзор", "Равда", "Солнечный берег", "Святой Влас", "Золотые пески"];
  $$result.css.add(css$1);
  $$unsubscribe_isFullFilterVisible();
  return `${!$isFullFilterVisible ? `<div class="filter-bar flex flex-wrap gap-2 p-2 text-white bg-[#1f2937] mb-5 content-center justify-center svelte-164mzsk"><select class="p-2 filter-box svelte-164mzsk"><option value="" data-svelte-h="svelte-1aiou29">Выберите город</option>${each(cities, (city) => {
    return `<option${add_attribute("value", city, 0)}>${escape(city)}</option>`;
  })}</select> <select class="p-2 filter-box svelte-164mzsk"><option value="" data-svelte-h="svelte-zzsi0j">Выберите тип</option>${each(types, (type) => {
    return `<option${add_attribute("value", type, 0)}>${escape(type)}</option>`;
  })}</select> <input type="number" placeholder="Кол-во спален" class="p-2 bg-gray-800 text-white filter-box svelte-164mzsk"${add_attribute("value", bedrooms, 0)}> <div class="relative svelte-164mzsk"><button class="${"price-button p-2 dropdown-button " + escape("", true) + " svelte-164mzsk"}">${`<span class="filter-button-text svelte-164mzsk" data-svelte-h="svelte-1g4lc6g">Цена</span> <span class="icon-arrow-down svelte-164mzsk" data-svelte-h="svelte-11oc2as">▼</span>`}</button> ${``}</div> <div class="relative svelte-164mzsk"><button class="${"area-button p-2 dropdown-button " + escape("", true) + " svelte-164mzsk"}">${`<span class="filter-button-text svelte-164mzsk" data-svelte-h="svelte-t4ov9n">Площадь</span> <span class="icon-arrow-down svelte-164mzsk" data-svelte-h="svelte-11oc2as">▼</span>`}</button> ${``}</div> <div class="relative svelte-164mzsk"><button class="${"floor-button p-2 dropdown-button " + escape("", true) + " svelte-164mzsk"}">${`<span class="filter-button-text svelte-164mzsk" data-svelte-h="svelte-1qm0avp">Этаж</span> <span class="icon-arrow-down svelte-164mzsk" data-svelte-h="svelte-11oc2as">▼</span>`}</button> ${``}</div> <div class="btn-group variant-ghost-tetriary [&>*+*]:border-white-500 svelte-164mzsk"><button class="filter-button svelte-164mzsk">${`Применить фильтры`}</button> <button class="filter-button svelte-164mzsk">${`Полные фильтры`}</button> <button class="filter-button svelte-164mzsk">${`Сбросить фильтры`}</button> <button class="filter-button svelte-164mzsk">${`Сортировка`}</button> ${``}</div></div>` : ``}`;
});
const css = {
  code: "section.svelte-1krnnau{display:grid;margin-top:50px;gap:30px;padding:10px}",
  map: null
};
let showSortModal = false;
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { data } = $$props;
  let filteredData = data.objects;
  console.log("Данные объектов:", data.objects);
  let sortOptions = {};
  let lastFilterOptions = {};
  data.objects.length;
  function handleFilter(event, sortOptions2 = {}) {
    lastFilterOptions = event ? event.detail : lastFilterOptions;
    const { city, price, type, bedrooms, elevator, area, bathrooms, pool, parking, fromBuilder, minPrice, maxPrice, minArea, maxArea, minFloor, maxFloorValue, heat, security, conserj, video, fitness, restoraunts, playground, tv, internet } = event.detail;
    console.log("Received filter event with details:", event.detail);
    filteredData = data.objects.filter((object) => {
      let priceNum = price ? parseInt(price, 10) : null;
      let bedroomsNum = bedrooms ? parseInt(bedrooms, 10) : null;
      let areaNum = area ? parseInt(area, 10) : null;
      let bathroomsNum = bathrooms ? parseInt(bathrooms, 10) : null;
      let matchesPrice = (minPrice === void 0 || object.price >= minPrice) && (maxPrice === void 0 || object.price <= maxPrice);
      let matchesArea = (minArea === void 0 || object.area >= minArea) && (maxArea === void 0 || object.area <= maxArea);
      let matchesFloor = (minFloor === void 0 || object.floor >= minFloor) && (maxFloorValue === void 0 || object.floor <= maxFloorValue);
      let matchesCity = !city || object.city === city;
      let matchesType = !type || object.type === type;
      let matchesBedrooms = bedroomsNum === null || object.bedrooms === bedroomsNum;
      let matchesElevator = elevator === void 0 || object.elevator === elevator;
      let matchesBathrooms = bathroomsNum === null || object.bathrooms === bathroomsNum;
      let matchesPool = pool === void 0 || object.pool === pool;
      let matchesParking = !parking || object.parking === parking;
      let matchesFromBuilder = fromBuilder === void 0 || object.fromBuilder === fromBuilder;
      let matchesHeating = heat === void 0 || object.heat === heat;
      let matchesSecurity = security === void 0 || object.security === security;
      let matchesConserj = conserj === void 0 || object.conserj === conserj;
      let matchesVideo = video === void 0 || object.video === video;
      let matchesFitness = fitness === void 0 || object.fitness === fitness;
      let matchesRestoraunts = restoraunts === void 0 || object.restoraunts === restoraunts;
      let matchesPlayground = playground === void 0 || object.playground === playground;
      let matchesTv = tv === void 0 || object.tv === tv;
      let matchesInternet = internet === void 0 || object.internet === internet;
      console.log(`Object ${object.name} filter match results:`, {
        matchesCity,
        matchesType,
        matchesPrice,
        matchesBedrooms,
        matchesElevator,
        matchesArea,
        matchesBathrooms,
        matchesPool,
        matchesParking,
        matchesFromBuilder,
        matchesFloor,
        matchesHeating,
        matchesSecurity,
        matchesConserj,
        matchesVideo,
        matchesFitness,
        matchesRestoraunts,
        matchesPlayground,
        matchesTv,
        matchesInternet
      });
      console.log(`Price filter value: ${priceNum}, Area filter value: ${areaNum}`);
      console.log(`Matches price: ${matchesPrice}, Matches area: ${matchesArea}`);
      return matchesCity && matchesType && matchesPrice && matchesBedrooms && matchesElevator && matchesArea && matchesBathrooms && matchesPool && matchesParking && matchesHeating && matchesFloor && matchesFromBuilder && matchesHeating && matchesSecurity && matchesConserj && matchesVideo && matchesFitness && matchesRestoraunts && matchesPlayground && matchesTv && matchesInternet;
    });
    filteredData.sort((a, b) => {
    });
    applySorting(sortOptions2);
    console.log("Filtered and sorted data:", filteredData);
  }
  function applySorting(sortOptions2) {
    filteredData.sort((a, b) => {
      let result = 0;
      if (sortOptions2.price) {
        result = sortOptions2.price === "asc" ? a.price - b.price : b.price - a.price;
        if (result !== 0)
          return result;
      }
      if (sortOptions2.area) {
        let areaA = parseFloat(a.area);
        let areaB = parseFloat(b.area);
        result = sortOptions2.area === "asc" ? areaA - areaB : areaB - areaA;
        if (result !== 0)
          return result;
      }
      if (sortOptions2.floor) {
        let floorA = parseFloat(a.floor);
        let floorB = parseFloat(b.floor);
        result = sortOptions2.floor === "asc" ? floorA - floorB : floorB - floorA;
      }
      return result;
    });
  }
  function applySort(newSortOptions) {
    sortOptions = newSortOptions;
    handleFilter({ detail: lastFilterOptions }, sortOptions);
  }
  if ($$props.data === void 0 && $$bindings.data && data !== void 0)
    $$bindings.data(data);
  $$result.css.add(css);
  return `${$$result.head += `<!-- HEAD_svelte-tiloj_START -->${$$result.title = `<title>Купить Квартиру в Обзоре, Бяле, Равде, Солнечном берегу, Золотых песках, Святом Власе | Sea Real Estate</title>`, ""}<meta name="description" content="Ищете квартиру в Обзоре, Бяле или Равде? Золотых песках, на Солнечном берегу или Святом Власе? Обширный выбор недвижимости от Sea Real Estate. Охраняемые комплексы, бассейны, фитнес и многое другое"><!-- HEAD_svelte-tiloj_END -->`, ""} ${validate_component(FilterBar, "FilterBar").$$render($$result, {}, {}, {})} ${validate_component(SortModal, "SortModal").$$render($$result, { showSortModal, applySort }, {}, {})} ${``} <section class="max-w-[var(--max-width)] mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 svelte-1krnnau">${each(filteredData, (object) => {
    return `${validate_component(Card, "Card").$$render($$result, { object }, {}, {})}`;
  })} </section>`;
});
export {
  Page as default
};
