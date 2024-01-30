

export const index = 5;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/contacts/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/5.yy6WoaVk.js","_app/immutable/chunks/scheduler.GTBV_zYd.js","_app/immutable/chunks/index.nSat8M28.js","_app/immutable/chunks/FeedbackForm.bY0M__62.js"];
export const stylesheets = ["_app/immutable/assets/FeedbackForm.Vq6Yx2Gg.css"];
export const fonts = [];
