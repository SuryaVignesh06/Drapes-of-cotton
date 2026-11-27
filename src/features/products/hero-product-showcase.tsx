"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, RotateCcw, ShieldCheck, ShoppingBag, Truck } from "lucide-react";
import { toast } from "sonner";
import { cn, formatInrFromPaise } from "@/lib/utils";
import { useCartStore } from "@/stores/cart.store";
import { useWishlistStore } from "@/stores/wishlist.store";
import type { Product } from "@/types";

const COLOR_HEX_MAP: Record<string, string> = {
  Ivory: "#EDE8DC",
  White: "#FFFFFF",
  Beige: "#D8CFC0",
  Green: "#243A2F",
  Blue: "#364657",
  Yellow: "#CA9B47",
  Pink: "#CCA09B",
  Black: "#1A1A18",
};

const DRAPE_OPTIONS = [
  "5.5m Standard",
  "With Blouse (6.3m)",
  "Fall & Pico Ready",
] as const;

export function HeroProductShowcase({ products }: { products: Product[] }) {
  const showcaseProducts = products.slice(0, 5);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedDrape, setSelectedDrape] = useState<string>(DRAPE_OPTIONS[1]);

  const addItem = useCartStore((s) => s.addItem);
  const setCartOpen = useCartStore((s) => s.setOpen);
  const wishlistIds = useWishlistStore((s) => s.productIds);
  const toggleWishlist = useWishlistStore((s) => s.toggleProduct);

  const product = showcaseProducts[activeIndex] ?? showcaseProducts[0];
  if (!product) return null;

  const mainImage = product.images[0];
  const isWishlisted = wishlistIds.includes(product.id);
  const isOutOfStock = product.stockQuantity <= 0;

  function handleAddToBag() {
    const result = addItem({
      productId: product.id,
      variantId: null,
      slug: product.slug,
      name: product.name,
      sku: product.sku,
      imageUrl: mainImage?.imageUrl ?? "/images/products/kora-ivory-olive-main.jpg",
      imageAlt: mainImage?.altText ?? product.name,
      variantName: selectedDrape,
      unitPrice: product.price,
      quantity: 1,
      maxStock: product.stockQuantity,
    });

    if (!result.added) {
      toast.error(result.reason ?? "Could not add saree to bag.");
      return;
    }

    toast.success(`Added "${product.name}" to your bag.`, {
      action: { label: "View Bag", onClick: () => setCartOpen(true) },
    });
  }

  function handleWishlist() {
    const added = toggleWishlist(product.id);
    toast.success(
      added
        ? `Saved "${product.name}" to your wishlist.`
        : `Removed "${product.name}" from your wishlist.`
    );
  }

  return (
    <section className="py-6 sm:py-10">
      <div className="grid items-center gap-8 lg:grid-cols-12 lg:gap-12">
        {/* Left: Large Studio Image with Vertical Pagination Dots */}
        <div className="lg:col-span-6">
          <div className="relative aspect-[4/4.3] w-full overflow-hidden rounded-[12px] bg-surface-cotton">
            <Link
              href={`/product/${product.slug}`}
              className="relative block h-full w-full"
            >
              <Image
                src={mainImage?.imageUrl ?? "/images/banners/hero-saree.jpg"}
                alt={mainImage?.altText ?? product.name}
                fill
                loading="eager"
                priority
                unoptimized={(mainImage?.imageUrl ?? "").endsWith(".svg")}
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover object-center transition-opacity duration-300"
              />
            </Link>

            {showcaseProducts.length > 1 && (
              <div
                aria-label="Featured sarees switcher"
                className="absolute right-3.5 top-1/2 flex -translate-y-1/2 flex-col gap-2"
              >
                {showcaseProducts.map((item, idx) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveIndex(idx)}
                    aria-label={`Preview ${item.name}`}
                    className={cn(
                      "size-2 rounded-full transition-all",
                      idx === activeIndex
                        ? "scale-125 bg-foreground"
                        : "bg-foreground/30 hover:bg-foreground/60"
                    )}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Clean Product Details, Swatches, Options, Add to Bag & Trust Row */}
        <div className="space-y-5 lg:col-span-6">
          <div className="space-y-2">
            <span className="inline-flex rounded-full bg-secondary px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.08em] text-foreground">
              {product.isNew ? "NEW" : "CURATED"}
            </span>

            <h1 className="text-display-editorial text-foreground">
              <Link href={`/product/${product.slug}`} className="hover:underline">
                {product.name}
              </Link>
            </h1>

            <p className="text-lg font-medium text-foreground">
              {formatInrFromPaise(product.price)}
            </p>
          </div>

          <p className="max-w-md text-[13px] leading-relaxed text-muted-foreground">
            {product.shortDescription} {product.fabric} weave suited for{" "}
            {product.occasion.toLowerCase()} comfort.
          </p>

          {/* Color Switcher across featured sarees */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-foreground">
              Color:{" "}
              <span className="font-normal text-muted-foreground">
                {product.color}
              </span>
            </p>
            <div className="flex flex-wrap items-center gap-2.5">
              {showcaseProducts.map((item, idx) => {
                const hex = COLOR_HEX_MAP[item.color] ?? "#D8CFC0";
                const active = idx === activeIndex;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveIndex(idx)}
                    aria-label={`Select ${item.color} — ${item.name}`}
                    className={cn(
                      "size-6 rounded-full border border-border transition-transform",
                      active && "ring-2 ring-foreground ring-offset-2 ring-offset-background"
                    )}
                    style={{ backgroundColor: hex }}
                  />
                );
              })}
            </div>
          </div>

          {/* Drape / Finish Options */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-foreground">Drape Option:</p>
            <div className="flex flex-wrap gap-2">
              {DRAPE_OPTIONS.map((option) => {
                const active = selectedDrape === option;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setSelectedDrape(option)}
                    className={cn(
                      "rounded-[6px] border px-3 py-1.5 text-xs font-medium transition-colors",
                      active
                        ? "border-foreground bg-surface text-foreground"
                        : "border-border bg-transparent text-muted-foreground hover:border-foreground/50 hover:text-foreground"
                    )}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Primary Add to Bag + Wishlist Button */}
          <div className="flex items-center gap-2.5 pt-1">
            <button
              type="button"
              onClick={handleAddToBag}
              disabled={isOutOfStock}
              className="flex h-11 flex-1 items-center justify-center gap-2 rounded-[8px] bg-primary px-6 text-xs font-medium text-primary-foreground transition-colors hover:bg-accent-olive disabled:opacity-50"
            >
              <ShoppingBag className="size-4" />
              {isOutOfStock ? "Out of stock" : "Add to bag"}
            </button>

            <button
              type="button"
              onClick={handleWishlist}
              aria-label={isWishlisted ? "Remove from wishlist" : "Save to wishlist"}
              className="flex size-11 shrink-0 items-center justify-center rounded-[8px] border border-border bg-surface text-foreground transition-colors hover:bg-surface-cotton"
            >
              <Heart
                className={cn(
                  "size-4",
                  isWishlisted && "fill-foreground text-foreground"
                )}
              />
            </button>
          </div>

          {/* Compact 3-Column Trust Row */}
          <div className="grid grid-cols-1 gap-3 border-t border-border pt-4 sm:grid-cols-3">
            <div className="flex items-center gap-2.5">
              <Truck className="size-4 shrink-0 text-muted-foreground" />
              <div className="text-[11px] leading-tight">
                <p className="font-medium text-foreground">Insured shipping</p>
                <p className="text-muted-foreground">across India</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <RotateCcw className="size-4 shrink-0 text-muted-foreground" />
              <div className="text-[11px] leading-tight">
                <p className="font-medium text-foreground">Easy care</p>
                <p className="text-muted-foreground">cotton guide included</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="size-4 shrink-0 text-muted-foreground" />
              <div className="text-[11px] leading-tight">
                <p className="font-medium text-foreground">Secure payments</p>
                <p className="text-muted-foreground">Razorpay verified</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
