import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { StorefrontShell } from "@/components/layout/storefront-shell";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductCard } from "@/features/products/product-card";
import { ProductDetailView } from "@/features/products/product-detail-view";
import { getPublicEnv } from "@/config/env";
import {
  getProductBySlug,
  getRelatedProducts,
} from "@/lib/services/product.service";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) {
    return { title: "Saree Not Found" };
  }

  const title = product.seoTitle ?? product.name;
  const description = product.seoDescription ?? product.shortDescription;
  const image = product.images[0]?.imageUrl;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: image ? [{ url: image }] : undefined,
    },
  };
}

async function ProductSlugContent({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const related = await getRelatedProducts(product, 4);
  const { NEXT_PUBLIC_APP_URL } = getPublicEnv();
  const baseUrl = NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    sku: product.sku,
    description: product.shortDescription,
    image: product.images.map((i) =>
      i.imageUrl.startsWith("http") ? i.imageUrl : `${baseUrl}${i.imageUrl}`
    ),
    brand: {
      "@type": "Brand",
      name: "Drapes of Cotton",
    },
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: (product.price / 100).toFixed(2),
      availability:
        product.stockQuantity > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      url: `${baseUrl}/product/${product.slug}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />

      <Section spacing="default" surface="ivory">
        <Container>
          <ProductDetailView product={product} />
        </Container>
      </Section>

      {related.length > 0 && (
        <Section spacing="spacious" surface="cream" className="border-t border-border">
          <Container>
            <div className="mb-8">
              <p className="text-label-meta text-muted-olive">Curated Pairings</p>
              <h2 className="text-section-heading mt-2 text-deep-earth-olive">
                You May Also Love
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              {related.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </Container>
        </Section>
      )}
    </>
  );
}

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <StorefrontShell>
      <Suspense fallback={<Skeleton className="mx-auto my-10 h-[540px] max-w-[1280px] rounded-[var(--radius-xl)]" />}>
        <ProductSlugContent params={params} />
      </Suspense>
    </StorefrontShell>
  );
}
