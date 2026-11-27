import crypto from "node:crypto";
import { getRazorpayServerConfig } from "@/lib/razorpay";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export interface RazorpayCreatedOrder {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
}

/**
 * Creates an order with Razorpay Orders API on the server using Basic Auth.
 * Amount must already be computed in integer paise from database prices.
 */
export async function createRazorpayOrder(params: {
  amountPaise: number;
  receipt: string;
  notes?: Record<string, string>;
}): Promise<RazorpayCreatedOrder> {
  const { keyId, keySecret } = getRazorpayServerConfig();

  const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: params.amountPaise,
      currency: "INR",
      receipt: params.receipt,
      notes: params.notes ?? {},
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Razorpay order creation failed (${response.status}): ${errorText}`);
  }

  return (await response.json()) as RazorpayCreatedOrder;
}

/**
 * Verifies Razorpay Checkout signature: hmac_sha256(order_id + "|" + payment_id, key_secret).
 */
export function verifyRazorpayPaymentSignature(params: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}): boolean {
  const { keySecret } = getRazorpayServerConfig();
  const payload = `${params.razorpayOrderId}|${params.razorpayPaymentId}`;
  const expected = crypto
    .createHmac("sha256", keySecret)
    .update(payload)
    .digest("hex");

  const expectedBuf = Buffer.from(expected, "utf8");
  const actualBuf = Buffer.from(params.razorpaySignature, "utf8");

  if (expectedBuf.length !== actualBuf.length) {
    return false;
  }

  return crypto.timingSafeEqual(expectedBuf, actualBuf);
}

/**
 * Verifies Razorpay webhook HMAC-SHA256 signature against raw request body.
 */
export function verifyRazorpayWebhookSignature(
  rawBody: string,
  signatureHeader: string
): boolean {
  const { webhookSecret } = getRazorpayServerConfig();
  const expected = crypto
    .createHmac("sha256", webhookSecret)
    .update(rawBody)
    .digest("hex");

  const expectedBuf = Buffer.from(expected, "utf8");
  const actualBuf = Buffer.from(signatureHeader, "utf8");

  if (expectedBuf.length !== actualBuf.length) {
    return false;
  }

  return crypto.timingSafeEqual(expectedBuf, actualBuf);
}

/**
 * Marks a payment & order as verified & confirmed strictly after server signature check.
 */
export async function markOrderPaymentVerified(params: {
  orderId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature?: string;
  rawPayload?: Record<string, unknown>;
}) {
  const admin = createSupabaseAdminClient();
  const now = new Date().toISOString();

  const { data: order } = await admin
    .from("orders")
    .select("id, payment_status, fulfilment_status, status_history")
    .eq("id", params.orderId)
    .single();

  if (!order) {
    throw new Error("Order not found.");
  }

  // Idempotent guard if already paid
  if (order.payment_status === "paid") {
    return { alreadyPaid: true };
  }

  await admin
    .from("payments")
    .update({
      provider_payment_id: params.razorpayPaymentId,
      provider_signature: params.razorpaySignature ?? null,
      status: "captured",
      verified_at: now,
      raw_payload: (params.rawPayload ?? null) as never,
    })
    .eq("order_id", params.orderId)
    .eq("provider_order_id", params.razorpayOrderId);

  const history = Array.isArray(order.status_history)
    ? [...(order.status_history as Array<{ status: string; timestamp: string; note?: string }>)]
    : [];

  history.push({
    status: "confirmed",
    timestamp: now,
    note: `Payment verified via Razorpay (${params.razorpayPaymentId})`,
  });

  await admin
    .from("orders")
    .update({
      payment_status: "paid",
      fulfilment_status: "confirmed",
      status_history: history,
    })
    .eq("id", params.orderId);

  return { alreadyPaid: false };
}

/**
 * Marks a failed/cancelled payment and releases reserved stock if still pending.
 */
export async function markOrderPaymentFailed(params: {
  orderId: string;
  reason: string;
}) {
  const admin = createSupabaseAdminClient();
  const { data: order } = await admin
    .from("orders")
    .select("id, payment_status, status_history")
    .eq("id", params.orderId)
    .maybeSingle();

  if (!order || order.payment_status === "paid" || order.payment_status === "failed") {
    return;
  }

  const history = Array.isArray(order.status_history)
    ? [...(order.status_history as Array<{ status: string; timestamp: string; note?: string }>)]
    : [];

  history.push({
    status: "cancelled",
    timestamp: new Date().toISOString(),
    note: params.reason,
  });

  await admin
    .from("orders")
    .update({
      payment_status: "failed",
      fulfilment_status: "cancelled",
      status_history: history,
    })
    .eq("id", params.orderId);

  await admin
    .from("payments")
    .update({ status: "failed" })
    .eq("order_id", params.orderId);

  await admin.rpc("release_inventory_for_order", { p_order_id: params.orderId });
}
