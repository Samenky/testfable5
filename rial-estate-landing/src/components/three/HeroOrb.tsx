"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";

const PARTICLE_COUNT = 60;

type OrbProps = {
  animate: boolean;
};

function Orb({ animate }: OrbProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (!animate || !meshRef.current) return;
    meshRef.current.rotation.y += 0.002;
  });

  return (
    <mesh ref={meshRef}>
      {/* detail 2 ≈ 162 vertices : facettes visibles, look low-poly */}
      <icosahedronGeometry args={[1.1, 2]} />
      <meshPhysicalMaterial
        color="#d4d8e2"
        metalness={0.9}
        roughness={0.3}
        clearcoat={0.5}
        clearcoatRoughness={0.4}
        iridescence={0.9}
        iridescenceIOR={1.4}
        flatShading
      />
    </mesh>
  );
}

type OrbitParams = {
  a: number; // demi-grand axe
  b: number; // demi-petit axe
  speed: number;
  phase: number;
  tilt: number; // inclinaison du plan orbital
  yaw: number; // rotation du plan autour de Y
};

// PRNG seedé (mulberry32) : distribution stable entre les rendus
const ORBITS: OrbitParams[] = (() => {
  let seed = 1337;
  const random = () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const rng = (min: number, max: number) => min + random() * (max - min);
  return Array.from({ length: PARTICLE_COUNT }, () => ({
    a: rng(1.6, 2.8),
    b: rng(1.2, 2.0),
    speed: rng(0.1, 0.35),
    phase: rng(0, Math.PI * 2),
    tilt: rng(-0.6, 0.6),
    yaw: rng(0, Math.PI * 2),
  }));
})();

function OrbitingParticles({ animate }: OrbProps) {
  const pointsRef = useRef<THREE.Points>(null);

  const positions = useMemo(
    () => new Float32Array(PARTICLE_COUNT * 3),
    []
  );

  useFrame(({ clock }) => {
    if (!pointsRef.current) return;
    const t = animate ? clock.getElapsedTime() : 0;
    const pos = pointsRef.current.geometry.attributes.position;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const { a, b, speed, phase, tilt, yaw } = ORBITS[i];
      const angle = phase + t * speed;
      const x0 = Math.cos(angle) * a;
      const z0 = Math.sin(angle) * b;
      const y0 = z0 * Math.sin(tilt);
      const z1 = z0 * Math.cos(tilt);
      pos.setXYZ(
        i,
        x0 * Math.cos(yaw) - z1 * Math.sin(yaw),
        y0,
        x0 * Math.sin(yaw) + z1 * Math.cos(yaw)
      );
    }
    pos.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#fafaf9"
        size={0.025}
        sizeAttenuation
        transparent
        opacity={0.7}
        depthWrite={false}
      />
    </points>
  );
}

type HeroOrbProps = {
  /** Mode simplifié (mobile) : pas de bloom, pas de particules */
  simple?: boolean;
  /** prefers-reduced-motion : rendu statique */
  reduced?: boolean;
};

export default function HeroOrb({ simple = false, reduced = false }: HeroOrbProps) {
  const animate = !reduced;

  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 45 }}
      dpr={[1, 2]}
      frameloop={animate ? "always" : "demand"}
      gl={{ antialias: true, alpha: true }}
      aria-hidden="true"
    >
      <ambientLight intensity={0.7} />
      <directionalLight position={[3, 4, 5]} intensity={2.6} color="#ffffff" />
      <directionalLight position={[-4, -2, -3]} intensity={1.1} color="#8ea2ff" />
      <pointLight position={[0, 2.5, 2]} intensity={4} color="#ffd9c4" distance={8} />
      <Orb animate={animate} />
      {!simple && <OrbitingParticles animate={animate} />}
      {!simple && !reduced && (
        <EffectComposer>
          <Bloom intensity={0.4} luminanceThreshold={0.7} mipmapBlur />
        </EffectComposer>
      )}
    </Canvas>
  );
}
