/**
 * SECTION 2 — PROBLÈME "LE LEAD QUI DORT".
 * ÉTAPE 0 : layout statique. Compteur rolodex + ScrollTrigger à l'ÉTAPE 3.
 */
export default function Problem() {
  return (
    <section
      id="problem"
      className="relative bg-background-elevated py-32 lg:py-48"
      style={{
        backgroundImage:
          "radial-gradient(60% 50% at 85% 95%, rgba(255,59,71,0.08) 0%, transparent 70%)",
      }}
    >
      <div className="mx-auto grid max-w-6xl gap-16 px-6 lg:grid-cols-2 lg:items-center">
        <div className="flex flex-col gap-6">
          <p className="font-mono text-xs uppercase tracking-widest text-text-muted">
            Le problème
          </p>
          <h2 className="text-[clamp(32px,3.5vw,56px)] font-semibold leading-[1.1] tracking-headline text-text-primary">
            78% des leads contactés après 10 minutes sont déjà perdus.
          </h2>
          <div className="flex flex-col gap-4 text-text-secondary">
            <p>
              Un lead immobilier vous coûte entre 25 et 80 € à générer. Chaque
              lead non rappelé, c&apos;est ce budget jeté — et un mandat qui
              part chez le concurrent d&apos;à côté.
            </p>
            <p>
              Après une heure sans réponse, le taux de conversion est divisé
              par six. Vos agents sont en visite, en rendez-vous, en
              estimation. Le lead, lui, n&apos;attend pas.
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-4 lg:items-start">
          <span className="font-mono text-[clamp(64px,8vw,120px)] font-bold tabular-nums text-alert">
            00:00
          </span>
          <p className="font-mono text-sm text-text-muted">
            leads non rappelés depuis votre dernier café
          </p>
        </div>
      </div>
    </section>
  );
}
