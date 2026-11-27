import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { BrandLogo } from "@/components/common/brand-logo";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SignOutButton } from "@/features/account/sign-out-button";
import { getAuthenticatedProfile } from "@/lib/supabase/auth-guards";
import { isSupabasePublicConfigured } from "@/lib/supabase/config";
import { resolveBrandLogoAsset } from "@/lib/utils/brand-assets";

export const metadata: Metadata = {
  title: "Admin Studio | Drapes of Cotton",
  robots: { index: false, follow: false },
};

const ADMIN_NAV = [
  { label: "Overview", href: "/admin" },
  { label: "Products", href: "/admin/products" },
  { label: "Collections", href: "/admin/collections" },
  { label: "Inventory", href: "/admin/inventory" },
  { label: "Orders", href: "/admin/orders" },
];

async function ProtectedAdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const logoSrc = resolveBrandLogoAsset();

  if (!isSupabasePublicConfigured()) {
    return (
      <div className="min-h-screen bg-background py-16">
        <Container size="narrow">
          <div className="rounded-[var(--radius-xl)] border border-border bg-surface-secondary p-8 space-y-4">
            <p className="text-label-meta text-muted-olive">Admin Studio</p>
            <h1 className="text-section-heading text-deep-earth-olive">
              Supabase Configuration Required
            </h1>
            <p className="text-sm leading-relaxed text-muted-olive">
              The admin dashboard enforces server-side role verification against
              Supabase Auth and <code>public.profiles</code>. Configure{" "}
              <code>NEXT_PUBLIC_SUPABASE_URL</code>,{" "}
              <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>, and{" "}
              <code>SUPABASE_SERVICE_ROLE_KEY</code> in <code>.env.local</code>,
              apply migrations, and promote your administrator profile before
              accessing <code>/admin</code>.
            </p>
            <Button asChild variant="outline">
              <Link href="/">Return to Storefront</Link>
            </Button>
          </div>
        </Container>
      </div>
    );
  }

  const profile = await getAuthenticatedProfile();
  if (!profile) {
    redirect("/login?next=/admin");
  }

  if (profile.role !== "admin") {
    return (
      <div className="min-h-screen bg-background py-16">
        <Container size="narrow">
          <div className="rounded-[var(--radius-xl)] border border-border bg-surface-secondary p-8 space-y-4">
            <div className="flex items-center gap-3 text-destructive">
              <ShieldAlert className="size-6" />
              <h1 className="text-section-heading text-deep-earth-olive">
                403 — Administrator Access Required
              </h1>
            </div>
            <p className="text-sm leading-relaxed text-muted-olive">
              Your account ({profile.email}) is signed in with the{" "}
              <code>{profile.role}</code> role and is not authorized to access
              store administration.
            </p>
            <Button asChild variant="outline">
              <Link href="/">Return to Storefront</Link>
            </Button>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-surface">
        <Container className="flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <BrandLogo logoSrc={logoSrc} href="/admin" size="sm" />
            <span className="rounded-[var(--radius-pill)] border border-border bg-surface-secondary px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.08em] text-muted-olive">
              Admin Studio
            </span>
          </div>
          <Link
            href="/"
            className="text-xs font-medium text-primary hover:underline"
          >
            View Storefront →
          </Link>
        </Container>
      </header>

      <Container className="py-8">
        <div className="grid gap-8 lg:grid-cols-12">
          <aside className="lg:col-span-3 xl:col-span-2">
            <div className="rounded-[var(--radius-xl)] border border-border bg-surface-secondary p-4 space-y-4">
              <nav aria-label="Admin Navigation" className="flex flex-col gap-1">
                {ADMIN_NAV.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-[var(--radius-sm)] px-3 py-2 text-sm font-medium text-deep-earth-olive transition-colors hover:bg-surface-cotton"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
              <div className="border-t border-border pt-3">
                <p className="mb-2 truncate px-1 text-[11px] text-muted-olive">
                  {profile.email}
                </p>
                <SignOutButton />
              </div>
            </div>
          </aside>

          <main className="min-w-0 lg:col-span-9 xl:col-span-10">
            {children}
          </main>
        </div>
      </Container>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <Container className="py-12">
          <Skeleton className="h-96 w-full rounded-[var(--radius-xl)]" />
        </Container>
      }
    >
      <ProtectedAdminShell>{children}</ProtectedAdminShell>
    </Suspense>
  );
}
