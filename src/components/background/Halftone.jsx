import { useEffect, useRef } from 'react';

/**
 * Living halftone board.
 *
 * Two halftone screens — one in each riso ink — printed at the classic
 * screen angles (15° and 75°) over the dark field. Their dot coverage is
 * driven by a slow-flowing noise field, so as the two grids drift across
 * each other they bloom into moiré and dissolve again. It reads as a flat
 * textured board until you actually watch it; then you notice the whole
 * thing is breathing.
 *
 * Raw WebGL on one full-screen triangle — the entire effect is in the
 * fragment shader, so there's no geometry to speak of and no library.
 * Falls back to nothing (the CSS board shows through) if WebGL is
 * unavailable or the user prefers reduced motion.
 */

const VERT = `
attribute vec2 aPos;
void main() {
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

const FRAG = `
precision highp float;

uniform vec2  uRes;
uniform float uTime;
uniform vec2  uPointer;
uniform vec3  uInkA;
uniform vec3  uInkB;
uniform float uOpacity;
uniform float uCell;

// --- Ashima simplex noise (3D) ---
vec3 mod289(vec3 x){ return x - floor(x*(1.0/289.0))*289.0; }
vec4 mod289(vec4 x){ return x - floor(x*(1.0/289.0))*289.0; }
vec4 permute(vec4 x){ return mod289(((x*34.0)+1.0)*x); }
vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314*r; }

float snoise(vec3 v){
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
            i.z + vec4(0.0, i1.z, i2.z, 1.0))
          + i.y + vec4(0.0, i1.y, i2.y, 1.0))
          + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m*m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}

float fbm(vec2 p){
  float s = 0.0, a = 0.5;
  for (int i = 0; i < 3; i++){
    s += snoise(vec3(p, 0.0)) * a;
    p *= 2.03;
    a *= 0.5;
  }
  return s * 0.5 + 0.5;
}

// One halftone screen: dots on a rotated grid, radius from ink coverage.
// The edge softness is derived from the cell size rather than from
// screen-space derivatives, so this needs no GL extension (SwiftShader
// and older drivers reject OES_standard_derivatives).
float screen(vec2 frag, float angle, float cell, float coverage){
  float s = sin(angle), c = cos(angle);
  mat2 R = mat2(c, -s, s, c);
  vec2 g = (R * frag) / cell;
  vec2 f = fract(g) - 0.5;
  float d = length(f) * 2.0;      // 0 at a dot's centre, ~1 at the corners
  float r = sqrt(clamp(coverage, 0.0, 1.0)) * 1.05;
  float aa = 3.0 / cell + 0.02;   // ~1.5px of feather in dot-radius units
  return smoothstep(r + aa, r - aa, d);
}

