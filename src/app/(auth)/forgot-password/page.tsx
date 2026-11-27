import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { StorefrontShell } from "@/components/layout/storefront-shell";
import { ForgotPasswordForm } from "@/features/authentication/forgot-password-form";

export const metadata: Metadata = {
  title: "Forgot Password",
  description: "Request a password reset link for your Drapes of Cotton account.",
};

export default function ForgotPasswordPage() {
  return (
    <StorefrontShell>
      <Section spacing="spacious" surface="ivory">
        <Container size="narrow" className="max-w-md">
          <div className="rounded-[var(--radius-xl)] border border-border bg-surface-secondary p-6 sm:p-8">
            <p className="text-label-meta text-muted-olive">Account Recovery</p>
            <h1 className="text-section-heading mt-2 text-deep-earth-olive">
              Reset Password
            </h1>
            <p className="mt-2 mb-6 text-xs text-muted-olive">
              Enter your email address and we will send a password reset link.
            </p>
            <ForgotPasswordForm />
          </div>
        </Container>
      </Section>
    </StorefrontShell>
  );
}
