-- Move to USD-based tier pricing to match the Stripe Payment Links:
-- Standard = $5/mo, Premium = $20/mo, Basic stays free.
-- price_pkr is kept as an approximate local-currency display only
-- (not what Stripe actually charges) -- adjust if the PKR/USD rate moves.

alter table subscription_tiers
  add column if not exists price_usd numeric not null default 0,
  add column if not exists stripe_payment_link text;

update subscription_tiers set price_usd = 0,  price_pkr = 0    where id = 't-basic';
update subscription_tiers set price_usd = 5,  price_pkr = 1400 where id = 't-standard';
update subscription_tiers set price_usd = 20, price_pkr = 5600 where id = 't-premium';

-- Paste each tier's own Stripe Payment Link URL here once created in the
-- Stripe Dashboard (Products > Payment Links). Leaving these null falls
-- back to the single VITE_STRIPE_PAYMENT_LINK env var for every paid tier.
-- update subscription_tiers set stripe_payment_link = 'https://buy.stripe.com/xxxxx' where id = 't-standard';
-- update subscription_tiers set stripe_payment_link = 'https://buy.stripe.com/yyyyy' where id = 't-premium';
