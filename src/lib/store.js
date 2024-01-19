import { writable } from 'svelte/store';

function createModalStack() {
  const { subscribe, update } = writable([]);

  return {
    subscribe,
    open: (type, data) => {
      update(stack => [...stack, { open: true, type, data }]);
    },
    close: () => {
      update(stack => {
        const newStack = stack.slice(0, -1);
        return newStack.length > 0 ? newStack : [{ open: false, type: null, data: null }];
      });
    }
  };
}

export const modalStack = createModalStack();
