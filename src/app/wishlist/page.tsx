import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { StorefrontShell } from "@/components/layout/storefront-shell";
import { WishlistView } from "@/features/wishlist/wishlist-view";
import { listPublishedProducts } from "@/lib/services/product.service";

export const metadata: Metadata = {
  title: "Wishlist",
  description: "Your saved Drapes of Cotton sarees.",
};

export default async function WishlistPage() {
  const { products } = await listPublishedProducts();

  return (
    <StorefrontShell>
      <Section spacing="default" surface="ivory">
        <Container className="space-y-8">
          <div>
            <p className="text-label-meta text-muted-olive">Saved Pieces</p>
            <h1 className="text-display-editorial mt-2 text-deep-earth-olive">
              Your Wishlist
            </h1>
          </div>
          <WishlistView allProducts={products} />
        </Container>
      </Section>
    </StorefrontShell>
  );
}
