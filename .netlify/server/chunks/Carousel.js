import { c as create_ssr_component, a as add_attribute, b as each } from "./ssr.js";
import "./Carousel.svelte_svelte_type_style_lang.js";
const css = {
  code: ".carousel.svelte-vilkyr{position:relative}.carousel-button.svelte-vilkyr{position:absolute;top:50%;transform:translateY(-50%);background-color:rgba(0, 0, 0, 0.5);border-radius:50%;border:none;cursor:pointer;width:40px;height:40px;display:flex;align-items:center;justify-content:center}.arrow-icon.svelte-vilkyr{color:#fff}.carousel-button.left.svelte-vilkyr{left:10px}.carousel-button.right.svelte-vilkyr{right:10px}.carousel-container.svelte-vilkyr{display:flex;overflow-x:scroll;scroll-snap-type:x mandatory;margin:0 auto;scroll-behavior:smooth}.carousel-image.svelte-vilkyr{flex:0 0 auto;scroll-snap-align:start;width:100%;height:800px;object-fit:cover;border-radius:10px}.thumbnails.svelte-vilkyr{display:grid;grid-template-columns:repeat(auto-fill, minmax(100px, 1fr));overflow-y:auto;gap:10px;padding:10px 0;height:220px;grid-auto-rows:100px}.thumbnail-button.svelte-vilkyr{border:none;background:none;padding:0;cursor:pointer}.thumbnail-image.svelte-vilkyr{width:100%;height:100%;object-fit:cover;border-radius:10px}@media(max-width: 768px){.carousel-image.svelte-vilkyr{height:250px}}",
  map: null
};
const Carousel = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { images = [] } = $$props;
  let elemCarousel;
  if ($$props.images === void 0 && $$bindings.images && images !== void 0)
    $$bindings.images(images);
  $$result.css.add(css);
  return ` <div class="carousel svelte-vilkyr"> <button type="button" class="carousel-button left svelte-vilkyr" data-svelte-h="svelte-1sft7rd"><i class="fa-solid fa-arrow-left arrow-icon svelte-vilkyr"></i></button>  <div class="carousel-container svelte-vilkyr"${add_attribute("this", elemCarousel, 0)}>${each(images, (image, i) => {
    return `<img class="carousel-image svelte-vilkyr"${add_attribute("src", image, 0)} alt="Image" loading="lazy">`;
  })}</div>  <button type="button" class="carousel-button right svelte-vilkyr" data-svelte-h="svelte-fw07o"><i class="fa-solid fa-arrow-right arrow-icon svelte-vilkyr"></i></button></div>  <div class="thumbnails svelte-vilkyr">${each(images, (image, i) => {
    return `<button type="button" class="thumbnail-button svelte-vilkyr"><img class="thumbnail-image svelte-vilkyr"${add_attribute("src", image, 0)} alt="Thumbnail" loading="lazy"> </button>`;
  })} </div>`;
});
export {
  Carousel as C
};
