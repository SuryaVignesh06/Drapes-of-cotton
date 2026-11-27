import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AdminOverviewPage() {
  return (
    <div className="rounded-[var(--radius-xl)] border border-border bg-surface-secondary p-8 space-y-4">
      <p className="text-label-meta text-muted-olive">Admin Studio</p>
      <h1 className="text-section-heading text-deep-earth-olive">
        Server Runtime Required
      </h1>
      <p className="text-sm leading-relaxed text-muted-olive">
        The Drapes of Cotton Admin Studio requires a Next.js server runtime with
        Supabase Auth and database credentials and is unavailable in the static
        GitHub Pages storefront deployment.
      </p>
      <Button asChild variant="outline">
        <Link href="/">Return to Storefront</Link>
      </Button>
    </div>
  );
}
