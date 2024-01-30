import * as server from '../entries/pages/objects/_page.server.js';

export const index = 6;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/objects/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/objects/+page.server.js";
export const imports = ["_app/immutable/nodes/6.W7q26Iu6.js","_app/immutable/chunks/scheduler.GTBV_zYd.js","_app/immutable/chunks/index.nSat8M28.js","_app/immutable/chunks/store.YAfiTiXW.js","_app/immutable/chunks/index.RAXO4nBt.js","_app/immutable/chunks/each.jkqsEw9g.js","_app/immutable/chunks/Modal.svelte_svelte_type_style_lang.zX4f-op1.js","_app/immutable/chunks/index.tA0_1987.js"];
export const stylesheets = ["_app/immutable/assets/6.KaqmCBiP.css","_app/immutable/assets/FeedbackForm.Vq6Yx2Gg.css","_app/immutable/assets/Carousel.rJ_C6yQw.css","_app/immutable/assets/Modal.5W6oaBmt.css","_app/immutable/assets/index.zaom_SHc.css"];
export const fonts = [];
