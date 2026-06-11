"use client";

import { Noise } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";

/**
 * Grain animé post-processing : Noise recalculé chaque frame
 * (le shader Noise de postprocessing dépend du temps de l'EffectComposer,
 * pas d'un seed fixe), blend OVERLAY, intensity 0.06–0.08.
 * À utiliser comme enfant d'EffectComposer.
 */
export default function GrainEffect({
  intensity = 0.07,
}: {
  intensity?: number;
}) {
  return (
    <Noise
      premultiply={false}
      blendFunction={BlendFunction.OVERLAY}
      opacity={intensity}
    />
  );
}
