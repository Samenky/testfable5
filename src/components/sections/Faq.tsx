/**
 * SECTION 6 — FAQ.
 * ÉTAPE 0 : liste statique. Accordéon framer-motion AnimatePresence
 * + chevron rotate à l'ÉTAPE dédiée.
 */

const QUESTIONS = [
  "Combien de temps pour être opérationnel ?",
  "Comment l'agent récupère mes biens et mes leads ?",
  "Que se passe-t-il si l'agent ne sait pas répondre ?",
  "Mes données restent-elles confidentielles ?",
  "Puis-je personnaliser le ton de l'agent ?",
  "Comment se passe l'arrêt si je ne suis pas satisfait ?",
];

export default function Faq() {
  return (
    <section id="faq" className="relative py-32 lg:py-48">
      <div className="mx-auto flex max-w-3xl flex-col gap-16 px-6">
        <div className="flex flex-col gap-6">
          <p className="font-mono text-xs uppercase tracking-widest text-text-muted">
            FAQ
          </p>
          <h2 className="text-[clamp(32px,3.5vw,56px)] font-semibold leading-[1.1] tracking-headline text-text-primary">
            Questions fréquentes.
          </h2>
        </div>
        <ul className="flex flex-col divide-y divide-surface-line">
          {QUESTIONS.map((question) => (
            <li key={question} className="py-6 text-text-primary">
              {question}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
