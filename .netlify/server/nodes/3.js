

export const index = 3;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/404/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/3.eqtZX4JX.js","_app/immutable/chunks/scheduler.3ecp5ceH.js","_app/immutable/chunks/index.EzjUPd8-.js"];
export const stylesheets = ["_app/immutable/assets/3.xjRr5EYH.css"];
export const fonts = [];
