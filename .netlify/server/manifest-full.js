export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["cloud01.jpg","favicon.png","fiber01.jpg","radial-gradient01.jpg","robots.txt","splide-shader-carousel.min.js","wave01.jpg"]),
	mimeTypes: {".jpg":"image/jpeg",".png":"image/png",".txt":"text/plain",".js":"text/javascript"},
	_: {
		client: {"start":"_app/immutable/entry/start.VnlAQOQ2.js","app":"_app/immutable/entry/app.OdFSfdyZ.js","imports":["_app/immutable/entry/start.VnlAQOQ2.js","_app/immutable/chunks/entry.OTOzABK4.js","_app/immutable/chunks/scheduler.GTBV_zYd.js","_app/immutable/chunks/index.RAXO4nBt.js","_app/immutable/entry/app.OdFSfdyZ.js","_app/immutable/chunks/preload-helper.0HuHagjb.js","_app/immutable/chunks/scheduler.GTBV_zYd.js","_app/immutable/chunks/index.nSat8M28.js"],"stylesheets":[],"fonts":[],"uses_env_dynamic_public":false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js')),
			__memo(() => import('./nodes/3.js')),
			__memo(() => import('./nodes/4.js')),
			__memo(() => import('./nodes/5.js')),
			__memo(() => import('./nodes/6.js')),
			__memo(() => import('./nodes/7.js'))
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
				id: "/404",
				pattern: /^\/404\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 3 },
				endpoint: null
			},
			{
				id: "/about",
				pattern: /^\/about\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 4 },
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
				id: "/contacts",
				pattern: /^\/contacts\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 5 },
				endpoint: null
			},
			{
				id: "/objects",
				pattern: /^\/objects\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 6 },
				endpoint: null
			},
			{
				id: "/objects/[slug]",
				pattern: /^\/objects\/([^/]+?)\/?$/,
				params: [{"name":"slug","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,], errors: [1,], leaf: 7 },
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
