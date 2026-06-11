import Button from "@/components/ui/Button";
import LightTrailsCanvas from "@/components/three/LightTrailsCanvas";

/**
 * SECTION 7 — CTA FINAL + FOOTER.
 * ÉTAPE 0 : structure statique sur le stub canvas (intensity low).
 */
export default function FinalCta() {
  return (
    <section id="cta-final" className="relative flex min-h-screen flex-col">
      <LightTrailsCanvas intensity="low" className="z-0" />

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center gap-6 px-6 py-32 text-center">
        <h2 className="max-w-4xl text-[clamp(40px,5vw,72px)] font-semibold leading-[1.05] tracking-headline text-text-primary">
          Pendant que vous lisez ça, un lead vient d&apos;arriver.
        </h2>
        <p className="text-lg text-text-secondary">
          Demandez votre accès en 60 secondes.
        </p>
        <form className="mt-4 flex w-full max-w-md flex-col gap-3 sm:flex-row">
          <input
            type="email"
            required
            placeholder="votre@email.fr"
            aria-label="Votre email"
            className="flex-1 rounded-full border border-surface-line bg-background-elevated px-5 py-3.5 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-cool focus:outline-none"
          />
          <Button type="submit">Recevoir un accès</Button>
        </form>
        <p className="font-mono text-xs uppercase tracking-widest text-text-muted">
          8 pilotes disponibles ce trimestre.
        </p>
      </div>

      <footer className="relative z-10 border-t border-surface-line">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-6 py-10 sm:flex-row">
          <p className="font-semibold tracking-display text-text-primary">
            RIAL ESTATE
          </p>
          <nav className="flex flex-wrap items-center justify-center gap-6 text-sm text-text-secondary">
            <a href="#" className="hover:text-text-primary">
              Mentions légales
            </a>
            <a href="#" className="hover:text-text-primary">
              CGU
            </a>
            <a href="#" className="hover:text-text-primary">
              Confidentialité
            </a>
            <a href="#" className="hover:text-text-primary">
              Contact
            </a>
          </nav>
          <p className="font-mono text-xs text-text-muted">
            © 2026 Rial Estate
          </p>
        </div>
      </footer>
    </section>
  );
}
