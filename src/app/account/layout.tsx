import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { StorefrontShell } from "@/components/layout/storefront-shell";

export const metadata: Metadata = {
  title: "Account | Drapes of Cotton",
  robots: { index: false, follow: false },
};

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <StorefrontShell>
      <Section spacing="spacious" surface="ivory">
        <Container size="narrow">{children}</Container>
      </Section>
    </StorefrontShell>
  );
}
