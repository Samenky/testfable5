import Link from "next/link";
import clsx from "clsx";
import type { ReactNode, ButtonHTMLAttributes } from "react";

type ButtonProps = {
  children: ReactNode;
  variant?: "primary" | "secondary";
  href?: string;
  className?: string;
  "aria-label"?: string;
} & Pick<ButtonHTMLAttributes<HTMLButtonElement>, "type" | "disabled" | "onClick">;

export default function Button({
  children,
  variant = "primary",
  href,
  className,
  ...rest
}: ButtonProps) {
  const styles = clsx(
    "inline-flex items-center justify-center transition duration-200",
    variant === "primary" &&
      "h-12 rounded-lg bg-light px-8 text-sm font-medium text-midnight hover:scale-[1.02] active:scale-100 disabled:opacity-60 disabled:hover:scale-100",
    variant === "secondary" &&
      "text-sm text-slate underline decoration-border underline-offset-4 hover:text-light hover:decoration-slate",
    className
  );

  if (href) {
    return (
      <Link href={href} className={styles} aria-label={rest["aria-label"]}>
        {children}
      </Link>
    );
  }

  return (
    <button className={styles} {...rest}>
      {children}
    </button>
  );
}
