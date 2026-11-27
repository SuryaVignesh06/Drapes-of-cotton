"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, MessageCircle, ShieldCheck } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { BRAND } from "@/lib/constants";
import { DEFAULT_COUPONS, INDIAN_STATES } from "@/lib/constants/store";
import { buildWhatsAppOrderUrl, cn, formatInrFromPaise } from "@/lib/utils";
import { indianPhoneRegex, indianPinRegex } from "@/lib/validations/store";
import { selectCartSubtotal, useCartStore } from "@/stores/cart.store";
import type {
  CustomerAddress,
  CustomerProfile,
  ShippingMethodOption,
} from "@/types";

interface RazorpayHandlerResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayModalOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  theme: {
    color: string;
  };
  handler: (response: RazorpayHandlerResponse) => Promise<void>;
  modal: {
    ondismiss: () => Promise<void>;
  };
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayModalOptions) => {
      open: () => void;
      on: (event: string, cb: () => void) => void;
    };
  }
}

const checkoutFormSchema = z.object({
  customerEmail: z.string().trim().email("Enter a valid email address."),
  fullName: z.string().trim().min(2, "Full name is required."),
  phone: z
    .string()
    .trim()
    .regex(indianPhoneRegex, "Enter a valid 10-digit Indian mobile number."),
  addressLine1: z.string().trim().min(4, "House / street address is required."),
  addressLine2: z.string().trim().optional(),
  area: z.string().trim().min(2, "Area or locality is required."),
  city: z.string().trim().min(2, "City is required."),
  state: z.string().trim().min(2, "State is required."),
  postalCode: z
    .string()
    .trim()
    .regex(indianPinRegex, "Enter a valid 6-digit Indian PIN code."),
  country: z.string().trim().default("India"),
});

type CheckoutFormInput = z.input<typeof checkoutFormSchema>;
type CheckoutFormOutput = z.output<typeof checkoutFormSchema>;

