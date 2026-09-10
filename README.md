# Cakes n' Shapes

## Database setup

The project uses Supabase Postgres for the first database adapter. The application code depends on repository contracts in `lib/data/contracts.ts`, so a future Postgres provider can replace `lib/data/supabase.ts` without changing the storefront or checkout UI.

1. Create a free Supabase project.
2. In Supabase SQL Editor, run `supabase/migrations/202609100001_initial_schema.sql`.
3. Run `supabase/seed.sql` to load the initial catalog and prices.
4. Copy `.env.example` to `.env.local` and fill in the Supabase values.
5. Start the app with `npm run dev`.

## Admin access

Create an email/password user in **Supabase → Authentication → Users**, copy that user's UUID, then run this SQL in the Supabase SQL Editor:

```sql
insert into public.admin_users (user_id, role)
values ('PASTE_AUTH_USER_UUID_HERE', 'admin');
```

The dashboard is available at `/admin`. Admin requests require a valid Supabase Auth session and a matching row in `public.admin_users`.

Required environment variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (the public key shown in the current Supabase dashboard)
- `SUPABASE_SECRET_KEY` (server-only; never expose this in client code)

If `SUPABASE_SECRET_KEY` is not visible in your dashboard, open **Project Settings → API Keys → Legacy API Keys** and use the `service_role` key as `SUPABASE_SERVICE_ROLE_KEY` instead. The app accepts both names. The publishable key is not a replacement for the server key in this implementation: order creation uses the server-only key so prices can be validated and orders can be written securely.

## Current database-backed flow

- `GET` catalog reads use the server-only repository when Supabase is configured.
- Product detail pages use stable product slugs and size labels.
- `POST /api/orders` validates customer/cart input, re-reads current catalog prices, creates a pending order and immutable item snapshots, and returns a WhatsApp message containing the order reference.
- Without Supabase environment variables, the storefront falls back to the local catalog so development remains available before database setup.

## Schema notes

Prices are stored as non-negative integer values in the currency unit used by the storefront. Order items copy product name, size, and price at order time so later catalog edits do not change historical orders. Feedback is unpublished by default and public settings are explicitly allow-listed with `is_public`.

Supabase RLS is enabled. Public reads are limited to active products, active sizes, published feedback, and public settings. Order writes use the server-only service role and should never be moved into client components.
