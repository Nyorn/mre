import { c as create_ssr_component, a as add_attribute, e as escape, n as null_to_empty } from "./ssr.js";
/* empty css                                           */
const css = {
  code: ".feedback-form.svelte-1olcnvn{background:#2a2e35;border-radius:8px;box-shadow:0 4px 6px rgba(0, 0, 0, 0.5);padding:40px;width:auto;max-width:500px;min-width:500px;margin:10px auto;color:#f8f9fa}.field-container.svelte-1olcnvn{margin-bottom:15px}.input-style.svelte-1olcnvn,.textarea-style.svelte-1olcnvn{width:100%;border:1px solid #4e555b;padding:10px 15px;border-radius:4px;background:#1c2025;color:#f8f9fa}.input-style.svelte-1olcnvn::placeholder,.textarea-style.svelte-1olcnvn::placeholder{color:#6c757d}.input-container.svelte-1olcnvn{position:relative;margin-bottom:20px}.error-message.svelte-1olcnvn{color:#e83e8c;font-size:14px;margin-top:2px;position:absolute;bottom:-10px;left:0}.error-message.hidden.svelte-1olcnvn{visibility:hidden}.submit-button.svelte-1olcnvn{background-color:#007bff;color:white;padding:10px 15px;border:none;border-radius:4px;cursor:pointer;font-size:16px;width:100%;margin-top:50px}.submit-button.svelte-1olcnvn:hover{background-color:#0056b3}@media(max-width: 600px){.feedback-form.svelte-1olcnvn{max-width:100%;min-width:auto;padding:20px}}",
  map: null
};
const FeedbackForm = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { objectName = "" } = $$props;
  let { key = "" } = $$props;
  let name = "";
  let email = "";
  let message = objectName ? `Осмотр объекта: ${objectName}` : "";
  let formErrors = {};
  if ($$props.objectName === void 0 && $$bindings.objectName && objectName !== void 0)
    $$bindings.objectName(objectName);
  if ($$props.key === void 0 && $$bindings.key && key !== void 0)
    $$bindings.key(key);
  $$result.css.add(css);
  formErrors.name = "Имя обязательно.";
  formErrors.email = "Email обязателен.";
  formErrors.message = !message ? "Сообщение обязательно." : "";
  return `<form method="POST" data-netlify="true" class="feedback-form flex flex-col space-y-4 text-gray-700 svelte-1olcnvn" novalidate><div class="input-container svelte-1olcnvn"><div class="field-container svelte-1olcnvn"><label for="name" class="block text-sm font-medium" data-svelte-h="svelte-vsqlxf">Имя:</label> <input id="name" type="text" class="input-style svelte-1olcnvn"${add_attribute("value", name, 0)}> <span class="${escape(
    null_to_empty(formErrors.name ? "error-message" : "error-message hidden"),
    true
  ) + " svelte-1olcnvn"}">${escape(formErrors.name)}</span></div></div> <div class="input-container svelte-1olcnvn"><div class="field-container svelte-1olcnvn"><label for="email" class="block text-sm font-medium" data-svelte-h="svelte-1oxiyt5">Email:</label> <input id="email" type="email" class="input-style svelte-1olcnvn"${add_attribute("value", email, 0)}> <span class="${escape(
    null_to_empty(formErrors.email ? "error-message" : "error-message hidden"),
    true
  ) + " svelte-1olcnvn"}">${escape(formErrors.email)}</span></div></div> <div class="input-container svelte-1olcnvn"><div class="field-container mb-10 svelte-1olcnvn"><label for="message" class="block text-sm font-medium" data-svelte-h="svelte-gcu58k">Сообщение:</label> <textarea id="message" class="textarea-style svelte-1olcnvn">${escape(message || "")}</textarea> <span class="${escape(
    null_to_empty(formErrors.message ? "error-message" : "error-message hidden"),
    true
  ) + " svelte-1olcnvn"}">${escape(formErrors.message)}</span></div></div> <input type="hidden" name="form-name" value="my-svelte-form"> <input type="hidden" name="key"${add_attribute("value", key, 0)}> <button type="submit" class="submit-button mt-10 svelte-1olcnvn" data-svelte-h="svelte-jgvucx">Отправить</button></form> ${slots.default ? slots.default({}) : ``}`;
});
export {
  FeedbackForm as F
};
