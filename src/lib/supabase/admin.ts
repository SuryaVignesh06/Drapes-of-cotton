import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types";
import { getSupabaseAdminConfig } from "./config";

/**
 * Creates a privileged server-only Supabase client using SUPABASE_SERVICE_ROLE_KEY.
 * Use strictly for verified webhooks or administrative server operations that require
 * elevated privileges beyond RLS. Never import or expose in client components.
 */
export function createSupabaseAdminClient(): SupabaseClient<Database> {
  if (typeof window !== "undefined") {
    throw new Error(
      "Security violation: createSupabaseAdminClient() must never run in the browser."
    );
  }

  const { url, serviceRoleKey } = getSupabaseAdminConfig();

  return createClient<Database>(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
