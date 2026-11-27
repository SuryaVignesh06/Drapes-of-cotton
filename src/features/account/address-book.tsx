"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { INDIAN_STATES } from "@/lib/constants/store";
import { addressSchema } from "@/lib/validations/store";
import type { CustomerAddress } from "@/types";

type AddressFormInput = z.input<typeof addressSchema>;
type AddressFormOutput = z.output<typeof addressSchema>;

export function AddressBook({ addresses }: { addresses: CustomerAddress[] }) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const form = useForm<AddressFormInput, unknown, AddressFormOutput>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      addressLine1: "",
      addressLine2: "",
      area: "",
      city: "",
      state: "Karnataka",
      postalCode: "",
      country: "India",
      addressType: "home",
      isDefault: false,
    },
  });

  const watchedState = useWatch({ control: form.control, name: "state" });
  const watchedIsDefault = useWatch({ control: form.control, name: "isDefault" });
  const watchedAddressType = useWatch({ control: form.control, name: "addressType" });

  function openNew() {
    setEditingId(null);
    form.reset({
      fullName: "",
      phone: "",
      addressLine1: "",
      addressLine2: "",
      area: "",
      city: "",
      state: "Karnataka",
      postalCode: "",
      country: "India",
      addressType: "home",
      isDefault: addresses.length === 0,
    });
    setDialogOpen(true);
  }

  function openEdit(address: CustomerAddress) {
    setEditingId(address.id);
    form.reset({
      fullName: address.fullName,
      phone: address.phone,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 ?? "",
      area: address.area,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
      addressType: address.addressType,
      isDefault: address.isDefault,
    });
    setDialogOpen(true);
  }

  async function onSubmit(values: AddressFormOutput) {
    try {
      const res = await fetch("/api/account/addresses", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingId ? { id: editingId, ...values } : values),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        toast.error(data.error ?? "Unable to save address.");
        return;
      }

      toast.success(editingId ? "Address updated." : "Address saved.");
      setDialogOpen(false);
      router.refresh();
    } catch {
      toast.error("Network error saving address.");
    }
  }

  async function handleSetDefault(id: string) {
    const res = await fetch("/api/account/addresses", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, setDefault: true }),
    });
    if (res.ok) {
      toast.success("Default address updated.");
      router.refresh();
    } else {
      toast.error("Unable to update default address.");
    }
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/account/addresses?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    if (res.ok) {
      toast.success("Address deleted.");
      router.refresh();
    } else {
      toast.error("Unable to delete address.");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-section-heading text-deep-earth-olive">
            Saved Addresses
          </h1>
          <p className="mt-1 text-xs text-muted-olive">
            Manage delivery addresses for faster Indian checkout.
          </p>
        </div>
        <Button size="sm" onClick={openNew}>
          <Plus className="size-4" />
          Add Address
        </Button>
      </div>

      {addresses.length === 0 ? (
        <div className="rounded-[var(--radius-xl)] border border-border bg-surface-secondary px-6 py-12 text-center">
          <MapPin className="mx-auto size-6 text-primary" />
          <p className="font-editorial mt-3 text-2xl text-deep-earth-olive">
            No saved addresses yet
          </p>
          <p className="mt-1 text-xs text-muted-olive">
            Add your home or studio address for quicker checkout.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className="flex flex-col justify-between rounded-[var(--radius-lg)] border border-border bg-surface-secondary p-5"
            >
              <div className="space-y-1.5 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-deep-earth-olive">
                    {addr.fullName}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Badge variant="outline" className="uppercase text-[10px]">
                      {addr.addressType}
                    </Badge>
                    {addr.isDefault && <Badge>Default</Badge>}
                  </div>
                </div>
                <p className="text-xs text-muted-olive">{addr.phone}</p>
                <p className="pt-1 text-xs leading-relaxed text-deep-earth-olive">
                  {addr.addressLine1}
                  {addr.addressLine2 ? `, ${addr.addressLine2}` : ""}
                  <br />
                  {addr.area}, {addr.city}
                  <br />
                  {addr.state} — {addr.postalCode}, {addr.country}
                </p>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-3">
                {!addr.isDefault && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="xs"
                    onClick={() => handleSetDefault(addr.id)}
                  >
                    <Check className="size-3.5" />
                    Set Default
                  </Button>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  onClick={() => openEdit(addr)}
                >
                  <Pencil className="size-3.5" />
                  Edit
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  onClick={() => handleDelete(addr.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="size-3.5" />
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg rounded-[var(--radius-xl)] border-border bg-surface">
          <DialogHeader>
            <DialogTitle className="font-editorial text-2xl font-medium text-deep-earth-olive">
              {editingId ? "Edit Address" : "Add Delivery Address"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3.5">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="addr-name">Full Name</Label>
                <Input id="addr-name" {...form.register("fullName")} />
                {form.formState.errors.fullName && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.fullName.message}
                  </p>
                )}
              </div>
              <div className="space-y-1">
                <Label htmlFor="addr-phone">Mobile Number</Label>
                <Input
                  id="addr-phone"
                  placeholder="9876543210"
                  {...form.register("phone")}
                />
                {form.formState.errors.phone && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.phone.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="addr-line1">House / Building / Street</Label>
              <Input id="addr-line1" {...form.register("addressLine1")} />
              {form.formState.errors.addressLine1 && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.addressLine1.message}
                </p>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="addr-line2">Apartment / Landmark (Optional)</Label>
                <Input id="addr-line2" {...form.register("addressLine2")} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="addr-area">Area / Locality</Label>
                <Input id="addr-area" {...form.register("area")} />
                {form.formState.errors.area && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.area.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-1">
                <Label htmlFor="addr-city">City</Label>
                <Input id="addr-city" {...form.register("city")} />
                {form.formState.errors.city && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.city.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <Label>State</Label>
                <Select
                  value={watchedState}
                  onValueChange={(v) => form.setValue("state", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {INDIAN_STATES.map((st) => (
                      <SelectItem key={st} value={st}>
                        {st}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="addr-pin">PIN Code</Label>
                <Input
                  id="addr-pin"
                  maxLength={6}
                  placeholder="560001"
                  {...form.register("postalCode")}
                />
                {form.formState.errors.postalCode && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.postalCode.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex cursor-pointer items-center gap-2 text-xs text-deep-earth-olive">
                <Checkbox
                  checked={Boolean(watchedIsDefault)}
                  onCheckedChange={(v) => form.setValue("isDefault", Boolean(v))}
                />
                <span>Set as default address</span>
              </label>

              <Select
                value={watchedAddressType ?? "home"}
                onValueChange={(v) =>
                  form.setValue("addressType", v as "home" | "work" | "other")
                }
              >
                <SelectTrigger className="w-28 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="home">Home</SelectItem>
                  <SelectItem value="work">Work</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? "Saving..." : "Save Address"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
