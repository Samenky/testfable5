/**
 * Shader light-trails — ÉTAPE 1.
 * Uniforms exposés (réglables sans toucher au GLSL) :
 * vitesse, densité des trails, couleurs, intensité brouillard.
 *
 * STUB ÉTAPE 0 : structure + types seulement, GLSL écrit à l'ÉTAPE 1
 * après validation du CHECKPOINT 0.5 (memo remix.run).
 */

export type LightTrailsUniforms = {
  uTime: { value: number };
  /** Vitesse de défilement des trails, unités/seconde (spec : 0.4–0.6 u/frame équiv.) */
  uSpeed: { value: number };
  /** Nombre de trails actives (6–10). */
  uTrailCount: { value: number };
  /** 0–1 : intensité globale (le CTA final réutilise le canvas en "low"). */
  uIntensity: { value: number };
  uColorTailLights: { value: [number, number, number] }; // #FF3B47
  uColorHeadLights: { value: [number, number, number] }; // #FFF2D6
  uColorSkyTop: { value: [number, number, number] }; // #0A0E1A
  uColorHorizon: { value: [number, number, number] }; // #1F1A2E
  uResolution: { value: [number, number] };
};

export function createLightTrailsUniforms(
  intensity: "full" | "low" = "full"
): LightTrailsUniforms {
  return {
    uTime: { value: 0 },
    uSpeed: { value: 0.5 },
    uTrailCount: { value: 8 },
    uIntensity: { value: intensity === "full" ? 1 : 0.45 },
    uColorTailLights: { value: [1, 0.231, 0.278] },
    uColorHeadLights: { value: [1, 0.949, 0.839] },
    uColorSkyTop: { value: [0.039, 0.055, 0.102] },
    uColorHorizon: { value: [0.122, 0.102, 0.18] },
    uResolution: { value: [1, 1] },
  };
}

export const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// ÉTAPE 1 — fragment shader complet (sol mouillé, trails, brouillard, skybox).
export const fragmentShader = /* glsl */ `
  varying vec2 vUv;
  uniform vec3 uColorSkyTop;
  uniform vec3 uColorHorizon;
  void main() {
    vec3 color = mix(uColorHorizon, uColorSkyTop, smoothstep(0.0, 0.7, vUv.y));
    gl_FragColor = vec4(color, 1.0);
  }
`;
