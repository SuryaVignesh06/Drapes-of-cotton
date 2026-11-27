import { connection } from "next/server";
import { AdminProductsManager } from "@/features/admin/admin-products-manager";
import { listPublishedCollections } from "@/lib/services/collection.service";
import { listAllProductsAdmin } from "@/lib/services/product.service";
import { isSupabasePublicConfigured } from "@/lib/supabase/config";

export default async function AdminProductsPage() {
  await connection();
  if (!isSupabasePublicConfigured()) return null;
  const [products, { collections }] = await Promise.all([
    listAllProductsAdmin(),
    listPublishedCollections(),
  ]);

  return <AdminProductsManager products={products} collections={collections} />;
}
