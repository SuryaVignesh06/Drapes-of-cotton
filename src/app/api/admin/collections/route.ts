import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireAdminProfile } from "@/lib/supabase/auth-guards";
import { adminCollectionSchema } from "@/lib/validations/store";

function authStatus(err: unknown): number {
  return err instanceof Error && err.message === "FORBIDDEN" ? 403 : 401;
}

export async function POST(request: NextRequest) {
  try {
    await requireAdminProfile();
  } catch (err) {
    return NextResponse.json({ error: "Admin access denied." }, { status: authStatus(err) });
  }

  const body = await request.json();
  const parsed = adminCollectionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid collection fields." },
      { status: 400 }
    );
  }

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("collections")
    .insert({
      name: parsed.data.name,
      slug: parsed.data.slug,
      description: parsed.data.description || null,
      cover_image: parsed.data.coverImage || null,
      is_featured: parsed.data.isFeatured,
      is_published: parsed.data.isPublished,
      sort_order: parsed.data.sortOrder,
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ collection: data }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  try {
    await requireAdminProfile();
  } catch (err) {
    return NextResponse.json({ error: "Admin access denied." }, { status: authStatus(err) });
  }

  const body = (await request.json()) as { id?: string } & Record<string, unknown>;
  if (!body.id) {
    return NextResponse.json({ error: "Collection ID required." }, { status: 400 });
  }

  const parsed = adminCollectionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid collection fields." },
      { status: 400 }
    );
  }

  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from("collections")
    .update({
      name: parsed.data.name,
      slug: parsed.data.slug,
      description: parsed.data.description || null,
      cover_image: parsed.data.coverImage || null,
      is_featured: parsed.data.isFeatured,
      is_published: parsed.data.isPublished,
      sort_order: parsed.data.sortOrder,
    })
    .eq("id", body.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  try {
    await requireAdminProfile();
  } catch (err) {
    return NextResponse.json({ error: "Admin access denied." }, { status: authStatus(err) });
  }

  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Collection ID required." }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("collections").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
