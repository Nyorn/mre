import { init } from '../serverless.js';

export const handler = init((() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["cloud01.jpg","favicon.png","fiber01.jpg","radial-gradient01.jpg","splide-shader-carousel.min.js","wave01.jpg"]),
	mimeTypes: {".jpg":"image/jpeg",".png":"image/png",".js":"text/javascript"},
	_: {
		client: {"start":"_app/immutable/entry/start.Ek1vnGhm.js","app":"_app/immutable/entry/app.P2UWKifw.js","imports":["_app/immutable/entry/start.Ek1vnGhm.js","_app/immutable/chunks/entry.nDON0QiE.js","_app/immutable/chunks/scheduler.-jOyszBT.js","_app/immutable/chunks/index.VgqEeJOA.js","_app/immutable/entry/app.P2UWKifw.js","_app/immutable/chunks/preload-helper.0HuHagjb.js","_app/immutable/chunks/scheduler.-jOyszBT.js","_app/immutable/chunks/index.j1-PsbEn.js"],"stylesheets":[],"fonts":[],"uses_env_dynamic_public":false},
		nodes: [
			__memo(() => import('../server/nodes/0.js')),
			__memo(() => import('../server/nodes/1.js')),
			__memo(() => import('../server/nodes/2.js')),
			__memo(() => import('../server/nodes/3.js')),
			__memo(() => import('../server/nodes/4.js'))
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
				endpoint: __memo(() => import('../server/entries/endpoints/api/getGallery/_server.js'))
			},
			{
				id: "/objects",
				pattern: /^\/objects\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 3 },
				endpoint: null
			},
			{
				id: "/objects/[slug]",
				pattern: /^\/objects\/([^/]+?)\/?$/,
				params: [{"name":"slug","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,], errors: [1,], leaf: 4 },
				endpoint: null
			}
		],
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})());
