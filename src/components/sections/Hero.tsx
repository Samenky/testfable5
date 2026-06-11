import Button from "@/components/ui/Button";
import ScrollIndicator from "@/components/ui/ScrollIndicator";
import LightTrailsCanvas from "@/components/three/LightTrailsCanvas";

/**
 * SECTION 1 — HERO "LIGHT TRAILS".
 * ÉTAPE 0 : structure statique (wordmark, H1, CTA, indicateur)
 * sur le stub canvas. Shader + GSAP timeline aux ÉTAPES 1–2.
 */
export default function Hero() {
  return (
    <section id="hero" className="relative h-screen overflow-hidden">
      <LightTrailsCanvas className="z-0" />

      <h2
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-10 -translate-y-[15%] select-none whitespace-nowrap text-center font-sans text-[clamp(96px,18vw,280px)] font-extrabold tracking-display text-text-primary mix-blend-exclusion"
      >
        RIAL ESTATE
      </h2>

      <div className="relative z-20 flex h-full flex-col items-center justify-center gap-6 px-6 text-center">
        <h1 className="max-w-4xl text-[clamp(40px,5vw,72px)] font-semibold leading-[1.05] tracking-headline text-text-primary">
          L&apos;agent IA qui qualifie vos leads pendant que vous dormez.
        </h1>
        <p className="text-[clamp(16px,1.2vw,20px)] text-text-secondary">
          30 secondes. 24/7. Sans recruter. Sans SDR.
        </p>
        <div className="mt-4 flex items-center gap-8">
          <Button href="#cta-final" withArrow>
            Recevoir un accès
          </Button>
          <Button href="#demo" variant="ghost">
            Voir l&apos;agent en action
          </Button>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-8 z-20 flex justify-center">
        <ScrollIndicator />
      </div>
    </section>
  );
}
