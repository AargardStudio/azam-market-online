# Azam Market Online — Supabase migrations

10 migration files, meant to be run in order (they're timestamp-prefixed so
`supabase db push` / the Supabase Dashboard SQL editor will apply them
correctly either way).

| File | Contents |
|---|---|
| `20260926230000_extensions_and_enums.sql` | `pgcrypto` + every enum type used below |
| `20260926230100_reference_tables.sql` | `markets`, `categories`, `subscription_tiers`, `payment_gateways` |
| `20260926230200_vendors_and_catalog.sql` | `vendors`, `vendor_categories`, `products`, `catalogues`, `shop_customizations` |
| `20260926230300_engagement_and_admin.sql` | `inquiry_logs`, `admin_users`, `vendor_assistance_requests` |
| `20260926230400_payments.sql` | `payment_transactions` |
| `20260926230500_erp.sql` | `erp_config`, `erp_api_keys`, `erp_webhooks`, `erp_sync_logs` |
| `20260926230600_cms_content.sql` | `ceo_profile`, `aargard_updates`, `aargard_services` |
| `20260926230700_functions_and_triggers.sql` | `updated_at` triggers, live `categories.vendor_count`, auto-create blank `shop_customizations` on vendor signup |
| `20260926230800_row_level_security.sql` | RLS on every table — this is the important one, read it |
| `20260926230900_seed_reference_data.sql` | Real config data only (tiers, gateways, the one market, 8 fabric categories) — **no demo vendors** |

## How to run

**Supabase CLI (recommended):**
```bash
supabase link --project-ref <your-project-ref>
supabase db push
```

**Or paste each file in order into the Supabase Dashboard → SQL Editor.**

## Design decisions worth knowing about

- **Types map 1:1 to `src/types.ts`.** Every interface in there has a matching
  table/enum. `ShopCustomization`'s nested objects (`whatsapp_button`,
  `bank_details`, `faqs`, `blocks[]`, etc.) are stored as `jsonb` columns
  rather than exploded into dozens of columns — that shape is genuinely
  variable and the app already treats it as a blob.

- **`erp_config` and `ceo_profile` are singleton tables** (`id boolean
  primary key default true check (id)`), matching how the current prototype
  uses one global config object instead of a real per-tenant row.

- **RLS is real, not decorative.** Public/anon can only read `active`
  vendors and `published` content. A vendor can only touch rows where
  `vendors.user_id = auth.uid()`. Admin access is gated through an
  `admin_users` table + `is_admin()` helper, not a hardcoded email/password
  like the current mock login.

- **`erp_api_keys.token_hash` / `erp_webhooks.secret` are service-role-only**
  — no client policy touches those tables at all. Store a hash of the ERP
  token, never the raw value; verify by hashing the incoming request's
  bearer token server-side and comparing.

- **`payment_transactions` has no client INSERT policy on purpose.** The
  current prototype lets the browser `POST /api/payments/checkout` and
  immediately mark itself `completed` — that's fine for a demo, not for
  real money. Once you wire JazzCash/PayFast/Keenu/Stripe, transaction rows
  should be written by a trusted server (a Supabase Edge Function using the
  `service_role` key, which bypasses RLS) after the gateway confirms the
  payment, not by the browser.

- **Auth isn't scaffolded here on purpose.** `vendors.user_id` and
  `admin_users.user_id` both reference `auth.users(id)` and are ready to
  wire up, but which Supabase Auth method you use (email/password, email
  OTP for the vendor "magic link" flow, phone OTP for CNIC-linked login,
  etc.) is a product decision — happy to add that migration once you pick
  one.

## Not covered here (needs a decision from you first)

- Storage buckets for logos/covers/PDF catalogues (`storage.buckets` +
  policies) — straightforward to add, just say the word.
- Realtime subscriptions for the admin dashboard's live metrics.
- Which Supabase Auth flow to use for vendor/admin login (see above).
