import { isSupabasePublicConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getUserWishlistProductIds(userId: string): Promise<string[]> {
  if (!isSupabasePublicConfigured()) return [];
  const supabase = await createSupabaseServerClient();

  const { data: wishlist } = await supabase
    .from("wishlists")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (!wishlist) return [];

  const { data: items } = await supabase
    .from("wishlist_items")
    .select("product_id")
    .eq("wishlist_id", wishlist.id);

  return (items ?? []).map((item) => item.product_id);
}
