import { publicEnvSchema, serverEnvSchema } from "@/lib/validations";

function normalizeEnvValue(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : undefined;
}

/**
 * Safely reads client-safe public environment variables without throwing at import time.
 */
export function getPublicEnv() {
  const parsed = publicEnvSchema.safeParse({
    NEXT_PUBLIC_APP_URL: normalizeEnvValue(process.env.NEXT_PUBLIC_APP_URL),
    NEXT_PUBLIC_SUPABASE_URL: normalizeEnvValue(process.env.NEXT_PUBLIC_SUPABASE_URL),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: normalizeEnvValue(
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ),
    NEXT_PUBLIC_RAZORPAY_KEY_ID: normalizeEnvValue(
      process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
    ),
  });

  if (!parsed.success) {
    throw new Error(
      `Invalid public environment configuration: ${parsed.error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join("; ")}`
    );
  }

  return parsed.data;
}

/**
 * Safely reads server-side environment variables.
 * Throws immediately if called from a browser context.
 */
export function getServerEnv() {
  if (typeof window !== "undefined") {
    throw new Error(
      "Security violation: getServerEnv() must never be called in browser code."
    );
  }

  const parsed = serverEnvSchema.safeParse({
    NEXT_PUBLIC_APP_URL: normalizeEnvValue(process.env.NEXT_PUBLIC_APP_URL),
    NEXT_PUBLIC_SUPABASE_URL: normalizeEnvValue(process.env.NEXT_PUBLIC_SUPABASE_URL),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: normalizeEnvValue(
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ),
    NEXT_PUBLIC_RAZORPAY_KEY_ID: normalizeEnvValue(
      process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
    ),
    SUPABASE_SERVICE_ROLE_KEY: normalizeEnvValue(
      process.env.SUPABASE_SERVICE_ROLE_KEY
    ),
    RAZORPAY_KEY_SECRET: normalizeEnvValue(process.env.RAZORPAY_KEY_SECRET),
    RAZORPAY_WEBHOOK_SECRET: normalizeEnvValue(process.env.RAZORPAY_WEBHOOK_SECRET),
  });

  if (!parsed.success) {
    throw new Error(
      `Invalid server environment configuration: ${parsed.error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join("; ")}`
    );
  }

  return parsed.data;
}

/**
 * Returns non-secret readiness flags for diagnostics and Stage 1 shell status.
 */
export function getIntegrationReadiness() {
  const env = getServerEnv();

  const missingSupabaseClient: string[] = [];
  if (!env.NEXT_PUBLIC_SUPABASE_URL) missingSupabaseClient.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    missingSupabaseClient.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  const missingSupabaseAdmin = [...missingSupabaseClient];
  if (!env.SUPABASE_SERVICE_ROLE_KEY) {
    missingSupabaseAdmin.push("SUPABASE_SERVICE_ROLE_KEY");
  }

  const missingRazorpay: string[] = [];
  if (!env.NEXT_PUBLIC_RAZORPAY_KEY_ID) missingRazorpay.push("NEXT_PUBLIC_RAZORPAY_KEY_ID");
  if (!env.RAZORPAY_KEY_SECRET) missingRazorpay.push("RAZORPAY_KEY_SECRET");
  if (!env.RAZORPAY_WEBHOOK_SECRET) missingRazorpay.push("RAZORPAY_WEBHOOK_SECRET");

  return {
    appUrlConfigured: Boolean(env.NEXT_PUBLIC_APP_URL),
    supabaseClientConfigured: missingSupabaseClient.length === 0,
    supabaseAdminConfigured: missingSupabaseAdmin.length === 0,
    razorpayConfigured: missingRazorpay.length === 0,
    missingKeys: Array.from(
      new Set([...missingSupabaseAdmin, ...missingRazorpay])
    ),
  };
}