void main(){
  vec2 uv = gl_FragCoord.xy / uRes;
  float aspect = uRes.x / uRes.y;
  vec2 p = vec2(uv.x * aspect, uv.y);

  // The flow field — two layers drifting in different directions so the
  // moiré never settles into a repeat.
  float t = uTime * 0.045;
  vec2 par = uPointer * 0.2;
  float covA = fbm(p * 1.7 + vec2( t, t * 0.35) + par);
  float covB = fbm(p * 1.7 + vec2(-t * 0.7, t * 0.5) + 17.0 - par);

  // Remap so every cell always carries a dot — one that swells and
  // shrinks with the flow field rather than blinking in and out. The
  // wide range makes the dots visibly grow and shrink, and where the two
  // screens' big and small dots overlap the moiré bands bloom.
  covA = mix(0.08, 1.0, smoothstep(0.12, 0.88, covA));
  covB = mix(0.08, 1.0, smoothstep(0.12, 0.88, covB));

  float a = screen(gl_FragCoord.xy, 0.2618, uCell, covA);       // ~15°
  float b = screen(gl_FragCoord.xy, 1.3090, uCell * 1.07, covB); // ~75°

  vec3 col = uInkA * a + uInkB * b;
  float alpha = max(a, b) * uOpacity;

  gl_FragColor = vec4(col, alpha);
}
`;

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function compile(gl, type, src) {
  const sh = gl.createShader(type);
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    console.warn('Halftone shader failed:', gl.getShaderInfoLog(sh));
    gl.deleteShader(sh);
    return null;
  }
  return sh;
}

const hexToRGB = hex => {
  const n = parseInt(hex.replace('#', ''), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};

export default function Halftone({
  inkA = '#ff4a32',
  inkB = '#5c86ff',
  opacity = 0.42,
  cell = 13
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', {
      alpha: true,
      antialias: false,
      premultipliedAlpha: false,
      powerPreference: 'low-power'
    });
    if (!gl) return; // No WebGL — the CSS board is a fine fallback.

    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;

    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.warn('Halftone link failed:', gl.getProgramInfoLog(prog));
      return;
    }
    gl.useProgram(prog);

    // One oversized triangle covering the clip volume.
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW
    );
    const aPos = gl.getAttribLocation(prog, 'aPos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const u = name => gl.getUniformLocation(prog, name);
    const uRes = u('uRes');
    const uTime = u('uTime');
    const uPointer = u('uPointer');
    const uOpacity = u('uOpacity');
    const uCell = u('uCell');

    gl.uniform3fv(u('uInkA'), hexToRGB(inkA));
    gl.uniform3fv(u('uInkB'), hexToRGB(inkB));
    gl.uniform1f(uOpacity, opacity);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    // Transparent clear — the CSS board shows through. Without clearing
    // each frame, alpha-blended draws stack on the previous frame and
    // saturate to white.
    gl.clearColor(0, 0, 0, 0);

    // Phones run at DPR 3 and are the most fill-rate constrained, so the
    // per-pixel shader is capped lower there to protect the frame rate
    // and the battery. The dot cell scales with dpr, so the halftone
    // looks the same size regardless.
    const dprCap = () => (window.innerWidth < 700 ? 1.5 : 2);
    let dpr = Math.min(window.devicePixelRatio || 1, dprCap());
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, dprCap());
      const w = Math.floor(canvas.clientWidth * dpr);
      const h = Math.floor(canvas.clientHeight * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uCell, cell * dpr);
    };
    resize();
    window.addEventListener('resize', resize);

    // Pointer parallax — smoothed, and only a gentle nudge to the field.
    const targetPtr = [0, 0];
    const ptr = [0, 0];
    const onMove = e => {
      targetPtr[0] = (e.clientX / window.innerWidth - 0.5) * 2;
      targetPtr[1] = -(e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('pointermove', onMove, { passive: true });

    const reduced = prefersReducedMotion();
    let raf = 0;
    let start = performance.now();
    let last = start;

    const frame = now => {
      // Clamp so a backgrounded tab doesn't fast-forward the flow.
      last = now;
      ptr[0] += (targetPtr[0] - ptr[0]) * 0.04;
      ptr[1] += (targetPtr[1] - ptr[1]) * 0.04;
      gl.uniform1f(uTime, (now - start) / 1000);
      gl.uniform2f(uPointer, ptr[0], ptr[1]);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      raf = requestAnimationFrame(frame);
    };

    if (reduced) {
      // A single static print — texture without motion.
      gl.uniform1f(uTime, 24);
      gl.uniform2f(uPointer, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    } else {
      raf = requestAnimationFrame(frame);
    }

    // Don't burn cycles on a hidden tab.
    const onVisibility = () => {
      if (reduced) return;
      if (document.hidden) {
        cancelAnimationFrame(raf);
        raf = 0;
      } else if (!raf) {
        // Resume where we left off rather than jumping the clock.
        const gap = performance.now() - last;
        start += gap;
        raf = requestAnimationFrame(frame);
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    // If the GPU drops the context, stop rather than throw.
    const onLost = e => {
      e.preventDefault();
      cancelAnimationFrame(raf);
      raf = 0;
    };
    canvas.addEventListener('webglcontextlost', onLost);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('visibilitychange', onVisibility);
      canvas.removeEventListener('webglcontextlost', onLost);
      // Deliberately NOT calling loseContext() here. getContext returns
      // the same context for a given canvas, and StrictMode remounts the
      // effect on the same element — forcibly losing the context would
      // leave that second mount with a dead context that can't compile.
    };
  }, [inkA, inkB, opacity, cell]);

  return <canvas ref={canvasRef} className="halftone-canvas" aria-hidden="true" />;
}
