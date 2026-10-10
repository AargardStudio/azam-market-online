-- Enforce the 30-day free trial server-side.
-- * New vendors (self-registered) always start 'trialing' with a 30-day trial,
--   never exempt, regardless of what the client sends.
-- * Only admins (or the service role: Stripe webhook / SQL editor) can change
--   subscription_status, trial_ends_at, is_subscription_exempt or Stripe ids.
--   Vendors editing their own shop can no longer extend their own trial.
-- * Admins extend a trial by setting trial_ends_at (Master Control > Trial).

create or replace function guard_vendor_subscription_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Service role / SQL editor: auth.uid() is null -> allow everything.
  if auth.uid() is null or is_admin() then
    return new;
  end if;

  if tg_op = 'INSERT' then
    new.subscription_status := 'trialing';
    new.trial_ends_at := now() + interval '30 days';
    new.is_subscription_exempt := false;
    new.stripe_customer_id := null;
    new.stripe_subscription_id := null;
  else
    new.subscription_status := old.subscription_status;
    new.trial_ends_at := old.trial_ends_at;
    new.is_subscription_exempt := old.is_subscription_exempt;
    new.stripe_customer_id := old.stripe_customer_id;
    new.stripe_subscription_id := old.stripe_subscription_id;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_guard_vendor_subscription_fields on vendors;
create trigger trg_guard_vendor_subscription_fields
  before insert or update on vendors
  for each row execute function guard_vendor_subscription_fields();
