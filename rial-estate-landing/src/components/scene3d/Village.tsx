"use client";

import { useCallback, useEffect, useRef } from "react";
import { useGLTF, Clone } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";
import House, { type RegisterWindow, type WindowSpec } from "./House";
import { SCENE } from "./palette";

/**
 * Le village : 10 bâtiments disposés organiquement autour de la tour
 * Rial Estate, puits, lampadaires, clôtures, buissons, rochers.
 * Gère l'animation des fenêtres (1-3 s'allument toutes les 600-1200ms,
 * hold 2-5s, fade) avec un pool de point lights ambre réutilisées.
 */

// Fenêtres par modèle, en unités modèle (origine au pied, y vers le haut)
const W: Record<string, WindowSpec[]> = {
  homeA: [
    { p: [-0.17, 0.34, 0.4] },
    { p: [0.17, 0.34, 0.4] },
    { p: [0.41, 0.3, -0.05], rotY: Math.PI / 2 },
  ],
  homeB: [
    { p: [-0.18, 0.35, 0.57] },
    { p: [0.18, 0.35, 0.57] },
    { p: [0, 0.85, 0.57] },
    { p: [0.45, 0.4, 0], rotY: Math.PI / 2 },
  ],
  tavern: [
    { p: [-0.25, 0.4, 0.64] },
    { p: [0.2, 0.4, 0.64] },
    { p: [-0.05, 0.95, 0.64] },
    { p: [0.59, 0.45, -0.1], rotY: Math.PI / 2 },
    { p: [-0.6, 0.85, 0], rotY: Math.PI / 2 },
  ],
  church: [
    { p: [0, 0.5, 0.61] },
    { p: [0, 1.0, 0.61] },
    { p: [0.52, 0.55, 0], rotY: Math.PI / 2 },
    { p: [-0.52, 0.55, 0], rotY: Math.PI / 2 },
  ],
  windmill: [{ p: [0, 0.25, 0.42] }, { p: [-0.45, 0.2, 0], rotY: Math.PI / 2 }],
  tower: [
    { p: [0, 0.45, 0.56] },
    { p: [0, 0.85, 0.56] },
    { p: [0, 1.25, 0.56] },
    { p: [0, 1.65, 0.56] },
    { p: [0.51, 1.05, 0], rotY: Math.PI / 2 },
    { p: [-0.51, 1.45, 0], rotY: Math.PI / 2 },
    { p: [0, 1.98, 0.56] },
  ],
};

const LIGHT_POOL_SIZE = 5;

type WindowEntry = {
  mat: THREE.MeshStandardMaterial;
  obj: THREE.Object3D;
  busy: boolean;
};

function Prop({
  src,
  position,
  rotationY = 0,
  scale = 1,
}: {
  src: string;
  position: [number, number, number];
  rotationY?: number;
  scale?: number;
}) {
  const { scene } = useGLTF(src);
  const ref = useRef<THREE.Group>(null);
  useEffect(() => {
    ref.current?.traverse((o) => {
      o.raycast = () => null;
    });
  }, []);
  return (
    <group ref={ref} position={position} rotation={[0, rotationY, 0]} scale={scale}>
      <Clone object={scene} />
    </group>
  );
}

