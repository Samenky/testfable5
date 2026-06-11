import ParticlesField from "@/components/three/ParticlesField";

/**
 * SECTION 4 — PARTICULES-LEADS "VOS LEADS, ORGANISÉS".
 * ÉTAPE 0 : structure statique. Canvas particules + pin 200vh
 * + 3 phases ScrollTrigger à l'ÉTAPE dédiée.
 */
export default function Particles() {
  return (
    <section id="particles" className="relative bg-background-deep py-32 lg:py-48">
      <ParticlesField />
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 px-6 text-center">
        <p className="font-mono text-xs uppercase tracking-widest text-text-muted">
          Le tri automatique
        </p>
        <h2 className="text-[clamp(32px,3.5vw,56px)] font-semibold leading-[1.1] tracking-headline text-text-primary">
          Tous vos leads arrivent.
        </h2>
        <p className="font-mono text-2xl text-text-secondary">127 / 84 / 56</p>
      </div>
    </section>
  );
}
