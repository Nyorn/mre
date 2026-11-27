// Sea Estate coast scene: real terrain + bathymetry, OSM coastline ribbon, dawn sky, clouds, ships.
// Framework-free; the Svelte <Stage> owns DOM overlays and talks to this through the returned API.
import * as THREE from 'three';
import gsap from 'gsap';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { projection } from '#lib/geo/math.js';
import { PLACES, LIGHTHOUSES } from '#lib/geo/places.js';

const EX = 4.0; // vertical relief exaggeration
const CLOUD_H = 16.0;
const ANCHOR = [42.85, 27.78]; // optical centre of the coast for overview framing
const SUN_HOME = 0.075;
const SUN_AZ0 = -1.0; // dawn sun azimuth: east-north-east, over the sea

const glsl = (oct) => /* glsl */ `
#define OCT ${oct}
#define CLOUD_H ${CLOUD_H.toFixed(1)}
uniform float uTime, uSunElev, uCloudAmt, uFogScale;
uniform vec3 uSun, uTarget;
uniform float uDio; uniform vec2 uBox; uniform vec3 uMoon;
float nightAmt(){ return 1.-smoothstep(-.10,.02,uSunElev); }
// distance outside the model's footprint (<=0 inside)
float boxOut(vec3 w){ return max(abs(w.x)-uBox.x, abs(w.z)-uBox.y); }
// world beyond the model dissolves from the horizon inward; returns rim glow at the cut front (-1 = discard)
float dioCut(vec3 w){ float o=boxOut(w); if(o<=0.) return 0.; float R=pow(1.-uDio,2.2)*2600.; if(o>R) return -1.;
  return smoothstep(R-6.,R,o)*step(.001,uDio)*(1.-uDio*.6); }
float hash(vec2 p){ p=fract(p*vec2(123.34,456.21)); p+=dot(p,p+45.32); return fract(p.x*p.y); }
float noise(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),f.x), mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x), f.y); }
float fbm(vec2 p){ float s=0., a=.5; for(int i=0;i<OCT;i++){ s+=a*noise(p); p=mat2(1.6,1.2,-1.2,1.6)*p; a*=.5; } return s; }
float cloudDens(vec2 xz){
  vec2 p = xz*.021 + vec2(uTime*.0045, uTime*.0016);
  float n = fbm(p);
  float cov = mix(.64, .5, uCloudAmt);
  return smoothstep(cov, cov+.2, n);
}
float cloudShadow(vec3 w){
  vec2 xz = w.xz + uSun.xz/max(uSun.y,.08)*(CLOUD_H-w.y);
  return 1. - .5*cloudDens(xz)*smoothstep(-.02,.1,uSunElev);
}
vec3 sky(vec3 d){
  float t = smoothstep(-.14,.30,uSunElev);
  float h = clamp(d.y,0.,1.);
  vec2 sa = normalize(uSun.xz), da = normalize(d.xz+1e-5);
  float toward = pow(max(dot(sa,da),0.),3.);
  vec3 zen = mix(vec3(.012,.025,.05), vec3(.16,.30,.46), t);
  vec3 horAway = mix(vec3(.05,.07,.11), vec3(.50,.58,.66), t);
  horAway = mix(horAway, vec3(.58,.47,.52), .55*smoothstep(-.02,.06,uSunElev)*(1.-smoothstep(.10,.24,uSunElev))*(1.-smoothstep(0.,.16,h)));
  vec3 horSun = mix(vec3(.30,.13,.16), vec3(1.25,.66,.36), t);
  horSun = mix(horAway, horSun, smoothstep(-.19,-.06,uSunElev));
  float noon = smoothstep(.3,.85,uSunElev);
  horSun = mix(horSun, vec3(.72,.80,.86), noon);
  zen = mix(zen, vec3(.20,.38,.60), noon);
  vec3 c = mix(mix(horAway,horSun,toward), zen, pow(h,.45));
  float s = max(dot(d,uSun),0.);
  c += vec3(1.4,.85,.5)*pow(s,900.)*3.*smoothstep(-.06,.02,uSunElev);
  c += vec3(1.,.55,.3)*pow(s,8.)*.35*(1.-t*.6)*(1.-noon*.8)*smoothstep(-.18,-.04,uSunElev);
  return c;
}
vec3 starsMoon(vec3 d){ // night sky detail shared by the dome and water reflections
  float nm=1.-smoothstep(-.10,.02,uSunElev); if(nm<=0.||d.y<=0.) return vec3(0.);
  vec2 p=d.xz/(d.y+.35)*95.; vec2 cell=floor(p); float h=hash(cell);
  vec2 f=fract(p)-.5-(vec2(hash(cell+3.1),hash(cell+7.7))-.5)*.6;
  float st=step(.968,h)*smoothstep(.26,0.,length(f))*smoothstep(.0,.12,d.y)*(.6+.4*sin(uTime*2.5+h*90.));
  vec3 c=vec3(.9,.95,1.)*st*(.5+.9*fract(h*53.))*3.2;
  float md=max(dot(d,uMoon),0.);
  c+=vec3(.85,.9,1.)*(smoothstep(.99988,.99994,md)*1.6+pow(md,60.)*.10+pow(md,8.)*.035)*uDio;
  return c*nm; }
uniform vec4 uCursor;
vec3 cursorLight(vec3 w){ vec2 d=(w.xz-uCursor.xy)/max(uCursor.z,1e-3); float r2=dot(d,d);
  float ng=1.-smoothstep(-.05,.2,uSunElev);
  return vec3(1.,.82,.58)*(exp(-r2*1.2)*.10+exp(-r2*9.)*.08)*uCursor.w*(.6+.8*ng); }
vec3 tone(vec3 c){ c = 1.-exp(-c*1.15); return pow(c, vec3(.95)); }
vec3 sunColor(){ float day=smoothstep(-.10,.25,uSunElev);
  return mix(vec3(1.,.45,.22), vec3(1.05,.82,.62), day)*smoothstep(-.08,.04,uSunElev)*1.6; }
vec3 ambColor(float ny){ float day=smoothstep(-.10,.25,uSunElev);
  return mix(vec3(.065,.09,.15), vec3(.30,.36,.44), day)*(.55+.45*ny); }
vec3 fogged(vec3 c, vec3 wpos, float k){
  vec3 V = wpos-cameraPosition; float dist = length(V);
  return mix(c, sky(normalize(vec3(V.x,.02,V.z))), 1.-exp(-pow(dist*k*uFogScale*(1.-.62*uDio),1.6)));
}
`;

