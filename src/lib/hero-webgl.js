// Sea Real Estate — WebGL hero (drop-in, dependency-free, WebGL1).
// Usage: const gl = mountHeroWebGL(rootEl); gl && gl.destroy();  (rootEl contains img.hero-poster and canvas.hero-gl)
// Falls back to the static <img class="hero-poster"> when: reduced motion, coarse pointer (phones), no WebGL, context lost.

const VERT = `attribute vec2 p; varying vec2 vUv;
void main(){ vUv = p * .5 + .5; gl_Position = vec4(p, 0., 1.); }`;

const FRAG = `precision highp float;
varying vec2 vUv;
uniform sampler2D u_tex;
uniform float u_time;
uniform vec2 u_mouse;   // 0..1, y up
uniform vec2 u_res;
uniform float u_ia;      // image aspect
uniform float u_energy;  // 0..1, how much the pointer is active (eases in/out)
float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
void main(){
  float s = u_res.x / u_res.y;
  vec2 scale = s > u_ia ? vec2(1.0, u_ia / s) : vec2(s / u_ia, 1.0);
  float z = 1.0 - 0.035 * smoothstep(0.0, 8.0, u_time);          // slow push-in
  vec2 uv = (vUv - 0.5) * scale * z + 0.5;
  // water: lower part of the frame shimmers and bends the reflection
  float wt = smoothstep(0.55, 0.0, uv.y);
  float wave = sin(uv.y * 140.0 - u_time * 1.7) * 0.6 + sin(uv.x * 46.0 + uv.y * 90.0 + u_time * 1.1) * 0.4;
  uv.x += wt * wave * 0.0035;
  uv.y += wt * sin(uv.x * 70.0 + u_time * 1.3) * 0.0015;
  // pointer ripple
  vec2 dd = (vUv - u_mouse) * vec2(s, 1.0);
  float dist = length(dd);
  float rip = sin(dist * 70.0 - u_time * 7.0) * exp(-dist * 7.0) * 0.006 * u_energy;
  uv += normalize(vUv - u_mouse + 1e-5) * rip;
  vec3 col = texture2D(u_tex, uv).rgb;
  // one diagonal light sweep every ~5 s (wraps off-frame, so the reset is invisible)
  float sweepX = fract(u_time / 5.0) * 2.6 - 0.8;
  float g = vUv.x + vUv.y * 0.25 - sweepX;
  col += exp(-g * g * 90.0) * vec3(1.0, 0.86, 0.6) * 0.16;
  // sparse moon glitter on the water
  float cell = hash(floor(vUv * vec2(520.0, 300.0)) + floor(u_time * 4.0));
  col += smoothstep(0.994, 1.0, cell) * wt * vec3(1.0, 0.92, 0.75) * 0.22;
  // warm bloom under the pointer, grain, vignette
  col += exp(-dist * 5.0) * vec3(0.10, 0.07, 0.03) * u_energy;
  col += (hash(vUv * u_res + u_time) - 0.5) * 0.03;
  col *= 1.0 - 0.35 * pow(length(vUv - 0.5) * 1.25, 2.2);
  gl_FragColor = vec4(col, 1.0);
}`;

const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const isTouchDevice = () => matchMedia('(pointer: coarse)').matches;

export function mountHeroWebGL(root) {
  if (!root) return null;
  const canvas = root.querySelector('canvas.hero-gl');
  const poster = root.querySelector('.hero-poster');
  const src = root.dataset.src || (poster && poster.getAttribute('src'));
  if (!canvas || !src) return null;
  if (reduceMotion() || isTouchDevice()) return null;              // keep the poster
  const gl = canvas.getContext('webgl', { antialias: false, alpha: false, preserveDrawingBuffer: false });
  if (!gl) return null;

  const sh = (type, code) => {
    const s = gl.createShader(type); gl.shaderSource(s, code); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.warn(gl.getShaderInfoLog(s)); return null; }
    return s;
  };
  const vs = sh(gl.VERTEX_SHADER, VERT), fs = sh(gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return null;
  const prog = gl.createProgram();
  gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
  gl.useProgram(prog);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const aP = gl.getAttribLocation(prog, 'p');
  gl.enableVertexAttribArray(aP); gl.vertexAttribPointer(aP, 2, gl.FLOAT, false, 0, 0);
  const U = (n) => gl.getUniformLocation(prog, n);
  const uTime = U('u_time'), uMouse = U('u_mouse'), uRes = U('u_res'), uIA = U('u_ia'), uEnergy = U('u_energy');

  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  const state = { ready: false, ia: 1.78, running: false, visible: true, raf: 0, t0: performance.now(),
                  mx: .5, my: .4, tx: .5, ty: .4, energy: 0, lastMove: -1e9, dpr: Math.min(devicePixelRatio || 1, 1.5) };

  const resize = () => {
    const w = Math.max(1, Math.round(canvas.clientWidth * state.dpr));
    const h = Math.max(1, Math.round(canvas.clientHeight * state.dpr));
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
    gl.viewport(0, 0, w, h);
  };
  const ro = new ResizeObserver(resize); ro.observe(canvas);

  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    state.ia = img.naturalWidth / img.naturalHeight;
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    try {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    } catch (err) {
      console.warn('hero: texture upload blocked, keeping poster', err);
      return;
    }
    state.ready = true;
    resize();
    root.classList.add('is-gl');        // CSS hides the poster once the first frame is ready
    start();
  };
  img.onerror = () => { /* poster stays */ };
  img.src = src;

  const frame = (now) => {
    state.raf = 0;
    if (!state.running) return;
    const t = (now - state.t0) / 1000;
    // pointer → target, idle drift when the pointer has been still for 3 s
    const idle = now - state.lastMove > 3000;
    if (idle) { state.tx = .5 + .28 * Math.sin(t * .6); state.ty = .32 + .12 * Math.cos(t * .45); }
    state.mx += (state.tx - state.mx) * .08; state.my += (state.ty - state.my) * .08;
    state.energy += ((idle ? 0.4 : 1) - state.energy) * .04;
    gl.uniform1f(uTime, t);
    gl.uniform2f(uMouse, state.mx, state.my);
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.uniform1f(uIA, state.ia);
    gl.uniform1f(uEnergy, state.energy);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    state.raf = requestAnimationFrame(frame);
  };
  const start = () => {
    if (state.running || !state.ready || !state.visible || document.hidden) return;
    state.running = true; state.raf = requestAnimationFrame(frame);
  };
  const stop = () => { state.running = false; if (state.raf) cancelAnimationFrame(state.raf); state.raf = 0; };

  // pause when the hero is off screen or the tab is hidden
  const io = new IntersectionObserver(([e]) => { state.visible = e.isIntersecting; e.isIntersecting ? start() : stop(); });
  io.observe(root);
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));

  // pointer: normalized, y up
  root.addEventListener('pointermove', (e) => {
    const r = canvas.getBoundingClientRect();
    state.tx = (e.clientX - r.left) / r.width;
    state.ty = 1 - (e.clientY - r.top) / r.height;
    state.lastMove = performance.now();
  });

  // GPU context loss: fall back to the poster, don't crash
  canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); stop(); root.classList.remove('is-gl'); });

  return {
    destroy() { stop(); ro.disconnect(); io.disconnect(); root.classList.remove('is-gl'); },
  };
}
