import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types";
import { getSupabasePublicConfig, isSupabasePublicConfigured } from "./config";

/**
 * Cookie-less public Supabase client safe for cached public catalog reads (`use cache`).
 */
export function createSupabasePublicClient(): SupabaseClient<Database> | null {
  if (!isSupabasePublicConfigured()) {
    return null;
  }

  const { url, anonKey } = getSupabasePublicConfig();
  return createClient<Database>(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
