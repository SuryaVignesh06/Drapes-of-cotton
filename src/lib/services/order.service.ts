import { DEFAULT_COUPONS, DEFAULT_SHIPPING_METHODS } from "@/lib/constants/store";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isSupabasePublicConfigured } from "@/lib/supabase/config";
import type { FulfilmentStatus, OrderRecord, ShippingMethodOption } from "@/types";

export interface CheckoutPricingInput {
  items: Array<{ productId: string; variantId?: string | null; quantity: number }>;
  shippingMethod: string;
  couponCode?: string;
}

export interface VerifiedCheckoutLine {
  productId: string;
  variantId: string | null;
  productName: string;
  sku: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  variantSnapshot: Record<string, unknown> | null;
}

export interface CheckoutPricingResult {
  lines: VerifiedCheckoutLine[];
  subtotal: number;
  discountAmount: number;
  shippingAmount: number;
  totalAmount: number;
  currency: "INR";
  appliedCoupon: string | null;
  shippingOption: ShippingMethodOption;
}

export async function getConfiguredShippingMethods(): Promise<ShippingMethodOption[]> {
  if (!isSupabasePublicConfigured()) {
    return DEFAULT_SHIPPING_METHODS;
  }

  try {
    const admin = createSupabaseAdminClient();
    const { data } = await admin
      .from("store_settings")
      .select("value")
      .eq("key", "shipping_config")
      .maybeSingle();

    const value = data?.value as { methods?: ShippingMethodOption[] } | null;
    if (value?.methods && Array.isArray(value.methods) && value.methods.length > 0) {
      return value.methods;
    }
  } catch {
    // Fall back to default configurable options when store_settings is not yet seeded.
  }
  return DEFAULT_SHIPPING_METHODS;
}

/**
 * Computes authoritative order totals strictly from database product & shipping records.
 * Never accepts prices or totals supplied by the browser.
 */
export async function calculateVerifiedCheckoutPricing(
  input: CheckoutPricingInput
): Promise<CheckoutPricingResult> {
  if (!isSupabasePublicConfigured()) {
    throw new Error(
      "Supabase is not configured. Checkout requires active database credentials in .env.local."
    );
  }

  const admin = createSupabaseAdminClient();
  const productIds = Array.from(new Set(input.items.map((i) => i.productId)));

  const { data: products, error } = await admin
    .from("products")
    .select("id, name, sku, price, stock_quantity, is_published")
    .in("id", productIds);

  if (error || !products) {
    throw new Error("Unable to verify catalog prices from database.");
  }

  const productMap = new Map(products.map((p) => [p.id, p]));
  const lines: VerifiedCheckoutLine[] = [];

  for (const item of input.items) {
    const product = productMap.get(item.productId);
    if (!product || !product.is_published) {
      throw new Error("One or more sarees in your bag are no longer available.");
    }
    if (product.stock_quantity < item.quantity) {
      throw new Error(
        `Insufficient stock for "${product.name}". Only ${product.stock_quantity} remaining.`
      );
    }

    let unitPrice = product.price;
    let sku = product.sku;
    let variantSnapshot: Record<string, unknown> | null = null;

    if (item.variantId) {
      const { data: variant } = await admin
        .from("product_variants")
        .select("id, name, sku, price, stock_quantity, is_active")
        .eq("id", item.variantId)
        .eq("product_id", product.id)
        .maybeSingle();

      if (!variant || !variant.is_active) {
        throw new Error(`Selected variant for "${product.name}" is unavailable.`);
      }
      if (variant.stock_quantity < item.quantity) {
        throw new Error(
          `Insufficient stock for "${product.name} (${variant.name})".`
        );
      }

      unitPrice = variant.price;
      sku = variant.sku;
      variantSnapshot = { id: variant.id, name: variant.name };
    }

    lines.push({
      productId: product.id,
      variantId: item.variantId ?? null,
      productName: product.name,
      sku,
      unitPrice,
      quantity: item.quantity,
      lineTotal: unitPrice * item.quantity,
      variantSnapshot,
    });
  }

  const subtotal = lines.reduce((sum, l) => sum + l.lineTotal, 0);

  let discountAmount = 0;
  let appliedCoupon: string | null = null;
  if (input.couponCode) {
    const code = input.couponCode.trim().toUpperCase();
    const coupon = DEFAULT_COUPONS[code];
    if (coupon && subtotal >= coupon.minSubtotalPaise) {
      discountAmount =
        coupon.type === "percent"
          ? Math.round((subtotal * coupon.value) / 100)
          : Math.min(coupon.value, subtotal);
      appliedCoupon = code;
    }
  }

  const shippingMethods = await getConfiguredShippingMethods();
  const shippingOption =
    shippingMethods.find((m) => m.id === input.shippingMethod) ?? shippingMethods[0];
  const shippingAmount = shippingOption.ratePaise;
  const totalAmount = Math.max(0, subtotal - discountAmount + shippingAmount);

  return {
    lines,
    subtotal,
    discountAmount,
    shippingAmount,
    totalAmount,
    currency: "INR",
    appliedCoupon,
    shippingOption,
  };
}

