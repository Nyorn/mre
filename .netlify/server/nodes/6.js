import * as server from '../entries/pages/objects/_page.server.js';

export const index = 6;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/objects/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/objects/+page.server.js";
export const imports = ["_app/immutable/nodes/6.81JgAfRC.js","_app/immutable/chunks/scheduler.Kc2w93hk.js","_app/immutable/chunks/index.tbMu9r0M.js","_app/immutable/chunks/globals.0cDDIVm6.js","_app/immutable/chunks/each.uMb_zxlJ.js","_app/immutable/chunks/Carousel.svelte_svelte_type_style_lang.SxpYQWBZ.js","_app/immutable/chunks/index.ONjfL5dN.js","_app/immutable/chunks/Modal.svelte_svelte_type_style_lang.VOZwQ3mb.js","_app/immutable/chunks/index.P3U4OQgE.js"];
export const stylesheets = ["_app/immutable/assets/6.KaqmCBiP.css","_app/immutable/assets/FeedbackForm.Vq6Yx2Gg.css","_app/immutable/assets/Carousel.T4Mc-1kD.css","_app/immutable/assets/Modal.QW215vHk.css","_app/immutable/assets/index.zaom_SHc.css"];
export const fonts = [];
