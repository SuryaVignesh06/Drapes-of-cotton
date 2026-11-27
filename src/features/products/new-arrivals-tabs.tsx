"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { cn, formatInrFromPaise } from "@/lib/utils";
import { useCartStore } from "@/stores/cart.store";
import { useWishlistStore } from "@/stores/wishlist.store";
import type { Product } from "@/types";

const TABS = [
  { id: "all", label: "All Sarees" },
  { id: "everyday-cotton", label: "Everyday Cotton" },
  { id: "classic-cotton", label: "Classic Cotton" },
  { id: "office-wear", label: "Office Wear" },
  { id: "festive-edit", label: "Festive Edit" },
] as const;

export function NewArrivalsTabs({ products }: { products: Product[] }) {
  const [activeTab, setActiveTab] = useState<string>("all");

  const addItem = useCartStore((s) => s.addItem);
  const setCartOpen = useCartStore((s) => s.setOpen);
  const wishlistIds = useWishlistStore((s) => s.productIds);
  const toggleWishlist = useWishlistStore((s) => s.toggleProduct);

  const filtered =
    activeTab === "all"
      ? products.slice(0, 6)
      : products
          .filter((p) => p.collections.some((c) => c.slug === activeTab))
          .slice(0, 6);

  function handleQuickAdd(product: Product) {
    const primaryImage = product.images[0];
    const result = addItem({
      productId: product.id,
      variantId: null,
      slug: product.slug,
      name: product.name,
      sku: product.sku,
      imageUrl: primaryImage?.imageUrl ?? "/images/products/kora-ivory-olive-main.jpg",
      imageAlt: primaryImage?.altText ?? product.name,
      variantName: null,
      unitPrice: product.price,
      quantity: 1,
      maxStock: product.stockQuantity,
    });

    if (!result.added) {
      toast.error(result.reason ?? "Could not add item to bag.");
      return;
    }

    toast.success(`Added "${product.name}" to your bag.`, {
      action: { label: "View Bag", onClick: () => setCartOpen(true) },
    });
  }

  function handleToggleWishlist(product: Product) {
    const added = toggleWishlist(product.id);
    toast.success(
      added
        ? `Saved "${product.name}" to your wishlist.`
        : `Removed "${product.name}" from your wishlist.`
    );
  }

  return (
    <section className="py-12 sm:py-16">
      <div className="text-center">
        <h2 className="text-2xl font-medium uppercase tracking-[0.06em] text-foreground sm:text-[28px]">
          New Arrivals
        </h2>

        <div
          role="tablist"
          aria-label="Filter new arrivals by collection"
          className="mt-4 flex flex-wrap items-center justify-center gap-5 sm:gap-7"
        >
          {TABS.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "border-b pb-1.5 text-xs transition-colors",
                  active
                    ? "border-foreground font-medium text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-6">
        {filtered.map((product) => {
          const primaryImage = product.images[0];
          const isWishlisted = wishlistIds.includes(product.id);
          const isOutOfStock = product.stockQuantity <= 0;

          return (
            <article key={product.id} className="group flex flex-col">
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-surface-cotton">
                <Link
                  href={`/product/${product.slug}`}
                  className="relative block h-full w-full"
                >
                  {primaryImage && (
                    <Image
                      src={primaryImage.imageUrl}
                      alt={primaryImage.altText}
                      fill
                      unoptimized={primaryImage.imageUrl.endsWith(".svg")}
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 17vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                  )}
                </Link>

                {product.isNew && (
                  <span className="pointer-events-none absolute left-2 top-2 bg-surface/90 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-[0.08em] text-foreground">
                    New
                  </span>
                )}

                <div className="pointer-events-none absolute inset-x-2 bottom-2 opacity-100 transition-opacity duration-200 lg:opacity-0 lg:group-hover:pointer-events-auto lg:group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => handleQuickAdd(product)}
                    disabled={isOutOfStock}
                    className="pointer-events-auto flex h-7 w-full items-center justify-center gap-1 bg-primary/95 text-[10px] font-medium uppercase tracking-[0.06em] text-primary-foreground transition-colors hover:bg-accent-olive disabled:opacity-50"
                  >
                    <ShoppingBag className="size-3" />
                    {isOutOfStock ? "Sold Out" : "Add to Bag"}
                  </button>
                </div>
              </div>

              <div className="pt-2.5">
                <Link
                  href={`/product/${product.slug}`}
                  className="line-clamp-1 text-xs font-medium text-foreground hover:underline"
                >
                  {product.name}
                </Link>
                <div className="mt-1 flex items-center justify-between gap-2">
                  <span className="text-xs text-muted-foreground">
                    {formatInrFromPaise(product.price)}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleToggleWishlist(product)}
                    aria-label={
                      isWishlisted
                        ? `Remove ${product.name} from wishlist`
                        : `Add ${product.name} to wishlist`
                    }
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <Heart
                      className={cn(
                        "size-3.5",
                        isWishlisted && "fill-foreground text-foreground"
                      )}
                    />
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="mt-8 text-center">
        <Link
          href="/shop?sort=newest"
          className="inline-flex h-10 items-center justify-center border border-input bg-surface px-7 text-xs font-medium text-foreground transition-colors hover:bg-surface-cotton"
        >
          View All New Arrivals
        </Link>
      </div>
    </section>
  );
}
