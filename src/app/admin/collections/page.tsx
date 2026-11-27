import { connection } from "next/server";
import { AdminCollectionsManager } from "@/features/admin/admin-collections-manager";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isSupabasePublicConfigured } from "@/lib/supabase/config";

export default async function AdminCollectionsPage() {
  await connection();
  if (!isSupabasePublicConfigured()) return null;
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .from("collections")
    .select("*")
    .order("sort_order", { ascending: true });

  const collections = (data ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    coverImage: c.cover_image,
    isFeatured: c.is_featured,
    isPublished: c.is_published,
    sortOrder: c.sort_order,
  }));

  return <AdminCollectionsManager collections={collections} />;
}
