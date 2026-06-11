"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import House from "./House";
import Ground from "./Ground";
import Moon from "./Moon";
import { SCENE } from "./palette";

/**
 * Scène 3D cinématique persistante — fond fixe de toute la landing.
 * MVP (étape 5) : terrain + 1 maison + lune + étoiles + fog nocturne.
 * Village, fenêtres animées, post-processing et caméra scroll-driven
 * arrivent aux étapes suivantes.
 */
export default function Scene() {
  return (
    <div className="fixed inset-0 z-0" aria-hidden="true">
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 18, 35], fov: 50, near: 0.1, far: 400 }}
        gl={{ antialias: true }}
        onCreated={({ camera, gl }) => {
          camera.lookAt(0, 2, 0);
          gl.toneMappingExposure = 1.35;
        }}
      >
        <color attach="background" args={[SCENE.sky]} />
        <fog attach="fog" args={[SCENE.fog, 30, 120]} />

        <ambientLight color={SCENE.ambient} intensity={0.9} />
        <hemisphereLight args={[SCENE.moonlight, SCENE.ground, 0.5]} />
        <Moon />

        <Stars
          radius={140}
          depth={60}
          count={5000}
          factor={4}
          saturation={0}
          fade
          speed={0.4}
        />

        <Suspense fallback={null}>
          <Ground />
          <House src="/models/house-1.glb" position={[0, 0, 0]} scale={5} />
        </Suspense>
      </Canvas>
    </div>
  );
}
