/**
 * SECTION 3 — DÉMO PRODUIT "L'AGENT EN ACTION".
 * ÉTAPE 0 : structure statique. Typewriter séquencé ScrollTrigger
 * + cartes data extraite à l'ÉTAPE dédiée.
 */
export default function Demo() {
  return (
    <section id="demo" className="relative py-32 lg:py-48">
      <div className="mx-auto flex max-w-[720px] flex-col items-center gap-12 px-6">
        <div className="flex flex-col items-center gap-6 text-center">
          <p className="font-mono text-xs uppercase tracking-widest text-text-muted">
            L&apos;agent en action
          </p>
          <h2 className="text-[clamp(32px,3.5vw,56px)] font-semibold leading-[1.1] tracking-headline text-text-primary">
            Une conversation. Un lead qualifié.
          </h2>
        </div>

        <div className="w-full rounded-modal border border-surface-line bg-background-elevated p-6">
          <div className="flex flex-col gap-3">
            <div className="max-w-[80%] self-start rounded-lg bg-surface-line px-4 py-3 text-sm text-text-primary">
              Bonjour, je cherche un T3 sur Paris 11e, budget 600k max
            </div>
            <div className="max-w-[80%] self-end rounded-lg bg-accent-cool/15 px-4 py-3 text-sm text-text-primary">
              Bonjour ! Pour mieux vous orienter : c&apos;est pour habiter ou
              investir ?
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
