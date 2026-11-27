import { BRAND } from "@/lib/constants/brand";
import { formatInrFromPaise } from "@/lib/utils/currency";
import type { CartItem } from "@/types";

export interface WhatsAppOrderCustomerInfo {
  fullName?: string;
  phone?: string;
  email?: string;
  addressLine1?: string;
  addressLine2?: string;
  area?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  shippingLabel?: string;
  shippingPaise?: number;
  discountPaise?: number;
  couponCode?: string | null;
}

/**
 * Formats every cart item (name, SKU/code, variant, unit cost, qty, line total)
 * and optional customer delivery details into a structured WhatsApp order message.
 */
export function buildWhatsAppOrderMessage(
  items: CartItem[],
  customer?: WhatsAppOrderCustomerInfo
): string {
  const subtotalPaise = items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );
  const discountPaise = customer?.discountPaise ?? 0;
  const shippingPaise = customer?.shippingPaise ?? 0;
  const totalPaise = Math.max(0, subtotalPaise - discountPaise + shippingPaise);

  const lines: string[] = [
    `*DRAPES OF COTTON — NEW SAREE ORDER*`,
    `--------------------------------`,
  ];

  items.forEach((item, index) => {
    const unitCost = formatInrFromPaise(item.unitPrice);
    const lineCost = formatInrFromPaise(item.unitPrice * item.quantity);
    lines.push(`${index + 1}. *${item.name}*`);
    lines.push(`   Code: ${item.sku}`);
    if (item.variantName) {
      lines.push(`   Option: ${item.variantName}`);
    }
    lines.push(`   Cost: ${unitCost} x ${item.quantity} = ${lineCost}`);
    lines.push("");
  });

  lines.push(`--------------------------------`);
  lines.push(`Subtotal: ${formatInrFromPaise(subtotalPaise)}`);
  if (discountPaise > 0) {
    lines.push(
      `Discount${customer?.couponCode ? ` (${customer.couponCode})` : ""}: -${formatInrFromPaise(discountPaise)}`
    );
  }
  if (shippingPaise > 0) {
    lines.push(
      `Shipping${customer?.shippingLabel ? ` (${customer.shippingLabel})` : ""}: ${formatInrFromPaise(shippingPaise)}`
    );
  }
  lines.push(`*Total Cost: ${formatInrFromPaise(totalPaise)}*`);

  if (customer?.fullName || customer?.addressLine1) {
    lines.push(`--------------------------------`);
    lines.push(`*Delivery Details*`);
    if (customer.fullName) lines.push(`Name: ${customer.fullName}`);
    if (customer.phone) lines.push(`Mobile: ${customer.phone}`);
    if (customer.email) lines.push(`Email: ${customer.email}`);
    const addressParts = [
      customer.addressLine1,
      customer.addressLine2,
      customer.area,
      customer.city,
      customer.state,
      customer.postalCode,
    ].filter(Boolean);
    if (addressParts.length > 0) {
      lines.push(`Address: ${addressParts.join(", ")}`);
    }
  }

  lines.push(`--------------------------------`);
  lines.push(`Please confirm availability and next steps.`);

  return lines.join("\n");
}

/**
 * Generates the direct WhatsApp chat URL targeting +91 7780799160.
 */
export function buildWhatsAppOrderUrl(
  items: CartItem[],
  customer?: WhatsAppOrderCustomerInfo
): string {
  const message = buildWhatsAppOrderMessage(items, customer);
  return `https://wa.me/${BRAND.whatsappOrderNumber}?text=${encodeURIComponent(message)}`;
}
