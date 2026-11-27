"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { formatInrFromPaise } from "@/lib/utils";
import { useCartStore } from "@/stores/cart.store";
import { useWishlistStore } from "@/stores/wishlist.store";
import type { Product } from "@/types";

export function WishlistView({ allProducts }: { allProducts: Product[] }) {
  const wishlistIds = useWishlistStore((s) => s.productIds);
  const removeProduct = useWishlistStore((s) => s.removeProduct);
  const addItem = useCartStore((s) => s.addItem);
  const setCartOpen = useCartStore((s) => s.setOpen);

  const savedProducts = allProducts.filter((p) => wishlistIds.includes(p.id));

  function handleMoveToBag(product: Product) {
    const res = addItem({
      productId: product.id,
      variantId: null,
      slug: product.slug,
      name: product.name,
      sku: product.sku,
      imageUrl: product.images[0]?.imageUrl ?? "/images/products/kora-ivory-olive-main.jpg",
      imageAlt: product.images[0]?.altText ?? product.name,
      variantName: null,
      unitPrice: product.price,
      quantity: 1,
      maxStock: product.stockQuantity,
    });

    if (!res.added) {
      toast.error(res.reason ?? "Unable to move saree to bag.");
      return;
    }

    removeProduct(product.id);
    toast.success(`Moved "${product.name}" to your shopping bag.`, {
      action: { label: "View Bag", onClick: () => setCartOpen(true) },
    });
  }

  if (savedProducts.length === 0) {
    return (
      <div className="rounded-[var(--radius-xl)] border border-border bg-surface-secondary px-6 py-16 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-surface-cotton text-primary">
          <Heart className="size-6" />
        </div>
        <h2 className="font-editorial mt-4 text-3xl font-medium text-deep-earth-olive">
          Your wishlist is empty
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-olive">
          Save cotton sarees you love while browsing to compare textures, borders,
          and colors later.
        </p>
        <Button asChild className="mt-6">
          <Link href="/shop">Explore Cotton Sarees</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {savedProducts.map((product) => {
        const primaryImage = product.images[0];
        return (
          <div
            key={product.id}
            className="flex flex-col rounded-[var(--radius-lg)] border border-border bg-surface-secondary p-3"
          >
            <Link
              href={`/product/${product.slug}`}
              className="relative aspect-[3/4] w-full overflow-hidden rounded-[var(--radius-md)] bg-surface-cotton"
            >
              {primaryImage && (
                <Image
                  src={primaryImage.imageUrl}
                  alt={primaryImage.altText}
                  fill
                  unoptimized={primaryImage.imageUrl.endsWith(".svg")}
                  sizes="(max-width: 640px) 100vw, 25vw"
                  className="object-cover"
                />
              )}
            </Link>

            <div className="mt-3 flex flex-1 flex-col justify-between gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.06em] text-muted-olive">
                  {product.fabric} · {product.color}
                </p>
                <Link
                  href={`/product/${product.slug}`}
                  className="mt-1 block text-sm font-medium text-deep-earth-olive hover:underline"
                >
                  {product.name}
                </Link>
                <p className="mt-1 text-sm font-medium text-deep-earth-olive">
                  {formatInrFromPaise(product.price)}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  className="flex-1"
                  disabled={product.stockQuantity <= 0}
                  onClick={() => handleMoveToBag(product)}
                >
                  <ShoppingBag className="size-3.5" />
                  {product.stockQuantity <= 0 ? "Out of Stock" : "Move to Bag"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  aria-label={`Remove ${product.name} from wishlist`}
                  onClick={() => {
                    removeProduct(product.id);
                    toast.success(`Removed "${product.name}" from wishlist.`);
                  }}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
