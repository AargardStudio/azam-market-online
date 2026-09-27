-- =========================================================================
-- Azam Market Online — 13: allow admins to onboard vendors as active
-- =========================================================================
-- vendors_public_insert_onboarding (migration 09) only allowed inserting a
-- vendor row with status = 'pending', for the public self-serve onboarding
-- flow. But the Aargard admin "Onboard New Vendor" form creates a stall
-- that should go live immediately (status = 'active'), and admins need
-- that path too. Replace the policy with one that also allows is_admin().

drop policy if exists "vendors_public_insert_onboarding" on vendors;

create policy "vendors_insert_onboarding" on vendors
  for insert with check (status = 'pending' or is_admin());
