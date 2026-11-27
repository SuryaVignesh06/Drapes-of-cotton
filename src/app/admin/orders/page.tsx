import { connection } from "next/server";
import { AdminOrdersManager } from "@/features/admin/admin-orders-manager";
import { getAllOrdersAdmin } from "@/lib/services/order.service";
import { isSupabasePublicConfigured } from "@/lib/supabase/config";

export default async function AdminOrdersPage() {
  await connection();
  if (!isSupabasePublicConfigured()) return null;
  const orders = await getAllOrdersAdmin();
  return <AdminOrdersManager orders={orders} />;
}
