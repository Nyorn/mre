// Sea Estate coast scene: real terrain + bathymetry, OSM coastline ribbon, dawn sky, clouds, ships.
// Framework-free; the Svelte <Stage> owns DOM overlays and talks to this through the returned API.
import * as THREE from 'three';
import gsap from 'gsap';
import { projection } from '#lib/geo/math.js';
import { PLACES, LIGHTHOUSES } from '#lib/geo/places.js';

const EX = 4.0; // vertical relief exaggeration
const CLOUD_H = 16.0;
const ANCHOR = [42.85, 27.78]; // optical centre of the coast for overview framing
const SUN_HOME = 0.075;

const glsl = (oct) => /* glsl */ `
#define OCT ${oct}
#define CLOUD_H ${CLOUD_H.toFixed(1)}
uniform float uTime, uSunElev, uCloudAmt, uFogScale;
uniform vec3 uSun, uTarget;
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
  vec3 c = mix(mix(horAway,horSun,toward), zen, pow(h,.45));
  float s = max(dot(d,uSun),0.);
  c += vec3(1.4,.85,.5)*pow(s,900.)*8.*smoothstep(-.06,.02,uSunElev);
  c += vec3(1.,.55,.3)*pow(s,8.)*.35*(1.-t*.6);
  return c;
}
vec3 tone(vec3 c){ c = 1.-exp(-c*1.15); return pow(c, vec3(.95)); }
vec3 sunColor(){ float day=smoothstep(-.10,.25,uSunElev);
  return mix(vec3(1.,.45,.22), vec3(1.05,.82,.62), day)*smoothstep(-.08,.04,uSunElev)*1.6; }
vec3 ambColor(float ny){ float day=smoothstep(-.10,.25,uSunElev);
  return mix(vec3(.05,.07,.11), vec3(.30,.36,.44), day)*(.55+.45*ny); }
vec3 fogged(vec3 c, vec3 wpos, float k){
  vec3 V = wpos-cameraPosition; float dist = length(V);
  return mix(c, sky(normalize(vec3(V.x,.02,V.z))), 1.-exp(-pow(dist*k*uFogScale,1.6)));
}
`;

