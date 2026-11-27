"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { cn, formatInrFromPaise } from "@/lib/utils";
import { useCartStore } from "@/stores/cart.store";
import { useWishlistStore } from "@/stores/wishlist.store";
import type { Product } from "@/types";

export interface ProductCardProps {
  product: Product;
  className?: string;
}

const COLOR_HEX_MAP: Record<string, string> = {
  Ivory: "#EDE8DC",
  White: "#FFFFFF",
  Beige: "#D8CFC0",
  Green: "#243A2F",
  Blue: "#364657",
  Yellow: "#CA9B47",
  Pink: "#CCA09B",
  Black: "#1A1A18",
  Multicolor: "#6E6D68",
};

/**
 * Clean studio saree card matching the reference proportions:
 * flat #ECEAE4 image tile, top-left pill, top-right heart button,
 * compact title/price/swatch dots underneath.
 */
export function ProductCard({ product, className }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const setCartOpen = useCartStore((s) => s.setOpen);
  const wishlistIds = useWishlistStore((s) => s.productIds);
  const toggleWishlist = useWishlistStore((s) => s.toggleProduct);

  const primaryImage = product.images[0];
  const secondaryImage = product.images[1];
  const isWishlisted = wishlistIds.includes(product.id);
  const isOutOfStock = product.stockQuantity <= 0;
  const hasDiscount =
    typeof product.compareAtPrice === "number" &&
    product.compareAtPrice > product.price;

  function handleAddToBag(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

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
      action: {
        label: "View Bag",
        onClick: () => setCartOpen(true),
      },
    });
  }

  function handleToggleWishlist(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const added = toggleWishlist(product.id);
    toast.success(
      added
        ? `Saved "${product.name}" to your wishlist.`
        : `Removed "${product.name}" from your wishlist.`
    );
  }

  const mainSwatch = COLOR_HEX_MAP[product.color] ?? "#D8CFC0";
  const swatches = [mainSwatch, "#D8CFC0", "#1A1A18"];

  return (
    <article
      className={cn(
        "group flex h-full flex-col",
        isOutOfStock && "opacity-75",
        className
      )}
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[10px] bg-surface-cotton">
        <Link
          href={`/product/${product.slug}`}
          className="relative block h-full w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {primaryImage && (
            <Image
              src={primaryImage.imageUrl}
              alt={primaryImage.altText}
              fill
              unoptimized={primaryImage.imageUrl.endsWith(".svg")}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              className={cn(
                "object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]",
                secondaryImage && "group-hover:opacity-0 transition-opacity duration-300"
              )}
            />
          )}
          {secondaryImage && (
            <Image
              src={secondaryImage.imageUrl}
              alt={secondaryImage.altText}
              fill
              unoptimized={secondaryImage.imageUrl.endsWith(".svg")}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              className="object-cover opacity-0 transition-all duration-300 ease-out group-hover:scale-[1.03] group-hover:opacity-100"
            />
          )}
        </Link>

        {(product.isFeatured || product.isNew || isOutOfStock) && (
          <span
            className={cn(
              "pointer-events-none absolute left-2.5 top-2.5 rounded-full px-2.5 py-0.5 text-[10px] font-medium",
              isOutOfStock
                ? "bg-surface text-muted-foreground"
                : "bg-primary text-primary-foreground"
            )}
          >
            {isOutOfStock ? "Sold Out" : product.isFeatured ? "Popular" : "New"}
          </span>
        )}

        <button
          type="button"
          onClick={handleToggleWishlist}
          aria-label={
            isWishlisted
              ? `Remove ${product.name} from wishlist`
              : `Add ${product.name} to wishlist`
          }
          className="absolute right-2.5 top-2.5 flex size-7 items-center justify-center rounded-full bg-surface/95 text-foreground shadow-[var(--shadow-subtle)] transition-transform hover:scale-105"
        >
          <Heart
            className={cn("size-3.5", isWishlisted && "fill-foreground text-foreground")}
          />
        </button>

        <div className="pointer-events-none absolute inset-x-2.5 bottom-2.5 opacity-100 transition-opacity duration-200 lg:opacity-0 lg:group-hover:pointer-events-auto lg:group-hover:opacity-100">
          <button
            type="button"
            onClick={handleAddToBag}
            disabled={isOutOfStock}
            className="pointer-events-auto flex h-8 w-full items-center justify-center gap-1.5 rounded-[6px] bg-primary/95 text-[11px] font-medium text-primary-foreground shadow-[var(--shadow-subtle)] transition-colors hover:bg-accent-olive disabled:opacity-50"
          >
            <ShoppingBag className="size-3" />
            {isOutOfStock ? "Out of Stock" : "Add to bag"}
          </button>
        </div>
      </div>

      <div className="pt-2.5 space-y-1">
        <Link
          href={`/product/${product.slug}`}
          className="block text-[13px] font-medium leading-snug text-foreground hover:underline"
        >
          {product.name}
        </Link>
        <div className="flex items-baseline gap-2">
          <span className="text-[13px] text-muted-foreground">
            {formatInrFromPaise(product.price)}
          </span>
          {hasDiscount && (
            <span className="text-[11px] text-dusty-taupe line-through">
              {formatInrFromPaise(product.compareAtPrice!)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 pt-1" aria-hidden="true">
          {swatches.map((hex, idx) => (
            <span
              key={`${product.id}-sw-${idx}`}
              className="size-2.5 rounded-full border border-border"
              style={{ backgroundColor: hex }}
            />
          ))}
        </div>
      </div>
    </article>
  );
}
