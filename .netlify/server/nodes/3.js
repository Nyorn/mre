

export const index = 3;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/404/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/3.q_RnMg6b.js","_app/immutable/chunks/scheduler.Kc2w93hk.js","_app/immutable/chunks/index.tbMu9r0M.js"];
export const stylesheets = ["_app/immutable/assets/3.xjRr5EYH.css"];
export const fonts = [];
