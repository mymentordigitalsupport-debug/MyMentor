import { cn } from "@/lib/utils";
import { type HTMLAttributes } from "react";

type BadgeVariant = "sage" | "gold" | "rose" | "muted" | "forest";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
  sage:   "bg-sage/15 text-forest border border-sage/25",
  gold:   "bg-gold/15 text-forest border border-gold/25",
  rose:   "bg-rose/15 text-rose border border-rose/25",
  muted:  "bg-mist text-muted border border-mist",
  forest: "bg-forest text-cream border border-forest",
};

export function Badge({
  variant = "sage",
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
