# AMO control connector (MCP) — setup

A remote MCP server lives at `api/mcp.ts` and is served by your existing Vercel project.
Once connected, you can say things like *"suspend Minsa Boutique"*, *"extend Alkaram's trial by 30 days"*,
*"change the footer phone number"* in Claude or ChatGPT (chat or cowork) and it gets done.

## 1. Create two tokens
1. **GitHub** → Settings → Developer settings → Fine-grained tokens → new token.
   Repository access: only `AargardStudio/azam-market-online`.
   Permissions: Contents **Read & write**, Metadata **Read**, Commit statuses **Read**, Checks **Read**.
2. **Supabase** (optional, enables `run_sql`) → Account → Access Tokens → generate.

## 2. Add Vercel environment variables (Production)
| Name | Value |
|---|---|
| `AMO_MCP_SECRET` | a long random string (40+ chars), e.g. from a password manager |
| `GITHUB_TOKEN` | the GitHub token |
| `SUPABASE_ACCESS_TOKEN` | the Supabase token (optional) |

`SUPABASE_SERVICE_ROLE_KEY` and `VITE_SUPABASE_URL` are already set. Redeploy after adding.

## 3. Connect
Connector URL: `https://<your-domain>/mcp/<AMO_MCP_SECRET>`
- **Claude**: Settings → Connectors → Add custom connector → paste URL (no auth).
- **ChatGPT**: Settings → Connectors → Developer mode → Create → paste URL, authentication: none.

Treat the URL like a password. To rotate it, change `AMO_MCP_SECRET` in Vercel and re-add the connector.

## How changes reach the live site
- Code edits (`edit_file`, `write_file`) are committed to the branch **`claude-changes`**, not to `main`.
- `changes_status` shows the diff and whether the Vercel preview build passed.
- `deploy` merges into `main` (Vercel redeploys) and **refuses if the build failed or is still running**.
- `discard_changes` throws away everything pending.
- Database changes are separate: vendor tools (`update_vendor`, `extend_trial`, …) apply immediately;
  `run_sql` is read-only unless `allow_write` is set.

## Tools
Code: `list_files`, `read_file`, `search_code`, `edit_file`, `write_file`, `delete_file`, `changes_status`, `deploy`, `discard_changes`.
Shops: `create_shop` (optionally with owner login), `approve_vendor`, `suspend_vendor`, `delete_vendor`, `create_vendor_login`, `update_vendor`, `extend_trial`, `customize_shop` (colours, hero layout, headline, announcement, FAQs…), `list_vendors`, `get_vendor`.
Products: `list_products`, `add_product`, `update_product`, `delete_product`.
Platform: `add_category`, `add_market`, `update_tier`, `platform_stats`, `run_sql`.

Homepage sections (Live Prices, Services collage, footer text, etc.) are part of the code, so changing them goes through
`edit_file` → `changes_status` → `deploy`.
