import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedProfile } from "@/lib/supabase/auth-guards";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { addressSchema } from "@/lib/validations/store";

export async function POST(request: NextRequest) {
  const profile = await getAuthenticatedProfile();
  if (!profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = addressSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid address data." },
      { status: 400 }
    );
  }

  const supabase = await createSupabaseServerClient();

  if (parsed.data.isDefault) {
    await supabase
      .from("addresses")
      .update({ is_default: false })
      .eq("user_id", profile.id);
  }

  const { data, error } = await supabase
    .from("addresses")
    .insert({
      user_id: profile.id,
      full_name: parsed.data.fullName,
      phone: parsed.data.phone,
      address_line_1: parsed.data.addressLine1,
      address_line_2: parsed.data.addressLine2 ?? null,
      area: parsed.data.area,
      city: parsed.data.city,
      state: parsed.data.state,
      postal_code: parsed.data.postalCode,
      country: parsed.data.country,
      address_type: parsed.data.addressType,
      is_default: parsed.data.isDefault,
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ address: data });
}

export async function PATCH(request: NextRequest) {
  const profile = await getAuthenticatedProfile();
  if (!profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { id?: string; setDefault?: boolean } & Record<string, unknown>;
  if (!body.id) {
    return NextResponse.json({ error: "Address ID is required." }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();

  if (body.setDefault) {
    await supabase
      .from("addresses")
      .update({ is_default: false })
      .eq("user_id", profile.id);

    const { error } = await supabase
      .from("addresses")
      .update({ is_default: true })
      .eq("id", body.id)
      .eq("user_id", profile.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  }

  const parsed = addressSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid address fields." },
      { status: 400 }
    );
  }

  if (parsed.data.isDefault) {
    await supabase
      .from("addresses")
      .update({ is_default: false })
      .eq("user_id", profile.id);
  }

  const { error } = await supabase
    .from("addresses")
    .update({
      full_name: parsed.data.fullName,
      phone: parsed.data.phone,
      address_line_1: parsed.data.addressLine1,
      address_line_2: parsed.data.addressLine2 ?? null,
      area: parsed.data.area,
      city: parsed.data.city,
      state: parsed.data.state,
      postal_code: parsed.data.postalCode,
      country: parsed.data.country,
      address_type: parsed.data.addressType,
      is_default: parsed.data.isDefault,
    })
    .eq("id", body.id)
    .eq("user_id", profile.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const profile = await getAuthenticatedProfile();
  if (!profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Address ID is required." }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("addresses")
    .delete()
    .eq("id", id)
    .eq("user_id", profile.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
