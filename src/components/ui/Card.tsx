import { cn } from "@/lib/utils";
import { type HTMLAttributes } from "react";

type CardVariant = "default" | "elevated" | "mist" | "sage" | "gold";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: "none" | "sm" | "md" | "lg";
}

const variantClasses: Record<CardVariant, string> = {
  default:  "bg-cream border border-mist/60 shadow-sm",
  elevated: "bg-cream border border-mist/40 shadow-md",
  mist:     "bg-mist/50 border border-mist",
  sage:     "bg-sage/10 border border-sage/20",
  gold:     "bg-gold/10 border border-gold/20",
};

const paddingClasses = {
  none: "",
  sm:   "p-4",
  md:   "p-6",
  lg:   "p-8",
};

export function Card({
  variant = "default",
  padding = "md",
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-3xl",
        variantClasses[variant],
        paddingClasses[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
