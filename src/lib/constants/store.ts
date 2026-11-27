import type { ShippingMethodOption, SortOption } from "@/types";

export const STORE_NAV_LINKS = [
  { label: "Shop", href: "/shop" },
  { label: "All Sarees", href: "/shop?view=all" },
  { label: "Collections", href: "/collections" },
  { label: "New Arrivals", href: "/shop?sort=newest" },
  { label: "Our Story", href: "/our-story" },
] as const;

export const TRUST_VALUES = [
  {
    title: "Thoughtfully Curated",
    detail: "Each weave is selected for softness, drape, and timeless proportion.",
  },
  {
    title: "Natural Cotton",
    detail: "Breathable cotton textiles chosen for everyday comfort and poise.",
  },
  {
    title: "Timeless Style",
    detail: "Restrained borders and quiet palettes designed to endure seasons.",
  },
  {
    title: "Easy Shopping",
    detail: "Transparent INR pricing, saved wishlists, and verified checkout.",
  },
] as const;

export const CRAFT_PILLARS = [
  {
    eyebrow: "01 · Texture",
    title: "Organic Cotton Grain",
    description:
      "Unbleached and softly dyed cotton yarns carry subtle surface character—creating drapes that breathe easily from morning light into evening.",
    imageUrl: "/images/textures/craft-texture.jpg",
    imageAlt: "Close-up of natural unbleached ivory and oatmeal cotton textile weave",
  },
  {
    eyebrow: "02 · Border & Pallu",
    title: "Restrained Selvedge Proportions",
    description:
      "Clean muted-olive, taupe, and ivory border compositions frame the silhouette without distracting ornament.",
    imageUrl: "/images/textures/craft-border.svg",
    imageAlt: "Detail of muted olive and ivory woven cotton saree border",
  },
  {
    eyebrow: "03 · Drape & Care",
    title: "Crisp Pleats, Gentle Softening",
    description:
      "Balanced yarn density lets pleats settle neatly while natural washing softens the cotton gracefully over time.",
    imageUrl: "/images/textures/craft-drape.svg",
    imageAlt: "Soft cotton saree pleats arranged on warm sand linen surface",
  },
] as const;

export const COLOR_SWATCHES = [
  { label: "Ivory", value: "Ivory", hex: "#F7F2E7" },
  { label: "White", value: "White", hex: "#FFFFFF" },
  { label: "Beige", value: "Beige", hex: "#DDD2BE" },
  { label: "Green", value: "Green", hex: "#6C6D48" },
  { label: "Blue", value: "Blue", hex: "#4D6278" },
  { label: "Yellow", value: "Yellow", hex: "#D4A349" },
  { label: "Pink", value: "Pink", hex: "#D3A49D" },
  { label: "Black", value: "Black", hex: "#2E2E2B" },
  { label: "Multicolor", value: "Multicolor", hex: "linear-gradient(135deg, #6C6D48 0%, #D4A349 50%, #D3A49D 100%)" },
] as const;

export const PRICE_BUCKETS = [
  { id: "under-1000", label: "Under ₹1,000", minPaise: 0, maxPaise: 99999 },
  { id: "1000-2000", label: "₹1,000–₹2,000", minPaise: 100000, maxPaise: 200000 },
  { id: "2000-3000", label: "₹2,000–₹3,000", minPaise: 200000, maxPaise: 300000 },
  { id: "3000-5000", label: "₹3,000–₹5,000", minPaise: 300000, maxPaise: 500000 },
  { id: "above-5000", label: "Above ₹5,000", minPaise: 500001, maxPaise: undefined },
] as const;

export const FABRIC_OPTIONS = ["Cotton", "Cotton Blend"] as const;
export const OCCASION_OPTIONS = [
  "Everyday",
  "Office Wear",
  "Festive",
  "Casual",
  "Special Occasion",
] as const;

export const SORT_OPTIONS: Array<{ value: SortOption; label: string }> = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "New Arrivals" },
  { value: "best-selling", label: "Best Selling" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "alphabetical", label: "Alphabetical" },
];

export const DEFAULT_SHIPPING_METHODS: ShippingMethodOption[] = [
  {
    id: "standard",
    label: "Standard Insured Shipping",
    description: "Configurable standard shipping rate across serviceable Indian PIN codes",
    ratePaise: 15000,
  },
  {
    id: "express",
    label: "Express Priority Dispatch",
    description: "Priority dispatch where available",
    ratePaise: 30000,
  },
];

export const DEFAULT_COUPONS: Record<
  string,
  { type: "percent" | "fixed"; value: number; minSubtotalPaise: number }
> = {
  WELCOME10: { type: "percent", value: 10, minSubtotalPaise: 200000 },
};

export const INDIAN_STATES = [
  "Andhra Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Tamil Nadu",
  "Telangana",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
] as const;
