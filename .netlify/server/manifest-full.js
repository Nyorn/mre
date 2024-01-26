export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["cloud01.jpg","favicon.png","fiber01.jpg","radial-gradient01.jpg","splide-shader-carousel.min.js","static-form.html","wave01.jpg"]),
	mimeTypes: {".jpg":"image/jpeg",".png":"image/png",".js":"text/javascript",".html":"text/html"},
	_: {
<<<<<<< HEAD
		client: {"start":"_app/immutable/entry/start.55GeH_TB.js","app":"_app/immutable/entry/app.XthEDC7h.js","imports":["_app/immutable/entry/start.55GeH_TB.js","_app/immutable/chunks/entry.wCoLU31g.js","_app/immutable/chunks/scheduler.-jOyszBT.js","_app/immutable/chunks/index.VgqEeJOA.js","_app/immutable/entry/app.XthEDC7h.js","_app/immutable/chunks/3.MErjPYv9.js","_app/immutable/chunks/scheduler.-jOyszBT.js","_app/immutable/chunks/index.j1-PsbEn.js"],"stylesheets":[],"fonts":[],"uses_env_dynamic_public":false},
=======
		client: {"start":"_app/immutable/entry/start.e4FOCVEv.js","app":"_app/immutable/entry/app.4KP_qn3I.js","imports":["_app/immutable/entry/start.e4FOCVEv.js","_app/immutable/chunks/entry._tZMCe4c.js","_app/immutable/chunks/scheduler.-jOyszBT.js","_app/immutable/chunks/index.VgqEeJOA.js","_app/immutable/entry/app.4KP_qn3I.js","_app/immutable/chunks/3.MErjPYv9.js","_app/immutable/chunks/scheduler.-jOyszBT.js","_app/immutable/chunks/index.j1-PsbEn.js"],"stylesheets":[],"fonts":[],"uses_env_dynamic_public":false},
>>>>>>> c3fea5a7925b50930e20466f1f46015fb05df71a
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js')),
			__memo(() => import('./nodes/3.js')),
			__memo(() => import('./nodes/4.js')),
			__memo(() => import('./nodes/5.js'))
		],
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			},
			{
				id: "/api/getGallery",
				pattern: /^\/api\/getGallery\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/getGallery/_server.js'))
			},
			{
				id: "/hidden-form-page",
				pattern: /^\/hidden-form-page\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 3 },
				endpoint: null
			},
			{
				id: "/objects",
				pattern: /^\/objects\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 4 },
				endpoint: null
			},
			{
				id: "/objects/[slug]",
				pattern: /^\/objects\/([^/]+?)\/?$/,
				params: [{"name":"slug","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,], errors: [1,], leaf: 5 },
				endpoint: null
			}
		],
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
