import { z } from "zod";

export const indianPhoneRegex = /^(\+91[\-\s]?)?[6-9]\d{9}$/;
export const indianPinRegex = /^[1-9][0-9]{5}$/;

export const newsletterSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address."),
});

export const addressSchema = z.object({
  fullName: z.string().trim().min(2, "Full name is required."),
  phone: z
    .string()
    .trim()
    .regex(indianPhoneRegex, "Enter a valid 10-digit Indian mobile number."),
  addressLine1: z.string().trim().min(4, "House number / street is required."),
  addressLine2: z.string().trim().optional(),
  area: z.string().trim().min(2, "Area or locality is required."),
  city: z.string().trim().min(2, "City is required."),
  state: z.string().trim().min(2, "State is required."),
  postalCode: z
    .string()
    .trim()
    .regex(indianPinRegex, "Enter a valid 6-digit Indian PIN code."),
  country: z.string().trim().min(2).default("India"),
  addressType: z.enum(["home", "work", "other"]).default("home"),
  isDefault: z.boolean().default(false),
});

export const profileSchema = z.object({
  fullName: z.string().trim().min(2, "Full name must be at least 2 characters."),
  phone: z
    .string()
    .trim()
    .refine(
      (val) => val.length === 0 || indianPhoneRegex.test(val),
      "Enter a valid 10-digit Indian mobile number."
    ),
});

export const checkoutRequestSchema = z.object({
  customerEmail: z.string().trim().email("Valid email is required."),
  shippingAddress: addressSchema.omit({ isDefault: true, addressType: true }),
  shippingMethod: z.string().trim().min(1, "Select a shipping method."),
  couponCode: z.string().trim().optional(),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        variantId: z.string().nullable().optional(),
        quantity: z.number().int().min(1).max(20),
      })
    )
    .min(1, "Your shopping bag is empty."),
});

export const razorpayVerificationSchema = z.object({
  orderId: z.string().uuid("Invalid order identifier."),
  razorpayOrderId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpaySignature: z.string().min(1),
});

export const adminProductSchema = z.object({
  name: z.string().trim().min(3, "Product name must be at least 3 characters."),
  slug: z.string().trim().min(3, "Slug is required."),
  sku: z.string().trim().min(2, "SKU is required."),
  shortDescription: z.string().trim().min(10, "Short description is required."),
  description: z.string().trim().min(20, "Full description is required."),
  priceRupees: z.coerce.number().min(100, "Price must be at least ₹100."),
  compareAtPriceRupees: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? null : Number(v)),
    z.number().min(0).nullable()
  ),
  fabric: z.string().trim().min(2, "Fabric is required."),
  weave: z.string().trim().optional(),
  color: z.string().trim().min(2, "Color is required."),
  occasion: z.string().trim().min(2, "Occasion is required."),
  sareeLength: z.string().trim().optional(),
  blousePieceLength: z.string().trim().optional(),
  blousePieceIncluded: z.boolean().default(true),
  careInstructions: z.string().trim().optional(),
  origin: z.string().trim().optional(),
  stockQuantity: z.coerce.number().int().min(0),
  isFeatured: z.boolean().default(false),
  isNew: z.boolean().default(false),
  isPublished: z.boolean().default(false),
  seoTitle: z.string().trim().optional(),
  seoDescription: z.string().trim().optional(),
  collectionIds: z.array(z.string()).default([]),
  images: z
    .array(
      z.object({
        imageUrl: z.string().trim().min(1),
        altText: z.string().trim().min(2),
        imageType: z
          .enum(["main", "full", "detail", "border", "pallu", "drape"])
          .default("main"),
        sortOrder: z.number().int().min(0).default(0),
      })
    )
    .default([]),
});

export const adminCollectionSchema = z.object({
  name: z.string().trim().min(2, "Collection name is required."),
  slug: z.string().trim().min(2, "Slug is required."),
  description: z.string().trim().optional(),
  coverImage: z.string().trim().optional(),
  isFeatured: z.boolean().default(false),
  isPublished: z.boolean().default(true),
  sortOrder: z.coerce.number().int().min(0).default(0),
});

export const orderStatusUpdateSchema = z.object({
  fulfilmentStatus: z.enum([
    "pending",
    "payment_pending",
    "confirmed",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
    "refunded",
  ]),
  note: z.string().trim().max(300).optional(),
});
