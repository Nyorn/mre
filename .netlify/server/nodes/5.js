

export const index = 5;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/contacts/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/5.998CFT2R.js","_app/immutable/chunks/scheduler.3sgOQn-M.js","_app/immutable/chunks/index.fH2GeeKy.js","_app/immutable/chunks/FeedbackForm.bH6KbUSp.js"];
export const stylesheets = ["_app/immutable/assets/FeedbackForm.Vq6Yx2Gg.css"];
export const fonts = [];
