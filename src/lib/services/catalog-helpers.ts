import { PRICE_BUCKETS } from "@/lib/constants/store";
import type { Product, ProductFilterInput, SortOption } from "@/types";

export interface FilteredProductResult {
  items: Product[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Applies structured multi-facet filtering, search, sorting, and pagination
 * uniformly across both Supabase-backed and demonstration catalog lists.
 */
export function filterAndSortProducts(
  products: Product[],
  input: ProductFilterInput = {}
): FilteredProductResult {
  const {
    collection,
    fabrics = [],
    colors = [],
    occasions = [],
    weaves = [],
    priceBucket,
    minPricePaise,
    maxPricePaise,
    availability,
    blouseIncluded,
    isNew,
    isFeatured,
    search,
    sort = "featured",
    page = 1,
    pageSize = 12,
  } = input;

  let filtered = products.filter((p) => p.isPublished);

  if (collection && collection !== "all") {
    filtered = filtered.filter((p) =>
      p.collections.some((c) => c.slug === collection)
    );
  }

  if (fabrics.length > 0) {
    const set = new Set(fabrics.map((f) => f.toLowerCase()));
    filtered = filtered.filter((p) => set.has(p.fabric.toLowerCase()));
  }

  if (colors.length > 0) {
    const set = new Set(colors.map((c) => c.toLowerCase()));
    filtered = filtered.filter((p) => set.has(p.color.toLowerCase()));
  }

  if (occasions.length > 0) {
    const set = new Set(occasions.map((o) => o.toLowerCase()));
    filtered = filtered.filter((p) => set.has(p.occasion.toLowerCase()));
  }

  if (weaves.length > 0) {
    const set = new Set(weaves.map((w) => w.toLowerCase()));
    filtered = filtered.filter(
      (p) => p.weave && set.has(p.weave.toLowerCase())
    );
  }

  let effectiveMin = minPricePaise;
  let effectiveMax = maxPricePaise;
  if (priceBucket) {
    const bucket = PRICE_BUCKETS.find((b) => b.id === priceBucket);
    if (bucket) {
      effectiveMin = effectiveMin ?? bucket.minPaise;
      effectiveMax = effectiveMax ?? bucket.maxPaise;
    }
  }

  if (typeof effectiveMin === "number") {
    filtered = filtered.filter((p) => p.price >= effectiveMin);
  }
  if (typeof effectiveMax === "number") {
    filtered = filtered.filter((p) => p.price <= effectiveMax);
  }

  if (availability === "in-stock") {
    filtered = filtered.filter((p) => p.stockQuantity > 0);
  } else if (availability === "out-of-stock") {
    filtered = filtered.filter((p) => p.stockQuantity === 0);
  }

  if (blouseIncluded) {
    filtered = filtered.filter((p) => p.blousePieceIncluded);
  }
  if (isNew) {
    filtered = filtered.filter((p) => p.isNew);
  }
  if (isFeatured) {
    filtered = filtered.filter((p) => p.isFeatured);
  }

  if (search && search.trim().length > 0) {
    const q = search.trim().toLowerCase();
    filtered = filtered.filter((p) => {
      const haystack = [
        p.name,
        p.shortDescription,
        p.fabric,
        p.weave ?? "",
        p.color,
        p.occasion,
        p.sku,
        ...p.collections.map((c) => c.name),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }

  const sorted = sortProducts(filtered, sort);
  const totalCount = sorted.length;
  const safePageSize = Math.max(1, pageSize);
  const totalPages = Math.max(1, Math.ceil(totalCount / safePageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * safePageSize;

  return {
    items: sorted.slice(start, start + safePageSize),
    totalCount,
    page: safePage,
    pageSize: safePageSize,
    totalPages,
  };
}

function sortProducts(products: Product[], sort: SortOption): Product[] {
  const copy = [...products];
  switch (sort) {
    case "newest":
      return copy.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    case "price-asc":
      return copy.sort((a, b) => a.price - b.price);
    case "price-desc":
      return copy.sort((a, b) => b.price - a.price);
    case "alphabetical":
      return copy.sort((a, b) => a.name.localeCompare(b.name));
    case "best-selling":
      // Without sales velocity data in demo mode, prioritize in-stock featured & new pieces consistently
      return copy.sort(
        (a, b) =>
          Number(b.isFeatured) - Number(a.isFeatured) ||
          b.stockQuantity - a.stockQuantity
      );
    case "featured":
    default:
      return copy.sort(
        (a, b) =>
          Number(b.isFeatured) - Number(a.isFeatured) ||
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }
}
