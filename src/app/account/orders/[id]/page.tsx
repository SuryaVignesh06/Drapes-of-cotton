import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { getOrderByIdForUser } from "@/lib/services/order.service";
import { getAuthenticatedProfile } from "@/lib/supabase/auth-guards";
import { formatInrFromPaise } from "@/lib/utils";

async function OrderDetailContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await getAuthenticatedProfile();
  if (!profile) return null;

  const order = await getOrderByIdForUser(
    id,
    profile.id,
    profile.role === "admin"
  );
  if (!order) notFound();

  return (
    <div className="space-y-6 rounded-[var(--radius-xl)] border border-border bg-surface-secondary p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/account/orders"
            className="text-xs text-primary hover:underline"
          >
            ← Back to Orders
          </Link>
          <h1 className="text-section-heading mt-2 text-deep-earth-olive">
            Order {order.orderNumber}
          </h1>
          <p className="text-xs text-muted-olive">
            Placed on {new Date(order.createdAt).toLocaleString("en-IN")}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="capitalize">
            Payment: {order.paymentStatus}
          </Badge>
          <Badge className="capitalize">
            Fulfilment: {order.fulfilmentStatus.replace("_", " ")}
          </Badge>
        </div>
      </div>

      <Separator />

      <div className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-olive">
          Items
        </h2>
        <div className="divide-y divide-border">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between py-3 text-sm">
              <div>
                <p className="font-medium text-deep-earth-olive">
                  {item.productNameSnapshot}
                </p>
                <p className="text-xs text-muted-olive">
                  SKU: {item.skuSnapshot} · Qty: {item.quantity}
                </p>
              </div>
              <span className="font-medium text-deep-earth-olive">
                {formatInrFromPaise(item.lineTotal)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-1.5 text-xs">
          <h2 className="font-semibold uppercase tracking-[0.08em] text-muted-olive">
            Delivery Address
          </h2>
          <p className="font-medium text-deep-earth-olive">
            {order.shippingAddress.fullName}
          </p>
          <p className="text-muted-olive">{order.shippingAddress.phone}</p>
          <p className="text-deep-earth-olive leading-relaxed">
            {order.shippingAddress.addressLine1}
            {order.shippingAddress.addressLine2
              ? `, ${order.shippingAddress.addressLine2}`
              : ""}
            <br />
            {order.shippingAddress.area}, {order.shippingAddress.city}
            <br />
            {order.shippingAddress.state} — {order.shippingAddress.postalCode}
          </p>
        </div>

        <div className="space-y-2 text-sm">
          <h2 className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-olive">
            Summary
          </h2>
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
          <div className="flex justify-between border-t border-border pt-2 font-semibold text-deep-earth-olive">
            <span>Total</span>
            <span>{formatInrFromPaise(order.totalAmount)}</span>
          </div>
        </div>
      </div>

      {order.statusHistory.length > 0 && (
        <>
          <Separator />
          <div className="space-y-2">
            <h2 className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-olive">
              Status Timeline
            </h2>
            <ul className="space-y-2 text-xs">
              {order.statusHistory.map((entry, idx) => (
                <li key={idx} className="flex items-center justify-between gap-4">
                  <span className="text-deep-earth-olive">
                    <strong className="capitalize">{entry.status.replace("_", " ")}</strong>
                    {entry.note ? ` — ${entry.note}` : ""}
                  </span>
                  <span className="text-muted-olive">
                    {new Date(entry.timestamp).toLocaleString("en-IN")}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}

export default function AccountOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<Skeleton className="h-96 rounded-[var(--radius-xl)]" />}>
      <OrderDetailContent params={params} />
    </Suspense>
  );
}
