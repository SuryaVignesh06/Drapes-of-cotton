import type { FulfilmentStatus, PaymentStatus, ProductImageType, UserRole } from "./database.types";

export interface ProductImage {
  id: string;
  productId: string;
  imageUrl: string;
  altText: string;
  imageType: ProductImageType;
  sortOrder: number;
}

export interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  sku: string;
  price: number;
  stockQuantity: number;
  attributes: Record<string, string>;
  isActive: boolean;
}

export interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  coverImage: string | null;
  isFeatured: boolean;
  isPublished: boolean;
  sortOrder: number;
  productCount?: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  shortDescription: string;
  description: string;
  /** Integer INR paise (e.g., 245000 = ₹2,450) */
  price: number;
  compareAtPrice: number | null;
  currency: string;
  fabric: string;
  weave: string | null;
  color: string;
  occasion: string;
  sareeLength: string | null;
  blousePieceLength: string | null;
  blousePieceIncluded: boolean;
  careInstructions: string | null;
  origin: string | null;
  stockQuantity: number;
  isFeatured: boolean;
  isNew: boolean;
  isPublished: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  createdAt: string;
  updatedAt: string;
  images: ProductImage[];
  collections: Pick<Collection, "id" | "name" | "slug">[];
  variants?: ProductVariant[];
}

export type SortOption =
  | "featured"
  | "newest"
  | "best-selling"
  | "price-asc"
  | "price-desc"
  | "alphabetical";

export interface ProductFilterInput {
  collection?: string;
  fabrics?: string[];
  colors?: string[];
  occasions?: string[];
  weaves?: string[];
  priceBucket?: string;
  minPricePaise?: number;
  maxPricePaise?: number;
  availability?: "in-stock" | "out-of-stock";
  blouseIncluded?: boolean;
  isNew?: boolean;
  isFeatured?: boolean;
  search?: string;
  sort?: SortOption;
  page?: number;
  pageSize?: number;
}

export interface CartItem {
  productId: string;
  variantId: string | null;
  slug: string;
  name: string;
  sku: string;
  imageUrl: string;
  imageAlt: string;
  variantName: string | null;
  /** Unit price in INR paise */
  unitPrice: number;
  quantity: number;
  maxStock: number;
}

export interface CustomerProfile {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  role: UserRole;
}

export interface CustomerAddress {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string | null;
  area: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  addressType: "home" | "work" | "other";
  isDefault: boolean;
  createdAt: string;
}

export interface OrderItemSummary {
  id: string;
  productId: string | null;
  productNameSnapshot: string;
  skuSnapshot: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  variantSnapshot: Record<string, unknown> | null;
}

export interface OrderRecord {
  id: string;
  orderNumber: string;
  userId: string | null;
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  subtotal: number;
  discountAmount: number;
  shippingAmount: number;
  totalAmount: number;
  currency: string;
  paymentStatus: PaymentStatus;
  fulfilmentStatus: FulfilmentStatus;
  shippingAddress: {
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string | null;
    area: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  shippingMethod: string;
  couponCode: string | null;
  statusHistory: Array<{ status: string; timestamp: string; note?: string }>;
  createdAt: string;
  updatedAt: string;
  items: OrderItemSummary[];
}

export interface ShippingMethodOption {
  id: string;
  label: string;
  description: string;
  ratePaise: number;
}
