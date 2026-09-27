-- =========================================================================
-- Azam Market Online — 05: Payment transactions
-- =========================================================================
-- NOTE: The prototype's /api/payments/checkout endpoint fabricates a
-- 'completed' transaction locally with no real gateway call. When you wire
-- real JazzCash / PayFast(1Link) / Keenu / Stripe rails, transactions should
-- be INSERTed only by a trusted server (edge function / service role),
-- never directly by the client — see RLS policies in migration 09.

create table payment_transactions (
  id                       uuid primary key default gen_random_uuid(),
  vendor_id                uuid references vendors(id) on delete set null,
  vendor_name              text,
  gateway                  payment_gateway_id not null references payment_gateways(id),
  amount_pkr               numeric(12, 2) not null,
  purpose                  payment_purpose not null,
  status                   payment_status not null default 'pending',
  reference_id             text not null unique,
  payer_name               text,
  payer_contact            text,
  payment_method_detail    text,
  tier_id                  text references subscription_tiers(id),
  notes                    text,
  created_at               timestamptz not null default now()
);

create index idx_payment_tx_vendor_id on payment_transactions (vendor_id);
create index idx_payment_tx_status on payment_transactions (status);
create index idx_payment_tx_created_at on payment_transactions (created_at);
