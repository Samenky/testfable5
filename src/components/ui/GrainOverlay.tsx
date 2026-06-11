const GRAIN_SVG = `<svg xmlns='http://www.w3.org/2000/svg' width='128' height='128'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>`;

/**
 * Grain global statique (baseline DOM, toutes sections, mobile inclus).
 * Le grain ANIMÉ par-dessus les canvas WebGL est géré par
 * three/GrainEffect (postprocessing Noise, ÉTAPE 1).
 */
export default function GrainOverlay() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-50 opacity-[0.05] mix-blend-overlay"
      style={{
        backgroundImage: `url("data:image/svg+xml,${GRAIN_SVG}")`,
        backgroundRepeat: "repeat",
      }}
    />
  );
}
