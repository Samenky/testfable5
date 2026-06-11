"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import { initSceneOrchestration } from "@/lib/sceneOrchestration";

const AuroraShader = dynamic(() => import("./AuroraShader"), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-midnight" />,
});

/**
 * Monte tous les calques fixes de la scène "Ville-Veille" derrière
 * le contenu (main est en z-10) et initialise l'orchestration scroll.
 *
 * z-0 : Aurora — dégradé liquide nocturne
 * z-1 : Skyline — ville endormie (étape 5)
 * z-2 : Fireflies — nuée de lucioles (étape 6)
 * z-5 : LivingLine — parcours du lead (étape 7)
 */
export default function SceneOrchestrator() {
  useEffect(() => initSceneOrchestration(), []);

  return (
    <div className="pointer-events-none fixed inset-0" aria-hidden="true">
      <div className="absolute inset-0 z-0">
        <AuroraShader />
      </div>
      <div className="absolute inset-x-0 bottom-0 z-[1]">
        {/* Skyline — étape 5 */}
      </div>
      <div className="absolute inset-0 z-[2]">{/* Fireflies — étape 6 */}</div>
      <div className="absolute inset-0 z-[5]">{/* LivingLine — étape 7 */}</div>
    </div>
  );
}
