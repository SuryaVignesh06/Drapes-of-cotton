import { NextRequest, NextResponse } from "next/server";
import { getIntegrationReadiness } from "@/config/env";
import {
  markOrderPaymentFailed,
  markOrderPaymentVerified,
  verifyRazorpayPaymentSignature,
} from "@/lib/services/payment.service";
import { razorpayVerificationSchema } from "@/lib/validations/store";

export async function POST(request: NextRequest) {
  try {
    const readiness = getIntegrationReadiness();
    if (!readiness.supabaseAdminConfigured || !readiness.razorpayConfigured) {
      return NextResponse.json(
        { error: "Payment verification unavailable: missing server credentials." },
        { status: 503 }
      );
    }

    const body = await request.json();
    const parsed = razorpayVerificationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payment verification payload." },
        { status: 400 }
      );
    }

    const validSignature = verifyRazorpayPaymentSignature({
      razorpayOrderId: parsed.data.razorpayOrderId,
      razorpayPaymentId: parsed.data.razorpayPaymentId,
      razorpaySignature: parsed.data.razorpaySignature,
    });

    if (!validSignature) {
      await markOrderPaymentFailed({
        orderId: parsed.data.orderId,
        reason: "Razorpay signature verification failed.",
      });
      return NextResponse.json(
        { error: "Payment signature verification failed." },
        { status: 400 }
      );
    }

    await markOrderPaymentVerified({
      orderId: parsed.data.orderId,
      razorpayOrderId: parsed.data.razorpayOrderId,
      razorpayPaymentId: parsed.data.razorpayPaymentId,
      razorpaySignature: parsed.data.razorpaySignature,
    });

    return NextResponse.json({
      verified: true,
      orderId: parsed.data.orderId,
    });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Error verifying payment signature.",
      },
      { status: 500 }
    );
  }
}
