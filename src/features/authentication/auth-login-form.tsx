"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const passwordLoginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

const otpLoginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
});

export function AuthLoginForm({ supabaseReady }: { supabaseReady: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get("next") ?? "/account";
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  const passwordForm = useForm<z.infer<typeof passwordLoginSchema>>({
    resolver: zodResolver(passwordLoginSchema),
    defaultValues: { email: "", password: "" },
  });

  const otpForm = useForm<z.infer<typeof otpLoginSchema>>({
    resolver: zodResolver(otpLoginSchema),
    defaultValues: { email: "" },
  });

  async function onPasswordSubmit(values: z.infer<typeof passwordLoginSchema>) {
    if (!supabaseReady) {
      toast.error("Supabase credentials are not configured in .env.local.");
      return;
    }

    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("Welcome back to Drapes of Cotton.");
      router.push(nextUrl.startsWith("/") ? nextUrl : "/account");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to sign in.");
    }
  }

  async function onOtpSubmit(values: z.infer<typeof otpLoginSchema>) {
    if (!supabaseReady) {
      toast.error("Supabase credentials are not configured in .env.local.");
      return;
    }

    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithOtp({
        email: values.email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextUrl)}`,
        },
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      setMagicLinkSent(true);
      toast.success("Sign-in link sent to your email.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to send sign-in link.");
    }
  }

  return (
    <div className="space-y-6">
      {!supabaseReady && (
        <div className="rounded-[var(--radius-md)] border border-border bg-surface-cotton px-4 py-3 text-xs text-deep-earth-olive">
          Supabase Auth is awaiting configuration. Add{" "}
          <code>NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
          <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in <code>.env.local</code>{" "}
          to enable live customer sign-in.
        </div>
      )}

      <Tabs defaultValue="password" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-surface-cotton">
          <TabsTrigger value="password">Password</TabsTrigger>
          <TabsTrigger value="magic">Email Link / OTP</TabsTrigger>
        </TabsList>

        <TabsContent value="password" className="pt-4">
          <form
            onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
            className="space-y-4"
            noValidate
          >
            <div className="space-y-1.5">
              <Label htmlFor="login-email">Email</Label>
              <Input
                id="login-email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                {...passwordForm.register("email")}
              />
              {passwordForm.formState.errors.email && (
                <p className="text-xs text-destructive">
                  {passwordForm.formState.errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="login-password">Password</Label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="login-password"
                type="password"
                autoComplete="current-password"
                {...passwordForm.register("password")}
              />
              {passwordForm.formState.errors.password && (
                <p className="text-xs text-destructive">
                  {passwordForm.formState.errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={passwordForm.formState.isSubmitting}
            >
              {passwordForm.formState.isSubmitting ? "Signing In..." : "Sign In"}
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="magic" className="pt-4">
          <form
            onSubmit={otpForm.handleSubmit(onOtpSubmit)}
            className="space-y-4"
            noValidate
          >
            <div className="space-y-1.5">
              <Label htmlFor="otp-email">Email</Label>
              <Input
                id="otp-email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                {...otpForm.register("email")}
              />
              {otpForm.formState.errors.email && (
                <p className="text-xs text-destructive">
                  {otpForm.formState.errors.email.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={otpForm.formState.isSubmitting}
            >
              {otpForm.formState.isSubmitting
                ? "Sending Link..."
                : "Send Magic Sign-In Link"}
            </Button>

            {magicLinkSent && (
              <p className="text-xs text-primary">
                Check your inbox for a secure sign-in link from Drapes of Cotton.
              </p>
            )}
          </form>
        </TabsContent>
      </Tabs>

      <p className="text-center text-xs text-muted-olive">
        New to Drapes of Cotton?{" "}
        <Link href="/register" className="font-medium text-primary hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
