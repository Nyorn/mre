import { writable } from 'svelte/store';

function createModalStack() {
  const { subscribe, update } = writable([]);

  return {
    subscribe,
    open: (type, data) => {
      update(stack => [...stack, { open: true, type, data }]);
    },
    close: () => {
      update(stack => stack.slice(0, -1));
    }
  };
}


export const modalStack = createModalStack();
