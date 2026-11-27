import { Suspense } from "react";
import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { StorefrontShell } from "@/components/layout/storefront-shell";
import { Skeleton } from "@/components/ui/skeleton";
import { getIntegrationReadiness } from "@/config/env";
import { CheckoutClient } from "@/features/checkout/checkout-client";
import { getUserAddresses } from "@/lib/services/customer.service";
import { getConfiguredShippingMethods } from "@/lib/services/order.service";
import { getAuthenticatedProfile } from "@/lib/supabase/auth-guards";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Complete your Drapes of Cotton order via Razorpay Checkout.",
};

async function CheckoutContent() {
  const readiness = getIntegrationReadiness();
  const [profile, shippingMethods] = await Promise.all([
    getAuthenticatedProfile(),
    getConfiguredShippingMethods(),
  ]);
  const savedAddresses = profile ? await getUserAddresses(profile.id) : [];

  return (
    <CheckoutClient
      profile={profile}
      savedAddresses={savedAddresses}
      shippingMethods={shippingMethods}
      integrationReady={
        readiness.supabaseAdminConfigured && readiness.razorpayConfigured
      }
      missingKeys={readiness.missingKeys}
    />
  );
}

export default function CheckoutPage() {
  return (
    <StorefrontShell>
      <Section spacing="default" surface="ivory">
        <Container className="space-y-8">
          <div>
            <p className="text-label-meta text-muted-olive">Secure Checkout</p>
            <h1 className="text-display-editorial mt-1 text-deep-earth-olive">
              Checkout
            </h1>
          </div>

          <Suspense fallback={<Skeleton className="h-96 w-full rounded-[var(--radius-xl)]" />}>
            <CheckoutContent />
          </Suspense>
        </Container>
      </Section>
    </StorefrontShell>
  );
}
