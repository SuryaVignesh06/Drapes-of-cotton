import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { StorefrontShell } from "@/components/layout/storefront-shell";
import { AuthRegisterForm } from "@/features/authentication/auth-register-form";
import { isSupabasePublicConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create a Drapes of Cotton customer account.",
};

export default function RegisterPage() {
  const supabaseReady = isSupabasePublicConfigured();

  return (
    <StorefrontShell>
      <Section spacing="spacious" surface="ivory">
        <Container size="narrow" className="max-w-md">
          <div className="rounded-[var(--radius-xl)] border border-border bg-surface-secondary p-6 sm:p-8 shadow-[var(--shadow-subtle)]">
            <p className="text-label-meta text-muted-olive">Welcome</p>
            <h1 className="text-section-heading mt-2 text-deep-earth-olive">
              Create Account
            </h1>
            <p className="mt-2 mb-6 text-xs text-muted-olive">
              Save favorite weaves, store delivery addresses, and track your orders.
            </p>
            <AuthRegisterForm supabaseReady={supabaseReady} />
          </div>
        </Container>
      </Section>
    </StorefrontShell>
  );
}
