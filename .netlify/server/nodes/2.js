import * as server from '../entries/pages/_page.server.js';

export const index = 2;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/+page.server.js";
export const imports = ["_app/immutable/nodes/2.576-ug_F.js","_app/immutable/chunks/scheduler.3sgOQn-M.js","_app/immutable/chunks/index.fH2GeeKy.js","_app/immutable/chunks/store.6HNB6-ql.js","_app/immutable/chunks/index.J-i9PSCP.js","_app/immutable/chunks/FeedbackForm.4ys8AvD-.js","_app/immutable/chunks/preload-helper.0HuHagjb.js","_app/immutable/chunks/index.5qGcPCsr.js"];
export const stylesheets = ["_app/immutable/assets/2.h_tMN_cQ.css","_app/immutable/assets/Preloader.ImITdPD7.css","_app/immutable/assets/FeedbackForm.Vq6Yx2Gg.css","_app/immutable/assets/index.zaom_SHc.css"];
export const fonts = [];
