"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Ciel étoilé custom : 3 couches de Points (tailles/teintes différentes)
 * sur un dôme lointain, hors fog, avec twinkle doux par couche.
 */

const LAYERS = [
  { count: 420, size: 1.6, color: "#fafaf9", speed: 0.9, seed: 11 },
  { count: 240, size: 2.6, color: "#b8c5d6", speed: 0.55, seed: 22 },
  { count: 90, size: 3.8, color: "#ffe9c4", speed: 0.35, seed: 33 },
] as const;

function makeDome(count: number, seed: number): Float32Array {
  let s = seed;
  const rnd = () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const arr = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const theta = rnd() * Math.PI * 2;
    // biais vers le haut du dôme
    const phi = Math.acos(0.12 + rnd() * 0.85);
    const r = 180 + rnd() * 70;
    arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    arr[i * 3 + 1] = r * Math.cos(phi);
    arr[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
  }
  return arr;
}

function StarLayer({
  layer,
  animate,
}: {
  layer: (typeof LAYERS)[number];
  animate: boolean;
}) {
  const matRef = useRef<THREE.PointsMaterial>(null);
  const positions = useMemo(
    () => makeDome(layer.count, layer.seed),
    [layer.count, layer.seed]
  );

  useFrame(({ clock }) => {
    if (!matRef.current || !animate) return;
    const t = clock.getElapsedTime();
    matRef.current.opacity =
      0.62 + 0.38 * Math.sin(t * layer.speed + layer.seed);
  });

  return (
    <points raycast={() => null} renderOrder={-1}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        ref={matRef}
        color={layer.color}
        size={layer.size}
        sizeAttenuation={false}
        transparent
        opacity={0.9}
        fog={false}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export default function Stars({ animate = true }: { animate?: boolean }) {
  return (
    <group>
      {LAYERS.map((l) => (
        <StarLayer key={l.seed} layer={l} animate={animate} />
      ))}
    </group>
  );
}
