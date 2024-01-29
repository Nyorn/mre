

export const index = 5;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/contacts/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/5.8Vh4DfYo.js","_app/immutable/chunks/scheduler.Kc2w93hk.js","_app/immutable/chunks/index.tbMu9r0M.js","_app/immutable/chunks/FeedbackForm.z3vLrkkU.js"];
export const stylesheets = ["_app/immutable/assets/FeedbackForm.Vq6Yx2Gg.css"];
export const fonts = [];
