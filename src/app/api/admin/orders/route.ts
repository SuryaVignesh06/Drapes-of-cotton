import { NextRequest, NextResponse } from "next/server";
import { updateOrderFulfilmentStatus } from "@/lib/services/order.service";
import { requireAdminProfile } from "@/lib/supabase/auth-guards";
import { orderStatusUpdateSchema } from "@/lib/validations/store";

export async function PATCH(request: NextRequest) {
  try {
    await requireAdminProfile();
  } catch (err) {
    const code = err instanceof Error && err.message === "FORBIDDEN" ? 403 : 401;
    return NextResponse.json({ error: "Admin access denied." }, { status: code });
  }

  const body = (await request.json()) as { id?: string } & Record<string, unknown>;
  if (!body.id) {
    return NextResponse.json({ error: "Order ID required." }, { status: 400 });
  }

  const parsed = orderStatusUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid order status." },
      { status: 400 }
    );
  }

  try {
    const updated = await updateOrderFulfilmentStatus(
      body.id,
      parsed.data.fulfilmentStatus,
      parsed.data.note
    );
    return NextResponse.json({ order: updated });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update order." },
      { status: 400 }
    );
  }
}
