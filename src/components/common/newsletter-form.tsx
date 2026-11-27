"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";
import { Input } from "@/components/ui/input";
import { newsletterSchema } from "@/lib/validations/store";

type NewsletterFormValues = z.infer<typeof newsletterSchema>;

/**
 * Joined rectangular email input + solid dark square arrow button matching the reference footer.
 */
export function NewsletterForm() {
  const [subscribed, setSubscribed] = useState(false);

  const form = useForm<NewsletterFormValues>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: NewsletterFormValues) {
    setSubscribed(false);
    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = (await response.json()) as {
        success?: boolean;
        message?: string;
        error?: string;
      };

      if (!response.ok || !data.success) {
        toast.error(data.error ?? "Unable to subscribe right now.");
        return;
      }

      setSubscribed(true);
      form.reset();
      toast.success(data.message ?? "Subscribed to Drapes of Cotton.");
    } catch {
      toast.error("Network error while subscribing. Please try again.");
    }
  }

  return (
    <div className="w-full max-w-sm">
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex items-stretch overflow-hidden rounded-[var(--radius-sm)] border border-input bg-surface"
        noValidate
      >
        <label htmlFor="newsletter-email" className="sr-only">
          Email address
        </label>
        <Input
          id="newsletter-email"
          type="email"
          placeholder="Your email address"
          aria-invalid={Boolean(form.formState.errors.email)}
          className="h-10 flex-1 rounded-none border-0 bg-transparent px-3.5 text-xs shadow-none focus-visible:ring-0"
          {...form.register("email")}
        />
        <button
          type="submit"
          disabled={form.formState.isSubmitting}
          aria-label="Subscribe to newsletter"
          className="flex w-10 shrink-0 items-center justify-center bg-primary text-primary-foreground transition-colors hover:bg-accent-olive disabled:opacity-50"
        >
          <ArrowRight className="size-4" />
        </button>
      </form>

      {form.formState.errors.email && (
        <p className="mt-1.5 text-xs text-destructive">
          {form.formState.errors.email.message}
        </p>
      )}

      {subscribed && (
        <p className="mt-2 text-xs font-medium text-foreground">
          Thank you — you are on the Drapes of Cotton list.
        </p>
      )}
    </div>
  );
}