export default function Village({ animate = true }: { animate?: boolean }) {
  const windowsRef = useRef<WindowEntry[]>([]);
  const lightsRef = useRef<(THREE.PointLight | null)[]>([]);

  const registerWindow = useCallback<RegisterWindow>((mat, obj, permanent) => {
    if (permanent) return () => {};
    const entry: WindowEntry = { mat, obj, busy: false };
    windowsRef.current.push(entry);
    return () => {
      windowsRef.current = windowsRef.current.filter((e) => e !== entry);
    };
  }, []);

  // Boucle d'allumage des fenêtres
  useEffect(() => {
    const pool = windowsRef.current;

    if (!animate) {
      // reduced-motion : un foyer sur trois éclairé, fixe
      pool.forEach((e, i) => {
        e.mat.emissiveIntensity = i % 3 === 0 ? 2.2 : 0;
      });
      return;
    }

    let alive = true;
    let call: gsap.core.Tween | null = null;
    const tweens: gsap.core.Tween[] = [];
    const tmp = new THREE.Vector3();

    const freeLight = () =>
      lightsRef.current.find((l) => l && l.userData.free) ?? null;

    const lightUp = (e: WindowEntry) => {
      e.busy = true;
      const hold = 2 + Math.random() * 3;
      const light = freeLight();
      if (light) {
        light.userData.free = false;
        e.obj.getWorldPosition(tmp);
        light.position.copy(tmp);
        light.position.y += 0.3;
      }
      const proxy = { v: 0 };
      tweens.push(
        gsap.to(proxy, {
          v: 2.5,
          duration: 0.4,
          ease: "power2.out",
          onUpdate: () => {
            e.mat.emissiveIntensity = proxy.v;
            if (light) light.intensity = (proxy.v / 2.5) * 14;
          },
          onComplete: () => {
            tweens.push(
              gsap.to(proxy, {
                v: 0,
                duration: 0.8,
                delay: hold,
                ease: "power2.in",
                onUpdate: () => {
                  e.mat.emissiveIntensity = proxy.v;
                  if (light) light.intensity = (proxy.v / 2.5) * 14;
                },
                onComplete: () => {
                  e.busy = false;
                  if (light) light.userData.free = true;
                },
              })
            );
          },
        })
      );
    };

    const loop = () => {
      if (!alive) return;
      if (!document.hidden) {
        const candidates = pool.filter((e) => !e.busy);
        const n = Math.min(1 + Math.floor(Math.random() * 3), candidates.length);
        for (let i = 0; i < n; i++) {
          const e = candidates[Math.floor(Math.random() * candidates.length)];
          if (e && !e.busy) lightUp(e);
        }
      }
      call = gsap.delayedCall(0.6 + Math.random() * 0.6, loop);
    };
    loop();

    return () => {
      alive = false;
      call?.kill();
      tweens.forEach((t) => t.kill());
    };
  }, [animate]);

  return (
    <group>
      {/* ── La tour Rial Estate, toujours allumée */}
      <House
        src="/models/tower.glb"
        position={[0, 0, 0]}
        rotationY={0.3}
        scale={7}
        windows={W.tower}
        permanentLit
      />
      <pointLight
        position={[0, 8, 3]}
        color={SCENE.amber}
        intensity={30}
        distance={18}
        decay={2}
      />

      {/* ── Les maisons */}
      <House src="/models/house-1.glb" position={[10, 0, 5]} rotationY={0.5} windows={W.homeA} registerWindow={registerWindow} />
      <House src="/models/house-2.glb" position={[-9, 0, 3]} rotationY={-0.5} windows={W.homeB} registerWindow={registerWindow} />
      <House src="/models/house-3.glb" position={[6, 0, -9]} rotationY={2.7} windows={W.homeA} registerWindow={registerWindow} />
      <House src="/models/house-4.glb" position={[-8, 0, -8]} rotationY={0.8} windows={W.homeB} registerWindow={registerWindow} />
      <House src="/models/house-tavern.glb" position={[13, 0, -4]} rotationY={-1.1} scale={5.5} windows={W.tavern} registerWindow={registerWindow} />
      <House src="/models/house-church.glb" position={[-4, 0, 11]} rotationY={2.9} scale={6.5} windows={W.church} registerWindow={registerWindow} />
      <House src="/models/house-windmill.glb" position={[-16, 3.5, -4]} rotationY={0.4} windows={W.windmill} registerWindow={registerWindow} />
      <House src="/models/house-1.glb" position={[17, 0, 7]} rotationY={1.9} scale={6} windows={W.homeA} registerWindow={registerWindow} />
      <House src="/models/house-3.glb" position={[-14, 0, 9]} rotationY={-2.3} scale={6} windows={W.homeA} registerWindow={registerWindow} />

      {/* ── Pool de point lights pour les fenêtres allumées */}
      {Array.from({ length: LIGHT_POOL_SIZE }, (_, i) => (
        <pointLight
          key={i}
          ref={(l) => {
            if (l) {
              l.userData.free = true;
              lightsRef.current[i] = l;
            }
          }}
          intensity={0}
          color={SCENE.amber}
          distance={9}
          decay={2}
        />
      ))}

      {/* ── Lampadaires (lumière chaude permanente) */}
      {(
        [
          [4, 8.5, 2.2],
          [-5, 6, -0.6],
          [9, -1, 0.9],
          [-3, -6, 2.6],
          [13, -9, -0.4],
          [-11, -1, 1.8],
        ] as const
      ).map(([x, z, rot], i) => (
        <group key={i}>
          <Prop src="/models/lamp-post.glb" position={[x, 0, z]} rotationY={rot} scale={0.8} />
          <pointLight
            position={[x, 2.6, z]}
            color={SCENE.amber}
            intensity={9}
            distance={9}
            decay={2}
          />
        </group>
      ))}

      {/* ── Placette, clôtures, buissons, rochers */}
      <Prop src="/models/well.glb" position={[4, 0, 2.5]} rotationY={0.7} scale={5} />
      <Prop src="/models/fence.glb" position={[12.5, 0, 8.5]} rotationY={0.4} scale={4} />
      <Prop src="/models/fence.glb" position={[-11.5, 0, 5.5]} rotationY={-1.2} scale={4} />
      <Prop src="/models/fence.glb" position={[2, 0, -11]} rotationY={1.8} scale={4} />
      <Prop src="/models/bush-1.glb" position={[7.5, 0, 7.5]} scale={3.5} />
      <Prop src="/models/bush-2.glb" position={[-6, 0, 9]} scale={3} />
      <Prop src="/models/bush-1.glb" position={[11, 0, -7.5]} rotationY={1.1} scale={2.8} />
      <Prop src="/models/bush-2.glb" position={[-10.5, 0, -5]} rotationY={2.3} scale={3.4} />
      <Prop src="/models/bush-1.glb" position={[1.5, 0, 6.5]} rotationY={0.6} scale={2.5} />
      <Prop src="/models/rock-1.glb" position={[16, 0, 1]} scale={6} />
      <Prop src="/models/rock-2.glb" position={[-13, 0, 1.5]} scale={5} />
      <Prop src="/models/rock-1.glb" position={[5, 0, 12]} rotationY={1.4} scale={4} />
    </group>
  );
}
