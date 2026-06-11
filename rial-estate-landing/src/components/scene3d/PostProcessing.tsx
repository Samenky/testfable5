"use client";

import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";

/**
 * Post-processing cinématique : bloom (fenêtres, lune, lucioles) + vignette.
 * Désactivé sur mobile (le parent ne le monte pas).
 */
export default function PostProcessing() {
  return (
    <EffectComposer>
      <Bloom
        luminanceThreshold={0.4}
        intensity={0.8}
        mipmapBlur
        radius={0.6}
      />
      <Vignette eskil={false} offset={0.3} darkness={0.7} />
    </EffectComposer>
  );
}
