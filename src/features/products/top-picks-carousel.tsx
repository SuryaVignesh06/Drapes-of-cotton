"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { ProductCard } from "@/features/products/product-card";
import type { Product } from "@/types";

export function TopPicksRow({
  badge = "Best Sellers",
  heading = "/ Top Picks For You",
  products,
}: {
  badge?: string;
  heading?: string;
  products: Product[];
}) {
  const [offset, setOffset] = useState(0);
  const pageSize = 5;
  const maxOffset = Math.max(0, products.length - pageSize);
  const visible = products.slice(offset, offset + pageSize);

  return (
    <section className="py-10 sm:py-12">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div className="space-y-2">
          <span className="inline-flex rounded-full bg-secondary px-3 py-1 text-[11px] font-medium text-foreground">
            {badge}
          </span>
          <h2 className="text-section-heading text-foreground">{heading}</h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setOffset((o) => Math.max(0, o - 1))}
            disabled={offset === 0}
            aria-label="Previous sarees"
            className="flex size-8 items-center justify-center rounded-full border border-border bg-surface text-foreground transition-colors hover:bg-surface-cotton disabled:opacity-35"
          >
            <ArrowLeft className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setOffset((o) => Math.min(maxOffset, o + 1))}
            disabled={offset >= maxOffset}
            aria-label="Next sarees"
            className="flex size-8 items-center justify-center rounded-full border border-border bg-surface text-foreground transition-colors hover:bg-surface-cotton disabled:opacity-35"
          >
            <ArrowRight className="size-3.5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 min-[380px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        {visible.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
