// Shared UI state between the persistent 3D stage and route pages.
export const stage = $state({
	/** loading | intro | turn | over | flying | object | idle */
	phase: 'loading',
	ready: false,
	webgl: true,
	/** 0..1 darkening over the scene for text-heavy pages */
	dim: 0
});

/** Imperative handle to the scene API (set by <Stage>). */
export const sceneRef = { api: null };
