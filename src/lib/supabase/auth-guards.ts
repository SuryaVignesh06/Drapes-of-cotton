import { isSupabasePublicConfigured } from "./config";
import { createSupabaseServerClient } from "./server";
import type { CustomerProfile } from "@/types";

/**
 * Returns the authenticated customer's profile from Supabase Auth + profiles table.
 * Returns null if unauthenticated or if Supabase credentials are not yet configured.
 */
export async function getAuthenticatedProfile(): Promise<CustomerProfile | null> {
  if (!isSupabasePublicConfigured()) {
    return null;
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, phone, role")
    .eq("id", user.id)
    .maybeSingle();

  return {
    id: user.id,
    email: user.email ?? "",
    fullName: profile?.full_name ?? (user.user_metadata?.full_name as string | undefined) ?? "",
    phone: profile?.phone ?? "",
    role: profile?.role ?? "customer",
  };
}

/**
 * Strict server-side admin gate for Route Handlers, Server Actions, and /admin layouts.
 * Throws or returns null so callers enforce authorization on the server.
 */
export async function requireAdminProfile(): Promise<CustomerProfile> {
  if (!isSupabasePublicConfigured()) {
    throw new Error("Supabase is not configured. Admin authentication is unavailable.");
  }

  const profile = await getAuthenticatedProfile();
  if (!profile) {
    throw new Error("UNAUTHORIZED");
  }

  if (profile.role !== "admin") {
    throw new Error("FORBIDDEN");
  }

  return profile;
}
