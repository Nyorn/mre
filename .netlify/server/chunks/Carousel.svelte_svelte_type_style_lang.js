import { w as writable } from "./index2.js";
const modalStack = createModalStack();
const isFullFilterVisible = writable(false);
function createModalStack() {
  const { subscribe, update } = writable([]);
  subscribe((value) => console.log("Modal stack changed:", value));
  return {
    subscribe,
    open: (type, data) => {
      console.log("Opening modal:", type, data);
      update((stack) => {
        if (!stack.some((modal) => modal.type === type)) {
          return [...stack, { open: true, type, data }];
        }
        return stack;
      });
    },
    close: () => {
      update((stack) => {
        if (stack.length > 0) {
          return stack.slice(0, -1);
        }
        return stack;
      });
    }
  };
}
export {
  isFullFilterVisible as i,
  modalStack as m
};
