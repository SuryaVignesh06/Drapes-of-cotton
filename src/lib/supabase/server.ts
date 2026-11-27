import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { Database } from "@/types";
import { getSupabasePublicConfig } from "./config";

/**
 * Creates a request-scoped Supabase server client for Server Components,
 * Server Actions, and Route Handlers. Always creates a fresh instance per request.
 */
export async function createSupabaseServerClient(): Promise<SupabaseClient<Database>> {
  const { url, anonKey } = getSupabasePublicConfig();
  const cookieStore = await cookies();

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Called inside a Server Component where setting cookies is not permitted;
          // src/proxy.ts handles session cookie refresh before rendering.
        }
      },
    },
  });
}
