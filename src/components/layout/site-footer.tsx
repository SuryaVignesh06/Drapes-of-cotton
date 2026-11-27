import Link from "next/link";
import { BrandLogo } from "@/components/common/brand-logo";
import { NewsletterForm } from "@/components/common/newsletter-form";
import { Container } from "@/components/layout/container";
import { Separator } from "@/components/ui/separator";

export function SiteFooter({ logoSrc }: { logoSrc?: string | null }) {
  return (
    <footer className="border-t border-border bg-background text-foreground">
      <Container className="py-12 sm:py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-12">
          {/* Col 1: Brand & Social */}
          <div className="space-y-3 lg:col-span-3">
            <BrandLogo logoSrc={logoSrc} size="md" />
            <p className="text-xs text-muted-foreground">
              Elegance in Every Drape.
            </p>
            <div className="flex items-center gap-3.5 pt-2 text-foreground">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                IG
              </a>
              <a
                href="https://pinterest.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Pinterest"
                className="text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                PI
              </a>
              <a
                href="mailto:care@drapesofcotton.com"
                aria-label="Email Drapes of Cotton"
                className="text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                Mail
              </a>
            </div>
          </div>

          {/* Col 2: Shop */}
          <div className="space-y-3 lg:col-span-2">
            <h3 className="text-xs font-semibold text-foreground">Shop</h3>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <Link href="/shop" className="hover:text-foreground">
                  All Sarees
                </Link>
              </li>
              <li>
                <Link href="/shop?sort=newest" className="hover:text-foreground">
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link href="/shop?featured=1" className="hover:text-foreground">
                  Best Sellers
                </Link>
              </li>
              <li>
                <Link
                  href="/collections/everyday-cotton"
                  className="hover:text-foreground"
                >
                  Everyday Cotton
                </Link>
              </li>
              <li>
                <Link
                  href="/collections/office-wear"
                  className="hover:text-foreground"
                >
                  Office Wear
                </Link>
              </li>
              <li>
                <Link
                  href="/collections/festive-edit"
                  className="hover:text-foreground"
                >
                  Festive Edit
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Customer Care */}
          <div className="space-y-3 lg:col-span-3">
            <h3 className="text-xs font-semibold text-foreground">
              Customer Care
            </h3>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <Link href="/contact" className="hover:text-foreground">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/policies/shipping" className="hover:text-foreground">
                  Shipping &amp; Delivery
                </Link>
              </li>
              <li>
                <Link href="/policies/returns" className="hover:text-foreground">
                  Returns &amp; Exchanges
                </Link>
              </li>
              <li>
                <Link href="/faqs" className="hover:text-foreground">
                  FAQs
                </Link>
              </li>
              <li>
                <Link href="/account/orders" className="hover:text-foreground">
                  Track Your Order
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Join Our Newsletter */}
          <div className="space-y-3 lg:col-span-4">
            <h3 className="text-xs font-semibold text-foreground">
              Join Our Newsletter
            </h3>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Be the first to know about new cotton weaves, seasonal edits, and
              studio updates.
            </p>
            <NewsletterForm />
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col items-start justify-between gap-3 text-[11px] text-muted-foreground sm:flex-row sm:items-center">
          <p>© 2026 Drapes of Cotton. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <Link href="/policies/privacy" className="hover:text-foreground">
              Privacy Policy
            </Link>
            <Link href="/policies/terms" className="hover:text-foreground">
              Terms &amp; Conditions
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
