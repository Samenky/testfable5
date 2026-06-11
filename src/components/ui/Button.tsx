import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/cn";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonProps = {
  children: ReactNode;
  variant?: "primary" | "outline" | "ghost";
  href?: string;
  withArrow?: boolean;
  className?: string;
} & Pick<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "type" | "disabled" | "onClick" | "aria-label"
>;

export default function Button({
  children,
  variant = "primary",
  href,
  withArrow = false,
  className,
  ...rest
}: ButtonProps) {
  const styles = cn(
    "group inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-medium transition-all duration-200",
    variant === "primary" &&
      "bg-accent-signal text-background-deep hover:scale-[1.02] hover:shadow-[0_0_24px_#e8c54740] active:scale-100 disabled:opacity-60 disabled:hover:scale-100 disabled:hover:shadow-none",
    variant === "outline" &&
      "border border-surface-line text-text-primary hover:border-text-muted hover:bg-background-elevated",
    variant === "ghost" &&
      "px-0 py-0 text-text-secondary underline decoration-surface-line underline-offset-4 hover:text-text-primary hover:decoration-text-secondary",
    className
  );

  const content = (
    <>
      {children}
      {withArrow && (
        <ArrowRight
          size={16}
          className="transition-transform duration-200 group-hover:translate-x-0.5"
          aria-hidden="true"
        />
      )}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={styles} aria-label={rest["aria-label"]}>
        {content}
      </Link>
    );
  }

  return (
    <button className={styles} {...rest}>
      {content}
    </button>
  );
}
