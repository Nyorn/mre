import { c as create_ssr_component, a as add_attribute, e as escape, f as subscribe, d as each, v as validate_component, j as compute_rest_props, k as spread, l as escape_attribute_value, o as escape_object, p as onDestroy, h as setContext } from "../../chunks/ssr.js";
import { m as modalStack, l as loading } from "../../chunks/store.js";
import { F as FeedbackForm } from "../../chunks/FeedbackForm.js";
/* empty css                                                  */
import { documentToHtmlString } from "@contentful/rich-text-html-renderer";
import "../../chunks/Svg.svelte_svelte_type_style_lang.js";
import "canvas-confetti";
/* empty css                                                      */
/* empty css                                                   */
const globals = typeof window !== "undefined" ? window : typeof globalThis !== "undefined" ? globalThis : (
  // @ts-ignore Node typings have this
  global
);
const css$8 = {
  code: ".content.svelte-30rpqj{position:relative;background:darkgray;max-height:90vh;overflow-y:scroll;border-radius:10px}.map.svelte-30rpqj{margin-top:20px;margin-bottom:20px}.object-card-modal.svelte-30rpqj{position:relative;background-image:radial-gradient(at 100% 0%, rgba(var(--color-secondary-500) / 0.33) 0px, transparent 50%), radial-gradient(at 2% 1%, rgba(var(--color-error-500) / 0.33) 0px, transparent 50%);background-color:rgb(var(--color-surface-900));max-width:1840px;padding:20px;display:grid;grid-template-columns:repeat(1, 1fr);gap:20px}iframe.svelte-30rpqj{margin-top:20px;border-radius:15px;width:100%;max-width:400px;height:400px}.close-button.svelte-30rpqj{display:block;margin:10px auto 20px;width:fit-content;padding:10px 20px;color:white;border:none;border-radius:5px;cursor:pointer}@media(min-width: 768px){.object-card-modal.svelte-30rpqj{grid-template-columns:repeat(2, 1fr)}}",
  map: null
};
const ObjectCardModal = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let htmlDescription;
  let { object } = $$props;
  console.log("Object in ObjectCardModal:", object);
  console.log(object);
  if ($$props.object === void 0 && $$bindings.object && object !== void 0)
    $$bindings.object(object);
  $$result.css.add(css$8);
  htmlDescription = object?.description ? documentToHtmlString(object.description.json) : "";
  return `${object ? `<div class="content svelte-30rpqj"><div class="object-card-modal grid grid-cols-1 md:grid-cols-2 gap-4 p-4 svelte-30rpqj"><div>${`<img${add_attribute("src", object.photo.url, 0)}${add_attribute("alt", object.photo.description, 0)} class="w-full h-auto rounded-lg">`}</div> <div class="p-5 space-y-5"><h1 class="text-2xl font-bold">${escape(object.name)}</h1> <p>Город: ${escape(object.city)}</p> <p>Площадь: ${escape(object.area)}</p> <p>Спальни: ${escape(object.bedrooms)}</p> <p>Этаж: ${escape(object.floor)} из ${escape(object.maxFloor)}</p> <p>Лифт: ${escape(object.elevator ? "Есть" : "Нет")}</p> <p>Цена: ${escape(object.price)}</p> <button class="variant-ghost-tertiary p-2 bg-indigo-600 text-white rounded" data-svelte-h="svelte-dfu8al">Заказать осмотр</button> <p class="descr text-base md:text-lg"><!-- HTML_TAG_START -->${htmlDescription}<!-- HTML_TAG_END --></p> <div class="mt-115 map svelte-30rpqj"><iframe width="400" height="400" title="Map" margin-top="115px" frameborder="0" scrolling="no" marginheight="0" marginwidth="0" src="${"https://maps.google.com/maps?q=" + escape(object.location.lat, true) + "," + escape(object.location.lon, true) + "&z=12&output=embed"}" class="svelte-30rpqj"></iframe></div> <button class="mt-4 px-4 py-2 variant-ghost-tertiary p-2 bg-indigo-600 text-white rounded shadow close-button svelte-30rpqj" data-svelte-h="svelte-1o3rqje">Закрыть</button></div></div></div>` : `<p data-svelte-h="svelte-10w9fw7">Данные объекта не доступны.</p>`}`;
});
const css$7 = {
  code: ".modal.svelte-yhxszn.svelte-yhxszn{top:0;left:0;width:100%;height:100%;background-color:rgba(0, 0, 0, 0.5);display:flex;align-items:center;justify-content:center;z-index:1000}.modal.svelte-yhxszn .image-container.svelte-yhxszn{position:relative;display:flex;align-items:center}.modal.svelte-yhxszn .image.svelte-yhxszn{max-width:100%;max-height:100%;object-fit:contain}.modal.svelte-yhxszn .previous.svelte-yhxszn,.modal.svelte-yhxszn .next.svelte-yhxszn{position:absolute;top:50%;transform:translateY(-50%);background:none;border:none;color:white;font-size:24px;cursor:pointer;padding:0 15px}.modal.svelte-yhxszn .previous.svelte-yhxszn{left:0}.modal.svelte-yhxszn .next.svelte-yhxszn{right:0}",
  map: null
};
let hidden = false;
const ImageViewer = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { imageUrl } = $$props;
  let { images = [] } = $$props;
  let { currentIndex } = $$props;
  console.log("Current images array:", images);
  console.log("Current index:", currentIndex);
  console.log("Hidden state:", hidden);
  if ($$props.imageUrl === void 0 && $$bindings.imageUrl && imageUrl !== void 0)
    $$bindings.imageUrl(imageUrl);
  if ($$props.images === void 0 && $$bindings.images && images !== void 0)
    $$bindings.images(images);
  if ($$props.currentIndex === void 0 && $$bindings.currentIndex && currentIndex !== void 0)
    $$bindings.currentIndex(currentIndex);
  $$result.css.add(css$7);
  {
    if (images && images.length > 0 && typeof currentIndex === "number" && images[currentIndex]) {
      imageUrl = images[currentIndex];
    }
  }
  return `${imageUrl ? `<div class="modal svelte-yhxszn"><div class="image-container svelte-yhxszn"><button class="previous svelte-yhxszn" data-svelte-h="svelte-1u9ijcr">←</button> <img${add_attribute("src", imageUrl, 0)} alt="Full Size Image" class="image svelte-yhxszn"> <button class="next svelte-yhxszn" data-svelte-h="svelte-1xc4gjt">→</button></div></div>` : `<p data-svelte-h="svelte-1m0pz9w">No image URL provided or modal is hidden.</p>`}`;
});
const css$6 = {
  code: ".modal-overlay.svelte-1ba0njm{position:fixed;inset:0;display:flex;justify-content:center;align-items:center;background-color:rgba(0, 0, 0, 0.5);z-index:1000}.modal-window.svelte-1ba0njm{position:absolute;margin:auto;border-radius:18px;z-index:1001}.close-button.svelte-1ba0njm{position:absolute;top:1rem;right:1rem;color:black;border:none}.close-button.svelte-1ba0njm:hover{cursor:pointer;background:transparent}.modal-window-full-image.svelte-1ba0njm{position:fixed;margin:auto;border-radius:8px;z-index:1002}",
  map: null
};
const Modal = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $modalStack, $$unsubscribe_modalStack;
  $$unsubscribe_modalStack = subscribe(modalStack, (value) => $modalStack = value);
  $$result.css.add(css$6);
  $$unsubscribe_modalStack();
  return `  ${$modalStack.length > 0 ? `<div class="modal-overlay svelte-1ba0njm">${each($modalStack, (modalItem) => {
    return `<div class="modal-window svelte-1ba0njm">${modalItem.type === "feedback" ? `${validate_component(FeedbackForm, "FeedbackForm").$$render(
      $$result,
      {
        objectName: modalItem.data.objectName || ""
      },
      {},
      {}
    )}` : `${modalItem.type === "objectCard" ? `${validate_component(ObjectCardModal, "ObjectCardModal").$$render($$result, { object: modalItem.data }, {}, {})}` : `${modalItem.type === "imageView" ? `<div class="modal-overlay svelte-1ba0njm"><div class="image-viewer modal-window-full-image flex justify-center items-center svelte-1ba0njm">${modalItem.data && modalItem.data.images && typeof modalItem.data.currentIndex === "number" ? `${validate_component(ImageViewer, "ImageViewer").$$render(
      $$result,
      {
        imageUrl: modalItem.data.imageUrl,
        images: modalItem.data.images,
        currentIndex: modalItem.data.currentIndex
      },
      {},
      {}
    )}` : `<p data-svelte-h="svelte-1i1xmgr">Error: Missing data for imageView</p>`}</div> </div>` : ``}`}`} <button class="close-button text-gray-700 hover:text-gray-900 svelte-1ba0njm"><svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button> </div>`;
  })}</div>` : ``}`;
});
const Raw = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let cursor = 870711;
  function getId() {
    cursor += 1;
    return `fa-${cursor.toString(16)}`;
  }
  let raw = "";
  let { data } = $$props;
  function getRaw(data2) {
    if (!data2 || !data2.raw) {
      return "";
    }
    let rawData = data2.raw;
    const ids = {};
    rawData = rawData.replace(/\s(?:xml:)?id=["']?([^"')\s]+)/g, (match, id) => {
      const uniqueId = getId();
      ids[id] = uniqueId;
      return ` id="${uniqueId}"`;
    });
    rawData = rawData.replace(/#(?:([^'")\s]+)|xpointer\(id\((['"]?)([^')]+)\2\)\))/g, (match, rawId, _, pointerId) => {
      const id = rawId || pointerId;
      if (!id || !ids[id]) {
        return match;
      }
      return `#${ids[id]}`;
    });
    return rawData;
  }
  if ($$props.data === void 0 && $$bindings.data && data !== void 0)
    $$bindings.data(data);
  raw = getRaw(data);
  return `<g><!-- HTML_TAG_START -->${raw}<!-- HTML_TAG_END --></g>`;
});
const css$5 = {
  code: ".fa-icon.svelte-1mc5hvj{display:inline-block;fill:currentColor}.fa-flip-horizontal.svelte-1mc5hvj{transform:scale(-1, 1)}.fa-flip-vertical.svelte-1mc5hvj{transform:scale(1, -1)}.fa-spin.svelte-1mc5hvj{animation:svelte-1mc5hvj-fa-spin 1s 0s infinite linear}.fa-inverse.svelte-1mc5hvj{color:#fff}.fa-pulse.svelte-1mc5hvj{animation:svelte-1mc5hvj-fa-spin 1s infinite steps(8)}@keyframes svelte-1mc5hvj-fa-spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}",
  map: null
};
const Svg = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["class", "width", "height", "box", "spin", "inverse", "pulse", "flip", "style", "label"]);
  let { class: className = "" } = $$props;
  let { width } = $$props;
  let { height } = $$props;
  let { box = "0 0 0 0" } = $$props;
  let { spin = false } = $$props;
  let { inverse = false } = $$props;
  let { pulse = false } = $$props;
  let { flip = "none" } = $$props;
  let { style = "" } = $$props;
  let { label = "" } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className !== void 0)
    $$bindings.class(className);
  if ($$props.width === void 0 && $$bindings.width && width !== void 0)
    $$bindings.width(width);
  if ($$props.height === void 0 && $$bindings.height && height !== void 0)
    $$bindings.height(height);
  if ($$props.box === void 0 && $$bindings.box && box !== void 0)
    $$bindings.box(box);
  if ($$props.spin === void 0 && $$bindings.spin && spin !== void 0)
    $$bindings.spin(spin);
  if ($$props.inverse === void 0 && $$bindings.inverse && inverse !== void 0)
    $$bindings.inverse(inverse);
  if ($$props.pulse === void 0 && $$bindings.pulse && pulse !== void 0)
    $$bindings.pulse(pulse);
  if ($$props.flip === void 0 && $$bindings.flip && flip !== void 0)
    $$bindings.flip(flip);
  if ($$props.style === void 0 && $$bindings.style && style !== void 0)
    $$bindings.style(style);
  if ($$props.label === void 0 && $$bindings.label && label !== void 0)
    $$bindings.label(label);
  $$result.css.add(css$5);
  return `<svg${spread(
    [
      { version: "1.1" },
      {
        class: "fa-icon " + escape(className, true)
      },
      { width: escape_attribute_value(width) },
      { height: escape_attribute_value(height) },
      {
        "aria-label": escape_attribute_value(label)
      },
      {
        role: escape_attribute_value(label ? "img" : "presentation")
      },
      { viewBox: escape_attribute_value(box) },
      { style: escape_attribute_value(style) },
      escape_object($$restProps)
    ],
    {
      classes: (spin ? "fa-spin" : "") + " " + (pulse ? "fa-pulse" : "") + " " + (inverse ? "fa-inverse" : "") + " " + (flip === "horizontal" ? "fa-flip-horizontal" : "") + " " + (flip === "vertical" ? "fa-flip-vertical" : "") + " svelte-1mc5hvj"
    }
  )}>${slots.default ? slots.default({}) : ``}</svg>`;
});
const { Object: Object_1 } = globals;
let outerScale = 1;
function normaliseData(data) {
  let name;
  let iconData;
  if (!data) {
    return void 0;
  } else if ("definition" in data) {
    console.error("`import faIconName from '@fortawesome/package-name/faIconName` not supported - Please use `import { faIconName } from '@fortawesome/package-name/faIconName'` instead");
    return void 0;
  } else if ("iconName" in data && "icon" in data) {
    name = data.iconName;
    const [width, height, , , path] = data.icon;
    const paths = Array.isArray(path) ? path : [path];
    iconData = {
      width,
      height,
      paths: paths.map((path2) => {
        return { d: path2 };
      })
    };
  } else {
    name = Object.keys(data)[0];
    iconData = data[name];
  }
  return iconData;
}
const Icon = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["class", "data", "scale", "spin", "inverse", "pulse", "flip", "label", "style"]);
  let { class: className = "" } = $$props;
  let { data } = $$props;
  let iconData;
  let { scale = 1 } = $$props;
  let { spin = false } = $$props;
  let { inverse = false } = $$props;
  let { pulse = false } = $$props;
  let { flip = void 0 } = $$props;
  let { label = "" } = $$props;
  let { style = "" } = $$props;
  let width = 10;
  let height = 10;
  let combinedStyle;
  let box;
  function normalisedScale() {
    let numScale = 1;
    if (typeof scale !== "undefined") {
      numScale = Number(scale);
    }
    if (isNaN(numScale) || numScale <= 0) {
      console.warn('Invalid prop: prop "scale" should be a number over 0.');
      return outerScale;
    }
    return numScale * outerScale;
  }
  function calculateBox() {
    if (iconData) {
      return `0 0 ${iconData.width} ${iconData.height}`;
    }
    return `0 0 ${width} ${height}`;
  }
  function calculateRatio() {
    if (!iconData) {
      return 1;
    }
    return Math.max(iconData.width, iconData.height) / 16;
  }
  function calculateWidth() {
    if (iconData) {
      return iconData.width / calculateRatio() * normalisedScale();
    }
    return 0;
  }
  function calculateHeight() {
    if (iconData) {
      return iconData.height / calculateRatio() * normalisedScale();
    }
    return 0;
  }
  function calculateStyle() {
    let combined = "";
    if (style !== null) {
      combined += style;
    }
    let size = normalisedScale();
    if (size === 1) {
      if (combined.length === 0) {
        return "";
      }
      return combined;
    }
    if (combined !== "" && !combined.endsWith(";")) {
      combined += "; ";
    }
    return `${combined}font-size: ${size}em`;
  }
  if ($$props.class === void 0 && $$bindings.class && className !== void 0)
    $$bindings.class(className);
  if ($$props.data === void 0 && $$bindings.data && data !== void 0)
    $$bindings.data(data);
  if ($$props.scale === void 0 && $$bindings.scale && scale !== void 0)
    $$bindings.scale(scale);
  if ($$props.spin === void 0 && $$bindings.spin && spin !== void 0)
    $$bindings.spin(spin);
  if ($$props.inverse === void 0 && $$bindings.inverse && inverse !== void 0)
    $$bindings.inverse(inverse);
  if ($$props.pulse === void 0 && $$bindings.pulse && pulse !== void 0)
    $$bindings.pulse(pulse);
  if ($$props.flip === void 0 && $$bindings.flip && flip !== void 0)
    $$bindings.flip(flip);
  if ($$props.label === void 0 && $$bindings.label && label !== void 0)
    $$bindings.label(label);
  if ($$props.style === void 0 && $$bindings.style && style !== void 0)
    $$bindings.style(style);
  let $$settled;
  let $$rendered;
  let previous_head = $$result.head;
  do {
    $$settled = true;
    $$result.head = previous_head;
    {
      {
        iconData = normaliseData(data);
        width = calculateWidth();
        height = calculateHeight();
        combinedStyle = calculateStyle();
        box = calculateBox();
      }
    }
    $$rendered = `${validate_component(Svg, "Svg").$$render($$result, Object_1.assign({}, { label }, { width }, { height }, { box }, { style: combinedStyle }, { spin }, { flip }, { inverse }, { pulse }, { class: className }, $$restProps), {}, {
      default: () => {
        return `${slots.default ? slots.default({}) : ` ${each(iconData?.paths || [], (path) => {
          return `<path${spread([escape_object(path)], {})}></path>`;
        })} ${each(iconData?.polygons || [], (polygon) => {
          return `<polygon${spread([escape_object(polygon)], {})}></polygon>`;
        })} ${iconData?.raw ? `${validate_component(Raw, "Raw").$$render(
          $$result,
          { data: iconData },
          {
            data: ($$value) => {
              iconData = $$value;
              $$settled = false;
            }
          },
          {}
        )}` : ``} `}`;
      }
    })}   `;
  } while (!$$settled);
  return $$rendered;
});
const instagram = {
  instagram: {
    width: 1536,
    height: 1792,
    paths: [
      {
        d: "M1024 896q0-106-75-181t-181-75-181 75-75 181 75 181 181 75 181-75 75-181zM1162 896q0 164-115 279t-279 115-279-115-115-279 115-279 279-115 279 115 115 279zM1270 486q0 38-27 65t-65 27-65-27-27-65 27-65 65-27 65 27 27 65zM768 266q-7 0-76.5-0.5t-105.5 0-96.5 3-103 10-71.5 18.5q-50 20-88 58t-58 88q-11 29-18.5 71.5t-10 103-3 96.5 0 105.5 0.5 76.5-0.5 76.5 0 105.5 3 96.5 10 103 18.5 71.5q20 50 58 88t88 58q29 11 71.5 18.5t103 10 96.5 3 105.5 0 76.5-0.5 76.5 0.5 105.5 0 96.5-3 103-10 71.5-18.5q50-20 88-58t58-88q11-29 18.5-71.5t10-103 3-96.5 0-105.5-0.5-76.5 0.5-76.5 0-105.5-3-96.5-10-103-18.5-71.5q-20-50-58-88t-88-58q-29-11-71.5-18.5t-103-10-96.5-3-105.5 0-76.5 0.5zM1536 896q0 229-5 317-10 208-124 322t-322 124q-88 5-317 5t-317-5q-208-10-322-124t-124-322q-5-88-5-317t5-317q10-208 124-322t322-124q88-5 317-5t317 5q208 10 322 124t124 322q5 88 5 317z"
      }
    ]
  }
};
const facebookSquare = {
  "facebook-square": {
    width: 1536,
    height: 1792,
    paths: [
      {
        d: "M1248 128q119 0 203.5 84.5t84.5 203.5v960q0 119-84.5 203.5t-203.5 84.5h-188v-595h199l30-232h-229v-148q0-56 23.5-84t91.5-28l122-1v-207q-63-9-178-9-136 0-217.5 80t-81.5 226v171h-200v232h200v595h-532q-119 0-203.5-84.5t-84.5-203.5v-960q0-119 84.5-203.5t203.5-84.5h960z"
      }
    ]
  }
};
const telegram = {
  telegram: {
    width: 1792,
    height: 1792,
    paths: [
      {
        d: "M1189 1307l147-693q9-44-10.5-63t-51.5-7l-864 333q-29 11-39.5 25t-2.5 26.5 32 19.5l221 69 513-323q21-14 32-6 7 5-4 15l-415 375v0 0l-16 228q23 0 45-22l108-104 224 165q64 36 81-38zM1792 896q0 182-71 348t-191 286-286 191-348 71-348-71-286-191-191-286-71-348 71-348 191-286 286-191 348-71 348 71 286 191 191 286 71 348z"
      }
    ]
  }
};
const whatsapp = {
  whatsapp: {
    width: 1536,
    height: 1792,
    paths: [
      {
        d: "M985 974q13 0 97.5 44t89.5 53q2 5 2 15 0 33-17 76-16 39-71 65.5t-102 26.5q-57 0-190-62-98-45-170-118t-148-185q-72-107-71-194v-8q3-91 74-158 24-22 52-22 6 0 18 1.5t19 1.5q19 0 26.5 6.5t15.5 27.5q8 20 33 88t25 75q0 21-34.5 57.5t-34.5 46.5q0 7 5 15 34 73 102 137 56 53 151 101 12 7 22 7 15 0 54-48.5t52-48.5zM782 1504q127 0 243.5-50t200.5-134 134-200.5 50-243.5-50-243.5-134-200.5-200.5-134-243.5-50-243.5 50-200.5 134-134 200.5-50 243.5q0 203 120 368l-79 233 242-77q158 104 345 104zM782 122q153 0 292.5 60t240.5 161 161 240.5 60 292.5-60 292.5-161 240.5-240.5 161-292.5 60q-195 0-365-94l-417 134 136-405q-108-178-108-389 0-153 60-292.5t161-240.5 240.5-161 292.5-60z"
      }
    ]
  }
};
const css$4 = {
  code: "footer.svelte-1w8hgws.svelte-1w8hgws.svelte-1w8hgws{background-color:#030005}.logotype.svelte-1w8hgws.svelte-1w8hgws.svelte-1w8hgws{margin-top:35px}footer.svelte-1w8hgws img.svelte-1w8hgws.svelte-1w8hgws{margin-left:0px}footer.svelte-1w8hgws h2.svelte-1w8hgws.svelte-1w8hgws{font-size:1.2rem;margin-bottom:20px}footer.svelte-1w8hgws ul.svelte-1w8hgws.svelte-1w8hgws{line-height:1}.contacts.svelte-1w8hgws.svelte-1w8hgws.svelte-1w8hgws{padding-left:15%}.social-icons.svelte-1w8hgws a.svelte-1w8hgws.svelte-1w8hgws{display:flex;align-items:center;margin-bottom:5px}.social-icons.svelte-1w8hgws a.svelte-1w8hgws span.svelte-1w8hgws{margin-left:5px}.logo.svelte-1w8hgws.svelte-1w8hgws.svelte-1w8hgws{position:relative;bottom:15px;left:10px}.mre.svelte-1w8hgws.svelte-1w8hgws.svelte-1w8hgws{position:absolute;margin-top:50px;margin-right:40px;display:inline}.footer-container.svelte-1w8hgws.svelte-1w8hgws.svelte-1w8hgws{display:flex;flex-direction:column;align-items:center;width:100%}@media(min-width: 980px){.footer-container.svelte-1w8hgws.svelte-1w8hgws.svelte-1w8hgws{flex-direction:row;justify-content:space-between}.logo.svelte-1w8hgws.svelte-1w8hgws.svelte-1w8hgws{bottom:0px}}.footer-section.svelte-1w8hgws.svelte-1w8hgws.svelte-1w8hgws{display:flex;flex-direction:column;align-items:center;margin:10px;flex:1}@media(min-width: 980px){.footer-section.svelte-1w8hgws.svelte-1w8hgws.svelte-1w8hgws{align-items:start}}.logo.svelte-1w8hgws.svelte-1w8hgws.svelte-1w8hgws{margin-bottom:20px}@media(max-width: 980px){.contacts.svelte-1w8hgws.svelte-1w8hgws.svelte-1w8hgws{padding-left:0%;padding-top:10px;align-items:left}.logo.svelte-1w8hgws.svelte-1w8hgws.svelte-1w8hgws{bottom:0px}.logotype.svelte-1w8hgws.svelte-1w8hgws.svelte-1w8hgws{margin-right:30px}}:root{--anime-time:8s;--box-size:160px;--clip-distance:0.05;--clip-size:calc(var(--box-size) * (1 + var(--clip-distance) * 2));--path-width:2px;--main-color:#eee}.bb.svelte-1w8hgws.svelte-1w8hgws.svelte-1w8hgws{transform:scale(0.9);width:var(--box-size);height:var(--box-size);margin:auto;background:var(--codepen-logo-path) no-repeat 50% / 70% rgba(0, 0, 0, .1);color:var(--main-color);box-shadow:inset 0 0 0 1px rgba(var(--main-color), .5)}.mre.svelte-1w8hgws.svelte-1w8hgws.svelte-1w8hgws{white-space:nowrap}.bb.svelte-1w8hgws.svelte-1w8hgws.svelte-1w8hgws::before,.bb.svelte-1w8hgws.svelte-1w8hgws.svelte-1w8hgws::after{content:'';position:absolute;top:0;bottom:0;left:0;right:0;z-index:-1;margin:calc(-1 * var(--clip-distance) * 100%);box-shadow:inset 0 0 0 var(--path-width);animation:svelte-1w8hgws-clipMe var(--anime-time) linear infinite}.bb.svelte-1w8hgws.svelte-1w8hgws.svelte-1w8hgws::before{animation-delay:calc(var(--anime-time) * -.5)}@keyframes svelte-1w8hgws-clipMe{0%,100%{clip:rect(0px, var(--clip-size), var(--path-width), 0px)}25%{clip:rect(0px, var(--path-width), var(--clip-size), 0px)}50%{clip:rect(calc(var(--clip-size) - var(--path-width)), var(--clip-size), var(--clip-size), 0px)}75%{clip:rect(0px, var(--clip-size), var(--clip-size), calc(var(--clip-size) - var(--path-width)))}}@media(max-width: 1080px){.bb.svelte-1w8hgws.svelte-1w8hgws.svelte-1w8hgws{transform:scale(0.7);bottom:92%}}@media(max-width: 1008px){.bb.svelte-1w8hgws.svelte-1w8hgws.svelte-1w8hgws{transform:scale(0.7);bottom:93%}}@media(max-height: 1080px){.bb.svelte-1w8hgws.svelte-1w8hgws.svelte-1w8hgws{bottom:80%\n        }}@media(max-height: 790px){.bb.svelte-1w8hgws.svelte-1w8hgws.svelte-1w8hgws{bottom:70%\n        }}@media(max-width: 768px){.logotype.svelte-1w8hgws.svelte-1w8hgws.svelte-1w8hgws{margin-top:20px}}",
  map: null
};
const Footer = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  $$result.css.add(css$4);
  return `<footer class="bg-white w-full svelte-1w8hgws"><div class="mx-auto p-4 py-6 lg:py-8 footer-container svelte-1w8hgws" style="padding-right:10%;padding-left:10%"><div class="bb svelte-1w8hgws" data-svelte-h="svelte-1tba2i4"><div class="logotype svelte-1w8hgws"> <div class="mb-0 md:mb-0 flex items-center"><a href="https://sea-estate.com/" class="flex items-center svelte-1w8hgws"><img src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pg0KPCEtLSBVcGxvYWRlZCB0bzogU1ZHIFJlcG8sIHd3dy5zdmdyZXBvLmNvbSwgR2VuZXJhdG9yOiBTVkcgUmVwbyBNaXhlciBUb29scyAtLT4NCjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+DQo8c3ZnIGZpbGw9IiMwMDAwMDAiIHZlcnNpb249IjEuMSIgaWQ9IkNhcGFfMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgDQoJIHdpZHRoPSI4MDBweCIgaGVpZ2h0PSI4MDBweCIgdmlld0JveD0iMCAwIDQzLjM2NCA0My4zNjQiDQoJIHhtbDpzcGFjZT0icHJlc2VydmUiPg0KPGc+DQoJPGc+DQoJCTxwb2x5Z29uIHBvaW50cz0iMzEuNDU4LDE5LjMgMzEuODg2LDE5LjMgMzIuNDUzLDE5LjI0NSAzMi43NDYsMTguODk3IDMyLjQzNSwxOC43NzYgMzIuMjY1LDE4LjU3OSAzMi4wMDgsMTguMTY1IDMxLjg4NiwxNy41NzkgDQoJCQkzMS40MDUsMTcuNjc3IDMxLjI2OSwxNy44ODMgMzEuMjY5LDE4LjExNiAzMS41MDEsMTguMjc1IDMxLjgzMSwxOC40ODMgMzEuODYxLDE4LjcyIDMxLjUwNywxOC43OTMgCQkiLz4NCgkJPHBvbHlnb24gcG9pbnRzPSIzMC43NywxOC4zMjkgMzAuNDc3LDE4Ljc5OSAzMC40NzcsMTkuMTA0IDMwLjgxOCwxOS4xMDQgMzEuNDIyLDE4LjY3NyAzMS40NDcsMTguMzYgMzEuMTY0LDE4LjIzOCAJCSIvPg0KCQk8cGF0aCBkPSJNMjMuMjA3LDIwLjI0OGgtMC40MjF2MC4yMTZoMC4xMDJjMCwwLDAuMDA1LDAuMDQ3LDAuMDE1LDAuMTA2bDAuMjU3LTAuMDIxbDAuMTYyLTAuMWwwLjA0Mi0wLjIwMmwwLjIwOS0wLjAxOQ0KCQkJbDAuMDgyLTAuMTdsLTAuMTkxLTAuMDM5bC0wLjE2NywwLjAwM0wyMy4yMDcsMjAuMjQ4eiIvPg0KCQk8cG9seWdvbiBwb2ludHM9IjIyLjE5MywyMC42MyAyMi40OTgsMjAuNjA1IDIyLjUzMSwyMC4zOTIgMjIuMzQ2LDIwLjI0OCAyMi4yMDksMjAuNDE5IAkJIi8+DQoJCTxwYXRoIGQ9Ik00MC41MSwyNy4yYy0wLjAwNS0wLjQ2OS0wLjAyOS0wLjkzMy0wLjA3My0xLjM5MWMtMC4xNDYtMS41MjQtMC41MTMtMi45ODUtMS4wNi00LjM1NQ0KCQkJYy0wLjA0MS0wLjEwMy0wLjA3OS0wLjIwNi0wLjEyLTAuMzA3Yy0wLjcyOS0xLjcyLTEuNzUyLTMuMjg0LTMuMDAyLTQuNjM2Yy0wLjA4Mi0wLjA4OS0wLjE2NS0wLjE3NS0wLjI0OS0wLjI2Mg0KCQkJYy0wLjIzNy0wLjI0NC0wLjQ3OC0wLjQ4NC0wLjczMS0wLjcxNGMtMi44NDQtMi41OS02LjYyMS00LjE3MS0xMC43NjItNC4xNzFjLTAuNTg1LDAtMS4xNiwwLjAzOS0xLjcyOSwwLjEwMQ0KCQkJYy0wLjEyMywwLjQ3My0wLjI3NiwwLjkzNC0wLjQ1OSwxLjM4NWMwLjcxNS0wLjEwNywxLjQ0NC0wLjE2OSwyLjE4OC0wLjE2OWMzLjcxMiwwLDcuMTA2LDEuMzg4LDkuNjk0LDMuNjY4bC0wLjE3NCwwLjMxMw0KCQkJbC0wLjY3OSwwLjI2NWwtMC4yODMsMC4zMWwwLjA2NCwwLjM2MmwwLjM1LDAuMDQ4bDAuMjEyLDAuNTI2bDAuNjAyLTAuMjQybDAuMSwwLjcwNGgtMC4xODJsLTAuNDk2LTAuMDczbC0wLjU0OCwwLjA5Mg0KCQkJbC0wLjUzMSwwLjc1bC0wLjc1OSwwLjEybC0wLjExLDAuNjQ5bDAuMzIsMC4wNzZsLTAuMDkyLDAuNDE4bC0wLjc1NS0wLjE1MmwtMC42OTIsMC4xNTJsLTAuMTQ2LDAuMzg0bDAuMTE5LDAuODA5bDAuNDA1LDAuMTg5DQoJCQlsMC42ODItMC4wMDRsMC40NTktMC4wNDJsMC4xNDItMC4zNjVsMC43MTctMC45MzVsMC40NzUsMC4wOTdsMC40NjYtMC40MjFsMC4wODYsMC4zMjlsMS4xNDYsMC43NzJsLTAuMTQsMC4xODhsLTAuNTE3LTAuMDI4DQoJCQlsMC4xOTgsMC4yODJsMC4zMTgsMC4wN2wwLjM3My0wLjE1NWwtMC4wMDctMC40NDlsMC4xNjYtMC4wODNsLTAuMTMzLTAuMTQxTDM0LjYsMjAuNzM4bC0wLjIwMi0wLjU2NmgwLjYzN2wwLjIwMiwwLjIwMQ0KCQkJbDAuNTQ4LDAuNDcybDAuMDIyLDAuNTdsMC41NjcsMC42MDRsMC4yMTEtMC44MjhsMC4zOTMtMC4yMTNsMC4wNzMsMC42NzdsMC4zODQsMC40MjJsMC43NjYtMC4wMTUNCgkJCWMwLjE0NywwLjM4MSwwLjI4LDAuNzcsMC4zOTYsMS4xNjRsLTAuMDgyLDAuMDc1aC0xLjE3MUwzNi42MywyMi43N2wtMC43NSwwLjA3MnYwLjQ1OWgtMC4yMzlsLTAuMjU1LTAuMTg0bC0xLjMtMC4zMjl2LTAuODQyDQoJCQlsLTEuNjQ3LDAuMTI5bC0wLjUxMiwwLjI3MmgtMC42NTRsLTAuMzItMC4wMzJsLTAuNzk0LDAuNDQxdjAuODI5bC0xLjYyMiwxLjE3MmwwLjEzNCwwLjVIMjlsLTAuMDg3LDAuNDc3bC0wLjIzMSwwLjA4OA0KCQkJbC0wLjAxMiwxLjI0NGwxLjQwMywxLjU5OWgwLjYwOWwwLjAzOC0wLjA5OWgxLjA5OWwwLjMxNS0wLjI5MmgwLjYyNGwwLjM0MSwwLjM0MmwwLjkyOCwwLjA5OGwtMC4xMjMsMS4yMzJsMS4wMywxLjgxNw0KCQkJbC0wLjU0MiwxLjAzN2wwLjAzNywwLjQ4OGwwLjQyOCwwLjQyN3YxLjE3NGwwLjU2MSwwLjc1NXYwLjk3N2gwLjQ4NWMtMi42OTUsMy4zMS02LjgsNS40MjktMTEuMzksNS40MjkNCgkJCWMtOC4wOTcsMC0xNC42ODQtNi41ODgtMTQuNjg0LTE0LjY4NWMwLTEuNTI2LDAuMjM1LTIuOTk5LDAuNjY5LTQuMzg1bC0wLjIwMS0wLjI5OGMtMC4wNjctMC4wOTktMC4zMzQtMC40ODYtMC43MTktMS4wMg0KCQkJYy0wLjY4MSwxLjc3Mi0xLjA2NSwzLjY5LTEuMDY1LDUuNzAxYzAsOC44MjIsNy4xNzgsMTYsMTYsMTZjNi4yMDYsMCwxMS41OTQtMy41NTUsMTQuMjQ2LTguNzMNCgkJCWMwLjU2Ny0xLjEwNywxLjAwOS0yLjI4OCwxLjMwNy0zLjUyMmMwLjA3NS0wLjMxMywwLjE0MS0wLjYzMSwwLjE5Ny0wLjk0OWMwLjE2MS0wLjkwOSwwLjI0OS0xLjg0MywwLjI0OS0yLjc5Nw0KCQkJQzQwLjUxMywyNy4zMDksNDAuNTExLDI3LjI1NCw0MC41MSwyNy4yeiBNMzUuNjI2LDE4LjU1MmwtMS4wMDctMC4wMDlsLTAuMDYzLTAuMjFsMC42MzEtMC4zMjFsMC4wMDMtMC43MTQNCgkJCWMwLjI1MSwwLjI2NiwwLjQ5NCwwLjU0MSwwLjcyNiwwLjgyNUwzNS42MjYsMTguNTUyeiBNMzcuNzg0LDIxLjQxNEwzNy41LDIxLjQ1M3YtMC42NDhsMC4wOTItMC4xMDQNCgkJCWMwLjEyMSwwLjIzNiwwLjIzNiwwLjQ3NywwLjM0NCwwLjcyTDM3Ljc4NCwyMS40MTR6IE0zOC43NTUsMjQuMDQzbDAuMDQ3LTAuMDU1YzAuMDIxLDAuMDg0LDAuMDM5LDAuMTY2LDAuMDYsMC4yNTENCgkJCUwzOC43NTUsMjQuMDQzeiIvPg0KCQk8cGF0aCBkPSJNMjAuOCwxNS43NTRsLTAuMjA5LDAuMDEzYy0wLjY5OCwwLjg0Ny0xLjUwOCwxLjYwNS0yLjQ0MSwyLjIxNmMtMC4xMDQsMC4xNjMtMC4yMTIsMC4zMzktMC4zMjEsMC41MTdsMC4xNDUsMC4wMzQNCgkJCWwtMC4xMjEsMC40NjhsLTAuMzc1LDAuMTE4bC0wLjAxMS0wLjAyM2MtMC43OTksMS4zMzEtMS42MjUsMi43OTUtMS45MzksMy4zNTdsLTAuODQ2LDEuNTI0bC0xLjEyNiwyLjAyOGwwLjA5NCwwLjE0NA0KCQkJbDEuMjgyLDAuMzE3di0wLjIwN2wwLjUxMiwwLjA3M0wxNS4zOTUsMjYuN2wwLjQwMywwLjA3MmwwLjYyMiwwLjE3bDAuODc4LDEuMDAzbDEuMTIzLDAuMDg0bDAuMTEsMC45MTZsLTAuNzY5LDAuNTM2DQoJCQlsLTAuMDM2LDAuODE3bC0wLjExLDAuNTAxbDEuMTEsMS4zOTFsMC4wODUsMC40NzhjMCwwLDAuNDAzLDAuMTA4LDAuNDUyLDAuMTA4YzAuMDQ4LDAsMC45MDMsMC42NDYsMC45MDMsMC42NDZ2Mi41MTQNCgkJCWwwLjMwNSwwLjA4NmwtMC4yMDgsMS4xNTlsMC41MTIsMC42ODVsLTAuMDk0LDEuMTQ4bDAuNjc3LDEuMTlsMC44NywwLjc1OWwwLjg3NCwwLjAxN2wwLjA4NS0wLjI4bC0wLjY0My0wLjU0MWwwLjAzOC0wLjI2OQ0KCQkJbDAuMTE1LTAuMzNsMC4wMjQtMC4zMzVsLTAuNDM0LTAuMDEybC0wLjIxOS0wLjI3NmwwLjM2MS0wLjM0OGwwLjA0OC0wLjI2MmwtMC40MDItMC4xMTZsMC4wMjQtMC4yNDNsMC41NzQtMC4wODdsMC44NzMtMC40Mg0KCQkJbDAuMjkzLTAuNTM3bDAuOTE2LTEuMTdsLTAuMjA4LTAuOTE3bDAuMjgyLTAuNDg4bDAuODQyLDAuMDI1bDAuNTY3LTAuNDQ4bDAuMTgzLTEuNzY3bDAuNjI5LTAuNzk5bDAuMTA5LTAuNTE0bC0wLjU3My0wLjE4NA0KCQkJbC0wLjM3OS0wLjYyMWwtMS4yOTUtMC4wMTFsLTEuMDI1LTAuMzkybC0wLjA0OC0wLjczbC0wLjM0Mi0wLjZsLTAuOTI3LTAuMDEzbC0wLjUzOC0wLjg0MmwtMC40NzYtMC4yMzFsLTAuMDIzLDAuMjU3DQoJCQlsLTAuODY2LDAuMDUybC0wLjMxNy0wLjQ0MmwtMC45MDMtMC4xODNsLTAuNzQ1LDAuODU5bC0xLjE3MS0wLjE5OGwtMC4wODYtMS4zMTlsLTAuODU0LTAuMTQ2bDAuMzQyLTAuNjQ2bC0wLjA5OS0wLjM3NQ0KCQkJbC0xLjEyMywwLjc1MmwtMC43MDctMC4wODdsLTAuMjUxLTAuNTUybDAuMTU1LTAuNTY5bDAuMzg5LTAuNzE4bDAuODk2LTAuNDU0bDEuNzMyLTAuMDAxbC0wLjAwNSwwLjUyOGwwLjYyMywwLjI5bC0wLjA1LTAuOTAxDQoJCQlsMC40NDktMC40NTFsMC45MDYtMC41OTVsMC4wNjItMC40MTlsMC45MDMtMC45NGwwLjk2LTAuNTMxbC0wLjA4NC0wLjA2OWwwLjY1LTAuNjEybDAuMjM4LDAuMDYzbDAuMTA5LDAuMTM3bDAuMjQ3LTAuMjczDQoJCQlsMC4wNjEtMC4wMjZsLTAuMjcxLTAuMDM5bC0wLjI3NC0wLjA5di0wLjI2NmwwLjE0Ni0wLjEyaDAuMzIybDAuMTQ2LDAuMDY0bDAuMTI3LDAuMjU3bDAuMTU1LTAuMDIzdi0wLjAyNWwwLjA0NSwwLjAxNQ0KCQkJbDAuNDUtMC4wNjlsMC4wNjMtMC4yMjFsMC4yNTYsMC4wNjR2MC4yMzhsLTAuMjM4LDAuMTY0aDAuMDAxbDAuMDM0LDAuMjYybDAuODE1LDAuMjUyYzAsMCwwLDAuMDAzLDAuMDAxLDAuMDFsMC4xODgtMC4wMTcNCgkJCWwwLjAxMy0wLjM1M2wtMC42NDYtMC4yOTVsLTAuMDM2LTAuMTdsMC41MzctMC4xODNsMC4wMjItMC41MTNsLTAuNTYxLTAuMzQybC0wLjAzNy0wLjg2NWwtMC43NywwLjM3N2gtMC4yOGwwLjA3NC0wLjY1OA0KCQkJbC0xLjA0OC0wLjI0OGwtMC40MzMsMC4zMjZ2MC45OThsLTAuNzc4LDAuMjQ3bC0wLjMxLDAuNjUxbC0wLjMzOCwwLjA1NXYtMC44MzFsLTAuNzMyLTAuMTAybC0wLjM2NS0wLjIzOGwtMC4xNDgtMC41MzkNCgkJCWwxLjMxLTAuNzY2bDAuNjQtMC4xOTZsMC4wNjQsMC40MzJsMC4zNTctMC4wMmwwLjAyOC0wLjIxNmwwLjM3My0wLjA1NGwwLjAwNi0wLjA3NmwtMC4xNi0wLjA2NmwtMC4wMzctMC4yMjhsMC40NTgtMC4wMzkNCgkJCWwwLjI3Ny0wLjI4OWwwLjAxNS0wLjAyMWwwLjAwMywwLjAwMmwwLjA4NC0wLjA4OGwwLjk2Ni0wLjEybDAuNDI3LDAuMzYybC0xLjExOCwwLjU5NWwxLjQyMiwwLjMzNmwwLjE4NC0wLjQ3NmgwLjYyM2wwLjIyLTAuNDE1DQoJCQlsLTAuNDM4LTAuMTFWMTUuNDVsLTEuMzc5LTAuNjFsLTAuOTUzLDAuMTFsLTAuNTM2LDAuMjhsMC4wMzcsMC42ODRsLTAuNTYxLTAuMDg2TDIxLjM1LDE1LjQ1bDAuNTM4LTAuNDg4bC0wLjY0OC0wLjAzMQ0KCQkJYy0wLjExMywwLjE2Ny0wLjI0NywwLjMxOC0wLjM2OSwwLjQ3OUwyMC44LDE1Ljc1NHogTTE4LjI3NCwyMS4wMjJsLTAuMjU2LTAuMTM2bDAuMDU1LTAuMzY2bDAuMzM4LTAuMzY1aDAuNDg1TDE4LjI3NCwyMS4wMjJ6DQoJCQkgTTE5LjU3NCwyMS4wMjJsLTAuMjEsMC4yMTFoLTAuNDY3bDAuMDcyLTAuMzE5bDAuMjItMC4wMTlsMC4wNDYtMC4xMWwwLjMzOC0wLjA0NkwxOS41NzQsMjEuMDIyTDE5LjU3NCwyMS4wMjJ6IE0xOS42ODQsMjAuNDQ3DQoJCQlsLTAuMjIsMC4xNDJsLTAuMjc0LDAuMDUxYzAsMCwwLTAuNDM5LDAtMC40ODRoMC40OTRWMjAuNDQ3eiBNMjAuMSwyMC4xMDhsMC4yMjUsMC4xNDFsLTAuMTgsMC4xNDhsLTAuMTc3LTAuMTQ4TDIwLjEsMjAuMTA4eg0KCQkJIE0xOS44MDMsMjAuNDc0aDAuMDM3bDAuNTU4LDAuMTY1djAuMjg0aC0wLjQ2N2wtMC4xMjctMC4xODVMMTkuODAzLDIwLjQ3NEwxOS44MDMsMjAuNDc0eiBNMTkuNDM2LDE5LjY4NmwwLjMwMywwLjI3Ng0KCQkJbC0wLjMwMywwLjA3MlYxOS42ODZ6IE0xOS4xNTMsMTkuNTU5djAuMTc0aDAuMTI3djAuMzAyaC0wLjg3N2wtMC4zMjktMC4wOTJsMC4wODEtMC4yMWwwLjQyMi0wLjE3NEgxOS4xNTN6Ii8+DQoJCTxwYXRoIGQ9Ik0xMi42NjksMjMuMjg1bDAuODQ3LTEuNTI0YzAuMDE5LTAuMDMzLDEuNzgxLTMuMiwyLjkzMS00Ljk2YzIuODk1LTEuNzA1LDQuNjI4LTQuOTMzLDQuNDM0LTguMw0KCQkJYy0wLjI4NS00Ljk0MS00LjUyMi04Ljc2My05LjUyOS04LjQ4NkM2LjM4NywwLjMwMiwyLjU4LDQuNTc2LDIuODY3LDkuNTQyYzAuMTk1LDMuMzU2LDIuMTkyLDYuMjc2LDUuMjMzLDcuNjc2DQoJCQljMS43NDgsMS45MDMsMy41NzQsNC41OTQsMy41OTMsNC42MjJMMTIuNjY5LDIzLjI4NXogTTkuMzY0LDE1LjQzMWwtMC4yMDUtMC4wODhjLTIuNDEtMS4wMzYtNC0zLjMwNy00LjE1Mi01LjkyNQ0KCQkJYy0wLjIxOS0zLjc4NywyLjY4My03LjA0Niw2LjQ2OS03LjI2NWMwLjEzNS0wLjAwOCwwLjI3MS0wLjAxMiwwLjQwNS0wLjAxMmMzLjYzNywwLDYuNjQ5LDIuODQ3LDYuODU5LDYuNDgxDQoJCQljMC4xNTIsMi42MzctMS4yNDYsNS4xNjEtMy41NjIsNi40MzJsLTAuMjI5LDAuMTI2bC0wLjE0NiwwLjIxOGMtMC43MDMsMS4wNTItMS42NTEsMi42NjYtMi4zMjUsMy44NDMNCgkJCWMtMC43NjQtMS4wNDUtMS44NzEtMi40ODUtMi45NjEtMy42NDdMOS4zNjQsMTUuNDMxeiIvPg0KCQk8Y2lyY2xlIGN4PSIxMS44NzMiIGN5PSI4Ljg5MiIgcj0iMy41NDkiLz4NCgk8L2c+DQo8L2c+DQo8L3N2Zz4=" class="h-16 logo svelte-1w8hgws" alt="More Real Estate Logo" style="filter: brightness(0) invert(1);"> <div class="flex flex-col items-center ml-2"><div class="flex items-center"><div class="border-l-2 h-12 border-white mx-2"></div>  <span class="text-3xl font-thin text-white align-middle svelte-1w8hgws">SRE</span></div> <span class="mre text-xs uppercase text-white mt-4 svelte-1w8hgws">sea real estate</span> </div></a></div></div></div> <div class="contacts footer-section svelte-1w8hgws" data-svelte-h="svelte-1illnkd"><h2 class="text-sm font-semibold text-gray-900 uppercase dark:text-white svelte-1w8hgws">Контакты</h2> <ul class="text-gray-500 dark:text-gray-400 font-medium svelte-1w8hgws"><li class="mb-4"><a href="https://flowbite.com/" class="hover:underline">+359 895-340-006</a></li> <li class="mb-4"><a href="https://tailwindcss.com/" class="hover:underline">+359 877-580-966</a></li> <li class="mb-4"><a href="https://tailwindcss.com/" class="hover:underline">+38(93)053-55-25</a></li> <li class="mb-4"><a href="" class="hover:underline">support@mail.com</a></li></ul></div> <div class="social-icons footer-section svelte-1w8hgws"><a href="#" class="text-gray-500 hover:text-gray-900 dark:hover:text-white svelte-1w8hgws">${validate_component(Icon, "Icon").$$render(
    $$result,
    {
      class: "icon-large",
      data: facebookSquare
    },
    {},
    {}
  )} <span class="text-s svelte-1w8hgws" data-svelte-h="svelte-htrm4">Facebook</span></a> <a href="#" class="text-gray-500 hover:text-gray-900 dark:hover:text-white svelte-1w8hgws">${validate_component(Icon, "Icon").$$render($$result, { class: "icon-large", data: instagram }, {}, {})} <span class="text-s svelte-1w8hgws" data-svelte-h="svelte-1u65fjo">Instagram</span></a> <a href="#" class="text-gray-500 hover:text-gray-900 dark:hover:text-white svelte-1w8hgws">${validate_component(Icon, "Icon").$$render($$result, { class: "icon-large", data: telegram }, {}, {})} <span class="text-s svelte-1w8hgws" data-svelte-h="svelte-ana7bx">Telegram</span></a> <a href="#" class="text-gray-500 hover:text-gray-900 dark:hover:text-white svelte-1w8hgws">${validate_component(Icon, "Icon").$$render($$result, { class: "icon-large", data: whatsapp }, {}, {})} <span class="text-s svelte-1w8hgws" data-svelte-h="svelte-1ppge0m">Whatsapp</span></a></div></div> <div class="flex footer-container text-center justify-center mx-auto p-4 py-6 lg:py-8 svelte-1w8hgws" style="padding-right:10%;padding-left:10%" data-svelte-h="svelte-zb04dz"><div class="text-center mt-6 lg:mt-0 lg:text-left"><ul class="text-gray-500 dark:text-gray-400 font-medium text-xs svelte-1w8hgws"><li class="mb-4"><a href="#" class="hover:underline">Политика конфиденциальности</a></li> <li><a href="#" class="hover:underline">Условия использования</a></li></ul></div> <div class="text-center mt-6 lg:mt-0 lg:text-left"><span class="text-sm text-gray-400">© 2024 Sea Real Estate™. All Rights Reserved.</span></div></div> </footer>`;
});
const css$3 = {
  code: ".hidden.svelte-epclpd.svelte-epclpd.svelte-epclpd{display:none}.flex.svelte-epclpd.svelte-epclpd.svelte-epclpd{display:flex}nav.svelte-epclpd.svelte-epclpd.svelte-epclpd{background-color:#030005}.contacts.svelte-epclpd.svelte-epclpd.svelte-epclpd{display:block}nav.svelte-epclpd a.svelte-epclpd.svelte-epclpd:hover{color:white;transform:scale(1.2)}.logotype.svelte-epclpd.svelte-epclpd.svelte-epclpd{margin-top:20px}.hamburger.svelte-epclpd.svelte-epclpd.svelte-epclpd{border:white 1px solid}.hamburger.svelte-epclpd.svelte-epclpd.svelte-epclpd:hover{background-color:transparent}.logotype.svelte-epclpd.svelte-epclpd.svelte-epclpd::before,.logotype.svelte-epclpd.svelte-epclpd.svelte-epclpd::after{content:'';position:absolute;top:-10px;bottom:-10px;left:-10px;right:-10px;z-index:-1;box-shadow:inset 0 0 0 var(--path-width);animation:svelte-epclpd-clipMe var(--anime-time) linear infinite}.logotype.svelte-epclpd.svelte-epclpd.svelte-epclpd::before{animation-delay:calc(var(--anime-time) * -.5)}ul.svelte-epclpd.svelte-epclpd.svelte-epclpd{display:flex;justify-content:flex-end;list-style:none;padding:0;margin:0}ul.svelte-epclpd li.svelte-epclpd.svelte-epclpd{margin-left:10px}nav.svelte-epclpd a.svelte-epclpd.svelte-epclpd{color:white;padding:12px 16px;display:block;text-decoration:none;transition:all 0.3s ease;transform:scale(1.1)}nav.svelte-epclpd a.svelte-epclpd.svelte-epclpd:hover{color:white;transform:scale(1.2)}nav.svelte-epclpd img.svelte-epclpd.svelte-epclpd{margin-bottom:50px;margin-right:-20px;margin-left:-10px}.mre.svelte-epclpd.svelte-epclpd.svelte-epclpd{margin-left:-25px}#navbar-language.svelte-epclpd.svelte-epclpd.svelte-epclpd{margin-left:auto}#language-dropdown-menu.svelte-epclpd.svelte-epclpd.svelte-epclpd{min-width:100%}.mobile-nav-menu.svelte-epclpd a.svelte-epclpd.svelte-epclpd{color:white;padding:12px 16px;display:block;text-decoration:none;transition:all 0.3s ease}.mobile-nav-menu.svelte-epclpd a.svelte-epclpd.svelte-epclpd:hover{text-decoration:underline;background-color:transparent}#navbar-language.svelte-epclpd>ul.svelte-epclpd>li.svelte-epclpd:last-child{margin-right:2rem}nav.svelte-epclpd .flex.svelte-epclpd.svelte-epclpd{display:flex;align-items:center;justify-content:space-between;flex-wrap:nowrap}.mobile-nav-menu.svelte-epclpd.svelte-epclpd.svelte-epclpd{flex-direction:column;width:100%;position:absolute;top:20%;left:0;background-color:#030005;z-index:1000;box-shadow:0px 8px 16px 0px rgba(0,0,0,0.2);border-top:1px solid #f3f3f3}:root{--anime-time:8s;--box-size:160px;--clip-distance:0.05;--clip-size:calc(var(--box-size) * (1 + var(--clip-distance) * 2));--path-width:2px;--main-color:#eee}.bb.svelte-epclpd.svelte-epclpd.svelte-epclpd{top:0%;bottom:85%;left:0;right:70%;transform:scale(0.9);width:var(--box-size);height:var(--box-size);margin:auto;background:var(--codepen-logo-path) no-repeat 50% / 70% rgba(0, 0, 0, .1);color:var(--main-color);box-shadow:inset 0 0 0 1px rgba(var(--main-color), .5)}.mre.svelte-epclpd.svelte-epclpd.svelte-epclpd{white-space:nowrap}.bb.svelte-epclpd.svelte-epclpd.svelte-epclpd::before,.bb.svelte-epclpd.svelte-epclpd.svelte-epclpd::after{content:'';position:absolute;top:0;bottom:0;left:0;right:0;z-index:-1;margin:calc(-1 * var(--clip-distance) * 100%);box-shadow:inset 0 0 0 var(--path-width);animation:svelte-epclpd-clipMe var(--anime-time) linear infinite}.bb.svelte-epclpd.svelte-epclpd.svelte-epclpd::before{animation-delay:calc(var(--anime-time) * -.5)}@keyframes svelte-epclpd-clipMe{0%,100%{clip:rect(0px, var(--clip-size), var(--path-width), 0px)}25%{clip:rect(0px, var(--path-width), var(--clip-size), 0px)}50%{clip:rect(calc(var(--clip-size) - var(--path-width)), var(--clip-size), var(--clip-size), 0px)}75%{clip:rect(0px, var(--clip-size), var(--clip-size), calc(var(--clip-size) - var(--path-width)))}}nav.svelte-epclpd button.svelte-epclpd.svelte-epclpd{order:2;padding:8px;margin-left:auto}@media(max-width: 1080px){nav.svelte-epclpd a.svelte-epclpd.svelte-epclpd{padding:0px}nav.svelte-epclpd button.svelte-epclpd.svelte-epclpd{order:2;padding:8px;margin-left:auto}.bb.svelte-epclpd.svelte-epclpd.svelte-epclpd{transform:scale(0.7);bottom:92%}.logotype.svelte-epclpd.svelte-epclpd.svelte-epclpd{margin-left:15px;margin-top:30px}}@media(max-width: 1008px){.bb.svelte-epclpd.svelte-epclpd.svelte-epclpd{transform:scale(0.7)}nav.svelte-epclpd img.svelte-epclpd.svelte-epclpd{margin-bottom:50px;margin-right:-20px;margin-left:0px}@media(max-width: 400px){.contacts.svelte-epclpd.svelte-epclpd.svelte-epclpd{display:none}}}@media(min-width: 1190px){.navmenu.svelte-epclpd.svelte-epclpd.svelte-epclpd{display:flex !important}}@media(max-width: 1190px){.hamburger.svelte-epclpd.svelte-epclpd.svelte-epclpd{display:flex !important}}",
  map: null
};
const Nav = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let navMenu;
  function handleClickOutside(event) {
  }
  onDestroy(() => {
    if (typeof window !== "undefined") {
      window.removeEventListener("click", handleClickOutside);
    }
  });
  $$result.css.add(css$3);
  return `<nav class="bg-white dark:bg-gray-900 w-full top-0 start-0 border-b border-gray-200 dark:border-gray-600 svelte-epclpd"><div class="mx-auto p-4 py-6 lg:py-8" style="padding-right:10%;padding-left:10%"><div class="flex md:flex-row justify-between items-center svelte-epclpd"><div class="bb svelte-epclpd" data-svelte-h="svelte-1jam103"> <div class="logotype mb-0 md:mb-0 flex items-center svelte-epclpd"><a href="https://sea-estate.com/" class="flex items-center svelte-epclpd"><img src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pg0KPCEtLSBVcGxvYWRlZCB0bzogU1ZHIFJlcG8sIHd3dy5zdmdyZXBvLmNvbSwgR2VuZXJhdG9yOiBTVkcgUmVwbyBNaXhlciBUb29scyAtLT4NCjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+DQo8c3ZnIGZpbGw9IiMwMDAwMDAiIHZlcnNpb249IjEuMSIgaWQ9IkNhcGFfMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgDQoJIHdpZHRoPSI4MDBweCIgaGVpZ2h0PSI4MDBweCIgdmlld0JveD0iMCAwIDQzLjM2NCA0My4zNjQiDQoJIHhtbDpzcGFjZT0icHJlc2VydmUiPg0KPGc+DQoJPGc+DQoJCTxwb2x5Z29uIHBvaW50cz0iMzEuNDU4LDE5LjMgMzEuODg2LDE5LjMgMzIuNDUzLDE5LjI0NSAzMi43NDYsMTguODk3IDMyLjQzNSwxOC43NzYgMzIuMjY1LDE4LjU3OSAzMi4wMDgsMTguMTY1IDMxLjg4NiwxNy41NzkgDQoJCQkzMS40MDUsMTcuNjc3IDMxLjI2OSwxNy44ODMgMzEuMjY5LDE4LjExNiAzMS41MDEsMTguMjc1IDMxLjgzMSwxOC40ODMgMzEuODYxLDE4LjcyIDMxLjUwNywxOC43OTMgCQkiLz4NCgkJPHBvbHlnb24gcG9pbnRzPSIzMC43NywxOC4zMjkgMzAuNDc3LDE4Ljc5OSAzMC40NzcsMTkuMTA0IDMwLjgxOCwxOS4xMDQgMzEuNDIyLDE4LjY3NyAzMS40NDcsMTguMzYgMzEuMTY0LDE4LjIzOCAJCSIvPg0KCQk8cGF0aCBkPSJNMjMuMjA3LDIwLjI0OGgtMC40MjF2MC4yMTZoMC4xMDJjMCwwLDAuMDA1LDAuMDQ3LDAuMDE1LDAuMTA2bDAuMjU3LTAuMDIxbDAuMTYyLTAuMWwwLjA0Mi0wLjIwMmwwLjIwOS0wLjAxOQ0KCQkJbDAuMDgyLTAuMTdsLTAuMTkxLTAuMDM5bC0wLjE2NywwLjAwM0wyMy4yMDcsMjAuMjQ4eiIvPg0KCQk8cG9seWdvbiBwb2ludHM9IjIyLjE5MywyMC42MyAyMi40OTgsMjAuNjA1IDIyLjUzMSwyMC4zOTIgMjIuMzQ2LDIwLjI0OCAyMi4yMDksMjAuNDE5IAkJIi8+DQoJCTxwYXRoIGQ9Ik00MC41MSwyNy4yYy0wLjAwNS0wLjQ2OS0wLjAyOS0wLjkzMy0wLjA3My0xLjM5MWMtMC4xNDYtMS41MjQtMC41MTMtMi45ODUtMS4wNi00LjM1NQ0KCQkJYy0wLjA0MS0wLjEwMy0wLjA3OS0wLjIwNi0wLjEyLTAuMzA3Yy0wLjcyOS0xLjcyLTEuNzUyLTMuMjg0LTMuMDAyLTQuNjM2Yy0wLjA4Mi0wLjA4OS0wLjE2NS0wLjE3NS0wLjI0OS0wLjI2Mg0KCQkJYy0wLjIzNy0wLjI0NC0wLjQ3OC0wLjQ4NC0wLjczMS0wLjcxNGMtMi44NDQtMi41OS02LjYyMS00LjE3MS0xMC43NjItNC4xNzFjLTAuNTg1LDAtMS4xNiwwLjAzOS0xLjcyOSwwLjEwMQ0KCQkJYy0wLjEyMywwLjQ3My0wLjI3NiwwLjkzNC0wLjQ1OSwxLjM4NWMwLjcxNS0wLjEwNywxLjQ0NC0wLjE2OSwyLjE4OC0wLjE2OWMzLjcxMiwwLDcuMTA2LDEuMzg4LDkuNjk0LDMuNjY4bC0wLjE3NCwwLjMxMw0KCQkJbC0wLjY3OSwwLjI2NWwtMC4yODMsMC4zMWwwLjA2NCwwLjM2MmwwLjM1LDAuMDQ4bDAuMjEyLDAuNTI2bDAuNjAyLTAuMjQybDAuMSwwLjcwNGgtMC4xODJsLTAuNDk2LTAuMDczbC0wLjU0OCwwLjA5Mg0KCQkJbC0wLjUzMSwwLjc1bC0wLjc1OSwwLjEybC0wLjExLDAuNjQ5bDAuMzIsMC4wNzZsLTAuMDkyLDAuNDE4bC0wLjc1NS0wLjE1MmwtMC42OTIsMC4xNTJsLTAuMTQ2LDAuMzg0bDAuMTE5LDAuODA5bDAuNDA1LDAuMTg5DQoJCQlsMC42ODItMC4wMDRsMC40NTktMC4wNDJsMC4xNDItMC4zNjVsMC43MTctMC45MzVsMC40NzUsMC4wOTdsMC40NjYtMC40MjFsMC4wODYsMC4zMjlsMS4xNDYsMC43NzJsLTAuMTQsMC4xODhsLTAuNTE3LTAuMDI4DQoJCQlsMC4xOTgsMC4yODJsMC4zMTgsMC4wN2wwLjM3My0wLjE1NWwtMC4wMDctMC40NDlsMC4xNjYtMC4wODNsLTAuMTMzLTAuMTQxTDM0LjYsMjAuNzM4bC0wLjIwMi0wLjU2NmgwLjYzN2wwLjIwMiwwLjIwMQ0KCQkJbDAuNTQ4LDAuNDcybDAuMDIyLDAuNTdsMC41NjcsMC42MDRsMC4yMTEtMC44MjhsMC4zOTMtMC4yMTNsMC4wNzMsMC42NzdsMC4zODQsMC40MjJsMC43NjYtMC4wMTUNCgkJCWMwLjE0NywwLjM4MSwwLjI4LDAuNzcsMC4zOTYsMS4xNjRsLTAuMDgyLDAuMDc1aC0xLjE3MUwzNi42MywyMi43N2wtMC43NSwwLjA3MnYwLjQ1OWgtMC4yMzlsLTAuMjU1LTAuMTg0bC0xLjMtMC4zMjl2LTAuODQyDQoJCQlsLTEuNjQ3LDAuMTI5bC0wLjUxMiwwLjI3MmgtMC42NTRsLTAuMzItMC4wMzJsLTAuNzk0LDAuNDQxdjAuODI5bC0xLjYyMiwxLjE3MmwwLjEzNCwwLjVIMjlsLTAuMDg3LDAuNDc3bC0wLjIzMSwwLjA4OA0KCQkJbC0wLjAxMiwxLjI0NGwxLjQwMywxLjU5OWgwLjYwOWwwLjAzOC0wLjA5OWgxLjA5OWwwLjMxNS0wLjI5MmgwLjYyNGwwLjM0MSwwLjM0MmwwLjkyOCwwLjA5OGwtMC4xMjMsMS4yMzJsMS4wMywxLjgxNw0KCQkJbC0wLjU0MiwxLjAzN2wwLjAzNywwLjQ4OGwwLjQyOCwwLjQyN3YxLjE3NGwwLjU2MSwwLjc1NXYwLjk3N2gwLjQ4NWMtMi42OTUsMy4zMS02LjgsNS40MjktMTEuMzksNS40MjkNCgkJCWMtOC4wOTcsMC0xNC42ODQtNi41ODgtMTQuNjg0LTE0LjY4NWMwLTEuNTI2LDAuMjM1LTIuOTk5LDAuNjY5LTQuMzg1bC0wLjIwMS0wLjI5OGMtMC4wNjctMC4wOTktMC4zMzQtMC40ODYtMC43MTktMS4wMg0KCQkJYy0wLjY4MSwxLjc3Mi0xLjA2NSwzLjY5LTEuMDY1LDUuNzAxYzAsOC44MjIsNy4xNzgsMTYsMTYsMTZjNi4yMDYsMCwxMS41OTQtMy41NTUsMTQuMjQ2LTguNzMNCgkJCWMwLjU2Ny0xLjEwNywxLjAwOS0yLjI4OCwxLjMwNy0zLjUyMmMwLjA3NS0wLjMxMywwLjE0MS0wLjYzMSwwLjE5Ny0wLjk0OWMwLjE2MS0wLjkwOSwwLjI0OS0xLjg0MywwLjI0OS0yLjc5Nw0KCQkJQzQwLjUxMywyNy4zMDksNDAuNTExLDI3LjI1NCw0MC41MSwyNy4yeiBNMzUuNjI2LDE4LjU1MmwtMS4wMDctMC4wMDlsLTAuMDYzLTAuMjFsMC42MzEtMC4zMjFsMC4wMDMtMC43MTQNCgkJCWMwLjI1MSwwLjI2NiwwLjQ5NCwwLjU0MSwwLjcyNiwwLjgyNUwzNS42MjYsMTguNTUyeiBNMzcuNzg0LDIxLjQxNEwzNy41LDIxLjQ1M3YtMC42NDhsMC4wOTItMC4xMDQNCgkJCWMwLjEyMSwwLjIzNiwwLjIzNiwwLjQ3NywwLjM0NCwwLjcyTDM3Ljc4NCwyMS40MTR6IE0zOC43NTUsMjQuMDQzbDAuMDQ3LTAuMDU1YzAuMDIxLDAuMDg0LDAuMDM5LDAuMTY2LDAuMDYsMC4yNTENCgkJCUwzOC43NTUsMjQuMDQzeiIvPg0KCQk8cGF0aCBkPSJNMjAuOCwxNS43NTRsLTAuMjA5LDAuMDEzYy0wLjY5OCwwLjg0Ny0xLjUwOCwxLjYwNS0yLjQ0MSwyLjIxNmMtMC4xMDQsMC4xNjMtMC4yMTIsMC4zMzktMC4zMjEsMC41MTdsMC4xNDUsMC4wMzQNCgkJCWwtMC4xMjEsMC40NjhsLTAuMzc1LDAuMTE4bC0wLjAxMS0wLjAyM2MtMC43OTksMS4zMzEtMS42MjUsMi43OTUtMS45MzksMy4zNTdsLTAuODQ2LDEuNTI0bC0xLjEyNiwyLjAyOGwwLjA5NCwwLjE0NA0KCQkJbDEuMjgyLDAuMzE3di0wLjIwN2wwLjUxMiwwLjA3M0wxNS4zOTUsMjYuN2wwLjQwMywwLjA3MmwwLjYyMiwwLjE3bDAuODc4LDEuMDAzbDEuMTIzLDAuMDg0bDAuMTEsMC45MTZsLTAuNzY5LDAuNTM2DQoJCQlsLTAuMDM2LDAuODE3bC0wLjExLDAuNTAxbDEuMTEsMS4zOTFsMC4wODUsMC40NzhjMCwwLDAuNDAzLDAuMTA4LDAuNDUyLDAuMTA4YzAuMDQ4LDAsMC45MDMsMC42NDYsMC45MDMsMC42NDZ2Mi41MTQNCgkJCWwwLjMwNSwwLjA4NmwtMC4yMDgsMS4xNTlsMC41MTIsMC42ODVsLTAuMDk0LDEuMTQ4bDAuNjc3LDEuMTlsMC44NywwLjc1OWwwLjg3NCwwLjAxN2wwLjA4NS0wLjI4bC0wLjY0My0wLjU0MWwwLjAzOC0wLjI2OQ0KCQkJbDAuMTE1LTAuMzNsMC4wMjQtMC4zMzVsLTAuNDM0LTAuMDEybC0wLjIxOS0wLjI3NmwwLjM2MS0wLjM0OGwwLjA0OC0wLjI2MmwtMC40MDItMC4xMTZsMC4wMjQtMC4yNDNsMC41NzQtMC4wODdsMC44NzMtMC40Mg0KCQkJbDAuMjkzLTAuNTM3bDAuOTE2LTEuMTdsLTAuMjA4LTAuOTE3bDAuMjgyLTAuNDg4bDAuODQyLDAuMDI1bDAuNTY3LTAuNDQ4bDAuMTgzLTEuNzY3bDAuNjI5LTAuNzk5bDAuMTA5LTAuNTE0bC0wLjU3My0wLjE4NA0KCQkJbC0wLjM3OS0wLjYyMWwtMS4yOTUtMC4wMTFsLTEuMDI1LTAuMzkybC0wLjA0OC0wLjczbC0wLjM0Mi0wLjZsLTAuOTI3LTAuMDEzbC0wLjUzOC0wLjg0MmwtMC40NzYtMC4yMzFsLTAuMDIzLDAuMjU3DQoJCQlsLTAuODY2LDAuMDUybC0wLjMxNy0wLjQ0MmwtMC45MDMtMC4xODNsLTAuNzQ1LDAuODU5bC0xLjE3MS0wLjE5OGwtMC4wODYtMS4zMTlsLTAuODU0LTAuMTQ2bDAuMzQyLTAuNjQ2bC0wLjA5OS0wLjM3NQ0KCQkJbC0xLjEyMywwLjc1MmwtMC43MDctMC4wODdsLTAuMjUxLTAuNTUybDAuMTU1LTAuNTY5bDAuMzg5LTAuNzE4bDAuODk2LTAuNDU0bDEuNzMyLTAuMDAxbC0wLjAwNSwwLjUyOGwwLjYyMywwLjI5bC0wLjA1LTAuOTAxDQoJCQlsMC40NDktMC40NTFsMC45MDYtMC41OTVsMC4wNjItMC40MTlsMC45MDMtMC45NGwwLjk2LTAuNTMxbC0wLjA4NC0wLjA2OWwwLjY1LTAuNjEybDAuMjM4LDAuMDYzbDAuMTA5LDAuMTM3bDAuMjQ3LTAuMjczDQoJCQlsMC4wNjEtMC4wMjZsLTAuMjcxLTAuMDM5bC0wLjI3NC0wLjA5di0wLjI2NmwwLjE0Ni0wLjEyaDAuMzIybDAuMTQ2LDAuMDY0bDAuMTI3LDAuMjU3bDAuMTU1LTAuMDIzdi0wLjAyNWwwLjA0NSwwLjAxNQ0KCQkJbDAuNDUtMC4wNjlsMC4wNjMtMC4yMjFsMC4yNTYsMC4wNjR2MC4yMzhsLTAuMjM4LDAuMTY0aDAuMDAxbDAuMDM0LDAuMjYybDAuODE1LDAuMjUyYzAsMCwwLDAuMDAzLDAuMDAxLDAuMDFsMC4xODgtMC4wMTcNCgkJCWwwLjAxMy0wLjM1M2wtMC42NDYtMC4yOTVsLTAuMDM2LTAuMTdsMC41MzctMC4xODNsMC4wMjItMC41MTNsLTAuNTYxLTAuMzQybC0wLjAzNy0wLjg2NWwtMC43NywwLjM3N2gtMC4yOGwwLjA3NC0wLjY1OA0KCQkJbC0xLjA0OC0wLjI0OGwtMC40MzMsMC4zMjZ2MC45OThsLTAuNzc4LDAuMjQ3bC0wLjMxLDAuNjUxbC0wLjMzOCwwLjA1NXYtMC44MzFsLTAuNzMyLTAuMTAybC0wLjM2NS0wLjIzOGwtMC4xNDgtMC41MzkNCgkJCWwxLjMxLTAuNzY2bDAuNjQtMC4xOTZsMC4wNjQsMC40MzJsMC4zNTctMC4wMmwwLjAyOC0wLjIxNmwwLjM3My0wLjA1NGwwLjAwNi0wLjA3NmwtMC4xNi0wLjA2NmwtMC4wMzctMC4yMjhsMC40NTgtMC4wMzkNCgkJCWwwLjI3Ny0wLjI4OWwwLjAxNS0wLjAyMWwwLjAwMywwLjAwMmwwLjA4NC0wLjA4OGwwLjk2Ni0wLjEybDAuNDI3LDAuMzYybC0xLjExOCwwLjU5NWwxLjQyMiwwLjMzNmwwLjE4NC0wLjQ3NmgwLjYyM2wwLjIyLTAuNDE1DQoJCQlsLTAuNDM4LTAuMTFWMTUuNDVsLTEuMzc5LTAuNjFsLTAuOTUzLDAuMTFsLTAuNTM2LDAuMjhsMC4wMzcsMC42ODRsLTAuNTYxLTAuMDg2TDIxLjM1LDE1LjQ1bDAuNTM4LTAuNDg4bC0wLjY0OC0wLjAzMQ0KCQkJYy0wLjExMywwLjE2Ny0wLjI0NywwLjMxOC0wLjM2OSwwLjQ3OUwyMC44LDE1Ljc1NHogTTE4LjI3NCwyMS4wMjJsLTAuMjU2LTAuMTM2bDAuMDU1LTAuMzY2bDAuMzM4LTAuMzY1aDAuNDg1TDE4LjI3NCwyMS4wMjJ6DQoJCQkgTTE5LjU3NCwyMS4wMjJsLTAuMjEsMC4yMTFoLTAuNDY3bDAuMDcyLTAuMzE5bDAuMjItMC4wMTlsMC4wNDYtMC4xMWwwLjMzOC0wLjA0NkwxOS41NzQsMjEuMDIyTDE5LjU3NCwyMS4wMjJ6IE0xOS42ODQsMjAuNDQ3DQoJCQlsLTAuMjIsMC4xNDJsLTAuMjc0LDAuMDUxYzAsMCwwLTAuNDM5LDAtMC40ODRoMC40OTRWMjAuNDQ3eiBNMjAuMSwyMC4xMDhsMC4yMjUsMC4xNDFsLTAuMTgsMC4xNDhsLTAuMTc3LTAuMTQ4TDIwLjEsMjAuMTA4eg0KCQkJIE0xOS44MDMsMjAuNDc0aDAuMDM3bDAuNTU4LDAuMTY1djAuMjg0aC0wLjQ2N2wtMC4xMjctMC4xODVMMTkuODAzLDIwLjQ3NEwxOS44MDMsMjAuNDc0eiBNMTkuNDM2LDE5LjY4NmwwLjMwMywwLjI3Ng0KCQkJbC0wLjMwMywwLjA3MlYxOS42ODZ6IE0xOS4xNTMsMTkuNTU5djAuMTc0aDAuMTI3djAuMzAyaC0wLjg3N2wtMC4zMjktMC4wOTJsMC4wODEtMC4yMWwwLjQyMi0wLjE3NEgxOS4xNTN6Ii8+DQoJCTxwYXRoIGQ9Ik0xMi42NjksMjMuMjg1bDAuODQ3LTEuNTI0YzAuMDE5LTAuMDMzLDEuNzgxLTMuMiwyLjkzMS00Ljk2YzIuODk1LTEuNzA1LDQuNjI4LTQuOTMzLDQuNDM0LTguMw0KCQkJYy0wLjI4NS00Ljk0MS00LjUyMi04Ljc2My05LjUyOS04LjQ4NkM2LjM4NywwLjMwMiwyLjU4LDQuNTc2LDIuODY3LDkuNTQyYzAuMTk1LDMuMzU2LDIuMTkyLDYuMjc2LDUuMjMzLDcuNjc2DQoJCQljMS43NDgsMS45MDMsMy41NzQsNC41OTQsMy41OTMsNC42MjJMMTIuNjY5LDIzLjI4NXogTTkuMzY0LDE1LjQzMWwtMC4yMDUtMC4wODhjLTIuNDEtMS4wMzYtNC0zLjMwNy00LjE1Mi01LjkyNQ0KCQkJYy0wLjIxOS0zLjc4NywyLjY4My03LjA0Niw2LjQ2OS03LjI2NWMwLjEzNS0wLjAwOCwwLjI3MS0wLjAxMiwwLjQwNS0wLjAxMmMzLjYzNywwLDYuNjQ5LDIuODQ3LDYuODU5LDYuNDgxDQoJCQljMC4xNTIsMi42MzctMS4yNDYsNS4xNjEtMy41NjIsNi40MzJsLTAuMjI5LDAuMTI2bC0wLjE0NiwwLjIxOGMtMC43MDMsMS4wNTItMS42NTEsMi42NjYtMi4zMjUsMy44NDMNCgkJCWMtMC43NjQtMS4wNDUtMS44NzEtMi40ODUtMi45NjEtMy42NDdMOS4zNjQsMTUuNDMxeiIvPg0KCQk8Y2lyY2xlIGN4PSIxMS44NzMiIGN5PSI4Ljg5MiIgcj0iMy41NDkiLz4NCgk8L2c+DQo8L2c+DQo8L3N2Zz4=" class="h-16 logo svelte-epclpd" alt="More Real Estate Logo" style="filter: brightness(0) invert(1); "> <div class="flex flex-col items-center ml-2 svelte-epclpd"><div class="flex items-center svelte-epclpd"><div class="border-l-2 h-10 border-white mx-2"></div>  <span class="text-3xl font-thin text-white align-middle">SRE</span></div> <span class="mre text-xs uppercase text-white mt-2 svelte-epclpd">sea real estate</span> </div></a></div></div> <div class="relative items-center md:order-2 space-x-1 md:space-x-8 rtl:space-x-reverse"><button type="button" class="hidden inline-flex items-center font-medium justify-center px-4 py-2 text-sm text-gray-900 dark:text-white rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-white svelte-epclpd" data-svelte-h="svelte-zj9fb5">English</button>  <div class="${escape("hidden", true) + " absolute z-0 mt-1 text-base list-none bg-white divide-y divide-gray-100 rounded-lg shadow dark:bg-gray-700 svelte-epclpd"}" id="language-dropdown-menu" style="min-width: 100%;"><ul class="py-2 font-medium svelte-epclpd" role="none" data-svelte-h="svelte-ob7f5o"><li class="svelte-epclpd"><a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white svelte-epclpd" role="menuitem"><div class="inline-flex items-center">English</div></a></li> <li class="svelte-epclpd"><a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white svelte-epclpd" role="menuitem"><div class="inline-flex items-center">Deutsch</div></a></li> <li class="svelte-epclpd"><a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white svelte-epclpd" role="menuitem"><div class="inline-flex items-center">Italiano</div></a></li> <li class="svelte-epclpd"><a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white svelte-epclpd" role="menuitem"><div class="inline-flex items-center">中文 (繁體)</div></a></li></ul></div> <button class="hamburger inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 svelte-epclpd" data-svelte-h="svelte-14d11ly"><span class="sr-only">Open main menu</span> <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 1h15M1 7h15M1 13h15"></path></svg></button></div> <div class="${escape("hidden", true) + " flex-col xl:hidden mobile-nav-menu svelte-epclpd"}"${add_attribute("this", navMenu, 0)}><a href="/" class="py-2 px-3 text-gray-900 hover:bg-gray-100 svelte-epclpd" data-svelte-h="svelte-c1dg5c">Главная</a> <a href="/objects" class="py-2 px-3 text-gray-900 hover:bg-gray-100 svelte-epclpd" data-svelte-h="svelte-bzrnqs">Каталог</a> <a href="#" class="py-2 px-3 text-gray-900 hover:bg-gray-100 svelte-epclpd" data-svelte-h="svelte-1iraxrk">О нас</a> <a href="#" class="py-2 px-3 text-gray-900 hover:bg-gray-100 svelte-epclpd" data-svelte-h="svelte-p298pc">Документы</a> <a href="#" class="py-2 px-3 text-gray-900 hover:bg-gray-100 svelte-epclpd" data-svelte-h="svelte-pku4ee">Контакты</a></div> <div class="navmenu items-center justify-between hidden w-full md:flex md:w-auto md:order-1 svelte-epclpd" id="navbar-language" data-svelte-h="svelte-1fais7j"><ul class="flex flex-col font-medium p-4 md:p-0 mt-4 border border-gray-100 rounded-lg md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0  svelte-epclpd"><li class="svelte-epclpd"><a href="/" class="menu block py-2 px-3 md:p-0 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700 svelte-epclpd" aria-current="page">Главная</a></li> <li class="svelte-epclpd"><a href="/objects" class="block py-2 px-3 md:p-0 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700 svelte-epclpd">Каталог</a></li> <li class="svelte-epclpd"><a href="/about" class="block py-2 px-3 md:p-0 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700 svelte-epclpd">О нас</a></li> <li class="svelte-epclpd"><a href="/404" class="block py-2 px-3 md:p-0 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700 svelte-epclpd">Документы</a></li> <li class="svelte-epclpd"><a href="/contacts" class="block py-2 px-3 md:p-0 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700 svelte-epclpd">Контакты</a></li></ul> <ul class="contacts mr-0 text-xs svelte-epclpd"><li class="mb-0 svelte-epclpd"><a href="https://flowbite.com/" class="hover:underline svelte-epclpd">+359 895-340-006</a></li> <li class="mb-0 svelte-epclpd"><a href="https://tailwindcss.com/" class="hover:underline svelte-epclpd">+359 877-580-966</a></li> <li class="mb-0 svelte-epclpd"><a href="https://tailwindcss.com/" class="hover:underline svelte-epclpd">+38(93)053-55-25</a></li></ul></div></div></div> </nav>`;
});
const css$2 = {
  code: "button.svelte-1wl91qp{transition:opacity 0.3s;margin-bottom:40px;z-index:20;border-radius:1000px;height:60px;width:60px}",
  map: null
};
const ScrollToTopButton = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  $$result.css.add(css$2);
  return `${``}`;
});
const css$1 = {
  code: ".container.svelte-10yoqw8.svelte-10yoqw8{display:flex;align-items:center;justify-content:center;min-height:100vh;min-width:100%;background-color:rgb(var(--color-surface-900));background-image:radial-gradient(at 100% 0%, rgba(var(--color-secondary-500) / 0.33) 0px, transparent 50%), radial-gradient(at 2% 1%, rgba(var(--color-error-500) / 0.33) 0px, transparent 50%);overflow-x:hidden}.logotype.svelte-10yoqw8.svelte-10yoqw8{position:absolute;top:0;bottom:0;left:0;right:0;margin:auto;transform:scale(0.5)}.logotype.svelte-10yoqw8 img.svelte-10yoqw8{margin-bottom:50px;margin-right:-20px;margin-left:-10px}.loader.svelte-10yoqw8.svelte-10yoqw8{max-width:15rem;width:100%;height:auto;stroke-linecap:round}circle.svelte-10yoqw8.svelte-10yoqw8{fill:none;stroke-width:3.5;animation-name:svelte-10yoqw8-preloader;animation-duration:3s;animation-iteration-count:infinite;animation-timing-function:ease-in-out;transform-origin:170px 170px;will-change:transform}circle.svelte-10yoqw8.svelte-10yoqw8:nth-of-type(1){stroke-dasharray:550px;animation-delay:-0.15s}circle.svelte-10yoqw8.svelte-10yoqw8:nth-of-type(2){stroke-dasharray:500px;animation-delay:-0.3s}circle.svelte-10yoqw8.svelte-10yoqw8:nth-of-type(3){stroke-dasharray:450px;animation-delay:-0.45s}circle.svelte-10yoqw8.svelte-10yoqw8:nth-of-type(4){stroke-dasharray:300px;animation-delay:-0.6s}@keyframes svelte-10yoqw8-preloader{50%{transform:rotate(360deg)}}.loaded.svelte-10yoqw8.svelte-10yoqw8{animation:svelte-10yoqw8-fadeOutPage 2s ease-out forwards}@keyframes svelte-10yoqw8-fadeOutPage{from{opacity:1;visibility:visible}to{opacity:0;visibility:hidden}}",
  map: null
};
function preventScroll() {
  if (typeof window !== "undefined") {
    document.body.style.overflow = "hidden";
  }
}
function allowScroll() {
  if (typeof window !== "undefined") {
    document.body.style.overflow = "";
  }
}
const Preloader = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $loading, $$unsubscribe_loading;
  let { loading: loading2 } = $$props;
  $$unsubscribe_loading = subscribe(loading2, (value) => $loading = value);
  if ($$props.loading === void 0 && $$bindings.loading && loading2 !== void 0)
    $$bindings.loading(loading2);
  $$result.css.add(css$1);
  {
    if (typeof window !== "undefined") {
      if ($loading) {
        preventScroll();
      } else {
        allowScroll();
      }
    }
  }
  $$unsubscribe_loading();
  return `<div class="${["preloader svelte-10yoqw8", !loading2 ? "loaded" : ""].join(" ").trim()}" data-svelte-h="svelte-5ayylk"><div class="logotype mb-0 md:mb-0 flex items-center justify-center svelte-10yoqw8"><a href="https://sea-estate.com/" class="flex items-center"><img src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pg0KPCEtLSBVcGxvYWRlZCB0bzogU1ZHIFJlcG8sIHd3dy5zdmdyZXBvLmNvbSwgR2VuZXJhdG9yOiBTVkcgUmVwbyBNaXhlciBUb29scyAtLT4NCjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+DQo8c3ZnIGZpbGw9IiMwMDAwMDAiIHZlcnNpb249IjEuMSIgaWQ9IkNhcGFfMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgDQoJIHdpZHRoPSI4MDBweCIgaGVpZ2h0PSI4MDBweCIgdmlld0JveD0iMCAwIDQzLjM2NCA0My4zNjQiDQoJIHhtbDpzcGFjZT0icHJlc2VydmUiPg0KPGc+DQoJPGc+DQoJCTxwb2x5Z29uIHBvaW50cz0iMzEuNDU4LDE5LjMgMzEuODg2LDE5LjMgMzIuNDUzLDE5LjI0NSAzMi43NDYsMTguODk3IDMyLjQzNSwxOC43NzYgMzIuMjY1LDE4LjU3OSAzMi4wMDgsMTguMTY1IDMxLjg4NiwxNy41NzkgDQoJCQkzMS40MDUsMTcuNjc3IDMxLjI2OSwxNy44ODMgMzEuMjY5LDE4LjExNiAzMS41MDEsMTguMjc1IDMxLjgzMSwxOC40ODMgMzEuODYxLDE4LjcyIDMxLjUwNywxOC43OTMgCQkiLz4NCgkJPHBvbHlnb24gcG9pbnRzPSIzMC43NywxOC4zMjkgMzAuNDc3LDE4Ljc5OSAzMC40NzcsMTkuMTA0IDMwLjgxOCwxOS4xMDQgMzEuNDIyLDE4LjY3NyAzMS40NDcsMTguMzYgMzEuMTY0LDE4LjIzOCAJCSIvPg0KCQk8cGF0aCBkPSJNMjMuMjA3LDIwLjI0OGgtMC40MjF2MC4yMTZoMC4xMDJjMCwwLDAuMDA1LDAuMDQ3LDAuMDE1LDAuMTA2bDAuMjU3LTAuMDIxbDAuMTYyLTAuMWwwLjA0Mi0wLjIwMmwwLjIwOS0wLjAxOQ0KCQkJbDAuMDgyLTAuMTdsLTAuMTkxLTAuMDM5bC0wLjE2NywwLjAwM0wyMy4yMDcsMjAuMjQ4eiIvPg0KCQk8cG9seWdvbiBwb2ludHM9IjIyLjE5MywyMC42MyAyMi40OTgsMjAuNjA1IDIyLjUzMSwyMC4zOTIgMjIuMzQ2LDIwLjI0OCAyMi4yMDksMjAuNDE5IAkJIi8+DQoJCTxwYXRoIGQ9Ik00MC41MSwyNy4yYy0wLjAwNS0wLjQ2OS0wLjAyOS0wLjkzMy0wLjA3My0xLjM5MWMtMC4xNDYtMS41MjQtMC41MTMtMi45ODUtMS4wNi00LjM1NQ0KCQkJYy0wLjA0MS0wLjEwMy0wLjA3OS0wLjIwNi0wLjEyLTAuMzA3Yy0wLjcyOS0xLjcyLTEuNzUyLTMuMjg0LTMuMDAyLTQuNjM2Yy0wLjA4Mi0wLjA4OS0wLjE2NS0wLjE3NS0wLjI0OS0wLjI2Mg0KCQkJYy0wLjIzNy0wLjI0NC0wLjQ3OC0wLjQ4NC0wLjczMS0wLjcxNGMtMi44NDQtMi41OS02LjYyMS00LjE3MS0xMC43NjItNC4xNzFjLTAuNTg1LDAtMS4xNiwwLjAzOS0xLjcyOSwwLjEwMQ0KCQkJYy0wLjEyMywwLjQ3My0wLjI3NiwwLjkzNC0wLjQ1OSwxLjM4NWMwLjcxNS0wLjEwNywxLjQ0NC0wLjE2OSwyLjE4OC0wLjE2OWMzLjcxMiwwLDcuMTA2LDEuMzg4LDkuNjk0LDMuNjY4bC0wLjE3NCwwLjMxMw0KCQkJbC0wLjY3OSwwLjI2NWwtMC4yODMsMC4zMWwwLjA2NCwwLjM2MmwwLjM1LDAuMDQ4bDAuMjEyLDAuNTI2bDAuNjAyLTAuMjQybDAuMSwwLjcwNGgtMC4xODJsLTAuNDk2LTAuMDczbC0wLjU0OCwwLjA5Mg0KCQkJbC0wLjUzMSwwLjc1bC0wLjc1OSwwLjEybC0wLjExLDAuNjQ5bDAuMzIsMC4wNzZsLTAuMDkyLDAuNDE4bC0wLjc1NS0wLjE1MmwtMC42OTIsMC4xNTJsLTAuMTQ2LDAuMzg0bDAuMTE5LDAuODA5bDAuNDA1LDAuMTg5DQoJCQlsMC42ODItMC4wMDRsMC40NTktMC4wNDJsMC4xNDItMC4zNjVsMC43MTctMC45MzVsMC40NzUsMC4wOTdsMC40NjYtMC40MjFsMC4wODYsMC4zMjlsMS4xNDYsMC43NzJsLTAuMTQsMC4xODhsLTAuNTE3LTAuMDI4DQoJCQlsMC4xOTgsMC4yODJsMC4zMTgsMC4wN2wwLjM3My0wLjE1NWwtMC4wMDctMC40NDlsMC4xNjYtMC4wODNsLTAuMTMzLTAuMTQxTDM0LjYsMjAuNzM4bC0wLjIwMi0wLjU2NmgwLjYzN2wwLjIwMiwwLjIwMQ0KCQkJbDAuNTQ4LDAuNDcybDAuMDIyLDAuNTdsMC41NjcsMC42MDRsMC4yMTEtMC44MjhsMC4zOTMtMC4yMTNsMC4wNzMsMC42NzdsMC4zODQsMC40MjJsMC43NjYtMC4wMTUNCgkJCWMwLjE0NywwLjM4MSwwLjI4LDAuNzcsMC4zOTYsMS4xNjRsLTAuMDgyLDAuMDc1aC0xLjE3MUwzNi42MywyMi43N2wtMC43NSwwLjA3MnYwLjQ1OWgtMC4yMzlsLTAuMjU1LTAuMTg0bC0xLjMtMC4zMjl2LTAuODQyDQoJCQlsLTEuNjQ3LDAuMTI5bC0wLjUxMiwwLjI3MmgtMC42NTRsLTAuMzItMC4wMzJsLTAuNzk0LDAuNDQxdjAuODI5bC0xLjYyMiwxLjE3MmwwLjEzNCwwLjVIMjlsLTAuMDg3LDAuNDc3bC0wLjIzMSwwLjA4OA0KCQkJbC0wLjAxMiwxLjI0NGwxLjQwMywxLjU5OWgwLjYwOWwwLjAzOC0wLjA5OWgxLjA5OWwwLjMxNS0wLjI5MmgwLjYyNGwwLjM0MSwwLjM0MmwwLjkyOCwwLjA5OGwtMC4xMjMsMS4yMzJsMS4wMywxLjgxNw0KCQkJbC0wLjU0MiwxLjAzN2wwLjAzNywwLjQ4OGwwLjQyOCwwLjQyN3YxLjE3NGwwLjU2MSwwLjc1NXYwLjk3N2gwLjQ4NWMtMi42OTUsMy4zMS02LjgsNS40MjktMTEuMzksNS40MjkNCgkJCWMtOC4wOTcsMC0xNC42ODQtNi41ODgtMTQuNjg0LTE0LjY4NWMwLTEuNTI2LDAuMjM1LTIuOTk5LDAuNjY5LTQuMzg1bC0wLjIwMS0wLjI5OGMtMC4wNjctMC4wOTktMC4zMzQtMC40ODYtMC43MTktMS4wMg0KCQkJYy0wLjY4MSwxLjc3Mi0xLjA2NSwzLjY5LTEuMDY1LDUuNzAxYzAsOC44MjIsNy4xNzgsMTYsMTYsMTZjNi4yMDYsMCwxMS41OTQtMy41NTUsMTQuMjQ2LTguNzMNCgkJCWMwLjU2Ny0xLjEwNywxLjAwOS0yLjI4OCwxLjMwNy0zLjUyMmMwLjA3NS0wLjMxMywwLjE0MS0wLjYzMSwwLjE5Ny0wLjk0OWMwLjE2MS0wLjkwOSwwLjI0OS0xLjg0MywwLjI0OS0yLjc5Nw0KCQkJQzQwLjUxMywyNy4zMDksNDAuNTExLDI3LjI1NCw0MC41MSwyNy4yeiBNMzUuNjI2LDE4LjU1MmwtMS4wMDctMC4wMDlsLTAuMDYzLTAuMjFsMC42MzEtMC4zMjFsMC4wMDMtMC43MTQNCgkJCWMwLjI1MSwwLjI2NiwwLjQ5NCwwLjU0MSwwLjcyNiwwLjgyNUwzNS42MjYsMTguNTUyeiBNMzcuNzg0LDIxLjQxNEwzNy41LDIxLjQ1M3YtMC42NDhsMC4wOTItMC4xMDQNCgkJCWMwLjEyMSwwLjIzNiwwLjIzNiwwLjQ3NywwLjM0NCwwLjcyTDM3Ljc4NCwyMS40MTR6IE0zOC43NTUsMjQuMDQzbDAuMDQ3LTAuMDU1YzAuMDIxLDAuMDg0LDAuMDM5LDAuMTY2LDAuMDYsMC4yNTENCgkJCUwzOC43NTUsMjQuMDQzeiIvPg0KCQk8cGF0aCBkPSJNMjAuOCwxNS43NTRsLTAuMjA5LDAuMDEzYy0wLjY5OCwwLjg0Ny0xLjUwOCwxLjYwNS0yLjQ0MSwyLjIxNmMtMC4xMDQsMC4xNjMtMC4yMTIsMC4zMzktMC4zMjEsMC41MTdsMC4xNDUsMC4wMzQNCgkJCWwtMC4xMjEsMC40NjhsLTAuMzc1LDAuMTE4bC0wLjAxMS0wLjAyM2MtMC43OTksMS4zMzEtMS42MjUsMi43OTUtMS45MzksMy4zNTdsLTAuODQ2LDEuNTI0bC0xLjEyNiwyLjAyOGwwLjA5NCwwLjE0NA0KCQkJbDEuMjgyLDAuMzE3di0wLjIwN2wwLjUxMiwwLjA3M0wxNS4zOTUsMjYuN2wwLjQwMywwLjA3MmwwLjYyMiwwLjE3bDAuODc4LDEuMDAzbDEuMTIzLDAuMDg0bDAuMTEsMC45MTZsLTAuNzY5LDAuNTM2DQoJCQlsLTAuMDM2LDAuODE3bC0wLjExLDAuNTAxbDEuMTEsMS4zOTFsMC4wODUsMC40NzhjMCwwLDAuNDAzLDAuMTA4LDAuNDUyLDAuMTA4YzAuMDQ4LDAsMC45MDMsMC42NDYsMC45MDMsMC42NDZ2Mi41MTQNCgkJCWwwLjMwNSwwLjA4NmwtMC4yMDgsMS4xNTlsMC41MTIsMC42ODVsLTAuMDk0LDEuMTQ4bDAuNjc3LDEuMTlsMC44NywwLjc1OWwwLjg3NCwwLjAxN2wwLjA4NS0wLjI4bC0wLjY0My0wLjU0MWwwLjAzOC0wLjI2OQ0KCQkJbDAuMTE1LTAuMzNsMC4wMjQtMC4zMzVsLTAuNDM0LTAuMDEybC0wLjIxOS0wLjI3NmwwLjM2MS0wLjM0OGwwLjA0OC0wLjI2MmwtMC40MDItMC4xMTZsMC4wMjQtMC4yNDNsMC41NzQtMC4wODdsMC44NzMtMC40Mg0KCQkJbDAuMjkzLTAuNTM3bDAuOTE2LTEuMTdsLTAuMjA4LTAuOTE3bDAuMjgyLTAuNDg4bDAuODQyLDAuMDI1bDAuNTY3LTAuNDQ4bDAuMTgzLTEuNzY3bDAuNjI5LTAuNzk5bDAuMTA5LTAuNTE0bC0wLjU3My0wLjE4NA0KCQkJbC0wLjM3OS0wLjYyMWwtMS4yOTUtMC4wMTFsLTEuMDI1LTAuMzkybC0wLjA0OC0wLjczbC0wLjM0Mi0wLjZsLTAuOTI3LTAuMDEzbC0wLjUzOC0wLjg0MmwtMC40NzYtMC4yMzFsLTAuMDIzLDAuMjU3DQoJCQlsLTAuODY2LDAuMDUybC0wLjMxNy0wLjQ0MmwtMC45MDMtMC4xODNsLTAuNzQ1LDAuODU5bC0xLjE3MS0wLjE5OGwtMC4wODYtMS4zMTlsLTAuODU0LTAuMTQ2bDAuMzQyLTAuNjQ2bC0wLjA5OS0wLjM3NQ0KCQkJbC0xLjEyMywwLjc1MmwtMC43MDctMC4wODdsLTAuMjUxLTAuNTUybDAuMTU1LTAuNTY5bDAuMzg5LTAuNzE4bDAuODk2LTAuNDU0bDEuNzMyLTAuMDAxbC0wLjAwNSwwLjUyOGwwLjYyMywwLjI5bC0wLjA1LTAuOTAxDQoJCQlsMC40NDktMC40NTFsMC45MDYtMC41OTVsMC4wNjItMC40MTlsMC45MDMtMC45NGwwLjk2LTAuNTMxbC0wLjA4NC0wLjA2OWwwLjY1LTAuNjEybDAuMjM4LDAuMDYzbDAuMTA5LDAuMTM3bDAuMjQ3LTAuMjczDQoJCQlsMC4wNjEtMC4wMjZsLTAuMjcxLTAuMDM5bC0wLjI3NC0wLjA5di0wLjI2NmwwLjE0Ni0wLjEyaDAuMzIybDAuMTQ2LDAuMDY0bDAuMTI3LDAuMjU3bDAuMTU1LTAuMDIzdi0wLjAyNWwwLjA0NSwwLjAxNQ0KCQkJbDAuNDUtMC4wNjlsMC4wNjMtMC4yMjFsMC4yNTYsMC4wNjR2MC4yMzhsLTAuMjM4LDAuMTY0aDAuMDAxbDAuMDM0LDAuMjYybDAuODE1LDAuMjUyYzAsMCwwLDAuMDAzLDAuMDAxLDAuMDFsMC4xODgtMC4wMTcNCgkJCWwwLjAxMy0wLjM1M2wtMC42NDYtMC4yOTVsLTAuMDM2LTAuMTdsMC41MzctMC4xODNsMC4wMjItMC41MTNsLTAuNTYxLTAuMzQybC0wLjAzNy0wLjg2NWwtMC43NywwLjM3N2gtMC4yOGwwLjA3NC0wLjY1OA0KCQkJbC0xLjA0OC0wLjI0OGwtMC40MzMsMC4zMjZ2MC45OThsLTAuNzc4LDAuMjQ3bC0wLjMxLDAuNjUxbC0wLjMzOCwwLjA1NXYtMC44MzFsLTAuNzMyLTAuMTAybC0wLjM2NS0wLjIzOGwtMC4xNDgtMC41MzkNCgkJCWwxLjMxLTAuNzY2bDAuNjQtMC4xOTZsMC4wNjQsMC40MzJsMC4zNTctMC4wMmwwLjAyOC0wLjIxNmwwLjM3My0wLjA1NGwwLjAwNi0wLjA3NmwtMC4xNi0wLjA2NmwtMC4wMzctMC4yMjhsMC40NTgtMC4wMzkNCgkJCWwwLjI3Ny0wLjI4OWwwLjAxNS0wLjAyMWwwLjAwMywwLjAwMmwwLjA4NC0wLjA4OGwwLjk2Ni0wLjEybDAuNDI3LDAuMzYybC0xLjExOCwwLjU5NWwxLjQyMiwwLjMzNmwwLjE4NC0wLjQ3NmgwLjYyM2wwLjIyLTAuNDE1DQoJCQlsLTAuNDM4LTAuMTFWMTUuNDVsLTEuMzc5LTAuNjFsLTAuOTUzLDAuMTFsLTAuNTM2LDAuMjhsMC4wMzcsMC42ODRsLTAuNTYxLTAuMDg2TDIxLjM1LDE1LjQ1bDAuNTM4LTAuNDg4bC0wLjY0OC0wLjAzMQ0KCQkJYy0wLjExMywwLjE2Ny0wLjI0NywwLjMxOC0wLjM2OSwwLjQ3OUwyMC44LDE1Ljc1NHogTTE4LjI3NCwyMS4wMjJsLTAuMjU2LTAuMTM2bDAuMDU1LTAuMzY2bDAuMzM4LTAuMzY1aDAuNDg1TDE4LjI3NCwyMS4wMjJ6DQoJCQkgTTE5LjU3NCwyMS4wMjJsLTAuMjEsMC4yMTFoLTAuNDY3bDAuMDcyLTAuMzE5bDAuMjItMC4wMTlsMC4wNDYtMC4xMWwwLjMzOC0wLjA0NkwxOS41NzQsMjEuMDIyTDE5LjU3NCwyMS4wMjJ6IE0xOS42ODQsMjAuNDQ3DQoJCQlsLTAuMjIsMC4xNDJsLTAuMjc0LDAuMDUxYzAsMCwwLTAuNDM5LDAtMC40ODRoMC40OTRWMjAuNDQ3eiBNMjAuMSwyMC4xMDhsMC4yMjUsMC4xNDFsLTAuMTgsMC4xNDhsLTAuMTc3LTAuMTQ4TDIwLjEsMjAuMTA4eg0KCQkJIE0xOS44MDMsMjAuNDc0aDAuMDM3bDAuNTU4LDAuMTY1djAuMjg0aC0wLjQ2N2wtMC4xMjctMC4xODVMMTkuODAzLDIwLjQ3NEwxOS44MDMsMjAuNDc0eiBNMTkuNDM2LDE5LjY4NmwwLjMwMywwLjI3Ng0KCQkJbC0wLjMwMywwLjA3MlYxOS42ODZ6IE0xOS4xNTMsMTkuNTU5djAuMTc0aDAuMTI3djAuMzAyaC0wLjg3N2wtMC4zMjktMC4wOTJsMC4wODEtMC4yMWwwLjQyMi0wLjE3NEgxOS4xNTN6Ii8+DQoJCTxwYXRoIGQ9Ik0xMi42NjksMjMuMjg1bDAuODQ3LTEuNTI0YzAuMDE5LTAuMDMzLDEuNzgxLTMuMiwyLjkzMS00Ljk2YzIuODk1LTEuNzA1LDQuNjI4LTQuOTMzLDQuNDM0LTguMw0KCQkJYy0wLjI4NS00Ljk0MS00LjUyMi04Ljc2My05LjUyOS04LjQ4NkM2LjM4NywwLjMwMiwyLjU4LDQuNTc2LDIuODY3LDkuNTQyYzAuMTk1LDMuMzU2LDIuMTkyLDYuMjc2LDUuMjMzLDcuNjc2DQoJCQljMS43NDgsMS45MDMsMy41NzQsNC41OTQsMy41OTMsNC42MjJMMTIuNjY5LDIzLjI4NXogTTkuMzY0LDE1LjQzMWwtMC4yMDUtMC4wODhjLTIuNDEtMS4wMzYtNC0zLjMwNy00LjE1Mi01LjkyNQ0KCQkJYy0wLjIxOS0zLjc4NywyLjY4My03LjA0Niw2LjQ2OS03LjI2NWMwLjEzNS0wLjAwOCwwLjI3MS0wLjAxMiwwLjQwNS0wLjAxMmMzLjYzNywwLDYuNjQ5LDIuODQ3LDYuODU5LDYuNDgxDQoJCQljMC4xNTIsMi42MzctMS4yNDYsNS4xNjEtMy41NjIsNi40MzJsLTAuMjI5LDAuMTI2bC0wLjE0NiwwLjIxOGMtMC43MDMsMS4wNTItMS42NTEsMi42NjYtMi4zMjUsMy44NDMNCgkJCWMtMC43NjQtMS4wNDUtMS44NzEtMi40ODUtMi45NjEtMy42NDdMOS4zNjQsMTUuNDMxeiIvPg0KCQk8Y2lyY2xlIGN4PSIxMS44NzMiIGN5PSI4Ljg5MiIgcj0iMy41NDkiLz4NCgk8L2c+DQo8L2c+DQo8L3N2Zz4=" class="h-16 logo svelte-10yoqw8" alt="More Real Estate Logo" style="filter: brightness(0) invert(1); "> <div class="flex flex-col items-center ml-2"><div class="flex items-center"><div class="border-l-2 h-10 border-white mx-2"></div>  <span class="text-3xl font-thin text-white align-middle">SRE</span></div> <span class="mre text-xs uppercase text-white mt-2">sea real estate</span> </div></a></div> <div class="container svelte-10yoqw8"><svg class="loader svelte-10yoqw8" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 340 340"><circle cx="170" cy="170" r="160" stroke="#E2007C" class="svelte-10yoqw8"></circle><circle cx="170" cy="170" r="135" stroke="#404041" class="svelte-10yoqw8"></circle><circle cx="170" cy="170" r="110" stroke="#E2007C" class="svelte-10yoqw8"></circle><circle cx="170" cy="170" r="85" stroke="#404041" class="svelte-10yoqw8"></circle></svg></div> </div>`;
});
const phone = {
  phone: {
    width: 1408,
    height: 1792,
    paths: [
      {
        d: "M1408 1240q0 27-10 70.5t-21 68.5q-21 50-122 106-94 51-186 51-27 0-53-3.5t-57.5-12.5-47-14.5-55.5-20.5-49-18q-98-35-175-83-127-79-264-216t-216-264q-48-77-83-175-3-9-18-49t-20.5-55.5-14.5-47-12.5-57.5-3.5-53q0-92 51-186 56-101 106-122 25-11 68.5-21t70.5-10q14 0 21 3 18 6 53 76 11 19 30 54t35 63.5 31 53.5q3 4 17.5 25t21.5 35.5 7 28.5q0 20-28.5 50t-62 55-62 53-28.5 46q0 9 5 22.5t8.5 20.5 14 24 11.5 19q76 137 174 235t235 174q2 1 19 11.5t24 14 20.5 8.5 22.5 5q18 0 46-28.5t53-62 55-62 50-28.5q14 0 28.5 7t35.5 21.5 25 17.5q25 15 53.5 31t63.5 35 54 30q70 35 76 53 3 7 3 21z"
      }
    ]
  }
};
const css = {
  code: "@import './global.css';.callback.svelte-1pyeytf{box-shadow:0 0 10px 0 #12ad9d;z-index:9999;width:60px;height:60px;border-radius:1000px}",
  map: null
};
const Layout = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $loading, $$unsubscribe_loading;
  $$unsubscribe_loading = subscribe(loading, (value) => $loading = value);
  let preloader;
  setContext("loading", loading);
  $$result.css.add(css);
  let $$settled;
  let $$rendered;
  let previous_head = $$result.head;
  do {
    $$settled = true;
    $$result.head = previous_head;
    $$rendered = `${$$result.head += `<!-- HEAD_svelte-1z0fv79_START --><script async src="https://www.googletagmanager.com/gtag/js?id=G-2EQQHPBC9X" data-svelte-h="svelte-1yxeyew"><\/script><script src="https://unpkg.com/three@0.140.2/build/three.min.js" data-svelte-h="svelte-1aqmw51"><\/script><!-- HEAD_svelte-1z0fv79_END -->`, ""} ${$loading ? `${validate_component(Preloader, "Preloader").$$render(
      $$result,
      { this: preloader },
      {
        this: ($$value) => {
          preloader = $$value;
          $$settled = false;
        }
      },
      {}
    )}` : ``} ${validate_component(Nav, "Nav").$$render($$result, {}, {}, {})} <main>${slots.default ? slots.default({}) : ``} ${validate_component(Footer, "Footer").$$render($$result, {}, {}, {})}</main> ${validate_component(Modal, "Modal").$$render($$result, {}, {}, {})} <button type="button" class="callback text-white bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-teal-300 dark:focus:ring-teal-800 shadow-lg shadow-teal-500/50 dark:shadow-lg dark:shadow-teal-800/80 font-medium rounded-lg text-sm text-center me-2 mb-2 fixed bottom-5 right-10 svelte-1pyeytf" button>${validate_component(Icon, "Icon").$$render(
      $$result,
      {
        data: phone,
        style: "width: 30px; height: 30px;"
      },
      {},
      {}
    )}</button> ${validate_component(ScrollToTopButton, "ScrollToTopButton").$$render($$result, {}, {}, {})}`;
  } while (!$$settled);
  $$unsubscribe_loading();
  return $$rendered;
});
export {
  Layout as default
};
