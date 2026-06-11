"use client";

import { useEffect, useRef, type RefObject } from "react";

/**
 * Position du curseur sans re-render : retourne une ref mise à jour
 * sur mousemove, à lire dans une boucle rAF.
 */
export function useMousePosition(): RefObject<{ x: number; y: number }> {
  const pos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    pos.current.x = window.innerWidth / 2;
    pos.current.y = window.innerHeight / 2;
    const onMove = (e: MouseEvent) => {
      pos.current.x = e.clientX;
      pos.current.y = e.clientY;
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return pos;
}
