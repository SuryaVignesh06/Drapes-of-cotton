import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { StorefrontShell } from "@/components/layout/storefront-shell";
import { CollectionCard } from "@/features/collections/collection-card";
import { listPublishedCollections } from "@/lib/services/collection.service";

export const metadata: Metadata = {
  title: "Collections",
  description:
    "Browse curated cotton saree collections—Everyday Cotton, Classic Cotton, Handloom, Office Wear, Festive Edit, and Minimal Neutrals.",
};

export default async function CollectionsPage() {
  const { collections } = await listPublishedCollections();

  return (
    <StorefrontShell>
      <Section spacing="spacious" surface="ivory">
        <Container>
          <div className="max-w-2xl space-y-3">
            <p className="text-label-meta text-muted-olive">Curated Edits</p>
            <h1 className="text-display-editorial text-deep-earth-olive">
              Our Collections
            </h1>
            <p className="text-body-editorial text-muted-olive">
              Explore thoughtfully assembled cotton saree edits designed around
              daily comfort, crisp office silhouettes, and intimate gatherings.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-4 min-[380px]:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            {collections.map((collection) => (
              <CollectionCard key={collection.id} collection={collection} />
            ))}
          </div>
        </Container>
      </Section>
    </StorefrontShell>
  );
}
