"use client";

import { useEffect } from "react";
import { useControls } from "leva";
import {
  TRAIL_DEFAULTS,
  type TrailSettings,
} from "@/components/three/LightTrailsShader";

/**
 * Panneau Leva (dev uniquement, jamais bundlé en prod : importé via
 * next/dynamic derrière process.env.NODE_ENV === "development").
 */
export default function LightTrailsDevPanel({
  onChange,
}: {
  onChange: (settings: TrailSettings) => void;
}) {
  const values = useControls("light-trails", {
    trailSpeed: { value: TRAIL_DEFAULTS.trailSpeed, min: 0, max: 2, step: 0.01 },
    trailCount: { value: TRAIL_DEFAULTS.trailCount, min: 1, max: 8, step: 1 },
    trailLength: { value: TRAIL_DEFAULTS.trailLength, min: 0.05, max: 0.8, step: 0.01 },
    trailGlow: { value: TRAIL_DEFAULTS.trailGlow, min: 0, max: 3, step: 0.05 },
    horizonY: { value: TRAIL_DEFAULTS.horizonY, min: 0.3, max: 0.8, step: 0.005 },
    fogDensity: { value: TRAIL_DEFAULTS.fogDensity, min: 0, max: 3, step: 0.05 },
    curveAmp: { value: TRAIL_DEFAULTS.curveAmp, min: 0, max: 0.08, step: 0.002 },
    grainIntensity: { value: TRAIL_DEFAULTS.grainIntensity, min: 0, max: 0.2, step: 0.005 },
    bloomIntensity: { value: TRAIL_DEFAULTS.bloomIntensity, min: 0, max: 3, step: 0.05 },
    bloomThreshold: { value: TRAIL_DEFAULTS.bloomThreshold, min: 0, max: 1, step: 0.02 },
  });

  useEffect(() => {
    onChange(values);
  }, [values, onChange]);

  return null;
}
