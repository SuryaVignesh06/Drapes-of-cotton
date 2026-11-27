import { existsSync } from "node:fs";
import path from "node:path";
import { BRAND } from "@/lib/constants";

/**
 * Resolves the official brand logo asset path on the server if placed in /public/images/brand/.
 * Prevents browser 404 console errors while awaiting official artwork upload.
 */
export function resolveBrandLogoAsset(): string | null {
  const publicDir = path.join(process.cwd(), "public");
  const svgFile = path.join(publicDir, "images", "brand", "logo.svg");
  if (existsSync(svgFile)) {
    return BRAND.logo.svgPath;
  }

  const pngFile = path.join(publicDir, "images", "brand", "logo.png");
  if (existsSync(pngFile)) {
    return BRAND.logo.pngPath;
  }

  return null;
}
