import { c as create_ssr_component, v as validate_component } from "../../../chunks/ssr.js";
import { F as FeedbackForm } from "../../../chunks/FeedbackForm.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${$$result.head += `<!-- HEAD_svelte-1abrnir_START -->${$$result.title = `<title>Контакты Sea Real Estate: Ваш Партнер по Недвижимости в Болгарии</title>`, ""}<meta name="description" content="Свяжитесь с Sea Real Estate для консультации по недвижимости в Болгарии. Наша команда готова помочь вам с выбором идеального дома у моря."><!-- HEAD_svelte-1abrnir_END -->`, ""} <div class="contacts" data-svelte-h="svelte-vjxvg4"><h2 class="text-sm font-semibold text-gray-900 uppercase dark:text-white">Контакты</h2> <ul class="text-gray-500 dark:text-gray-400 font-medium"><li class="mb-4"><a href="https://flowbite.com/" class="hover:underline">+359 895-340-006</a></li> <li class="mb-4"><a href="https://tailwindcss.com/" class="hover:underline">+359 877-580-966</a></li> <li class="mb-4"><a href="https://tailwindcss.com/" class="hover:underline">+38(93)053-55-25</a></li> <li class="mb-4"><a href="" class="hover:underline">support@mail.com</a></li></ul></div> ${validate_component(FeedbackForm, "FeedbackForm").$$render($$result, {}, {}, {})} <div class="bb"></div>`;
});
export {
  Page as default
};
