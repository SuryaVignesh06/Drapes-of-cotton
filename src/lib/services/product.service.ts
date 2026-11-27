import { DEMO_PRODUCTS } from "@/data/catalog";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isSupabasePublicConfigured } from "@/lib/supabase/config";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import type { Database, Product, ProductFilterInput, ProductImage } from "@/types";
import { filterAndSortProducts, type FilteredProductResult } from "./catalog-helpers";

type ProductRow = Database["public"]["Tables"]["products"]["Row"] & {
  product_images?: Database["public"]["Tables"]["product_images"]["Row"][];
  product_collections?: Array<{
    collections: Pick<
      Database["public"]["Tables"]["collections"]["Row"],
      "id" | "name" | "slug"
    > | null;
  }>;
  product_variants?: Database["public"]["Tables"]["product_variants"]["Row"][];
};

function mapProductRow(row: ProductRow): Product {
  const images: ProductImage[] = (row.product_images ?? [])
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((img) => ({
      id: img.id,
      productId: img.product_id,
      imageUrl: img.image_url,
      altText: img.alt_text,
      imageType: img.image_type,
      sortOrder: img.sort_order,
    }));

  const collections = (row.product_collections ?? [])
    .map((pc) => pc.collections)
    .filter((c): c is NonNullable<typeof c> => Boolean(c));

  const variants = (row.product_variants ?? []).map((v) => ({
    id: v.id,
    productId: v.product_id,
    name: v.name,
    sku: v.sku,
    price: v.price,
    stockQuantity: v.stock_quantity,
    attributes:
      typeof v.attributes === "object" && v.attributes !== null && !Array.isArray(v.attributes)
        ? (v.attributes as Record<string, string>)
        : {},
    isActive: v.is_active,
  }));

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    sku: row.sku,
    shortDescription: row.short_description,
    description: row.description,
    price: row.price,
    compareAtPrice: row.compare_at_price,
    currency: row.currency,
    fabric: row.fabric,
    weave: row.weave,
    color: row.color,
    occasion: row.occasion,
    sareeLength: row.saree_length,
    blousePieceLength: row.blouse_piece_length,
    blousePieceIncluded: row.blouse_piece_included,
    careInstructions: row.care_instructions,
    origin: row.origin,
    stockQuantity: row.stock_quantity,
    isFeatured: row.is_featured,
    isNew: row.is_new,
    isPublished: row.is_published,
    seoTitle: row.seo_title,
    seoDescription: row.seo_description,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    images,
    collections,
    variants,
  };
}

const PRODUCT_SELECT = `
  *,
  product_images(*),
  product_collections(collections(id, name, slug)),
  product_variants(*)
`;

/**
 * Fetches all published products from Supabase when configured,
 * falling back cleanly to the read-only demonstration catalog otherwise.
 */
export async function listPublishedProducts(): Promise<{
  products: Product[];
  source: "supabase" | "demo";
}> {
  const client = createSupabasePublicClient();
  if (!client) {
    return { products: DEMO_PRODUCTS, source: "demo" };
  }

  const { data, error } = await client
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  if (error || !data) {
    return { products: DEMO_PRODUCTS, source: "demo" };
  }

  if (data.length === 0) {
    return { products: [], source: "supabase" };
  }

  return {
    products: (data as unknown as ProductRow[]).map(mapProductRow),
    source: "supabase",
  };
}

export async function getFilteredProducts(
  filters: ProductFilterInput = {}
): Promise<FilteredProductResult & { source: "supabase" | "demo" }> {
  const { products, source } = await listPublishedProducts();
  return {
    ...filterAndSortProducts(products, filters),
    source,
  };
}

export async function getFeaturedProducts(limit = 4): Promise<Product[]> {
  const { products } = await listPublishedProducts();
  const featured = products.filter((p) => p.isFeatured);
  return (featured.length > 0 ? featured : products).slice(0, limit);
}

export async function getNewArrivals(limit = 4): Promise<Product[]> {
  const { products } = await listPublishedProducts();
  return products
    .slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const client = createSupabasePublicClient();
  if (!client) {
    return DEMO_PRODUCTS.find((p) => p.slug === slug && p.isPublished) ?? null;
  }

  const { data, error } = await client
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (error) {
    return DEMO_PRODUCTS.find((p) => p.slug === slug && p.isPublished) ?? null;
  }

  return data ? mapProductRow(data as unknown as ProductRow) : null;
}

export async function getRelatedProducts(
  product: Product,
  limit = 4
): Promise<Product[]> {
  const { products } = await listPublishedProducts();
  const productCollectionSlugs = new Set(product.collections.map((c) => c.slug));

  const scored = products
    .filter((candidate) => candidate.id !== product.id)
    .map((candidate) => {
      let score = 0;
      if (candidate.collections.some((c) => productCollectionSlugs.has(c.slug))) {
        score += 4;
      }
      if (candidate.color.toLowerCase() === product.color.toLowerCase()) score += 2;
      if (candidate.fabric.toLowerCase() === product.fabric.toLowerCase()) score += 2;
      if (candidate.occasion.toLowerCase() === product.occasion.toLowerCase()) score += 1;
      return { candidate, score };
    })
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map((s) => s.candidate);
}

export async function searchCatalogProducts(query: string, limit = 6): Promise<Product[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];
  const { products } = await listPublishedProducts();
  return filterAndSortProducts(products, { search: trimmed, pageSize: limit }).items;
}

export async function getAvailableFacets(): Promise<{
  fabrics: string[];
  colors: string[];
  occasions: string[];
  weaves: string[];
}> {
  const { products } = await listPublishedProducts();
  const fabrics = Array.from(new Set(products.map((p) => p.fabric))).sort();
  const colors = Array.from(new Set(products.map((p) => p.color))).sort();
  const occasions = Array.from(new Set(products.map((p) => p.occasion))).sort();
  const weaves = Array.from(
    new Set(products.map((p) => p.weave).filter((w): w is string => Boolean(w)))
  ).sort();

  return { fabrics, colors, occasions, weaves };
}

/**
 * Admin product listing (includes unpublished drafts).
 */
export async function listAllProductsAdmin(): Promise<Product[]> {
  if (!isSupabasePublicConfigured()) {
    throw new Error("Supabase is not configured.");
  }
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("products")
    .select(PRODUCT_SELECT)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch products: ${error.message}`);
  }

  return (data as unknown as ProductRow[]).map(mapProductRow);
}
