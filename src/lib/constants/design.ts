/**
 * 8px-oriented design scale and layout tokens shared across TypeScript modules.
 */
export const SPACING_SCALE = {
  micro: "4px",
  small: "8px",
  compact: "12px",
  standard: "16px",
  component: "24px",
  section: "32px",
  large: "48px",
  hero: "64px",
  majorSection: "80px",
} as const;

export const RADIUS_SCALE = {
  smallElement: "8px",
  button: "12px",
  productCard: "20px",
  largePanel: "24px",
  pill: "999px",
} as const;
