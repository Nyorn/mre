

export const index = 1;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_error.svelte.js')).default;
export const imports = ["_app/immutable/nodes/1.1bW5Q1-t.js","_app/immutable/chunks/scheduler.3sgOQn-M.js","_app/immutable/chunks/index.fH2GeeKy.js","_app/immutable/chunks/entry.sNsuxQ_c.js","_app/immutable/chunks/index.J-i9PSCP.js"];
export const stylesheets = ["_app/immutable/assets/1.cVxaA09u.css"];
export const fonts = [];
