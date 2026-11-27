import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StorefrontShell } from "@/components/layout/storefront-shell";
import { Skeleton } from "@/components/ui/skeleton";
import { ShopCatalogue } from "@/features/products/shop-catalogue";
import {
  getCollectionBySlug,
  listPublishedCollections,
} from "@/lib/services/collection.service";
import {
  getAvailableFacets,
  listPublishedProducts,
} from "@/lib/services/product.service";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);
  if (!collection) {
    return { title: "Collection Not Found" };
  }

  return {
    title: collection.name,
    description:
      collection.description ??
      `Explore the ${collection.name} collection from Drapes of Cotton.`,
    openGraph: {
      title: `${collection.name} | Drapes of Cotton`,
      description: collection.description ?? undefined,
      images: collection.coverImage ? [{ url: collection.coverImage }] : undefined,
    },
  };
}

async function CollectionSlugContent({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [collection, { products }, { collections }, availableFacets] =
    await Promise.all([
      getCollectionBySlug(slug),
      listPublishedProducts(),
      listPublishedCollections(),
      getAvailableFacets(),
    ]);

  if (!collection) {
    notFound();
  }

  return (
    <ShopCatalogue
      products={products}
      collections={collections}
      availableFacets={availableFacets}
      heading={collection.name}
      description={
        collection.description ??
        "Thoughtfully selected cotton drapes crafted for understated everyday elegance."
      }
      breadcrumbCurrent={collection.name}
      heroImageUrl={collection.coverImage ?? "/images/banners/hero-saree.jpg"}
      heroImageAlt={`${collection.name} cotton saree collection`}
      lockedCollectionSlug={collection.slug}
    />
  );
}

export default function CollectionDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <StorefrontShell>
      <Suspense fallback={<Skeleton className="mx-auto my-10 h-96 max-w-[1280px] rounded-[var(--radius-xl)]" />}>
        <CollectionSlugContent params={params} />
      </Suspense>
    </StorefrontShell>
  );
}
