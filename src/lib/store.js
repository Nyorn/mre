import { writable } from 'svelte/store';

export const modalStack = createModalStack();
export const isFullFilterVisible = writable(false);
function createModalStack() {
  const { subscribe, update } = writable([]); // Ensure initial state is an empty array
  subscribe(value => console.log("Modal stack changed:", value)); // Log stack changes

  return {
    subscribe,
    open: (type, data) => {
      console.log("Opening modal:", type, data);
      update(stack => {
        if (!stack.some(modal => modal.type === type)) {
          return [...stack, { open: true, type, data }];
        }
        return stack;
      });
    },
    close: () => {
      update(stack => {
        // Remove the last modal from the stack
        if (stack.length > 0) {
          return stack.slice(0, -1);
        }
        return stack;
      });
    }
  };
}
