"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { SCENE } from "./palette";

/**
 * Lucioles : points additifs ambre flottant autour du village.
 * Flottement vertical sinusoïdal + dérive orbitale lente + twinkle global.
 * Le bloom leur donne leur halo.
 */

type Firefly = {
  r: number;
  a: number;
  h: number;
  speed: number;
  bob: number;
  phase: number;
};

function makeFireflies(count: number, seed: number): Firefly[] {
  let s = seed;
  const rnd = () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return Array.from({ length: count }, () => ({
    r: 4 + rnd() * 26,
    a: rnd() * Math.PI * 2,
    h: 0.6 + rnd() * 4,
    speed: (rnd() - 0.5) * 0.16,
    bob: 0.5 + rnd() * 1.2,
    phase: rnd() * Math.PI * 2,
  }));
}

export default function Fireflies3D({
  count = 80,
  animate = true,
}: {
  count?: number;
  animate?: boolean;
}) {
  const pointsRef = useRef<THREE.Points>(null);
  const matRef = useRef<THREE.PointsMaterial>(null);

  const flies = useMemo(() => makeFireflies(count, 555), [count]);
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    flies.forEach((f, i) => {
      arr[i * 3] = Math.cos(f.a) * f.r;
      arr[i * 3 + 1] = f.h;
      arr[i * 3 + 2] = Math.sin(f.a) * f.r;
    });
    return arr;
  }, [flies, count]);

  useFrame(({ clock }) => {
    if (!pointsRef.current || !animate) return;
    const t = clock.getElapsedTime();
    const pos = pointsRef.current.geometry.attributes.position;
    for (let i = 0; i < flies.length; i++) {
      const f = flies[i];
      const a = f.a + t * f.speed;
      pos.setXYZ(
        i,
        Math.cos(a) * f.r,
        f.h + Math.sin(t * f.bob + f.phase) * 0.45,
        Math.sin(a) * f.r
      );
    }
    pos.needsUpdate = true;
    if (matRef.current) {
      matRef.current.opacity = 0.75 + 0.25 * Math.sin(t * 2.1);
    }
  });

  return (
    <points ref={pointsRef} raycast={() => null}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        ref={matRef}
        color={SCENE.amber}
        size={0.28}
        sizeAttenuation
        transparent
        opacity={0.9}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
