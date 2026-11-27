"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Pill } from "@/components/ui/pill";
import { DEMO_PRODUCTS } from "@/data/catalog";
import { filterAndSortProducts } from "@/lib/services/catalog-helpers";
import { formatInrFromPaise } from "@/lib/utils";

interface SearchHit {
  id: string;
  name: string;
  slug: string;
  price: number;
  fabric: string;
  color: string;
  imageUrl: string;
  imageAlt: string;
}

const SUGGESTED_KEYWORDS = ["Ivory", "Olive", "Everyday", "Office Wear", "Mul Cotton", "Festive"];

export function SearchDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const visibleResults = useMemo<SearchHit[]>(() => {
    const trimmed = query.trim();
    if (!open || trimmed.length === 0) {
      return [];
    }
    const { items } = filterAndSortProducts(DEMO_PRODUCTS, {
      search: trimmed,
      pageSize: 6,
    });
    return items.map((item) => ({
      id: item.id,
      name: item.name,
      slug: item.slug,
      price: item.price,
      fabric: item.fabric,
      color: item.color,
      imageUrl: item.images[0]?.imageUrl ?? "/images/products/kora-ivory-olive-main.jpg",
      imageAlt: item.images[0]?.altText ?? item.name,
    }));
  }, [query, open]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    onOpenChange(false);
    router.push(trimmed ? `/shop?search=${encodeURIComponent(trimmed)}` : "/shop");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl rounded-[var(--radius-xl)] border-border bg-surface p-0 overflow-hidden">
        <DialogHeader className="border-b border-border px-6 pt-6 pb-4">
          <DialogTitle className="font-editorial text-2xl font-medium text-deep-earth-olive">
            Search Cotton Sarees
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-olive">
            Search by saree name, collection, fabric, color, or occasion.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="px-6 pt-4">
          <div className="relative flex items-center">
            <Search className="pointer-events-none absolute left-3.5 size-4 text-muted-olive" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Try 'Kora Ivory', 'Office Wear', 'Mul Cotton'..."
              aria-label="Search cotton sarees"
              autoFocus
              className="h-11 rounded-[var(--radius-md)] border-input bg-surface-secondary pl-10 pr-10 text-sm"
            />
            {query.length > 0 && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search query"
                className="absolute right-3 rounded-full p-1 text-muted-olive hover:bg-surface-cotton"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
        </form>

        <div className="max-h-[380px] overflow-y-auto px-6 py-5">
          {query.trim().length === 0 ? (
            <div className="space-y-3">
              <p className="text-label-meta text-muted-olive">Popular Searches</p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_KEYWORDS.map((keyword) => (
                  <button
                    key={keyword}
                    type="button"
                    onClick={() => setQuery(keyword)}
                    className="cursor-pointer"
                  >
                    <Pill size="sm" className="hover:border-primary">
                      {keyword}
                    </Pill>
                  </button>
                ))}
              </div>
            </div>
          ) : visibleResults.length === 0 ? (
            <div className="rounded-[var(--radius-lg)] border border-border bg-surface-secondary px-6 py-8 text-center">
              <p className="font-editorial text-xl text-deep-earth-olive">
                No sarees matched &ldquo;{query.trim()}&rdquo;
              </p>
              <p className="mt-1 text-xs text-muted-olive">
                Try searching by color (Ivory, Green, Indigo), collection, or browse our full collection.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => {
                  onOpenChange(false);
                  router.push("/shop");
                }}
              >
                Browse All Sarees
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                {visibleResults.map((hit) => (
                  <Link
                    key={hit.id}
                    href={`/product/${hit.slug}`}
                    onClick={() => onOpenChange(false)}
                    className="group flex items-center gap-3 rounded-[var(--radius-md)] border border-border bg-surface-secondary p-2.5 transition-colors hover:bg-surface-cotton"
                  >
                    <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-[var(--radius-sm)] bg-surface-cotton">
                      <Image
                        src={hit.imageUrl}
                        alt={hit.imageAlt}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-deep-earth-olive group-hover:underline">
                        {hit.name}
                      </p>
                      <p className="text-xs text-muted-olive">
                        {hit.fabric} · {hit.color}
                      </p>
                      <p className="mt-0.5 text-xs font-medium text-deep-earth-olive">
                        {formatInrFromPaise(hit.price)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="pt-2 text-right">
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => {
                    onOpenChange(false);
                    router.push(`/shop?search=${encodeURIComponent(query.trim())}`);
                  }}
                >
                  View all matching results
                  <ArrowRight className="size-3.5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
