import * as THREE from "three";

/**
 * Shader light-trails — fragment full-screen single-pass :
 * sol perspective (y → 1/z), trails = fonctions de distance animées par
 * uTime, courbure en S subtile, brouillard exponentiel, skybox radiale.
 *
 * uTime avance au raf, JAMAIS lié au scroll. Le scroll ne pilote que
 * uCameraTilt et uScrollVignette.
 */

/** Réglages exposés au dev panel Leva (et au code appelant). */
export type TrailSettings = {
  trailSpeed: number;
  trailCount: number;
  trailLength: number;
  trailGlow: number;
  horizonY: number;
  fogDensity: number;
  curveAmp: number;
  grainIntensity: number;
  bloomIntensity: number;
  bloomThreshold: number;
};

export const TRAIL_DEFAULTS: TrailSettings = {
  trailSpeed: 0.5,
  trailCount: 8,
  trailLength: 0.35,
  trailGlow: 1.2,
  horizonY: 0.55,
  fogDensity: 1.0,
  curveAmp: 0.06,
  grainIntensity: 0.07,
  bloomIntensity: 0.8,
  bloomThreshold: 0.6,
};

/** 4 feux arrière rouges (droite, s'éloignent) + 4 phares chauds (gauche, s'approchent). */
const TRAIL_COLORS: THREE.Color[] = [
  new THREE.Color("#fff2d6"),
  new THREE.Color("#ffe9c2"),
  new THREE.Color("#fff7e6"),
  new THREE.Color("#f5e3c0"),
  new THREE.Color("#ff3b47"),
  new THREE.Color("#ff5560"),
  new THREE.Color("#e83540"),
  new THREE.Color("#ff4750"),
];

export type LightTrailsUniforms = {
  uTime: { value: number };
  uTrailSpeed: { value: number };
  uTrailCount: { value: number };
  uTrailLength: { value: number };
  uTrailGlow: { value: number };
  uHorizonY: { value: number };
  uFogDensity: { value: number };
  uCurveAmp: { value: number };
  uCameraTilt: { value: number };
  uScrollVignette: { value: number };
  uIntensity: { value: number };
  uTrailColors: { value: THREE.Color[] };
  uColorSkyTop: { value: THREE.Color };
  uColorHorizon: { value: THREE.Color };
  uResolution: { value: THREE.Vector2 };
};

export function createLightTrailsUniforms(
  intensity: number = 1
): LightTrailsUniforms {
  return {
    uTime: { value: 0 },
    uTrailSpeed: { value: TRAIL_DEFAULTS.trailSpeed },
    uTrailCount: { value: TRAIL_DEFAULTS.trailCount },
    uTrailLength: { value: TRAIL_DEFAULTS.trailLength },
    uTrailGlow: { value: TRAIL_DEFAULTS.trailGlow },
    uHorizonY: { value: TRAIL_DEFAULTS.horizonY },
    uFogDensity: { value: TRAIL_DEFAULTS.fogDensity },
    uCurveAmp: { value: TRAIL_DEFAULTS.curveAmp },
    uCameraTilt: { value: 0 },
    uScrollVignette: { value: 0 },
    uIntensity: { value: intensity },
    uTrailColors: { value: TRAIL_COLORS.map((c) => c.clone()) },
    uColorSkyTop: { value: new THREE.Color("#0a0e1a") },
    uColorHorizon: { value: new THREE.Color("#1f1a2e") },
    uResolution: { value: new THREE.Vector2(1, 1) },
  };
}

/** Bypass caméra : le quad couvre tout l'écran quel que soit le viewport. */
export const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

