-- =========================================================================
-- Azam Market Online — 16: fix shop_customizations auto-create trigger
-- =========================================================================
-- trg_vendors_create_customization() (migration 07) runs as whatever role
-- inserted the vendor row, and its insert into shop_customizations is
-- subject to that table's RLS ("owns_vendor(vendor_id) or is_admin()",
-- migration 09). For a brand-new, still-unclaimed vendor row (user_id is
-- null -- the state every self-signup row is in until the vendor clicks
-- their magic-link email), owns_vendor() is false and is_admin() is false,
-- so the trigger's own insert gets blocked by RLS -- which rolls back the
-- ENTIRE vendor insert, not just the customization row. Any anonymous
-- "submit a pending stall for approval" insert has been silently failing
-- because of this.
--
-- Fix: mark the trigger function SECURITY DEFINER (like is_admin(),
-- owns_vendor(), and bump_inquiry_counters() already are) so it can
-- always write its own bookkeeping row, regardless of who triggered it.
-- It only ever inserts a blank scaffold row keyed to the new vendor's id
-- -- it exposes nothing and can't be abused to write arbitrary data.

create or replace function trg_vendors_create_customization()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into shop_customizations (vendor_id)
  values (new.id)
  on conflict (vendor_id) do nothing;
  return new;
end;
$$;
