-- =========================================================================
-- Azam Market Online — 17: More Lahore/Rawalpindi wholesale cloth markets
-- =========================================================================
-- Registration previously only ever created vendors under the single
-- seeded "Azam Cloth Market" market. This adds three more real wholesale
-- cloth markets so a vendor can pick the one they actually trade in on
-- the registration page.

insert into markets (name, slug, city, country, is_active) values
  ('Ichhra',                 'ichhra',                 'Lahore',     'Pakistan', true),
  ('Shah Alam Market',       'shah-alam-market',       'Lahore',     'Pakistan', true),
  ('Raja Bazar',             'raja-bazar-rawalpindi',  'Rawalpindi', 'Pakistan', true)
on conflict (slug) do nothing;
