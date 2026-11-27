"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Expand, Heart, Minus, Plus, ShoppingBag, Truck } from "lucide-react";
import { toast } from "sonner";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Pill } from "@/components/ui/pill";
import { Separator } from "@/components/ui/separator";
import { cn, formatInrFromPaise } from "@/lib/utils";
import { indianPinRegex } from "@/lib/validations/store";
import { useCartStore } from "@/stores/cart.store";
import { useWishlistStore } from "@/stores/wishlist.store";
import type { Product, ProductVariant } from "@/types";

export function ProductDetailView({ product }: { product: Product }) {
  const images =
    product.images.length > 0
      ? product.images
      : [
          {
            id: "fallback-img",
            productId: product.id,
            imageUrl: "/images/products/kora-ivory-olive-main.jpg",
            altText: product.name,
            imageType: "main" as const,
            sortOrder: 0,
          },
        ];

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    product.variants?.find((v) => v.isActive) ?? null
  );
  const [quantity, setQuantity] = useState(1);
  const [pincode, setPincode] = useState("");
  const [pincodeResult, setPincodeResult] = useState<{
    valid: boolean;
    message: string;
  } | null>(null);

  const addItem = useCartStore((s) => s.addItem);
  const setCartOpen = useCartStore((s) => s.setOpen);
  const wishlistIds = useWishlistStore((s) => s.productIds);
  const toggleWishlist = useWishlistStore((s) => s.toggleProduct);

  const isWishlisted = wishlistIds.includes(product.id);
  const activeImage = images[activeImageIndex] ?? images[0];
  const effectivePrice = selectedVariant?.price ?? product.price;
  const effectiveStock = selectedVariant?.stockQuantity ?? product.stockQuantity;
  const effectiveSku = selectedVariant?.sku ?? product.sku;
  const isOutOfStock = effectiveStock <= 0;
  const hasDiscount =
    !selectedVariant &&
    typeof product.compareAtPrice === "number" &&
    product.compareAtPrice > product.price;

  function handleAddToBag() {
    const res = addItem({
      productId: product.id,
      variantId: selectedVariant?.id ?? null,
      slug: product.slug,
      name: product.name,
      sku: effectiveSku,
      imageUrl: images[0].imageUrl,
      imageAlt: images[0].altText,
      variantName: selectedVariant?.name ?? null,
      unitPrice: effectivePrice,
      quantity,
      maxStock: effectiveStock,
    });

    if (!res.added) {
      toast.error(res.reason ?? "Unable to add saree to your bag.");
      return;
    }

    toast.success(`Added ${quantity} × "${product.name}" to your bag.`, {
      action: {
        label: "View Bag",
        onClick: () => setCartOpen(true),
      },
    });
  }

  function handleWishlistToggle() {
    const added = toggleWishlist(product.id);
    toast.success(
      added
        ? `Saved "${product.name}" to your wishlist.`
        : `Removed "${product.name}" from your wishlist.`
    );
  }

  function handlePincodeCheck(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = pincode.trim();
    if (!indianPinRegex.test(trimmed)) {
      setPincodeResult({
        valid: false,
        message: "Please enter a valid 6-digit Indian PIN code.",
      });
      return;
    }
    setPincodeResult({
      valid: true,
      message: `PIN ${trimmed} is formatted for India dispatch. Shipping rates are confirmed at checkout.`,
    });
  }

  const specificationRows = [
    { label: "Fabric", value: product.fabric },
    { label: "Weave", value: product.weave },
    { label: "Color", value: product.color },
    { label: "Occasion", value: product.occasion },
    { label: "Saree Length", value: product.sareeLength },
    {
      label: "Blouse Piece",
      value: product.blousePieceIncluded
        ? product.blousePieceLength
          ? `Included (${product.blousePieceLength})`
          : "Included"
        : "Not included",
    },
    { label: "Care Instructions", value: product.careInstructions },
    { label: "Origin", value: product.origin },
    { label: "Product Code (SKU)", value: effectiveSku },
  ].filter((row): row is { label: string; value: string } => Boolean(row.value));

  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
      {/* 9.1 Image Gallery */}
      <div className="space-y-4 lg:col-span-7">
        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[var(--radius-xl)] bg-surface-cotton">
          <Image
            src={activeImage.imageUrl}
            alt={activeImage.altText}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 55vw"
            className="object-cover"
          />
          <button
            type="button"
            onClick={() => setZoomOpen(true)}
            aria-label="Zoom saree photograph"
            className="absolute bottom-4 right-4 inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] border border-border bg-surface/90 px-3.5 py-2 text-xs font-medium text-deep-earth-olive shadow-[var(--shadow-subtle)] hover:bg-surface"
          >
            <Expand className="size-3.5" />
            Zoom
          </button>
        </div>

        {images.length > 1 && (
          <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
            {images.map((img, index) => {
              const selected = index === activeImageIndex;
              return (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => setActiveImageIndex(index)}
                  aria-label={`View image ${index + 1}: ${img.altText}`}
                  className={cn(
                    "relative aspect-[3/4] overflow-hidden rounded-[var(--radius-md)] border bg-surface-cotton transition-all",
                    selected
                      ? "border-primary ring-2 ring-primary/40"
                      : "border-border opacity-80 hover:opacity-100"
                  )}
                >
                  <Image
                    src={img.imageUrl}
                    alt={img.altText}
                    fill
                    sizes="120px"
                    className="object-cover"
                  />
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 9.2 Product Information */}
      <div className="space-y-6 lg:col-span-5">
        <nav
          aria-label="Breadcrumb"
          className="flex flex-wrap items-center gap-2 text-[11px] font-medium uppercase tracking-[0.1em] text-muted-olive"
        >
          <Link href="/" className="hover:text-deep-earth-olive">
            Home
          </Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-deep-earth-olive">
            Shop
          </Link>
          {product.collections[0] && (
            <>
              <span>/</span>
              <Link
                href={`/collections/${product.collections[0].slug}`}
                className="hover:text-deep-earth-olive"
              >
                {product.collections[0].name}
              </Link>
            </>
          )}
        </nav>

        <div className="space-y-2.5">
          <div className="flex flex-wrap items-center gap-2">
            {product.isNew && <Pill size="sm">New Arrival</Pill>}
            <Badge variant={isOutOfStock ? "secondary" : "outline"}>
              {isOutOfStock
                ? "Out of Stock"
                : effectiveStock <= 5
                  ? `Only ${effectiveStock} left`
                  : "In Stock"}
            </Badge>
          </div>

          <h1 className="text-display-editorial text-foreground">
            {product.name}
          </h1>

          <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">
            SKU: {effectiveSku}
          </p>
        </div>

        <div className="flex items-baseline gap-3">
          <span className="text-2xl font-medium text-deep-earth-olive">
            {formatInrFromPaise(effectivePrice)}
          </span>
          {hasDiscount && (
            <span className="text-base text-warm-stone line-through">
              {formatInrFromPaise(product.compareAtPrice!)}
            </span>
          )}
          <span className="text-xs text-muted-olive">Inclusive of all taxes</span>
        </div>

        <p className="text-body-editorial text-sm text-muted-olive">
          {product.shortDescription}
        </p>

        {/* Optional Variants */}
        {product.variants && product.variants.filter((v) => v.isActive).length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-[0.08em] text-deep-earth-olive">
              Select Option
            </p>
            <div className="flex flex-wrap gap-2">
              {product.variants
                .filter((v) => v.isActive)
                .map((variant) => {
                  const active = selectedVariant?.id === variant.id;
                  return (
                    <button
                      key={variant.id}
                      type="button"
                      onClick={() => {
                        setSelectedVariant(variant);
                        setQuantity(1);
                      }}
                      className={cn(
                        "rounded-[var(--radius-pill)] border px-4 py-2 text-xs font-medium transition-colors",
                        active
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-surface text-deep-earth-olive hover:bg-surface-cotton"
                      )}
                    >
                      {variant.name}
                    </button>
                  );
                })}
            </div>
          </div>
        )}

        {/* Blouse Piece Summary */}
        <div className="rounded-[var(--radius-md)] border border-border bg-surface-secondary px-4 py-3 text-xs text-deep-earth-olive">
          <span className="font-medium">Blouse Piece: </span>
          {product.blousePieceIncluded
            ? `Unstitched blouse piece included${product.blousePieceLength ? ` (${product.blousePieceLength})` : ""}.`
            : "Not included with this saree."}
        </div>

        {/* Quantity & Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex h-11 items-center rounded-[var(--radius-md)] border border-border bg-surface-secondary">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1 || isOutOfStock}
              aria-label="Decrease quantity"
              className="flex h-full w-10 items-center justify-center text-deep-earth-olive hover:bg-surface-cotton disabled:opacity-40"
            >
              <Minus className="size-4" />
            </button>
            <span className="min-w-10 text-center text-sm font-medium text-deep-earth-olive">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() =>
                setQuantity((q) => Math.min(effectiveStock, 20, q + 1))
              }
              disabled={quantity >= effectiveStock || isOutOfStock}
              aria-label="Increase quantity"
              className="flex h-full w-10 items-center justify-center text-deep-earth-olive hover:bg-surface-cotton disabled:opacity-40"
            >
              <Plus className="size-4" />
            </button>
          </div>

          <Button
            size="lg"
            onClick={handleAddToBag}
            disabled={isOutOfStock}
            className="h-11 flex-1"
          >
            <ShoppingBag className="size-4" />
            {isOutOfStock ? "Out of Stock" : "Add to Bag"}
          </Button>

          <Button
            type="button"
            variant="outline"
            size="icon-lg"
            onClick={handleWishlistToggle}
            aria-label={isWishlisted ? "Remove from wishlist" : "Save to wishlist"}
            className="h-11 w-11"
          >
            <Heart
              className={cn(
                "size-4",
                isWishlisted && "fill-primary text-primary"
              )}
            />
          </Button>
        </div>

        {/* Delivery PIN Check */}
        <form
          onSubmit={handlePincodeCheck}
          className="space-y-2 rounded-[var(--radius-lg)] border border-border bg-surface-secondary/70 p-4"
        >
          <label
            htmlFor="pincode-check"
            className="flex items-center gap-2 text-xs font-medium text-deep-earth-olive"
          >
            <Truck className="size-4 text-primary" />
            Check Indian PIN Code Serviceability
          </label>
          <div className="flex gap-2">
            <Input
              id="pincode-check"
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              maxLength={6}
              placeholder="Enter 6-digit PIN (e.g. 560001)"
              className="h-9 bg-surface text-xs"
            />
            <Button type="submit" variant="secondary" size="sm" className="h-9">
              Check
            </Button>
          </div>
          {pincodeResult && (
            <p
              className={cn(
                "text-xs",
                pincodeResult.valid ? "text-primary" : "text-destructive"
              )}
            >
              {pincodeResult.message}
            </p>
          )}
        </form>

        <Separator />

        {/* 9.3 Description & Specifications Accordion */}
        <Accordion type="multiple" defaultValue={["details", "specs"]}>
          <AccordionItem value="details">
            <AccordionTrigger className="text-sm font-medium text-deep-earth-olive">
              About This Drape
            </AccordionTrigger>
            <AccordionContent className="text-sm leading-relaxed text-muted-olive">
              {product.description}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="specs">
            <AccordionTrigger className="text-sm font-medium text-deep-earth-olive">
              Specifications &amp; Care
            </AccordionTrigger>
            <AccordionContent>
              <dl className="space-y-2.5 text-sm">
                {specificationRows.map((row) => (
                  <div
                    key={row.label}
                    className="flex justify-between gap-4 border-b border-border/60 pb-2 last:border-b-0 last:pb-0"
                  >
                    <dt className="text-muted-olive">{row.label}</dt>
                    <dd className="text-right font-medium text-deep-earth-olive">
                      {row.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Lightbox Zoom Dialog */}
      <Dialog open={zoomOpen} onOpenChange={setZoomOpen}>
        <DialogContent className="max-w-3xl border-border bg-surface p-4">
          <DialogTitle className="font-editorial text-xl text-deep-earth-olive">
            {product.name}
          </DialogTitle>
          <div className="relative aspect-[3/4] max-h-[75vh] w-full overflow-hidden rounded-[var(--radius-lg)] bg-surface-cotton">
            <Image
              src={activeImage.imageUrl}
              alt={activeImage.altText}
              fill
              sizes="(max-width: 1024px) 100vw, 768px"
              className="object-contain"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
