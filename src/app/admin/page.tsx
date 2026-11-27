import Link from "next/link";
import { connection } from "next/server";
import { Badge } from "@/components/ui/badge";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isSupabasePublicConfigured } from "@/lib/supabase/config";
import { formatInrFromPaise } from "@/lib/utils";

export default async function AdminOverviewPage() {
  await connection();
  if (!isSupabasePublicConfigured()) return null;
  const admin = createSupabaseAdminClient();

  const [
    { count: productsCount },
    { count: customersCount },
    { data: orders },
    { data: lowStock },
  ] = await Promise.all([
    admin.from("products").select("id", { count: "exact", head: true }),
    admin
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "customer"),
    admin
      .from("orders")
      .select("id, order_number, total_amount, payment_status, fulfilment_status, created_at"),
    admin
      .from("products")
      .select("id, name, sku, stock_quantity")
      .lte("stock_quantity", 5)
      .order("stock_quantity", { ascending: true })
      .limit(6),
  ]);

  const allOrders = orders ?? [];
  const pendingOrders = allOrders.filter(
    (o) => o.fulfilment_status === "pending" || o.fulfilment_status === "payment_pending"
  ).length;
  const verifiedSalesPaise = allOrders
    .filter((o) => o.payment_status === "paid")
    .reduce((sum, o) => sum + o.total_amount, 0);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-label-meta text-muted-olive">Operations Overview</p>
        <h1 className="text-section-heading mt-1 text-deep-earth-olive">
          Store Dashboard
        </h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <div className="rounded-[var(--radius-lg)] border border-border bg-surface-secondary p-5">
          <p className="text-xs text-muted-olive">Verified Sales</p>
          <p className="font-editorial mt-1 text-2xl font-medium text-deep-earth-olive">
            {formatInrFromPaise(verifiedSalesPaise)}
          </p>
        </div>
        <div className="rounded-[var(--radius-lg)] border border-border bg-surface-secondary p-5">
          <p className="text-xs text-muted-olive">Total Orders</p>
          <p className="font-editorial mt-1 text-2xl font-medium text-deep-earth-olive">
            {allOrders.length}
          </p>
        </div>
        <div className="rounded-[var(--radius-lg)] border border-border bg-surface-secondary p-5">
          <p className="text-xs text-muted-olive">Pending Orders</p>
          <p className="font-editorial mt-1 text-2xl font-medium text-deep-earth-olive">
            {pendingOrders}
          </p>
        </div>
        <div className="rounded-[var(--radius-lg)] border border-border bg-surface-secondary p-5">
          <p className="text-xs text-muted-olive">Total Products</p>
          <p className="font-editorial mt-1 text-2xl font-medium text-deep-earth-olive">
            {productsCount ?? 0}
          </p>
        </div>
        <div className="rounded-[var(--radius-lg)] border border-border bg-surface-secondary p-5">
          <p className="text-xs text-muted-olive">Customers</p>
          <p className="font-editorial mt-1 text-2xl font-medium text-deep-earth-olive">
            {customersCount ?? 0}
          </p>
        </div>
      </div>

      <div className="rounded-[var(--radius-xl)] border border-border bg-surface-secondary p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-editorial text-2xl text-deep-earth-olive">
            Low Stock Sarees (≤ 5)
          </h2>
          <Link
            href="/admin/inventory"
            className="text-xs font-medium text-primary hover:underline"
          >
            Manage Inventory →
          </Link>
        </div>

        {(lowStock ?? []).length === 0 ? (
          <p className="text-sm text-muted-olive">No low-stock items right now.</p>
        ) : (
          <div className="divide-y divide-border">
            {(lowStock ?? []).map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between py-2.5 text-sm"
              >
                <div>
                  <p className="font-medium text-deep-earth-olive">{item.name}</p>
                  <p className="text-xs text-muted-olive">SKU: {item.sku}</p>
                </div>
                <Badge variant={item.stock_quantity === 0 ? "destructive" : "outline"}>
                  {item.stock_quantity} left
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