export function CheckoutClient({
  profile,
  savedAddresses,
  shippingMethods,
  integrationReady,
}: {
  profile: CustomerProfile | null;
  savedAddresses: CustomerAddress[];
  shippingMethods: ShippingMethodOption[];
  integrationReady: boolean;
  missingKeys?: string[];
}) {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const subtotal = selectCartSubtotal(items);

  const defaultAddr =
    savedAddresses.find((a) => a.isDefault) ?? savedAddresses[0] ?? null;

  const [selectedAddressId, setSelectedAddressId] = useState<string>(
    defaultAddr?.id ?? "new"
  );
  const [shippingMethodId, setShippingMethodId] = useState<string>(
    shippingMethods[0]?.id ?? "standard"
  );
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<CheckoutFormInput, unknown, CheckoutFormOutput>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      customerEmail: profile?.email ?? "",
      fullName: defaultAddr?.fullName ?? profile?.fullName ?? "",
      phone: defaultAddr?.phone ?? profile?.phone ?? "",
      addressLine1: defaultAddr?.addressLine1 ?? "",
      addressLine2: defaultAddr?.addressLine2 ?? "",
      area: defaultAddr?.area ?? "",
      city: defaultAddr?.city ?? "",
      state: defaultAddr?.state ?? "Karnataka",
      postalCode: defaultAddr?.postalCode ?? "",
      country: defaultAddr?.country ?? "India",
    },
  });

  const watchedState = useWatch({ control: form.control, name: "state" });

  useEffect(() => {
    if (!integrationReady) return;
    const scriptId = "razorpay-checkout-js";
    if (document.getElementById(scriptId)) return;
    const script = document.createElement("script");
    script.id = scriptId;
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, [integrationReady]);

  function handleSelectSavedAddress(id: string) {
    setSelectedAddressId(id);
    if (id === "new") return;
    const addr = savedAddresses.find((a) => a.id === id);
    if (!addr) return;
    form.setValue("fullName", addr.fullName);
    form.setValue("phone", addr.phone);
    form.setValue("addressLine1", addr.addressLine1);
    form.setValue("addressLine2", addr.addressLine2 ?? "");
    form.setValue("area", addr.area);
    form.setValue("city", addr.city);
    form.setValue("state", addr.state);
    form.setValue("postalCode", addr.postalCode);
    form.setValue("country", addr.country);
  }

  const selectedShipping =
    shippingMethods.find((m) => m.id === shippingMethodId) ?? shippingMethods[0];

  const discountAmount = useMemo(() => {
    if (!appliedCoupon) return 0;
    const coupon = DEFAULT_COUPONS[appliedCoupon];
    if (!coupon || subtotal < coupon.minSubtotalPaise) return 0;
    return coupon.type === "percent"
      ? Math.round((subtotal * coupon.value) / 100)
      : Math.min(coupon.value, subtotal);
  }, [appliedCoupon, subtotal]);

  const totalAmount = Math.max(
    0,
    subtotal - discountAmount + (selectedShipping?.ratePaise ?? 0)
  );

  function handleApplyCoupon() {
    const code = couponInput.trim().toUpperCase();
    if (!code) {
      setAppliedCoupon(null);
      return;
    }
    const coupon = DEFAULT_COUPONS[code];
    if (!coupon) {
      toast.error("Invalid coupon code.");
      return;
    }
    if (subtotal < coupon.minSubtotalPaise) {
      toast.error(
        `Coupon ${code} requires a minimum subtotal of ${formatInrFromPaise(
          coupon.minSubtotalPaise
        )}.`
      );
      return;
    }
    setAppliedCoupon(code);
    toast.success(`Coupon ${code} applied.`);
  }

  function handleWhatsAppCheckout() {
    if (items.length === 0) {
      toast.error("Your shopping bag is empty.");
      return;
    }

    const v = form.getValues();
    const url = buildWhatsAppOrderUrl(items, {
      fullName: v.fullName || undefined,
      phone: v.phone || undefined,
      email: v.customerEmail || undefined,
      addressLine1: v.addressLine1 || undefined,
      addressLine2: v.addressLine2 || undefined,
      area: v.area || undefined,
      city: v.city || undefined,
      state: v.state || undefined,
      postalCode: v.postalCode || undefined,
      shippingLabel: selectedShipping?.label,
      shippingPaise: selectedShipping?.ratePaise ?? 0,
      discountPaise: discountAmount,
      couponCode: appliedCoupon,
    });

    try {
      sessionStorage.setItem(
        "doc-last-whatsapp-order",
        JSON.stringify({
          createdAt: new Date().toISOString(),
          whatsappUrl: url,
          items,
          subtotal,
          shippingPaise: selectedShipping?.ratePaise ?? 0,
          discountPaise: discountAmount,
          totalPaise: totalAmount,
          customer: {
            fullName: v.fullName,
            phone: v.phone,
            email: v.customerEmail,
            city: v.city,
            postalCode: v.postalCode,
          },
        })
      );
    } catch {
      // Ignore storage errors
    }

    window.open(url, "_blank", "noopener,noreferrer");
    router.push("/checkout/whatsapp-sent");
  }

  async function onSubmitRazorpay(values: CheckoutFormOutput) {
    if (items.length === 0) {
      toast.error("Your shopping bag is empty.");
      return;
    }

    if (!integrationReady) {
      toast.error(
        "Online Razorpay checkout requires Supabase & Razorpay keys in .env.local. You can send your order directly via WhatsApp instead."
      );
      return;
    }

    if (!window.Razorpay) {
      toast.error("Razorpay Checkout script is still loading. Please try again.");
      return;
    }

    setSubmitting(true);
    try {
      const createRes = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerEmail: values.customerEmail,
          shippingAddress: {
            fullName: values.fullName,
            phone: values.phone,
            addressLine1: values.addressLine1,
            addressLine2: values.addressLine2,
            area: values.area,
            city: values.city,
            state: values.state,
            postalCode: values.postalCode,
            country: values.country,
          },
          shippingMethod: shippingMethodId,
          couponCode: appliedCoupon ?? undefined,
          items: items.map((i) => ({
            productId: i.productId,
            variantId: i.variantId,
            quantity: i.quantity,
          })),
        }),
      });

      const orderData = (await createRes.json()) as {
        error?: string;
        orderId?: string;
        orderNumber?: string;
        razorpayOrderId?: string;
        amountPaise?: number;
        currency?: string;
        keyId?: string;
      };

      if (!createRes.ok || !orderData.orderId || !orderData.razorpayOrderId) {
        toast.error(orderData.error ?? "Unable to initiate order.");
        setSubmitting(false);
        return;
      }

      const createdOrderId = orderData.orderId;

      const rzp = new window.Razorpay({
        key: orderData.keyId!,
        amount: orderData.amountPaise!,
        currency: orderData.currency ?? "INR",
        name: "Drapes of Cotton",
        description: `Order ${orderData.orderNumber}`,
        order_id: orderData.razorpayOrderId,
        prefill: {
          name: values.fullName,
          email: values.customerEmail,
          contact: values.phone,
        },
        theme: {
          color: "#1A1A18",
        },
        handler: async (response) => {
          const verifyRes = await fetch("/api/checkout/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderId: createdOrderId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            }),
          });

          const verifyData = (await verifyRes.json()) as {
            verified?: boolean;
            error?: string;
          };

          if (!verifyRes.ok || !verifyData.verified) {
            toast.error(
              verifyData.error ??
                "Payment verification failed. Contact support if charged."
            );
            router.push(`/checkout/confirmation/${createdOrderId}`);
            return;
          }

          clearCart();
          toast.success("Payment verified and order confirmed.");
          router.push(`/checkout/confirmation/${createdOrderId}`);
        },
        modal: {
          ondismiss: async () => {
            await fetch("/api/checkout/cancel-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderId: createdOrderId,
                reason: "Customer closed Razorpay checkout modal.",
              }),
            });
            toast.info("Payment cancelled. Your bag items remain saved.");
            setSubmitting(false);
          },
        },
      });

      rzp.on("payment.failed", () => {
        toast.error("Payment failed. Please retry with another payment method.");
        setSubmitting(false);
      });

      rzp.open();
    } catch {
      toast.error("Unable to start checkout. Please try again.");
      setSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="rounded-[var(--radius-xl)] border border-border bg-surface-secondary px-6 py-16 text-center">
        <h2 className="text-section-heading text-foreground">
          Your shopping bag is empty
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Add a cotton saree to your bag before proceeding to checkout.
        </p>
        <Button asChild className="mt-6">
          <Link href="/shop">Explore Cotton Sarees</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-12">
      <div className="space-y-6 lg:col-span-7">
        <form
          id="checkout-form"
          onSubmit={form.handleSubmit(onSubmitRazorpay)}
          className="space-y-6"
          noValidate
        >
          {/* 1. Customer Details */}
          <div className="rounded-[var(--radius-xl)] border border-border bg-surface-secondary p-6 space-y-4">
            <h2 className="text-subsection-heading text-foreground">
              1. Customer Details
            </h2>
            <div className="space-y-1.5">
              <Label htmlFor="co-email">Email Address</Label>
              <Input
                id="co-email"
                type="email"
                placeholder="you@example.com"
                {...form.register("customerEmail")}
              />
              {form.formState.errors.customerEmail && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.customerEmail.message}
                </p>
              )}
            </div>
          </div>

          {/* 2. Delivery Address */}
          <div className="rounded-[var(--radius-xl)] border border-border bg-surface-secondary p-6 space-y-4">
            <h2 className="text-subsection-heading text-foreground">
              2. Delivery Address
            </h2>

            {savedAddresses.length > 0 && (
              <div className="space-y-2">
                <Label>Saved Addresses</Label>
                <div className="grid gap-2.5 sm:grid-cols-2">
                  {savedAddresses.map((addr) => (
                    <button
                      key={addr.id}
                      type="button"
                      onClick={() => handleSelectSavedAddress(addr.id)}
                      className={cn(
                        "rounded-[var(--radius-md)] border p-3 text-left text-xs transition-colors",
                        selectedAddressId === addr.id
                          ? "border-primary bg-surface"
                          : "border-border bg-surface hover:bg-surface-cotton"
                      )}
                    >
                      <p className="font-medium text-foreground">{addr.fullName}</p>
                      <p className="mt-0.5 text-muted-foreground">
                        {addr.addressLine1}, {addr.city} — {addr.postalCode}
                      </p>
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => handleSelectSavedAddress("new")}
                    className={cn(
                      "rounded-[var(--radius-md)] border p-3 text-left text-xs font-medium transition-colors",
                      selectedAddressId === "new"
                        ? "border-primary bg-surface"
                        : "border-border bg-surface hover:bg-surface-cotton"
                    )}
                  >
                    + Use a different address
                  </button>
                </div>
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="co-name">Recipient Full Name</Label>
                <Input id="co-name" {...form.register("fullName")} />
                {form.formState.errors.fullName && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.fullName.message}
                  </p>
                )}
              </div>
              <div className="space-y-1">
                <Label htmlFor="co-phone">Mobile Number</Label>
                <Input
                  id="co-phone"
                  placeholder="9876543210"
                  {...form.register("phone")}
                />
                {form.formState.errors.phone && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.phone.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="co-line1">House / Building / Street</Label>
              <Input id="co-line1" {...form.register("addressLine1")} />
              {form.formState.errors.addressLine1 && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.addressLine1.message}
                </p>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="co-line2">Apartment / Landmark (Optional)</Label>
                <Input id="co-line2" {...form.register("addressLine2")} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="co-area">Area / Locality</Label>
                <Input id="co-area" {...form.register("area")} />
                {form.formState.errors.area && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.area.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-1">
                <Label htmlFor="co-city">City</Label>
                <Input id="co-city" {...form.register("city")} />
                {form.formState.errors.city && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.city.message}
                  </p>
                )}
              </div>
              <div className="space-y-1">
                <Label>State</Label>
                <Select
                  value={watchedState}
                  onValueChange={(v) => form.setValue("state", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {INDIAN_STATES.map((st) => (
                      <SelectItem key={st} value={st}>
                        {st}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="co-pin">PIN Code</Label>
                <Input
                  id="co-pin"
                  maxLength={6}
                  placeholder="560001"
                  {...form.register("postalCode")}
                />
                {form.formState.errors.postalCode && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.postalCode.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* 3. Shipping Method */}
          <div className="rounded-[var(--radius-xl)] border border-border bg-surface-secondary p-6 space-y-4">
            <h2 className="text-subsection-heading text-foreground">
              3. Shipping Method
            </h2>
            <div className="space-y-2.5">
              {shippingMethods.map((method) => (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setShippingMethodId(method.id)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-[var(--radius-md)] border p-3.5 text-left transition-colors",
                    shippingMethodId === method.id
                      ? "border-primary bg-surface"
                      : "border-border bg-surface hover:bg-surface-cotton"
                  )}
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {method.label}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {method.description}
                    </p>
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {formatInrFromPaise(method.ratePaise)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </form>
      </div>

      {/* 4. Order Summary & Checkout Actions */}
      <aside className="lg:col-span-5">
        <div className="sticky top-24 rounded-[var(--radius-xl)] border border-border bg-surface-secondary p-6 space-y-5">
          <h2 className="text-subsection-heading text-foreground">
            Order Summary
          </h2>

          <ul className="divide-y divide-border">
            {items.map((item) => (
              <li
                key={`${item.productId}-${item.variantId ?? "base"}`}
                className="flex items-center gap-3 py-3"
              >
                <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-[var(--radius-sm)] bg-surface-cotton">
                  <Image
                    src={item.imageUrl}
                    alt={item.imageAlt}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {item.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Code: {item.sku} · Qty: {item.quantity}
                  </p>
                </div>
                <span className="text-sm font-medium text-foreground">
                  {formatInrFromPaise(item.unitPrice * item.quantity)}
                </span>
              </li>
            ))}
          </ul>

          <div className="flex gap-2">
            <Input
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value)}
              placeholder="Coupon code (e.g. WELCOME10)"
              aria-label="Coupon code"
              className="h-9 bg-surface text-xs"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleApplyCoupon}
            >
              Apply
            </Button>
          </div>

          <Separator />

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatInrFromPaise(subtotal)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between font-medium text-foreground">
                <span>Discount ({appliedCoupon})</span>
                <span>−{formatInrFromPaise(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span>
                {selectedShipping
                  ? formatInrFromPaise(selectedShipping.ratePaise)
                  : "—"}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between text-base font-semibold text-foreground">
              <span>Total (INR)</span>
              <span>{formatInrFromPaise(totalAmount)}</span>
            </div>
          </div>

          <div className="space-y-2.5">
            <Button
              type="button"
              size="lg"
              onClick={handleWhatsAppCheckout}
              className="w-full"
            >
              <MessageCircle className="size-4" />
              Send Order via WhatsApp ({BRAND.whatsappDisplayNumber})
            </Button>

            <Button
              type="submit"
              form="checkout-form"
              variant="outline"
              size="lg"
              className="w-full"
              disabled={submitting || !integrationReady}
            >
              <Lock className="size-4" />
              {submitting
                ? "Initiating Secure Payment..."
                : integrationReady
                  ? `Pay Online (${formatInrFromPaise(totalAmount)})`
                  : "Online Card/UPI (Requires Razorpay Keys)"}
            </Button>
          </div>

          <p className="flex items-center justify-center gap-1.5 text-center text-[11px] text-muted-foreground">
            <ShieldCheck className="size-3.5" />
            WhatsApp orders include itemized name, code, cost &amp; return you here.
          </p>
        </div>
      </aside>
    </div>
  );
}
