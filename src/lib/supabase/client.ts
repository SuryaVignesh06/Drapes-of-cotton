"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types";
import { getSupabasePublicConfig } from "./config";

let browserClient: SupabaseClient<Database> | undefined;

/**
 * Returns a singleton Supabase browser client configured with cookie-backed SSR auth.
 * Throws a clear configuration error if NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is missing.
 */
export function getSupabaseBrowserClient(): SupabaseClient<Database> {
  if (browserClient) {
    return browserClient;
  }

  const { url, anonKey } = getSupabasePublicConfig();
  browserClient = createBrowserClient<Database>(url, anonKey);
  return browserClient;
}
