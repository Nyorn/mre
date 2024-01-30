import { g as getContext, c as create_ssr_component, d as subscribe, e as escape } from "../../chunks/ssr.js";
import "../../chunks/client.js";
const getStores = () => {
  const stores = getContext("__svelte__");
  return {
    /** @type {typeof page} */
    page: {
      subscribe: stores.page.subscribe
    },
    /** @type {typeof navigating} */
    navigating: {
      subscribe: stores.navigating.subscribe
    },
    /** @type {typeof updated} */
    updated: stores.updated
  };
};
const page = {
  subscribe(fn) {
    const store = getStores().page;
    return store.subscribe(fn);
  }
};
const css = {
  code: ".svelte-1edgjkd.svelte-1edgjkd{-webkit-box-sizing:border-box;box-sizing:border-box}body.svelte-1edgjkd.svelte-1edgjkd{padding:0;margin:0}#notfound.svelte-1edgjkd.svelte-1edgjkd{position:relative;height:100vh;background:#030005}#notfound.svelte-1edgjkd .notfound.svelte-1edgjkd{position:absolute;left:50%;top:50%;-webkit-transform:translate(-50%, -50%);-ms-transform:translate(-50%, -50%);transform:translate(-50%, -50%)}.notfound.svelte-1edgjkd.svelte-1edgjkd{max-width:767px;width:100%;line-height:1.4;text-align:center}.notfound.svelte-1edgjkd .notfound-404.svelte-1edgjkd{position:relative;height:180px;margin-bottom:20px;z-index:-1}.notfound.svelte-1edgjkd .notfound-404 h2.svelte-1edgjkd{font-family:'Montserrat', sans-serif;position:absolute;left:0;right:0;top:110px;font-size:42px;font-weight:700;color:#fff;text-transform:uppercase;text-shadow:0px 2px 0px #8400ff;letter-spacing:13px;margin:0}.notfound.svelte-1edgjkd a.svelte-1edgjkd{font-family:'Montserrat', sans-serif;display:inline-block;text-transform:uppercase;color:#ff005a;text-decoration:none;border:2px solid;background:transparent;padding:10px 40px;font-size:14px;font-weight:700;-webkit-transition:0.2s all;transition:0.2s all}.notfound.svelte-1edgjkd a.svelte-1edgjkd:hover{color:#8400ff}@media only screen and (max-width: 767px){.notfound.svelte-1edgjkd .notfound-404 h2.svelte-1edgjkd{font-size:24px}}@media only screen and (max-width: 480px){}",
  map: null
};
const Error$1 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $page, $$unsubscribe_page;
  $$unsubscribe_page = subscribe(page, (value) => $page = value);
  $$result.css.add(css);
  $$unsubscribe_page();
  return `<body class="svelte-1edgjkd"><div id="notfound" class="svelte-1edgjkd"><div class="notfound svelte-1edgjkd"><div class="notfound-404 svelte-1edgjkd"><h2 class="svelte-1edgjkd">${escape($page.error.message)}</h2> <p class="svelte-1edgjkd" data-svelte-h="svelte-m63ygq">Sorry, something went wrong</p></div> <a href="http://sea-estate.com" class="svelte-1edgjkd" data-svelte-h="svelte-10h2doz">Главная</a></div></div> </body>`;
});
export {
  Error$1 as default
};
