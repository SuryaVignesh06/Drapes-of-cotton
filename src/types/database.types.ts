/**
 * Strongly-typed Supabase PostgreSQL schema definitions matching supabase/migrations/0001_initial_schema.sql.
 * All monetary columns are stored as integer INR paise (e.g. 245000 = ₹2,450).
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = "customer" | "admin";
export type PaymentStatus = "pending" | "authorized" | "paid" | "failed" | "refunded";
export type FulfilmentStatus =
  | "pending"
  | "payment_pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";
export type ProductImageType = "main" | "full" | "detail" | "border" | "pallu" | "drape";

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          phone: string | null;
          role: UserRole;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          phone?: string | null;
          role?: UserRole;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          phone?: string | null;
          role?: UserRole;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      addresses: {
        Row: {
          id: string;
          user_id: string;
          full_name: string;
          phone: string;
          address_line_1: string;
          address_line_2: string | null;
          area: string;
          city: string;
          state: string;
          postal_code: string;
          country: string;
          address_type: "home" | "work" | "other";
          is_default: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          full_name: string;
          phone: string;
          address_line_1: string;
          address_line_2?: string | null;
          area: string;
          city: string;
          state: string;
          postal_code: string;
          country?: string;
          address_type?: "home" | "work" | "other";
          is_default?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          full_name?: string;
          phone?: string;
          address_line_1?: string;
          address_line_2?: string | null;
          area?: string;
          city?: string;
          state?: string;
          postal_code?: string;
          country?: string;
          address_type?: "home" | "work" | "other";
          is_default?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      collections: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          cover_image: string | null;
          is_featured: boolean;
          is_published: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          cover_image?: string | null;
          is_featured?: boolean;
          is_published?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          cover_image?: string | null;
          is_featured?: boolean;
          is_published?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          name: string;
          slug: string;
          sku: string;
          short_description: string;
          description: string;
          price: number;
          compare_at_price: number | null;
          currency: string;
          fabric: string;
          weave: string | null;
          color: string;
          occasion: string;
          saree_length: string | null;
          blouse_piece_length: string | null;
          blouse_piece_included: boolean;
          care_instructions: string | null;
          origin: string | null;
          stock_quantity: number;
          is_featured: boolean;
          is_new: boolean;
          is_published: boolean;
          seo_title: string | null;
          seo_description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          sku: string;
          short_description: string;
          description: string;
          price: number;
          compare_at_price?: number | null;
          currency?: string;
          fabric: string;
          weave?: string | null;
          color: string;
          occasion: string;
          saree_length?: string | null;
          blouse_piece_length?: string | null;
          blouse_piece_included?: boolean;
          care_instructions?: string | null;
          origin?: string | null;
          stock_quantity?: number;
          is_featured?: boolean;
          is_new?: boolean;
          is_published?: boolean;
          seo_title?: string | null;
          seo_description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          sku?: string;
          short_description?: string;
          description?: string;
          price?: number;
          compare_at_price?: number | null;
          currency?: string;
          fabric?: string;
          weave?: string | null;
          color?: string;
          occasion?: string;
          saree_length?: string | null;
          blouse_piece_length?: string | null;
          blouse_piece_included?: boolean;
          care_instructions?: string | null;
          origin?: string | null;
          stock_quantity?: number;
          is_featured?: boolean;
          is_new?: boolean;
          is_published?: boolean;
          seo_title?: string | null;
          seo_description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      product_images: {
        Row: {
          id: string;
          product_id: string;
          image_url: string;
          alt_text: string;
          image_type: ProductImageType;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          image_url: string;
          alt_text: string;
          image_type?: ProductImageType;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          image_url?: string;
          alt_text?: string;
          image_type?: ProductImageType;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      product_variants: {
        Row: {
          id: string;
          product_id: string;
          name: string;
          sku: string;
          price: number;
          stock_quantity: number;
          attributes: Json;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          name: string;
          sku: string;
          price: number;
          stock_quantity?: number;
          attributes?: Json;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          name?: string;
          sku?: string;
          price?: number;
          stock_quantity?: number;
          attributes?: Json;
          is_active?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      product_collections: {
        Row: {
          product_id: string;
          collection_id: string;
        };
        Insert: {
          product_id: string;
          collection_id: string;
        };
        Update: {
          product_id?: string;
          collection_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "product_collections_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "product_collections_collection_id_fkey";
            columns: ["collection_id"];
            isOneToOne: false;
            referencedRelation: "collections";
            referencedColumns: ["id"];
          },
        ];
      };
      wishlists: {
        Row: {
          id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      wishlist_items: {
        Row: {
          id: string;
          wishlist_id: string;
          product_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          wishlist_id: string;
          product_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          wishlist_id?: string;
          product_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "wishlist_items_wishlist_id_fkey";
            columns: ["wishlist_id"];
            isOneToOne: false;
            referencedRelation: "wishlists";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "wishlist_items_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      cart_items: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          variant_id: string | null;
          quantity: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          product_id: string;
          variant_id?: string | null;
          quantity: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          product_id?: string;
          variant_id?: string | null;
          quantity?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "cart_items_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "cart_items_variant_id_fkey";
            columns: ["variant_id"];
            isOneToOne: false;
            referencedRelation: "product_variants";
            referencedColumns: ["id"];
          },
        ];
      };
      orders: {
        Row: {
          id: string;
          order_number: string;
          user_id: string | null;
          customer_email: string;
          customer_name: string;
          customer_phone: string;
          subtotal: number;
          discount_amount: number;
          shipping_amount: number;
          total_amount: number;
          currency: string;
          payment_status: PaymentStatus;
          fulfilment_status: FulfilmentStatus;
          shipping_address: Json;
          shipping_method: string;
          coupon_code: string | null;
          status_history: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_number: string;
          user_id?: string | null;
          customer_email: string;
          customer_name: string;
          customer_phone: string;
          subtotal: number;
          discount_amount?: number;
          shipping_amount?: number;
          total_amount: number;
          currency?: string;
          payment_status?: PaymentStatus;
          fulfilment_status?: FulfilmentStatus;
          shipping_address: Json;
          shipping_method?: string;
          coupon_code?: string | null;
          status_history?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          order_number?: string;
          user_id?: string | null;
          customer_email?: string;
          customer_name?: string;
          customer_phone?: string;
          subtotal?: number;
          discount_amount?: number;
          shipping_amount?: number;
          total_amount?: number;
          currency?: string;
          payment_status?: PaymentStatus;
          fulfilment_status?: FulfilmentStatus;
          shipping_address?: Json;
          shipping_method?: string;
          coupon_code?: string | null;
          status_history?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string | null;
          product_name_snapshot: string;
          sku_snapshot: string;
          unit_price: number;
          quantity: number;
          line_total: number;
          variant_snapshot: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id?: string | null;
          product_name_snapshot: string;
          sku_snapshot: string;
          unit_price: number;
          quantity: number;
          line_total: number;
          variant_snapshot?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string | null;
          product_name_snapshot?: string;
          sku_snapshot?: string;
          unit_price?: number;
          quantity?: number;
          line_total?: number;
          variant_snapshot?: Json | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
        ];
      };
      payments: {
        Row: {
          id: string;
          order_id: string;
          provider: string;
          provider_order_id: string;
          provider_payment_id: string | null;
          provider_signature: string | null;
          amount: number;
          currency: string;
          status: "created" | "authorized" | "captured" | "failed" | "refunded";
          raw_payload: Json | null;
          verified_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          provider?: string;
          provider_order_id: string;
          provider_payment_id?: string | null;
          provider_signature?: string | null;
          amount: number;
          currency?: string;
          status?: "created" | "authorized" | "captured" | "failed" | "refunded";
          raw_payload?: Json | null;
          verified_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          provider?: string;
          provider_order_id?: string;
          provider_payment_id?: string | null;
          provider_signature?: string | null;
          amount?: number;
          currency?: string;
          status?: "created" | "authorized" | "captured" | "failed" | "refunded";
          raw_payload?: Json | null;
          verified_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
        ];
      };
      webhook_events: {
        Row: {
          id: string;
          provider: string;
          event_id: string;
          event_type: string;
          payload: Json;
          processed_at: string;
        };
        Insert: {
          id?: string;
          provider: string;
          event_id: string;
          event_type: string;
          payload: Json;
          processed_at?: string;
        };
        Update: {
          id?: string;
          provider?: string;
          event_id?: string;
          event_type?: string;
          payload?: Json;
          processed_at?: string;
        };
        Relationships: [];
      };
      inventory_movements: {
        Row: {
          id: string;
          product_id: string;
          quantity_change: number;
          reason: string;
          reference_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          quantity_change: number;
          reason: string;
          reference_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          quantity_change?: number;
          reason?: string;
          reference_id?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "inventory_movements_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      newsletter_subscribers: {
        Row: {
          id: string;
          email: string;
          status: "active" | "unsubscribed";
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          status?: "active" | "unsubscribed";
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          status?: "active" | "unsubscribed";
          created_at?: string;
        };
        Relationships: [];
      };
      store_settings: {
        Row: {
          key: string;
          value: Json;
          updated_at: string;
        };
        Insert: {
          key: string;
          value: Json;
          updated_at?: string;
        };
        Update: {
          key?: string;
          value?: Json;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      reserve_inventory_for_order: {
        Args: {
          p_order_id: string;
          p_items: Json;
        };
        Returns: undefined;
      };
      release_inventory_for_order: {
        Args: {
          p_order_id: string;
        };
        Returns: undefined;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
