"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { ProductCard } from "@/features/products/product-card";
import {
  COLOR_SWATCHES,
  PRICE_BUCKETS,
  SORT_OPTIONS,
} from "@/lib/constants/store";
import { filterAndSortProducts } from "@/lib/services/catalog-helpers";
import { cn, rupeesToPaise } from "@/lib/utils";
import type { Collection, Product, SortOption } from "@/types";

interface ShopCatalogueProps {
  products: Product[];
  collections: Collection[];
  availableFacets: {
    fabrics: string[];
    colors: string[];
    occasions: string[];
    weaves: string[];
  };
  heading: string;
  description: string;
  breadcrumbCurrent: string;
  heroImageUrl?: string;
  heroImageAlt?: string;
  lockedCollectionSlug?: string;
}

function parseListParam(value: string | null): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

export function ShopCatalogue({
  products,
  collections,
  availableFacets,
  heading,
  description,
  breadcrumbCurrent,
  lockedCollectionSlug,
}: ShopCatalogueProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const selectedCollection =
    lockedCollectionSlug ?? searchParams.get("collection") ?? "all";
  const selectedFabrics = parseListParam(searchParams.get("fabric"));
  const selectedColors = parseListParam(searchParams.get("color"));
  const selectedOccasions = parseListParam(searchParams.get("occasion"));
  const selectedWeaves = parseListParam(searchParams.get("weave"));
  const priceBucket = searchParams.get("price") ?? "";
  const minRupeesParam = searchParams.get("minPrice") ?? "";
  const maxRupeesParam = searchParams.get("maxPrice") ?? "";
  const availability =
    (searchParams.get("availability") as "in-stock" | "out-of-stock" | null) ??
    undefined;
  const blouseIncluded = searchParams.get("blouse") === "1";
  const isNew = searchParams.get("new") === "1";
  const isFeatured = searchParams.get("featured") === "1";
  const searchQuery = searchParams.get("search") ?? "";
  const sort = (searchParams.get("sort") as SortOption | null) ?? "featured";
  const page = Math.max(1, Number(searchParams.get("page") ?? "1") || 1);

  const [customMin, setCustomMin] = useState(minRupeesParam);
  const [customMax, setCustomMax] = useState(maxRupeesParam);

  const minPricePaise =
    minRupeesParam && !Number.isNaN(Number(minRupeesParam))
      ? rupeesToPaise(Number(minRupeesParam))
      : undefined;
  const maxPricePaise =
    maxRupeesParam && !Number.isNaN(Number(maxRupeesParam))
      ? rupeesToPaise(Number(maxRupeesParam))
      : undefined;

  const facetCounts = useMemo(() => {
    const published = products.filter((p) => p.isPublished);
    const total = Math.max(1, published.length);
    const byCollection = new Map<string, number>();
    const byFabric = new Map<string, number>();
    const byOccasion = new Map<string, number>();
    const byPriceBucket = new Map<string, number>();
    let inStockCount = 0;

    for (const p of published) {
      if (p.stockQuantity > 0) inStockCount++;
      byFabric.set(p.fabric, (byFabric.get(p.fabric) ?? 0) + 1);
      byOccasion.set(p.occasion, (byOccasion.get(p.occasion) ?? 0) + 1);
      for (const c of p.collections) {
        byCollection.set(c.slug, (byCollection.get(c.slug) ?? 0) + 1);
      }
      for (const b of PRICE_BUCKETS) {
        if (
          p.price >= b.minPaise &&
          (b.maxPaise === undefined || p.price <= b.maxPaise)
        ) {
          byPriceBucket.set(b.id, (byPriceBucket.get(b.id) ?? 0) + 1);
        }
      }
    }

    return {
      total,
      inStockCount,
      byCollection,
      byFabric,
      byOccasion,
      byPriceBucket,
    };
  }, [products]);

  const filteredResult = useMemo(
    () =>
      filterAndSortProducts(products, {
        collection: selectedCollection,
        fabrics: selectedFabrics,
        colors: selectedColors,
        occasions: selectedOccasions,
        weaves: selectedWeaves,
        priceBucket: priceBucket || undefined,
        minPricePaise,
        maxPricePaise,
        availability,
        blouseIncluded,
        isNew,
        isFeatured,
        search: searchQuery || undefined,
        sort,
        page,
        pageSize: 12,
      }),
    [
      products,
      selectedCollection,
      selectedFabrics,
      selectedColors,
      selectedOccasions,
      selectedWeaves,
      priceBucket,
      minPricePaise,
      maxPricePaise,
      availability,
      blouseIncluded,
      isNew,
      isFeatured,
      searchQuery,
      sort,
      page,
    ]
  );

  function updateParams(mutate: (next: URLSearchParams) => void) {
    const next = new URLSearchParams(searchParams.toString());
    mutate(next);
    next.delete("page");
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  function toggleMultiValue(key: string, value: string) {
    updateParams((next) => {
      const current = parseListParam(next.get(key));
      const exists = current.includes(value);
      const updated = exists
        ? current.filter((v) => v !== value)
        : [...current, value];
      if (updated.length > 0) {
        next.set(key, updated.join(","));
      } else {
        next.delete(key);
      }
    });
  }

  function applyCustomPrice() {
    updateParams((next) => {
      next.delete("price");
      if (customMin.trim()) next.set("minPrice", customMin.trim());
      else next.delete("minPrice");
      if (customMax.trim()) next.set("maxPrice", customMax.trim());
      else next.delete("maxPrice");
    });
  }

  function clearAllFilters() {
    setCustomMin("");
    setCustomMax("");
    const next = new URLSearchParams();
    if (sort !== "featured") next.set("sort", sort);
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  const activeChips: Array<{ id: string; label: string; onRemove: () => void }> = [];
  if (!lockedCollectionSlug && selectedCollection !== "all") {
    const colName =
      collections.find((c) => c.slug === selectedCollection)?.name ??
      selectedCollection;
    activeChips.push({
      id: `col-${selectedCollection}`,
      label: colName,
      onRemove: () => updateParams((n) => n.delete("collection")),
    });
  }
  selectedFabrics.forEach((f) =>
    activeChips.push({
      id: `fab-${f}`,
      label: f,
      onRemove: () => toggleMultiValue("fabric", f),
    })
  );
  selectedColors.forEach((c) =>
    activeChips.push({
      id: `colr-${c}`,
      label: c,
      onRemove: () => toggleMultiValue("color", c),
    })
  );
  selectedOccasions.forEach((o) =>
    activeChips.push({
      id: `occ-${o}`,
      label: o,
      onRemove: () => toggleMultiValue("occasion", o),
    })
  );
  selectedWeaves.forEach((w) =>
    activeChips.push({
      id: `wv-${w}`,
      label: w,
      onRemove: () => toggleMultiValue("weave", w),
    })
  );
  if (priceBucket) {
    const label =
      PRICE_BUCKETS.find((b) => b.id === priceBucket)?.label ?? priceBucket;
    activeChips.push({
      id: `pb-${priceBucket}`,
      label,
      onRemove: () => updateParams((n) => n.delete("price")),
    });
  }
  if (minRupeesParam || maxRupeesParam) {
    activeChips.push({
      id: "custom-price",
      label: `₹${minRupeesParam || "0"} – ₹${maxRupeesParam || "∞"}`,
      onRemove: () => {
        setCustomMin("");
        setCustomMax("");
        updateParams((n) => {
          n.delete("minPrice");
          n.delete("maxPrice");
        });
      },
    });
  }
  if (availability) {
    activeChips.push({
      id: `avail-${availability}`,
      label: availability === "in-stock" ? "In Stock" : "Out of Stock",
      onRemove: () => updateParams((n) => n.delete("availability")),
    });
  }
  if (blouseIncluded) {
    activeChips.push({
      id: "blouse",
      label: "Blouse Piece Included",
      onRemove: () => updateParams((n) => n.delete("blouse")),
    });
  }
  if (isNew) {
    activeChips.push({
      id: "new",
      label: "New Arrivals",
      onRemove: () => updateParams((n) => n.delete("new")),
    });
  }
  if (isFeatured) {
    activeChips.push({
      id: "featured",
      label: "Featured",
      onRemove: () => updateParams((n) => n.delete("featured")),
    });
  }
  if (searchQuery) {
    activeChips.push({
      id: "search",
      label: `Search: "${searchQuery}"`,
      onRemove: () => updateParams((n) => n.delete("search")),
    });
  }

  const filterPanelContent = (
    <div className="space-y-5 text-sm">
      {!lockedCollectionSlug && (
        <div className="space-y-2">
          <h3 className="text-xs font-medium text-muted-foreground">
            Collection
          </h3>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => updateParams((n) => n.delete("collection"))}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-[6px] border px-2.5 py-1 text-xs transition-colors",
                selectedCollection === "all"
                  ? "border-foreground bg-primary text-primary-foreground font-medium"
                  : "border-border bg-surface text-foreground hover:bg-surface-cotton"
              )}
            >
              <span>All</span>
              <span className="opacity-70">{facetCounts.total}</span>
            </button>
            {collections.map((col) => {
              const count = facetCounts.byCollection.get(col.slug) ?? 0;
              const active = selectedCollection === col.slug;
              return (
                <button
                  key={col.id}
                  type="button"
                  onClick={() =>
                    updateParams((n) => n.set("collection", col.slug))
                  }
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-[6px] border px-2.5 py-1 text-xs transition-colors",
                    active
                      ? "border-foreground bg-primary text-primary-foreground font-medium"
                      : "border-border bg-surface text-foreground hover:bg-surface-cotton"
                  )}
                >
                  <span>{col.name}</span>
                  <span className="opacity-70">{count}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <h3 className="text-xs font-medium text-muted-foreground">Fabric</h3>
        <div className="flex flex-wrap gap-1.5">
          {availableFacets.fabrics.map((fabric) => {
            const active = selectedFabrics.includes(fabric);
            const count = facetCounts.byFabric.get(fabric) ?? 0;
            return (
              <button
                key={fabric}
                type="button"
                onClick={() => toggleMultiValue("fabric", fabric)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-[6px] border px-2.5 py-1 text-xs transition-colors",
                  active
                    ? "border-foreground bg-primary text-primary-foreground font-medium"
                    : "border-border bg-surface text-foreground hover:bg-surface-cotton"
                )}
              >
                <span>{fabric}</span>
                <span className="opacity-70">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-xs font-medium text-muted-foreground">Color</h3>
        <div className="flex flex-wrap gap-2">
          {COLOR_SWATCHES.map((swatch) => {
            const active = selectedColors.includes(swatch.value);
            return (
              <button
                key={swatch.value}
                type="button"
                onClick={() => toggleMultiValue("color", swatch.value)}
                aria-label={`Filter by color ${swatch.label}`}
                aria-pressed={active}
                title={swatch.label}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors",
                  active
                    ? "border-foreground bg-primary text-primary-foreground font-medium"
                    : "border-border bg-surface text-foreground hover:bg-surface-cotton"
                )}
              >
                <span
                  aria-hidden="true"
                  className="size-3 rounded-full border border-border"
                  style={{ background: swatch.hex }}
                />
                {swatch.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-xs font-medium text-muted-foreground">Occasion</h3>
        <div className="flex flex-wrap gap-1.5">
          {availableFacets.occasions.map((occasion) => {
            const active = selectedOccasions.includes(occasion);
            const count = facetCounts.byOccasion.get(occasion) ?? 0;
            return (
              <button
                key={occasion}
                type="button"
                onClick={() => toggleMultiValue("occasion", occasion)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-[6px] border px-2.5 py-1 text-xs transition-colors",
                  active
                    ? "border-foreground bg-primary text-primary-foreground font-medium"
                    : "border-border bg-surface text-foreground hover:bg-surface-cotton"
                )}
              >
                <span>{occasion}</span>
                <span className="opacity-70">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-xs font-medium text-muted-foreground">Price</h3>
        <div className="space-y-1.5">
          {PRICE_BUCKETS.map((bucket) => {
            const active = priceBucket === bucket.id;
            const count = facetCounts.byPriceBucket.get(bucket.id) ?? 0;
            const pct = Math.round((count / facetCounts.total) * 100);
            return (
              <button
                key={bucket.id}
                type="button"
                onClick={() =>
                  updateParams((n) => {
                    n.delete("minPrice");
                    n.delete("maxPrice");
                    if (active) n.delete("price");
                    else n.set("price", bucket.id);
                  })
                }
                className={cn(
                  "flex w-full items-center gap-2 rounded-[6px] px-1.5 py-1 text-left text-xs transition-colors",
                  active
                    ? "bg-surface-cotton font-semibold text-foreground"
                    : "text-foreground hover:bg-surface-cotton/70"
                )}
              >
                <span className="w-[88px] shrink-0 truncate">{bucket.label}</span>
                <span className="relative h-1 flex-1 overflow-hidden rounded-full bg-surface-cotton">
                  <span
                    className="absolute inset-y-0 left-0 rounded-full bg-foreground"
                    style={{ width: `${Math.max(count > 0 ? 12 : 0, pct)}%` }}
                  />
                </span>
                <span className="w-4 text-right text-[11px] text-muted-foreground">
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="pt-1 flex items-center gap-1.5">
          <Input
            type="number"
            min={0}
            placeholder="₹ Min"
            aria-label="Minimum price in INR"
            value={customMin}
            onChange={(e) => setCustomMin(e.target.value)}
            className="h-8 bg-surface text-xs"
          />
          <Input
            type="number"
            min={0}
            placeholder="₹ Max"
            aria-label="Maximum price in INR"
            value={customMax}
            onChange={(e) => setCustomMax(e.target.value)}
            className="h-8 bg-surface text-xs"
          />
          <Button
            type="button"
            variant="secondary"
            size="xs"
            onClick={applyCustomPrice}
            className="h-8 shrink-0"
          >
            Go
          </Button>
        </div>
      </div>

      {availableFacets.weaves.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-medium text-muted-foreground">Weave</h3>
          <div className="flex flex-wrap gap-1.5">
            {availableFacets.weaves.map((weave) => {
              const active = selectedWeaves.includes(weave);
              return (
                <button
                  key={weave}
                  type="button"
                  onClick={() => toggleMultiValue("weave", weave)}
                  className={cn(
                    "rounded-[6px] border px-2.5 py-1 text-[11px] transition-colors",
                    active
                      ? "border-foreground bg-primary text-primary-foreground font-medium"
                      : "border-border bg-surface text-foreground hover:bg-surface-cotton"
                  )}
                >
                  {weave}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="space-y-3 border-t border-border pt-4">
        <h3 className="text-xs font-medium text-muted-foreground">
          Availability
        </h3>
        <label className="flex cursor-pointer items-center justify-between text-xs text-foreground">
          <span>
            In stock{" "}
            <span className="text-muted-foreground">
              {facetCounts.inStockCount}
            </span>
          </span>
          <Switch
            checked={availability === "in-stock"}
            onCheckedChange={(checked) =>
              updateParams((n) => {
                if (checked) n.set("availability", "in-stock");
                else n.delete("availability");
              })
            }
          />
        </label>
        <label className="flex cursor-pointer items-center justify-between text-xs text-foreground">
          <span>Blouse piece included</span>
          <Switch
            checked={blouseIncluded}
            onCheckedChange={(checked) =>
              updateParams((n) => {
                if (checked) n.set("blouse", "1");
                else n.delete("blouse");
              })
            }
          />
        </label>
        <label className="flex cursor-pointer items-center justify-between text-xs text-foreground">
          <span>New arrivals</span>
          <Switch
            checked={isNew}
            onCheckedChange={(checked) =>
              updateParams((n) => {
                if (checked) n.set("new", "1");
                else n.delete("new");
              })
            }
          />
        </label>
      </div>
    </div>
  );

  return (
    <div className="bg-background pb-16">
      <section className="border-b border-border py-8 sm:py-10">
        <Container>
          <div className="max-w-2xl space-y-2.5">
            <nav
              aria-label="Breadcrumb"
              className="flex items-center gap-1.5 text-xs text-muted-foreground"
            >
              <Link href="/" className="hover:text-foreground">
                Home
              </Link>
              <span>/</span>
              <Link href="/shop" className="hover:text-foreground">
                Shop
              </Link>
              <span>/</span>
              <span className="text-foreground">{breadcrumbCurrent}</span>
            </nav>

            <h1 className="text-display-editorial text-foreground">
              / {heading}
            </h1>

            <p className="text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          </div>
        </Container>
      </section>

      <Container className="pt-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
          {/* Desktop Left Filter Rail */}
          <aside
            aria-label="Product Filters"
            className="hidden w-[252px] shrink-0 rounded-[12px] border border-border bg-surface p-5 lg:block"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">Filters</h2>
              {activeChips.length > 0 && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="text-xs font-medium text-foreground underline"
                >
                  Clear All
                </button>
              )}
            </div>
            {filterPanelContent}
          </aside>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-5">
              <div className="flex items-center gap-3">
                <Sheet
                  open={mobileFiltersOpen}
                  onOpenChange={setMobileFiltersOpen}
                >
                  <SheetTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-[8px] lg:hidden"
                    >
                      <SlidersHorizontal className="size-3.5" />
                      Filters
                      {activeChips.length > 0 && ` (${activeChips.length})`}
                    </Button>
                  </SheetTrigger>
                  <SheetContent
                    side="left"
                    className="w-[88vw] max-w-sm overflow-y-auto bg-background p-6"
                  >
                    <SheetHeader className="mb-4 border-b border-border pb-3 text-left">
                      <SheetTitle className="font-editorial text-xl font-medium text-foreground">
                        Filters
                      </SheetTitle>
                    </SheetHeader>
                    {filterPanelContent}
                  </SheetContent>
                </Sheet>

                <p className="text-xs font-medium text-muted-foreground">
                  {filteredResult.totalCount}{" "}
                  {filteredResult.totalCount === 1 ? "saree" : "sarees"}
                </p>
              </div>

              <div className="flex items-center gap-2 rounded-[8px] border border-border bg-surface px-3 py-1">
                <span className="text-xs text-muted-foreground">Sort by</span>
                <Select
                  value={sort}
                  onValueChange={(value) =>
                    updateParams((n) => n.set("sort", value))
                  }
                >
                  <SelectTrigger
                    aria-label="Sort sarees"
                    className="h-7 w-auto min-w-[130px] border-0 bg-transparent px-1 text-xs font-medium text-foreground shadow-none focus-visible:ring-0"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SORT_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {activeChips.length > 0 && (
              <div className="mb-5 flex flex-wrap items-center gap-2">
                {activeChips.map((chip) => (
                  <button
                    key={chip.id}
                    type="button"
                    onClick={chip.onRemove}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-xs text-foreground hover:bg-surface-cotton"
                  >
                    <span>{chip.label}</span>
                    <X className="size-3 text-muted-foreground" />
                  </button>
                ))}
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  onClick={clearAllFilters}
                >
                  Clear All
                </Button>
              </div>
            )}

            {filteredResult.items.length === 0 ? (
              <div className="rounded-[12px] border border-border bg-surface px-6 py-16 text-center">
                <p className="text-section-heading text-foreground">
                  No cotton sarees match your current selection
                </p>
                <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                  Try adjusting your price range or clearing a few filters.
                </p>
                <Button onClick={clearAllFilters} className="mt-6">
                  Clear All Filters
                </Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-4 min-[380px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                  {filteredResult.items.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {filteredResult.totalPages > 1 && (
                  <div className="mt-10 flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={filteredResult.page <= 1}
                      onClick={() => {
                        const next = new URLSearchParams(searchParams.toString());
                        next.set("page", String(filteredResult.page - 1));
                        router.replace(`${pathname}?${next.toString()}`);
                      }}
                    >
                      Previous
                    </Button>
                    <span className="px-3 text-xs text-muted-foreground">
                      Page {filteredResult.page} of {filteredResult.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={filteredResult.page >= filteredResult.totalPages}
                      onClick={() => {
                        const next = new URLSearchParams(searchParams.toString());
                        next.set("page", String(filteredResult.page + 1));
                        router.replace(`${pathname}?${next.toString()}`);
                      }}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}
