import { c as create_ssr_component, a as add_attribute, e as escape, v as validate_component } from "../../chunks/ssr.js";
import { F as FeedbackForm } from "../../chunks/FeedbackForm.js";
const css$1 = {
  code: ".container.svelte-mg66f1{background:transparent}",
  map: null
};
const InfoBlock = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  $$result.css.add(css$1);
  return `${``}`;
});
const css = {
  code: ".progress-bar.svelte-znxi09.svelte-znxi09{position:absolute;top:45%;left:0;width:100%;height:4px;background-color:white;z-index:10}.overlay.svelte-znxi09.svelte-znxi09{backdrop-filter:blur(10px);border-radius:15px;position:absolute;bottom:29%;background-color:rgba(0, 0, 0, 0.5);padding:20px 20px 60px;max-width:500px;width:500px;margin:auto;text-align:center;transition:left 1s ease;transform:translateX(-50%);min-height:420px}.overlay.svelte-znxi09 h2.svelte-znxi09{font-size:32px;margin-bottom:55px;color:white}.overlay.svelte-znxi09 p.svelte-znxi09{margin-top:55px;color:white}.overlay.svelte-znxi09 button.svelte-znxi09{background-color:white;border:none;padding:10px 15px;margin-top:30px;align-self:start}",
  map: null
};
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let currentSlide = 0;
  const overlaysContent = [
    {
      title: "Погружение в райскую природу:",
      paragraph: "Инвестируйте в свой уголок среди изумрудных гор и бескрайних пляжей Черного моря.",
      button: "Подробнее"
    },
    {
      title: "Разнообразие недвижимости:",
      paragraph: "От стильных апартаментов до вилл с потрясающим видом на море - мы предлагаем разнообразие вариантов, чтобы воплотить ваши мечты в реальность.",
      button: "Подробнее"
    },
    {
      title: "Инвестиции с умом: ",
      paragraph: "Наша команда экспертов поможет вам сделать выгодные инвестиции в болгарскую недвижимость, обеспечивая стабильный доход и рост капитала.",
      button: "Подробнее"
    },
    {
      title: "Простой процесс сделки: ",
      paragraph: "Мы делаем покупку недвижимости в Болгарии легкой и прозрачной. Надежное сопровождение сделки от начала до конца.",
      button: "Подробнее"
    },
    {
      title: "Обретите свой уголок под солнцем с нами.",
      paragraph: "Выберите Болгарию для вашего нового дома или инвестиций! ",
      button: "Подробнее"
    }
  ];
  $$result.css.add(css);
  return `${$$result.head += `<!-- HEAD_svelte-1aap4xz_START --><script src="/splide-shader-carousel.min.js" defer data-svelte-h="svelte-147jny7"><\/script><!-- HEAD_svelte-1aap4xz_END -->`, ""} <section class="splide" aria-label="Splide Shader Carousel Example"><div class="splide__track" data-svelte-h="svelte-171k5ey"><ul class="splide__list"><li class="splide__slide"><img src="https://images.ctfassets.net/31g2btibassa/5S3oxQ5YnMis48RHU5EDlW/c7a173da23f0e7a283af64c74c883e49/6.jpg" alt="Image 1" class="w-full"></li> <li class="splide__slide"><img src="https://images.ctfassets.net/31g2btibassa/3IR96Tct5EEWK2kvkr0zMR/6a4cc78c2a240fe39aa58c8291dc424b/5.jpg" alt="Image 2" class="w-full"></li> <li class="splide__slide"><img src="https://images.ctfassets.net/31g2btibassa/7rKPPYiTx6mu5o4EzpKOKB/130193a6f8580c8d9df2a9fac5ee66e9/7.jpg" alt="Image 3" class="w-full"></li> <li class="splide__slide"><img src="https://images.ctfassets.net/31g2btibassa/2PdBBJGQCso03iFHKP5F1a/0906cf5525eef4c8b8517393836aac88/8.jpg" alt="Image 4" class="w-full"></li> <li class="splide__slide"><img src="https://images.ctfassets.net/31g2btibassa/3RYCIJ4Yta5z88joncN01a/f1297e242ddde87e95f8b2109cfea084/9.jpg" alt="Image 5" class="w-full"></li></ul></div> <div class="overlay svelte-znxi09"${add_attribute(
    "style",
    `left: ${currentSlide * (100 / (overlaysContent.length - 1))}%; transform: translateX(-${0}px);`,
    0
  )}><h2 class="svelte-znxi09">${escape(overlaysContent[currentSlide].title)}</h2> <p class="svelte-znxi09">${escape(overlaysContent[currentSlide].paragraph)}</p> <button class="text-white bg-gradient-to-r from-cyan-500 via-cyan-600 to-cyan-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-cyan-400 dark:focus:ring-cyan-900 shadow-lg shadow-cyan-500/50 dark:shadow-lg dark:shadow-cyan-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 svelte-znxi09">${escape(overlaysContent[currentSlide].button)}</button></div> <div class="progress-bar svelte-znxi09"></div></section> ${validate_component(InfoBlock, "InfoBlock").$$render($$result, {}, {}, {})} ${validate_component(FeedbackForm, "FeedbackForm").$$render($$result, {}, {}, {})} <form id="netlify-hidden-form" name="my-svelte-form" action="/" method="POST" data-netlify="true" style="display: none;" data-svelte-h="svelte-1xx86ca"><input type="text" name="name"> <input type="email" name="email"> <textarea name="message"></textarea> <input type="text" name="key"> <input type="hidden" name="form-name" value="my-svelte-form"> </form>`;
});
export {
  Page as default
};
