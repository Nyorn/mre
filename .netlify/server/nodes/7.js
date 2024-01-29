import * as server from '../entries/pages/objects/_slug_/_page.server.js';

export const index = 7;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/objects/_slug_/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/objects/[slug]/+page.server.js";
export const imports = ["_app/immutable/nodes/7.FblKSzHQ.js","_app/immutable/chunks/scheduler.Kc2w93hk.js","_app/immutable/chunks/index.tbMu9r0M.js","_app/immutable/chunks/globals.0cDDIVm6.js","_app/immutable/chunks/Carousel.iboFKEPM.js","_app/immutable/chunks/each.uMb_zxlJ.js","_app/immutable/chunks/Carousel.svelte_svelte_type_style_lang.SxpYQWBZ.js","_app/immutable/chunks/index.ONjfL5dN.js"];
export const stylesheets = ["_app/immutable/assets/7.YDuhwim0.css","_app/immutable/assets/Carousel.T4Mc-1kD.css"];
export const fonts = [];
