# Drapes of Cotton — Curated Cotton Sarees Storefront

A full-stack Next.js 16, Supabase (PostgreSQL + Auth + Storage + SSR), and Razorpay e-commerce platform for **Drapes of Cotton**.

---

## Tech Stack
- **Frontend**: Next.js 16.4 (App Router, Turbopack, Cache Components), React 19.3, TypeScript, Tailwind CSS v4, shadcn/ui (Radix UI), Lucide icons, Motion
- **Backend & Database**: Next.js Route Handlers, Supabase PostgreSQL with Row Level Security (RLS), Supabase Auth, Supabase Storage
- **Payments**: Razorpay Standard Web Checkout with server-side HMAC-SHA256 verification and idempotent webhook processing
- **State & Forms**: Zustand (`cart` & `wishlist`), React Hook Form + Zod

---

## Local Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment variables**
   Copy `.env.example` to `.env.local` and supply your real credentials:
   ```env
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   SUPABASE_SERVICE_ROLE_KEY=
   NEXT_PUBLIC_RAZORPAY_KEY_ID=
   RAZORPAY_KEY_SECRET=
   RAZORPAY_WEBHOOK_SECRET=
   ```
   > Never expose `SUPABASE_SERVICE_ROLE_KEY`, `RAZORPAY_KEY_SECRET`, or `RAZORPAY_WEBHOOK_SECRET` in `NEXT_PUBLIC_*` variables.

3. **Apply Supabase migrations & seed data**
   Run the SQL files in order inside the Supabase SQL Editor (or via `supabase db push`):
   - `supabase/migrations/0001_initial_schema.sql`
   - `supabase/migrations/0002_rls_and_functions.sql`
   - `supabase/seed.sql` *(optional demonstration saree catalog)*

4. **Create the first Administrator account**
   - Sign up normally at `/register`.
   - In the Supabase Dashboard SQL Editor (running as privileged postgres role), promote that user to `admin`:
     ```sql
     update public.profiles
     set role = 'admin'
     where id = '<YOUR_AUTH_USER_UUID>';
     ```
   *(Direct self-promotion via the client API is blocked by the `trg_protect_profile_role` database trigger.)*

5. **Configure Razorpay Webhooks**
   Point a Razorpay webhook to `https://<your-domain>/api/webhooks/razorpay` for events `payment.captured`, `order.paid`, and `payment.failed` using `RAZORPAY_WEBHOOK_SECRET`.

6. **Run development & verification**
   ```bash
   npm run dev
   npm run lint
   npm run build
   node --test tests/storefront.test.mjs
   ```

---

## Brand Assets
Place the official logo files in `/public/images/brand/logo.svg` or `/public/images/brand/logo.png`. Until supplied, `BrandLogo` renders a configurable editorial lockup.

## Vercel Deployment
1. Push the repository to GitHub.
2. Import the project in Vercel.
3. Configure all environment variables from `.env.example` in Vercel Project Settings (setting `NEXT_PUBLIC_APP_URL` to your production URL).
4. Deploy.
