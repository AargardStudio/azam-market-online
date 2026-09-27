-- =========================================================================
-- Azam Market Online — 11: Subscription trial & Stripe gating
-- =========================================================================
-- Every new vendor gets a 30-day free trial. After the trial ends, a stall
-- stays hidden from the public directory (and its products/catalogues/
-- customization stay hidden with it) until subscription_status is flipped
-- to 'active' — which the Stripe webhook does once $5/month checkout
-- completes. The vendor's own dashboard is unaffected: an owner can always
-- see and edit their own shop (see vendors_public_read_active below),
-- so they can find their way to the "Subscribe" button even after expiry.

alter table vendors
  add column subscription_status text not null default 'trialing'
    check (subscription_status in ('trialing', 'active', 'past_due', 'canceled')),
  add column trial_ends_at timestamptz not null default (now() + interval '30 days'),
  add column stripe_customer_id text,
  add column stripe_subscription_id text;

create index idx_vendors_subscription_status on vendors (subscription_status);
create unique index idx_vendors_stripe_customer_id on vendors (stripe_customer_id) where stripe_customer_id is not null;
create unique index idx_vendors_stripe_subscription_id on vendors (stripe_subscription_id) where stripe_subscription_id is not null;

-- True once a vendor is both approved (status='active') AND currently
-- entitled to be visible — either still inside their free trial, or paying.
create or replace function vendor_is_live(p_vendor_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from vendors v
    where v.id = p_vendor_id
      and v.status = 'active'
      and (
        v.subscription_status = 'active'
        or (v.subscription_status = 'trialing' and v.trial_ends_at > now())
      )
  );
$$;

-- Replace the public read policies that previously only checked
-- status = 'active' so they also require the subscription/trial gate.
-- Owners and admins are unaffected (they can always see their own shop).

drop policy if exists "vendors_public_read_active" on vendors;
create policy "vendors_public_read_active" on vendors
  for select using (
    (status = 'active' and (
      subscription_status = 'active'
      or (subscription_status = 'trialing' and trial_ends_at > now())
    ))
    or is_admin()
    or user_id = auth.uid()
  );

drop policy if exists "products_public_read" on products;
create policy "products_public_read" on products
  for select using (
    (is_active and vendor_is_live(vendor_id))
    or owns_vendor(vendor_id)
    or is_admin()
  );

drop policy if exists "catalogues_public_read" on catalogues;
create policy "catalogues_public_read" on catalogues
  for select using (
    (is_active and vendor_is_live(vendor_id))
    or owns_vendor(vendor_id)
    or is_admin()
  );

drop policy if exists "shop_customizations_public_read" on shop_customizations;
create policy "shop_customizations_public_read" on shop_customizations
  for select using (
    (is_published and vendor_is_live(vendor_id))
    or owns_vendor(vendor_id)
    or is_admin()
  );

-- Stripe webhook writes (customer id, subscription id, subscription_status)
-- happen server-side with the service_role key, which bypasses RLS, so no
-- extra policy is needed for that. Owners can still update their own row
-- via the existing "vendors_owner_update" policy (e.g. editing shop info),
-- but should not be able to set their own subscription fields directly —
-- enforce that at the application layer (the vendor dashboard never sends
-- these columns in its update payloads).
