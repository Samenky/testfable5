import { Check } from "lucide-react";
import Button from "@/components/ui/Button";
import Pill from "@/components/ui/Pill";
import { cn } from "@/lib/cn";

type Plan = {
  name: string;
  price: string;
  period: string;
  features: string[];
  highlighted?: boolean;
  ctaVariant: "primary" | "outline";
};

const PLANS: Plan[] = [
  {
    name: "Pilote",
    price: "990 €",
    period: "30 jours",
    features: [
      "Agent IA opérationnel sur vos leads entrants",
      "Qualification en moins de 30 secondes",
      "Rapport de fin de pilote",
    ],
    ctaVariant: "outline",
  },
  {
    name: "Pro",
    price: "2 990 € setup",
    period: "490 €/mois",
    features: [
      "Tout le Pilote",
      "Intégration CRM et portails",
      "Prise de rendez-vous automatique",
      "Support prioritaire",
    ],
    highlighted: true,
    ctaVariant: "primary",
  },
  {
    name: "Pro+",
    price: "3 990 € setup",
    period: "640 €/mois",
    features: [
      "Tout le Pro",
      "Ton de l'agent personnalisé",
      "Multi-canaux (SMS, WhatsApp, email)",
      "Accompagnement dédié",
    ],
    ctaVariant: "primary",
  },
];

/**
 * SECTION 5 — PRICING "3 FORMULES".
 * ÉTAPE 0 : cartes statiques. Stagger features au scroll à l'ÉTAPE dédiée.
 */
export default function Pricing() {
  return (
    <section id="pricing" className="relative py-32 lg:py-48">
      <div className="mx-auto flex max-w-6xl flex-col gap-16 px-6">
        <div className="flex flex-col items-center gap-6 text-center">
          <p className="font-mono text-xs uppercase tracking-widest text-text-muted">
            Pricing
          </p>
          <h2 className="text-[clamp(32px,3.5vw,56px)] font-semibold leading-[1.1] tracking-headline text-text-primary">
            3 formules.
          </h2>
        </div>

        <div className="grid gap-6 lg:grid-cols-3 lg:items-start">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                "relative flex flex-col gap-6 rounded-2xl border bg-background-elevated p-8 transition-all duration-[250ms] ease-out hover:-translate-y-1 hover:border-text-secondary hover:shadow-[0_16px_48px_rgba(0,0,0,0.4)]",
                plan.highlighted
                  ? "border-text-muted lg:scale-[1.03]"
                  : "border-surface-line"
              )}
            >
              {plan.highlighted && (
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 -z-10 rounded-2xl"
                  style={{
                    background:
                      "radial-gradient(70% 50% at 50% 0%, rgba(232,197,71,0.12) 0%, transparent 70%)",
                    filter: "blur(24px)",
                  }}
                />
              )}
              <div className="flex items-center justify-between">
                <p className="font-mono text-xs uppercase tracking-widest text-text-secondary">
                  {plan.name}
                </p>
                {plan.highlighted && <Pill tone="signal">Le plus choisi</Pill>}
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-3xl font-semibold tracking-headline text-text-primary">
                  {plan.price}
                </p>
                <p className="font-mono text-sm text-text-muted">
                  {plan.period}
                </p>
              </div>
              <ul className="flex flex-col gap-3">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-3 text-sm text-text-secondary"
                  >
                    <Check
                      size={16}
                      className="mt-0.5 shrink-0 text-text-primary"
                      aria-hidden="true"
                    />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button
                href="#cta-final"
                variant={plan.ctaVariant}
                className="mt-auto"
              >
                Recevoir un accès
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
