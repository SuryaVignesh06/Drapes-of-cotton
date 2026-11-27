import { NextRequest, NextResponse } from "next/server";
import { getIntegrationReadiness } from "@/config/env";
import { getRazorpayPublicConfig } from "@/lib/razorpay";
import {
  calculateVerifiedCheckoutPricing,
  generateOrderNumber,
} from "@/lib/services/order.service";
import { createRazorpayOrder } from "@/lib/services/payment.service";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getAuthenticatedProfile } from "@/lib/supabase/auth-guards";
import { checkoutRequestSchema } from "@/lib/validations/store";

export async function POST(request: NextRequest) {
  try {
    const readiness = getIntegrationReadiness();
    if (!readiness.supabaseAdminConfigured || !readiness.razorpayConfigured) {
      return NextResponse.json(
        {
          error:
            "Checkout requires live Supabase and Razorpay credentials in .env.local.",
          missingKeys: readiness.missingKeys,
        },
        { status: 503 }
      );
    }

    const body = await request.json();
    const parsed = checkoutRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid checkout payload." },
        { status: 400 }
      );
    }

    const profile = await getAuthenticatedProfile();
    const pricing = await calculateVerifiedCheckoutPricing({
      items: parsed.data.items,
      shippingMethod: parsed.data.shippingMethod,
      couponCode: parsed.data.couponCode,
    });

    const admin = createSupabaseAdminClient();
    const orderNumber = generateOrderNumber();
    const now = new Date().toISOString();

    const { data: order, error: orderError } = await admin
      .from("orders")
      .insert({
        order_number: orderNumber,
        user_id: profile?.id ?? null,
        customer_email: parsed.data.customerEmail.toLowerCase(),
        customer_name: parsed.data.shippingAddress.fullName,
        customer_phone: parsed.data.shippingAddress.phone,
        subtotal: pricing.subtotal,
        discount_amount: pricing.discountAmount,
        shipping_amount: pricing.shippingAmount,
        total_amount: pricing.totalAmount,
        currency: "INR",
        payment_status: "pending",
        fulfilment_status: "payment_pending",
        shipping_address: parsed.data.shippingAddress,
        shipping_method: pricing.shippingOption.id,
        coupon_code: pricing.appliedCoupon,
        status_history: [
          {
            status: "payment_pending",
            timestamp: now,
            note: "Order created; awaiting Razorpay payment verification.",
          },
        ],
      })
      .select("id")
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: "Unable to create pending order." },
        { status: 500 }
      );
    }

    const { error: linesError } = await admin.from("order_items").insert(
      pricing.lines.map((line) => ({
        order_id: order.id,
        product_id: line.productId,
        product_name_snapshot: line.productName,
        sku_snapshot: line.sku,
        unit_price: line.unitPrice,
        quantity: line.quantity,
        line_total: line.lineTotal,
        variant_snapshot: line.variantSnapshot as never,
      }))
    );

    if (linesError) {
      await admin.from("orders").delete().eq("id", order.id);
      return NextResponse.json(
        { error: "Unable to persist order items." },
        { status: 500 }
      );
    }

    // Atomically lock and reserve product stock
    const { error: stockError } = await admin.rpc("reserve_inventory_for_order", {
      p_order_id: order.id,
      p_items: pricing.lines.map((l) => ({
        product_id: l.productId,
        quantity: l.quantity,
      })),
    });

    if (stockError) {
      await admin.from("orders").delete().eq("id", order.id);
      return NextResponse.json(
        { error: stockError.message },
        { status: 409 }
      );
    }

    let razorpayOrder;
    try {
      razorpayOrder = await createRazorpayOrder({
        amountPaise: pricing.totalAmount,
        receipt: orderNumber,
        notes: {
          order_id: order.id,
          order_number: orderNumber,
        },
      });
    } catch (err) {
      await admin.rpc("release_inventory_for_order", { p_order_id: order.id });
      await admin
        .from("orders")
        .update({ payment_status: "failed", fulfilment_status: "cancelled" })
        .eq("id", order.id);
      return NextResponse.json(
        {
          error:
            err instanceof Error
              ? err.message
              : "Razorpay order initiation failed.",
        },
        { status: 502 }
      );
    }

    await admin.from("payments").insert({
      order_id: order.id,
      provider: "razorpay",
      provider_order_id: razorpayOrder.id,
      amount: pricing.totalAmount,
      currency: "INR",
      status: "created",
    });

    const { keyId } = getRazorpayPublicConfig();

    return NextResponse.json({
      orderId: order.id,
      orderNumber,
      razorpayOrderId: razorpayOrder.id,
      amountPaise: pricing.totalAmount,
      currency: "INR",
      keyId,
    });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Unexpected error initiating checkout.",
      },
      { status: 400 }
    );
  }
}
