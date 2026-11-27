import * as React from "react";
import { cn } from "@/lib/utils";

export interface ContainerProps extends React.ComponentProps<"div"> {
  size?: "narrow" | "default" | "wide";
}

const sizeClasses: Record<NonNullable<ContainerProps["size"]>, string> = {
  narrow: "max-w-4xl",
  default: "max-w-[1280px]",
  wide: "max-w-[1440px]",
};

/**
 * Consistent responsive horizontal page container with generous boutique margins.
 */
export function Container({
  className,
  size = "default",
  children,
  ...props
}: ContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-4 sm:px-6 lg:px-10",
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
