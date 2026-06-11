"use client";

/**
 * Canvas WebGL plein écran du hero (et du CTA final via intensity="low").
 * STUB ÉTAPE 0 : rend le gradient skybox statique en CSS le temps
 * que le shader soit codé (ÉTAPE 1). L'API publique est figée ici
 * pour que les sections puissent déjà l'intégrer.
 */

type LightTrailsCanvasProps = {
  intensity?: "full" | "low";
  className?: string;
};

export default function LightTrailsCanvas({
  intensity = "full",
  className,
}: LightTrailsCanvasProps) {
  return (
    <div
      aria-hidden="true"
      className={className}
      style={{
        position: "absolute",
        inset: 0,
        background:
          "radial-gradient(120% 90% at 50% 100%, var(--color-horizon-warm) 0%, var(--color-background-deep) 65%)",
        opacity: intensity === "full" ? 1 : 0.6,
      }}
    />
  );
}
