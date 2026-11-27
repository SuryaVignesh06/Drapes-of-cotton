import * as React from "react";
import { cn } from "@/lib/utils";

export interface SectionProps extends React.ComponentProps<"section"> {
  spacing?: "compact" | "default" | "spacious";
  surface?: "ivory" | "cream" | "cotton";
}

const spacingClasses: Record<NonNullable<SectionProps["spacing"]>, string> = {
  compact: "py-8 sm:py-12",
  default: "py-12 sm:py-16",
  spacious: "py-16 sm:py-20",
};

const surfaceClasses: Record<NonNullable<SectionProps["surface"]>, string> = {
  ivory: "bg-surface",
  cream: "bg-surface-secondary",
  cotton: "bg-surface-cotton",
};

/**
 * Reusable vertical section wrapper aligned with the 8px rhythm and light luxury surfaces.
 */
export function Section({
  className,
  spacing = "default",
  surface = "ivory",
  children,
  ...props
}: SectionProps) {
  return (
    <section
      className={cn(spacingClasses[spacing], surfaceClasses[surface], className)}
      {...props}
    >
      {children}
    </section>
  );
}
