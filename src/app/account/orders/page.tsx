import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { getUserOrders } from "@/lib/services/order.service";
import { getAuthenticatedProfile } from "@/lib/supabase/auth-guards";
import { formatInrFromPaise } from "@/lib/utils";

export default async function AccountOrdersPage() {
  const profile = await getAuthenticatedProfile();
  if (!profile) return null;

  const orders = await getUserOrders(profile.id);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-label-meta text-muted-olive">Order History</p>
        <h1 className="text-section-heading mt-1 text-deep-earth-olive">
          Your Orders
        </h1>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-[var(--radius-xl)] border border-border bg-surface-secondary px-6 py-12 text-center">
          <p className="font-editorial text-2xl text-deep-earth-olive">
            You haven&apos;t placed any orders yet
          </p>
          <Link
            href="/shop"
            className="mt-3 inline-block text-xs font-medium uppercase tracking-[0.08em] text-primary hover:underline"
          >
            Browse Cotton Sarees
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-[var(--radius-lg)] border border-border bg-surface-secondary p-5"
            >
              <div className="space-y-1">
                <p className="text-sm font-semibold text-deep-earth-olive">
                  {order.orderNumber}
                </p>
                <p className="text-xs text-muted-olive">
                  Placed on {new Date(order.createdAt).toLocaleDateString("en-IN")} ·{" "}
                  {order.items.length} {order.items.length === 1 ? "item" : "items"}
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <Badge variant="outline" className="capitalize">
                    Payment: {order.paymentStatus}
                  </Badge>
                  <Badge variant="secondary" className="capitalize">
                    Status: {order.fulfilmentStatus.replace("_", " ")}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-base font-medium text-deep-earth-olive">
                  {formatInrFromPaise(order.totalAmount)}
                </span>
                <Link
                  href={`/account/orders/${order.id}`}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  View Order →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
