import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function adjustProductStock(params: {
  productId: string;
  newQuantity: number;
  reason: string;
  referenceId?: string;
}) {
  const admin = createSupabaseAdminClient();

  const { data: product, error: fetchError } = await admin
    .from("products")
    .select("id, stock_quantity")
    .eq("id", params.productId)
    .single();

  if (fetchError || !product) {
    throw new Error("Product not found.");
  }

  const delta = params.newQuantity - product.stock_quantity;
  if (delta === 0) return product.stock_quantity;

  const { error: updateError } = await admin
    .from("products")
    .update({ stock_quantity: params.newQuantity })
    .eq("id", params.productId);

  if (updateError) {
    throw new Error(`Failed to update stock: ${updateError.message}`);
  }

  await admin.from("inventory_movements").insert({
    product_id: params.productId,
    quantity_change: delta,
    reason: params.reason,
    reference_id: params.referenceId ?? null,
  });

  return params.newQuantity;
}

export async function getLowStockProducts(threshold = 5) {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("products")
    .select("id, name, sku, stock_quantity, is_published")
    .lte("stock_quantity", threshold)
    .order("stock_quantity", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch low-stock products: ${error.message}`);
  }
  return data ?? [];
}
