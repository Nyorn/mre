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
		client: {"start":"_app/immutable/entry/start.LtxgXAu3.js","app":"_app/immutable/entry/app.d2U9uOoA.js","imports":["_app/immutable/entry/start.LtxgXAu3.js","_app/immutable/chunks/entry.3mtvGSqs.js","_app/immutable/chunks/scheduler.D8q9GPmk.js","_app/immutable/chunks/index.jSArT8Pj.js","_app/immutable/entry/app.d2U9uOoA.js","_app/immutable/chunks/preload-helper.0HuHagjb.js","_app/immutable/chunks/scheduler.D8q9GPmk.js","_app/immutable/chunks/index.Ys2tg9eb.js"],"stylesheets":[],"fonts":[],"uses_env_dynamic_public":false},
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
