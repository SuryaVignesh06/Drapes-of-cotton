"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, ExternalLink, MessageCircle } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { BRAND } from "@/lib/constants";
import { formatInrFromPaise } from "@/lib/utils";
import { useCartStore } from "@/stores/cart.store";
import type { CartItem } from "@/types";

interface WhatsAppOrderSnapshot {
  createdAt: string;
  whatsappUrl: string;
  items: CartItem[];
  subtotal: number;
  shippingPaise: number;
  discountPaise: number;
  totalPaise: number;
  customer?: {
    fullName?: string;
    phone?: string;
    email?: string;
    city?: string;
    postalCode?: string;
  };
}

export default function WhatsAppSentPage() {
  const clearCart = useCartStore((s) => s.clearCart);
  const [snapshot] = useState<WhatsAppOrderSnapshot | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = sessionStorage.getItem("doc-last-whatsapp-order");
      return raw ? (JSON.parse(raw) as WhatsAppOrderSnapshot) : null;
    } catch {
      return null;
    }
  });
  const [returnedToSite, setReturnedToSite] = useState(false);

  useEffect(() => {
    function markReturned() {
      if (document.visibilityState === "visible") {
        setReturnedToSite(true);
      }
    }
    window.addEventListener("focus", markReturned);
    document.addEventListener("visibilitychange", markReturned);
    return () => {
      window.removeEventListener("focus", markReturned);
      document.removeEventListener("visibilitychange", markReturned);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Section spacing="spacious">
        <Container size="narrow">
          <div className="rounded-[var(--radius-xl)] border border-border bg-surface-secondary p-6 sm:p-10 space-y-6">
            <div className="flex items-start gap-4">
              <CheckCircle2 className="mt-1 size-7 shrink-0 text-foreground" />
              <div className="space-y-1.5">
                <p className="text-label-meta text-muted-foreground">
                  WhatsApp Order · +91 {BRAND.whatsappDisplayNumber}
                </p>
                <h1 className="text-section-heading text-foreground">
                  {returnedToSite
                    ? "Welcome Back to Drapes of Cotton"
                    : "Your Order Summary Was Sent to WhatsApp"}
                </h1>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {returnedToSite
                    ? `Thank you for returning to the store. Once your WhatsApp message to ${BRAND.whatsappDisplayNumber} is sent, our studio team will confirm availability and dispatch.`
                    : `WhatsApp was opened with your structured saree order details for ${BRAND.whatsappDisplayNumber}. Switch back to this tab anytime after pressing Send in WhatsApp.`}
                </p>
              </div>
            </div>

            {snapshot && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h2 className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                    Items Included in Message
                  </h2>
                  <div className="divide-y divide-border">
                    {snapshot.items.map((item) => (
                      <div
                        key={`${item.productId}-${item.variantId ?? "base"}`}
                        className="flex items-center justify-between gap-4 py-2.5 text-sm"
                      >
                        <div>
                          <p className="font-medium text-foreground">{item.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Code: {item.sku}
                            {item.variantName ? ` · ${item.variantName}` : ""} ·{" "}
                            {formatInrFromPaise(item.unitPrice)} × {item.quantity}
                          </p>
                        </div>
                        <span className="font-medium text-foreground">
                          {formatInrFromPaise(item.unitPrice * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatInrFromPaise(snapshot.subtotal)}</span>
                  </div>
                  {snapshot.discountPaise > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Discount</span>
                      <span>−{formatInrFromPaise(snapshot.discountPaise)}</span>
                    </div>
                  )}
                  {snapshot.shippingPaise > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping</span>
                      <span>{formatInrFromPaise(snapshot.shippingPaise)}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-1 font-semibold text-foreground">
                    <span>Total Cost</span>
                    <span>{formatInrFromPaise(snapshot.totalPaise)}</span>
                  </div>
                </div>
              </>
            )}

            <div className="flex flex-wrap gap-3 pt-2">
              <Button asChild size="lg" onClick={() => clearCart()}>
                <Link href="/shop">
                  <ArrowLeft className="size-4" />
                  Clear Bag &amp; Continue Shopping
                </Link>
              </Button>

              {snapshot?.whatsappUrl && (
                <Button asChild variant="outline" size="lg">
                  <a
                    href={snapshot.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="size-4" />
                    Re-open WhatsApp
                    <ExternalLink className="size-3.5" />
                  </a>
                </Button>
              )}

              <Button asChild variant="ghost" size="lg">
                <Link href="/">Back to Home</Link>
              </Button>
            </div>
          </div>
        </Container>
      </Section>
    </div>
  );
}
