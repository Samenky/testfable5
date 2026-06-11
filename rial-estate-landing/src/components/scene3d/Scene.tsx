"use client";

import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import Village from "./Village";
import Trees from "./Trees";
import Ground from "./Ground";
import Moon from "./Moon";
import Stars from "./Stars";
import Clouds from "./Clouds";
import Fireflies3D from "./Fireflies3D";
import PostProcessing from "./PostProcessing";
import { SCENE } from "./palette";
import { useIsMobile, usePrefersReducedMotion } from "@/hooks/useMediaQuery";

/**
 * Scène 3D cinématique persistante — fond fixe de toute la landing.
 * Village-veille : la nuit, les fenêtres s'allument une à une ;
 * seule la tour Rial Estate ne dort jamais.
 * Caméra scroll-driven : étape 10. Pour l'instant : keyframe 1 + parallax curseur.
 */

const KF1 = { position: new THREE.Vector3(0, 18, 35), target: new THREE.Vector3(0, 2, 0) };

function CameraRig({ animate }: { animate: boolean }) {
  const mouse = useRef({ x: 0, y: 0 });

  useFrame((state) => {
    if (!animate) return;
    // pointer est normalisé (-1..1) par R3F
    mouse.current.x += (state.pointer.x - mouse.current.x) * 0.04;
    mouse.current.y += (state.pointer.y - mouse.current.y) * 0.04;
    state.camera.position.set(
      KF1.position.x + mouse.current.x * 0.9,
      KF1.position.y - mouse.current.y * 0.6,
      KF1.position.z
    );
    state.camera.lookAt(KF1.target);
  });

  return null;
}

export default function Scene() {
  const isMobile = useIsMobile();
  const reduced = usePrefersReducedMotion();
  const animate = !reduced;

  return (
    <div className="fixed inset-0 z-0" aria-hidden="true">
      <Canvas
        dpr={isMobile ? 1 : [1, 1.5]}
        camera={{ position: KF1.position.toArray(), fov: 50, near: 0.1, far: 500 }}
        gl={{ antialias: true }}
        onCreated={({ camera, gl }) => {
          camera.lookAt(KF1.target);
          gl.toneMappingExposure = 1.35;
        }}
      >
        <color attach="background" args={[SCENE.sky]} />
        <fog
          attach="fog"
          args={isMobile ? [SCENE.fog, 22, 90] : [SCENE.fog, 30, 120]}
        />

        <ambientLight color={SCENE.ambient} intensity={0.9} />
        <hemisphereLight args={[SCENE.moonlight, SCENE.ground, 0.5]} />
        <Moon />
        <Stars animate={animate} />

        <Suspense fallback={null}>
          <Ground />
          <Village animate={animate} />
          <Trees animate={animate} reduced={isMobile} />
          <Clouds />
        </Suspense>

        {animate && <Fireflies3D count={isMobile ? 25 : 80} />}
        {!isMobile && <PostProcessing />}
        <CameraRig animate={animate && !isMobile} />
      </Canvas>
    </div>
  );
}
