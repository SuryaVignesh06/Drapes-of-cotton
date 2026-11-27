"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { formatInrFromPaise, paiseToRupees, slugify } from "@/lib/utils";
import type { Collection, Product, ProductImageType } from "@/types";

interface EditableImage {
  imageUrl: string;
  altText: string;
  imageType: ProductImageType;
}

export function AdminProductsManager({
  products,
  collections,
}: {
  products: Product[];
  collections: Collection[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [sku, setSku] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [priceRupees, setPriceRupees] = useState("2450");
  const [compareAtPriceRupees, setCompareAtPriceRupees] = useState("");
  const [fabric, setFabric] = useState("Cotton");
  const [weave, setWeave] = useState("");
  const [color, setColor] = useState("Ivory");
  const [occasion, setOccasion] = useState("Everyday");
  const [sareeLength, setSareeLength] = useState("5.5 meters");
  const [blousePieceLength, setBlousePieceLength] = useState("0.8 meters");
  const [blousePieceIncluded, setBlousePieceIncluded] = useState(true);
  const [careInstructions, setCareInstructions] = useState("");
  const [origin, setOrigin] = useState("");
  const [stockQuantity, setStockQuantity] = useState("10");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isNew, setIsNew] = useState(true);
  const [isPublished, setIsPublished] = useState(true);
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [selectedCollectionIds, setSelectedCollectionIds] = useState<string[]>([]);
  const [images, setImages] = useState<EditableImage[]>([]);

  function openNew() {
    setEditingId(null);
    setName("");
    setSlug("");
    setSku("");
    setShortDescription("");
    setDescription("");
    setPriceRupees("2450");
    setCompareAtPriceRupees("");
    setFabric("Cotton");
    setWeave("");
    setColor("Ivory");
    setOccasion("Everyday");
    setSareeLength("5.5 meters");
    setBlousePieceLength("0.8 meters");
    setBlousePieceIncluded(true);
    setCareInstructions("");
    setOrigin("");
    setStockQuantity("10");
    setIsFeatured(false);
    setIsNew(true);
    setIsPublished(true);
    setSeoTitle("");
    setSeoDescription("");
    setSelectedCollectionIds([]);
    setImages([]);
    setOpen(true);
  }

  function openEdit(product: Product) {
    setEditingId(product.id);
    setName(product.name);
    setSlug(product.slug);
    setSku(product.sku);
    setShortDescription(product.shortDescription);
    setDescription(product.description);
    setPriceRupees(String(paiseToRupees(product.price)));
    setCompareAtPriceRupees(
      product.compareAtPrice ? String(paiseToRupees(product.compareAtPrice)) : ""
    );
    setFabric(product.fabric);
    setWeave(product.weave ?? "");
    setColor(product.color);
    setOccasion(product.occasion);
    setSareeLength(product.sareeLength ?? "");
    setBlousePieceLength(product.blousePieceLength ?? "");
    setBlousePieceIncluded(product.blousePieceIncluded);
    setCareInstructions(product.careInstructions ?? "");
    setOrigin(product.origin ?? "");
    setStockQuantity(String(product.stockQuantity));
    setIsFeatured(product.isFeatured);
    setIsNew(product.isNew);
    setIsPublished(product.isPublished);
    setSeoTitle(product.seoTitle ?? "");
    setSeoDescription(product.seoDescription ?? "");
    setSelectedCollectionIds(product.collections.map((c) => c.id));
    setImages(
      product.images.map((i) => ({
        imageUrl: i.imageUrl,
        altText: i.altText,
        imageType: i.imageType,
      }))
    );
    setOpen(true);
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("bucket", "products");
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        toast.error(data.error ?? "Upload failed.");
        return;
      }
      setImages((prev) => [
        ...prev,
        {
          imageUrl: data.url!,
          altText: name || "Cotton saree photograph",
          imageType: prev.length === 0 ? "main" : "detail",
        },
      ]);
      toast.success("Image uploaded to Supabase Storage.");
    } catch {
      toast.error("Error uploading image.");
    } finally {
      setUploading(false);
    }
  }

  function moveImage(idx: number, dir: -1 | 1) {
    const target = idx + dir;
    if (target < 0 || target >= images.length) return;
    const copy = [...images];
    [copy[idx], copy[target]] = [copy[target], copy[idx]];
    setImages(copy);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/products", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingId ?? undefined,
          name,
          slug: slug || slugify(name),
          sku,
          shortDescription,
          description,
          priceRupees: Number(priceRupees),
          compareAtPriceRupees: compareAtPriceRupees
            ? Number(compareAtPriceRupees)
            : null,
          fabric,
          weave,
          color,
          occasion,
          sareeLength,
          blousePieceLength,
          blousePieceIncluded,
          careInstructions,
          origin,
          stockQuantity: Number(stockQuantity),
          isFeatured,
          isNew,
          isPublished,
          seoTitle,
          seoDescription,
          collectionIds: selectedCollectionIds,
          images: images.map((img, i) => ({ ...img, sortOrder: i })),
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        toast.error(data.error ?? "Validation failed.");
        return;
      }
      toast.success(editingId ? "Product updated." : "Product created.");
      setOpen(false);
      router.refresh();
    } catch {
      toast.error("Error saving product.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/admin/products?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    if (res.ok) {
      toast.success("Product deleted.");
      router.refresh();
    } else {
      toast.error("Failed to delete product.");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-label-meta text-muted-olive">Catalog Management</p>
          <h1 className="text-section-heading mt-1 text-deep-earth-olive">
            Products ({products.length})
          </h1>
        </div>
        <Button onClick={openNew}>
          <Plus className="size-4" />
          Add Saree
        </Button>
      </div>

      <div className="overflow-hidden rounded-[var(--radius-xl)] border border-border bg-surface-secondary">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
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
                <TableCell>{formatInrFromPaise(product.price)}</TableCell>
                <TableCell>{product.stockQuantity}</TableCell>
                <TableCell>
                  <Badge variant={product.isPublished ? "default" : "outline"}>
                    {product.isPublished ? "Published" : "Draft"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right space-x-1">
                  <Button
                    size="xs"
                    variant="ghost"
                    onClick={() => openEdit(product)}
                    aria-label={`Edit ${product.name}`}
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button
                    size="xs"
                    variant="ghost"
                    onClick={() => handleDelete(product.id)}
                    aria-label={`Delete ${product.name}`}
                    className="text-destructive"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto bg-surface">
          <DialogHeader>
            <DialogTitle className="font-editorial text-2xl text-deep-earth-olive">
              {editingId ? "Edit Cotton Saree" : "New Cotton Saree"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4 text-sm">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label>Name</Label>
                <Input
                  required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!editingId) setSlug(slugify(e.target.value));
                  }}
                />
              </div>
              <div className="space-y-1">
                <Label>Slug</Label>
                <Input
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-1">
                <Label>SKU</Label>
                <Input
                  required
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label>Price (₹ INR)</Label>
                <Input
                  type="number"
                  required
                  min={100}
                  value={priceRupees}
                  onChange={(e) => setPriceRupees(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label>Compare-at Price (₹)</Label>
                <Input
                  type="number"
                  min={0}
                  value={compareAtPriceRupees}
                  onChange={(e) => setCompareAtPriceRupees(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label>Short Description</Label>
              <Input
                required
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <Label>Full Description</Label>
              <Textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-4">
              <div className="space-y-1">
                <Label>Fabric</Label>
                <Input value={fabric} onChange={(e) => setFabric(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>Weave</Label>
                <Input value={weave} onChange={(e) => setWeave(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>Color</Label>
                <Input value={color} onChange={(e) => setColor(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>Occasion</Label>
                <Input
                  value={occasion}
                  onChange={(e) => setOccasion(e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-4">
              <div className="space-y-1">
                <Label>Saree Length</Label>
                <Input
                  value={sareeLength}
                  onChange={(e) => setSareeLength(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label>Blouse Length</Label>
                <Input
                  value={blousePieceLength}
                  onChange={(e) => setBlousePieceLength(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label>Origin (optional)</Label>
                <Input value={origin} onChange={(e) => setOrigin(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>Stock Quantity</Label>
                <Input
                  type="number"
                  min={0}
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label>Care Instructions</Label>
              <Input
                value={careInstructions}
                onChange={(e) => setCareInstructions(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Collections</Label>
              <div className="flex flex-wrap gap-3">
                {collections.map((col) => {
                  const checked = selectedCollectionIds.includes(col.id);
                  return (
                    <label
                      key={col.id}
                      className="flex cursor-pointer items-center gap-2 text-xs"
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(v) => {
                          if (v)
                            setSelectedCollectionIds((p) => [...p, col.id]);
                          else
                            setSelectedCollectionIds((p) =>
                              p.filter((id) => id !== col.id)
                            );
                        }}
                      />
                      <span>{col.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Product Images Upload & Reordering */}
            <div className="space-y-2 rounded-[var(--radius-md)] border border-border bg-surface-secondary p-3">
              <div className="flex items-center justify-between">
                <Label>Product Images</Label>
                <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-[var(--radius-sm)] border border-border bg-surface px-3 py-1.5 text-xs font-medium hover:bg-surface-cotton">
                  <Upload className="size-3.5" />
                  {uploading ? "Uploading..." : "Upload Image"}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    className="sr-only"
                  />
                </label>
              </div>
              {images.map((img, idx) => (
                <div
                  key={`${img.imageUrl}-${idx}`}
                  className="flex items-center gap-2 rounded bg-surface p-2 text-xs"
                >
                  <Input
                    value={img.imageUrl}
                    onChange={(e) => {
                      const copy = [...images];
                      copy[idx].imageUrl = e.target.value;
                      setImages(copy);
                    }}
                    placeholder="Image URL"
                    className="h-8 text-xs"
                  />
                  <Button
                    type="button"
                    size="icon-xs"
                    variant="ghost"
                    onClick={() => moveImage(idx, -1)}
                    aria-label="Move image up"
                  >
                    <ArrowUp className="size-3" />
                  </Button>
                  <Button
                    type="button"
                    size="icon-xs"
                    variant="ghost"
                    onClick={() => moveImage(idx, 1)}
                    aria-label="Move image down"
                  >
                    <ArrowDown className="size-3" />
                  </Button>
                  <Button
                    type="button"
                    size="icon-xs"
                    variant="ghost"
                    onClick={() => setImages(images.filter((_, i) => i !== idx))}
                    aria-label="Remove image"
                  >
                    <Trash2 className="size-3 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label>SEO Title</Label>
                <Input
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label>SEO Description</Label>
                <Input
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-6 pt-1">
              <label className="flex items-center gap-2 text-xs">
                <Switch
                  checked={blousePieceIncluded}
                  onCheckedChange={setBlousePieceIncluded}
                />
                <span>Blouse Piece Included</span>
              </label>
              <label className="flex items-center gap-2 text-xs">
                <Switch checked={isFeatured} onCheckedChange={setIsFeatured} />
                <span>Featured</span>
              </label>
              <label className="flex items-center gap-2 text-xs">
                <Switch checked={isNew} onCheckedChange={setIsNew} />
                <span>New Arrival</span>
              </label>
              <label className="flex items-center gap-2 text-xs">
                <Switch checked={isPublished} onCheckedChange={setIsPublished} />
                <span>Published</span>
              </label>
            </div>

            <Button type="submit" className="w-full" disabled={saving}>
              {saving ? "Saving..." : editingId ? "Update Product" : "Create Product"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
