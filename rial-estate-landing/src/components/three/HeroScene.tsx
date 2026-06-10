"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";

/**
 * Diorama low-poly « quartier flottant au crépuscule » — style everswap :
 * île flottante, maisons à toits pentus, fenêtres lumineuses, arbres,
 * nuages dérivants et lucioles. Rotation lente + flottement.
 */

const PALETTE = {
  grass: "#2e4a3d",
  grassLight: "#3a5c4a",
  earth: "#2b2624",
  wall: "#e8e4dc",
  wallAlt: "#d9d2c4",
  roof: "#9c5b49",
  roofAlt: "#56607a",
  window: "#ffb873",
  trunk: "#4a3b30",
  leaf: "#35543f",
  leafAlt: "#2e4a38",
  rock: "#5a5f6b",
  cloud: "#cfd4e0",
};

const FIREFLY_COUNT = 24;

// PRNG seedé : positions stables entre les rendus
const seededRandom = (() => {
  let seed = 4242;
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
})();

const FIREFLIES = Array.from({ length: FIREFLY_COUNT }, () => ({
  radius: 1.4 + seededRandom() * 1.6,
  angle: seededRandom() * Math.PI * 2,
  height: 0.3 + seededRandom() * 1.4,
  speed: 0.08 + seededRandom() * 0.18,
  bobSpeed: 0.6 + seededRandom() * 1.2,
  bobPhase: seededRandom() * Math.PI * 2,
}));

const FIREFLY_POSITIONS = new Float32Array(FIREFLY_COUNT * 3);

type HouseProps = {
  position: [number, number, number];
  rotation?: number;
  scale?: number;
  width?: number;
  depth?: number;
  height?: number;
  roofColor?: string;
  wallColor?: string;
};

function House({
  position,
  rotation = 0,
  scale = 1,
  width = 0.7,
  depth = 0.6,
  height = 0.5,
  roofColor = PALETTE.roof,
  wallColor = PALETTE.wall,
}: HouseProps) {
  const roofHeight = height * 0.75;
  // rayon du toit pyramidal pour couvrir l'emprise rectangulaire
  const roofRadius = (Math.max(width, depth) / 2) * Math.SQRT2 * 1.12;

  return (
    <group position={position} rotation={[0, rotation, 0]} scale={scale}>
      {/* murs */}
      <mesh position={[0, height / 2, 0]} castShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color={wallColor} flatShading />
      </mesh>
      {/* toit pyramidal */}
      <mesh position={[0, height + roofHeight / 2, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[roofRadius, roofHeight, 4]} />
        <meshStandardMaterial color={roofColor} flatShading />
      </mesh>
      {/* cheminée */}
      <mesh position={[width * 0.22, height + roofHeight * 0.7, -depth * 0.15]}>
        <boxGeometry args={[0.08, 0.18, 0.08]} />
        <meshStandardMaterial color={PALETTE.rock} flatShading />
      </mesh>
      {/* fenêtres lumineuses (face avant + pignon) */}
      {[-width * 0.22, width * 0.22].map((x) => (
        <mesh key={x} position={[x, height * 0.45, depth / 2 + 0.005]}>
          <boxGeometry args={[0.12, 0.14, 0.02]} />
          <meshStandardMaterial
            color={PALETTE.window}
            emissive={PALETTE.window}
            emissiveIntensity={2.2}
          />
        </mesh>
      ))}
      <mesh position={[width / 2 + 0.005, height * 0.5, 0]}>
        <boxGeometry args={[0.02, 0.13, 0.11]} />
        <meshStandardMaterial
          color={PALETTE.window}
          emissive={PALETTE.window}
          emissiveIntensity={2.2}
        />
      </mesh>
      {/* porte */}
      <mesh position={[0, height * 0.21, depth / 2 + 0.004]}>
        <boxGeometry args={[0.13, height * 0.42, 0.015]} />
        <meshStandardMaterial color={PALETTE.trunk} flatShading />
      </mesh>
    </group>
  );
}

type TreeProps = {
  position: [number, number, number];
  scale?: number;
  leafColor?: string;
};

function Tree({ position, scale = 1, leafColor = PALETTE.leaf }: TreeProps) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.14, 0]}>
        <cylinderGeometry args={[0.035, 0.05, 0.28, 5]} />
        <meshStandardMaterial color={PALETTE.trunk} flatShading />
      </mesh>
      <mesh position={[0, 0.42, 0]}>
        <icosahedronGeometry args={[0.22, 0]} />
        <meshStandardMaterial color={leafColor} flatShading />
      </mesh>
      <mesh position={[0.06, 0.62, 0.02]}>
        <icosahedronGeometry args={[0.15, 0]} />
        <meshStandardMaterial color={PALETTE.leafAlt} flatShading />
      </mesh>
    </group>
  );
}

