import { WishlistView } from "@/features/wishlist/wishlist-view";
import { listPublishedProducts } from "@/lib/services/product.service";

export default async function AccountWishlistPage() {
  const { products } = await listPublishedProducts();
  return (
    <div className="space-y-6">
      <div>
        <p className="text-label-meta text-muted-olive">Saved Pieces</p>
        <h1 className="text-section-heading mt-1 text-deep-earth-olive">
          Your Wishlist
        </h1>
      </div>
      <WishlistView allProducts={products} />
    </div>
  );
}
