import * as server from '../entries/pages/objects/_page.server.js';

export const index = 4;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/objects/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/objects/+page.server.js";
export const imports = ["_app/immutable/nodes/4.MThdiyQy.js","_app/immutable/chunks/scheduler.-jOyszBT.js","_app/immutable/chunks/index.j1-PsbEn.js","_app/immutable/chunks/each.OGh3blUO.js","_app/immutable/chunks/Carousel.svelte_svelte_type_style_lang.t9g-goBU.js","_app/immutable/chunks/index.VgqEeJOA.js","_app/immutable/chunks/Modal.svelte_svelte_type_style_lang.A8eyDcj8.js"];
export const stylesheets = ["_app/immutable/assets/4.D2CS35mV.css","_app/immutable/assets/FeedbackForm.Vq6Yx2Gg.css","_app/immutable/assets/Carousel.T4Mc-1kD.css","_app/immutable/assets/Modal.QW215vHk.css"];
export const fonts = [];
