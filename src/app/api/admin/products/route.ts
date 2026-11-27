import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireAdminProfile } from "@/lib/supabase/auth-guards";
import { rupeesToPaise } from "@/lib/utils";
import { adminProductSchema } from "@/lib/validations/store";

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
  const parsed = adminProductSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid product fields." },
      { status: 400 }
    );
  }

  const v = parsed.data;
  const admin = createSupabaseAdminClient();

  const { data: product, error } = await admin
    .from("products")
    .insert({
      name: v.name,
      slug: v.slug,
      sku: v.sku,
      short_description: v.shortDescription,
      description: v.description,
      price: rupeesToPaise(v.priceRupees),
      compare_at_price:
        v.compareAtPriceRupees !== null
          ? rupeesToPaise(v.compareAtPriceRupees)
          : null,
      currency: "INR",
      fabric: v.fabric,
      weave: v.weave || null,
      color: v.color,
      occasion: v.occasion,
      saree_length: v.sareeLength || null,
      blouse_piece_length: v.blousePieceLength || null,
      blouse_piece_included: v.blousePieceIncluded,
      care_instructions: v.careInstructions || null,
      origin: v.origin || null,
      stock_quantity: v.stockQuantity,
      is_featured: v.isFeatured,
      is_new: v.isNew,
      is_published: v.isPublished,
      seo_title: v.seoTitle || null,
      seo_description: v.seoDescription || null,
    })
    .select("id")
    .single();

  if (error || !product) {
    return NextResponse.json(
      { error: error?.message ?? "Failed to create product." },
      { status: 400 }
    );
  }

  if (v.collectionIds.length > 0) {
    await admin.from("product_collections").insert(
      v.collectionIds.map((collectionId) => ({
        product_id: product.id,
        collection_id: collectionId,
      }))
    );
  }

  if (v.images.length > 0) {
    await admin.from("product_images").insert(
      v.images.map((img, idx) => ({
        product_id: product.id,
        image_url: img.imageUrl,
        alt_text: img.altText,
        image_type: img.imageType,
        sort_order: idx,
      }))
    );
  }

  return NextResponse.json({ id: product.id }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  try {
    await requireAdminProfile();
  } catch (err) {
    return NextResponse.json({ error: "Admin access denied." }, { status: authStatus(err) });
  }

  const body = (await request.json()) as { id?: string } & Record<string, unknown>;
  if (!body.id) {
    return NextResponse.json({ error: "Product ID is required." }, { status: 400 });
  }

  const parsed = adminProductSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid product fields." },
      { status: 400 }
    );
  }

  const v = parsed.data;
  const admin = createSupabaseAdminClient();

  const { error } = await admin
    .from("products")
    .update({
      name: v.name,
      slug: v.slug,
      sku: v.sku,
      short_description: v.shortDescription,
      description: v.description,
      price: rupeesToPaise(v.priceRupees),
      compare_at_price:
        v.compareAtPriceRupees !== null
          ? rupeesToPaise(v.compareAtPriceRupees)
          : null,
      fabric: v.fabric,
      weave: v.weave || null,
      color: v.color,
      occasion: v.occasion,
      saree_length: v.sareeLength || null,
      blouse_piece_length: v.blousePieceLength || null,
      blouse_piece_included: v.blousePieceIncluded,
      care_instructions: v.careInstructions || null,
      origin: v.origin || null,
      stock_quantity: v.stockQuantity,
      is_featured: v.isFeatured,
      is_new: v.isNew,
      is_published: v.isPublished,
      seo_title: v.seoTitle || null,
      seo_description: v.seoDescription || null,
    })
    .eq("id", body.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  await admin.from("product_collections").delete().eq("product_id", body.id);
  if (v.collectionIds.length > 0) {
    await admin.from("product_collections").insert(
      v.collectionIds.map((collectionId) => ({
        product_id: body.id!,
        collection_id: collectionId,
      }))
    );
  }

  await admin.from("product_images").delete().eq("product_id", body.id);
  if (v.images.length > 0) {
    await admin.from("product_images").insert(
      v.images.map((img, idx) => ({
        product_id: body.id!,
        image_url: img.imageUrl,
        alt_text: img.altText,
        image_type: img.imageType,
        sort_order: idx,
      }))
    );
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
    return NextResponse.json({ error: "Product ID required." }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("products").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
