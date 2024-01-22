import * as server from '../entries/pages/objects/_slug_/_page.server.js';

export const index = 4;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/objects/_slug_/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/objects/[slug]/+page.server.js";
export const imports = ["_app/immutable/nodes/4.LuHwFiy4.js","_app/immutable/chunks/scheduler.D8q9GPmk.js","_app/immutable/chunks/index.Ys2tg9eb.js","_app/immutable/chunks/Carousel.1p3JhjUT.js","_app/immutable/chunks/each.-kWPFScq.js","_app/immutable/chunks/Carousel.svelte_svelte_type_style_lang.LmgWyuxO.js","_app/immutable/chunks/index.jSArT8Pj.js"];
export const stylesheets = ["_app/immutable/assets/4.YDuhwim0.css","_app/immutable/assets/Carousel.xojW57hE.css"];
export const fonts = [];
