"use client";

import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Chevron bounce en bas du hero.
 * Disparaît dès que scrollY > 50px.
 */
export default function ScrollIndicator() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY <= 50);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      aria-hidden="true"
      className={cn(
        "flex flex-col items-center text-text-primary transition-opacity duration-500",
        visible ? "opacity-60" : "opacity-0"
      )}
    >
      <ChevronDown size={20} className="animate-bounce" />
    </div>
  );
}
