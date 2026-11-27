import { Suspense } from "react";
import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { StorefrontShell } from "@/components/layout/storefront-shell";
import { AuthLoginForm } from "@/features/authentication/auth-login-form";
import { isSupabasePublicConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your Drapes of Cotton customer account.",
};

export default function LoginPage() {
  const supabaseReady = isSupabasePublicConfigured();

  return (
    <StorefrontShell>
      <Section spacing="spacious" surface="ivory">
        <Container size="narrow" className="max-w-md">
          <div className="rounded-[var(--radius-xl)] border border-border bg-surface-secondary p-6 sm:p-8 shadow-[var(--shadow-subtle)]">
            <p className="text-label-meta text-muted-olive">Customer Account</p>
            <h1 className="text-section-heading mt-2 text-deep-earth-olive">
              Sign In
            </h1>
            <p className="mt-2 mb-6 text-xs text-muted-olive">
              Access your saved cotton sarees, delivery addresses, and order history.
            </p>
            <Suspense fallback={null}>
              <AuthLoginForm supabaseReady={supabaseReady} />
            </Suspense>
          </div>
        </Container>
      </Section>
    </StorefrontShell>
  );
}
