import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const pillVariants = cva(
  "inline-flex items-center justify-center gap-1.5 rounded-[var(--radius-pill)] border text-xs font-medium tracking-[0.04em] transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40",
  {
    variants: {
      variant: {
        default:
          "border-border bg-surface-secondary text-foreground hover:border-muted-sand hover:bg-surface-cotton",
        active:
          "border-primary bg-primary text-primary-foreground hover:bg-deep-earth-olive",
        outline:
          "border-muted-sand bg-transparent text-foreground hover:bg-surface-secondary",
        subtle:
          "border-transparent bg-surface-cotton text-deep-earth-olive hover:bg-natural-linen",
      },
      size: {
        sm: "h-7 px-3 text-[11px]",
        default: "h-9 px-4 text-xs",
        lg: "h-10 px-5 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface PillProps
  extends React.ComponentProps<"span">,
    VariantProps<typeof pillVariants> {}

/**
 * Reusable pill primitive for editorial category navigation, weave tags, and filter chips.
 */
export function Pill({ className, variant, size, ...props }: PillProps) {
  return (
    <span
      data-slot="pill"
      className={cn(pillVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { pillVariants };
