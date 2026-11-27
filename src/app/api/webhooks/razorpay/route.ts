import { NextRequest, NextResponse } from "next/server";
import { getIntegrationReadiness } from "@/config/env";
import {
  markOrderPaymentFailed,
  markOrderPaymentVerified,
  verifyRazorpayWebhookSignature,
} from "@/lib/services/payment.service";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

interface RazorpayWebhookPayload {
  event: string;
  payload?: {
    payment?: {
      entity?: {
        id?: string;
        order_id?: string;
        error_description?: string;
      };
    };
  };
}

export async function POST(request: NextRequest) {
  const readiness = getIntegrationReadiness();
  if (!readiness.supabaseAdminConfigured || !readiness.razorpayConfigured) {
    return NextResponse.json(
      { error: "Webhook handler unavailable: missing server credentials." },
      { status: 503 }
    );
  }

  const signature = request.headers.get("x-razorpay-signature");
  const eventId = request.headers.get("x-razorpay-event-id");
  if (!signature) {
    return NextResponse.json({ error: "Missing webhook signature." }, { status: 400 });
  }

  const rawBody = await request.text();
  if (!verifyRazorpayWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 401 });
  }

  const parsed = JSON.parse(rawBody) as RazorpayWebhookPayload;
  const admin = createSupabaseAdminClient();

  const dedupeId =
    eventId ??
    `${parsed.event}:${parsed.payload?.payment?.entity?.id ?? "unknown"}`;

  // Idempotency check
  const { data: existingEvent } = await admin
    .from("webhook_events")
    .select("id")
    .eq("event_id", dedupeId)
    .maybeSingle();

  if (existingEvent) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  await admin.from("webhook_events").insert({
    provider: "razorpay",
    event_id: dedupeId,
    event_type: parsed.event,
    payload: parsed as never,
  });

  const paymentEntity = parsed.payload?.payment?.entity;
  const razorpayOrderId = paymentEntity?.order_id;
  const razorpayPaymentId = paymentEntity?.id;

  if (razorpayOrderId) {
    const { data: paymentRow } = await admin
      .from("payments")
      .select("order_id")
      .eq("provider_order_id", razorpayOrderId)
      .maybeSingle();

    if (paymentRow?.order_id) {
      if (
        (parsed.event === "payment.captured" || parsed.event === "order.paid") &&
        razorpayPaymentId
      ) {
        await markOrderPaymentVerified({
          orderId: paymentRow.order_id,
          razorpayOrderId,
          razorpayPaymentId,
          rawPayload: parsed as unknown as Record<string, unknown>,
        });
      } else if (parsed.event === "payment.failed") {
        await markOrderPaymentFailed({
          orderId: paymentRow.order_id,
          reason:
            paymentEntity?.error_description ??
            "Payment failed (Razorpay webhook).",
        });
      }
    }
  }

  return NextResponse.json({ received: true });
}
