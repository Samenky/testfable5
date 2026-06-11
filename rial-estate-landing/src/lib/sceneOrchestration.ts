import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Orchestration centralisée de la scène "Ville-Veille".
 *
 * Tous les ScrollTriggers qui transforment les calques de fond
 * (aurora, skyline, carte de France…) vivent ici, et nulle part ailleurs.
 * Les calques s'enregistrent via registerSceneHandle() ; les handles sont
 * lus paresseusement au moment des callbacks, donc l'ordre de montage
 * (dynamic imports) n'a pas d'importance.
 */

export type AuroraHandle = {
  /** 0 = ambiance deepblue de base, 1 = tension violette (section Problème) */
  setVioletMix: (v: number) => void;
};

export type SkylineMode =
  /** comportement de base : fenêtres qui s'allument toutes les ~800ms */
  | "ambient"
  /** personne ne veille : aucune fenêtre sauf la tour Rial Estate */
  | "dormant"
  /** la ville s'éveille : allumage massif (~200ms) */
  | "awake";

export type SkylineHandle = {
  setMode: (mode: SkylineMode) => void;
};

export type FranceMapHandle = {
  /** 0 = carte invisible, 1 = carte révélée, villes allumées en séquence */
  setReveal: (v: number) => void;
};

type SceneHandles = {
  aurora?: AuroraHandle;
  skyline?: SkylineHandle;
  franceMap?: FranceMapHandle;
};

const handles: SceneHandles = {};

export function registerSceneHandle<K extends keyof SceneHandles>(
  key: K,
  handle: NonNullable<SceneHandles[K]>
): () => void {
  handles[key] = handle;
  return () => {
    if (handles[key] === handle) delete handles[key];
  };
}

/**
 * À appeler une fois les sections montées (les triggers ciblent leurs ids).
 * Retourne la fonction de cleanup.
 */
export function initSceneOrchestration(): () => void {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return () => {};
  }

  const ctx = gsap.context(() => {
    const problem = document.getElementById("problem");
    const solution = document.getElementById("solution");
    const territory = document.getElementById("territory");

    // ── Section Problème : l'aurora vire au violet (tension),
    //    la ville s'éteint — personne ne veille sauf la tour.
    if (problem) {
      const tint = { v: 0 };
      gsap.to(tint, {
        v: 1,
        ease: "none",
        onUpdate: () => handles.aurora?.setVioletMix(tint.v),
        scrollTrigger: {
          trigger: problem,
          start: "top 85%",
          end: "top 25%",
          scrub: true,
        },
      });

      ScrollTrigger.create({
        trigger: problem,
        start: "top 60%",
        end: "bottom 40%",
        onEnter: () => handles.skyline?.setMode("dormant"),
        onEnterBack: () => handles.skyline?.setMode("dormant"),
        onLeaveBack: () => handles.skyline?.setMode("ambient"),
      });
    }

    // ── Section Solution : l'aurora revient au deepblue,
    //    la ville s'éveille massivement grâce à Rial Estate.
    if (solution) {
      const tint = { v: 1 };
      gsap.to(tint, {
        v: 0,
        ease: "none",
        onUpdate: () => handles.aurora?.setVioletMix(tint.v),
        scrollTrigger: {
          trigger: solution,
          start: "top 90%",
          end: "top 35%",
          scrub: true,
        },
      });

      ScrollTrigger.create({
        trigger: solution,
        start: "top 60%",
        end: "bottom 40%",
        onEnter: () => handles.skyline?.setMode("awake"),
        onEnterBack: () => handles.skyline?.setMode("awake"),
        onLeave: () => handles.skyline?.setMode("ambient"),
      });
    }

    // ── Section Territoire : révélation de la carte de France.
    if (territory) {
      const reveal = { v: 0 };
      gsap.to(reveal, {
        v: 1,
        ease: "none",
        onUpdate: () => handles.franceMap?.setReveal(reveal.v),
        scrollTrigger: {
          trigger: territory,
          start: "top 80%",
          end: "top 20%",
          scrub: true,
        },
      });
    }
  });

  return () => ctx.revert();
}
