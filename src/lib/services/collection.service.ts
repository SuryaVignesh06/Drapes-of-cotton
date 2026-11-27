import { DEMO_COLLECTIONS } from "@/data/catalog";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import type { Collection, Database } from "@/types";
import { listPublishedProducts } from "./product.service";

type CollectionRow = Database["public"]["Tables"]["collections"]["Row"];

function mapCollectionRow(row: CollectionRow): Collection {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    coverImage: row.cover_image,
    isFeatured: row.is_featured,
    isPublished: row.is_published,
    sortOrder: row.sort_order,
  };
}

export async function listPublishedCollections(): Promise<{
  collections: Collection[];
  source: "supabase" | "demo";
}> {
  const client = createSupabasePublicClient();
  if (!client) {
    return { collections: DEMO_COLLECTIONS, source: "demo" };
  }

  const { data, error } = await client
    .from("collections")
    .select("*")
    .eq("is_published", true)
    .order("sort_order", { ascending: true });

  if (error || !data) {
    return { collections: DEMO_COLLECTIONS, source: "demo" };
  }

  return {
    collections: data.map(mapCollectionRow),
    source: "supabase",
  };
}

export async function getFeaturedCollections(limit = 4): Promise<Collection[]> {
  const { collections } = await listPublishedCollections();
  const featured = collections.filter((c) => c.isFeatured);
  return (featured.length > 0 ? featured : collections).slice(0, limit);
}

export async function getCollectionBySlug(slug: string): Promise<Collection | null> {
  const { collections } = await listPublishedCollections();
  const match = collections.find((c) => c.slug === slug);
  if (!match) return null;

  const { products } = await listPublishedProducts();
  const count = products.filter((p) =>
    p.collections.some((c) => c.slug === slug)
  ).length;

  return { ...match, productCount: count };
}
