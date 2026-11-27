"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Product } from "@/types";

export function AdminInventoryManager({ products }: { products: Product[] }) {
  const router = useRouter();
  const [draftQty, setDraftQty] = useState<Record<string, string>>(
    Object.fromEntries(products.map((p) => [p.id, String(p.stockQuantity)]))
  );
  const [savingId, setSavingId] = useState<string | null>(null);

  async function handleSaveStock(productId: string) {
    setSavingId(productId);
    try {
      const res = await fetch("/api/admin/inventory", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          newQuantity: Number(draftQty[productId] ?? 0),
          reason: "manual_admin_adjustment",
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        toast.error(data.error ?? "Failed to update stock.");
        return;
      }
      toast.success("Inventory updated and movement recorded.");
      router.refresh();
    } catch {
      toast.error("Error adjusting inventory.");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-label-meta text-muted-olive">Stock Control</p>
        <h1 className="text-section-heading mt-1 text-deep-earth-olive">
          Inventory
        </h1>
      </div>

      <div className="overflow-hidden rounded-[var(--radius-xl)] border border-border bg-surface-secondary">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Saree</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium text-deep-earth-olive">
                  {product.name}
                </TableCell>
                <TableCell className="text-xs text-muted-olive">
                  {product.sku}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      product.stockQuantity === 0
                        ? "destructive"
                        : product.stockQuantity <= 5
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {product.stockQuantity === 0
                      ? "Out of Stock"
                      : product.stockQuantity <= 5
                        ? "Low Stock"
                        : "Healthy"}
                  </Badge>
                </TableCell>
                <TableCell className="w-32">
                  <Input
                    type="number"
                    min={0}
                    value={draftQty[product.id] ?? String(product.stockQuantity)}
                    onChange={(e) =>
                      setDraftQty((prev) => ({
                        ...prev,
                        [product.id]: e.target.value,
                      }))
                    }
                    className="h-8 bg-surface text-xs"
                  />
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="xs"
                    disabled={savingId === product.id}
                    onClick={() => handleSaveStock(product.id)}
                  >
                    {savingId === product.id ? "Saving..." : "Update"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
