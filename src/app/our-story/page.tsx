import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { StorefrontShell } from "@/components/layout/storefront-shell";
import { Button } from "@/components/ui/button";
import { CRAFT_PILLARS } from "@/lib/constants/store";

export const metadata: Metadata = {
  title: "Our Story",
  description:
    "Rooted in simplicity and woven with grace—discover the philosophy behind Drapes of Cotton.",
};

export default function OurStoryPage() {
  return (
    <StorefrontShell>
      <Section spacing="spacious" surface="ivory">
        <Container>
          <div className="grid items-center gap-12 lg:grid-cols-12">
            <div className="space-y-6 lg:col-span-6">
              <p className="text-label-meta text-muted-olive">Our Philosophy</p>
              <h1 className="text-display-editorial text-deep-earth-olive">
                Rooted in Simplicity.
                <br />
                Woven with Grace.
              </h1>
              <p className="text-body-editorial text-muted-olive">
                Drapes of Cotton was shaped around a calm conviction: a cotton
                saree needs neither loud embellishment nor fleeting trends to feel
                unforgettable.
              </p>
              <p className="text-body-editorial text-muted-olive">
                We curate natural cotton silhouettes in warm ivory, soft sand, and
                earthy olive tones—pieces that breathe comfortably in warm
                climates, hold crisp pleats through long days, and soften with
                every wear.
              </p>
              <Button asChild size="lg">
                <Link href="/shop">Explore the Collection</Link>
              </Button>
            </div>

            <div className="lg:col-span-6">
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[var(--radius-xl)] bg-surface-cotton">
                <Image
                  src="/images/banners/story-cotton.jpg"
                  alt="Folded cotton sarees and dried cotton bolls on warm cream plaster"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </Container>
      </Section>

      <Section spacing="default" surface="cream" className="border-t border-border">
        <Container>
          <div className="grid gap-6 md:grid-cols-3">
            {CRAFT_PILLARS.map((pillar) => (
              <div
                key={pillar.title}
                className="rounded-[var(--radius-lg)] border border-border bg-surface p-6"
              >
                <p className="text-label-meta text-muted-olive">{pillar.eyebrow}</p>
                <h2 className="font-editorial mt-2 text-2xl font-medium text-deep-earth-olive">
                  {pillar.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-olive">
                  {pillar.description}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </Section>
    </StorefrontShell>
  );
}
