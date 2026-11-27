import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { adjustProductStock } from "@/lib/services/inventory.service";
import { requireAdminProfile } from "@/lib/supabase/auth-guards";

const stockSchema = z.object({
  productId: z.string().uuid(),
  newQuantity: z.coerce.number().int().min(0),
  reason: z.string().trim().min(2).max(120).default("manual_admin_adjustment"),
});

export async function PATCH(request: NextRequest) {
  try {
    await requireAdminProfile();
  } catch (err) {
    const code = err instanceof Error && err.message === "FORBIDDEN" ? 403 : 401;
    return NextResponse.json({ error: "Admin access denied." }, { status: code });
  }

  const body = await request.json();
  const parsed = stockSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid stock payload." },
      { status: 400 }
    );
  }

  try {
    const updatedQty = await adjustProductStock(parsed.data);
    return NextResponse.json({ stockQuantity: updatedQty });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update stock." },
      { status: 400 }
    );
  }
}
