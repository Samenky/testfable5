"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import {
  useIsMobile,
  usePrefersReducedMotion,
} from "@/hooks/useMediaQuery";
import {
  TRAIL_DEFAULTS,
  type TrailSettings,
} from "@/components/three/LightTrailsShader";

/* Fallback affiché pendant le chargement du bundle Three (et SSR). */
function StaticSky() {
  return (
    <div
      className="absolute inset-0"
      style={{
        background:
          "radial-gradient(120% 90% at 40% 70%, var(--color-horizon-warm) 0%, var(--color-background-deep) 65%)",
      }}
    />
  );
}

const Scene = dynamic(
  () => import("@/components/three/LightTrailsScene"),
  { ssr: false, loading: () => <StaticSky /> }
);

/* Strippé du bundle prod : la branche morte est éliminée statiquement. */
const DevPanel =
  process.env.NODE_ENV === "development"
    ? dynamic(() => import("@/components/three/LightTrailsDevPanel"), {
        ssr: false,
      })
    : null;

type LightTrailsCanvasProps = {
  intensity?: "full" | "low";
  /** Active le panneau Leva (une seule instance par page, dev only). */
  devPanel?: boolean;
  className?: string;
};

export default function LightTrailsCanvas({
  intensity = "full",
  devPanel = false,
  className,
}: LightTrailsCanvasProps) {
  const [settings, setSettings] = useState<TrailSettings>(TRAIL_DEFAULTS);
  const containerRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(true);
  const reducedMotion = usePrefersReducedMotion();
  const isMobile = useIsMobile();

  // Hors viewport → on démonte le rendu (pas de raf inutile quand
  // deux canvases coexistent sur la page : hero + CTA final).
  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: "100px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={cn("absolute inset-0 overflow-hidden", className)}
    >
      {inView ? (
        <Scene
          settings={settings}
          intensity={intensity === "full" ? 1 : 0.45}
          frozen={reducedMotion}
          degraded={isMobile}
        />
      ) : (
        <StaticSky />
      )}
      {DevPanel && devPanel ? <DevPanel onChange={setSettings} /> : null}
    </div>
  );
}
