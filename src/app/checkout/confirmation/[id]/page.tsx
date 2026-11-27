import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { StorefrontShell } from "@/components/layout/storefront-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { getOrderByIdForUser } from "@/lib/services/order.service";
import { getAuthenticatedProfile } from "@/lib/supabase/auth-guards";
import { formatInrFromPaise } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Order Confirmation",
  description: "Order summary and verified payment status.",
};

async function ConfirmationContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: orderId } = await params;
  const profile = await getAuthenticatedProfile();
  const order = await getOrderByIdForUser(
    orderId,
    profile?.id ?? null,
    profile?.role === "admin"
  );

  if (!order) {
    notFound();
  }

  const isPaid = order.paymentStatus === "paid";
  const isFailed = order.paymentStatus === "failed";

  return (
    <div className="mx-auto max-w-2xl rounded-[var(--radius-xl)] border border-border bg-surface-secondary p-6 sm:p-10 space-y-6">
      <div className="flex items-start gap-4">
        {isPaid ? (
          <CheckCircle2 className="mt-1 size-7 shrink-0 text-primary" />
        ) : isFailed ? (
          <AlertCircle className="mt-1 size-7 shrink-0 text-destructive" />
        ) : (
          <Clock className="mt-1 size-7 shrink-0 text-muted-olive" />
        )}

        <div>
          <p className="text-label-meta text-muted-olive">
            Order {order.orderNumber}
          </p>
          <h1 className="text-section-heading mt-1 text-deep-earth-olive">
            {isPaid
              ? "Thank You for Your Order."
              : isFailed
                ? "Payment Was Not Completed"
                : "Payment Verification Pending"}
          </h1>
          <p className="mt-2 text-sm text-muted-olive">
            {isPaid
              ? "Your payment has been verified on our server and your order is confirmed."
              : isFailed
                ? "No confirmed payment was recorded for this order. Reserved items have been released."
                : "We are awaiting final Razorpay confirmation before confirming dispatch."}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant={isPaid ? "default" : "outline"} className="capitalize">
              Payment: {order.paymentStatus}
            </Badge>
            <Badge variant="secondary" className="capitalize">
              Order: {order.fulfilmentStatus.replace("_", " ")}
            </Badge>
          </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-2.5 text-sm">
        {order.items.map((item) => (
          <div key={item.id} className="flex justify-between gap-4">
            <span className="text-deep-earth-olive">
              {item.productNameSnapshot} × {item.quantity}
            </span>
            <span className="font-medium text-deep-earth-olive">
              {formatInrFromPaise(item.lineTotal)}
            </span>
          </div>
        ))}
      </div>

      <Separator />

      <div className="grid gap-6 sm:grid-cols-2 text-xs">
        <div className="space-y-1">
          <p className="font-semibold uppercase tracking-[0.08em] text-muted-olive">
            Delivery Address
          </p>
          <p className="font-medium text-deep-earth-olive">
            {order.shippingAddress.fullName}
          </p>
          <p className="text-deep-earth-olive leading-relaxed">
            {order.shippingAddress.addressLine1}, {order.shippingAddress.area},{" "}
            {order.shippingAddress.city}, {order.shippingAddress.state} —{" "}
            {order.shippingAddress.postalCode}
          </p>
        </div>

        <div className="space-y-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-olive">Subtotal</span>
            <span>{formatInrFromPaise(order.subtotal)}</span>
          </div>
          {order.discountAmount > 0 && (
            <div className="flex justify-between text-primary">
              <span>Discount</span>
              <span>−{formatInrFromPaise(order.discountAmount)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-olive">Shipping</span>
            <span>{formatInrFromPaise(order.shippingAmount)}</span>
          </div>
          <div className="flex justify-between font-semibold text-deep-earth-olive">
            <span>Total</span>
            <span>{formatInrFromPaise(order.totalAmount)}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 pt-2">
        <Button asChild>
          <Link href="/shop">Continue Shopping</Link>
        </Button>
        {profile && (
          <Button asChild variant="outline">
            <Link href="/account/orders">View Order History</Link>
          </Button>
        )}
      </div>
    </div>
  );
}

export default function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <StorefrontShell>
      <Section spacing="spacious" surface="ivory">
        <Container>
          <Suspense fallback={<Skeleton className="mx-auto h-96 max-w-2xl rounded-[var(--radius-xl)]" />}>
            <ConfirmationContent params={params} />
          </Suspense>
        </Container>
      </Section>
    </StorefrontShell>
  );
}
