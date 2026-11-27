import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types";
import { isSupabasePublicConfigured, getSupabasePublicConfig } from "./config";

/**
 * Refreshes the Supabase auth session on incoming requests in Next.js 16 Proxy.
 * Passes through cleanly during Stage 1 when Supabase credentials are not yet populated.
 */
export async function updateSupabaseSession(request: NextRequest): Promise<NextResponse> {
  let response = NextResponse.next({
    request,
  });

  if (!isSupabasePublicConfigured()) {
    return response;
  }

  const { url, anonKey } = getSupabasePublicConfig();

  const supabase = createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });

        response = NextResponse.next({
          request,
        });

        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });

        Object.entries(headers).forEach(([key, value]) => {
          response.headers.set(key, value);
        });
      },
    },
  });

  // Validates JWT claims and triggers cookie refresh when needed before route rendering.
  await supabase.auth.getClaims();

  return response;
}
