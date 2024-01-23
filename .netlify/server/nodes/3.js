import * as server from '../entries/pages/objects/_page.server.js';

export const index = 3;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/objects/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/objects/+page.server.js";
export const imports = ["_app/immutable/nodes/3.Qx4_HpBT.js","_app/immutable/chunks/scheduler.D8q9GPmk.js","_app/immutable/chunks/index.Ys2tg9eb.js","_app/immutable/chunks/each.-kWPFScq.js","_app/immutable/chunks/Carousel.svelte_svelte_type_style_lang.p2gTtO0p.js","_app/immutable/chunks/index.jSArT8Pj.js","_app/immutable/chunks/Modal.svelte_svelte_type_style_lang.HNFZVgZy.js"];
export const stylesheets = ["_app/immutable/assets/3.D2CS35mV.css","_app/immutable/assets/FeedbackForm.twUferqg.css","_app/immutable/assets/Carousel.33b8CKHw.css","_app/immutable/assets/Modal.QW215vHk.css"];
export const fonts = [];
