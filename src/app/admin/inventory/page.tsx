import { connection } from "next/server";
import { AdminInventoryManager } from "@/features/admin/admin-inventory-manager";
import { listAllProductsAdmin } from "@/lib/services/product.service";
import { isSupabasePublicConfigured } from "@/lib/supabase/config";

export default async function AdminInventoryPage() {
  await connection();
  if (!isSupabasePublicConfigured()) return null;
  const products = await listAllProductsAdmin();
  return <AdminInventoryManager products={products} />;
}
