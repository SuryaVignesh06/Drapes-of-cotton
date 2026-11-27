import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/layout/container";
import { StorefrontShell } from "@/components/layout/storefront-shell";
import { NewArrivalsTabs } from "@/features/products/new-arrivals-tabs";
import { listPublishedCollections } from "@/lib/services/collection.service";
import { listPublishedProducts } from "@/lib/services/product.service";

export const metadata: Metadata = {
  title: "Drapes of Cotton — Curated Indian Cotton Sarees",
  description:
    "Discover thoughtfully curated Indian cotton sarees crafted for understated elegance, breathable comfort, and timeless draping.",
  openGraph: {
    title: "Drapes of Cotton — Curated Indian Cotton Sarees",
    description:
      "Discover thoughtfully curated Indian cotton sarees crafted for understated elegance, breathable comfort, and timeless draping.",
    images: [{ url: "/images/banners/hero-saree.jpg" }],
  },
};

export default async function HomePage() {
  const [{ products }, { collections }] = await Promise.all([
    listPublishedProducts(),
    listPublishedCollections(),
  ]);

  const capsuleCollections = collections.slice(0, 4);

  return (
    <StorefrontShell>
      {/* 1. Full-Bleed Editorial Hero (AERIS Composition) */}
      <section className="relative w-full overflow-hidden bg-[#5B6874]">
        <div className="relative h-[470px] sm:h-[560px] lg:h-[640px] w-full">
          <Image
            src="/images/banners/hero-saree.jpg"
            alt="Curated natural cotton saree gracefully draped in daylight"
            fill
            loading="eager"
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#2D3842]/75 via-[#2D3842]/45 to-transparent" />

          <Container className="relative z-10 flex h-full items-center">
            <div className="max-w-md space-y-4 text-white">
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/85">
                New Collection
              </p>
              <h1 className="text-4xl font-medium uppercase leading-[1.06] tracking-[-0.015em] sm:text-5xl lg:text-[54px]">
                Grace.
                <br />
                Simplicity.
                <br />
                Cotton.
              </h1>
              <p className="max-w-sm text-xs sm:text-sm leading-relaxed text-white/85">
                Breathable Indian cotton sarees chosen for quiet texture, poise,
                and timeless everyday wear.
              </p>
              <div className="pt-2">
                <Link
                  href="/shop"
                  className="inline-flex h-10 items-center justify-center bg-white px-6 text-xs font-medium text-[#1A1A18] transition-colors hover:bg-[#F3F2EF]"
                >
                  Explore Collection
                </Link>
              </div>
            </div>
          </Container>
        </div>
      </section>

      <Container>
        {/* 2. Centered NEW ARRIVALS with Tabs + 6-Column Strip */}
        <NewArrivalsTabs products={products} />

        {/* 3. Asymmetric Editorial Bento Grid */}
        <section className="py-4 sm:py-6">
          <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-3 lg:grid-rows-2">
            {/* Tall Left Feature */}
            <Link
              href="/collections/handloom-collection"
              className="group relative min-h-[380px] overflow-hidden bg-surface-cotton lg:row-span-2 lg:min-h-[540px]"
            >
              <Image
                src="/images/banners/story-cotton.jpg"
                alt="Handloom & signature natural cotton sarees"
                fill
                sizes="(max-width: 1024px) 100vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-[#1A1A18]/50 via-transparent to-[#1A1A18]/45" />
              <div className="relative z-10 flex h-full flex-col justify-between p-6 text-white">
                <div className="space-y-1.5">
                  <h2 className="text-lg font-medium uppercase tracking-[0.04em]">
                    Signature Weaves
                  </h2>
                  <p className="max-w-[200px] text-xs text-white/85">
                    Natural cotton textures built for effortless daily poise.
                  </p>
                </div>
                <span className="inline-flex items-center gap-2 text-xs font-medium">
                  Explore <ArrowRight className="size-3.5" />
                </span>
              </div>
            </Link>

            {/* Top-Middle Light Studio Tile */}
            <Link
              href="/collections/everyday-cotton"
              className="group relative min-h-[255px] overflow-hidden bg-surface-cotton"
            >
              <Image
                src="/images/collections/everyday-cotton.jpg"
                alt="Everyday cotton saree drape"
                fill
                sizes="(max-width: 1024px) 100vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#F9F8F6]/85 via-[#F9F8F6]/45 to-transparent" />
              <div className="relative z-10 flex h-full flex-col justify-between p-6 text-foreground">
                <div className="space-y-1">
                  <h2 className="text-base font-medium uppercase tracking-[0.04em]">
                    Everyday Drapes
                  </h2>
                  <p className="max-w-[180px] text-xs text-muted-foreground">
                    Light, airy cottons for warm mornings.
                  </p>
                </div>
                <span className="inline-flex items-center gap-2 text-xs font-medium">
                  Explore <ArrowRight className="size-3.5" />
                </span>
              </div>
            </Link>

            {/* Top-Right Clean Border Tile */}
            <Link
              href="/collections/classic-cotton"
              className="group relative min-h-[255px] overflow-hidden bg-surface-cotton"
            >
              <Image
                src="/images/collections/classic-cotton.jpg"
                alt="Classic cotton saree borders"
                fill
                sizes="(max-width: 1024px) 100vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#F9F8F6]/85 via-[#F9F8F6]/45 to-transparent" />
              <div className="relative z-10 flex h-full flex-col justify-between p-6 text-foreground">
                <div className="space-y-1">
                  <h2 className="text-base font-medium uppercase tracking-[0.04em]">
                    Classic Borders
                  </h2>
                  <p className="max-w-[180px] text-xs text-muted-foreground">
                    Restrained selvedge &amp; crisp pleats.
                  </p>
                </div>
                <span className="inline-flex items-center gap-2 text-xs font-medium">
                  Explore <ArrowRight className="size-3.5" />
                </span>
              </div>
            </Link>

            {/* Bottom-Right Wide Feature Banner */}
            <div className="group relative min-h-[255px] overflow-hidden bg-[#5B6874] lg:col-span-2">
              <Image
                src="/images/products/kora-ivory-olive-main.jpg"
                alt="Curated cotton saree seasonal edit"
                fill
                sizes="(max-width: 1024px) 100vw, 66vw"
                className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.02]"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#2D3842]/80 via-[#2D3842]/45 to-transparent" />
              <div className="relative z-10 flex h-full flex-col justify-center p-7 text-white sm:p-10">
                <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-white/85">
                  Curated Edit
                </p>
                <h2 className="mt-1 text-3xl font-medium tracking-tight sm:text-4xl">
                  From ₹1,890
                </h2>
                <p className="mt-2 max-w-xs text-xs text-white/85">
                  Selected cotton sarees with direct WhatsApp &amp; online ordering.
                </p>
                <div className="mt-5">
                  <Link
                    href="/shop"
                    className="inline-flex h-9 items-center justify-center bg-white px-5 text-xs font-medium text-[#1A1A18] transition-colors hover:bg-[#F3F2EF]"
                  >
                    Shop Collection
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Centered Seasonal Capsule (4 Tall Editorial Cards) */}
        <section className="py-12 sm:py-16">
          <h2 className="text-center text-2xl font-medium uppercase tracking-[0.06em] text-foreground sm:text-[28px]">
            The Cotton Capsule
          </h2>

          <div className="mt-8 grid grid-cols-1 gap-3.5 min-[420px]:grid-cols-2 lg:grid-cols-4">
            {capsuleCollections.map((collection) => (
              <Link
                key={collection.id}
                href={`/collections/${collection.slug}`}
                className="group relative aspect-[3/4] overflow-hidden bg-surface-cotton"
              >
                {collection.coverImage && (
                  <Image
                    src={collection.coverImage}
                    alt={`${collection.name} collection`}
                    fill
                    unoptimized={collection.coverImage.endsWith(".svg")}
                    sizes="(max-width: 640px) 50vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A18]/65 via-[#1A1A18]/15 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                  <h3 className="text-sm font-medium uppercase tracking-[0.06em]">
                    {collection.name}
                  </h3>
                  {collection.description && (
                    <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-white/85">
                      {collection.description}
                    </p>
                  )}
                  <span className="mt-3 inline-flex items-center gap-2 text-xs font-medium">
                    Explore <ArrowRight className="size-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </Container>
    </StorefrontShell>
  );
}
