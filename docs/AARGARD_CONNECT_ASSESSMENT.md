# Aargard Connect V2.0 — Architecture Assessment & Plan (AMO)

Status: P001 (discovery) complete. No code, migrations or deployments made. Awaiting scope approval.

## 1. What AMO is today
- React 19 + Vite SPA, Supabase (Postgres + RLS + Auth), Vercel serverless functions.
- Vercel functions in `api/`: `mcp.ts` (agent/MCP control), `sitemap.ts`, `admin/create-vendor-user.ts`, `stripe/webhook.ts`.
- `server.ts` is a legacy Express dev server with in-memory data. It does NOT run on Vercel.
- Not present: rate limiting, structured logging, public API, API keys in use, webhook delivery, background jobs.

## 2. Reusable assets
| Asset | State | Verdict |
|---|---|---|
| `erp_config`, `erp_api_keys`, `erp_webhooks`, `erp_sync_logs` tables | Exist in Supabase, RLS service-role-only. Nothing in `src/` or `api/` reads or writes them. Admin ERP routes live only in `server.ts` (in-memory), so they do not work in production. | Reuse concept, but add new `connect_*` tables rather than bending ERP enums. `erp_webhooks.secret` is plaintext; Connect needs encrypted/hashed handling. |
| `api/mcp.ts` | Admin-level control with a single shared secret. | Keep separate. It is an operator tool, not a per-merchant API. |
| `inquiry_logs` (view, whatsapp, catalogue events) | Real data | Source for analytics and lead events. |
| Vendor/product/category/market/tier tables + `owns_vendor()` RLS helpers | Real | Source for merchant, product, catalogue endpoints. |
| Stripe webhook | Real | Source for subscription/entitlement state. |

## 3. Real capabilities AMO can expose (no invention)
Merchants (vendors/shops), products, categories, markets, catalogues (metadata), shop customization, inquiries/leads (WhatsApp clicks, views), analytics counts, subscription tier/trial state, onboarding.
AMO has NO orders, carts, customers or payments-between-buyers. Connect must not advertise those scopes.

## 4. Proposed design
Schema (new, additive, non-destructive): `connect_apps`, `connect_api_keys` (sha256 hash + prefix only, shown once), `connect_scopes` (static in code), `connect_webhook_endpoints`, `connect_webhook_deliveries`, `connect_audit_log`, `connect_rate_buckets`.
Endpoints under `/api/connect/v1` (one Vercel function with a router): `health`, `capabilities`, `merchants`, `products`, `categories`, `markets`, `inquiries`, `analytics/summary`, `webhooks`.
Auth: `Authorization: Bearer amo_live_...` -> hash lookup -> scope check -> vendor-scoped (a key can only see the vendor it was issued for; platform keys are admin-only).
Rate limiting: Postgres counter per key per minute (Vercel functions are stateless).
Webhooks: HMAC-SHA256 signed, retry via a Vercel Cron route (needs cron enabled); deliveries logged.
UI: new "API & Integrations" section in the vendor dashboard (keys, webhooks, logs, docs, prompt generator, health checks) and an admin overview.
Prompt generator: placeholders only, never real keys.

## 5. Phase plan (P002–P015)
P002 schema + RLS · P003 key service · P004 auth/scopes · P005 rate limit + audit · P006 read endpoints · P007 write endpoints (products, customization) · P008 webhooks + delivery · P009 vendor UI · P010 admin UI · P011 docs page + OpenAPI JSON · P012 prompt generator · P013 health/diagnostics · P014 tests · P015 handover + migration notes.

## 6. Risks / blockers
- Aargard Connect Core does not exist. Capability/manifest endpoints will follow the spec shape but cross-app interoperability is UNVERIFIED and will be labelled so.
- Webhook retries need Vercel Cron (plan-dependent).
- No sandbox/test mode data separation exists; a `test` key type can only return clearly-labelled sample data.
- Legacy `server.ts` ERP routes should be left alone or retired, not extended.
- Migrations are applied by the owner in the Supabase SQL editor; nothing auto-runs.

## 7. Decisions needed
1. Scope: all of P002–P015, or core only (keys, read API, webhooks, vendor UI)?
2. Who gets API access: all paid vendors, $5 tier and above, or admin-granted only?
3. Write endpoints in v1, or read-only first?
4. Vercel Cron available on your plan for webhook retries?
