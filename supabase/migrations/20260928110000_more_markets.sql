-- =========================================================================
-- Azam Market Online — 17: More Lahore/Rawalpindi wholesale cloth markets
-- =========================================================================
-- Registration previously only ever created vendors under the single
-- seeded "Azam Cloth Market" market. This adds three more real wholesale
-- cloth markets so a vendor can pick the one they actually trade in on
-- the registration page. Azam Cloth Market itself is re-asserted here too
-- (idempotent via on conflict) so this migration alone is enough to seed
-- all four markets on a fresh database, even if migration 10's seed was
-- skipped.

insert into markets (name, slug, city, country, is_active) values
  ('Azam Cloth Market',      'azam-cloth-market',      'Lahore',     'Pakistan', true),
  ('Ichhra',                 'ichhra',                 'Lahore',     'Pakistan', true),
  ('Shah Alam Market',       'shah-alam-market',       'Lahore',     'Pakistan', true),
  ('Raja Bazar',             'raja-bazar-rawalpindi',  'Rawalpindi', 'Pakistan', true)
on conflict (slug) do nothing;
