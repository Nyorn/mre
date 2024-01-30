import * as server from '../entries/pages/objects/_slug_/_page.server.js';

export const index = 7;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/objects/_slug_/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/objects/[slug]/+page.server.js";
export const imports = ["_app/immutable/nodes/7.5LcNYyJF.js","_app/immutable/chunks/scheduler.3sgOQn-M.js","_app/immutable/chunks/index.fH2GeeKy.js","_app/immutable/chunks/store.6HNB6-ql.js","_app/immutable/chunks/index.J-i9PSCP.js","_app/immutable/chunks/Carousel.NH9VKbzP.js","_app/immutable/chunks/each.Ez5lwuJs.js"];
export const stylesheets = ["_app/immutable/assets/7.hUkoIAJE.css","_app/immutable/assets/Carousel.rJ_C6yQw.css"];
export const fonts = [];
