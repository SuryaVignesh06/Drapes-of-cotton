import { Suspense } from "react";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { getAuthenticatedProfile } from "@/lib/supabase/auth-guards";
import { resolveBrandLogoAsset } from "@/lib/utils/brand-assets";

async function AuthAwareHeader({ logoSrc }: { logoSrc: string | null }) {
  const profile = await getAuthenticatedProfile();
  return (
    <SiteHeader
      logoSrc={logoSrc}
      isAuthenticated={Boolean(profile)}
      isAdmin={profile?.role === "admin"}
    />
  );
}

export function StorefrontShell({ children }: { children: React.ReactNode }) {
  const logoSrc = resolveBrandLogoAsset();

  return (
    <div className="flex min-h-screen flex-col overflow-x-clip bg-background text-foreground">
      <Suspense
        fallback={
          <div className="h-16 border-b border-border bg-background" />
        }
      >
        <AuthAwareHeader logoSrc={logoSrc} />
      </Suspense>
      <main className="flex-1">{children}</main>
      <SiteFooter logoSrc={logoSrc} />
    </div>
  );
}
