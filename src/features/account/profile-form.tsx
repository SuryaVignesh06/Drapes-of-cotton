"use client";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { profileSchema } from "@/lib/validations/store";
import type { CustomerProfile } from "@/types";

export function ProfileForm({ profile }: { profile: CustomerProfile }) {
  const router = useRouter();

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: profile.fullName,
      phone: profile.phone,
    },
  });

  async function onSubmit(values: z.infer<typeof profileSchema>) {
    try {
      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        toast.error(data.error ?? "Failed to update profile.");
        return;
      }
      toast.success("Profile updated.");
      router.refresh();
    } catch {
      toast.error("Unable to update profile.");
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-lg space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="prof-email">Email</Label>
        <Input id="prof-email" value={profile.email} disabled />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="prof-name">Full Name</Label>
        <Input id="prof-name" {...form.register("fullName")} />
        {form.formState.errors.fullName && (
          <p className="text-xs text-destructive">
            {form.formState.errors.fullName.message}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="prof-phone">Mobile Number (India)</Label>
        <Input
          id="prof-phone"
          placeholder="9876543210"
          {...form.register("phone")}
        />
        {form.formState.errors.phone && (
          <p className="text-xs text-destructive">
            {form.formState.errors.phone.message}
          </p>
        )}
      </div>

      <Button type="submit" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? "Saving..." : "Save Profile"}
      </Button>
    </form>
  );
}
