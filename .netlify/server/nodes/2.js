import * as server from '../entries/pages/_page.server.js';

export const index = 2;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/+page.server.js";
export const imports = ["_app/immutable/nodes/2.iIVmFnXP.js","_app/immutable/chunks/scheduler.-jOyszBT.js","_app/immutable/chunks/index.j1-PsbEn.js","_app/immutable/chunks/FeedbackForm.CKrchMOJ.js","_app/immutable/chunks/3.MErjPYv9.js"];
export const stylesheets = ["_app/immutable/assets/2.SYsB9ZJK.css","_app/immutable/assets/FeedbackForm.twUferqg.css","_app/immutable/assets/index.zaom_SHc.css"];
export const fonts = [];
