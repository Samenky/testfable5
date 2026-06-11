import type { Metadata } from "next";
import LightTrailsCanvas from "@/components/three/LightTrailsCanvas";

export const metadata: Metadata = {
  title: "Light Trails — dev",
  robots: { index: false, follow: false },
};

/**
 * CHECKPOINT 1 — canvas plein écran, shader seul, aucun texte.
 * Panneau Leva actif en dev pour tuner les uniforms.
 */
export default function TrailsDevPage() {
  return (
    <div className="fixed inset-0">
      <LightTrailsCanvas devPanel />
    </div>
  );
}
