var b=Object.defineProperty;var E=(t,e,n)=>e in t?b(t,e,{enumerable:!0,configurable:!0,writable:!0,value:n}):t[e]=n;var _=(t,e,n)=>(E(t,typeof e!="symbol"?e+"":e,n),n);import{x as $,n as c,M as x,f as O,d as C,N as I,O as v,P as M,Q as p,R as N,S as P,T as w,U as R,V as U,W as V,X as j,Y as B}from"./scheduler.3sgOQn-M.js";const o=new Set;let d;function A(){d={r:0,c:[],p:d}}function D(){d.r||$(d.c),d=d.p}function L(t,e){t&&t.i&&(o.delete(t),t.i(e))}function F(t,e,n,s){if(t&&t.o){if(o.has(t))return;o.add(t),d.c.push(()=>{o.delete(t),s&&(n&&t.d(1),s())}),t.o(e)}else s&&s()}function G(t,e,n){const s=t.$$.props[e];s!==void 0&&(t.$$.bound[s]=n,n(t.$$.ctx[s]))}function H(t){t&&t.c()}function J(t,e){t&&t.l(e)}function Q(t,e,n){const{fragment:s,after_update:i}=t.$$;s&&s.m(e,n),p(()=>{const f=t.$$.on_mount.map(R).filter(v);t.$$.on_destroy?t.$$.on_destroy.push(...f):$(f),t.$$.on_mount=[]}),i.forEach(p)}function T(t,e){const n=t.$$;n.fragment!==null&&(N(n.after_update),$(n.on_destroy),n.fragment&&n.fragment.d(e),n.on_destroy=n.fragment=null,n.ctx=[])}function W(t,e){t.$$.dirty[0]===-1&&(U.push(t),V(),t.$$.dirty.fill(0)),t.$$.dirty[e/31|0]|=1<<e%31}function K(t,e,n,s,i,f,h=null,S=[-1]){const u=P;w(t);const a=t.$$={fragment:null,ctx:[],props:f,update:c,not_equal:i,bound:x(),on_mount:[],on_destroy:[],on_disconnect:[],before_update:[],after_update:[],context:new Map(e.context||(u?u.$$.context:[])),callbacks:x(),dirty:S,skip_bound:!1,root:e.target||u.$$.root};h&&h(a.root);let l=!1;if(a.ctx=n?n(t,e.props||{},(r,g,...m)=>{const y=m.length?m[0]:g;return a.ctx&&i(a.ctx[r],a.ctx[r]=y)&&(!a.skip_bound&&a.bound[r]&&a.bound[r](y),l&&W(t,r)),g}):[],a.update(),l=!0,$(a.before_update),a.fragment=s?s(a.ctx):!1,e.target){if(e.hydrate){j();const r=O(e.target);a.fragment&&a.fragment.l(r),r.forEach(C)}else a.fragment&&a.fragment.c();e.intro&&L(t.$$.fragment),Q(t,e.target,e.anchor),B(),I()}w(u)}class Z{constructor(){_(this,"$$");_(this,"$$set")}$destroy(){T(this,1),this.$destroy=c}$on(e,n){if(!v(n))return c;const s=this.$$.callbacks[e]||(this.$$.callbacks[e]=[]);return s.push(n),()=>{const i=s.indexOf(n);i!==-1&&s.splice(i,1)}}$set(e){this.$$set&&!M(e)&&(this.$$.skip_bound=!0,this.$$set(e),this.$$.skip_bound=!1)}}const X="4";typeof window<"u"&&(window.__svelte||(window.__svelte={v:new Set})).v.add(X);export{Z as S,J as a,F as b,H as c,T as d,D as e,G as f,A as g,K as i,Q as m,L as t};