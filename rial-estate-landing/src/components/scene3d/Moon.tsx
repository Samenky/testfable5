"use client";

import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { SCENE } from "./palette";

/**
 * Lune pleine 3D : sphère shadée (terminateur visible) + cratères en relief
 * + double halo additif. Réagit au survol du curseur (léger gonflement,
 * halo qui s'intensifie). Source de lumière principale de la scène.
 */

const CRATERS: { dir: [number, number, number]; r: number }[] = [
  { dir: [0.35, 0.4, 0.85], r: 1.15 },
  { dir: [-0.45, 0.15, 0.88], r: 0.8 },
  { dir: [0.1, -0.42, 0.9], r: 1.0 },
  { dir: [-0.2, 0.65, 0.72], r: 0.55 },
  { dir: [0.62, -0.1, 0.78], r: 0.6 },
  { dir: [-0.55, -0.45, 0.7], r: 0.7 },
];

const MOON_R = 6;

export default function Moon() {
  const groupRef = useRef<THREE.Group>(null);
  const haloRef = useRef<THREE.MeshBasicMaterial>(null);
  const halo2Ref = useRef<THREE.MeshBasicMaterial>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((_, delta) => {
    const g = groupRef.current;
    if (!g) return;
    const k = 1 - Math.exp(-delta * 6);
    const target = hovered ? 1.05 : 1;
    g.scale.lerp(new THREE.Vector3(target, target, target), k);
    if (haloRef.current) {
      haloRef.current.opacity +=
        ((hovered ? 0.3 : 0.18) - haloRef.current.opacity) * k;
    }
    if (halo2Ref.current) {
      halo2Ref.current.opacity +=
        ((hovered ? 0.13 : 0.07) - halo2Ref.current.opacity) * k;
    }
    // rotation imperceptible : la lune vit
    g.rotation.y += delta * 0.01;
  });

  return (
    <group
      ref={groupRef}
      position={[27, 22, -50]}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* corps : matériau shadé → vraie sphère 3D, pas un disque */}
      <mesh>
        <sphereGeometry args={[MOON_R, 48, 48]} />
        <meshStandardMaterial
          color="#e8e6da"
          emissive="#cdc9b6"
          emissiveIntensity={0.6}
          roughness={1}
          fog={false}
        />
      </mesh>
      {/* cratères : calottes légèrement plus sombres en relief */}
      {CRATERS.map((c, i) => {
        const d = new THREE.Vector3(...c.dir).normalize();
        const p = d.clone().multiplyScalar(MOON_R - c.r * 0.55);
        return (
          <mesh key={i} position={p.toArray() as [number, number, number]}>
            <sphereGeometry args={[c.r, 20, 20]} />
            <meshStandardMaterial
              color="#d2cebb"
              emissive="#b3ae98"
              emissiveIntensity={0.5}
              roughness={1}
              fog={false}
            />
          </mesh>
        );
      })}
      {/* halos additifs */}
      <mesh raycast={() => null}>
        <sphereGeometry args={[MOON_R * 1.28, 32, 32]} />
        <meshBasicMaterial
          ref={haloRef}
          color={SCENE.moonlight}
          fog={false}
          transparent
          opacity={0.18}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <mesh raycast={() => null}>
        <sphereGeometry args={[MOON_R * 1.7, 32, 32]} />
        <meshBasicMaterial
          ref={halo2Ref}
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
