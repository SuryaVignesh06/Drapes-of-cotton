import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { resolveBrandLogoAsset } from "@/lib/utils/brand-assets";

export function StorefrontShell({ children }: { children: React.ReactNode }) {
  const logoSrc = resolveBrandLogoAsset();

  return (
    <div className="flex min-h-screen flex-col overflow-x-clip bg-background text-foreground">
      <SiteHeader logoSrc={logoSrc} isAuthenticated={false} isAdmin={false} />
      <main className="flex-1">{children}</main>
      <SiteFooter logoSrc={logoSrc} />
    </div>
  );
}
