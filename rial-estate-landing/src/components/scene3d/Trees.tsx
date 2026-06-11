"use client";

import { useEffect, useMemo, useRef } from "react";
import { Clone, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Forêt environnante : anneau d'arbres (plus dense vers l'extérieur),
 * bouquets, collines et montagnes en silhouette au loin.
 * Balancement doux dans le vent (rotation Z sinusoïdale par arbre).
 */

type TreeSpec = {
  src: string;
  pos: [number, number, number];
  scale: number;
  rotY: number;
  phase: number;
  sway: number;
};

function makeForest(): TreeSpec[] {
  let s = 777;
  const rnd = () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const trees: TreeSpec[] = [];
  const singles = ["/models/tree-1.glb", "/models/tree-2.glb"];
  // anneau d'arbres isolés
  for (let i = 0; i < 30; i++) {
    const a = rnd() * Math.PI * 2;
    const r = 19 + rnd() * 18 + (rnd() < 0.5 ? rnd() * 4 : 0);
    trees.push({
      src: singles[Math.floor(rnd() * 2)],
      pos: [Math.cos(a) * r, 0, Math.sin(a) * r],
      scale: 4.5 + rnd() * 3.5,
      rotY: rnd() * Math.PI * 2,
      phase: rnd() * Math.PI * 2,
      sway: 0.015 + rnd() * 0.012,
    });
  }
  // bouquets denses
  const clusters = ["/models/trees-cluster-1.glb", "/models/trees-cluster-2.glb"];
  for (let i = 0; i < 7; i++) {
    const a = rnd() * Math.PI * 2;
    const r = 26 + rnd() * 14;
    trees.push({
      src: clusters[i % 2],
      pos: [Math.cos(a) * r, 0, Math.sin(a) * r],
      scale: 6 + rnd() * 3,
      rotY: rnd() * Math.PI * 2,
      phase: rnd() * Math.PI * 2,
      sway: 0.01,
    });
  }
  return trees;
}

const FOREST = makeForest();

const BACKDROP: { src: string; pos: [number, number, number]; scale: number; rotY: number }[] = [
  { src: "/models/hill.glb", pos: [-44, -2, -38], scale: 26, rotY: 0.5 },
  { src: "/models/hill.glb", pos: [50, -2.5, -34], scale: 22, rotY: 2.1 },
  { src: "/models/mountain.glb", pos: [-14, -1, -64], scale: 24, rotY: 0.9 },
  { src: "/models/mountain.glb", pos: [34, -1, -58], scale: 18, rotY: 2.6 },
  { src: "/models/hill.glb", pos: [12, -1.5, -50], scale: 20, rotY: 4.2 },
];

function Tree({ spec, animate }: { spec: TreeSpec; animate: boolean }) {
  const { scene } = useGLTF(spec.src);
  const ref = useRef<THREE.Group>(null);

  useEffect(() => {
    ref.current?.traverse((o) => {
      o.raycast = () => null;
    });
  }, []);

  useFrame(({ clock }) => {
    if (!ref.current || !animate) return;
    ref.current.rotation.z =
      Math.sin(clock.getElapsedTime() * 0.8 + spec.phase) * spec.sway;
  });

  return (
    <group
      ref={ref}
      position={spec.pos}
      rotation={[0, spec.rotY, 0]}
      scale={spec.scale}
    >
      <Clone object={scene} />
    </group>
  );
}

function Backdrop({ spec }: { spec: (typeof BACKDROP)[number] }) {
  const { scene } = useGLTF(spec.src);
  const ref = useRef<THREE.Group>(null);
  useEffect(() => {
    ref.current?.traverse((o) => {
      o.raycast = () => null;
    });
  }, []);
  return (
    <group ref={ref} position={spec.pos} rotation={[0, spec.rotY, 0]} scale={spec.scale}>
      <Clone object={scene} />
    </group>
  );
}

export default function Trees({
  animate = true,
  reduced = false,
}: {
  animate?: boolean;
  reduced?: boolean;
}) {
  const forest = useMemo(
    () => (reduced ? FOREST.filter((_, i) => i % 2 === 0) : FOREST),
    [reduced]
  );
  return (
    <group>
      {forest.map((t, i) => (
        <Tree key={i} spec={t} animate={animate} />
      ))}
      {BACKDROP.map((b, i) => (
        <Backdrop key={i} spec={b} />
      ))}
    </group>
  );
}
