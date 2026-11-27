"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Menu, Search, ShoppingBag, User } from "lucide-react";
import { BrandLogo } from "@/components/common/brand-logo";
import { Container } from "@/components/layout/container";
import { SearchDialog } from "@/components/navigation/search-dialog";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { CartDrawer } from "@/features/cart/cart-drawer";
import { STORE_NAV_LINKS } from "@/lib/constants/store";
import { cn } from "@/lib/utils";
import { selectCartCount, useCartStore } from "@/stores/cart.store";
import { useWishlistStore } from "@/stores/wishlist.store";

interface SiteHeaderProps {
  logoSrc?: string | null;
  isAuthenticated?: boolean;
  isAdmin?: boolean;
}

export function SiteHeader({
  logoSrc,
  isAuthenticated = false,
  isAdmin = false,
}: SiteHeaderProps) {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const items = useCartStore((s) => s.items);
  const setCartOpen = useCartStore((s) => s.setOpen);
  const wishlistIds = useWishlistStore((s) => s.productIds);

  const cartCount = selectCartCount(items);
  const wishlistCount = wishlistIds.length;

  function isLinkActive(href: string): boolean {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href.split("?")[0]);
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm">
        <Container className="grid h-16 grid-cols-3 items-center gap-2">
          {/* Left: Minimal Navigation Links (Desktop) / Menu Trigger (Mobile) */}
          <div className="flex items-center gap-5">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Open navigation menu"
                  className="size-9 lg:hidden"
                >
                  <Menu className="size-[18px]" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="flex w-[86vw] max-w-sm flex-col border-r border-border bg-background p-0"
              >
                <SheetHeader className="border-b border-border px-6 py-5 text-left">
                  <SheetTitle className="font-editorial text-sm font-medium uppercase tracking-[0.22em] text-foreground">
                    Drapes of Cotton
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-1 flex-col justify-between px-6 py-6">
                  <nav aria-label="Mobile Navigation" className="flex flex-col gap-1.5">
                    {STORE_NAV_LINKS.map((link) => {
                      const active = isLinkActive(link.href);
                      return (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={cn(
                            "rounded-[var(--radius-sm)] px-3 py-2.5 text-sm transition-colors",
                            active
                              ? "bg-primary font-medium text-primary-foreground"
                              : "text-foreground hover:bg-surface-cotton"
                          )}
                        >
                          {link.label}
                        </Link>
                      );
                    })}
                    <Link
                      href="/contact"
                      onClick={() => setMobileMenuOpen(false)}
                      className="rounded-[var(--radius-sm)] px-3 py-2.5 text-sm text-foreground hover:bg-surface-cotton"
                    >
                      Contact
                    </Link>
                    {isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setMobileMenuOpen(false)}
                        className="rounded-[var(--radius-sm)] border border-border px-3 py-2.5 text-sm font-medium text-foreground hover:bg-surface-cotton"
                      >
                        Admin Studio
                      </Link>
                    )}
                  </nav>

                  <div className="space-y-2 border-t border-border pt-5">
                    <Link
                      href="/wishlist"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-between rounded-[var(--radius-sm)] px-3 py-2 text-sm text-foreground hover:bg-surface-cotton"
                    >
                      <span className="flex items-center gap-2">
                        <Heart className="size-4" />
                        Wishlist
                      </span>
                      <span className="text-xs text-muted-foreground">{wishlistCount}</span>
                    </Link>
                    <Link
                      href={isAuthenticated ? "/account" : "/login"}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2 rounded-[var(--radius-sm)] px-3 py-2 text-sm text-foreground hover:bg-surface-cotton"
                    >
                      <User className="size-4" />
                      {isAuthenticated ? "My Account" : "Sign In / Register"}
                    </Link>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <nav
              aria-label="Primary Navigation"
              className="hidden items-center gap-5 lg:flex"
            >
              {STORE_NAV_LINKS.map((link) => {
                const active = isLinkActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "whitespace-nowrap text-xs tracking-[0.02em] transition-colors",
                      active
                        ? "font-medium text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
              {isAdmin && (
                <Link
                  href="/admin"
                  className="whitespace-nowrap text-xs font-medium text-foreground hover:underline"
                >
                  Admin
                </Link>
              )}
            </nav>
          </div>

          {/* Center: Spaced Editorial Brand Wordmark (AERIS style) */}
          <div className="flex justify-center">
            <BrandLogo logoSrc={logoSrc} size="md" />
          </div>

          {/* Right: Search, Account, Wishlist (count), Shopping Bag (count) */}
          <div className="flex items-center justify-end gap-1 sm:gap-2">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Search cotton sarees"
              className="flex size-9 items-center justify-center rounded-full text-foreground transition-colors hover:bg-surface-cotton"
            >
              <Search className="size-[17px] stroke-[1.6]" />
            </button>

            <Link
              href={isAuthenticated ? "/account" : "/login"}
              aria-label={isAuthenticated ? "My Account" : "Sign in"}
              className="hidden size-9 items-center justify-center rounded-full text-foreground transition-colors hover:bg-surface-cotton sm:inline-flex"
            >
              <User className="size-[17px] stroke-[1.6]" />
            </Link>

            <Link
              href="/wishlist"
              aria-label={`Wishlist (${wishlistCount} saved)`}
              className="relative hidden size-9 items-center justify-center rounded-full text-foreground transition-colors hover:bg-surface-cotton sm:inline-flex"
            >
              <Heart className="size-[17px] stroke-[1.6]" />
              <span className="absolute right-0.5 top-1 text-[9px] font-medium text-foreground">
                {wishlistCount}
              </span>
            </Link>

            <button
              type="button"
              onClick={() => setCartOpen(true)}
              aria-label={`Shopping bag (${cartCount} items)`}
              className="relative flex size-9 items-center justify-center rounded-full text-foreground transition-colors hover:bg-surface-cotton"
            >
              <ShoppingBag className="size-[17px] stroke-[1.6]" />
              <span className="absolute right-0.5 top-1 text-[9px] font-medium text-foreground">
                {cartCount}
              </span>
            </button>
          </div>
        </Container>
      </header>

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
      <CartDrawer />
    </>
  );
}
