-- Master admins may create directory-only stalls before the owner has an
-- email/login. Public self-registration still requires an email in the app.
alter table public.vendors
  alter column email drop not null;
