import { isSupabasePublicConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { CustomerAddress } from "@/types";

export async function getUserAddresses(userId: string): Promise<CustomerAddress[]> {
  if (!isSupabasePublicConfigured()) return [];
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", userId)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    userId: row.user_id,
    fullName: row.full_name,
    phone: row.phone,
    addressLine1: row.address_line_1,
    addressLine2: row.address_line_2,
    area: row.area,
    city: row.city,
    state: row.state,
    postalCode: row.postal_code,
    country: row.country,
    addressType: row.address_type,
    isDefault: row.is_default,
    createdAt: row.created_at,
  }));
}