export const fragmentShader = /* glsl */ `
  precision highp float;

  varying vec2 vUv;

  uniform float uTime;
  uniform float uTrailSpeed;
  uniform float uTrailLength;
  uniform float uTrailGlow;
  uniform float uHorizonY;
  uniform float uFogDensity;
  uniform float uCurveAmp;
  uniform float uCameraTilt;
  uniform float uScrollVignette;
  uniform float uIntensity;
  uniform int   uTrailCount;
  uniform vec3  uTrailColors[8];
  uniform vec3  uColorSkyTop;
  uniform vec3  uColorHorizon;
  uniform vec2  uResolution;

  float hash1(float n) {
    return fract(sin(n * 127.1) * 43758.5453123);
  }

  float hash2(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float vnoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash2(i), hash2(i + vec2(1.0, 0.0)), f.x),
      mix(hash2(i + vec2(0.0, 1.0)), hash2(i + vec2(1.0, 1.0)), f.x),
      f.y
    );
  }

  void main() {
    float aspect = uResolution.x / max(uResolution.y, 1.0);
    vec2 uv = vUv;
    float horizon = uHorizonY + uCameraTilt * 0.06;

    /* ---- SKYBOX radiale, centre décalé haut-gauche (0.4, 0.7) ---- */
    float skyDist = distance(
      vec2(uv.x * aspect, uv.y),
      vec2(0.4 * aspect, 0.7)
    );
    vec3 sky = mix(uColorHorizon, uColorSkyTop, smoothstep(0.08, 1.0, skyDist));
    /* lueur de ville sur la bande d'horizon */
    sky += vec3(0.16, 0.12, 0.18) * exp(-abs(uv.y - horizon) * 14.0) * uIntensity;

    vec3 color = sky;

    /* ---- SOL en perspective ---- */
    if (uv.y < horizon + 0.002) {
      float depth = max(horizon - uv.y, 1e-4);
      float z = 1.0 / (depth * 2.0);
      float x = (uv.x - 0.5) * aspect;
      float worldX = x * z;

      /* courbure en S — offset monde, déplacement écran borné par uCurveAmp */
      float roadOffset = uCurveAmp * 9.0 * sin(z * 0.12 + 1.7);
      float rx = worldX - roadOffset;

      /* asphalte : noise qui défile en Z (sensation de vitesse) */
      float gnoise = vnoise(vec2(rx * 1.6, z * 0.6 - uTime * uTrailSpeed * 5.0));
      vec3 ground = vec3(0.018, 0.024, 0.042) * (0.8 + gnoise * 0.5);

      /* accotements plus sombres au-delà de la chaussée */
      float onRoad = smoothstep(3.2, 2.4, abs(rx));
      ground *= mix(0.55, 1.0, onRoad);

      /* reflet humide diffus de la lueur d'horizon sur le proche */
      ground += vec3(0.05, 0.045, 0.07) * exp(-depth * 5.0) * 0.6 * uIntensity;

      /* ligne centrale pointillée qui défile */
      float dash = step(fract(z * 0.3 - uTime * uTrailSpeed * 1.4), 0.55);
      float lineMask = exp(-pow(rx / 0.045, 2.0));
      ground += vec3(0.45, 0.43, 0.36) * lineMask * dash * 0.3;

      /* ---- LIGHT TRAILS ---- */
      vec3 trails = vec3(0.0);
      for (int i = 0; i < 8; i++) {
        if (i >= uTrailCount) break;
        float fi = float(i);
        /* i 0-3 : phares à gauche (s'approchent), i 4-7 : feux à droite (s'éloignent) */
        float side = fi < 4.0 ? -1.0 : 1.0;
        float laneIdx = mod(fi, 4.0);
        float lane = side * (0.5 + laneIdx * 0.5 + hash1(fi * 3.7) * 0.2);
        /* variation de vitesse ±15% pour casser la régularité mécanique */
        float speedVar = 1.0 + (hash1(fi * 9.1) - 0.5) * 0.3;
        float phase = fract(
          z * 0.12
          - side * uTime * uTrailSpeed * speedVar * 0.8
          + hash1(fi * 5.3) * 10.0
        );
        /* paquet long-exposure + base continue (la traînée ne casse jamais) */
        float packet = smoothstep(0.0, 0.12, phase)
          * (1.0 - smoothstep(uTrailLength, uTrailLength + 0.18, phase));
        float longi = 0.3 + 0.7 * packet;
        float core = exp(-pow((rx - lane) / 0.06, 2.0));
        float halo = exp(-pow((rx - lane) / 0.45, 2.0)) * 0.3;
        float att = exp(-z * 0.04 * uFogDensity);
        trails += uTrailColors[i] * (core + halo) * longi * att;
      }
      trails *= uTrailGlow * uIntensity;

      /* brouillard exponentiel vers l'horizon */
      float fogF = 1.0 - exp(-uFogDensity * z * 0.09);
      vec3 fogColor = mix(uColorHorizon, uColorSkyTop, 0.35);
      vec3 groundFinal = mix(ground, fogColor, fogF) + trails;

      float groundMix = smoothstep(horizon + 0.002, horizon - 0.004, uv.y);
      color = mix(color, groundFinal, groundMix);
    }

    /* poussière en suspension qui défile */
    float dust = vnoise(uv * vec2(38.0, 26.0) + vec2(uTime * 0.4, uTime * 1.1));
    color += vec3(smoothstep(0.84, 0.98, dust)) * 0.025 * uIntensity;

    /* vignette de base + vignette scroll "tunnel" (bords seulement) */
    vec2 vc = (uv - 0.5) * vec2(aspect, 1.0);
    float vd = length(vc);
    color *= mix(0.82, 1.0, smoothstep(1.05, 0.4, vd));
    color *= 1.0 - uScrollVignette * smoothstep(0.35, 0.9, vd) * 0.85;

    /* intensité globale (CTA final en "low") */
    color *= mix(0.55, 1.0, uIntensity);

    gl_FragColor = vec4(color, 1.0);
  }
`;
