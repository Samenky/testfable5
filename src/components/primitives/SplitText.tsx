"use client";

import { Children, type ReactNode } from "react";
import { cn } from "@/lib/cn";

type SplitTextProps = {
  text: string;
  className?: string;
  /** Classe appliquée à chaque mot (cible des tweens GSAP). */
  wordClassName?: string;
};

/**
 * Découpe un texte en spans par mot pour animation GSAP
 * (équivalent SplitText sans la dépendance Club GreenSock).
 * Chaque mot porte data-split-word pour le ciblage.
 */
export default function SplitText({
  text,
  className,
  wordClassName,
}: SplitTextProps) {
  const words = text.split(" ");

  return (
    <span className={className} aria-label={text}>
      {Children.toArray(
        words.map((word, i): ReactNode => (
          <span className="inline-block overflow-hidden" aria-hidden="true">
            <span
              data-split-word
              className={cn("inline-block will-change-transform", wordClassName)}
            >
              {word}
              {i < words.length - 1 ? " " : ""}
            </span>
          </span>
        ))
      )}
    </span>
  );
}
