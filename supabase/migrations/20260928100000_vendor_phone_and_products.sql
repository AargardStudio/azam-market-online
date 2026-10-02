-- =========================================================================
-- Azam Market Online — 16: Vendor phone number + products-sold summary
-- =========================================================================
-- Adds two more public-safe fields collected on the new dedicated vendor
-- registration page: a direct phone number (kept separate from WhatsApp,
-- since many stalls use a different line for calls) and a short, free-text
-- summary of what the stall sells, captured at signup time -- before the
-- vendor has logged in to use the full Product Manager (up to 10 priced
-- listings, added post-approval).

alter table vendors
  add column if not exists phone             text,
  add column if not exists products_offered  text;
