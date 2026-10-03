-- Temporarily pause new sign-ups to the Premium tier. Existing Premium
-- vendors (if any) are unaffected -- this only hides it from pickers.
alter table subscription_tiers
  add column if not exists is_available boolean not null default true;

update subscription_tiers set is_available = false where id = 't-premium';
