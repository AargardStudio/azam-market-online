-- =========================================================================
-- Azam Market Online — 15: Vendor self-signup fields
-- =========================================================================
-- Adds the fields collected on the public "Register My Stall" form:
-- shop address, social/marketplace links, and (in a separate, tightly
-- locked table) CNIC + NTN.
--
-- CNIC (Pakistan's national ID number) and NTN (tax number) are sensitive
-- government-ID-adjacent data. They must never be readable by the public
-- directory or by other vendors, so they live in their own table with its
-- own RLS -- not as columns on `vendors`, which is broadly public-readable
-- for active shops. Only the owning vendor (once their account is linked)
-- or an admin can ever read a row here.

-- ---------------------------------------------------------- vendors: public-safe extra fields
alter table vendors
  add column if not exists shop_address  text,
  add column if not exists instagram_url text,
  add column if not exists tiktok_url    text,
  add column if not exists google_url    text; -- Google Maps / Business Profile link

-- Helper: is this vendor row still pending approval AND not yet linked to
-- any auth account? Used below to let an anonymous signup submit
-- vendor_categories/vendor_verification rows for the vendor it JUST
-- created in the same request. It has to be SECURITY DEFINER -- a plain
-- "exists (select 1 from vendors ...)" inline in a policy would itself be
-- filtered by vendors' own RLS for the calling (anon) role, which can't
-- see a pending row at all (vendors_public_read_active only allows
-- status='active', is_admin(), or user_id = auth.uid()), so the check
-- would silently always evaluate false without this.
create or replace function vendor_is_pending_unclaimed(p_vendor_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from vendors v
    where v.id = p_vendor_id
      and v.status = 'pending'
      and v.user_id is null
  );
$$;

-- ---------------------------------------------------------------- vendor_verification
create table if not exists vendor_verification (
  vendor_id   uuid primary key references vendors(id) on delete cascade,
  cnic        text,
  ntn         text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger trg_vendor_verification_updated_at
  before update on vendor_verification
  for each row execute function set_updated_at();

alter table vendor_verification enable row level security;

-- Owner (once linked) and admin can read/write.
create policy "vendor_verification_owner_rw" on vendor_verification
  for all using (owns_vendor(vendor_id) or is_admin())
  with check (owns_vendor(vendor_id) or is_admin());

-- The public self-signup form submits CNIC/NTN for a vendor row that was
-- *just* created in this same request and has no user_id yet (it isn't
-- "owned" by anyone until the vendor clicks their magic-link email and
-- App.tsx's auth bridge links user_id -- see migration 13's equivalent
-- exception on vendors_insert_onboarding). This policy only ever matches
-- a still-unclaimed pending row, never an active/claimed one.
create policy "vendor_verification_pending_signup_insert" on vendor_verification
  for insert with check (vendor_is_pending_unclaimed(vendor_id));

-- Same unclaimed-pending exception for vendor_categories, so the signup
-- form can also assign the vendor's chosen fabric categories in the same
-- request (migration 09's "vendor_categories_owner_write" only covers an
-- already-linked owner or an admin).
create policy "vendor_categories_pending_signup_insert" on vendor_categories
  for insert with check (vendor_is_pending_unclaimed(vendor_id));
