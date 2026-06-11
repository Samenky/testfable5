"use client";

import { SCENE } from "./palette";

/**
 * Sol MVP : disque vert sombre désaturé. Remplacé/enrichi à l'étape 6
 * (île hexagonale, chemins, vallonnement) ; la brume basse vient du fog.
 */
export default function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
      <circleGeometry args={[120, 48]} />
      <meshStandardMaterial color={SCENE.ground} />
    </mesh>
  );
}
