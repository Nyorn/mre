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
