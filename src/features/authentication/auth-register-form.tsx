"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const registerSchema = z.object({
  fullName: z.string().trim().min(2, "Full name is required."),
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export function AuthRegisterForm({ supabaseReady }: { supabaseReady: boolean }) {
  const router = useRouter();
  const [confirmationSent, setConfirmationSent] = useState(false);

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: "", email: "", password: "" },
  });

  async function onSubmit(values: z.infer<typeof registerSchema>) {
    if (!supabaseReady) {
      toast.error("Supabase credentials are not configured in .env.local.");
      return;
    }

    try {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: { full_name: values.fullName },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      if (data.session) {
        toast.success("Account created. Welcome to Drapes of Cotton.");
        router.push("/account");
        router.refresh();
        return;
      }

      setConfirmationSent(true);
      toast.success("Please check your email to confirm your account.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Registration failed.");
    }
  }

  return (
    <div className="space-y-5">
      {!supabaseReady && (
        <div className="rounded-[var(--radius-md)] border border-border bg-surface-cotton px-4 py-3 text-xs text-deep-earth-olive">
          Supabase Auth is awaiting configuration in <code>.env.local</code>.
        </div>
      )}

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="reg-name">Full Name</Label>
          <Input
            id="reg-name"
            placeholder="Ananya Sharma"
            {...form.register("fullName")}
          />
          {form.formState.errors.fullName && (
            <p className="text-xs text-destructive">
              {form.formState.errors.fullName.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="reg-email">Email</Label>
          <Input
            id="reg-email"
            type="email"
            placeholder="you@example.com"
            {...form.register("email")}
          />
          {form.formState.errors.email && (
            <p className="text-xs text-destructive">
              {form.formState.errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="reg-password">Password</Label>
          <Input
            id="reg-password"
            type="password"
            placeholder="Minimum 8 characters"
            {...form.register("password")}
          />
          {form.formState.errors.password && (
            <p className="text-xs text-destructive">
              {form.formState.errors.password.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? "Creating Account..." : "Create Account"}
        </Button>
      </form>

      {confirmationSent && (
        <p className="rounded-[var(--radius-md)] border border-border bg-surface-cotton p-3 text-xs text-deep-earth-olive">
          We sent a verification link to your email address. Confirm your email to
          sign in.
        </p>
      )}

      <p className="text-center text-xs text-muted-olive">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
