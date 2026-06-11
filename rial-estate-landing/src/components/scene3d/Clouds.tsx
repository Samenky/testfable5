"use client";

import { useMemo, useRef, useState } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { SCENE } from "./palette";

/**
 * Nuages stylisés GLB, teintés nuit, dérive horizontale très lente avec
 * wrap-around. Au survol : petite ondulation + gonflement.
 */

const CLOUDS: {
  src: string;
  pos: [number, number, number];
  scale: number;
  speed: number;
}[] = [
  { src: "/models/cloud-1.glb", pos: [-30, 24, -38], scale: 5, speed: 0.35 },
  { src: "/models/cloud-2.glb", pos: [8, 28, -45], scale: 4, speed: 0.22 },
  { src: "/models/cloud-1.glb", pos: [35, 21, -30], scale: 3.6, speed: 0.28 },
  { src: "/models/cloud-2.glb", pos: [-12, 31, -25], scale: 4.6, speed: 0.18 },
  { src: "/models/cloud-1.glb", pos: [20, 34, -55], scale: 6, speed: 0.4 },
];

function CloudMesh({ spec }: { spec: (typeof CLOUDS)[number] }) {
  const { scene } = useGLTF(spec.src);
  const ref = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  // clone teinté nuit
  const tinted = useMemo(() => {
    const c = scene.clone(true);
    const mat = new THREE.MeshStandardMaterial({
      color: SCENE.cloud,
      emissive: SCENE.cloud,
      emissiveIntensity: 0.35,
      roughness: 1,
      flatShading: true,
    });
    c.traverse((o) => {
      if (o instanceof THREE.Mesh) o.material = mat;
    });
    return c;
  }, [scene]);

  useFrame(({ clock }, delta) => {
    const g = ref.current;
    if (!g) return;
    const t = clock.getElapsedTime();
    g.position.x += delta * spec.speed;
    if (g.position.x > 65) g.position.x = -65;
    // respiration ; amplifiée au survol
    const breathe = hovered ? 0.06 : 0.015;
    const target = spec.scale * (1 + Math.sin(t * 1.6 + spec.pos[1]) * breathe) * (hovered ? 1.07 : 1);
    const k = 1 - Math.exp(-delta * 5);
    g.scale.x += (target - g.scale.x) * k;
    g.scale.y += (target - g.scale.y) * k;
    g.scale.z += (target - g.scale.z) * k;
    g.position.y = spec.pos[1] + Math.sin(t * 0.4 + spec.pos[0]) * 0.4;
  });

  return (
    <group
      ref={ref}
      position={spec.pos}
      scale={spec.scale}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
    >
      <primitive object={tinted} />
    </group>
  );
}

export default function Clouds() {
  return (
    <group>
      {CLOUDS.map((c, i) => (
        <CloudMesh key={i} spec={c} />
      ))}
    </group>
  );
}
