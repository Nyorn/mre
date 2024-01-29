import * as server from '../entries/pages/_page.server.js';

export const index = 2;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/+page.server.js";
export const imports = ["_app/immutable/nodes/2.r2J4Q0Cl.js","_app/immutable/chunks/scheduler.Kc2w93hk.js","_app/immutable/chunks/index.tbMu9r0M.js","_app/immutable/chunks/globals.0cDDIVm6.js","_app/immutable/chunks/FeedbackForm.z3vLrkkU.js","_app/immutable/chunks/preload-helper.0HuHagjb.js","_app/immutable/chunks/index.5qGcPCsr.js"];
export const stylesheets = ["_app/immutable/assets/2.odCEoRmP.css","_app/immutable/assets/Preloader.nWcanRQN.css","_app/immutable/assets/FeedbackForm.Vq6Yx2Gg.css","_app/immutable/assets/index.zaom_SHc.css"];
export const fonts = [];
