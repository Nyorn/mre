import * as server from '../entries/pages/_page.server.js';

export const index = 2;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/+page.server.js";
<<<<<<< HEAD
export const imports = ["_app/immutable/nodes/2.AkKB0VZR.js","_app/immutable/chunks/scheduler.-jOyszBT.js","_app/immutable/chunks/index.j1-PsbEn.js","_app/immutable/chunks/FeedbackForm.l1-fAUer.js","_app/immutable/chunks/3.MErjPYv9.js"];
=======
export const imports = ["_app/immutable/nodes/2.woiRWXys.js","_app/immutable/chunks/scheduler.-jOyszBT.js","_app/immutable/chunks/index.j1-PsbEn.js","_app/immutable/chunks/FeedbackForm.p3PIv0iO.js","_app/immutable/chunks/3.MErjPYv9.js"];
>>>>>>> c3fea5a7925b50930e20466f1f46015fb05df71a
export const stylesheets = ["_app/immutable/assets/2.SYsB9ZJK.css","_app/immutable/assets/FeedbackForm.twUferqg.css","_app/immutable/assets/index.zaom_SHc.css"];
export const fonts = [];
