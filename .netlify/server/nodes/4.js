

export const index = 4;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/about/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/4.mHI0rxxB.js","_app/immutable/chunks/preload-helper.0HuHagjb.js","_app/immutable/chunks/scheduler.3sgOQn-M.js","_app/immutable/chunks/index.fH2GeeKy.js","_app/immutable/chunks/index.5qGcPCsr.js"];
export const stylesheets = ["_app/immutable/assets/4.inUEfQK0.css","_app/immutable/assets/index.zaom_SHc.css"];
export const fonts = [];