export function generateOrderNumber(): string {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randPart = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `DOC-${datePart}-${randPart}`;
}

export async function getUserOrders(userId: string): Promise<OrderRecord[]> {
  if (!isSupabasePublicConfigured()) return [];
  const admin = createSupabaseAdminClient();

  const { data, error } = await admin
    .from("orders")
    .select("*, order_items(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data.map(mapOrderRow);
}

export async function getOrderByIdForUser(
  orderId: string,
  userId: string | null,
  isAdmin = false
): Promise<OrderRecord | null> {
  if (!isSupabasePublicConfigured()) return null;
  const admin = createSupabaseAdminClient();

  const { data, error } = await admin
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", orderId)
    .maybeSingle();

  if (error || !data) return null;
  if (!isAdmin && data.user_id && data.user_id !== userId) {
    return null;
  }

  return mapOrderRow(data);
}

export async function getAllOrdersAdmin(): Promise<OrderRecord[]> {
  if (!isSupabasePublicConfigured()) {
    throw new Error("Supabase is not configured.");
  }
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("orders")
    .select("*, order_items(*)")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Unable to fetch orders: ${error.message}`);
  }
  return (data ?? []).map(mapOrderRow);
}

export async function updateOrderFulfilmentStatus(
  orderId: string,
  fulfilmentStatus: FulfilmentStatus,
  note?: string
): Promise<OrderRecord> {
  const admin = createSupabaseAdminClient();
  const { data: existing, error: fetchError } = await admin
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", orderId)
    .single();

  if (fetchError || !existing) {
    throw new Error("Order not found.");
  }

  const history = Array.isArray(existing.status_history)
    ? [...(existing.status_history as Array<{ status: string; timestamp: string; note?: string }>)]
    : [];

  history.push({
    status: fulfilmentStatus,
    timestamp: new Date().toISOString(),
    note: note || `Status updated to ${fulfilmentStatus}`,
  });

  const { data: updated, error: updateError } = await admin
    .from("orders")
    .update({
      fulfilment_status: fulfilmentStatus,
      status_history: history,
    })
    .eq("id", orderId)
    .select("*, order_items(*)")
    .single();

  if (updateError || !updated) {
    throw new Error(`Failed to update order status: ${updateError?.message ?? "unknown error"}`);
  }

  return mapOrderRow(updated);
}

function mapOrderRow(row: Record<string, unknown>): OrderRecord {
  const items = Array.isArray(row.order_items)
    ? (row.order_items as Array<Record<string, unknown>>).map((item) => ({
        id: String(item.id),
        productId: item.product_id ? String(item.product_id) : null,
        productNameSnapshot: String(item.product_name_snapshot),
        skuSnapshot: String(item.sku_snapshot),
        unitPrice: Number(item.unit_price),
        quantity: Number(item.quantity),
        lineTotal: Number(item.line_total),
        variantSnapshot:
          typeof item.variant_snapshot === "object" && item.variant_snapshot !== null
            ? (item.variant_snapshot as Record<string, unknown>)
            : null,
      }))
    : [];

  return {
    id: String(row.id),
    orderNumber: String(row.order_number),
    userId: row.user_id ? String(row.user_id) : null,
    customerEmail: String(row.customer_email),
    customerName: String(row.customer_name),
    customerPhone: String(row.customer_phone),
    subtotal: Number(row.subtotal),
    discountAmount: Number(row.discount_amount),
    shippingAmount: Number(row.shipping_amount),
    totalAmount: Number(row.total_amount),
    currency: String(row.currency),
    paymentStatus: row.payment_status as OrderRecord["paymentStatus"],
    fulfilmentStatus: row.fulfilment_status as OrderRecord["fulfilmentStatus"],
    shippingAddress: row.shipping_address as OrderRecord["shippingAddress"],
    shippingMethod: String(row.shipping_method),
    couponCode: row.coupon_code ? String(row.coupon_code) : null,
    statusHistory: Array.isArray(row.status_history)
      ? (row.status_history as OrderRecord["statusHistory"])
      : [],
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
    items,
  };
}