function Rock({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <mesh position={position} scale={[scale, scale * 0.7, scale]}>
      <icosahedronGeometry args={[0.14, 0]} />
      <meshStandardMaterial color={PALETTE.rock} flatShading />
    </mesh>
  );
}

function Island() {
  return (
    <group>
      {/* plateau herbeux */}
      <mesh position={[0, -0.18, 0]}>
        <cylinderGeometry args={[2.35, 2.5, 0.36, 8]} />
        <meshStandardMaterial color={PALETTE.grass} flatShading />
      </mesh>
      {/* liseré d'herbe claire */}
      <mesh position={[0, -0.02, 0]}>
        <cylinderGeometry args={[2.34, 2.36, 0.05, 8]} />
        <meshStandardMaterial color={PALETTE.grassLight} flatShading />
      </mesh>
      {/* masse de terre flottante */}
      <mesh position={[0, -1.05, 0]} rotation={[Math.PI, Math.PI / 8, 0]}>
        <coneGeometry args={[2.48, 1.5, 8]} />
        <meshStandardMaterial color={PALETTE.earth} flatShading />
      </mesh>

      {/* le quartier */}
      <House position={[0.1, 0, -0.55]} rotation={0.25} scale={1.15} />
      <House
        position={[-1.25, 0, 0.45]}
        rotation={-0.55}
        scale={0.9}
        roofColor={PALETTE.roofAlt}
        wallColor={PALETTE.wallAlt}
      />
      <House position={[1.25, 0, 0.5]} rotation={0.85} scale={0.85} />
      <House
        position={[-0.15, 0, 1.15]}
        rotation={0.1}
        scale={0.65}
        roofColor={PALETTE.roofAlt}
      />

      <Tree position={[-1.85, 0, -0.7]} scale={1.1} />
      <Tree position={[1.65, 0, -1.0]} scale={0.95} leafColor={PALETTE.leafAlt} />
      <Tree position={[1.05, 0, 1.45]} scale={0.8} />
      <Tree position={[-1.55, 0, 1.35]} scale={0.85} leafColor={PALETTE.leafAlt} />
      <Tree position={[-0.85, 0, -1.5]} scale={0.7} />

      <Rock position={[0.7, 0.02, -1.45]} scale={1.2} />
      <Rock position={[-0.6, 0.02, 0.45]} scale={0.7} />
      <Rock position={[1.9, 0.02, 0.05]} scale={0.9} />

      {/* lampadaire sur la placette */}
      <group position={[0.55, 0, 0.25]}>
        <mesh position={[0, 0.3, 0]}>
          <cylinderGeometry args={[0.02, 0.03, 0.6, 5]} />
          <meshStandardMaterial color={PALETTE.rock} flatShading />
        </mesh>
        <mesh position={[0, 0.62, 0]}>
          <sphereGeometry args={[0.05, 8, 6]} />
          <meshStandardMaterial
            color={PALETTE.window}
            emissive={PALETTE.window}
            emissiveIntensity={3}
          />
        </mesh>
      </group>
    </group>
  );
}

