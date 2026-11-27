import { BRAND } from "@/lib/constants";

/**
 * Site-wide metadata and storefront shell configuration.
 */
export const siteConfig = {
  name: BRAND.name,
  tagline: BRAND.tagline,
  description: BRAND.description,
  locale: "en-IN",
  currency: "INR",
} as const;
