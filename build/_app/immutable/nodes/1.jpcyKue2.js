import{s as b,e as m,t as d,a as _,c as u,f,m as h,d as c,b as v,g as x,k as p,j as C,r as $,n as g,C as y}from"../chunks/scheduler.GTBV_zYd.js";import{S,i as E}from"../chunks/index.nSat8M28.js";import{s as q}from"../chunks/entry.OTOzABK4.js";const w=()=>{const t=q;return{page:{subscribe:t.page.subscribe},navigating:{subscribe:t.navigating.subscribe},updated:t.updated}},j={subscribe(t){return w().page.subscribe(t)}};function k(t){let s,r=t[0].error.message+"",n,i,o,l="Sorry, something went wrong";return{c(){s=m("h1"),n=d(r),i=_(),o=m("p"),o.textContent=l},l(e){s=u(e,"H1",{});var a=f(s);n=h(a,r),a.forEach(c),i=v(e),o=u(e,"P",{"data-svelte-h":!0}),x(o)!=="svelte-m63ygq"&&(o.textContent=l)},m(e,a){p(e,s,a),C(s,n),p(e,i,a),p(e,o,a)},p(e,[a]){a&1&&r!==(r=e[0].error.message+"")&&$(n,r)},i:g,o:g,d(e){e&&(c(s),c(i),c(o))}}}function H(t,s,r){let n;return y(t,j,i=>r(0,n=i)),[n]}let B=class extends S{constructor(s){super(),E(this,s,H,k,b,{})}};export{B as component};