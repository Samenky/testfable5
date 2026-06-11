"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Clone, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { SCENE } from "./palette";

/**
 * Maison du village : GLB cloné (géométries partagées) + fenêtres émissives
 * à croisillons posées sur les façades + micro-interaction au survol
 * (léger gonflement élastique). Les fenêtres s'enregistrent auprès du
 * gestionnaire de lumières du Village.
 */

export type WindowSpec = {
  /** position en unités modèle (avant scale) */
  p: [number, number, number];
  rotY?: number;
};

export type RegisterWindow = (
  mat: THREE.MeshStandardMaterial,
  obj: THREE.Object3D,
  permanent: boolean
) => () => void;

function WindowPane({
  spec,
  permanent,
  register,
}: {
  spec: WindowSpec;
  permanent: boolean;
  register?: RegisterWindow;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const mat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#1c1610",
        emissive: SCENE.amber,
        emissiveIntensity: permanent ? 2.5 : 0,
        side: THREE.DoubleSide,
      }),
    [permanent]
  );

  useEffect(() => {
    if (!register || !meshRef.current) return;
    return register(mat, meshRef.current, permanent);
  }, [register, mat, permanent]);

  return (
    <group position={spec.p} rotation={[0, spec.rotY ?? 0, 0]}>
      <mesh ref={meshRef} material={mat} raycast={() => null}>
        <planeGeometry args={[0.09, 0.12]} />
      </mesh>
      {/* croisillons : 4 carreaux */}
      <mesh position={[0, 0, 0.002]} raycast={() => null}>
        <planeGeometry args={[0.012, 0.12]} />
        <meshBasicMaterial color="#181410" side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0, 0.002]} raycast={() => null}>
        <planeGeometry args={[0.09, 0.012]} />
        <meshBasicMaterial color="#181410" side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

type HouseProps = {
  src: string;
  position?: [number, number, number];
  rotationY?: number;
  scale?: number;
  windows?: WindowSpec[];
  /** true = tour Rial Estate : fenêtres toujours allumées */
  permanentLit?: boolean;
  registerWindow?: RegisterWindow;
  /** désactive l'interaction hover (bâtiments d'arrière-plan) */
  interactive?: boolean;
};

export default function House({
  src,
  position = [0, 0, 0],
  rotationY = 0,
  scale = 7,
  windows = [],
  permanentLit = false,
  registerWindow,
  interactive = true,
}: HouseProps) {
  const { scene } = useGLTF(src);
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((_, delta) => {
    if (!groupRef.current || !interactive) return;
    const k = 1 - Math.exp(-delta * 7);
    const t = hovered ? scale * 1.06 : scale;
    const s = groupRef.current.scale;
    s.x += (t - s.x) * k;
    s.y += (t - s.y) * k;
    s.z += (t - s.z) * k;
  });

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={[0, rotationY, 0]}
      scale={scale}
      onPointerOver={
        interactive
          ? (e) => {
              e.stopPropagation();
              setHovered(true);
            }
          : undefined
      }
      onPointerOut={interactive ? () => setHovered(false) : undefined}
    >
      <Clone object={scene} />
      {windows.map((w, i) => (
        <WindowPane
          key={i}
          spec={w}
          permanent={permanentLit}
          register={registerWindow}
        />
      ))}
    </group>
  );
}
