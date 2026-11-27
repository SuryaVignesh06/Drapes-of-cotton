import type { MetadataRoute } from "next";
import { getPublicEnv } from "@/config/env";
import { listPublishedCollections } from "@/lib/services/collection.service";
import { listPublishedProducts } from "@/lib/services/product.service";

const STATIC_MODIFIED = new Date("2026-11-27T00:00:00.000Z");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { NEXT_PUBLIC_APP_URL } = getPublicEnv();
  const baseUrl = NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const [{ products }, { collections }] = await Promise.all([
    listPublishedProducts(),
    listPublishedCollections(),
  ]);

  const staticRoutes = [
    "",
    "/shop",
    "/collections",
    "/our-story",
    "/contact",
    "/faqs",
    "/policies/shipping",
    "/policies/returns",
    "/policies/privacy",
    "/policies/terms",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: STATIC_MODIFIED,
  }));

  const collectionRoutes = collections.map((col) => ({
    url: `${baseUrl}/collections/${col.slug}`,
    lastModified: STATIC_MODIFIED,
  }));

  const productRoutes = products.map((product) => ({
    url: `${baseUrl}/product/${product.slug}`,
    lastModified: new Date(product.updatedAt),
  }));

  return [...staticRoutes, ...collectionRoutes, ...productRoutes];
}
