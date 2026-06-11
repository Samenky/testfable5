"use client";

import { useEffect, useRef, type RefObject } from "react";

/**
 * Progression de scroll globale (0..1) sans re-render : retourne une ref
 * mise à jour sur scroll, à lire dans une boucle rAF.
 */
export function useScrollProgress(): RefObject<number> {
  const progress = useRef(0);

  useEffect(() => {
    const update = () => {
      const max =
        document.documentElement.scrollHeight - window.innerHeight;
      progress.current = max > 0 ? window.scrollY / max : 0;
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return progress;
}
