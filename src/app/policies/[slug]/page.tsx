import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { StorefrontShell } from "@/components/layout/storefront-shell";
import { Skeleton } from "@/components/ui/skeleton";

const POLICY_COPY: Record<
  string,
  { title: string; eyebrow: string; paragraphs: string[] }
> = {
  shipping: {
    eyebrow: "Delivery & Dispatch",
    title: "Shipping Information",
    paragraphs: [
      "Shipping options and rates are configured by the store owner and displayed clearly in your checkout summary prior to payment.",
      "Dispatch notifications and order status updates are recorded directly in your Drapes of Cotton account order history.",
    ],
  },
  returns: {
    eyebrow: "Care & Returns",
    title: "Returns & Exchanges",
    paragraphs: [
      "Unused, unwashed sarees in original condition with tags intact may be reviewed for return or exchange by contacting care@drapesofcotton.com with your order number.",
      "Please inspect natural weave variations carefully upon unboxing, as gentle slubs are inherent to authentic cotton yarns.",
    ],
  },
  privacy: {
    eyebrow: "Data Protection",
    title: "Privacy Policy",
    paragraphs: [
      "Drapes of Cotton collects only the customer details required to manage your account, saved addresses, and order fulfilment.",
      "Payment processing is handled through Razorpay; card and UPI credentials are never stored on our servers.",
    ],
  },
  terms: {
    eyebrow: "Storefront Terms",
    title: "Terms & Conditions",
    paragraphs: [
      "All listed prices are displayed in Indian Rupees (INR). Product availability and pricing are verified on the server at the time an order is created.",
      "Orders are confirmed only after server-side payment verification.",
    ],
  },
};

export function generateStaticParams() {
  return Object.keys(POLICY_COPY).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const doc = POLICY_COPY[slug];
  return { title: doc?.title ?? "Policy" };
}

async function PolicyContent({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = POLICY_COPY[slug];
  if (!doc) notFound();

  return (
    <Container size="narrow" className="space-y-6">
      <p className="text-label-meta text-muted-olive">{doc.eyebrow}</p>
      <h1 className="text-display-editorial text-deep-earth-olive">
        {doc.title}
      </h1>
      <div className="space-y-4 rounded-[var(--radius-xl)] border border-border bg-surface-secondary p-6 sm:p-8">
        {doc.paragraphs.map((p) => (
          <p key={p} className="text-body-editorial text-muted-olive">
            {p}
          </p>
        ))}
      </div>
    </Container>
  );
}

export default function PolicyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <StorefrontShell>
      <Section spacing="spacious" surface="ivory">
        <Suspense fallback={<Skeleton className="mx-auto h-64 max-w-4xl rounded-[var(--radius-xl)]" />}>
          <PolicyContent params={params} />
        </Suspense>
      </Section>
    </StorefrontShell>
  );
}
