-- Lets specific vendors (e.g. the owner's own family business) stay live
-- in the directory forever without ever going through Stripe -- no trial
-- countdown, no "Subscribe" prompt, no payment required.

alter table vendors
  add column if not exists is_subscription_exempt boolean not null default false;

-- Exempt vendors count as "live" everywhere vendor_is_live() is checked,
-- regardless of subscription_status or trial_ends_at.
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
        v.is_subscription_exempt
        or v.subscription_status = 'active'
        or (v.subscription_status = 'trialing' and v.trial_ends_at > now())
      )
  );
$$;

drop policy if exists "vendors_public_read_active" on vendors;
create policy "vendors_public_read_active" on vendors
  for select using (
    (status = 'active' and (
      is_subscription_exempt
      or subscription_status = 'active'
      or (subscription_status = 'trialing' and trial_ends_at > now())
    ))
    or is_admin()
    or user_id = auth.uid()
  );

-- Mark the Yousef Jameel & Co. account exempt. If this vendor hasn't
-- registered yet, this simply matches 0 rows -- re-run it (or use the new
-- "Subscription Exempt" toggle in the admin Master Control panel) once
-- they do.
update vendors set is_subscription_exempt = true where email = 'yousafjameelandco@gmail.com';
