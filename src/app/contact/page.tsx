import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { StorefrontShell } from "@/components/layout/storefront-shell";

export const metadata: Metadata = {
  title: "Contact",
  description: "Reach the Drapes of Cotton studio for saree styling, sizing, and order support.",
};

export default function ContactPage() {
  return (
    <StorefrontShell>
      <Section spacing="spacious" surface="ivory">
        <Container size="narrow" className="space-y-6">
          <p className="text-label-meta text-muted-olive">Studio Assistance</p>
          <h1 className="text-display-editorial text-deep-earth-olive">
            Contact Us
          </h1>
          <p className="text-body-editorial text-muted-olive">
            For questions regarding saree dimensions, fabric care, or an active
            order, please reach out to our boutique team.
          </p>
          <div className="grid gap-4 rounded-[var(--radius-xl)] border border-border bg-surface-secondary p-6 sm:grid-cols-2">
            <div>
              <p className="text-label-meta text-muted-olive">Email</p>
              <a
                href="mailto:care@drapesofcotton.com"
                className="mt-1 block text-base font-medium text-deep-earth-olive hover:underline"
              >
                care@drapesofcotton.com
              </a>
            </div>
            <div>
              <p className="text-label-meta text-muted-olive">Studio Hours</p>
              <p className="mt-1 text-base text-deep-earth-olive">
                Monday – Saturday, 10:00 AM – 6:00 PM IST
              </p>
            </div>
          </div>
        </Container>
      </Section>
    </StorefrontShell>
  );
}