export async function createCoastScene({ canvas, properties, reduce = false, mobile = false, onFrame, onPhase, onInteract }) {
	// geo.json is revalidated every load; its version stamp busts the long-cached images
	const geo = await fetch('/geo/geo.json', { cache: 'no-cache' }).then((r) => r.json());
	const ver = geo.meta.v ? `?v=${geo.meta.v}` : '';
	const img = await new Promise((res, rej) => {
		const i = new Image();
		i.onload = () => res(i);
		i.onerror = rej;
		i.src = '/geo/terrain.png' + ver;
	});
	const M = geo.meta;
	const KW = M.km[0], KH = M.km[1];
	const BOT = 13, EXD = 22; // model base depth, bathymetry exaggeration
	const luImg = M.landuse
		? await new Promise((res) => {
				const i = new Image();
				i.onload = () => res(i);
				i.onerror = () => res(null);
				i.src = '/geo/landuse.png' + ver;
			})
		: null;
	const proj = projection(M);
	const COMMON = glsl(mobile ? 3 : 5);

	// ---------- coordinates ----------
	const cv = Object.assign(document.createElement('canvas'), { width: img.width, height: img.height });
	const cx = cv.getContext('2d', { willReadFrequently: true });
	cx.drawImage(img, 0, 0);
	const px = cx.getImageData(0, 0, img.width, img.height).data;
	const heightUV = (u, v) => {
		const x = Math.min(img.width - 1, Math.max(0, Math.round(u * (img.width - 1))));
		const y = Math.min(img.height - 1, Math.max(0, Math.round(v * (img.height - 1))));
		const i = (y * img.width + x) * 4;
		return px[i + 2] > 127 ? (px[i] / 255) * (M.landMax / 1000) * EX : 0;
	};
	const waterAt = (x, z) => {
		const u = x / KW + 0.5, v = z / KH + 0.5;
		if (u < 0 || u > 1 || v < 0 || v > 1) return false;
		const i = (Math.round(v * (img.height - 1)) * img.width + Math.round(u * (img.width - 1))) * 4;
		return px[i + 2] < 110;
	};
	// bilinear land height matching the terrain mesh (R*land), in world units
	const heightLin = (u, v) => {
		const fx = Math.min(img.width - 1.001, Math.max(0, u * (img.width - 1))), fy = Math.min(img.height - 1.001, Math.max(0, v * (img.height - 1)));
		const x = Math.floor(fx), y = Math.floor(fy), ax = fx - x, ay = fy - y;
		const h = (xx, yy) => {
			const i = (yy * img.width + xx) * 4;
			const land = Math.min(1, Math.max(0, (px[i + 2] / 255 - 0.3) / 0.3));
			return (px[i] / 255) * (M.landMax / 1000) * EX * land * land * (3 - 2 * land);
		};
		return (h(x, y) * (1 - ax) + h(x + 1, y) * ax) * (1 - ay) + (h(x, y + 1) * (1 - ax) + h(x + 1, y + 1) * ax) * ay;
	};
	const world = (lat, lon, lift = 0) => {
		const [u, v] = proj.uv(lat, lon);
		return new THREE.Vector3((u - 0.5) * KW, heightUV(u, v) + lift, (v - 0.5) * KH);
	};
	const toLatLon = (p) => proj.latlon(p.x / KW + 0.5, p.z / KH + 0.5);
	const A = world(...ANCHOR);
	A.y = 0;

	// ---------- renderer ----------
	const renderer = new THREE.WebGLRenderer({ canvas, antialias: !mobile, powerPreference: 'high-performance' });
	renderer.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1.5 : 1.75));
	renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
	const scene = new THREE.Scene();
	const camera = new THREE.PerspectiveCamera(42, 1, 0.05, 4000);
	const target = new THREE.Vector3();

	const U = {
		uTime: { value: 0 },
		uSun: { value: new THREE.Vector3() },
		uSunElev: { value: reduce ? SUN_HOME : -0.12 },
		uTarget: { value: target },
		uCloudAmt: { value: 0.72 },
		uFogScale: { value: mobile ? 0.6 : 1 },
		uRibbon: { value: reduce ? 1 : 0 },
		uFocus: { value: new THREE.Vector3() },
		uFocusAmt: { value: 0 },
		uDio: { value: reduce ? 1 : 0 },
		uSunAz: { value: SUN_AZ0 },
		uMoon: { value: new THREE.Vector3(-0.86, 0.2, 0.47).normalize() },
		uBox: { value: new THREE.Vector2(KW / 2, KH / 2) },
		uRose: { value: new THREE.Vector3() },
		uRip: { value: Array.from({ length: 8 }, () => new THREE.Vector4(0, 0, -99, 1)) },
		uCursor: { value: new THREE.Vector4(0, 0, 1, 0) }
	};
	const setSun = () => {
		const e = U.uSunElev.value;
		const az = U.uSunAz.value;
		U.uSun.value.set(Math.cos(e) * Math.cos(az), Math.sin(e), Math.cos(e) * Math.sin(az)).normalize();
	};
	setSun();
	{
		const r = world(43.55, 28.74);
		U.uRose.value.set(r.x, r.z, 8.5);
	}

	// sky
	const skyMesh = new THREE.Mesh(
		new THREE.SphereGeometry(1900, 32, 16),
		new THREE.ShaderMaterial({
			side: THREE.BackSide,
			depthWrite: false,
			uniforms: U,
			vertexShader: `varying vec3 vD; void main(){ vD=(modelMatrix*vec4(position,1.)).xyz-cameraPosition;
        gl_Position=projectionMatrix*viewMatrix*modelMatrix*vec4(position,1.); gl_Position.z=gl_Position.w*.9999; }`,
			fragmentShader:
				COMMON +
				`varying vec3 vD;
        void main(){ vec3 d0=normalize(vD); vec3 d=d0; d.y=max(d.y,-.02); vec3 c=sky(d);
          if(d0.y<0.){ // the model floats above a sea of clouds
            float dn=-d0.y; vec2 cp=d0.xz/(dn+.04)*2.2+vec2(uTime*.01,uTime*.004);
            float cd=fbm(cp)*.7+fbm(cp*2.7+3.)*.3; float puff=smoothstep(.32,.75,cd);
            float day=smoothstep(-.10,.25,uSunElev), nm=1.-smoothstep(-.10,.02,uSunElev);
            float toward=pow(max(dot(normalize(d0.xz),normalize(uSun.xz)),0.),3.);
            vec3 top=mix(vec3(.05,.06,.10),vec3(.78,.80,.86),day)+sunColor()*(.35+.6*toward)*(.4+.6*puff);
            top+=vec3(.10,.13,.22)*nm; // moonlit
            vec3 gap=mix(vec3(.01,.015,.03),vec3(.22,.30,.42),day);
            vec3 sea=mix(gap,top,puff)*(.75+.25*cd);
            float hz=smoothstep(0.,.22,dn);
            c=mix(c, mix(c,sea,hz), uDio);
          }
          if(d0.y>0.){ // high cirrus streaks, lit by the low sun
            vec2 cp=d0.xz/(d0.y+.12)*1.6+vec2(uTime*.004,0.);
            float ci=fbm(vec2(cp.x*.7+cp.y*.4,cp.y*3.2))*fbm(cp*2.3+7.);
            ci=smoothstep(.18,.42,ci)*smoothstep(0.,.25,d0.y)*(1.-smoothstep(.55,.95,d0.y))*smoothstep(-.16,-.02,uSunElev);
            float fwd=pow(max(dot(normalize(d0.xz),normalize(uSun.xz)),0.),2.);
            vec3 ctint=mix(vec3(.9,.92,1.)*.55, vec3(1.25,.55,.42), (1.-smoothstep(.05,.35,uSunElev)))*(.35+.9*fwd);
            c=mix(c, c*.7+ctint*smoothstep(-.12,.02,uSunElev), ci*.55);
            // milky way at night
            vec3 mwN=normalize(vec3(.45,.55,-.7)); float band=exp(-pow(dot(d0,mwN)/.17,2.));
            float mw=band*(.4+.9*fbm(d0.xz/(d0.y+.3)*9.))*nightAmt()*uDio;
            c+=vec3(.45,.5,.68)*mw*.16;
            // warm corona around the sun
            float sd=max(dot(d0,uSun),0.); c+=vec3(1.,.6,.32)*pow(sd,40.)*.12*smoothstep(-.08,.05,uSunElev);
          }
          c+=starsMoon(d0);
          gl_FragColor=vec4(tone(c),1.); }`
		})
	);
	scene.add(skyMesh);

	// terrain
	const tex = new THREE.Texture(img);
	tex.generateMipmaps = false;
	tex.minFilter = tex.magFilter = THREE.LinearFilter;
	tex.needsUpdate = true;
	Object.assign(U, {
		uMap: { value: tex },
		uTexel: { value: new THREE.Vector2(1 / M.size[0], 1 / M.size[1]) },
		uKM: { value: new THREE.Vector2(KW, KH) },
		uLand: { value: (M.landMax / 1000) * EX }
	});
	const luTex = new THREE.Texture(luImg || undefined);
	if (luImg) {
		luTex.minFilter = THREE.LinearMipmapLinearFilter;
		luTex.magFilter = THREE.LinearFilter;
		luTex.anisotropy = 4;
		luTex.needsUpdate = true;
	}
	U.uLU = { value: luTex };
	U.uHasLU = { value: luImg ? 1 : 0 };
	// terrain: detailed mesh over the bbox + a low-res skirt that continues the edge outward to the horizon
	const terrainMat = (skirt) =>
		new THREE.ShaderMaterial({
			uniforms: U,
			alphaToCoverage: true,
			defines: { ...(skirt ? { SKIRT: 1 } : {}), SH_STEPS: mobile || skirt ? 0 : 12 },
			vertexShader: `uniform sampler2D uMap; uniform float uLand, uDio; uniform vec2 uKM; varying vec2 vUv; varying vec3 vW;
        void main(){ vec4 w0=modelMatrix*vec4(position,1.); vec2 uv=vec2(w0.x/uKM.x+.5, .5-w0.z/uKM.y); vUv=uv;
          vec4 t=texture2D(uMap,clamp(uv,0.,1.)); float land=smoothstep(.3,.6,t.b);
          float ed=mix(smoothstep(0.,.06,min(min(uv.x,1.-uv.x),min(uv.y,1.-uv.y))),1.,uDio);
          #ifdef SKIRT
            ed=0.;
          #endif
          vec3 p=position; p.y=t.r*uLand*ed*land+.06;
          vec4 w=modelMatrix*vec4(p,1.); vW=w.xyz; gl_Position=projectionMatrix*viewMatrix*w; }`,
			fragmentShader:
				COMMON +
				`uniform sampler2D uMap, uLU; uniform vec2 uTexel,uKM; uniform float uLand, uHasLU; varying vec2 vUv; varying vec3 vW;
        void main(){
          float rim=0.;
          #ifdef SKIRT
            if(vUv.x>0.002&&vUv.x<.998&&vUv.y>0.002&&vUv.y<.998) discard;
            rim=dioCut(vW); if(rim<0.) discard;
          #endif
          vec2 uv=clamp(vUv,0.,1.);
          #ifdef SKIRT
          { // continue the coast beyond the data: Turkey to the south-east, Romania to the north-north-east
            float w=fbm(vUv*vec2(7.,11.))-.5;
            if(vUv.y>1.){ float k=vUv.y-1.; uv.x=clamp(vUv.x-k*1.3+w*k*.9,0.,1.); }
            if(vUv.y<0.){ float k=-vUv.y; uv.x=clamp(vUv.x-k*1.0+w*k*.9,0.,1.); }
          }
          #endif
          vec4 t=texture2D(uMap,uv); float aw=max(fwidth(t.b),1e-3); float cov=smoothstep(.5-aw,.5+aw,t.b); if(cov<.01) discard;
          float camD=length(vW-cameraPosition);
          float near=1.-smoothstep(25.,90.,camD);
          float hE=texture2D(uMap,uv+vec2(uTexel.x,0)).r, hW=texture2D(uMap,uv-vec2(uTexel.x,0)).r;
          float hN=texture2D(uMap,uv+vec2(0,uTexel.y)).r, hS=texture2D(uMap,uv-vec2(0,uTexel.y)).r;
          float dx=(hE-hW)*uLand/(2.*uTexel.x*uKM.x), dz=(hS-hN)*uLand/(2.*uTexel.y*uKM.y);
          float ed=mix(smoothstep(0.,.06,min(min(vUv.x,1.-vUv.x),min(vUv.y,1.-vUv.y))),1.,uDio);
          vec3 n=normalize(vec3(-dx*ed,1.,-dz*ed));
          float hm=t.r*1100.*ed;
          float vary=fbm(vW.xz*.35)*.5+mix(.5,fbm(vW.xz*2.2),near)*.5;
          vec3 sand=vec3(.40,.34,.24), olive=vec3(.12,.15,.09), forest=vec3(.08,.11,.07), ridge=vec3(.31,.29,.25);
          vec3 base=mix(sand,olive,smoothstep(1.,22.,hm+vary*14.+(1.-ed)*30.));
          base=mix(base,forest,smoothstep(.45,.7,vary)*smoothstep(30.,120.,hm));
          base=mix(base,ridge,smoothstep(240.,520.,hm));
          base*=.85+.3*vary;
          vec3 lu=vec3(0.);
          #ifndef SKIRT
          lu=texture2D(uLU,uv).rgb*uHasLU;
          #endif
          float wet=(1.-smoothstep(.5,.56,t.b))*near;
          base*=1.-wet*.35;
          // beaches: bright sand ribbon
          base=mix(base,vec3(.78,.66,.48),smoothstep(.45,.8,lu.g)*.75);
          // built-up: pale limestone with a faint block grain when close
          float blocks=noise(vW.xz*26.)*near;
          vec3 town=vec3(.50,.45,.39)*(.85+.3*blocks);
          base=mix(base,town,smoothstep(.2,.7,lu.r)*min(.26,mix(.04,.1,near)*(1.+3.*smoothstep(.4,.6,lu.b))));
          float sh=1.;
          #if SH_STEPS > 0
          { float lxz=max(length(uSun.xz),1e-3); vec2 dUV=vec2(uSun.x/uKM.x,-uSun.z/uKM.y)/lxz; float slope=uSun.y/lxz;
            float h0=vW.y; float st=.3;
            for(int i=0;i<SH_STEPS;i++){ vec2 q=uv+dUV*st; vec4 tq=texture2D(uMap,q);
              float hq=tq.r*uLand*smoothstep(.3,.6,tq.b); sh=min(sh,clamp((h0+slope*st-hq)*3.+1.,0.,1.)); st*=1.42; }
          }
          #endif
          float lit=max(dot(n,uSun),0.)*cloudShadow(vW)*mix(.25,1.,sh);
          vec3 c=base*(ambColor(n.y)*1.35+sunColor()*lit*1.15+vec3(.09,.12,.2)*max(dot(n,uMoon),0.)*nightAmt()*uDio);
          float cl=hm/50.; float fw=max(fwidth(cl),1e-4); float f=abs(fract(cl-.5)-.5)/fw;
          float clFade=(1.-smoothstep(.25,.6,fw))*smoothstep(8.,30.,hm);
          c=mix(c, c*1.35+vec3(.02,.018,.012), (1.-min(f,1.))*.32*clFade);
          { float ng=1.-smoothstep(-.07,.03,uSunElev);
            float grain=noise(vW.xz*38.)*noise(vW.xz*11.+3.);
            c+=vec3(1.,.62,.32)*smoothstep(.2,.7,lu.r)*(.06+1.4*grain*grain)*ng*mix(.12,1.,smoothstep(.4,.6,lu.b))*mix(1.,.3,near);
            c+=vec3(1.,.58,.28)*smoothstep(.1,.75,lu.b)*.07*ng*(1.-near*.7); }
          { // town boundaries: soft warm fill + crisp glowing outline
            float fb=max(fwidth(lu.b),1e-4);
            float edge=1.-smoothstep(fb*.6,fb*1.8,abs(lu.b-.5));
            float glow=exp(-abs(lu.b-.5)/(fb*5.))*.35;
            float inside=smoothstep(.45,.6,lu.b);
            c=mix(c,c*1.18+vec3(.035,.025,.01),inside*.6*smoothstep(-.07,.03,uSunElev));
            }
          c+=vec3(1.4,.8,.45)*rim*2.;
          c+=cursorLight(vW)*(.6+.4*base*3.);
          gl_FragColor=vec4(tone(fogged(c,vW,.0029)),cov);
        }`
		});
	const tg = new THREE.PlaneGeometry(KW, KH, mobile ? 300 : 480, mobile ? 450 : 720);
	tg.rotateX(-Math.PI / 2);
	scene.add(new THREE.Mesh(tg, terrainMat(false)));
	const sg = new THREE.PlaneGeometry(KW * 9, KH * 9, 90, 90);
	sg.rotateX(-Math.PI / 2);
	const skirt = new THREE.Mesh(sg, terrainMat(true));
	skirt.position.y = -0.01;
	scene.add(skirt);

	// water
	const wg = new THREE.PlaneGeometry(3600, 3600, 1, 1);
	wg.rotateX(-Math.PI / 2);
	scene.add(
		new THREE.Mesh(
			wg,
			new THREE.ShaderMaterial({
				uniforms: U,
				vertexShader: `varying vec3 vW; void main(){ vec4 w=modelMatrix*vec4(position,1.); vW=w.xyz; gl_Position=projectionMatrix*viewMatrix*w; }`,
				fragmentShader:
					COMMON +
					`uniform sampler2D uMap; uniform vec2 uKM; uniform vec3 uRose; uniform vec4 uRip[8]; varying vec3 vW;
        vec2 grad(vec2 p){ float e=.05, a=0., b=0., amp=1., fr=1.;
          for(int i=0;i<4;i++){ vec2 q=p*fr+vec2(uTime*.35*fr,uTime*.22);
            a+=(noise(q+vec2(e,0))-noise(q-vec2(e,0)))*amp; b+=(noise(q+vec2(0,e))-noise(q-vec2(0,e)))*amp; amp*=.55; fr*=2.1; }
          return vec2(a,b)/(2.*e); }
        void main(){
          float rim=dioCut(vW); if(rim<0.) discard;
          vec2 uv=vec2(vW.x/uKM.x+.5, .5-vW.z/uKM.y);
          float inside=step(0.,uv.x)*step(uv.x,1.)*step(0.,uv.y)*step(uv.y,1.);
          float ef=smoothstep(0.,.1,min(min(uv.x,1.-uv.x),min(uv.y,1.-uv.y)));
          float depth=mix(1.,texture2D(uMap,clamp(uv,0.,1.)).g,inside*ef);
          vec3 V=vW-cameraPosition; float dist=length(V); vec3 vd=V/dist;
          float far=smoothstep(15.,120.,dist);
          vec2 g=grad(vW.xz*1.6)*.045*(1./(1.+dist*.02))*(1.-far*.7);
          { // long directional swell (from the north-east) — only where it resolves
            float sw=1.-smoothstep(8.,40.,dist);
            vec2 d1=normalize(vec2(-.6,.8)), d2=normalize(vec2(-.9,.35));
            g+=d1*cos(dot(d1,vW.xz)*38.-uTime*2.2)*.05*sw + d2*cos(dot(d2,vW.xz)*61.-uTime*2.9)*.03*sw; }
          float ripGlow=0.;
          float caps=0.;
          { // wind waves at three scales, each kept only where it resolves on screen
            vec2 wd=normalize(vec2(-.75,.55));
            for(int i=0;i<3;i++){ float fq=i==0?.9:(i==1?3.2:11.); float amp=i==0?.2:(i==1?.1:.05);
              vec2 q=vW.xz*fq; float res=1.-smoothstep(.15,.6,fwidth(q.x)+fwidth(q.y));
              float ph=dot(q,wd)*2.2-uTime*(1.1+float(i)*.6);
              vec2 gw=wd*cos(ph+noise(q*.6)*3.)+vec2(noise(q+uTime*.25)-.5,noise(q.yx-uTime*.2)-.5)*.8;
              g+=gw*amp*res;
              // whitecaps riding the crests
              float crest=smoothstep(.9,1.,sin(ph+noise(q*.6)*3.))*smoothstep(.72,.86,noise(q*2.3+vec2(uTime*.3,0.)));
              caps+=crest*res*(i==0?0.:(i==1?.22:.35)); }
            caps*=inside*ef*(1.-clamp(texture2D(uMap,clamp(uv,0.,1.)).b/.5,0.,1.)*.6); }
          vec3 n=normalize(vec3(-g.x,1.,-g.y));
          vec3 r=reflect(vd,n); r.y=abs(r.y);
          float fres=.02+.98*pow(1.-max(dot(-vd,n),0.),5.);
          float day=smoothstep(-.10,.25,uSunElev);
          float sh=cloudShadow(vW);
          vec3 shallow=mix(vec3(.03,.08,.09),vec3(.10,.30,.30),day), deep=mix(vec3(.008,.02,.03),vec3(.02,.08,.12),day);
          vec3 body=mix(shallow,deep,smoothstep(0.,.55,depth))*(.55+.45*sh);
          float nm=nightAmt();
          body+=vec3(.010,.022,.035)*nm;
          // shoreline: turquoise shallows, caustics, rolling surf (close range only)
          float lm=texture2D(uMap,clamp(uv,0.,1.)).b*inside; float sh0=clamp(lm/.5,0.,1.);
          float nearW=1.-smoothstep(12.,60.,dist);
          float shw=smoothstep(.12,.0,depth)*inside*ef;
          body=mix(body,mix(vec3(.04,.14,.15),vec3(.16,.52,.50),day),shw*(.35+.45*sh0));
          { vec2 cq=vW.xz*55.+uTime*.6; float ca=pow(1.-abs(noise(cq)-noise(cq*1.7+3.1)),8.);
            body+=vec3(.5,.8,.7)*ca*shw*sh0*day*nearW*.35; }
          vec3 c=mix(body,(sky(r)+starsMoon(r)*.8)*(.7+.3*sh),fres*.9);
          { float k=(1.-sh0)*4.; float br=noise(vW.xz*18.+uTime*.2);
            float wave=smoothstep(.86,1.,sin(k*6.2832+uTime*1.6+br*2.5))*smoothstep(.55,.8,sh0)*(1.-smoothstep(.9,.97,sh0))*step(.45,br);
            float edge=smoothstep(.86,.97,sh0)*(.6+.4*br);
            float foam=(wave*.55*(.4+.6*br)+edge)*nearW*inside;
            c=mix(c,vec3(.92,.95,.94)*(.35+.75*day)*(1.-.6*nm),clamp(foam,0.,1.)*.85); }
          // moon path
          float mp=pow(max(dot(r,uMoon),0.),mix(90.,24.,far))*smoothstep(20.,80.,dist);
          c+=vec3(.75,.82,.95)*mp*nm*uDio*2.6;
          // bathymetric isolines every 20 m (shelf) — chart detail
          { float dm=depth*depth*1500.; float lv=dm/20.; float fw=max(fwidth(lv),1e-4);
            float ln=1.-min(abs(fract(lv-.5)-.5)/fw,1.);
            float fade=inside*ef*(1.-smoothstep(.4,.8,fw))*smoothstep(4.,12.,dm)*smoothstep(25.,90.,dist);
            c=mix(c,c+vec3(.10,.14,.15)*(.4+.6*smoothstep(-.1,.4,uSunElev))+vec3(.06,.07,.09)*nm,ln*fade*.55); }
          // compass rose engraved on the open sea
          { vec2 q=(vW.xz-uRose.xy)/uRose.z; float rr=length(q);
            if(rr<1.3){ float aa=atan(q.x,-q.y); float px=fwidth(rr)*1.2;
              float ring=1.-smoothstep(0.,px,abs(rr-.86)); ring+=1.-smoothstep(0.,px,abs(rr-.93));
              float seg=3.14159/18.;
              float tick=step(.93,rr)*step(rr,1.0)*(1.-smoothstep(0.,.012,abs(fract(aa/seg+.5)-.5)*seg*rr));
              float star=0., shade=0.;
              for(int k=0;k<8;k++){ float ang=float(k)*.785398; vec2 dir=vec2(sin(ang),-cos(ang)); vec2 pp=vec2(-dir.y,dir.x);
                bool card=(k==0||k==2||k==4||k==6);
                float L=(k==0)?1.15:(card?.9:.55); float W=card?.11:.07;
                float u=dot(q,dir), v=dot(q,pp); float inS=step(0.,u)*step(u,L)*step(abs(v),W*(1.-u/L));
                star=max(star,inS); shade=max(shade,inS*step(0.,v)); }
              vec3 gold=vec3(.95,.74,.42);
              float vis=(.35+.65*nm)*.9*(1.-smoothstep(.6,1.6,fwidth(rr)*60.));
              c=mix(c,gold*(.35+.65*shade)*(.6+.8*nm),star*.38*vis);
              c+=gold*(ring*.35+tick*.3)*vis; } }
          float ex=mix(220.,36.,far);
          float s=pow(max(dot(r,uSun),0.),ex)*smoothstep(-.06,.03,uSunElev)*sh*mix(3.,.9,far);
          c+=vec3(1.5,.9,.55)*s;
          // sun glitter: sparse sparks on the facets facing the sun
          { vec2 gc=floor(vW.xz*260.); float tw=floor(uTime*5.+hash(gc)*10.);
            float sp=step(.965,hash(gc+tw*.37))*pow(max(dot(r,uSun),0.),18.);
            float res=1.-smoothstep(.3,1.,fwidth(vW.x*260.));
            c+=vec3(1.6,1.1,.7)*sp*res*smoothstep(-.02,.1,uSunElev)*sh*2.5; }
          c=mix(c,vec3(.9,.94,.95)*(.3+.7*day)+vec3(.05,.06,.1)*nm,clamp(caps,0.,1.)*.5*(1.-nm*.7));
          c+=cursorLight(vW)*1.4;
          c+=vec3(1.4,.8,.45)*rim*2.;
          gl_FragColor=vec4(tone(fogged(c,vW,.0032)),1.);
        }`
			})
		)
	);

	// ---------- diorama: cut walls (soil strata / water column / seabed) + base ----------
	const wallMat = new THREE.ShaderMaterial({
		uniforms: { ...U, uBot: { value: BOT }, uExd: { value: EXD } },
		vertexShader: `uniform sampler2D uMap; uniform float uLand, uBot, uDio; uniform vec2 uKM; attribute float top;
        varying vec2 vUv; varying vec3 vW; varying vec3 vN;
        void main(){ vec2 uv=clamp(vec2(position.x/uKM.x+.5,.5-position.z/uKM.y),.0006,.9994); vUv=uv;
          vec4 t=texture2D(uMap,uv); float land=smoothstep(.3,.6,t.b);
          vec3 p=position; p.y = top>.5 ? max(t.r*uLand*land+.06*land,0.) : -uBot*uDio;
          vN=normal; vec4 w=modelMatrix*vec4(p,1.); vW=w.xyz; gl_Position=projectionMatrix*viewMatrix*w; }`,
		fragmentShader:
			COMMON +
			`uniform sampler2D uMap; uniform float uLand, uBot, uExd; varying vec2 vUv; varying vec3 vW; varying vec3 vN;
        void main(){
          vec4 t=texture2D(uMap,vUv); float land=smoothstep(.3,.6,t.b);
          float surf=max(t.r*uLand*land+.06*land,0.);
          float bed= land>.5 ? 0. : max(-t.g*t.g*1.5*uExd, -uBot*.62);
          float y=vW.y; float along=vW.x+vW.z;
          vec3 n=normalize(vN);
          float lit=max(dot(n,uSun),0.)*.9+.1;
          float day=smoothstep(-.10,.25,uSunElev);
          vec3 c;
          float wob=noise(vec2(along*.35,y*.8))*.35+noise(vec2(along*2.,y*3.))*.12;
          if(y<0. && y>bed && land<.5){
            // water column: glassy teal fading to ink with drifting light shafts
            float k=clamp(-y/max(-bed,.01),0.,1.);
            vec3 top=mix(vec3(.05,.20,.22),vec3(.16,.46,.46),day), deep=mix(vec3(.01,.03,.05),vec3(.02,.10,.14),day);
            c=mix(top,deep,pow(k,.7));
            float shaft=pow(noise(vec2(along*.08+uTime*.03,y*.15)),2.)*(1.-k)*.35;
            c+=vec3(.25,.45,.42)*shaft*(.3+.7*day);
            c+=vec3(.5,.8,.8)*exp(y*60.)*.35; // meniscus
          } else {
            // ground strata
            float d=surf-y; float b=y+wob;
            vec3 soil=vec3(.16,.11,.07), clay=vec3(.36,.24,.15), lime=vec3(.55,.48,.38), rock=vec3(.22,.20,.19), sand=vec3(.62,.52,.36);
            float band=fract(b*.55);
            c=mix(lime,clay,smoothstep(.2,.35,band)*(1.-smoothstep(.62,.7,band)));
            c=mix(c,rock,smoothstep(-4.,-9.,y));
            c*=.82+.36*noise(vec2(along*3.,y*14.));
            if(land<.5) c=mix(c,sand,smoothstep(.25,0.,bed-y+.25)*step(y,bed));
            c=mix(c,soil,smoothstep(.22,.05,d)*land);
            c=mix(c,vec3(.12,.16,.08),smoothstep(.06,0.,d)*land);
          }
          c*= ambColor(.4)*2.2+sunColor()*lit*.9;
          c*= mix(.3,1.,smoothstep(-uBot,-uBot+5.,y)); // contact darkening near the base
          float gild=exp(-abs(y-max(surf,0.))*28.)*.5+exp(-abs(y+uBot)*40.)*.6;
          c+=vec3(1.,.74,.42)*gild*(.4+.6*(1.-day));
          gl_FragColor=vec4(tone(fogged(c,vW,.0029)),1.);
        }`
	});
	const walls = new THREE.Group();
	{
		const hx = KW / 2, hz = KH / 2;
		const edges = [
			[[-hx, -hz], [hx, -hz], [0, 0, -1]],
			[[hx, -hz], [hx, hz], [1, 0, 0]],
			[[hx, hz], [-hx, hz], [0, 0, 1]],
			[[-hx, hz], [-hx, -hz], [-1, 0, 0]]
		];
		for (const [[x0, z0], [x1, z1], nrm] of edges) {
			const N = Math.round(Math.hypot(x1 - x0, z1 - z0) * (mobile ? 2.5 : 5));
			const pos = [], topA = [], nor = [], idx = [];
			for (let i = 0; i <= N; i++) {
				const k = i / N, x = x0 + (x1 - x0) * k, z = z0 + (z1 - z0) * k;
				pos.push(x, 0, z, x, 0, z);
				topA.push(1, 0);
				nor.push(...nrm, ...nrm);
				if (i < N) {
					const a = i * 2;
					idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
				}
			}
			const g = new THREE.BufferGeometry();
			g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
			g.setAttribute('top', new THREE.Float32BufferAttribute(topA, 1));
			g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
			g.setIndex(idx);
			const m = new THREE.Mesh(g, wallMat);
			m.frustumCulled = false;
			wallMat.side = THREE.DoubleSide;
			walls.add(m);
		}
		const base = new THREE.Mesh(
			new THREE.PlaneGeometry(KW, KH).rotateX(Math.PI / 2),
			new THREE.MeshBasicMaterial({ color: 0x05080a })
		);
		base.position.y = -BOT;
		walls.add(base);
	}
	const floor = new THREE.Mesh(
		new THREE.PlaneGeometry(KW * 4, KH * 4).rotateX(-Math.PI / 2),
		new THREE.ShaderMaterial({
			uniforms: U,
			transparent: true,
			depthWrite: false,
			vertexShader: `varying vec3 vW; void main(){ vec4 w=modelMatrix*vec4(position,1.); vW=w.xyz; gl_Position=projectionMatrix*viewMatrix*w; }`,
			fragmentShader:
				COMMON +
				`varying vec3 vW;
        void main(){ vec2 q=abs(vW.xz)-uBox; float o=length(max(q,0.))+min(max(q.x,q.y),0.);
          float shadow=1.-smoothstep(-20.,60.,o);
          float glow=exp(-max(o,0.)/90.)*(1.-smoothstep(0.,700.,length(vW.xz)));
          vec3 c=vec3(.55,.38,.26)*glow*.10*smoothstep(-.1,.2,uSunElev+.15);
          float a=(shadow*mix(.8,.45,smoothstep(.2,.8,uSunElev))+glow*.5)*uDio;
          gl_FragColor=vec4(tone(c),a); }`
		})
	);
	floor.position.y = -BOT - 6;
	floor.renderOrder = -1;
	walls.add(floor);
	walls.visible = false;
	scene.add(walls);

	// clouds: one fbm deck, lit from below at dawn, opened up around the camera target when seen from above
	const cloudLayer = (layer) => new THREE.Mesh(
		new THREE.PlaneGeometry(1100, 1100, 1, 1).rotateX(-Math.PI / 2),
		new THREE.ShaderMaterial({
			uniforms: { ...U, uLayer: { value: layer } },
			transparent: true,
			depthWrite: false,
			side: THREE.DoubleSide,
			vertexShader: `varying vec3 vW; void main(){ vec4 w=modelMatrix*vec4(position,1.); vW=w.xyz; gl_Position=projectionMatrix*viewMatrix*w; }`,
			fragmentShader:
				COMMON +
				`varying vec3 vW;
        uniform float uLayer;
        void main(){
          float d0=cloudDens(vW.xz+vec2(uLayer*1.3,uLayer*.7));
          float d=uLayer==0. ? d0 : clamp((d0-.38)/.62,0.,1.); if(d<.01) discard;
          float d2=cloudDens(vW.xz+normalize(uSun.xz)*5.);
          vec3 V=vW-cameraPosition; float dist=length(V); vec3 vd=V/dist;
          float day=smoothstep(-.10,.25,uSunElev);
          float forward=pow(max(dot(vd,uSun),0.),5.);
          vec3 sc=sunColor();
          vec3 base=mix(vec3(.05,.06,.09),vec3(.78,.80,.86),day)+vec3(.04,.05,.08)*nightAmt();
          vec3 c=base*(.55+.35*(1.-d2)) + sc*(.32+.95*forward)*(1.-d2*.6);
          c+=sc*forward*(1.-d)*1.2;
          float above=step(CLOUD_H,cameraPosition.y);
          float hole=mix(1., mix(.5,1.,smoothstep(14.,70.,length(vW.xz-uTarget.xz))), above);
          float a=d*(uLayer==0.?.7:.45)*hole*smoothstep(.5,8.,dist)*(1.-smoothstep(320.,520.,dist));
          a*=1.-uDio*smoothstep(-10.,30.,boxOut(vW));
          a*=1.-.55*nightAmt();
          gl_FragColor=vec4(tone(fogged(c,vW,.0034)),a);
        }`
		})
	);
	const clouds = new THREE.Group();
	for (const [layer, dy] of [[-1, -0.9], [0, 0], [1, 0.9]]) {
		const m = cloudLayer(layer);
		m.position.y = CLOUD_H + dy;
		m.renderOrder = 5 + layer * 0.1;
		clouds.add(m);
	}
	scene.add(clouds);

	// coastline ribbon: the signature line
	{
		const pos = [], side = [], dist = [], nrm = [], idx = [];
		let base = 0;
		for (const line of geo.coast) {
			if (line.length < 2) continue;
			const pts = line.map(([u, v]) => new THREE.Vector3((u - 0.5) * KW, heightUV(u, v) * 0.6 + 0.08, (v - 0.5) * KH));
			let acc = 0;
			for (let i = 0; i < pts.length; i++) {
				const p = pts[i], a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
				const dx = b.x - a.x, dz = b.z - a.z, l = Math.hypot(dx, dz) || 1;
				if (i > 0) acc += p.distanceTo(pts[i - 1]);
				pos.push(p.x, p.y, p.z, p.x, p.y, p.z);
				side.push(1, -1);
				dist.push(acc, acc);
				nrm.push(-dz / l, dx / l, -dz / l, dx / l);
				if (i < pts.length - 1) {
					const k = base + i * 2;
					idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2);
				}
			}
			base += pts.length * 2;
		}
		const g = new THREE.BufferGeometry();
		g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
		g.setAttribute('side', new THREE.Float32BufferAttribute(side, 1));
		g.setAttribute('dist', new THREE.Float32BufferAttribute(dist, 1));
		g.setAttribute('nrm', new THREE.Float32BufferAttribute(nrm, 2));
		g.setIndex(idx);
		const ribbon = new THREE.Mesh(
			g,
			new THREE.ShaderMaterial({
				uniforms: U,
				transparent: true,
				depthWrite: false,
				depthTest: false,
				side: THREE.DoubleSide,
				blending: THREE.AdditiveBlending,
				vertexShader: `attribute float side,dist; attribute vec2 nrm; varying float vS,vD; varying vec3 vW;
          void main(){ vS=side; vD=dist; vec4 w=modelMatrix*vec4(position,1.);
            float d=length(w.xyz-cameraPosition); w.xz+=nrm*side*clamp(d*.0042,.02,.6);
            vW=w.xyz; gl_Position=projectionMatrix*viewMatrix*w; }`,
				fragmentShader: `uniform float uTime,uSunElev,uFocusAmt,uRibbon; uniform vec3 uFocus; uniform vec2 uKM; varying float vS,vD; varying vec3 vW;
          void main(){
            float zf=mix(-uKM.y*.5-4., uKM.y*.5+30., uRibbon); if(vW.z>zf) discard;
            float head=exp(-(zf-vW.z)*.22)*(1.-step(.999,uRibbon));
            float core=exp(-vS*vS*22.)*.8, glow=exp(-vS*vS*2.5)*.3;
            float pulse=pow(.5+.5*sin(vD*.22-uTime*.9),6.)*.55;
            float foc=uFocusAmt*exp(-length(vW.xz-uFocus.xz)*.35);
            float night=.55-smoothstep(-.05,.30,uSunElev)*.2;
            vec3 c=vec3(1.,.74,.42)*(core*.9+glow*.8)*(.95+pulse*1.2+foc*1.8)*night;
            c+=vec3(1.,.9,.7)*head*(core*5.+glow*3.);
            c*=.85*exp(-length(vW-cameraPosition)*.0025);
            gl_FragColor=vec4(c,1.);
          }`
			})
		);
		ribbon.renderOrder = 6;
		scene.add(ribbon);
	}

	// ---------- town outlines (baked contours of built-up zones) ----------
	let outlMesh = null;
	if (geo.towns?.length) {
		const pos = [], side = [], dist = [], nrm = [], idx = [];
		let base = 0;
		const runs = [];
		for (const line of geo.towns) {
			let run = [];
			for (const pt of line) {
				if (waterAt((pt[0] - 0.5) * KW, (pt[1] - 0.5) * KH)) {
					if (run.length > 1) runs.push(run);
					run = [];
				} else run.push(pt);
			}
			if (run.length > 1) runs.push(run);
		}
		for (const line of runs) {
			const pts = line.map(([u, v]) => new THREE.Vector3((u - 0.5) * KW, Math.max(0, heightUV(u, v)) + 0.14, (v - 0.5) * KH));
			let acc = 0;
			for (let i = 0; i < pts.length; i++) {
				const p = pts[i], a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
				const dx = b.x - a.x, dz = b.z - a.z, l = Math.hypot(dx, dz) || 1;
				if (i > 0) acc += p.distanceTo(pts[i - 1]);
				pos.push(p.x, p.y, p.z, p.x, p.y, p.z);
				side.push(1, -1);
				dist.push(acc, acc);
				nrm.push(-dz / l, dx / l, -dz / l, dx / l);
				if (i < pts.length - 1) {
					const k = base + i * 2;
					idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2);
				}
			}
			base += pts.length * 2;
		}
		const g = new THREE.BufferGeometry();
		g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
		g.setAttribute('side', new THREE.Float32BufferAttribute(side, 1));
		g.setAttribute('dist', new THREE.Float32BufferAttribute(dist, 1));
		g.setAttribute('nrm', new THREE.Float32BufferAttribute(nrm, 2));
		g.setIndex(idx);
		const outl = new THREE.Mesh(
			g,
			new THREE.ShaderMaterial({
				uniforms: U,
				transparent: true,
				depthWrite: false,
				side: THREE.DoubleSide,
				blending: THREE.AdditiveBlending,
				vertexShader: `attribute float side,dist; attribute vec2 nrm; varying float vS,vD,vCam;
          void main(){ vS=side; vD=dist; vec4 w=modelMatrix*vec4(position,1.);
            float d=length(w.xyz-cameraPosition); vCam=d; w.xz+=nrm*side*clamp(d*.0026,.015,.6); w.y+=d*.002;
            gl_Position=projectionMatrix*viewMatrix*w; }`,
				fragmentShader: `uniform float uTime,uSunElev,uRibbon; varying float vS,vD,vCam;
          void main(){ float core=exp(-vS*vS*6.);
            float dash=smoothstep(.15,.3,fract(vD*.9-uTime*.15))*(1.-smoothstep(.75,.9,fract(vD*.9-uTime*.15)));
            float ng=1.-smoothstep(-.02,.2,uSunElev);
            vec3 c=mix(vec3(1.,.93,.8),vec3(1.,.72,.42),ng)*core*(.25+.75*dash)*(.28+.85*ng)*uRibbon;
            gl_FragColor=vec4(c,1.); }`
			})
		);
		outl.renderOrder = 6;
		scene.add(outl);
		outlMesh = outl;
	}

	// ---------- ships ----------
	const shipMat = (color) =>
		new THREE.ShaderMaterial({
			uniforms: { ...U, uColor: { value: new THREE.Color(color) } },
			vertexShader: `varying vec3 vN,vW; void main(){ vN=normalize(mat3(modelMatrix)*normal); vec4 w=modelMatrix*vec4(position,1.); vW=w.xyz; gl_Position=projectionMatrix*viewMatrix*w; }`,
			fragmentShader:
				COMMON +
				`uniform vec3 uColor; varying vec3 vN,vW;
        void main(){ vec3 n=normalize(vN); vec3 c=uColor*(ambColor(n.y)+sunColor()*max(dot(n,uSun),0.)*cloudShadow(vW));
          gl_FragColor=vec4(tone(fogged(c,vW,.0040)),1.); }`
		});
	const M_HULL = shipMat('#2a2f33'), M_DECK = shipMat('#d9d6cc'), M_BOX = [shipMat('#7a3b2e'), shipMat('#2f4f63'), shipMat('#8a7a5a')];
	const wakeMat = new THREE.ShaderMaterial({
		uniforms: U,
		side: THREE.DoubleSide,
		transparent: true,
		depthWrite: false,
		blending: THREE.AdditiveBlending,
		vertexShader: `varying vec2 vUv; varying vec3 vW; void main(){ vUv=uv; vec4 w=modelMatrix*vec4(position,1.); vW=w.xyz; gl_Position=projectionMatrix*viewMatrix*w; }`,
		fragmentShader:
			COMMON +
			`varying vec2 vUv; varying vec3 vW;
      void main(){ float x=vUv.x, y=(vUv.y-.5)*2.;
        float spread=.10+x*.85;
        float arms=exp(-pow((abs(y)-spread*.8)/(.05+x*.12),2.));
        float centre=exp(-pow(y/(.07+x*.22),2.))*(1.-x);
        float n=noise(vec2(x*34.-uTime*2.2, y*9.));
        float a=(arms*.55+centre*.9)*pow(1.-x,1.6)*(.55+.45*n);
        float day=smoothstep(-.10,.25,uSunElev);
        vec3 c=vec3(.85,.9,.92)*a*(.25+.55*day);
        float dist=length(vW-cameraPosition); c*=exp(-dist*.004);
        gl_FragColor=vec4(c,1.); }`
	});
	function makeShip(seed) {
		const carrier = new THREE.Group();
		const ship = new THREE.Group();
		const shape = new THREE.Shape();
		shape.moveTo(-1, -0.17);
		shape.lineTo(0.62, -0.17);
		shape.quadraticCurveTo(0.98, -0.12, 1.06, 0);
		shape.quadraticCurveTo(0.98, 0.12, 0.62, 0.17);
		shape.lineTo(-1, 0.17);
		shape.closePath();
		const hull = new THREE.ExtrudeGeometry(shape, { depth: 0.14, bevelEnabled: false, curveSegments: 6 });
		hull.rotateX(-Math.PI / 2);
		ship.add(new THREE.Mesh(hull, M_HULL));
		const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.17, 0.3), M_DECK);
		bridge.position.set(-0.76, 0.22, 0);
		const funnel = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.12, 0.08), M_HULL);
		funnel.position.set(-0.86, 0.36, 0);
		ship.add(bridge, funnel);
		for (let i = 0; i < 6; i++) {
			if ((seed * 7 + i * 3) % 5 === 0) continue;
			const b = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.08 + ((seed + i) % 3) * 0.025, 0.26), M_BOX[(seed + i) % 3]);
			b.position.set(-0.48 + i * 0.22, 0.18, 0);
			ship.add(b);
		}
		ship.scale.setScalar(0.55);
		ship.position.y = -0.03;
		const wake = new THREE.Mesh(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), wakeMat);
		wake.geometry.translate(0.5, 0, 0);
		wake.scale.set(-7, 1, 2.6);
		wake.position.set(-0.45, 0.02, 0);
		carrier.add(wake, ship);
		scene.add(carrier);
		return carrier;
	}
	const routeLL = (pts) => pts.map(([la, lo]) => world(la, lo).setY(0));
	const ROUTES = [
		{ pts: [A.clone().add(new THREE.Vector3(77, 0, 64)), A.clone().add(new THREE.Vector3(80, 0, 24))], speed: 0.16, t: 0.15 },
		{ pts: routeLL([[43.188, 27.965], [43.13, 28.4], [43.0, 28.65]]), speed: 0.35, t: 0.3 },
		{ pts: routeLL([[42.482, 27.56], [42.44, 27.86], [42.38, 28.3]]), speed: 0.3, t: 0.6 },
		{ pts: routeLL([[43.05, 28.25], [42.78, 28.06], [42.32, 27.97]]), speed: 0.4, t: 0.1 }
	];
	const ships = ROUTES.map((r, i) => {
		const curve = new THREE.CatmullRomCurve3(r.pts, false, 'centripetal');
		return { ...r, curve, len: curve.getLength(), dir: 1, obj: makeShip(i + 1) };
	});
	const tmp = new THREE.Vector3(), tan = new THREE.Vector3();
	function updateShips(dt) {
		for (const s of ships) {
			s.t += (s.dir * s.speed * dt) / s.len;
			if (s.t > 1) { s.t = 1; s.dir = -1; }
			if (s.t < 0) { s.t = 0; s.dir = 1; }
			s.curve.getPointAt(s.t, tmp);
			s.curve.getTangentAt(s.t, tan).multiplyScalar(s.dir);
			s.obj.position.copy(tmp);
			s.obj.rotation.y = Math.atan2(-tan.z, tan.x);
		}
	}

	// ---------- towns: warm dawn lights from real built-up areas + cartographic labels ----------
	{
		const pos = [], seed = [];
		let rnd = 7;
		const rand = () => (rnd = (rnd * 16807) % 2147483647) / 2147483647;
		if (luImg) {
			const lc = Object.assign(document.createElement('canvas'), { width: luImg.width, height: luImg.height });
			const lx = lc.getContext('2d', { willReadFrequently: true });
			lx.drawImage(luImg, 0, 0);
			const ld = lx.getImageData(0, 0, luImg.width, luImg.height).data;
			const want = mobile ? 2600 : 6500;
			for (let k = 0; k < 400000 && seed.length < want; k++) {
				const u = 0.25 + rand() * 0.75, v = rand();
				const x = Math.floor(u * (luImg.width - 1)), y = Math.floor(v * (luImg.height - 1));
				const o = (y * luImg.width + x) * 4;
				if (ld[o] < 140 || (ld[o + 2] < 100 && rand() > 0.22)) continue; // villages: sparse
				const h = heightUV(u, v);
				if (h <= 0) continue;
				pos.push((u - 0.5) * KW, h + 0.09, (v - 0.5) * KH);
				seed.push(rand());
			}
		}
		const g = new THREE.BufferGeometry();
		g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
		g.setAttribute('seed', new THREE.Float32BufferAttribute(seed, 1));
		const lights = new THREE.Points(
			g,
			new THREE.ShaderMaterial({
				uniforms: { ...U, uPx: { value: renderer.getPixelRatio() } },
				transparent: true,
				depthWrite: false,
				blending: THREE.AdditiveBlending,
				vertexShader: `attribute float seed; uniform float uTime,uPx,uSunElev; varying float vA;
          void main(){ vec4 mv=modelViewMatrix*vec4(position,1.); gl_Position=projectionMatrix*mv;
            float tw=.75+.25*sin(uTime*(1.+seed*2.)+seed*40.);
            float ng=1.-smoothstep(-.02,.16,uSunElev);
            vA=tw*(.2+ng*1.35)*(.5+seed*.5);
            gl_PointSize=clamp(mix(90.,320.,ng)/-mv.z,1.5,8.)*uPx; }`,
				fragmentShader: `varying float vA; void main(){ vec2 d=gl_PointCoord-.5; float a=exp(-dot(d,d)*18.)*vA;
          gl_FragColor=vec4(vec3(1.,.72,.42)*a,1.); }`
			})
		);
		lights.renderOrder = 4;
		scene.add(lights);
	}
	const landmarks = PLACES.map((pl) => ({ ...pl, pos: world(pl.lat, pl.lon, 0.4) }));

	// night: big soft halos over the towns + navigation lights on boats (added after boats exist)
	const haloMat = new THREE.ShaderMaterial({
		uniforms: U,
		transparent: true,
		depthWrite: false,
		blending: THREE.AdditiveBlending,
		vertexShader: `attribute float size; varying vec2 vQ; uniform float uSunElev;
      varying float vCd;
      void main(){ vQ=position.xz; vec4 w=modelMatrix*vec4(position,1.); vCd=length(w.xyz-cameraPosition); gl_Position=projectionMatrix*viewMatrix*w; }`,
		fragmentShader: `uniform float uSunElev; varying vec2 vQ;
      varying float vCd;
      void main(){ float r=length(vQ); float ng=(1.-smoothstep(-.07,.02,uSunElev))*smoothstep(8.,70.,vCd);
        float a=exp(-r*r*5.)*.32+exp(-r*r*40.)*.25; gl_FragColor=vec4(vec3(1.,.62,.3)*a*ng,1.); }`
	});
	for (const pl of PLACES.filter((p) => p.tier === 1 || p.tier === 2)) {
		const m = new THREE.Mesh(new THREE.PlaneGeometry(2, 2).rotateX(-Math.PI / 2), haloMat);
		const sc = pl.tier === 1 ? 9 : 3.2;
		m.scale.set(sc, 1, sc);
		m.position.copy(world(pl.lat, pl.lon)).setY(Math.max(0.2, world(pl.lat, pl.lon).y + 0.3));
		m.renderOrder = 4;
		scene.add(m);
	}

	// ---------- lighthouses: sweeping beams at dawn ----------
	const beamSweep = new THREE.ShaderMaterial({
		uniforms: U,
		transparent: true,
		depthWrite: false,
		side: THREE.DoubleSide,
		blending: THREE.AdditiveBlending,
		vertexShader: `varying vec2 vUv; varying vec3 vW; void main(){ vUv=uv; vec4 w=modelMatrix*vec4(position,1.); vW=w.xyz; gl_Position=projectionMatrix*viewMatrix*w; }`,
		fragmentShader:
			COMMON +
			`varying vec2 vUv; varying vec3 vW;
      void main(){ float x=vUv.x, y=(vUv.y-.5)*2.;
        float a=pow(1.-x,1.4)*exp(-y*y*(3.+x*-2.))*(.35+.65*smoothstep(0.,.04,x));
        float dawn=1.-smoothstep(-.03,.05,uSunElev);
        float dc=length(vW-cameraPosition); a*=dawn*.5*exp(-dc*.004)*smoothstep(10.,40.,dc);
        gl_FragColor=vec4(vec3(1.,.86,.62)*a,1.); }`
	});
	const lighthouses = LIGHTHOUSES.map((l, i) => {
		const g = new THREE.Group();
		const plane = new THREE.PlaneGeometry(1, 1);
		plane.translate(0.5, 0, 0);
		const a = new THREE.Mesh(plane, beamSweep), b = new THREE.Mesh(plane, beamSweep);
		a.scale.set(5, 0.5, 1);
		b.scale.set(5, 0.5, 1);
		b.rotation.x = Math.PI / 2;
		const c = a.clone(), d = b.clone();
		c.rotation.y = d.rotation.y = Math.PI;
		g.add(a, b, c, d);
		g.position.copy(world(l.lat, l.lon, 0.35));
		g.userData.phase = i * 1.7;
		scene.add(g);
		return g;
	});

	// ---------- gulls crossing the dawn frame ----------
	const gullGeo = new THREE.BufferGeometry();
	gullGeo.setAttribute(
		'position',
		new THREE.Float32BufferAttribute([-1, 0, -0.25, 0, 0, 0.18, 0, 0, -0.2, 1, 0, -0.25, 0, 0, -0.2, 0, 0, 0.18], 3)
	);
	const GULLS = 9;
	const gullMesh = new THREE.InstancedMesh(
		gullGeo,
		new THREE.ShaderMaterial({
			uniforms: U,
			side: THREE.DoubleSide,
			vertexShader: `attribute float phase; void main(){ vec3 p=position; float flap=sin(uTime*7.+phase*6.28);
          p.y+=abs(p.x)*flap*.55; p.z+=abs(p.x)*.1*flap;
          gl_Position=projectionMatrix*viewMatrix*modelMatrix*instanceMatrix*vec4(p,1.); }`.replace('void main', 'uniform float uTime; void main'),
			fragmentShader: `void main(){ gl_FragColor=vec4(vec3(.05,.05,.07),1.); }`
		}),
		GULLS
	);
	gullMesh.geometry.setAttribute('phase', new THREE.InstancedBufferAttribute(new Float32Array(GULLS).map((_, i) => (i * 0.37) % 1), 1));
	gullMesh.frustumCulled = false;
	scene.add(gullMesh);
	const gullM = new THREE.Matrix4(), gullQ = new THREE.Quaternion(), gullS = new THREE.Vector3(), gullP = new THREE.Vector3();
	let gullT = 0;
	function updateGulls(dt) {
		const on = phase === 'intro' || phase === 'turn' || phase === 'idle';
		gullMesh.visible = on;
		if (!on) return;
		gullT += dt;
		const base = POSES.intro.pos;
		const fwd = POSES.intro.tgt.clone().sub(base).setY(0).normalize();
		const right = new THREE.Vector3(-fwd.z, 0, fwd.x);
		gullQ.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.atan2(right.x, right.z));
		for (let i = 0; i < GULLS; i++) {
			const row = Math.ceil(i / 2), side = i % 2 ? 1 : -1;
			const t = gullT * 0.55 - 4.2 - row * 0.32;
			gullP.copy(base).addScaledVector(fwd, 9 + row * 0.5 + side * 0.25 * row).addScaledVector(right, t);
			gullP.y = 2.6 + Math.sin(gullT * 0.7 + i) * 0.08 - row * 0.05 + side * 0.04 * row;
			gullS.setScalar(0.085 * (0.85 + ((i * 0.37) % 0.3)));
			gullM.compose(gullP, gullQ, gullS);
			gullMesh.setMatrixAt(i, gullM);
		}
		gullMesh.instanceMatrix.needsUpdate = true;
	}

	// ---------- life on the water: yachts circling off the resorts, gull flocks ----------
	const M_WHITE = shipMat('#eceae4'), M_SAIL = shipMat('#f6f3ea');
	const sailGeo = new THREE.BufferGeometry();
	sailGeo.setAttribute('position', new THREE.Float32BufferAttribute([0.15, 0.05, 0, 0.15, 0.95, 0, -0.42, 0.05, 0, 0.18, 0.05, 0, 0.18, 0.7, 0, 0.5, 0.05, 0], 3));
	sailGeo.computeVertexNormals();
	const hullGeo = new THREE.BoxGeometry(1, 0.12, 0.28);
	const yachts = [];
	{
		let rnd = 11;
		const rand = () => (rnd = (rnd * 16807) % 2147483647) / 2147483647;
		for (const pl of PLACES.filter((p) => p.tier === 1 || p.tier === 2)) {
			const c = world(pl.lat, pl.lon);
			let x = c.x, z = c.z, steps = 0;
			while (!waterAt(x, z) && steps++ < 60) x += 0.25;
			if (steps >= 60) continue;
			x += 2.2;
			for (let n = 0; n < 2; n++) {
				let rx = 1.4 + rand() * 1.6, rz = 0.9 + rand() * 1.2;
				const cx = x + rand() * 1.5, cz = z + (rand() - 0.5) * 3;
				let ok = false;
				for (let tries = 0; tries < 4 && !ok; tries++) {
					ok = true;
					for (let k = 0; k < 16; k++) {
						const a = (k / 16) * Math.PI * 2;
						if (!waterAt(cx + Math.cos(a) * rx, cz + Math.sin(a) * rz)) ok = false;
					}
					if (!ok) { rx *= 0.6; rz *= 0.6; }
				}
				if (!ok) continue;
				const g = new THREE.Group();
				const boat = new THREE.Group();
				const hull = new THREE.Mesh(hullGeo, M_WHITE);
				hull.position.y = 0.03;
				const sail = new THREE.Mesh(sailGeo, M_SAIL);
				sail.material.side = THREE.DoubleSide;
				boat.add(hull, sail);
				boat.scale.setScalar(0.32);
				const wake = new THREE.Mesh(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), wakeMat);
				wake.geometry.translate(0.5, 0, 0);
				wake.scale.set(-1.8, 1, 0.6);
				wake.position.set(-0.12, 0.02, 0);
				g.add(wake, boat);
				scene.add(g);
				yachts.push({ g, cx, cz, rx, rz, a: rand() * 6.28, w: (0.05 + rand() * 0.06) * (rand() < 0.5 ? -1 : 1), heel: rand() });
			}
		}
	}
	const FLOCKS = mobile ? 4 : 8, PER = 7;
	const flockGeo = gullGeo.clone();
	flockGeo.setAttribute('phase', new THREE.InstancedBufferAttribute(new Float32Array(FLOCKS * PER).map((_, i) => (i * 0.29) % 1), 1));
	const flockMesh = new THREE.InstancedMesh(flockGeo, gullMesh.material, FLOCKS * PER);
	flockMesh.frustumCulled = false;
	scene.add(flockMesh);
	const flocks = yachts.filter((_, i) => i % 3 === 0).slice(0, FLOCKS).map((y, i) => ({ cx: y.cx - 0.8, cz: y.cz, r: 2.5 + (i % 3), h: 0.7 + (i % 4) * 0.2, a: i * 1.7, w: 0.12 + (i % 3) * 0.03 }));
	const navGeo = new THREE.BufferGeometry();
	const navPos = new Float32Array((yachts.length + 8) * 3);
	navGeo.setAttribute('position', new THREE.BufferAttribute(navPos, 3));
	const navPts = new THREE.Points(
		navGeo,
		new THREE.ShaderMaterial({
			uniforms: { ...U, uPx: { value: renderer.getPixelRatio() } },
			transparent: true,
			depthWrite: false,
			blending: THREE.AdditiveBlending,
			vertexShader: `uniform float uSunElev,uPx,uTime; varying float vA;
        void main(){ vec4 mv=modelViewMatrix*vec4(position,1.); gl_Position=projectionMatrix*mv;
          vA=(1.-smoothstep(-.04,.1,uSunElev))*(.75+.25*sin(uTime*3.+position.x));
          gl_PointSize=clamp(260./-mv.z,2.,7.)*uPx; }`,
			fragmentShader: `varying float vA; void main(){ vec2 d=gl_PointCoord-.5; float a=exp(-dot(d,d)*16.)*vA; gl_FragColor=vec4(vec3(1.,.95,.85)*a*1.3,1.); }`
		})
	);
	navPts.frustumCulled = false;
	scene.add(navPts);
	function updateSea(dt) {
		let ni = 0;
		for (const y of yachts) { const q = y.g.position; navPos.set([q.x, 0.25, q.z], ni++ * 3); }
		for (const sh of ships) { const q = sh.obj.position; navPos.set([q.x, 0.45, q.z], ni++ * 3); }
		navGeo.setDrawRange(0, ni);
		navGeo.attributes.position.needsUpdate = true;
		for (const y of yachts) {
			y.a += y.w * dt;
			const x = y.cx + Math.cos(y.a) * y.rx, z = y.cz + Math.sin(y.a) * y.rz;
			const tx = -Math.sin(y.a) * y.rx * Math.sign(y.w), tz = Math.cos(y.a) * y.rz * Math.sign(y.w);
			y.g.position.set(x, 0, z);
			y.g.rotation.y = Math.atan2(-tz, tx);
			y.g.children[1].rotation.x = 0.12 * Math.sin(U.uTime.value * 0.8 + y.heel * 6) + 0.1 * Math.sign(y.w);
		}
		flockMesh.visible = phase !== 'intro' && phase !== 'idle';
		if (!flockMesh.visible) return;
		let n = 0;
		for (const f of flocks) {
			f.a += f.w * dt;
			const fx = f.cx + Math.cos(f.a) * f.r, fz = f.cz + Math.sin(f.a) * f.r * 0.7;
			const hx = -Math.sin(f.a), hz = Math.cos(f.a) * 0.7, hl = Math.hypot(hx, hz);
			const dirx = hx / hl, dirz = hz / hl;
			gullQ.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.atan2(-dirz, dirx) - Math.PI / 2);
			for (let k = 0; k < PER; k++) {
				const row = Math.ceil(k / 2), sd = k % 2 ? 1 : -1;
				gullP.set(fx - dirx * row * 0.22 + -dirz * sd * row * 0.2, f.h + Math.sin(U.uTime.value * 0.9 + k + f.a) * 0.03, fz - dirz * row * 0.22 + dirx * sd * row * 0.2);
				gullS.setScalar(0.07);
				gullM.compose(gullP, gullQ, gullS);
				flockMesh.setMatrixAt(n++, gullM);
			}
		}
		flockMesh.instanceMatrix.needsUpdate = true;
	}

	// ---------- architectural-model layer: OSM buildings as white blocks, trees as felt balls ----------
	const NEAR0 = mobile ? 14 : 24, NEAR1 = mobile ? 30 : 60; // grow in as the camera comes close
	const modelMat = (kind) =>
		new THREE.ShaderMaterial({
			uniforms: { ...U, uNear: { value: new THREE.Vector2(NEAR0, NEAR1) } },
			defines: { [kind]: 1 },
			vertexShader: `uniform vec2 uNear; varying vec3 vW, vN, vC; varying float vY, vH;
        void main(){
          vec3 ctr=(modelMatrix*instanceMatrix*vec4(0.,0.,0.,1.)).xyz;
          float grow=1.-smoothstep(uNear.x,uNear.y,length(ctr-cameraPosition));
          vec3 p=position;
          #ifdef BLDG
            p.y*=grow;
          #else
            p*=grow;
          #endif
          vec4 w=modelMatrix*instanceMatrix*vec4(p,1.); vW=w.xyz;
          vN=normalize(mat3(modelMatrix)*mat3(instanceMatrix)*normal);
          vY=position.y; vH=length(instanceMatrix[1].xyz)*grow;
          #ifdef USE_INSTANCING_COLOR
            vC=instanceColor;
          #else
            vC=vec3(1.);
          #endif
          gl_Position=projectionMatrix*viewMatrix*w; }`,
			fragmentShader:
				COMMON +
				`varying vec3 vW, vN, vC; varying float vY, vH;
        void main(){
          vec3 n=normalize(vN); float day=smoothstep(-.10,.25,uSunElev); float ng=1.-smoothstep(-.07,.03,uSunElev);
          float lit=max(dot(n,uSun),0.)*cloudShadow(vW);
          #ifdef BLDG
            vec3 base=vec3(.82,.80,.76)*mix(.9,1.04,step(.5,n.y));
            float ao=mix(.5,1.,smoothstep(0.,.45,vY));
            vec3 c=base*(ambColor(n.y)*1.6+sunColor()*lit*1.1)*ao;
            // windows: warm grid on the walls at night
            float mH=vY*vH*1000./1.25;
            float along=(abs(n.x)>abs(n.z)?vW.z:vW.x)*1000.;
            vec2 cell=vec2(floor(along/4.),floor(mH/3.));
            vec2 f=vec2(fract(along/4.),fract(mH/3.));
            float win=step(.25,f.x)*step(f.x,.75)*step(.3,f.y)*step(f.y,.75)*step(.5,1.-abs(n.y))*step(1.5,mH);
            float on=step(.55,hash(cell+floor(vW.xz*37.)));
            float wall=step(.5,1.-abs(n.y))*step(1.5,mH);
            float fw=fwidth(along/4.)+fwidth(mH/3.);
            float lights=mix(win*on, .28*wall, smoothstep(.25,.9,fw));
            c+=vec3(1.,.72,.4)*(lights*1.8+step(.5,n.y)*.10)*ng;
            c=mix(c,c*.6+vec3(.02,.025,.04),ng*.3);
          #else
            vec3 base=vC*(.75+.25*n.y);
            vec3 c=base*(ambColor(n.y)*1.5+sunColor()*lit*.95);
          #endif
          gl_FragColor=vec4(tone(fogged(c,vW,.0029)),1.);
        }`
		});
	if (M.buildings) {
		fetch('/geo/buildings.bin' + ver)
			.then((r) => r.arrayBuffer())
			.then((buf) => {
				const dv = new DataView(buf), n = Math.floor(buf.byteLength / 8);
				const box = new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0);
				const mesh = new THREE.InstancedMesh(box, modelMat('BLDG'), n);
				const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new THREE.Vector3(), ps = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0);
				const HB = 1.25 / 1000; // building heights: metres -> world, exaggerated like a model
				for (let i = 0; i < n; i++) {
					const o = i * 8;
					const u = dv.getUint16(o, true) / 65535, v = dv.getUint16(o + 2, true) / 65535;
					const w = dv.getUint8(o + 4) / 1000, d = dv.getUint8(o + 5) / 1000;
					const ang = (dv.getUint8(o + 6) / 255) * Math.PI, h = Math.max(4, dv.getUint8(o + 7));
					ps.set((u - 0.5) * KW, heightLin(u, v) + 0.045, (v - 0.5) * KH);
					q.setFromAxisAngle(up, ang);
					sc.set(w, h * HB + 0.006, d);
					mesh.setMatrixAt(i, m4.compose(ps, q, sc));
				}
				mesh.frustumCulled = false;
				scene.add(mesh);
			})
			.catch(() => {});
	}
	if (luImg) {
		const lc = Object.assign(document.createElement('canvas'), { width: luImg.width, height: luImg.height });
		const lx = lc.getContext('2d', { willReadFrequently: true });
		lx.drawImage(luImg, 0, 0);
		const ld = lx.getImageData(0, 0, luImg.width, luImg.height).data;
		const luAt = (u, v) => ld[(Math.round(v * (luImg.height - 1)) * luImg.width + Math.round(u * (luImg.width - 1))) * 4];
		const isLand = (u, v) => px[(Math.round(v * (img.height - 1)) * img.width + Math.round(u * (img.width - 1))) * 4 + 2] > 170;
		const WANT = mobile ? 9000 : 42000;
		let rnd = 5;
		const rand = () => (rnd = (rnd * 16807) % 2147483647) / 2147483647;
		const pts = [];
		for (let k = 0; k < 1500000 && pts.length < WANT * 5; k++) {
			const u = 0.3 + rand() * 0.7, v = rand();
			if (!isLand(u, v) || luAt(u, v) > 40) continue;
			const x = (u - 0.5) * KW, z = (v - 0.5) * KH;
			if (!(waterAt(x + 3, z) || waterAt(x + 6, z) || waterAt(x - 3, z) || waterAt(x, z + 4) || waterAt(x, z - 4))) continue; // coastal belt
			const n1 = Math.sin(x * 1.7 + Math.sin(z * 1.3)) + Math.sin(z * 2.3 + x * 0.6);
			if (n1 < 0.2) continue;
			const cnt = 4 + Math.floor(rand() * 9);
			for (let c = 0; c < cnt; c++) {
				const tx = x + (rand() - 0.5) * 0.14, tz = z + (rand() - 0.5) * 0.14;
				const tu = tx / KW + 0.5, tv = tz / KH + 0.5;
				if (!isLand(tu, tv) || luAt(tu, tv) > 60) continue;
				pts.push(tx, heightLin(tu, tv) + 0.05, tz, 0.008 + rand() * 0.008, rand());
			}
		}
		const n = pts.length / 5;
		const crown = new THREE.IcosahedronGeometry(1, 0);
		const trees = new THREE.InstancedMesh(crown, modelMat('TREE'), n);
		const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new THREE.Vector3(), ps = new THREE.Vector3(), col = new THREE.Color();
		for (let i = 0; i < n; i++) {
			const r = pts[i * 5 + 3], hue = pts[i * 5 + 4];
			ps.set(pts[i * 5], pts[i * 5 + 1] + r * 1.4, pts[i * 5 + 2]);
			sc.set(r, r * 1.7, r);
			trees.setMatrixAt(i, m4.compose(ps, q, sc));
			trees.setColorAt(i, col.setRGB(0.12 + hue * 0.08, 0.2 + hue * 0.08, 0.09 + hue * 0.03));
		}
		trees.frustumCulled = false;
		scene.add(trees);
	}

	// ---------- property markers ----------
	const beamMat = new THREE.ShaderMaterial({
		uniforms: U,
		transparent: true,
		depthWrite: false,
		blending: THREE.AdditiveBlending,
		vertexShader: `varying float vY; void main(){ vY=uv.y; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
		fragmentShader: `varying float vY; uniform float uTime; void main(){ float a=pow(1.-vY,2.6)*(.55+.15*sin(uTime*2.)); gl_FragColor=vec4(vec3(1.,.78,.48)*a,1.); }`
	});
	// plot glow on the ground: soft pool of light, a crisp ring and a slowly turning dashed ring
	const plotMat = new THREE.ShaderMaterial({
		uniforms: { ...U, uHi: { value: 0 } },
		transparent: true,
		depthWrite: false,
		depthTest: false,
		blending: THREE.AdditiveBlending,
		vertexShader: `varying vec2 vQ; void main(){ vQ=uv*2.-1.; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
		fragmentShader: `uniform float uTime, uHi, uSunElev; varying vec2 vQ;
      void main(){ float r=length(vQ); if(r>1.) discard; float a=atan(vQ.y,vQ.x);
        float pool=exp(-r*r*7.)*.35;
        float ring=exp(-pow((r-.42)/.025,2.))*.9;
        float dash=step(.5,fract(a*6./3.14159+uTime*.25))*exp(-pow((r-.78)/.018,2.))*.7;
        float pulse=exp(-pow((r-fract(uTime*.35))/.05,2.))*(1.-r)*.6;
        float ng=.75+.25*(1.-smoothstep(-.05,.2,uSunElev));
        vec3 c=vec3(1.,.76,.44)*(pool+ring+dash+pulse)*(.65+.6*uHi)*ng;
        gl_FragColor=vec4(c,1.); }`
	});
	// light motes rising through the beam
	const SPK = 26;
	const sparkGeo = new THREE.BufferGeometry();
	sparkGeo.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(SPK * 3), 3));
	sparkGeo.setAttribute('seed', new THREE.Float32BufferAttribute(Float32Array.from({ length: SPK }, (_, i) => (i * 0.618) % 1), 1));
	const sparkMat = new THREE.ShaderMaterial({
		uniforms: { ...U, uPx: { value: 1 }, uH: { value: 1 }, uR: { value: 0.1 }, uHi: { value: 0 } },
		transparent: true,
		depthWrite: false,
		blending: THREE.AdditiveBlending,
		vertexShader: `attribute float seed; uniform float uTime, uPx, uH, uR, uHi; varying float vA;
      void main(){ float k=fract(uTime*(.08+seed*.07)+seed); float an=seed*40.+uTime*(.4+seed);
        vec3 p=vec3(cos(an)*uR*(.3+seed), k*uH, sin(an)*uR*(.3+seed));
        vec4 mv=modelViewMatrix*vec4(p,1.); gl_Position=projectionMatrix*mv;
        vA=sin(k*3.14159)*(.5+.5*uHi); gl_PointSize=clamp(40./-mv.z,1.,3.5)*uPx; }`,
		fragmentShader: `varying float vA; void main(){ vec2 d=gl_PointCoord-.5; float a=exp(-dot(d,d)*14.)*vA; gl_FragColor=vec4(vec3(1.,.82,.55)*a,1.); }`
	});
	const marks = properties.map((p) => {
		const pos = world(p.lat, p.lon);
		const coast = world(p.sea.point[0], p.sea.point[1]).setY(0);
		const toSea = new THREE.Vector3(coast.x - pos.x, 0, coast.z - pos.z);
		if (toSea.lengthSq() < 1e-8) toSea.set(1, 0, 0);
		toSea.normalize();
		const beam = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 4, 8, 1, true), beamMat);
		beam.position.copy(pos).add(new THREE.Vector3(0, 2, 0));
		const ring = new THREE.Mesh(new THREE.PlaneGeometry(2, 2).rotateX(-Math.PI / 2), plotMat.clone());
		ring.material.uniforms = { ...U, uHi: { value: 0 } };
		ring.position.copy(pos).add(new THREE.Vector3(0, 0.05, 0));
		ring.renderOrder = 7;
		const sparks = new THREE.Points(sparkGeo, sparkMat.clone());
		sparks.material.uniforms = { ...U, uPx: { value: renderer.getPixelRatio() }, uH: { value: 1 }, uR: { value: 0.1 }, uHi: { value: 0 } };
		sparks.position.copy(pos);
		sparks.frustumCulled = false;
		scene.add(beam, ring, sparks);
		return { slug: p.slug, p, pos, coast, toSea, beam, ring, sparks };
	});

	const tapeGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
	const tape = new THREE.Line(tapeGeo, new THREE.LineDashedMaterial({ color: 0xffc77a, dashSize: 0.03, gapSize: 0.025, transparent: true, opacity: 0, depthTest: false }));
	tape.renderOrder = 7;
	scene.add(tape);

	// ---------- camera choreography ----------
	const POSES = {
		over: mobile
			? { pos: new THREE.Vector3(250, 360, -330), tgt: new THREE.Vector3(10, -20, 40) }
			: { pos: new THREE.Vector3(215, 150, -205), tgt: new THREE.Vector3(35, -15, 22) },
		intro: { pos: world(42.7, 27.95).setY(2.2), tgt: world(42.98, 27.99).setY(0.8) }
	};
	const objectPose = (m) => {
		const side = new THREE.Vector3(-m.toSea.z, 0, m.toSea.x);
		return {
			pos: m.pos.clone().addScaledVector(m.toSea, mobile ? 11 : 7.5).addScaledVector(side, mobile ? 2 : 3.2).add(new THREE.Vector3(0, mobile ? 7.5 : 4.6, 0)),
			tgt: m.pos.clone().addScaledVector(side, mobile ? 0 : -1.6).addScaledVector(m.toSea, mobile ? 2.5 : 0).add(new THREE.Vector3(0, mobile ? -1.5 : 0.2, 0)),
			via: m.coast.clone().addScaledVector(m.toSea, 9).add(new THREE.Vector3(24, 18, -8))
		};
	};
	let pose = reduce ? POSES.over : POSES.intro;
	camera.position.copy(pose.pos);
	target.copy(pose.tgt);
	let tween = null, current = null, phase = 'idle';
	const setPhase = (p) => {
		phase = p;
		if (p === 'over') ctrlFrom(camera.position, target);
		onPhase?.(p);
	};

	function camTo({ pos, tgt }, dur, via) {
		tween?.kill();
		const p0 = camera.position.clone(), t0 = target.clone();
		const mid = via || pos.clone().lerp(p0, 0.5).add(new THREE.Vector3(0, Math.min(18, p0.distanceTo(pos) * 0.15), 0));
		const curve = new THREE.CatmullRomCurve3([p0, mid, pos], false, 'centripetal');
		const s = { k: 0 };
		const ease = gsap.parseEase('power3.inOut');
		return new Promise((resolve) => {
			if (reduce || dur === 0) {
				camera.position.copy(pos);
				target.copy(tgt);
				return resolve();
			}
			tween = gsap.to(s, {
				k: 1,
				duration: dur,
				ease: 'power2.inOut',
				onUpdate() {
					camera.position.copy(curve.getPoint(s.k));
					target.copy(t0).lerp(tgt, ease(s.k));
				},
				onComplete: resolve
			});
		});
	}
	const sunTo = (v, dur) => gsap.to(U.uSunElev, { value: v, duration: reduce ? 0 : dur, ease: 'sine.inOut', onUpdate: setSun });

	function hideTape() {
		gsap.to(tape.material, { opacity: 0, duration: 0.3 });
	}

	// ---------- free map camera (home only) ----------
	const ctrl = { tgt: new THREE.Vector3(), dist: 1, az: 0, pol: 1, touched: false };
	const cur = { tgt: new THREE.Vector3(), dist: 1, az: 0, pol: 1 };
	const LIM = { dMin: 10, dMax: 560, pMin: 0.08, pMax: 1.4, x: KW * 0.46, z: KH * 0.46 };
	function ctrlFrom(pos, tgt) {
		const o = pos.clone().sub(tgt), d = o.length();
		ctrl.tgt.copy(tgt).setY(0);
		ctrl.dist = d;
		ctrl.pol = Math.acos(Math.min(1, o.y / d));
		ctrl.az = Math.atan2(o.x, o.z);
		Object.assign(cur, { dist: ctrl.dist, az: ctrl.az, pol: ctrl.pol });
		cur.tgt.copy(ctrl.tgt);
	}
	function clampCtrl() {
		ctrl.dist = Math.min(LIM.dMax, Math.max(LIM.dMin, ctrl.dist));
		ctrl.pol = Math.min(LIM.pMax, Math.max(LIM.pMin, ctrl.pol));
		ctrl.tgt.x = Math.min(LIM.x, Math.max(-LIM.x, ctrl.tgt.x));
		ctrl.tgt.z = Math.min(LIM.z, Math.max(-LIM.z, ctrl.tgt.z));
	}
	function applyCtrl(dt, rate = 9) {
		const k = 1 - Math.exp(-dt * rate);
		cur.tgt.lerp(ctrl.tgt, k);
		cur.dist += (ctrl.dist - cur.dist) * k;
		cur.az += (ctrl.az - cur.az) * k;
		cur.pol += (ctrl.pol - cur.pol) * k;
		target.copy(cur.tgt);
		const sp = Math.sin(cur.pol);
		camera.position.set(cur.tgt.x + cur.dist * sp * Math.sin(cur.az), cur.tgt.y + cur.dist * Math.cos(cur.pol), cur.tgt.z + cur.dist * sp * Math.cos(cur.az));
		const gh = Math.max(0, heightUV(camera.position.x / KW + 0.5, camera.position.z / KH + 0.5));
		if (camera.position.y < gh + 1.5) camera.position.y = gh + 1.5;
	}
	const touch = () => {
		if (!ctrl.touched) {
			ctrl.touched = true;
			onInteract?.();
		}
	};
	function pan(dx, dy) {
		const s = (0.00085 * ctrl.dist * 900) / innerHeight;
		const right = new THREE.Vector3(Math.cos(ctrl.az), 0, -Math.sin(ctrl.az));
		const fwd = new THREE.Vector3(-Math.sin(ctrl.az), 0, -Math.cos(ctrl.az));
		ctrl.tgt.addScaledVector(right, -dx * s).addScaledVector(fwd, dy * s / Math.max(0.35, Math.cos(ctrl.pol)));
		clampCtrl();
		touch();
	}
	const ptrs = new Map();
	let gesture = null;
	const canUse = () => phase === 'over' && controlsOn;
	canvas.style.touchAction = 'pan-y';
	function onDown(e) {
		if (!canUse()) return;
		if (e.pointerType === 'touch') {
			ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
			if (ptrs.size < 2) return; // one finger scrolls the page; two fingers drive the map
			for (const id of ptrs.keys()) canvas.setPointerCapture?.(id);
			gesture = 'pan';
			return;
		}
		canvas.setPointerCapture(e.pointerId);
		ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
		gesture = e.button === 2 || e.shiftKey || e.ctrlKey ? 'rotate' : 'pan';
		canvas.style.cursor = 'grabbing';
	}
	function onMoveP(e) {
		if (!ptrs.has(e.pointerId) || !canUse()) return;
		const prev = ptrs.get(e.pointerId);
		const dx = e.clientX - prev.x, dy = e.clientY - prev.y;
		if (ptrs.size === 1) {
			if (e.pointerType === 'touch') return;
			if (gesture === 'rotate') {
				ctrl.az -= dx * 0.005;
				ctrl.pol = ctrl.pol - dy * 0.004;
				clampCtrl();
				touch();
			} else pan(dx, dy);
		} else if (ptrs.size === 2) {
			const [a, b] = [...ptrs.values()];
			const other = a === prev ? b : a;
			const d0 = Math.hypot(prev.x - other.x, prev.y - other.y);
			const d1 = Math.hypot(e.clientX - other.x, e.clientY - other.y);
			const a0 = Math.atan2(prev.y - other.y, prev.x - other.x), a1 = Math.atan2(e.clientY - other.y, e.clientX - other.x);
			if (d0 > 0 && d1 > 0) ctrl.dist *= d0 / d1;
			ctrl.az += a1 - a0;
			pan(dx / 2, dy / 2);
		}
		prev.x = e.clientX;
		prev.y = e.clientY;
	}
	function onUp(e) {
		ptrs.delete(e.pointerId);
		if (!ptrs.size) canvas.style.cursor = canUse() ? 'grab' : '';
	}
	function onWheel(e) {
		if (!canUse() || !(e.ctrlKey || e.metaKey || ctrl.touched)) return; // story mode: plain wheel scrolls the day
		e.preventDefault();
		ctrl.dist *= Math.exp(Math.max(-60, Math.min(60, e.deltaY)) * 0.0022);
		clampCtrl();
		touch();
	}
	function onKey(e) {
		if (!canUse() || e.target.closest?.('input,textarea')) return;
		const step = 40;
		const map = { ArrowLeft: [step, 0], ArrowRight: [-step, 0], ArrowUp: [0, step], ArrowDown: [0, -step] };
		if (map[e.key]) {
			pan(...map[e.key]);
			e.preventDefault();
		} else if (e.key === '+' || e.key === '=') {
			ctrl.dist *= 0.8;
			clampCtrl();
			touch();
		} else if (e.key === '-') {
			ctrl.dist *= 1.25;
			clampCtrl();
			touch();
		}
	}
	let controlsOn = true;
	canvas.addEventListener('pointerdown', onDown);
	canvas.addEventListener('pointermove', onMoveP);
	canvas.addEventListener('pointerup', onUp);
	canvas.addEventListener('pointercancel', onUp);
	canvas.addEventListener('wheel', onWheel, { passive: false });
	canvas.addEventListener('contextmenu', (e) => e.preventDefault());
	addEventListener('keydown', onKey);

	// ---------- time of day driven by the home scroll story ----------
	const DAY_KEYS = [
		[0, SUN_HOME, SUN_AZ0],
		[0.34, 0.95, Math.PI / 2],
		[0.68, 0.035, Math.PI - 0.35],
		[1, -0.2, Math.PI - 0.15]
	];
	let dayP = 0;
	const STORY = [
		[0, POSES.over],
		[0.34, mobile
			? { pos: world(42.95, 28.3).setY(60), tgt: world(43.3, 27.95).setY(0) }
			: { pos: world(43.1, 28.22).setY(26), tgt: world(43.3, 27.97).setY(0) }],
		[0.68, mobile
			? { pos: world(42.82, 28.35).setY(30), tgt: world(42.55, 27.6).setY(0) }
			: { pos: world(42.8, 28.22).setY(13), tgt: world(42.56, 27.6).setY(0) }],
		[1, mobile
			? { pos: world(43.1, 28.3).setY(12), tgt: world(43.22, 27.93).setY(2) }
			: { pos: world(43.15, 28.24).setY(6.5), tgt: world(43.215, 27.93).setY(1.6) }]
	];
	const _sp = new THREE.Vector3(), _st = new THREE.Vector3();
	let storyShift = 0;
	const SHIFT = [[0, 0.12], [0.34, 1], [0.68, 1], [1, 0.55]];
	const shiftAt = (p) => {
		for (let i = 1; i < SHIFT.length; i++) if (p <= SHIFT[i][0]) {
			const k = (p - SHIFT[i - 1][0]) / (SHIFT[i][0] - SHIFT[i - 1][0]);
			return SHIFT[i - 1][1] + (SHIFT[i][1] - SHIFT[i - 1][1]) * k * k * (3 - 2 * k);
		}
		return SHIFT.at(-1)[1];
	};
	function storyPose(p) {
		for (let i = 1; i < STORY.length; i++) {
			const [p0, a] = STORY[i - 1], [p1, b] = STORY[i];
			if (p <= p1) {
				let k = (p - p0) / (p1 - p0);
				k = k * k * (3 - 2 * k);
				_sp.lerpVectors(a.pos, b.pos, k);
				_st.lerpVectors(a.tgt, b.tgt, k);
				return;
			}
		}
	}
	function ctrlAim(pos, tgt) {
		const o = pos.clone().sub(tgt), d = o.length();
		ctrl.tgt.copy(tgt);
		ctrl.dist = d;
		ctrl.pol = Math.acos(Math.min(1, o.y / d));
		let az = Math.atan2(o.x, o.z);
		while (az - cur.az > Math.PI) az -= Math.PI * 2;
		while (az - cur.az < -Math.PI) az += Math.PI * 2;
		ctrl.az = az;
	}
	function dayAt(p) {
		for (let i = 1; i < DAY_KEYS.length; i++) {
			const [p0, e0, a0] = DAY_KEYS[i - 1], [p1, e1, a1] = DAY_KEYS[i];
			if (p <= p1) {
				let k = (p - p0) / (p1 - p0);
				k = k * k * (3 - 2 * k);
				return [e0 + (e1 - e0) * k, a0 + (a1 - a0) * k];
			}
		}
		return DAY_KEYS.at(-1).slice(1);
	}

	const api = {
		zoom(f) {
			if (phase !== 'over') return;
			ctrl.dist *= f;
			clampCtrl();
			touch();
		},
		setDay(p) {
			dayP = Math.min(1, Math.max(0, p));
		},
		_dbg: import.meta.env.DEV ? { camera, target, ctrl, cur, POSES, ctrlFrom, U, renderer, get outl() { return outlMesh; } } : null,
		phase: () => phase,
		/** Dawn intro. Resolves when the overview is reached. */
		async intro({ skip = false } = {}) {
			if (reduce || skip) {
				sunTo(SUN_HOME, skip ? 1.2 : 0);
				gsap.to(U.uRibbon, { value: 1, duration: skip ? 1.2 : 0 });
				camera.position.copy(POSES.over.pos);
				target.copy(POSES.over.tgt);
				setPhase('over');
				return;
			}
			setPhase('intro');
			sunTo(SUN_HOME, 4.6).delay(0.4);
			await new Promise((r) => setTimeout(r, 3100));
			if (phase !== 'intro') return;
			setPhase('turn');
			gsap.fromTo(U.uRibbon, { value: 0 }, { value: 1, duration: 4.2, delay: 0.6, ease: 'power1.inOut' });
			await camTo(POSES.over, 3.8, A.clone().add(new THREE.Vector3(98, 18, -26)));
			if (phase === 'turn') setPhase('over');
		},
		skipIntro() {
			if (phase !== 'intro' && phase !== 'turn') return;
			tween?.kill();
			gsap.killTweensOf(U.uSunElev);
			sunTo(SUN_HOME, 0.6);
			gsap.to(U.uRibbon, { value: 1, duration: 0.6 });
			setPhase('flying');
			camTo(POSES.over, 1.4).then(() => setPhase('over'));
		},
		async overview({ instant = false } = {}) {
			hideTape();
			gsap.to(U.uFocusAmt, { value: 0, duration: 1.6 });
			gsap.to(U.uRibbon, { value: 1, duration: 0.8 });
			const via = current ? current.coast.clone().addScaledVector(current.toSea, 18).add(new THREE.Vector3(0, 14, 0)) : undefined;
			current = null;
			setPhase('flying');
			sunTo(SUN_HOME, instant ? 0 : 2.4);
			await camTo(POSES.over, instant ? 0 : 2.8, via);
			if (!current) setPhase('over');
		},
		async focus(slug, { instant = false } = {}) {
			const m = marks.find((x) => x.slug === slug);
			if (!m) return;
			hideTape();
			current = m;
			setPhase('flying');
			U.uFocus.value.copy(m.pos);
			gsap.to(U.uFocusAmt, { value: 1, duration: 2.6, ease: 'power2.inOut' });
			gsap.to(U.uRibbon, { value: 1, duration: 0.8 });
			sunTo(m.p.mood, instant ? 0 : 3.2);
			const op = objectPose(m);
			await camTo(op, instant ? 0 : 3.4, op.via);
			if (current !== m) return;
			tapeGeo.setFromPoints([m.pos.clone().add(new THREE.Vector3(0, 0.06, 0)), m.coast.clone().add(new THREE.Vector3(0, 0.06, 0))]);
			tape.computeLineDistances();
			gsap.to(tape.material, { opacity: 1, duration: 0.6 });
			setPhase('object');
		},
		setPointer(x, y) { pointer.x = x; pointer.y = y; },
		orbit(dAz, dPol) {
			if (phase !== 'over') return;
			ctrl.az += dAz;
			ctrl.pol += dPol;
			clampCtrl();
			touch();
		},
		flyToPlace(lat, lon) {
			if (phase !== 'over') return;
			ctrl.tgt.copy(world(lat, lon)).setY(0);
			ctrl.dist = Math.min(ctrl.dist, 42);
			ctrl.pol = Math.min(ctrl.pol, 0.95);
			clampCtrl();
			touch();
		},
		setControls(v) {
			controlsOn = v;
			canvas.style.cursor = v && phase === 'over' ? 'grab' : '';
		},
		async resetView() {
			ctrl.touched = false; // the story camera glides back to the pose for the current time of day
		},
		setPaused(v) { paused = v; },
		destroy() {
			gsap.ticker.remove(tick);
			removeEventListener('resize', resize);
			removeEventListener('keydown', onKey);
			tween?.kill();
			renderer.dispose();
			scene.traverse((o) => { o.geometry?.dispose?.(); o.material?.dispose?.(); });
			tex.dispose();
		}
	};

	// ---------- frame loop ----------
	const pointer = { x: 0, y: 0 };
	const rayc = new THREE.Raycaster(), ndc2 = new THREE.Vector2(), hitP = new THREE.Vector3(), seaPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
	let ripI = 0, ripLast = -9, lastHit = new THREE.Vector3(1e9, 0, 0), pmx = 0, pmy = 0;
	// soft light that follows the cursor over the map (like a lamp held over a model)
	const curTgt = new THREE.Vector4(0, 0, 1, 0);
	function updateRipples(dt) {
		const C = U.uCursor.value;
		const active = !mobile && (phase === 'over' || phase === 'object');
		if (active) {
			ndc2.set(pointer.x * 2, -pointer.y * 2);
			rayc.setFromCamera(ndc2, camera);
			if (rayc.ray.intersectPlane(seaPlane, hitP) && Math.abs(hitP.x) < KW / 2 && Math.abs(hitP.z) < KH / 2) {
				const moved = pointer.x !== pmx || pointer.y !== pmy;
				pmx = pointer.x;
				pmy = pointer.y;
				curTgt.set(hitP.x, hitP.z, camera.position.distanceTo(hitP) * 0.045, moved ? 1 : Math.max(0.55, curTgt.w - dt * 0.15));
			} else curTgt.w = 0;
		} else curTgt.w = 0;
		const k = 1 - Math.exp(-dt * 10);
		C.x += (curTgt.x - C.x) * k;
		C.y += (curTgt.y - C.y) * k;
		C.z += (curTgt.z - C.z) * k;
		C.w += (curTgt.w - C.w) * (1 - Math.exp(-dt * 3));
	}

	// flyby flock: a skein of gulls crossing the frame now and then in story mode
	const FB = 13;
	const fbGeo = gullGeo.clone();
	fbGeo.setAttribute('phase', new THREE.InstancedBufferAttribute(new Float32Array(FB).map((_, i) => (i * 0.41) % 1), 1));
	const fbMesh = new THREE.InstancedMesh(fbGeo, gullMesh.material, FB);
	fbMesh.frustumCulled = false;
	fbMesh.visible = false;
	scene.add(fbMesh);
	const fb = { t: -1, next: 6, o: new THREE.Vector3(), r: new THREE.Vector3(), f: new THREE.Vector3(), d: 1, dir: 1 };
	function updateFlyby(dt) {
		if (reduce || phase !== 'over') { fbMesh.visible = false; return; }
		if (fb.t < 0) {
			fb.next -= dt;
			if (fb.next > 0) return;
			const f = target.clone().sub(camera.position);
			const D = f.length();
			f.normalize();
			const r = new THREE.Vector3().crossVectors(f, camera.up).normalize();
			fb.d = D * 0.16;
			fb.dir = Math.random() < 0.5 ? 1 : -1;
			fb.f.copy(f);
			fb.r.copy(r).multiplyScalar(fb.dir);
			fb.o.copy(camera.position).addScaledVector(f, fb.d).addScaledVector(fb.r, -fb.d * 0.9).addScaledVector(camera.up, fb.d * (0.05 + Math.random() * 0.12));
			fb.t = 0;
		}
		fb.t += dt;
		const k = fb.t / 9;
		if (k > 1) { fb.t = -1; fb.next = 14 + Math.random() * 10; fbMesh.visible = false; return; }
		fbMesh.visible = true;
		const lead = fb.o.clone().addScaledVector(fb.r, fb.d * 1.8 * k).addScaledVector(fb.f, fb.d * 0.25 * k);
		const yaw = Math.atan2(fb.r.x, fb.r.z);
		gullQ.setFromAxisAngle(new THREE.Vector3(0, 1, 0), yaw);
		for (let i = 0; i < FB; i++) {
			const row = Math.ceil(i / 2), sd = i % 2 ? 1 : -1;
			gullP.copy(lead).addScaledVector(fb.r, -row * fb.d * 0.035).addScaledVector(fb.f, sd * row * fb.d * 0.03);
			gullP.y += Math.sin(U.uTime.value * 0.8 + i) * fb.d * 0.004 - row * fb.d * 0.004;
			gullS.setScalar(fb.d * 0.0085);
			gullM.compose(gullP, gullQ, gullS);
			fbMesh.setMatrixAt(i, gullM);
		}
		fbMesh.instanceMatrix.needsUpdate = true;
	}

	// ---------- post: bloom + tilt-shift (miniature look of the diorama) ----------
	const composer = new EffectComposer(renderer, new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType }));
	composer.addPass(new RenderPass(scene, camera));
	const bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.26, 0.85, 0.86);
	composer.addPass(bloom);
	const tilt = new ShaderPass({
		uniforms: { tDiffuse: { value: null }, uAmt: { value: 0 }, uFocus: { value: 0.55 }, uRes: { value: new THREE.Vector2(1, 1) } },
		vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
		fragmentShader: `uniform sampler2D tDiffuse; uniform float uAmt, uFocus; uniform vec2 uRes; varying vec2 vUv;
      void main(){ float d=abs(vUv.y-uFocus); float rad=uAmt*smoothstep(.12,.55,d)*9.;
        vec4 acc=texture2D(tDiffuse,vUv); float wsum=1.;
        if(rad>.3){ for(int i=0;i<12;i++){ float a=float(i)*2.39996; float rr=sqrt(float(i)+.5)/3.5;
            vec2 o=vec2(cos(a),sin(a))*rr*rad/uRes; acc+=texture2D(tDiffuse,vUv+o); wsum+=1.; } }
        gl_FragColor=acc/wsum; }`
	});
	composer.addPass(tilt);
	let usePost = true;
	const look = new THREE.Vector3(), ndc = new THREE.Vector3(), fwd = new THREE.Vector3();
	let paused = false, last = 0;
	const frame = { view: { az: 0, pol: 0 }, towns: landmarks.map((l) => ({ name: l.name, tier: l.tier, x: 0, y: 0, d: 0, vis: false })), pins: marks.map((m) => ({ slug: m.slug, x: 0, y: 0, vis: false })), tape: { x: 0, y: 0, vis: false }, horizonY: 0, latlon: [0, 0] };
	function tick(time) {
		const dt = Math.min(0.1, time - last);
		last = time;
		if (paused) return;
		U.uTime.value = time;
		{
			const want = phase === 'intro' || phase === 'idle' ? 0 : 1;
			const v = U.uDio.value;
			U.uDio.value = reduce ? want : v + (want - v) * (1 - Math.exp(-dt * (want ? 0.9 : 3)));
			if (Math.abs(U.uDio.value - want) < 0.001) U.uDio.value = want;
			walls.visible = U.uDio.value > 0.002;
			walls.children[4].position.y = -BOT * U.uDio.value;
		}
		if (phase === 'over' && controlsOn && !gsap.isTweening(U.uSunElev)) {
			const [e, a] = dayAt(dayP);
			const k = reduce ? 1 : 1 - Math.exp(-dt * 3);
			U.uSunElev.value += (e - U.uSunElev.value) * k;
			U.uSunAz.value += (a - U.uSunAz.value) * k;
			setSun();
		} else if (phase !== 'over' && U.uSunAz.value !== SUN_AZ0 && !gsap.isTweening(U.uSunAz)) {
			gsap.to(U.uSunAz, { value: SUN_AZ0, duration: reduce ? 0 : 1.6, onUpdate: setSun });
		}
		{
			// keep the moon ahead of the viewer so its path always lies on the water in frame
			const f = target.clone().sub(camera.position).setY(0).normalize();
			U.uMoon.value.set(f.x, 0.2, f.z).normalize();
		}
		updateShips(dt);
		updateGulls(dt);
		updateSea(dt);
		for (const l of lighthouses) l.rotation.y = time * 0.9 + l.userData.phase;
		const story = phase === 'over' && controlsOn && !ctrl.touched && !tween?.isActive();
		if (story) {
			storyPose(dayP);
			ctrlAim(_sp, _st);
		}
		if (phase === 'over' && !tween?.isActive()) applyCtrl(dt, story ? 2.2 : 9);
		const drift = phase === 'over' && !reduce && !ctrl.touched ? 1 : 0;
		look.copy(target).add(new THREE.Vector3(pointer.x * 3 * drift, -pointer.y * 2 * drift, 0));
		storyShift += ((story && !mobile ? shiftAt(dayP) : 0) - storyShift) * (1 - Math.exp(-dt * 2));
		if (storyShift > 0.001) {
			const fwd = target.clone().sub(camera.position), d = fwd.length();
			const right = fwd.cross(camera.up).normalize();
			look.addScaledVector(right, -0.2 * d * storyShift);
		}
		camera.lookAt(look);
		const nearP = Math.min(6, Math.max(0.05, camera.position.y * 0.12));
		if (Math.abs(nearP - camera.near) > 1e-3) {
			camera.near = nearP;
			camera.updateProjectionMatrix();
		}
		skyMesh.position.copy(camera.position);
		clouds.position.x = camera.position.x;
		clouds.position.z = camera.position.z;
		updateRipples(dt);
		updateFlyby(dt);
		if (usePost) {
			const camD = camera.position.distanceTo(target);
			tilt.uniforms.uAmt.value = (mobile ? 0.5 : 0.75) * (1 - 0.8 * THREE.MathUtils.smoothstep(-U.uSunElev.value, 0.02, 0.15)) * U.uDio.value * THREE.MathUtils.smoothstep(camD, 40, 160);
			composer.render(dt);
		} else renderer.render(scene, camera);

		const W = innerWidth, H = innerHeight;
		for (let i = 0; i < marks.length; i++) {
			const m = marks[i];
			const cd = camera.position.distanceTo(m.pos);
			m.beam.scale.set(cd * 0.0016, 1, cd * 0.0016);
			const hi = current === m ? 1 : 0;
			m.ring.material.uniforms.uHi.value += (hi - m.ring.material.uniforms.uHi.value) * 0.05;
			m.ring.scale.setScalar(Math.max(0.28, cd * 0.022));
			const su = m.sparks.material.uniforms;
			su.uHi.value = m.ring.material.uniforms.uHi.value;
			su.uH.value = cd * 0.06;
			su.uR.value = cd * 0.004;
			su.uPx.value = renderer.getPixelRatio();
			ndc.copy(m.pos).add(new THREE.Vector3(0, 2.2, 0)).project(camera);
			const f = frame.pins[i];
			f.x = (ndc.x * 0.5 + 0.5) * W;
			f.y = (-ndc.y * 0.5 + 0.5) * H;
			f.vis = ndc.z < 1 && Math.abs(ndc.x) < 1.05 && Math.abs(ndc.y) < 1.05;
		}
		for (let i = 0; i < landmarks.length; i++) {
			ndc.copy(landmarks[i].pos).project(camera);
			const f = frame.towns[i];
			f.x = (ndc.x * 0.5 + 0.5) * W;
			f.y = (-ndc.y * 0.5 + 0.5) * H;
			f.vis = ndc.z < 1 && Math.abs(ndc.x) < 0.95 && Math.abs(ndc.y) < 0.95;
			f.d = camera.position.distanceTo(landmarks[i].pos);
		}
		if (current && phase === 'object') {
			ndc.copy(current.pos).lerp(current.coast, 0.5).add(new THREE.Vector3(0, 0.35, 0)).project(camera);
			frame.tape.x = (ndc.x * 0.5 + 0.5) * W;
			frame.tape.y = (-ndc.y * 0.5 + 0.5) * H;
			frame.tape.vis = ndc.z < 1;
		} else frame.tape.vis = false;
		camera.getWorldDirection(fwd);
		fwd.y = 0;
		fwd.normalize();
		ndc.copy(camera.position).addScaledVector(fwd, 1500).setY(0).project(camera);
		frame.horizonY = (-ndc.y * 0.5 + 0.5) * H;
		frame.latlon = toLatLon(camera.position);
		frame.view.az = cur.az;
		frame.view.pol = cur.pol;
		onFrame?.(frame);
	}
	function resize() {
		renderer.setSize(innerWidth, innerHeight, false);
		composer.setPixelRatio(renderer.getPixelRatio());
		composer.setSize(innerWidth, innerHeight);
		bloom.resolution.set(innerWidth / 2, innerHeight / 2);
		tilt.uniforms.uRes.value.set(innerWidth, innerHeight);
		camera.aspect = innerWidth / innerHeight;
		camera.updateProjectionMatrix();
	}
	resize();
	addEventListener('resize', resize);
	gsap.ticker.add(tick);
	return api;
}
