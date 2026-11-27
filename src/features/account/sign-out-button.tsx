"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabasePublicConfigured } from "@/lib/supabase/config";

export function SignOutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSignOut() {
    if (!isSupabasePublicConfigured()) return;
    setLoading(true);
    try {
      const supabase = getSupabaseBrowserClient();
      await supabase.auth.signOut();
      toast.success("Signed out.");
      router.push("/");
      router.refresh();
    } catch {
      toast.error("Unable to sign out.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleSignOut}
      disabled={loading}
      className="w-full justify-start gap-2"
    >
      <LogOut className="size-4" />
      {loading ? "Signing Out..." : "Sign Out"}
    </Button>
  );
}
