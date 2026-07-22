import { useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';

/* ------------------------------------------------------------
   Simplex noise (Ashima) — drives the terrain displacement.
   ------------------------------------------------------------ */
const simplexNoise = /* glsl */ `
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
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

  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

// Three octaves, not four. This runs per-vertex every frame on the
// terrain mesh, and the fourth octave costs more than it reads at
// the scale the surface is actually displayed.
float fbm(vec3 p) {
  float sum = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 3; i++) {
    sum += snoise(p) * amp;
    p *= 2.03;
    amp *= 0.5;
  }
  return sum;
}
`;

/* ============================================================
   TERRAIN
   A wide wireframe plane deformed by noise, laid flat and
   receding toward a horizon. Line art rather than a surface —
   it reads as present without ever fighting the type above it.
   ============================================================ */
const terrainVertex = /* glsl */ `
uniform float uTime;
uniform float uAmplitude;

varying float vFade;
varying float vHeight;

${simplexNoise}

void main() {
  vec3 p = position;

  // The plane is rotated flat, so local +Z becomes world height.
  float h = fbm(vec3(p.x * 0.032, p.y * 0.032, uTime * 0.045));
  p.z += h * uAmplitude;

  vHeight = h;

  vec4 mv = modelViewMatrix * vec4(p, 1.0);

  // Fade the far edge into the dark so the plane never resolves
  // into a visible rectangle.
  vFade = (1.0 - smoothstep(26.0, 96.0, -mv.z)) * smoothstep(4.0, 20.0, -mv.z);

  gl_Position = projectionMatrix * mv;
}
`;

const terrainFragment = /* glsl */ `
uniform vec3 uColor;
uniform vec3 uAccent;

varying float vFade;
varying float vHeight;

void main() {
  // Ridges catch a little accent; troughs stay neutral.
  float lit = clamp(vHeight * 0.5 + 0.5, 0.0, 1.0);
  vec3 color = mix(uColor, uAccent, pow(lit, 2.0) * 0.55);

  gl_FragColor = vec4(color, vFade * 0.30);
}
`;

function Terrain({ color, accent }) {
  const matRef = useRef();
  const meshRef = useRef();

  useFrame((state, delta) => {
    if (matRef.current) {
      matRef.current.uniforms.uTime.value += Math.min(delta, 0.05);
    }
    // Gentle cursor parallax — the surface leans as you move.
    const mesh = meshRef.current;
    if (mesh) {
      mesh.rotation.z = THREE.MathUtils.lerp(
        mesh.rotation.z,
        state.pointer.x * 0.05,
        0.03
      );
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={[0, -13, -18]}
      rotation={[-Math.PI / 2.15, 0, 0]}
    >
      <planeGeometry args={[130, 110, 52, 44]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={terrainVertex}
        fragmentShader={terrainFragment}
        uniforms={{
          uTime: { value: 0 },
          uAmplitude: { value: 7.0 },
          uColor: { value: new THREE.Color(color) },
          uAccent: { value: new THREE.Color(accent) }
        }}
        wireframe
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}

/* ============================================================
   SOLID
   A low-poly wireframe form turning slowly off to one side.
   It's the thing you notice in the frame — the anchor the
   terrain reads against — but it's still only thin lines.
   ============================================================ */
const solidVertex = /* glsl */ `
varying vec3 vLocal;

void main() {
  vLocal = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const solidFragment = /* glsl */ `
uniform vec3 uColor;
uniform vec3 uAccent;
uniform float uOpacity;

varying vec3 vLocal;

void main() {
  // Grade the edges top-to-bottom so the form has some direction
  // to it rather than reading as a flat uniform cage.
  float t = clamp(vLocal.y / 9.0 * 0.5 + 0.5, 0.0, 1.0);
  vec3 color = mix(uColor, uAccent, pow(t, 1.6) * 0.7);

  gl_FragColor = vec4(color, uOpacity);
}
`;

function Solid({ color, accent }) {
  const meshRef = useRef();

  useFrame((state, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const d = Math.min(delta, 0.05);
    mesh.rotation.y += d * 0.09;
    mesh.rotation.x += d * 0.035;

    // Drifts slightly against the cursor, one layer of depth
    // apart from the terrain.
    mesh.position.x = THREE.MathUtils.lerp(
      mesh.position.x,
      17 - state.pointer.x * 1.6,
      0.03
    );
    mesh.position.y = THREE.MathUtils.lerp(
      mesh.position.y,
      3.5 - state.pointer.y * 1.2,
      0.03
    );
  });

  return (
    <mesh ref={meshRef} position={[17, 3.5, -26]}>
      <icosahedronGeometry args={[9, 1]} />
      <shaderMaterial
        vertexShader={solidVertex}
        fragmentShader={solidFragment}
        uniforms={{
          uColor: { value: new THREE.Color(color) },
          uAccent: { value: new THREE.Color(accent) },
          uOpacity: { value: 0.5 }
        }}
        wireframe
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}

/* ============================================================
   DUST
   Sparse motes for depth between the two forms.
   ============================================================ */
const dustVertex = /* glsl */ `
uniform float uTime;
uniform vec3  uMouse;
uniform float uMouseRadius;
uniform float uMouseStrength;
uniform float uSize;
uniform float uPixelRatio;

attribute float aSeed;
attribute float aScale;

varying float vAlpha;

void main() {
  vec3 pos = position;

  pos.x += sin(uTime * 0.18 + aSeed * 6.2831) * 1.4;
  pos.y += cos(uTime * 0.13 + aSeed * 4.7123) * 1.1;

  vec3 toMouse = pos - uMouse;
  float dist = length(toMouse.xy);
  float influence = 1.0 - smoothstep(0.0, uMouseRadius, dist);
  pos.xy += normalize(toMouse.xy + 1e-6) * influence * uMouseStrength;

  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = uSize * aScale * uPixelRatio * (14.0 / -mv.z);

  float depthFade = smoothstep(-46.0, -10.0, mv.z);
  float twinkle = 0.6 + 0.4 * sin(uTime * 0.7 + aSeed * 12.566);
  vAlpha = depthFade * twinkle;
}
`;

const dustFragment = /* glsl */ `
uniform vec3 uColor;

varying float vAlpha;

void main() {
  float d = length(gl_PointCoord - vec2(0.5));
  if (d > 0.5) discard;
  float falloff = smoothstep(0.5, 0.0, d);
  gl_FragColor = vec4(uColor, falloff * vAlpha * 0.45);
}
`;

function buildDust(count) {
  const positions = new Float32Array(count * 3);
  const seeds = new Float32Array(count);
  const scales = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    positions[i * 3 + 0] = (Math.random() - 0.5) * 78;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 44;
    positions[i * 3 + 2] = -8 - Math.random() * 28;

    seeds[i] = Math.random();
    scales[i] = 0.3 + Math.pow(Math.random(), 3) * 1.6;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));
  geometry.setAttribute('aScale', new THREE.BufferAttribute(scales, 1));

  return geometry;
}

/**
 * Dust positions are randomised, so building them inline during render
 * would be impure — an unrelated re-render could reshuffle the field.
 * Memoising at module scope makes this idempotent: randomness is drawn
 * once per count, and every later render gets identical buffers back.
 * There is one scene for the life of the document, so this cache holding
 * its geometry is the intended lifetime, not a leak.
 */
const dustCache = new Map();

function getDust(count) {
  let geo = dustCache.get(count);
  if (!geo) {
    geo = buildDust(count);
    dustCache.set(count, geo);
  }
  return geo;
}

function Dust({ count, color }) {
  const matRef = useRef();
  const geometry = getDust(count);

  const target = useRef(new THREE.Vector3(0, 0, -20));
  const smoothed = useRef(new THREE.Vector3(0, 0, -20));

  useFrame((state, delta) => {
    const mat = matRef.current;
    if (!mat) return;

    mat.uniforms.uTime.value += Math.min(delta, 0.05);
    mat.uniforms.uPixelRatio.value = state.gl.getPixelRatio();

    target.current.set(state.pointer.x * 34, state.pointer.y * 20, -20);
    smoothed.current.lerp(target.current, 0.06);
    mat.uniforms.uMouse.value.copy(smoothed.current);
  });

  return (
    <points geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={matRef}
        vertexShader={dustVertex}
        fragmentShader={dustFragment}
        uniforms={{
          uTime: { value: 0 },
          uMouse: { value: new THREE.Vector3(0, 0, -20) },
          uMouseRadius: { value: 9.0 },
          uMouseStrength: { value: 2.2 },
          uSize: { value: 4.4 },
          uPixelRatio: { value: 1 },
          uColor: { value: new THREE.Color(color) }
        }}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export default function HeroScene({
  dustCount = 2200,
  lineColor = '#6a6862',
  dustColor = '#6e6c66',
  accent = '#d8a24a',
  paused = false
}) {
  return (
    <Canvas
      className="hero-scene-canvas"
      // Capped at 1.5 rather than 2: this is an out-of-focus backdrop of
      // thin lines, and the full retina buffer costs roughly twice the
      // fill for detail nobody is looking at.
      dpr={[1, 1.5]}
      frameloop={paused ? 'never' : 'always'}
      // MSAA is redundant here — the bloom pass softens the line edges
      // anyway, and multisampling a full-screen buffer is not cheap.
      gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
      camera={{ position: [0, 0, 18], fov: 55, near: 0.1, far: 140 }}
    >
      <Terrain color={lineColor} accent={accent} />
      <Solid color={lineColor} accent={accent} />
      <Dust count={dustCount} color={dustColor} />
      <EffectComposer
        // Half-resolution bloom. On a soft glow this is visually
        // indistinguishable from full-res and markedly cheaper.
        resolutionScale={0.5}
        multisampling={0}
      >
        <Bloom
          intensity={0.55}
          luminanceThreshold={0.2}
          luminanceSmoothing={0.6}
          mipmapBlur
        />
      </EffectComposer>
    </Canvas>
  );
}
