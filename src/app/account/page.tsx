import Link from "next/link";
import { getAuthenticatedProfile } from "@/lib/supabase/auth-guards";
import { getUserAddresses } from "@/lib/services/customer.service";
import { getUserOrders } from "@/lib/services/order.service";
import { formatInrFromPaise } from "@/lib/utils";

export default async function AccountOverviewPage() {
  const profile = await getAuthenticatedProfile();
  if (!profile) return null;

  const [addresses, orders] = await Promise.all([
    getUserAddresses(profile.id),
    getUserOrders(profile.id),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-label-meta text-muted-olive">Customer Account</p>
        <h1 className="text-section-heading mt-1 text-deep-earth-olive">
          Welcome, {profile.fullName || "Guest"}
        </h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Link
          href="/account/orders"
          className="rounded-[var(--radius-lg)] border border-border bg-surface-secondary p-5 transition-colors hover:bg-surface-cotton"
        >
          <p className="text-xs text-muted-olive">Orders</p>
          <p className="font-editorial mt-1 text-3xl text-deep-earth-olive">
            {orders.length}
          </p>
          <p className="mt-2 text-xs font-medium text-primary">View Order History →</p>
        </Link>

        <Link
          href="/account/addresses"
          className="rounded-[var(--radius-lg)] border border-border bg-surface-secondary p-5 transition-colors hover:bg-surface-cotton"
        >
          <p className="text-xs text-muted-olive">Saved Addresses</p>
          <p className="font-editorial mt-1 text-3xl text-deep-earth-olive">
            {addresses.length}
          </p>
          <p className="mt-2 text-xs font-medium text-primary">Manage Addresses →</p>
        </Link>

        <Link
          href="/account/profile"
          className="rounded-[var(--radius-lg)] border border-border bg-surface-secondary p-5 transition-colors hover:bg-surface-cotton"
        >
          <p className="text-xs text-muted-olive">Profile</p>
          <p className="mt-2 truncate text-sm font-medium text-deep-earth-olive">
            {profile.email}
          </p>
          <p className="mt-2 text-xs font-medium text-primary">Edit Details →</p>
        </Link>
      </div>

      {orders.length > 0 && (
        <div className="rounded-[var(--radius-xl)] border border-border bg-surface-secondary p-6">
          <h2 className="font-editorial text-2xl text-deep-earth-olive">
            Recent Order
          </h2>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm">
            <div>
              <p className="font-medium text-deep-earth-olive">
                {orders[0].orderNumber}
              </p>
              <p className="text-xs text-muted-olive">
                Payment: {orders[0].paymentStatus} · Fulfilment:{" "}
                {orders[0].fulfilmentStatus}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-medium text-deep-earth-olive">
                {formatInrFromPaise(orders[0].totalAmount)}
              </span>
              <Link
                href={`/account/orders/${orders[0].id}`}
                className="text-xs font-medium text-primary hover:underline"
              >
                View Details
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
