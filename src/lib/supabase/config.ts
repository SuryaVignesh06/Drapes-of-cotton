import { getPublicEnv, getServerEnv } from "@/config/env";

export interface SupabasePublicConfig {
  url: string;
  anonKey: string;
}

export interface SupabaseAdminConfig extends SupabasePublicConfig {
  serviceRoleKey: string;
}

/**
 * Checks whether the public Supabase credentials are present without throwing.
 */
export function isSupabasePublicConfigured(): boolean {
  const env = getPublicEnv();
  return Boolean(env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

/**
 * Returns validated public Supabase credentials or throws an actionable error.
 */
export function getSupabasePublicConfig(): SupabasePublicConfig {
  const { NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY } = getPublicEnv();

  const missing: string[] = [];
  if (!NEXT_PUBLIC_SUPABASE_URL) missing.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!NEXT_PUBLIC_SUPABASE_ANON_KEY) missing.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");

  if (missing.length > 0) {
    throw new Error(
      `Supabase client is not configured. Missing environment variable(s): ${missing.join(", ")}. Add them to .env.local to enable Supabase integration.`
    );
  }

  return {
    url: NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  };
}

/**
 * Server-only Supabase admin credentials accessor. Never import or call in browser code.
 */
export function getSupabaseAdminConfig(): SupabaseAdminConfig {
  if (typeof window !== "undefined") {
    throw new Error(
      "Security violation: getSupabaseAdminConfig() must never be executed in browser code."
    );
  }

  const publicConfig = getSupabasePublicConfig();
  const { SUPABASE_SERVICE_ROLE_KEY } = getServerEnv();

  if (!SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      "Supabase admin client is not configured. Missing server environment variable: SUPABASE_SERVICE_ROLE_KEY."
    );
  }

  return {
    ...publicConfig,
    serviceRoleKey: SUPABASE_SERVICE_ROLE_KEY,
  };
}
