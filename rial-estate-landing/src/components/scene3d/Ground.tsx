"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { SCENE } from "./palette";

/**
 * Terrain : grand disque légèrement vallonné (flat shading), plus marqué
 * vers les bords ; la brume nocturne (fog) avale l'horizon.
 */
export default function Ground() {
  const geometry = useMemo(() => {
    const geo = new THREE.CircleGeometry(85, 72, 0, Math.PI * 2);
    geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const r = Math.hypot(x, z);
      // centre plat (village), ondulations qui montent vers les bords
      const edge = Math.max(0, (r - 22) / 60);
      const y =
        Math.sin(x * 0.18) * Math.cos(z * 0.15) * 0.5 * edge +
        Math.sin(x * 0.05 + z * 0.07) * 1.6 * edge;
      pos.setY(i, y);
    }
    geo.computeVertexNormals();
    return geo;
  }, []);

  return (
    <mesh geometry={geometry} position={[0, -0.02, 0]} raycast={() => null}>
      <meshStandardMaterial color={SCENE.ground} flatShading roughness={1} />
    </mesh>
  );
}
