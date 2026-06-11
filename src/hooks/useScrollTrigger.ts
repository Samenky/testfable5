"use client";

import { useEffect, useRef, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type ScrollAnimation = (ctx: {
  gsap: typeof gsap;
  ScrollTrigger: typeof ScrollTrigger;
  root: HTMLElement;
}) => void;

/**
 * Exécute une animation GSAP scopée à un élément racine, avec cleanup
 * automatique. Ne fait rien si l'utilisateur préfère un mouvement réduit.
 */
export function useScrollTrigger<T extends HTMLElement>(
  animation: ScrollAnimation,
  deps: unknown[] = []
): RefObject<T | null> {
  const rootRef = useRef<T>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      animation({ gsap, ScrollTrigger, root });
    }, root);

    return () => ctx.revert();
    // L'animation est volontairement contrôlée par `deps`, pas par son identité.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return rootRef;
}
