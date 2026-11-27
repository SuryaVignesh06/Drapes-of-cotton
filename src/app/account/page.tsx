import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BRAND } from "@/lib/constants";

export default function AccountOverviewPage() {
  return (
    <div className="rounded-[var(--radius-xl)] border border-border bg-surface-secondary p-8 space-y-4">
      <p className="text-label-meta text-muted-olive">Customer Account</p>
      <h1 className="text-section-heading text-deep-earth-olive">
        Order Support &amp; Saved Items
      </h1>
      <p className="text-sm leading-relaxed text-muted-olive">
        On this storefront, your wishlist and shopping bag are saved locally in
        your browser, and orders are placed directly with our studio team via
        WhatsApp (+91 {BRAND.whatsappDisplayNumber}).
      </p>
      <div className="flex flex-wrap gap-3 pt-2">
        <Button asChild>
          <Link href="/shop">Browse Cotton Sarees</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/wishlist">View Wishlist</Link>
        </Button>
      </div>
    </div>
  );
}
