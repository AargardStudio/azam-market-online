-- =========================================================================
-- Azam Market Online — 10: Seed reference data
-- =========================================================================
-- Only real configuration/lookup data — no demo vendors, products, or fake
-- transactions. Idempotent via ON CONFLICT, safe to re-run.

insert into markets (name, slug, city, country, is_active) values
  ('Azam Cloth Market', 'azam-cloth-market', 'Lahore', 'Pakistan', true)
on conflict (slug) do nothing;

insert into subscription_tiers
  (id, name, display_name, price_pkr, max_products, max_catalogues, has_analytics, has_verified_badge, has_featured_placement)
values
  ('t-basic',    'basic',    'Basic',    0,     15, 1,  false, false, false),
  ('t-standard', 'standard', 'Standard', 2500,  60, 5,  true,  true,  false),
  ('t-premium',  'premium',  'Premium',  6000,  -1, -1, true,  true,  true)
on conflict (id) do nothing;

insert into payment_gateways
  (id, name, subtitle, badge, is_enabled, is_sandbox, supported_methods, settlement_currency, color)
values
  ('jazzcash', 'JazzCash', 'Mobile Wallet & OTC', 'Popular',
   true, true, array['Mobile Account', 'CNIC USSD Approval', 'OTC Retail Voucher', 'PayPak Debit'], 'PKR', '#DA1F2B'),
  ('payfast', 'PayFast (1Link)', 'Interbank Settlement', 'Bank Rail',
   true, true, array['1Link Interbank Transfer', 'Debit Card'], 'PKR', '#0F5C3A'),
  ('keenu', 'Keenu NetConnect', 'Digital Wallet', null,
   true, true, array['Keenu Wallet'], 'PKR', '#1B2A4A'),
  ('stripe', 'Stripe', 'International Cards', 'Diaspora',
   false, true, array['Visa', 'Mastercard', 'Amex'], 'USD', '#635BFF')
on conflict (id) do nothing;

-- Fabric categories relevant to Azam Cloth Market. market_id is looked up
-- rather than hardcoded, since UUIDs are generated at insert time.
with m as (select id from markets where slug = 'azam-cloth-market')
insert into categories (name, slug, icon, market_id)
select v.name, v.slug, v.icon, m.id
from m, (values
  ('Lawn',     'lawn',     'shirt'),
  ('Cotton',   'cotton',   'layers'),
  ('Chiffon',  'chiffon',  'wind'),
  ('Khaddar',  'khaddar',  'square'),
  ('Silk',     'silk',     'sparkles'),
  ('Boski',    'boski',    'gem'),
  ('Bridal',   'bridal',   'heart'),
  ('Jacquard', 'jacquard', 'grid')
) as v(name, slug, icon)
on conflict (slug) do nothing;
