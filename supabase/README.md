# Supabase Database Integration Plan — Drapes of Cotton

This directory houses the database schema migrations and seed scripts for **Drapes of Cotton**.

## Stage 1 Status
- Supabase SSR (`@supabase/ssr`) and JS SDK (`@supabase/supabase-js`) clients are wired in `src/lib/supabase/`.
- Database types live in `src/types/database.types.ts` (placeholder schema in Stage 1; replace with generated types via `supabase gen types typescript` in Stage 2).
- Row Level Security (RLS) will be enabled on **all** tables from day one. Never disable RLS in production or migrations.

## Planned Stage 2 Domain Tables
1. `collections` — Curated saree edits (e.g., Chettinad, Mangalgiri, Bengal Tant, Jamdani, Pochampally).
2. `products` — Saree catalog items with weave metadata, cotton count, length, blouse piece details, pricing in INR paise, and stock counts.
3. `product_images` — Ordered editorial and drape gallery assets stored in Supabase Storage.
4. `customers` — Extended profile linked 1:1 with `auth.users`.
5. `addresses` — Customer shipping/billing addresses (Indian PIN code & GST/state fields).
6. `orders` — Order header records with server-verified totals and status lifecycle.
7. `order_items` — Immutable line-item snapshots at time of purchase.
8. `payments` — Razorpay order ID, payment ID, signature verification audit, and webhook event log.
9. `inventory_movements` — Stock reservation and decrement audit trail.

## Planned Storage Buckets
- `products` (public read, admin write)
- `collections` (public read, admin write)
- `editorial` (public read, admin write)
