"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import type * as THREE from "three";
import GrainEffect from "@/components/three/GrainEffect";
import {
  createLightTrailsUniforms,
  vertexShader,
  fragmentShader,
  type LightTrailsUniforms,
  type TrailSettings,
} from "@/components/three/LightTrailsShader";

export type LightTrailsSceneProps = {
  settings: TrailSettings;
  /** 0–1, "low" pour le CTA final. */
  intensity: number;
  /** prefers-reduced-motion : une seule frame rendue puis figée. */
  frozen: boolean;
  /** Mobile : trails réduites, bloom coupé (budget perf). */
  degraded: boolean;
};

function uniformsOf(mat: THREE.ShaderMaterial): LightTrailsUniforms {
  return mat.uniforms as unknown as LightTrailsUniforms;
}

function TrailsQuad({
  settings,
  intensity,
  frozen,
  degraded,
}: LightTrailsSceneProps) {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const timeRef = useRef(0);
  const size = useThree((state) => state.size);

  // Matériau construit une seule fois (args stables) ; les uniforms sont
  // ensuite mutés via ref dans les callbacks (contrat Three.js), jamais
  // recréés → aucune recompilation du shader.
  const materialArgs = useMemo<[THREE.ShaderMaterialParameters]>(
    () => [
      {
        uniforms: createLightTrailsUniforms(),
        vertexShader,
        fragmentShader,
        depthTest: false,
        depthWrite: false,
      },
    ],
    []
  );

  useEffect(() => {
    if (!matRef.current) return;
    const u = uniformsOf(matRef.current);
    u.uTrailSpeed.value = settings.trailSpeed;
    u.uTrailCount.value = degraded
      ? Math.min(settings.trailCount, 4)
      : settings.trailCount;
    u.uTrailLength.value = settings.trailLength;
    u.uTrailGlow.value = settings.trailGlow;
    u.uHorizonY.value = settings.horizonY;
    u.uFogDensity.value = settings.fogDensity;
    u.uCurveAmp.value = settings.curveAmp;
    u.uIntensity.value = intensity;
  }, [settings, intensity, degraded]);

  useEffect(() => {
    if (!matRef.current) return;
    uniformsOf(matRef.current).uResolution.value.set(size.width, size.height);
  }, [size]);

  useFrame((_, delta) => {
    if (frozen || !matRef.current) return;
    // delta clampé : au retour d'onglet inactif, le raf reprend
    // sans saut de uTime → aucune saccade au refocus
    timeRef.current += Math.min(delta, 1 / 30);
    uniformsOf(matRef.current).uTime.value = timeRef.current;
  });

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial ref={matRef} args={materialArgs} />
    </mesh>
  );
}

export default function LightTrailsScene(props: LightTrailsSceneProps) {
  const { settings, frozen, degraded } = props;

  return (
    <Canvas
      dpr={[1, 1.5]}
      frameloop={frozen ? "demand" : "always"}
      gl={{ antialias: false, powerPreference: "high-performance" }}
      style={{ position: "absolute", inset: 0 }}
    >
      <TrailsQuad {...props} />
      <EffectComposer>
        {degraded ? (
          <GrainEffect intensity={settings.grainIntensity} />
        ) : (
          <>
            <Bloom
              luminanceThreshold={settings.bloomThreshold}
              intensity={settings.bloomIntensity}
              mipmapBlur
            />
            <GrainEffect intensity={settings.grainIntensity} />
          </>
        )}
      </EffectComposer>
    </Canvas>
  );
}
