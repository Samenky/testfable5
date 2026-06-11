"use client";

import * as THREE from "three";
import { SCENE } from "./palette";

/**
 * Lune pleine en haut à droite : sphère émissive + double halo additif.
 * C'est la source de lumière principale de la scène (directionnelle froide
 * alignée sur sa position, target = centre du village).
 */
export default function Moon() {
  return (
    <group position={[27, 22, -50]}>
      <mesh>
        <sphereGeometry args={[6, 32, 32]} />
        <meshBasicMaterial color={SCENE.moon} toneMapped={false} fog={false} />
      </mesh>
      <mesh>
        <sphereGeometry args={[7.6, 32, 32]} />
        <meshBasicMaterial
          color={SCENE.moonlight}
          fog={false}
          transparent
          opacity={0.18}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[10, 32, 32]} />
        <meshBasicMaterial
          color={SCENE.moonlight}
          fog={false}
          transparent
          opacity={0.07}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      {/* lumière principale : lune froide (target par défaut = origine) */}
      <directionalLight color={SCENE.moonlight} intensity={2.4} />
    </group>
  );
}
