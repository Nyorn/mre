import { writable } from 'svelte/store';

function createModalStack() {
  const { subscribe, update } = writable([]);

  return {
    subscribe,
    open: (type, data) => {
      console.log("Opening modal:", type, data);
      update(stack => [...stack, { open: true, type, data }]);
    },
    close: (type) => {
      update(stack => {
        if (stack.length > 0) {
          // Optional: Check if the last modal matches the type before closing
          if (type && stack[stack.length - 1].type !== type) {
            console.warn(`Trying to close a modal of type '${type}', but the last modal is of a different type.`);
            return stack;
          }
          return stack.slice(0, -1);
        }
        return stack;
      });
    }
  };
}

export const modalStack = createModalStack();
export const loading = writable(true);
export const isFullFilterVisible = writable(false);

/*
 * Active preview theme id, or '' in production.
 *
 * The modal host renders in the layout, outside .qc-home, so the theme tokens
 * scoped to the home wrapper never reached it: the enquiry window stayed Quiet
 * Coast under every direction, which made the B/C comparison incomplete exactly
 * where a partner looks hardest. The home page publishes the active id here and
 * the modal mirrors it onto its own element.
 *
 * Production never writes to this store, so the modal has no theme attribute and
 * renders in the default palette.
 */
export const previewTheme = writable('');
