import Button from "@/components/ui/Button";
import ScrollIndicator from "@/components/ui/ScrollIndicator";

/**
 * Section 1 — Hero. Version statique (placeholder structurel) :
 * les animations d'entrée (split par mot, staggers) arrivent à l'étape 10.
 * La scène vit derrière (calques fixes), le hero n'ajoute que du texte.
 */
export default function Hero() {
  return (
    <section
      id="hero"
      className="relative flex min-h-screen flex-col items-center justify-center bg-transparent px-6 text-center"
    >
      <p className="text-xs uppercase tracking-[0.2em] text-slate">
        Rial Estate · L&apos;agent IA pour agences immobilières indépendantes
      </p>

      <h1 className="mt-10 max-w-5xl text-[40px] font-medium leading-[1.1] tracking-headline text-light md:text-[80px] md:leading-[1.05]">
        <span className="opacity-70">
          Chaque nuit, vos leads cherchent une lumière.
        </span>
        <br />
        Soyez la seule qui reste allumée.
      </h1>

      <p className="mt-8 max-w-[520px] text-lg leading-[1.6] text-slate">
        Réponse en 30 secondes, qualification, créneaux de visite proposés.
        Pendant que vos concurrents dorment, votre agence travaille.
      </p>

      <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row">
        <Button href="#access" aria-label="Recevoir un accès — aller au formulaire">
          Recevoir un accès
        </Button>
        <Button
          variant="secondary"
          href="#problem"
          aria-label="Voir comment ça marche — section suivante"
        >
          Voir comment ça marche →
        </Button>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <ScrollIndicator />
      </div>
    </section>
  );
}