function Cloud({
  radius,
  height,
  speed,
  phase,
  scale,
  animate,
}: {
  radius: number;
  height: number;
  speed: number;
  phase: number;
  scale: number;
  animate: boolean;
}) {
  const ref = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = animate ? clock.getElapsedTime() : 0;
    const angle = phase + t * speed;
    ref.current.position.set(
      Math.cos(angle) * radius,
      height + Math.sin(t * 0.5 + phase) * 0.08,
      Math.sin(angle) * radius
    );
  });

  return (
    <group ref={ref} scale={scale}>
      {[
        [0, 0, 0, 0.22],
        [0.24, -0.03, 0.05, 0.16],
        [-0.22, -0.04, -0.03, 0.14],
      ].map(([x, y, z, r], i) => (
        <mesh key={i} position={[x, y, z]}>
          <sphereGeometry args={[r, 7, 5]} />
          <meshStandardMaterial
            color={PALETTE.cloud}
            flatShading
            transparent
            opacity={0.85}
          />
        </mesh>
      ))}
    </group>
  );
}

function Fireflies({ animate }: { animate: boolean }) {
  const pointsRef = useRef<THREE.Points>(null);

  useFrame(({ clock }) => {
    if (!pointsRef.current) return;
    const t = animate ? clock.getElapsedTime() : 0;
    const pos = pointsRef.current.geometry.attributes.position;
    for (let i = 0; i < FIREFLY_COUNT; i++) {
      const f = FIREFLIES[i];
      const angle = f.angle + t * f.speed;
      pos.setXYZ(
        i,
        Math.cos(angle) * f.radius,
        f.height + Math.sin(t * f.bobSpeed + f.bobPhase) * 0.15,
        Math.sin(angle) * f.radius
      );
    }
    pos.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[FIREFLY_POSITIONS, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color={PALETTE.window}
        size={0.035}
        sizeAttenuation
        transparent
        opacity={0.9}
        depthWrite={false}
      />
    </points>
  );
}

function FloatingScene({ animate, simple }: { animate: boolean; simple: boolean }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current || !animate) return;
    const t = clock.getElapsedTime();
    groupRef.current.rotation.y += 0.0018;
    groupRef.current.position.y = Math.sin(t * 0.55) * 0.08;
  });

  return (
    <group ref={groupRef} rotation={[0, 0.6, 0]}>
      <Island />
      {!simple && <Fireflies animate={animate} />}
      {!simple && (
        <>
          <Cloud radius={3.1} height={1.7} speed={0.05} phase={0.4} scale={1.2} animate={animate} />
          <Cloud radius={3.5} height={2.3} speed={-0.04} phase={2.8} scale={0.9} animate={animate} />
          <Cloud radius={2.9} height={2.0} speed={0.06} phase={4.6} scale={0.7} animate={animate} />
        </>
      )}
    </group>
  );
}

type HeroSceneProps = {
  /** Mode simplifié (mobile) : pas de bloom, nuages ni lucioles */
  simple?: boolean;
  /** prefers-reduced-motion : rendu statique */
  reduced?: boolean;
};

export default function HeroScene({ simple = false, reduced = false }: HeroSceneProps) {
  const animate = !reduced;

  return (
    <Canvas
      camera={{ position: [0, 2.3, 6.4], fov: 38 }}
      dpr={[1, 2]}
      frameloop={animate ? "always" : "demand"}
      gl={{ antialias: true, alpha: true }}
      onCreated={({ camera }) => camera.lookAt(0, 0.35, 0)}
      aria-hidden="true"
    >
      {/* crépuscule : ciel bleuté, sol chaud */}
      <hemisphereLight args={["#8ea2ff", "#2b2624", 0.6]} />
      <directionalLight position={[4, 6, 3]} intensity={2.2} color="#ffe8d1" />
      <directionalLight position={[-5, 2, -4]} intensity={0.7} color="#7c8cff" />

      <FloatingScene animate={animate} simple={simple} />

      {!simple && !reduced && (
        <EffectComposer>
          <Bloom intensity={0.5} luminanceThreshold={0.65} mipmapBlur />
        </EffectComposer>
      )}
    </Canvas>
  );
}
