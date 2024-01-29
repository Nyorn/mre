import { c as create_ssr_component, a as add_attribute, e as escape, n as null_to_empty } from "./ssr.js";
/* empty css                                           */
const css = {
  code: ".feedback-form.svelte-dm95v{background:#2a2e35;border-radius:8px;box-shadow:0 4px 6px rgba(0, 0, 0, 0.5);padding:40px;width:auto;max-width:500px;min-width:500px;margin:10px auto;color:#f8f9fa}.field-container.svelte-dm95v{margin-bottom:15px}.input-style.svelte-dm95v,.textarea-style.svelte-dm95v{width:100%;border:1px solid #4e555b;padding:10px 15px;border-radius:4px;background:#1c2025;color:#f8f9fa}.input-style.svelte-dm95v::placeholder,.textarea-style.svelte-dm95v::placeholder{color:#6c757d}.input-container.svelte-dm95v{position:relative;margin-bottom:20px}.error-message.svelte-dm95v{color:#e83e8c;font-size:14px;margin-top:2px;position:absolute;bottom:-10px;left:0}.error-message.hidden.svelte-dm95v{visibility:hidden}@media(max-width: 600px){.feedback-form.svelte-dm95v{max-width:100%;min-width:auto;padding:20px}}",
  map: null
};
const FeedbackForm = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { objectName = "" } = $$props;
  let { key = "" } = $$props;
  let name = "";
  let phone = "+";
  let message = objectName ? `Осмотр объекта: ${objectName}` : "";
  let formErrors = {};
  if ($$props.objectName === void 0 && $$bindings.objectName && objectName !== void 0)
    $$bindings.objectName(objectName);
  if ($$props.key === void 0 && $$bindings.key && key !== void 0)
    $$bindings.key(key);
  $$result.css.add(css);
  formErrors.name = "Имя обязательно.";
  formErrors.phone = !/^\+\d{1,15}$/.test(phone) ? "Неверный формат телефона." : "";
  formErrors.message = !message ? "Сообщение обязательно." : "";
  return `<form name="feedback-form" class="feedback-form flex flex-col space-y-4 text-gray-700 svelte-dm95v" novalidate><div class="input-container svelte-dm95v"><div class="field-container svelte-dm95v"><label for="name" class="block text-sm font-medium" data-svelte-h="svelte-vsqlxf">Имя:</label> <input id="name" type="text" name="name" class="input-style svelte-dm95v"${add_attribute("value", name, 0)}> <span class="${escape(
    null_to_empty(formErrors.name ? "error-message" : "error-message hidden"),
    true
  ) + " svelte-dm95v"}">${escape(formErrors.name)}</span></div></div> <div class="input-container svelte-dm95v"><div class="field-container svelte-dm95v"><label for="phone" class="block text-sm font-medium" data-svelte-h="svelte-1v7fs6v">Телефон:</label> <input id="phone" type="tel" name="phone" class="input-style svelte-dm95v"${add_attribute("value", phone, 0)}> <span class="${escape(
    null_to_empty(formErrors.phone ? "error-message" : "error-message hidden"),
    true
  ) + " svelte-dm95v"}">${escape(formErrors.phone)}</span></div></div> <div class="input-container svelte-dm95v"><div class="field-container mb-10 svelte-dm95v"><label for="message" class="block text-sm font-medium" data-svelte-h="svelte-gcu58k">Сообщение:</label> <textarea id="message" name="message" class="textarea-style svelte-dm95v">${escape(message || "")}</textarea> <span class="${escape(
    null_to_empty(formErrors.message ? "error-message" : "error-message hidden"),
    true
  ) + " svelte-dm95v"}">${escape(formErrors.message)}</span></div></div> <input type="hidden" name="key"${add_attribute("value", key, 0)}> <button type="submit" classname="submit-button mt-10" ${""}>${escape("Отправить")}</button></form> ${slots.default ? slots.default({}) : ``}`;
});
export {
  FeedbackForm as F
};
