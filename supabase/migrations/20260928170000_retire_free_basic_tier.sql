-- No more free plan: only Standard ($5/mo) and Premium ($20/mo, currently
-- paused) exist as real sign-up options now. Basic is retired, not
-- deleted -- the row stays for referential integrity (existing/legacy
-- vendors, foreign keys) but is hidden from every tier picker.
update subscription_tiers set is_available = false where id = 't-basic';

-- New vendors (admin onboarding, magic-link self-signup, local-dev server)
-- should land on Standard by default now, never the retired free tier.
alter table vendors alter column tier_id set default 't-standard';
