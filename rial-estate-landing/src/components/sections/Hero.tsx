"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import Button from "@/components/ui/Button";
import ScrollIndicator from "@/components/ui/ScrollIndicator";
import { fadeUp, staggerChildren } from "@/lib/animations";
import { useIsMobile, usePrefersReducedMotion } from "@/hooks/useMediaQuery";

const HeroOrb = dynamic(() => import("@/components/three/HeroOrb"), {
  ssr: false,
  loading: () => <div className="h-full w-full" aria-hidden="true" />,
});

export default function Hero() {
  const isMobile = useIsMobile();
  const reducedMotion = usePrefersReducedMotion();

  return (
    <section
      id="hero"
      className="relative flex min-h-screen flex-col items-center bg-bg-primary px-6 pb-20"
    >
      <div className="pointer-events-none h-[42vh] w-full max-w-3xl" aria-hidden="true">
        <HeroOrb simple={isMobile} reduced={reducedMotion} />
      </div>

      <motion.div
        className="flex max-w-4xl flex-col items-center text-center"
        variants={staggerChildren}
        initial={reducedMotion ? "visible" : "hidden"}
        animate="visible"
      >
        <motion.h1
          variants={fadeUp}
          className="text-[40px] font-medium leading-[1.05] tracking-headline md:text-[72px]"
        >
          L&apos;agent IA des agences immobilières indépendantes qui ne laisse
          plus dormir un seul lead.
        </motion.h1>

        <motion.p
          variants={fadeUp}
          className="mt-6 max-w-[540px] text-lg leading-relaxed text-zinc-400"
        >
          Réponse en 30 secondes, qualification, créneaux de visite proposés.
          Vos prospects ne tombent plus chez le concurrent d&apos;à côté.
        </motion.p>

        <motion.div
          variants={fadeUp}
          className="mt-10 flex flex-col items-center gap-6 sm:flex-row"
        >
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
        </motion.div>
      </motion.div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <ScrollIndicator />
      </div>
    </section>
  );
}
