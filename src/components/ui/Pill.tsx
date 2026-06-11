import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

type PillProps = {
  children: ReactNode;
  tone?: "neutral" | "signal" | "cool";
  className?: string;
};

/** Micro-label pill (badges pricing, eyebrows encapsulés). */
export default function Pill({
  children,
  tone = "neutral",
  className,
}: PillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 font-mono text-xs uppercase tracking-widest",
        tone === "neutral" && "border-surface-line text-text-secondary",
        tone === "signal" && "border-accent-signal/40 text-accent-signal",
        tone === "cool" && "border-accent-cool/40 text-accent-cool",
        className
      )}
    >
      {children}
    </span>
  );
}
