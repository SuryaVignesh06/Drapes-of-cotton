import Image from "next/image";
import Link from "next/link";
import { BRAND } from "@/lib/constants";
import { cn } from "@/lib/utils";

export interface BrandLogoProps {
  logoSrc?: string | null;
  href?: string;
  size?: "sm" | "md" | "lg";
  inverted?: boolean;
  className?: string;
}

const sizeMap = {
  sm: { width: 120, height: 32, textClass: "text-xs sm:text-sm" },
  md: { width: 160, height: 40, textClass: "text-sm sm:text-base" },
  lg: { width: 200, height: 50, textClass: "text-lg sm:text-xl" },
} as const;

/**
 * Centered spaced uppercase editorial wordmark matching the AERIS reference aesthetic,
 * configurable to render an official SVG/PNG logo asset when placed in /public/images/brand/.
 */
export function BrandLogo({
  logoSrc,
  href = "/",
  size = "md",
  inverted = false,
  className,
}: BrandLogoProps) {
  const dimensions = sizeMap[size];

  const content = logoSrc ? (
    <Image
      src={logoSrc}
      alt={BRAND.logo.alt}
      width={dimensions.width}
      height={dimensions.height}
      priority
      className={cn("h-auto w-auto max-h-9 object-contain", inverted && "brightness-0 invert")}
    />
  ) : (
    <span
      className={cn(
        "font-editorial font-medium uppercase tracking-[0.14em] sm:tracking-[0.26em] leading-none whitespace-nowrap",
        inverted ? "text-white" : "text-foreground",
        dimensions.textClass
      )}
    >
      {BRAND.name}
    </span>
  );

  if (!href) {
    return <div className={cn("inline-flex items-center", className)}>{content}</div>;
  }

  return (
    <Link
      href={href}
      aria-label={BRAND.name}
      className={cn(
        "inline-flex items-center rounded-[var(--radius-sm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className
      )}
    >
      {content}
    </Link>
  );
}
