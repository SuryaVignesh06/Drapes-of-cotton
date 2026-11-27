"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MessageCircle, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { BRAND } from "@/lib/constants";
import { buildWhatsAppOrderUrl, formatInrFromPaise } from "@/lib/utils";
import { selectCartCount, selectCartSubtotal, useCartStore } from "@/stores/cart.store";

export function CartDrawer() {
  const router = useRouter();
  const { items, isOpen, setOpen, updateQuantity, removeItem } = useCartStore();
  const count = selectCartCount(items);
  const subtotal = selectCartSubtotal(items);

  function handleSendViaWhatsApp() {
    if (items.length === 0) return;

    const url = buildWhatsAppOrderUrl(items);
    try {
      sessionStorage.setItem(
        "doc-last-whatsapp-order",
        JSON.stringify({
          createdAt: new Date().toISOString(),
          whatsappUrl: url,
          items,
          subtotal,
          shippingPaise: 0,
          discountPaise: 0,
          totalPaise: subtotal,
        })
      );
    } catch {
      // Ignore storage failures
    }

    setOpen(false);
    window.open(url, "_blank", "noopener,noreferrer");
    router.push("/checkout/whatsapp-sent");
  }

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetContent
        side="right"
        className="flex w-full flex-col border-l border-border bg-surface p-0 sm:max-w-md"
      >
        <SheetHeader className="border-b border-border px-6 py-5">
          <SheetTitle className="font-editorial text-xl font-medium text-foreground">
            Your Shopping Bag ({count})
          </SheetTitle>
          <SheetDescription className="text-xs text-muted-foreground">
            Review your selected cotton sarees or send your order directly on WhatsApp.
          </SheetDescription>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-surface-cotton text-foreground">
              <ShoppingBag className="size-6" />
            </div>
            <h3 className="font-editorial mt-4 text-xl font-medium text-foreground">
              Your bag is empty
            </h3>
            <p className="mt-2 max-w-xs text-xs text-muted-foreground">
              Explore our curated collection of breathable, timeless Indian cotton sarees.
            </p>
            <Button asChild className="mt-6" onClick={() => setOpen(false)}>
              <Link href="/shop">Explore Cotton Sarees</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <ul className="divide-y divide-border">
                {items.map((item) => (
                  <li
                    key={`${item.productId}-${item.variantId ?? "base"}`}
                    className="flex gap-4 py-4"
                  >
                    <Link
                      href={`/product/${item.slug}`}
                      onClick={() => setOpen(false)}
                      className="relative h-24 w-18 shrink-0 overflow-hidden rounded-[var(--radius-sm)] bg-surface-cotton"
                    >
                      <Image
                        src={item.imageUrl}
                        alt={item.imageAlt}
                        fill
                        sizes="72px"
                        className="object-cover"
                      />
                    </Link>

                    <div className="flex min-w-0 flex-1 flex-col justify-between">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <Link
                            href={`/product/${item.slug}`}
                            onClick={() => setOpen(false)}
                            className="line-clamp-2 text-sm font-medium text-foreground hover:underline"
                          >
                            {item.name}
                          </Link>
                          <p className="mt-0.5 text-[11px] text-muted-foreground">
                            Code: {item.sku}
                            {item.variantName ? ` · ${item.variantName}` : ""}
                          </p>
                          <p className="mt-1 text-xs font-medium text-foreground">
                            {formatInrFromPaise(item.unitPrice)}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeItem(item.productId, item.variantId)}
                          aria-label={`Remove ${item.name} from bag`}
                          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-surface-cotton hover:text-destructive"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <div className="inline-flex items-center rounded-[var(--radius-sm)] border border-border bg-surface-secondary">
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(
                                item.productId,
                                item.variantId,
                                item.quantity - 1
                              )
                            }
                            aria-label={`Decrease quantity of ${item.name}`}
                            className="flex size-7 items-center justify-center text-foreground hover:bg-surface-cotton"
                          >
                            <Minus className="size-3.5" />
                          </button>
                          <span className="min-w-7 text-center text-xs font-medium text-foreground">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(
                                item.productId,
                                item.variantId,
                                item.quantity + 1
                              )
                            }
                            disabled={item.quantity >= item.maxStock}
                            aria-label={`Increase quantity of ${item.name}`}
                            className="flex size-7 items-center justify-center text-foreground hover:bg-surface-cotton disabled:opacity-40"
                          >
                            <Plus className="size-3.5" />
                          </button>
                        </div>

                        <span className="text-sm font-medium text-foreground">
                          {formatInrFromPaise(item.unitPrice * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <SheetFooter className="block border-t border-border bg-surface-secondary px-6 py-5">
              <div className="space-y-1.5 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-semibold text-foreground">
                    {formatInrFromPaise(subtotal)}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Includes product names, SKU codes, and costs when sent via WhatsApp.
                </p>
              </div>
              <Separator className="my-3.5" />
              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  size="lg"
                  onClick={handleSendViaWhatsApp}
                  className="w-full"
                >
                  <MessageCircle className="size-4" />
                  Order via WhatsApp ({BRAND.whatsappDisplayNumber})
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="default"
                  className="w-full"
                  onClick={() => setOpen(false)}
                >
                  <Link href="/checkout">Proceed to Checkout</Link>
                </Button>
              </div>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
