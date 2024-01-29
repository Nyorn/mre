import * as server from '../entries/pages/objects/_page.server.js';

export const index = 6;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/objects/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/objects/+page.server.js";
export const imports = ["_app/immutable/nodes/6.j82iPGUi.js","_app/immutable/chunks/scheduler.3ecp5ceH.js","_app/immutable/chunks/index.EzjUPd8-.js","_app/immutable/chunks/globals.0cDDIVm6.js","_app/immutable/chunks/each.j9GoV6GU.js","_app/immutable/chunks/Carousel.svelte_svelte_type_style_lang.cGTh5W0d.js","_app/immutable/chunks/index.-lbj6D5R.js","_app/immutable/chunks/Modal.svelte_svelte_type_style_lang.XMP-f-9l.js","_app/immutable/chunks/index.DvVqYxKg.js"];
export const stylesheets = ["_app/immutable/assets/6.KaqmCBiP.css","_app/immutable/assets/FeedbackForm.Vq6Yx2Gg.css","_app/immutable/assets/Carousel.T4Mc-1kD.css","_app/immutable/assets/Modal.QW215vHk.css","_app/immutable/assets/index.zaom_SHc.css"];
export const fonts = [];
