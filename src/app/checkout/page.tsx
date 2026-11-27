import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { StorefrontShell } from "@/components/layout/storefront-shell";
import { CheckoutClient } from "@/features/checkout/checkout-client";
import { DEFAULT_SHIPPING_METHODS } from "@/lib/constants/store";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Complete your Drapes of Cotton order via WhatsApp Checkout.",
};

export default function CheckoutPage() {
  return (
    <StorefrontShell>
      <Section spacing="default" surface="ivory">
        <Container className="space-y-8">
          <div>
            <p className="text-label-meta text-muted-olive">Direct Order</p>
            <h1 className="text-display-editorial mt-1 text-deep-earth-olive">
              Checkout
            </h1>
          </div>

          <CheckoutClient
            profile={null}
            savedAddresses={[]}
            shippingMethods={DEFAULT_SHIPPING_METHODS}
            integrationReady={false}
            missingKeys={[]}
          />
        </Container>
      </Section>
    </StorefrontShell>
  );
}
