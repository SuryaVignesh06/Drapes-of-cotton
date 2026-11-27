import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isSupabasePublicConfigured } from "@/lib/supabase/config";
import { markOrderPaymentFailed } from "@/lib/services/payment.service";

const cancelSchema = z.object({
  orderId: z.string().uuid(),
  reason: z.string().trim().max(200).optional(),
});

export async function POST(request: NextRequest) {
  if (!isSupabasePublicConfigured()) {
    return NextResponse.json({ error: "Supabase not configured." }, { status: 503 });
  }

  const body = await request.json();
  const parsed = cancelSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid cancellation request." }, { status: 400 });
  }

  await markOrderPaymentFailed({
    orderId: parsed.data.orderId,
    reason: parsed.data.reason ?? "Payment cancelled by customer.",
  });

  return NextResponse.json({ cancelled: true });
}
