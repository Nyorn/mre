import{w as l}from"./index.RAXO4nBt.js";const u=typeof window<"u"?window:typeof globalThis<"u"?globalThis:global,c=t(),d=l(!0),g=l(!1);function t(){const{subscribe:n,update:i}=l([]);return n(o=>console.log("Modal stack changed:",o)),{subscribe:n,open:(o,s)=>{console.log("Opening modal:",o,s),i(e=>e.some(r=>r.type===o)?e:[...e,{open:!0,type:o,data:s}])},close:()=>{i(o=>o.length>0?o.slice(0,-1):o)}}}export{u as g,g as i,d as l,c as m};