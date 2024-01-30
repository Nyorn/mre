import { c as create_ssr_component, a as add_attribute, e as escape, v as validate_component } from "../../chunks/ssr.js";
/* empty css                                                   */
import { F as FeedbackForm } from "../../chunks/FeedbackForm.js";
import { l as loading } from "../../chunks/store.js";
const css$1 = {
  code: '.container.svelte-1gdpjsl{background:transparent;display:flex;align-items:center;justify-content:center;min-height:100vh;min-width:100%;margin-top:50px;max-width:100vw;overflow-x:hidden;padding:20px}.content.svelte-1gdpjsl{background-color:rgba(0, 0, 0, 0.7);padding:20px;border-radius:20px;box-shadow:0 0 10px rgba(0, 0, 0, 0.5);margin:20px;overflow-y:auto;border-radius:10px;max-width:100%}.geo-arrow.svelte-1gdpjsl{fill:none;stroke:#fff;stroke-width:2;stroke-miterlimit:10\n\n     }h1.svelte-1gdpjsl{font-size:3em;margin-bottom:0.2em}.main.svelte-1gdpjsl{height:100vh;display:flex;flex-direction:column;flex-wrap:wrap;position:relative;justify-content:center;align-items:center}.main.svelte-1gdpjsl:before,.main.svelte-1gdpjsl:after{content:"";display:block;position:absolute;z-index:-3}.main.svelte-1gdpjsl:before{right:0;bottom:-19;height:30em;width:30em;border-radius:30em;background:linear-gradient(#3800e7, #8a15ff);align-self:flex-end;animation:svelte-1gdpjsl-gradient-fade 8s ease-in-out 3s infinite alternate}.main.svelte-1gdpjsl:after{top:0;left:30;height:10em;width:10em;border-radius:10em;background:linear-gradient(#3800e7, #8a15ff);animation:svelte-1gdpjsl-gradient-fade-alt 6s ease-in-out 3s infinite alternate}.main__text-wrapper.svelte-1gdpjsl{position:relative;padding:2em;z-index:1}.main__text-wrapper.svelte-1gdpjsl:before,.main__text-wrapper.svelte-1gdpjsl:after{content:"";display:block;position:absolute}.main__text-wrapper.svelte-1gdpjsl:before{z-index:-1;top:-3em;right:-3em;width:13em;height:13em;opacity:0.7;border-radius:13em;background:linear-gradient(#15e0ff, #8a15ff);animation:svelte-1gdpjsl-rotation 7s linear infinite}.main__text-wrapper.svelte-1gdpjsl:after{bottom:-10em;width:10em;height:10em;border-radius:20em;background:linear-gradient(#d000c5, #8a15ff);animation:svelte-1gdpjsl-rotation 7s linear infinite}.arrow.svelte-1gdpjsl{z-index:1000;opacity:0.5;position:absolute}.arrow--top.svelte-1gdpjsl{top:0;left:-7em}.arrow--bottom.svelte-1gdpjsl{bottom:0;right:3em}.dotted-circle.svelte-1gdpjsl{position:absolute;top:0;right:0;opacity:0.3;animation:svelte-1gdpjsl-rotation 38s linear infinite}@keyframes svelte-1gdpjsl-draw{from{stroke-dashoffset:1000}to{stroke-dashoffset:0}}.item-to.svelte-1gdpjsl{animation-duration:10s;animation-iteration-count:infinite;transform-origin:bottom}.bounce-1.svelte-1gdpjsl{animation-name:svelte-1gdpjsl-bounce-1;animation-timing-function:ease}.bounce-2.svelte-1gdpjsl{animation-name:svelte-1gdpjsl-bounce-2;animation-timing-function:ease}.bounce-3.svelte-1gdpjsl{animation-name:svelte-1gdpjsl-bounce-3;animation-timing-function:ease}@keyframes svelte-1gdpjsl-bounce-1{0%{transform:translateY(0)}50%{transform:translateY(50px)}100%{transform:translateY(0)}}@keyframes svelte-1gdpjsl-bounce-2{0%{transform:translateY(0)}50%{transform:translateY(-30px)}100%{transform:translateY(0)}}@keyframes svelte-1gdpjsl-bounce-3{0%{transform:translateY(0)}50%{transform:translateY(30px)}100%{transform:translateY(0)}}@keyframes svelte-1gdpjsl-rotation{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}@keyframes svelte-1gdpjsl-gradient-fade{from{transform:translate(10%, -10%) rotate(0deg)}to{transform:translate(50%, -50%) rotate(360deg)}}@keyframes svelte-1gdpjsl-gradient-fade-alt{from{transform:translate(-20%, 20%) rotate(0deg)}to{transform:translate(-60%, 60%) rotate(360deg)}}@media screen and (max-width: 860px){.main__text-wrapper.svelte-1gdpjsl:after{display:none}}@media screen and (max-width: 700px){.container.svelte-1gdpjsl{min-height:1050px;padding:10px}}@media screen and (max-width: 490px){.main__text-wrapper.svelte-1gdpjsl{padding:1em}.container.svelte-1gdpjsl{min-height:1300px;padding:10px}.content.svelte-1gdpjsl{margin:10px}}@media screen and (max-width: 370px){.main__text-wrapper.svelte-1gdpjsl{padding:1em}.container.svelte-1gdpjsl{min-height:1700px;padding:10px}.content.svelte-1gdpjsl{margin:10px}}',
  map: null
};
const InfoBlock = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  $$result.css.add(css$1);
  return `${``}`;
});
const css = {
  code: `.progress-bar.svelte-mwirsd.svelte-mwirsd{display:none;position:absolute;top:50%;left:0;width:100%;height:4px;background-color:white;z-index:10}.divider.svelte-mwirsd.svelte-mwirsd{height:4px;width:100%;background-color:white}.overlay.svelte-mwirsd.svelte-mwirsd{backdrop-filter:blur(10px);border-radius:15px;position:absolute;bottom:50%;background-color:rgba(0, 0, 0, 0.5);padding:20px;max-width:500px;width:500px;margin:auto;text-align:center;transition:left 1s ease;transform:translateX(-50%);min-height:200px;max-height:90vh}.overlay.svelte-mwirsd h2.svelte-mwirsd{font-size:32px;line-height:1.1;margin-bottom:20px;margin-top:0;min-height:40px}.overlay.svelte-mwirsd p.svelte-mwirsd{font-size:16px;line-height:1.5;margin-top:20px;margin-bottom:20px}.learn-more.svelte-mwirsd.svelte-mwirsd{position:relative;padding-left:50px;padding-right:40px;padding-top:5px;padding-bottom:5px;display:inline-block;cursor:pointer;background-color:transparent;color:white;text-decoration:none;border-radius:5px;border:#12ad9d solid 2px;margin-top:10px;transition:transform 0.4s cubic-bezier(0.75, 0.02, 0.5, 1);box-shadow:0 0 10px 0 #12ad9d}.learn-more.svelte-mwirsd.svelte-mwirsd::before{content:"";position:absolute;top:50%;left:-50px;transform:translateY(-50%);width:45px;height:2px;background:#12ad9d;z-index:-1;transition:width 0.4s cubic-bezier(0.75, 0.02, 0.5, 1);box-shadow:0 0 10px 0 #12ad9d}.learn-more.svelte-mwirsd.svelte-mwirsd::after{content:"";position:absolute;top:50%;right:0px;transform:translateY(-50%) translateX(100%);width:0;height:18px;background-image:url("data:image/svg+xml,%3Csvg width='42' height='18' viewBox='0 0 42 18' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0.810791 8.67636L40.1891 8.67636M40.1891 8.67636L33.3612 0.892578M40.1891 8.67636L33.3612 16.4601' stroke='%2312ad9d' stroke-width='2'/%3E%3C/svg%3E%0A");background-repeat:no-repeat;background-position:center;background-size:contain;transition:width 0.4s cubic-bezier(0.75, 0.02, 0.5, 1), right 0.4s cubic-bezier(0.75, 0.02, 0.5, 1);opacity:0}.learn-more.svelte-mwirsd.svelte-mwirsd:hover{transform:translateX(-35px)}.learn-more.svelte-mwirsd.svelte-mwirsd:hover::before{width:0}.learn-more.svelte-mwirsd.svelte-mwirsd:hover::after{width:46px;right:-2px;opacity:1}@media(min-width: 1080px){.progress-bar.svelte-mwirsd.svelte-mwirsd{display:none;position:absolute;top:45%;left:0;width:100%;height:4px;background-color:white;z-index:10}}@media(max-width: 1080px){.overlay.svelte-mwirsd.svelte-mwirsd{left:50% !important;transform:translateX(-50%) !important;bottom:30%}.progress-bar.svelte-mwirsd.svelte-mwirsd{display:none}}@media(max-width: 530px){.overlay.svelte-mwirsd.svelte-mwirsd{max-width:300px}}@media(max-width: 330px){.overlay.svelte-mwirsd.svelte-mwirsd{max-width:300px}}`,
  map: null
};
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let currentSlide = 0;
  const overlaysContent = [
    {
      title: "Погружение в райскую природу:",
      paragraph: "Инвестируйте в свой уголок среди изумрудных гор и бескрайних пляжей Черного моря.",
      button: "Подробнее",
      link: "https://sea-estate.com/objects"
    },
    {
      title: "Разнообразие недвижимости:",
      paragraph: "От стильных апартаментов до вилл с потрясающим видом на море - мы предлагаем разнообразие вариантов, чтобы воплотить ваши мечты в реальность.",
      button: "Подробнее",
      link: "https://sea-estate.com/objects"
    },
    {
      title: "Инвестиции с умом: ",
      paragraph: "Наша команда экспертов поможет вам сделать выгодные инвестиции в болгарскую недвижимость, обеспечивая стабильный доход и рост капитала.",
      button: "Подробнее",
      link: "https://sea-estate.com/objects"
    },
    {
      title: "Простой процесс сделки: ",
      paragraph: "Мы делаем покупку недвижимости в Болгарии легкой и прозрачной. Надежное сопровождение сделки от начала до конца.",
      button: "Подробнее",
      link: "https://sea-estate.com/objects"
    },
    {
      title: "Обретите свой уголок под солнцем с нами.",
      paragraph: "Выберите Болгарию для вашего нового дома или инвестиций! ",
      button: "Подробнее",
      link: "https://sea-estate.com/objects"
    }
  ];
  $$result.css.add(css);
  return `${$$result.head += `<!-- HEAD_svelte-ksb2dm_START -->${$$result.title = `<title>Sea Real Estate: Элитная Недвижимость на Первой Линии Моря в Болгарии</title>`, ""}<meta name="description" content="Sea Real Estate предлагает эксклюзивную недвижимость в туристических зонах Болгарии. Лучшие предложения на первой и второй линии от моря. Узнайте больше!"><script src="/splide-shader-carousel.min.js" defer data-svelte-h="svelte-147jny7"><\/script><!-- HEAD_svelte-ksb2dm_END -->`, ""} <section class="${["splide", !loading ? "loaded" : ""].join(" ").trim()}" aria-label="Splide Shader Carousel Example"><div class="splide__track" data-svelte-h="svelte-csobli"><ul class="splide__list"><li class="splide__slide"><img src="https://images.ctfassets.net/31g2btibassa/5S3oxQ5YnMis48RHU5EDlW/c7a173da23f0e7a283af64c74c883e49/6.jpg" alt="Image 1" class="w-full"></li> <li class="splide__slide"><img src="https://images.ctfassets.net/31g2btibassa/3IR96Tct5EEWK2kvkr0zMR/6a4cc78c2a240fe39aa58c8291dc424b/5.jpg" alt="Image 2" class="w-full"></li> <li class="splide__slide"><img src="https://images.ctfassets.net/31g2btibassa/7rKPPYiTx6mu5o4EzpKOKB/130193a6f8580c8d9df2a9fac5ee66e9/7.jpg" alt="Image 3" class="w-full"></li> <li class="splide__slide"><img src="https://images.ctfassets.net/31g2btibassa/2PdBBJGQCso03iFHKP5F1a/0906cf5525eef4c8b8517393836aac88/8.jpg" alt="Image 4" class="w-full"></li> <li class="splide__slide"><img src="https://images.ctfassets.net/31g2btibassa/3RYCIJ4Yta5z88joncN01a/f1297e242ddde87e95f8b2109cfea084/9.jpg" alt="Image 5" class="w-full"></li></ul></div> <div class="overlay svelte-mwirsd"${add_attribute(
    "style",
    `left: ${currentSlide * (100 / (overlaysContent.length - 1))}%; transform: translateX(-${0}px);`,
    0
  )}><h2 class="svelte-mwirsd">${escape(overlaysContent[currentSlide].title)}</h2> <div class="divider svelte-mwirsd"></div> <p class="svelte-mwirsd">${escape(overlaysContent[currentSlide].paragraph)}</p> <a${add_attribute("href", overlaysContent[currentSlide].link, 0)} class="learn-more svelte-mwirsd">${escape(overlaysContent[currentSlide].button)} <span class="arrow-right"></span></a></div> <div class="progress-bar svelte-mwirsd"></div></section> ${validate_component(InfoBlock, "InfoBlock").$$render($$result, {}, {}, {})} ${validate_component(FeedbackForm, "FeedbackForm").$$render($$result, {}, {}, {})}`;
});
export {
  Page as default
};
