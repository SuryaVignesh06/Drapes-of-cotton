import { z } from "zod";

const optionalNonEmptyUrl = z
  .string()
  .trim()
  .optional()
  .refine((val) => !val || z.string().url().safeParse(val).success, {
    message: "Must be a valid URL when provided",
  });

/**
 * Public client-safe environment schema (NEXT_PUBLIC_* only).
 */
export const publicEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: optionalNonEmptyUrl,
  NEXT_PUBLIC_SUPABASE_URL: optionalNonEmptyUrl,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().trim().optional(),
  NEXT_PUBLIC_RAZORPAY_KEY_ID: z.string().trim().optional(),
});

/**
 * Server-only secret environment schema. Never import or evaluate in browser code.
 */
export const serverEnvSchema = publicEnvSchema.extend({
  SUPABASE_SERVICE_ROLE_KEY: z.string().trim().optional(),
  RAZORPAY_KEY_SECRET: z.string().trim().optional(),
  RAZORPAY_WEBHOOK_SECRET: z.string().trim().optional(),
});

export type PublicEnv = z.infer<typeof publicEnvSchema>;
export type ServerEnv = z.infer<typeof serverEnvSchema>;
