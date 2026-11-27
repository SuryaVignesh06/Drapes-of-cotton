import { getPublicEnv, getServerEnv } from "@/config/env";

/**
 * Public Razorpay client configuration (key ID only; never exposes key secret).
 */
export function getRazorpayPublicConfig() {
  const { NEXT_PUBLIC_RAZORPAY_KEY_ID } = getPublicEnv();

  if (!NEXT_PUBLIC_RAZORPAY_KEY_ID) {
    throw new Error(
      "Razorpay is not configured: missing NEXT_PUBLIC_RAZORPAY_KEY_ID in environment variables."
    );
  }

  return {
    keyId: NEXT_PUBLIC_RAZORPAY_KEY_ID,
    currency: "INR" as const,
  };
}

/**
 * Server-only Razorpay credentials accessor for Stage 2 order & webhook verification.
 */
export function getRazorpayServerConfig() {
  if (typeof window !== "undefined") {
    throw new Error(
      "Security violation: getRazorpayServerConfig() cannot be executed in browser code."
    );
  }

  const {
    NEXT_PUBLIC_RAZORPAY_KEY_ID,
    RAZORPAY_KEY_SECRET,
    RAZORPAY_WEBHOOK_SECRET,
  } = getServerEnv();

  const missing: string[] = [];
  if (!NEXT_PUBLIC_RAZORPAY_KEY_ID) missing.push("NEXT_PUBLIC_RAZORPAY_KEY_ID");
  if (!RAZORPAY_KEY_SECRET) missing.push("RAZORPAY_KEY_SECRET");
  if (!RAZORPAY_WEBHOOK_SECRET) missing.push("RAZORPAY_WEBHOOK_SECRET");

  if (missing.length > 0) {
    throw new Error(
      `Razorpay server integration is not configured. Missing environment variable(s): ${missing.join(", ")}.`
    );
  }

  return {
    keyId: NEXT_PUBLIC_RAZORPAY_KEY_ID!,
    keySecret: RAZORPAY_KEY_SECRET!,
    webhookSecret: RAZORPAY_WEBHOOK_SECRET!,
    currency: "INR" as const,
  };
}
