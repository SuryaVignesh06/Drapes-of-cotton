import { NextResponse } from "next/server";
import { getIntegrationReadiness } from "@/config/env";

/**
 * Lightweight Stage 1 diagnostics endpoint reporting non-secret readiness flags.
 */
export async function GET() {
  const readiness = getIntegrationReadiness();

  return NextResponse.json({
    status: "ok",
    stage: 1,
    integrations: {
      appUrlConfigured: readiness.appUrlConfigured,
      supabaseClientConfigured: readiness.supabaseClientConfigured,
      supabaseAdminConfigured: readiness.supabaseAdminConfigured,
      razorpayConfigured: readiness.razorpayConfigured,
    },
  });
}
