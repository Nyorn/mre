import { r as readable } from "./index.js";
readable(/* @__PURE__ */ new Date(), (set) => {
  const interval = setInterval(() => {
    set(/* @__PURE__ */ new Date());
  }, 10);
  return () => clearInterval(interval);
});
let supportsPassive = false;
try {
  let opts = Object.defineProperty({}, "passive", {
    get: function() {
      supportsPassive = true;
    }
  });
  window.addEventListener("test", null, opts);
} catch (e) {
}
