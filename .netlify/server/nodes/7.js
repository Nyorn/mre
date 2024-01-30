import * as server from '../entries/pages/objects/_slug_/_page.server.js';

export const index = 7;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/objects/_slug_/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/objects/[slug]/+page.server.js";
export const imports = ["_app/immutable/nodes/7.mY3fE7Dl.js","_app/immutable/chunks/scheduler.GTBV_zYd.js","_app/immutable/chunks/index.nSat8M28.js","_app/immutable/chunks/store.YAfiTiXW.js","_app/immutable/chunks/index.RAXO4nBt.js","_app/immutable/chunks/Carousel.PqkzkoWh.js","_app/immutable/chunks/each.jkqsEw9g.js"];
export const stylesheets = ["_app/immutable/assets/7.hUkoIAJE.css","_app/immutable/assets/Carousel.rJ_C6yQw.css"];
export const fonts = [];