export async function createCoastScene({ canvas, properties, reduce = false, mobile = false, onFrame, onPhase, onInteract }) {
	const [geo, img] = await Promise.all([
		fetch('/geo/geo.json').then((r) => r.json()),
		new Promise((res, rej) => {
			const i = new Image();
			i.onload = () => res(i);
			i.onerror = rej;
			i.src = '/geo/terrain.png';
		})
	]);
	const M = geo.meta;
	const KW = M.km[0], KH = M.km[1];
	const luImg = M.landuse
		? await new Promise((res) => {
				const i = new Image();
				i.onload = () => res(i);
				i.onerror = () => res(null);
				i.src = '/geo/landuse.png';
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
		uCloudAmt: { value: 0.35 },
		uFogScale: { value: mobile ? 0.6 : 1 },
		uRibbon: { value: reduce ? 1 : 0 },
		uFocus: { value: new THREE.Vector3() },
		uFocusAmt: { value: 0 }
	};
	const setSun = () => {
		const e = U.uSunElev.value;
		U.uSun.value.set(Math.cos(e) * 0.92, Math.sin(e), Math.cos(e) * 0.39).normalize();
	};
	setSun();

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
        void main(){ vec3 d=normalize(vD); d.y=max(d.y,-.02); vec3 c=sky(d);
          float night=1.-smoothstep(-.10,.04,uSunElev);
          if(night>0.){ vec2 p=d.xz/(d.y+.35)*170.; vec2 cell=floor(p); float h=hash(cell);
            vec2 f=fract(p)-.5-(vec2(hash(cell+3.1),hash(cell+7.7))-.5)*.6;
            float st=step(.982,h)*smoothstep(.13,0.,length(f))*smoothstep(.02,.25,d.y);
            st*=.55+.45*sin(uTime*2.5+h*90.);
            c+=vec3(.9,.95,1.)*st*night*1.6*(.4+.6*fract(h*53.)); }
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
			vertexShader: `uniform sampler2D uMap; uniform float uLand; uniform vec2 uKM; varying vec2 vUv; varying vec3 vW;
        void main(){ vec4 w0=modelMatrix*vec4(position,1.); vec2 uv=vec2(w0.x/uKM.x+.5, .5-w0.z/uKM.y); vUv=uv;
          vec4 t=texture2D(uMap,clamp(uv,0.,1.)); float land=smoothstep(.3,.6,t.b);
          float ed=smoothstep(0.,.06,min(min(uv.x,1.-uv.x),min(uv.y,1.-uv.y)));
          #ifdef SKIRT
            ed=0.;
          #endif
          vec3 p=position; p.y=t.r*uLand*ed*land+.06;
          vec4 w=modelMatrix*vec4(p,1.); vW=w.xyz; gl_Position=projectionMatrix*viewMatrix*w; }`,
			fragmentShader:
				COMMON +
				`uniform sampler2D uMap, uLU; uniform vec2 uTexel,uKM; uniform float uLand, uHasLU; varying vec2 vUv; varying vec3 vW;
        void main(){
          #ifdef SKIRT
            if(vUv.x>0.002&&vUv.x<.998&&vUv.y>0.002&&vUv.y<.998) discard;
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
          float ed=smoothstep(0.,.06,min(min(vUv.x,1.-vUv.x),min(vUv.y,1.-vUv.y)));
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
          // beaches: bright sand ribbon
          base=mix(base,vec3(.78,.66,.48),smoothstep(.15,.6,lu.g)*.9);
          // built-up: pale limestone with a faint block grain when close
          float blocks=noise(vW.xz*26.)*near;
          vec3 town=vec3(.50,.45,.39)*(.85+.3*blocks);
          base=mix(base,town,smoothstep(.2,.7,lu.r)*mix(.3,.5,near)*(1.+.7*smoothstep(.4,.6,lu.b)));
          float sh=1.;
          #if SH_STEPS > 0
          { float lxz=max(length(uSun.xz),1e-3); vec2 dUV=vec2(uSun.x/uKM.x,-uSun.z/uKM.y)/lxz; float slope=uSun.y/lxz;
            float h0=vW.y; float st=.3;
            for(int i=0;i<SH_STEPS;i++){ vec2 q=uv+dUV*st; vec4 tq=texture2D(uMap,q);
              float hq=tq.r*uLand*smoothstep(.3,.6,tq.b); sh=min(sh,clamp((h0+slope*st-hq)*3.+1.,0.,1.)); st*=1.42; }
          }
          #endif
          float lit=max(dot(n,uSun),0.)*cloudShadow(vW)*mix(.25,1.,sh);
          vec3 c=base*(ambColor(n.y)*1.35+sunColor()*lit*1.15);
          float cl=hm/50.; float fw=max(fwidth(cl),1e-4); float f=abs(fract(cl-.5)-.5)/fw;
          float clFade=(1.-smoothstep(.25,.6,fw))*smoothstep(8.,30.,hm);
          c=mix(c, c*1.35+vec3(.02,.018,.012), (1.-min(f,1.))*.32*clFade);
          c+=vec3(1.,.62,.32)*smoothstep(.2,.7,lu.r)*.10*(1.-smoothstep(-.02,.16,uSunElev));
          { // town boundaries: soft warm fill + crisp glowing outline
            float fb=max(fwidth(lu.b),1e-4);
            float edge=1.-smoothstep(0.,fb*1.6,abs(lu.b-.5));
            float dash=.55+.45*step(.5,fract((vW.x+vW.z)*1.4));
            c=mix(c,c*1.12+vec3(.03,.02,.0),smoothstep(.45,.6,lu.b)*.5);
            c+=vec3(1.,.78,.45)*edge*dash*.55*(1.-smoothstep(120.,320.,camD)); }
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
					`uniform sampler2D uMap; uniform vec2 uKM; varying vec3 vW;
        vec2 grad(vec2 p){ float e=.05, a=0., b=0., amp=1., fr=1.;
          for(int i=0;i<4;i++){ vec2 q=p*fr+vec2(uTime*.35*fr,uTime*.22);
            a+=(noise(q+vec2(e,0))-noise(q-vec2(e,0)))*amp; b+=(noise(q+vec2(0,e))-noise(q-vec2(0,e)))*amp; amp*=.55; fr*=2.1; }
          return vec2(a,b)/(2.*e); }
        void main(){
          vec2 uv=vec2(vW.x/uKM.x+.5, .5-vW.z/uKM.y);
          float inside=step(0.,uv.x)*step(uv.x,1.)*step(0.,uv.y)*step(uv.y,1.);
          float ef=smoothstep(0.,.1,min(min(uv.x,1.-uv.x),min(uv.y,1.-uv.y)));
          float depth=mix(1.,texture2D(uMap,clamp(uv,0.,1.)).g,inside*ef);
          vec3 V=vW-cameraPosition; float dist=length(V); vec3 vd=V/dist;
          float far=smoothstep(15.,120.,dist);
          vec2 g=grad(vW.xz*1.6)*.045*(1./(1.+dist*.02))*(1.-far*.7);
          vec3 n=normalize(vec3(-g.x,1.,-g.y));
          vec3 r=reflect(vd,n); r.y=abs(r.y);
          float fres=.02+.98*pow(1.-max(dot(-vd,n),0.),5.);
          float day=smoothstep(-.10,.25,uSunElev);
          float sh=cloudShadow(vW);
          vec3 shallow=mix(vec3(.03,.08,.09),vec3(.10,.30,.30),day), deep=mix(vec3(.008,.02,.03),vec3(.02,.08,.12),day);
          vec3 body=mix(shallow,deep,smoothstep(0.,.55,depth))*(.55+.45*sh);
          vec3 c=mix(body,sky(r)*(.7+.3*sh),fres*.9);
          float ex=mix(220.,36.,far);
          float s=pow(max(dot(r,uSun),0.),ex)*smoothstep(-.06,.03,uSunElev)*sh*mix(3.,.9,far);
          c+=vec3(1.5,.9,.55)*s;
          gl_FragColor=vec4(tone(fogged(c,vW,.0032)),1.);
        }`
			})
		)
	);

	// clouds: one fbm deck, lit from below at dawn, opened up around the camera target when seen from above
	const clouds = new THREE.Mesh(
		new THREE.PlaneGeometry(1100, 1100, 1, 1).rotateX(-Math.PI / 2),
		new THREE.ShaderMaterial({
			uniforms: U,
			transparent: true,
			depthWrite: false,
			side: THREE.DoubleSide,
			vertexShader: `varying vec3 vW; void main(){ vec4 w=modelMatrix*vec4(position,1.); vW=w.xyz; gl_Position=projectionMatrix*viewMatrix*w; }`,
			fragmentShader:
				COMMON +
				`varying vec3 vW;
        void main(){
          float d=cloudDens(vW.xz); if(d<.01) discard;
          float d2=cloudDens(vW.xz+normalize(uSun.xz)*5.);
          vec3 V=vW-cameraPosition; float dist=length(V); vec3 vd=V/dist;
          float day=smoothstep(-.10,.25,uSunElev);
          float forward=pow(max(dot(vd,uSun),0.),5.);
          vec3 sc=sunColor();
          vec3 base=mix(vec3(.16,.13,.16),vec3(.78,.80,.86),day);
          vec3 c=base*(.55+.35*(1.-d2)) + sc*(.32+.95*forward)*(1.-d2*.6);
          c+=sc*forward*(1.-d)*1.2;
          float above=step(CLOUD_H,cameraPosition.y);
          float hole=mix(1., .32*smoothstep(14.,70.,length(vW.xz-uTarget.xz)), above);
          float a=d*.85*hole*smoothstep(.5,8.,dist)*(1.-smoothstep(320.,520.,dist));
          gl_FragColor=vec4(tone(fogged(c,vW,.0034)),a);
        }`
		})
	);
	clouds.position.y = CLOUD_H;
	clouds.renderOrder = 5;
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
				blending: THREE.AdditiveBlending,
				vertexShader: `attribute float side,dist; attribute vec2 nrm; varying float vS,vD; varying vec3 vW;
          void main(){ vS=side; vD=dist; vec4 w=modelMatrix*vec4(position,1.);
            float d=length(w.xyz-cameraPosition); w.xz+=nrm*side*clamp(d*.0042,.02,.6);
            vW=w.xyz; gl_Position=projectionMatrix*viewMatrix*w; }`,
				fragmentShader: `uniform float uTime,uSunElev,uFocusAmt,uRibbon; uniform vec3 uFocus; varying float vS,vD; varying vec3 vW;
          void main(){
            float core=exp(-vS*vS*14.), glow=exp(-vS*vS*2.5)*.35;
            float pulse=pow(.5+.5*sin(vD*.22-uTime*.9),6.)*.55;
            float foc=uFocusAmt*exp(-length(vW.xz-uFocus.xz)*.35);
            float night=1.-smoothstep(-.05,.30,uSunElev)*.35;
            vec3 c=vec3(1.,.74,.42)*(core*1.1+glow)*(.95+pulse*1.2+foc*1.8)*night;
            c*=1.4*exp(-length(vW-cameraPosition)*.0025)*uRibbon;
            gl_FragColor=vec4(c,1.);
          }`
			})
		);
		ribbon.renderOrder = 6;
		scene.add(ribbon);
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
			const want = mobile ? 1400 : 3200;
			for (let k = 0; k < 400000 && seed.length < want; k++) {
				const u = 0.25 + rand() * 0.75, v = rand();
				const x = Math.floor(u * (luImg.width - 1)), y = Math.floor(v * (luImg.height - 1));
				if (ld[(y * luImg.width + x) * 4] < 140) continue;
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
            vA=tw*(1.-smoothstep(-.02,.16,uSunElev)*.8)*(.5+seed*.5);
            gl_PointSize=clamp(90./-mv.z,1.5,5.)*uPx; }`,
				fragmentShader: `varying float vA; void main(){ vec2 d=gl_PointCoord-.5; float a=exp(-dot(d,d)*18.)*vA;
          gl_FragColor=vec4(vec3(1.,.72,.42)*a,1.); }`
			})
		);
		lights.renderOrder = 4;
		scene.add(lights);
	}
	const landmarks = PLACES.map((pl) => ({ ...pl, pos: world(pl.lat, pl.lon, 0.4) }));

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
        float dawn=1.-smoothstep(.02,.14,uSunElev);
        a*=dawn*.55*exp(-length(vW-cameraPosition)*.006);
        gl_FragColor=vec4(vec3(1.,.86,.62)*a,1.); }`
	});
	const lighthouses = LIGHTHOUSES.map((l, i) => {
		const g = new THREE.Group();
		const plane = new THREE.PlaneGeometry(1, 1);
		plane.translate(0.5, 0, 0);
		const a = new THREE.Mesh(plane, beamSweep), b = new THREE.Mesh(plane, beamSweep);
		a.scale.set(9, 0.9, 1);
		b.scale.set(9, 0.9, 1);
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

	// ---------- property markers ----------
	const beamMat = new THREE.ShaderMaterial({
		uniforms: U,
		transparent: true,
		depthWrite: false,
		blending: THREE.AdditiveBlending,
		vertexShader: `varying float vY; void main(){ vY=uv.y; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
		fragmentShader: `varying float vY; uniform float uTime; void main(){ float a=pow(1.-vY,2.2)*(.75+.25*sin(uTime*2.)); gl_FragColor=vec4(vec3(1.,.78,.48)*a,1.); }`
	});
	const ringMat = new THREE.MeshBasicMaterial({ color: 0xffc77a, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false });
	const marks = properties.map((p) => {
		const pos = world(p.lat, p.lon);
		const coast = world(p.sea.point[0], p.sea.point[1]).setY(0);
		const toSea = new THREE.Vector3(coast.x - pos.x, 0, coast.z - pos.z);
		if (toSea.lengthSq() < 1e-8) toSea.set(1, 0, 0);
		toSea.normalize();
		const beam = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 4, 8, 1, true), beamMat);
		beam.position.copy(pos).add(new THREE.Vector3(0, 2, 0));
		const ring = new THREE.Mesh(new THREE.RingGeometry(0.08, 0.13, 32).rotateX(-Math.PI / 2), ringMat);
		ring.position.copy(pos).add(new THREE.Vector3(0, 0.04, 0));
		scene.add(beam, ring);
		return { slug: p.slug, p, pos, coast, toSea, beam, ring };
	});

	const tapeGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
	const tape = new THREE.Line(tapeGeo, new THREE.LineDashedMaterial({ color: 0xffc77a, dashSize: 0.03, gapSize: 0.025, transparent: true, opacity: 0, depthTest: false }));
	tape.renderOrder = 7;
	scene.add(tape);

	// ---------- camera choreography ----------
	const POSES = {
		over: mobile
			? { pos: A.clone().add(new THREE.Vector3(120, 190, -190)), tgt: A.clone().add(new THREE.Vector3(10, 0, 30)) }
			: { pos: A.clone().add(new THREE.Vector3(82, 58, -156)), tgt: A.clone() },
		intro: { pos: A.clone().add(new THREE.Vector3(36, 2.2, 34)), tgt: A.clone().add(new THREE.Vector3(240, 6, 84)) }
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
	const LIM = { dMin: 10, dMax: 320, pMin: 0.08, pMax: 1.4, x: KW * 0.46, z: KH * 0.46 };
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
	function applyCtrl(dt) {
		const k = 1 - Math.exp(-dt * 9);
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
	canvas.style.touchAction = 'none';
	function onDown(e) {
		if (!canUse()) return;
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
		if (!canUse()) return;
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

	const api = {
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
			gsap.to(U.uRibbon, { value: 1, duration: 2.4, delay: 1.0, ease: 'power2.out' });
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
			ctrl.touched = false;
			setPhase('flying');
			await camTo(POSES.over, 1.6);
			setPhase('over');
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
	const look = new THREE.Vector3(), ndc = new THREE.Vector3(), fwd = new THREE.Vector3();
	let paused = false, last = 0;
	const frame = { view: { az: 0, pol: 0 }, towns: landmarks.map((l) => ({ name: l.name, tier: l.tier, x: 0, y: 0, d: 0, vis: false })), pins: marks.map((m) => ({ slug: m.slug, x: 0, y: 0, vis: false })), tape: { x: 0, y: 0, vis: false }, horizonY: 0, latlon: [0, 0] };
	function tick(time) {
		const dt = Math.min(0.1, time - last);
		last = time;
		if (paused) return;
		U.uTime.value = time;
		updateShips(dt);
		updateGulls(dt);
		for (const l of lighthouses) l.rotation.y = time * 0.9 + l.userData.phase;
		if (phase === 'over' && !tween?.isActive()) applyCtrl(dt);
		const drift = phase === 'over' && !reduce && !ctrl.touched ? 1 : 0;
		look.copy(target).add(new THREE.Vector3(pointer.x * 3 * drift, -pointer.y * 2 * drift, 0));
		camera.lookAt(look);
		const nearP = Math.min(6, Math.max(0.05, camera.position.y * 0.12));
		if (Math.abs(nearP - camera.near) > 1e-3) {
			camera.near = nearP;
			camera.updateProjectionMatrix();
		}
		skyMesh.position.copy(camera.position);
		clouds.position.x = camera.position.x;
		clouds.position.z = camera.position.z;
		renderer.render(scene, camera);

		const W = innerWidth, H = innerHeight;
		for (let i = 0; i < marks.length; i++) {
			const m = marks[i];
			const cd = camera.position.distanceTo(m.pos);
			m.beam.scale.set(cd * 0.0016, 1, cd * 0.0016);
			m.ring.scale.setScalar((1 + 0.25 * Math.sin(time * 2.2)) * Math.max(0.35, cd * 0.012));
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
		camera.aspect = innerWidth / innerHeight;
		camera.updateProjectionMatrix();
	}
	resize();
	addEventListener('resize', resize);
	gsap.ticker.add(tick);
	return api;
}
