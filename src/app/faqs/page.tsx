import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { StorefrontShell } from "@/components/layout/storefront-shell";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: "FAQs",
  description: "Frequently asked questions about Drapes of Cotton sarees, care, and orders.",
};

const FAQ_ITEMS = [
  {
    q: "Do Drapes of Cotton sarees include a blouse piece?",
    a: "Most of our curated cotton sarees include an unstitched matching or complementary blouse piece (typically 0.8–0.9 meters). Please check the Specifications section on each saree page for exact measurements.",
  },
  {
    q: "How should I wash and care for cotton sarees?",
    a: "We recommend a gentle cold hand wash separately using mild liquid detergent, followed by shade drying. Avoid harsh wringing or direct harsh sunlight to preserve natural yarn tones.",
  },
  {
    q: "How are shipping rates calculated?",
    a: "Shipping methods and rates are configured transparently at checkout based on your selected dispatch method and Indian delivery address.",
  },
  {
    q: "Which payment methods are supported?",
    a: "Payments are processed through Razorpay Standard Web Checkout with server-side signature verification, supporting UPI, cards, netbanking, and wallets.",
  },
];

export default function FaqsPage() {
  return (
    <StorefrontShell>
      <Section spacing="spacious" surface="ivory">
        <Container size="narrow" className="space-y-8">
          <div>
            <p className="text-label-meta text-muted-olive">Helpful Answers</p>
            <h1 className="text-display-editorial mt-2 text-deep-earth-olive">
              Frequently Asked Questions
            </h1>
          </div>

          <Accordion type="single" collapsible className="rounded-[var(--radius-xl)] border border-border bg-surface-secondary px-6">
            {FAQ_ITEMS.map((item, idx) => (
              <AccordionItem key={item.q} value={`faq-${idx}`}>
                <AccordionTrigger className="text-left text-base font-medium text-deep-earth-olive">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-olive">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Container>
      </Section>
    </StorefrontShell>
  );
}
