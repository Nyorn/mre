import * as server from '../entries/pages/objects/_page.server.js';

export const index = 6;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/objects/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/objects/+page.server.js";
export const imports = ["_app/immutable/nodes/6.uxCouDAv.js","_app/immutable/chunks/scheduler.3sgOQn-M.js","_app/immutable/chunks/index.fH2GeeKy.js","_app/immutable/chunks/store.K5VdnwKE.js","_app/immutable/chunks/index.J-i9PSCP.js","_app/immutable/chunks/each.Ez5lwuJs.js","_app/immutable/chunks/Modal.svelte_svelte_type_style_lang.BdNRZVqO.js","_app/immutable/chunks/index.jXuKYX8s.js"];
export const stylesheets = ["_app/immutable/assets/6.KaqmCBiP.css","_app/immutable/assets/FeedbackForm.Vq6Yx2Gg.css","_app/immutable/assets/Carousel.rJ_C6yQw.css","_app/immutable/assets/Modal.5W6oaBmt.css","_app/immutable/assets/index.zaom_SHc.css"];
export const fonts = [];
