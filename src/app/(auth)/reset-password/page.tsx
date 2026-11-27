import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { StorefrontShell } from "@/components/layout/storefront-shell";
import { ResetPasswordForm } from "@/features/authentication/reset-password-form";

export const metadata: Metadata = {
  title: "Set New Password",
  description: "Set a new password for your Drapes of Cotton account.",
};

export default function ResetPasswordPage() {
  return (
    <StorefrontShell>
      <Section spacing="spacious" surface="ivory">
        <Container size="narrow" className="max-w-md">
          <div className="rounded-[var(--radius-xl)] border border-border bg-surface-secondary p-6 sm:p-8">
            <p className="text-label-meta text-muted-olive">Account Security</p>
            <h1 className="text-section-heading mt-2 text-deep-earth-olive">
              Set New Password
            </h1>
            <p className="mt-2 mb-6 text-xs text-muted-olive">
              Choose a strong password for your Drapes of Cotton account.
            </p>
            <ResetPasswordForm />
          </div>
        </Container>
      </Section>
    </StorefrontShell>
  );
}
