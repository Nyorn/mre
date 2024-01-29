import * as server from '../entries/pages/objects/_slug_/_page.server.js';

export const index = 7;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/objects/_slug_/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/objects/[slug]/+page.server.js";
export const imports = ["_app/immutable/nodes/7.IaNDG7so.js","_app/immutable/chunks/scheduler.3ecp5ceH.js","_app/immutable/chunks/index.EzjUPd8-.js","_app/immutable/chunks/globals.0cDDIVm6.js","_app/immutable/chunks/Carousel.jJXfsIUZ.js","_app/immutable/chunks/each.j9GoV6GU.js","_app/immutable/chunks/Carousel.svelte_svelte_type_style_lang.cGTh5W0d.js","_app/immutable/chunks/index.-lbj6D5R.js"];
export const stylesheets = ["_app/immutable/assets/7.YDuhwim0.css","_app/immutable/assets/Carousel.T4Mc-1kD.css"];
export const fonts = [];
