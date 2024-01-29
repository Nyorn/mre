

export const index = 5;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/contacts/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/5.DhdFUa95.js","_app/immutable/chunks/scheduler.3ecp5ceH.js","_app/immutable/chunks/index.EzjUPd8-.js","_app/immutable/chunks/FeedbackForm.XEdBtsPB.js"];
export const stylesheets = ["_app/immutable/assets/FeedbackForm.Vq6Yx2Gg.css"];
export const fonts = [];
