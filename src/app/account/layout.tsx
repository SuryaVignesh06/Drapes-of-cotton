import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { StorefrontShell } from "@/components/layout/storefront-shell";
import { Skeleton } from "@/components/ui/skeleton";
import { SignOutButton } from "@/features/account/sign-out-button";
import { getAuthenticatedProfile } from "@/lib/supabase/auth-guards";
import { isSupabasePublicConfigured } from "@/lib/supabase/config";

const ACCOUNT_LINKS = [
  { label: "Overview", href: "/account" },
  { label: "Profile", href: "/account/profile" },
  { label: "Addresses", href: "/account/addresses" },
  { label: "Orders", href: "/account/orders" },
  { label: "Wishlist", href: "/account/wishlist" },
];

async function ProtectedAccountGate({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!isSupabasePublicConfigured()) {
    return (
      <div className="rounded-[var(--radius-xl)] border border-border bg-surface-secondary p-8">
        <p className="text-label-meta text-muted-olive">Configuration Needed</p>
        <h1 className="text-section-heading mt-2 text-deep-earth-olive">
          Customer Account Requires Supabase
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-olive">
          Add <code>NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
          <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to <code>.env.local</code>{" "}
          and apply the migrations in <code>supabase/migrations/</code> to activate
          authenticated customer accounts, saved addresses, and order history.
        </p>
        <Link
          href="/shop"
          className="mt-5 inline-flex text-xs font-medium uppercase tracking-[0.08em] text-primary hover:underline"
        >
          Return to Shop
        </Link>
      </div>
    );
  }

  const profile = await getAuthenticatedProfile();
  if (!profile) {
    redirect("/login?next=/account");
  }

  return (
    <div className="grid gap-8 lg:grid-cols-12">
      <aside className="space-y-4 lg:col-span-3">
        <div className="rounded-[var(--radius-xl)] border border-border bg-surface-secondary p-5">
          <p className="text-label-meta text-muted-olive">Signed In</p>
          <p className="mt-1 truncate text-sm font-medium text-deep-earth-olive">
            {profile.fullName || profile.email}
          </p>
          <p className="truncate text-xs text-muted-olive">{profile.email}</p>

          <nav aria-label="Account Navigation" className="mt-5 flex flex-col gap-1">
            {ACCOUNT_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-[var(--radius-sm)] px-3 py-2 text-sm text-foreground transition-colors hover:bg-surface-cotton"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="mt-5 border-t border-border pt-4">
            <SignOutButton />
          </div>
        </div>
      </aside>

      <div className="lg:col-span-9">{children}</div>
    </div>
  );
}

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <StorefrontShell>
      <Section spacing="default" surface="ivory">
        <Container>
          <Suspense
            fallback={
              <div className="grid gap-8 lg:grid-cols-12">
                <Skeleton className="h-64 rounded-[var(--radius-xl)] lg:col-span-3" />
                <Skeleton className="h-96 rounded-[var(--radius-xl)] lg:col-span-9" />
              </div>
            }
          >
            <ProtectedAccountGate>{children}</ProtectedAccountGate>
          </Suspense>
        </Container>
      </Section>
    </StorefrontShell>
  );
}
