import { Suspense } from "react";
import type { Metadata } from "next";
import { StorefrontShell } from "@/components/layout/storefront-shell";
import { Skeleton } from "@/components/ui/skeleton";
import { ShopCatalogue } from "@/features/products/shop-catalogue";
import { listPublishedCollections } from "@/lib/services/collection.service";
import {
  getAvailableFacets,
  listPublishedProducts,
} from "@/lib/services/product.service";

export const metadata: Metadata = {
  title: "Shop All Cotton Sarees",
  description:
    "Explore timeless Indian cotton sarees filtered by collection, color, fabric, occasion, and price.",
};

export default async function ShopPage() {
  const [{ products }, { collections }, availableFacets] = await Promise.all([
    listPublishedProducts(),
    listPublishedCollections(),
    getAvailableFacets(),
  ]);

  return (
    <StorefrontShell>
      <Suspense
        fallback={
          <div className="mx-auto max-w-[1280px] px-6 py-12 space-y-6">
            <Skeleton className="h-48 w-full rounded-[var(--radius-xl)]" />
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[3/4] rounded-[var(--radius-lg)]" />
              ))}
            </div>
          </div>
        }
      >
        <ShopCatalogue
          products={products}
          collections={collections}
          availableFacets={availableFacets}
          heading="Cotton Sarees"
          description="Explore timeless cotton sarees, thoughtfully curated for effortless elegance."
          breadcrumbCurrent="All Sarees"
        />
      </Suspense>
    </StorefrontShell>
  );
}
