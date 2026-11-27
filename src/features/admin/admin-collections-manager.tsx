"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { slugify } from "@/lib/utils";
import type { Collection } from "@/types";

export function AdminCollectionsManager({
  collections,
}: {
  collections: Collection[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isPublished, setIsPublished] = useState(true);

  function openNew() {
    setEditingId(null);
    setName("");
    setSlug("");
    setDescription("");
    setCoverImage("");
    setSortOrder("0");
    setIsFeatured(false);
    setIsPublished(true);
    setOpen(true);
  }

  function openEdit(col: Collection) {
    setEditingId(col.id);
    setName(col.name);
    setSlug(col.slug);
    setDescription(col.description ?? "");
    setCoverImage(col.coverImage ?? "");
    setSortOrder(String(col.sortOrder));
    setIsFeatured(col.isFeatured);
    setIsPublished(col.isPublished);
    setOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/collections", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingId ?? undefined,
          name,
          slug: slug || slugify(name),
          description,
          coverImage,
          sortOrder: Number(sortOrder),
          isFeatured,
          isPublished,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        toast.error(data.error ?? "Failed to save collection.");
        return;
      }
      toast.success(editingId ? "Collection updated." : "Collection created.");
      setOpen(false);
      router.refresh();
    } catch {
      toast.error("Error saving collection.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/admin/collections?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    if (res.ok) {
      toast.success("Collection removed.");
      router.refresh();
    } else {
      toast.error("Unable to delete collection.");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-label-meta text-muted-olive">Merchandising</p>
          <h1 className="text-section-heading mt-1 text-deep-earth-olive">
            Collections ({collections.length})
          </h1>
        </div>
        <Button onClick={openNew}>
          <Plus className="size-4" />
          New Collection
        </Button>
      </div>

      <div className="overflow-hidden rounded-[var(--radius-xl)] border border-border bg-surface-secondary">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {collections.map((col) => (
              <TableRow key={col.id}>
                <TableCell className="font-medium text-deep-earth-olive">
                  {col.name}
                </TableCell>
                <TableCell className="text-xs text-muted-olive">
                  {col.slug}
                </TableCell>
                <TableCell>{col.sortOrder}</TableCell>
                <TableCell>
                  <Badge variant={col.isPublished ? "default" : "outline"}>
                    {col.isPublished ? "Published" : "Hidden"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right space-x-1">
                  <Button
                    size="xs"
                    variant="ghost"
                    onClick={() => openEdit(col)}
                    aria-label={`Edit ${col.name}`}
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button
                    size="xs"
                    variant="ghost"
                    onClick={() => handleDelete(col.id)}
                    aria-label={`Delete ${col.name}`}
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
        <DialogContent className="max-w-lg bg-surface">
          <DialogHeader>
            <DialogTitle className="font-editorial text-2xl text-deep-earth-olive">
              {editingId ? "Edit Collection" : "New Collection"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 text-sm">
            <div className="space-y-1">
              <Label>Collection Name</Label>
              <Input
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!editingId) setSlug(slugify(e.target.value));
                }}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label>Slug</Label>
                <Input
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label>Sort Order</Label>
                <Input
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Cover Image URL</Label>
              <Input
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="/images/collections/..."
              />
            </div>
            <div className="space-y-1">
              <Label>Description</Label>
              <Textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 text-xs">
                <Switch checked={isFeatured} onCheckedChange={setIsFeatured} />
                <span>Featured</span>
              </label>
              <label className="flex items-center gap-2 text-xs">
                <Switch checked={isPublished} onCheckedChange={setIsPublished} />
                <span>Published</span>
              </label>
            </div>
            <Button type="submit" className="w-full" disabled={saving}>
              {saving ? "Saving..." : "Save Collection"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
