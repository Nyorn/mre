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
		client: {"start":"_app/immutable/entry/start.naiLoX90.js","app":"_app/immutable/entry/app.UmZklI4g.js","imports":["_app/immutable/entry/start.naiLoX90.js","_app/immutable/chunks/entry.6BS2GpQm.js","_app/immutable/chunks/scheduler.3ecp5ceH.js","_app/immutable/chunks/index.-lbj6D5R.js","_app/immutable/entry/app.UmZklI4g.js","_app/immutable/chunks/preload-helper.0HuHagjb.js","_app/immutable/chunks/scheduler.3ecp5ceH.js","_app/immutable/chunks/index.EzjUPd8-.js"],"stylesheets":[],"fonts":[],"uses_env_dynamic_public":false},
		nodes: [
			__memo(() => import('../server/nodes/0.js')),
			__memo(() => import('../server/nodes/1.js')),
			__memo(() => import('../server/nodes/2.js')),
			__memo(() => import('../server/nodes/3.js')),
			__memo(() => import('../server/nodes/4.js')),
			__memo(() => import('../server/nodes/5.js')),
			__memo(() => import('../server/nodes/6.js')),
			__memo(() => import('../server/nodes/7.js'))
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
				endpoint: __memo(() => import('../server/entries/endpoints/api/getGallery/_server.js'))
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
})());
