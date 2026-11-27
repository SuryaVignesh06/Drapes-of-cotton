import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BRAND } from "@/lib/constants";

export default function AccountOrdersPage() {
  return (
    <div className="rounded-[var(--radius-xl)] border border-border bg-surface-secondary p-8 space-y-4">
      <p className="text-label-meta text-muted-olive">Order Tracking</p>
      <h1 className="text-section-heading text-deep-earth-olive">
        Track Your Order
      </h1>
      <p className="text-sm leading-relaxed text-muted-olive">
        For dispatch updates or tracking details on any order placed with Drapes
        of Cotton, message our studio directly on WhatsApp at +91{" "}
        {BRAND.whatsappDisplayNumber} or email{" "}
        <a
          href="mailto:care@drapesofcotton.com"
          className="text-primary underline"
        >
          care@drapesofcotton.com
        </a>
        .
      </p>
      <div className="flex flex-wrap gap-3 pt-2">
        <Button asChild>
          <Link href="/shop">Continue Shopping</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/contact">Contact Studio</Link>
        </Button>
      </div>
    </div>
  );
}
