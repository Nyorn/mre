import * as server from '../entries/pages/_page.server.js';

export const index = 2;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/+page.server.js";
export const imports = ["_app/immutable/nodes/2.36m9r-an.js","_app/immutable/chunks/scheduler.3ecp5ceH.js","_app/immutable/chunks/index.EzjUPd8-.js","_app/immutable/chunks/globals.0cDDIVm6.js","_app/immutable/chunks/FeedbackForm.XEdBtsPB.js","_app/immutable/chunks/preload-helper.0HuHagjb.js","_app/immutable/chunks/index.5qGcPCsr.js"];
export const stylesheets = ["_app/immutable/assets/2.P4wq2TDv.css","_app/immutable/assets/Preloader.nWcanRQN.css","_app/immutable/assets/FeedbackForm.Vq6Yx2Gg.css","_app/immutable/assets/index.zaom_SHc.css"];
export const fonts = [];
