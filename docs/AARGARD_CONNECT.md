# Aargard Connect V2.0 — Handover

Admin-only API and webhook layer for controlling Azam Market Online from Claude, ChatGPT or your own tools.
Vendors have no access. Manage everything in **Admin panel -> More -> API & Integrations**.

## Setup (once)
1. Supabase SQL Editor (project `uopyehebqdlddcjykxwu`): run `supabase/migrations/20261027120000_aargard_connect.sql`. It only adds `connect_*` tables, two helper functions and three event triggers.
2. Vercel env var: `CRON_SECRET` = any long random string (Vercel Cron sends it as a bearer token).
3. `git push origin main`, then open the admin tab, **Health -> Run checks**.

## Parts
| Piece | File |
|---|---|
| Public API `/api/connect/v1/*` | `api/connect.ts` (+ `api/_connect/lib.ts`, `openapi.ts`) |
| Admin screen backend | `api/connect-manage.ts` (Supabase admin session required) |
| Webhook retries + cleanup | `api/connect-cron.ts`, every 5 min via `vercel.json` |
| Admin UI | `src/components/admin/ApiIntegrationsCenter.tsx` |
| Tests | `tests/connect.test.ts` (`npx tsx tests/connect.test.ts`) |

## Security model
- Keys look like `amo_live_...`, shown once, stored as SHA-256 only. Revocable, optional expiry, per-key rate limit (Postgres counter).
- Scopes are enforced per route. Test keys are read-only. No hard deletes exist in the API.
- Webhooks: HTTPS public hosts only (private/loopback/metadata IPs refused, redirects not followed), HMAC-SHA256 signed, 5s timeout, 6 attempts with back-off (1m, 5m, 30m, 2h, 12h).
- Tables have RLS on with no policies: only the serverless functions (service role) can touch them.
- Webhook signing secrets must be readable server-side to sign, so they are stored in plain text in a service-role-only table.
- Vendor Stripe ids and `user_id` are stripped from API output. Request log keeps a hashed IP, 30 days.

## Limits and honesty notes
- No orders, customers or carts exist in AMO, so none are offered.
- Aargard Connect Core does not exist; nothing here claims cross-app interoperability.
- `api/mcp.ts` is unchanged and separate (operator tool for Claude/ChatGPT connectors).
- The authenticated endpoints and webhook delivery are untested against a live database until the migration is run; unit tests cover key generation, signing, the SSRF guard, routing, and 401/OPTIONS/health/openapi responses.
- The existing `erp_*` tables and `server.ts` ERP routes are untouched and unused.
