"use client";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/**
 * Custom Next.js image loader for static exports on sub-paths (e.g., GitHub Pages).
 * Prepends NEXT_PUBLIC_BASE_PATH to root-relative image paths so local assets resolve.
 */
export default function staticImageLoader({ src }: { src: string }) {
  if (src.startsWith("/") && basePath && !src.startsWith(`${basePath}/`)) {
    return `${basePath}${src}`;
  }
  return src;
}
