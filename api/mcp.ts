// AMO control MCP server (Vercel Serverless Function, Streamable-HTTP, stateless).
//
// Lets Claude / ChatGPT (chat or cowork) manage Azam Market Online directly:
//   * CODE  - read/search/edit files in the GitHub repo. Edits are committed to a
//             work branch (default "claude-changes"), never straight to main.
//             `changes_status` shows the diff + Vercel preview build result and
//             `deploy` merges to main (only if the build passed) -> Vercel redeploys.
//   * DATA  - list/update vendors, extend trials, stats, and run SQL.
//
// Auth: the connector URL contains a secret:  https://<site>/mcp/<AMO_MCP_SECRET>
// (vercel.json rewrites /mcp/:key -> /api/mcp?key=:key). Anyone with that URL can
// operate the app, so treat it like a password and rotate it by changing the env var.
//
// Required env vars (Vercel -> Settings -> Environment Variables):
//   AMO_MCP_SECRET            long random string (the URL secret)
//   GITHUB_TOKEN              fine-grained PAT, this repo only: Contents RW, Metadata R,
//                             Commit statuses R, Checks R
//   SUPABASE_SERVICE_ROLE_KEY already set (used for vendor tools)
//   VITE_SUPABASE_URL         already set
// Optional:
//   SUPABASE_ACCESS_TOKEN     Supabase personal access token -> enables run_sql
//   GITHUB_REPO               default AargardStudio/azam-market-online
//   GITHUB_BASE_BRANCH        default main
//   GITHUB_WORK_BRANCH        default claude-changes
import { createClient } from '@supabase/supabase-js';
import { timingSafeEqual } from 'node:crypto';

const REPO = process.env.GITHUB_REPO || 'AargardStudio/azam-market-online';
const BASE = process.env.GITHUB_BASE_BRANCH || 'main';
const WORK = process.env.GITHUB_WORK_BRANCH || 'claude-changes';
const GH = 'https://api.github.com';

// ---------------------------------------------------------------- helpers

class ToolError extends Error {}

const text = (v: unknown) => ({
  content: [{ type: 'text', text: typeof v === 'string' ? v : JSON.stringify(v, null, 2) }],
});
const fail = (msg: string) => ({ isError: true, content: [{ type: 'text', text: msg }] });

function safeEqual(a: string, b: string) {
  const A = Buffer.from(a);
  const B = Buffer.from(b);
  return A.length === B.length && timingSafeEqual(A, B);
}

async function gh(path: string, init: RequestInit = {}, okStatuses: number[] = []) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new ToolError('GITHUB_TOKEN is not set on the server.');
  const res = await fetch(`${GH}/repos/${REPO}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  });
  if (res.ok || okStatuses.includes(res.status)) {
    if (res.status === 204) return { status: 204, data: null as any };
    return { status: res.status, data: (await res.json().catch(() => null)) as any };
  }
  const body = await res.text();
  throw new ToolError(`GitHub ${res.status} on ${path}: ${body.slice(0, 400)}`);
}

const b64 = (s: string) => Buffer.from(s, 'utf8').toString('base64');
const unb64 = (s: string) => Buffer.from(s, 'base64').toString('utf8');
const enc = (p: string) => p.split('/').map(encodeURIComponent).join('/');

function cleanPath(p: string) {
  const c = String(p || '').replace(/^\/+/, '').replace(/\\/g, '/');
  if (!c || c.includes('..') || c.startsWith('.git/') || c === '.git') throw new ToolError(`Invalid path: ${p}`);
  return c;
}

/** Make sure the work branch exists and is not stale (reset to main if it has no changes of its own). */
async function ensureWorkBranch(): Promise<{ baseSha: string; workSha: string }> {
  const base = (await gh(`/git/ref/heads/${BASE}`)).data;
  const baseSha = base.object.sha as string;
  const existing = await gh(`/git/ref/heads/${WORK}`, {}, [404]);
  if (existing.status === 404) {
    await gh('/git/refs', { method: 'POST', body: JSON.stringify({ ref: `refs/heads/${WORK}`, sha: baseSha }) });
    return { baseSha, workSha: baseSha };
  }
  let workSha = existing.data.object.sha as string;
  if (workSha !== baseSha) {
    const cmp = (await gh(`/compare/${BASE}...${WORK}`)).data;
    if (cmp.ahead_by === 0) {
      await gh(`/git/refs/heads/${WORK}`, { method: 'PATCH', body: JSON.stringify({ sha: baseSha, force: true }) });
      workSha = baseSha;
    }
  }
  return { baseSha, workSha };
}

async function getFile(path: string, ref: string): Promise<{ content: string; sha: string } | null> {
  const r = await gh(`/contents/${enc(path)}?ref=${encodeURIComponent(ref)}`, {}, [404]);
  if (r.status === 404) return null;
  if (Array.isArray(r.data)) throw new ToolError(`${path} is a directory.`);
  let content = r.data.content ? unb64(r.data.content) : '';
  if (!r.data.content && r.data.sha) {
    const blob = (await gh(`/git/blobs/${r.data.sha}`)).data;
    content = unb64(blob.content);
  }
  return { content, sha: r.data.sha };
}

async function putFile(path: string, content: string, message: string) {
  await ensureWorkBranch();
  const current = await getFile(path, WORK);
  const r = await gh(`/contents/${enc(path)}`, {
    method: 'PUT',
    body: JSON.stringify({ message, content: b64(content), branch: WORK, ...(current ? { sha: current.sha } : {}) }),
  });
  return r.data.commit.sha as string;
}

async function buildState(sha: string) {
  const [st, cr] = await Promise.all([
    gh(`/commits/${sha}/status`).then((r) => r.data).catch(() => null),
    gh(`/commits/${sha}/check-runs`).then((r) => r.data).catch(() => null),
  ]);
  const items: { name: string; state: string; url?: string; note?: string }[] = [];
  for (const s of st?.statuses || []) items.push({ name: s.context, state: s.state, url: s.target_url, note: s.description });
  for (const c of cr?.check_runs || [])
    items.push({ name: c.name, state: c.status === 'completed' ? c.conclusion : c.status, url: c.html_url });
  let overall: 'success' | 'failure' | 'pending' | 'unknown' = 'unknown';
  if (items.length) {
    const bad = items.some((i) => ['failure', 'error', 'cancelled', 'timed_out', 'action_required'].includes(i.state));
    const pend = items.some((i) => ['pending', 'queued', 'in_progress'].includes(i.state));
    overall = bad ? 'failure' : pend ? 'pending' : 'success';
  }
  return { overall, items };
}

function supabaseAdmin() {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new ToolError('Supabase env vars are not set on the server.');
  return createClient(url, key, { auth: { persistSession: false } });
}

const VENDOR_COLS =
  'id,shop_name,slug,email,whatsapp,phone,stall_number,status,tier_id,subscription_status,trial_ends_at,is_subscription_exempt,is_verified,is_featured,user_id,market_id,created_at';

const UPDATABLE_VENDOR_FIELDS = [
  'shop_name',
  'stall_number',
  'whatsapp',
  'phone',
  'email',
  'description',
  'status',
  'tier_id',
  'is_verified',
  'is_featured',
  'is_subscription_exempt',
  'subscription_status',
  'trial_ends_at',
  'market_id',
];

async function findVendor(sb: any, ref: string) {
  const q = sb.from('vendors').select(VENDOR_COLS);
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(ref);
  const { data, error } = isUuid
    ? await q.eq('id', ref)
    : await q.or(`slug.eq.${ref},email.ilike.${ref},shop_name.ilike.%${ref.replace(/[,()]/g, ' ')}%`);
  if (error) throw new ToolError(error.message);
  if (!data?.length) throw new ToolError(`No vendor matches "${ref}".`);
  if (data.length > 1)
    throw new ToolError(
      `"${ref}" matches ${data.length} vendors: ${data.map((v: any) => `${v.shop_name} (${v.id})`).join('; ')}. Use the id.`
    );
  return data[0];
}


const slugify = (x: string) =>
  `${x.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')}-${Date.now().toString(36)}`;

const normalizePakistanPhone = (value: string): string => {
  const digits = String(value || '').replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('92')) return `+${digits}`;
  if (digits.startsWith('0')) return `+92${digits.slice(1)}`;
  if (digits.length === 10 && digits.startsWith('3')) return `+92${digits}`;
  return String(value).trim().startsWith('+') ? `+${digits}` : '';
};

async function findMarket(sb: any, ref: string) {
  const { data, error } = await sb.from('markets').select('id,name,city,slug').or(`slug.eq.${ref},name.ilike.%${ref.replace(/[,()]/g, ' ')}%`);
  if (error) throw new ToolError(error.message);
  if (!data?.length) throw new ToolError(`No market matches "${ref}". Add it first with add_market.`);
  if (data.length > 1) throw new ToolError(`"${ref}" matches several markets: ${data.map((m: any) => m.name).join('; ')}. Be more specific.`);
  return data[0];
}

async function createLogin(sb: any, vendor: { id: string; shop_name: string }, phoneRaw: string, password: string) {
  const phone = normalizePakistanPhone(phoneRaw);
  if (!phone) throw new ToolError('A valid Pakistani mobile number is required for the login.');
  if (!password || password.length < 8) throw new ToolError('Password must contain at least 8 characters.');
  const { data: created, error } = await sb.auth.admin.createUser({
    phone,
    password,
    phone_confirm: true,
    user_metadata: { vendor_id: vendor.id, shop_name: vendor.shop_name },
  });
  if (error || !created?.user) throw new ToolError(error?.message || 'Could not create the login.');
  const { error: linkErr } = await sb.from('vendors').update({ user_id: created.user.id, phone }).eq('id', vendor.id);
  if (linkErr) {
    await sb.auth.admin.deleteUser(created.user.id);
    throw new ToolError(`Login was not linked to the shop: ${linkErr.message}`);
  }
  return phone;
}

const CUSTOMIZATION_FIELDS = [
  'is_published', 'theme_color', 'accent_color', 'background_tone', 'font_style', 'header_layout',
  'show_announcement', 'announcement_text', 'show_market_badge', 'logo_shape', 'hero_layout',
  'hero_headline', 'hero_tagline', 'hero_badge_text', 'hero_show_whatsapp', 'hero_show_phone',
  'hero_show_catalogue_btn', 'show_stats', 'whatsapp_button', 'phone_button', 'faqs', 'blocks',
];
const PRODUCT_FIELDS = ['name', 'description', 'fabric_type', 'price_range', 'moq', 'image_url', 'is_active', 'sort_order'];
const TIER_FIELDS = ['display_name', 'price_usd', 'price_pkr', 'max_products', 'max_catalogues', 'is_available', 'has_verified_badge', 'has_featured_placement', 'has_analytics'];

// ---------------------------------------------------------------- tools

type Tool = {
  name: string;
  description: string;
  inputSchema: any;
  annotations?: any;
  run: (a: any) => Promise<any>;
};

const str = (description: string) => ({ type: 'string', description });
const obj = (properties: any, required: string[] = []) => ({ type: 'object', properties, required });
const READ = { readOnlyHint: true, openWorldHint: false };
const WRITE = { readOnlyHint: false, destructiveHint: false, openWorldHint: false };
const DANGER = { readOnlyHint: false, destructiveHint: true, openWorldHint: false };

const tools: Tool[] = [
  // ---------------- CODE
  {
    name: 'list_files',
    description: `List files/folders in the app's GitHub repo (${REPO}). Shows the work branch (pending edits) by default.`,
    inputSchema: obj({
      path: str('Folder path, e.g. "src/components/admin". Empty = repo root.'),
      ref: { type: 'string', enum: ['work', 'main'], description: 'Which branch to read (default work).' },
    }),
    annotations: READ,
    run: async ({ path = '', ref = 'work' }) => {
      await ensureWorkBranch();
      const p = path ? cleanPath(path) : '';
      const r = await gh(`/contents/${p ? enc(p) : ''}?ref=${ref === 'main' ? BASE : WORK}`);
      if (!Array.isArray(r.data)) throw new ToolError(`${path} is a file; use read_file.`);
      return text(r.data.map((e: any) => `${e.type === 'dir' ? '📁' : '  '} ${e.path}${e.type === 'file' ? ` (${e.size} B)` : ''}`).join('\n'));
    },
  },
  {
    name: 'read_file',
    description:
      'Read a source file. Optionally pass start_line/end_line to read only part of a big file (src/App.tsx is ~1,700 lines). Output lines are numbered.',
    inputSchema: obj(
      {
        path: str('e.g. src/App.tsx'),
        start_line: { type: 'integer' },
        end_line: { type: 'integer' },
        ref: { type: 'string', enum: ['work', 'main'] },
      },
      ['path']
    ),
    annotations: READ,
    run: async ({ path, start_line, end_line, ref = 'work' }) => {
      await ensureWorkBranch();
      const f = await getFile(cleanPath(path), ref === 'main' ? BASE : WORK);
      if (!f) throw new ToolError(`File not found: ${path}`);
      const lines = f.content.split('\n');
      const s = Math.max(1, start_line || 1);
      const e = Math.min(lines.length, end_line || (start_line ? s + 399 : lines.length));
      const slice = lines.slice(s - 1, e).map((l, i) => `${String(s + i).padStart(5)}  ${l}`);
      return text(`${path}  (lines ${s}-${e} of ${lines.length})\n${slice.join('\n')}`);
    },
  },
  {
    name: 'search_code',
    description:
      'Search the repo for text (GitHub code search on the main branch, so very recent un-deployed edits may not appear). Returns matching file paths and snippets.',
    inputSchema: obj({ query: str('Text to find, e.g. "handleAddCategory"') }, ['query']),
    annotations: READ,
    run: async ({ query }) => {
      const token = process.env.GITHUB_TOKEN;
      if (!token) throw new ToolError('GITHUB_TOKEN is not set on the server.');
      const res = await fetch(`${GH}/search/code?q=${encodeURIComponent(`${query} repo:${REPO}`)}&per_page=15`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github.text-match+json' },
      });
      if (!res.ok) throw new ToolError(`GitHub search ${res.status}: ${(await res.text()).slice(0, 300)}`);
      const j: any = await res.json();
      return text(
        (j.items || [])
          .map((i: any) => `${i.path}\n` + (i.text_matches || []).map((m: any) => `   ${String(m.fragment).replace(/\n/g, ' ⏎ ').slice(0, 200)}`).join('\n'))
          .join('\n\n') || 'No matches.'
      );
    },
  },
  {
    name: 'edit_file',
    description:
      'Make a precise edit: replace an exact piece of text in a file with new text (must match exactly once unless replace_all). Preferred over write_file for existing files. Commits to the work branch - NOT live until deploy.',
    inputSchema: obj(
      {
        path: str('File path'),
        find: str('Exact existing text (include enough surrounding lines to be unique)'),
        replace: str('New text'),
        replace_all: { type: 'boolean' },
        message: str('Commit message'),
      },
      ['path', 'find', 'replace', 'message']
    ),
    annotations: WRITE,
    run: async ({ path, find, replace, replace_all, message }) => {
      await ensureWorkBranch();
      const p = cleanPath(path);
      const f = await getFile(p, WORK);
      if (!f) throw new ToolError(`File not found: ${path}`);
      const count = f.content.split(find).length - 1;
      if (count === 0) throw new ToolError('`find` text was not found. Re-read the file and copy the text exactly (whitespace matters).');
      if (count > 1 && !replace_all) throw new ToolError(`\`find\` matches ${count} places. Add more surrounding text, or set replace_all.`);
      const next = replace_all ? f.content.split(find).join(replace) : f.content.replace(find, () => replace);
      const sha = await putFile(p, next, message);
      return text(`Edited ${p} (${count} replacement${count > 1 ? 's' : ''}). Commit ${sha.slice(0, 7)} on branch ${WORK}. Not live yet - run changes_status, then deploy.`);
    },
  },
  {
    name: 'write_file',
    description:
      'Create a new file or fully replace an existing one. Commits to the work branch - NOT live until deploy. For small changes to existing files use edit_file.',
    inputSchema: obj({ path: str('File path'), content: str('Complete file content'), message: str('Commit message') }, ['path', 'content', 'message']),
    annotations: WRITE,
    run: async ({ path, content, message }) => {
      const p = cleanPath(path);
      const sha = await putFile(p, content, message);
      return text(`Wrote ${p}. Commit ${sha.slice(0, 7)} on branch ${WORK}. Not live yet - run changes_status, then deploy.`);
    },
  },
  {
    name: 'delete_file',
    description: 'Delete a file (on the work branch; live only after deploy).',
    inputSchema: obj({ path: str('File path'), message: str('Commit message') }, ['path', 'message']),
    annotations: DANGER,
    run: async ({ path, message }) => {
      await ensureWorkBranch();
      const p = cleanPath(path);
      const f = await getFile(p, WORK);
      if (!f) throw new ToolError(`File not found: ${path}`);
      await gh(`/contents/${enc(p)}`, { method: 'DELETE', body: JSON.stringify({ message, sha: f.sha, branch: WORK }) });
      return text(`Deleted ${p} on branch ${WORK}.`);
    },
  },
  {
    name: 'changes_status',
    description:
      'Show pending (not yet live) changes: commits, files changed, and whether the Vercel preview build of the work branch passed. Run this before deploy.',
    inputSchema: obj({}),
    annotations: READ,
    run: async () => {
      const { workSha } = await ensureWorkBranch();
      const cmp = (await gh(`/compare/${BASE}...${WORK}`)).data;
      if (!cmp.ahead_by) return text('No pending changes. The work branch matches what is live.');
      const build = await buildState(workSha);
      return text({
        pending_commits: cmp.commits.map((c: any) => `${c.sha.slice(0, 7)} ${c.commit.message.split('\n')[0]}`),
        files_changed: (cmp.files || []).map((f: any) => `${f.status} ${f.filename} (+${f.additions}/-${f.deletions})`),
        preview_build: build.overall,
        build_checks: build.items,
        next: build.overall === 'success' ? 'Safe to deploy.' : build.overall === 'pending' ? 'Build still running - check again in ~1 minute.' : build.overall === 'failure' ? 'Build FAILED - fix the code before deploying (see the check URL).' : 'No build result found yet - wait a minute and re-check.',
      });
    },
  },
  {
    name: 'deploy',
    description:
      'Make pending changes LIVE: merges the work branch into main (Vercel then redeploys the site). Refuses unless the preview build passed. Database/SQL changes are NOT part of this - run those separately with run_sql.',
    inputSchema: obj({ message: str('Merge commit message'), skip_build_check: { type: 'boolean', description: 'Only if no build status exists at all. Never use to bypass a failed build.' } }, ['message']),
    annotations: DANGER,
    run: async ({ message, skip_build_check }) => {
      const { workSha } = await ensureWorkBranch();
      const cmp = (await gh(`/compare/${BASE}...${WORK}`)).data;
      if (!cmp.ahead_by) return text('Nothing to deploy.');
      const build = await buildState(workSha);
      if (build.overall === 'failure') throw new ToolError('Preview build FAILED. Not deploying. Run changes_status for details and fix the code.');
      if (build.overall === 'pending') throw new ToolError('Preview build is still running. Try again in a minute.');
      if (build.overall === 'unknown' && !skip_build_check)
        throw new ToolError('No preview build result exists for the pending commit yet. Wait a minute and retry (or pass skip_build_check if Vercel previews are not enabled).');
      const r = await gh('/merges', { method: 'POST', body: JSON.stringify({ base: BASE, head: WORK, commit_message: message }) }, [409]);
      if (r.status === 409) throw new ToolError('Merge conflict: main changed in the same places. Run discard_changes and redo the edit, or resolve manually.');
      return text(`Deployed. ${cmp.ahead_by} commit(s) merged into ${BASE}; Vercel is now building the live site (about 1-2 minutes).`);
    },
  },
  {
    name: 'discard_changes',
    description: 'Throw away ALL pending (not live) edits by resetting the work branch to main.',
    inputSchema: obj({}),
    annotations: DANGER,
    run: async () => {
      const { baseSha } = await ensureWorkBranch();
      await gh(`/git/refs/heads/${WORK}`, { method: 'PATCH', body: JSON.stringify({ sha: baseSha, force: true }) });
      return text('Pending changes discarded. Work branch now equals main.');
    },
  },

  // ---------------- DATA
  {
    name: 'list_vendors',
    description: 'List all stalls with status, tier, trial/subscription state, and whether the owner has logged in (user_id set).',
    inputSchema: obj({ status: { type: 'string', enum: ['active', 'pending', 'suspended'] } }),
    annotations: READ,
    run: async ({ status }) => {
      const sb = supabaseAdmin();
      let q = sb.from('vendors').select(VENDOR_COLS).order('created_at', { ascending: false });
      if (status) q = q.eq('status', status);
      const { data, error } = await q;
      if (error) throw new ToolError(error.message);
      return text(data);
    },
  },
  {
    name: 'get_vendor',
    description: 'Look up one stall by id, slug, email or part of the shop name, including product/catalogue counts.',
    inputSchema: obj({ vendor: str('id, slug, email or shop name') }, ['vendor']),
    annotations: READ,
    run: async ({ vendor }) => {
      const sb = supabaseAdmin();
      const v = await findVendor(sb, vendor);
      const [p, c] = await Promise.all([
        sb.from('products').select('id', { count: 'exact', head: true }).eq('vendor_id', v.id),
        sb.from('catalogues').select('id', { count: 'exact', head: true }).eq('vendor_id', v.id),
      ]);
      return text({ ...v, products: p.count ?? 0, catalogues: c.count ?? 0 });
    },
  },
  {
    name: 'update_vendor',
    description: `Change fields on a stall. Allowed fields: ${UPDATABLE_VENDOR_FIELDS.join(', ')}. Example: {"status":"suspended"} or {"is_subscription_exempt":true}.`,
    inputSchema: obj({ vendor: str('id, slug, email or shop name'), fields: { type: 'object', description: 'Field/value pairs to set' } }, ['vendor', 'fields']),
    annotations: WRITE,
    run: async ({ vendor, fields }) => {
      const sb = supabaseAdmin();
      const v = await findVendor(sb, vendor);
      const patch: any = {};
      for (const [k, val] of Object.entries(fields || {})) {
        if (!UPDATABLE_VENDOR_FIELDS.includes(k)) throw new ToolError(`Field "${k}" cannot be changed here. Allowed: ${UPDATABLE_VENDOR_FIELDS.join(', ')}`);
        patch[k] = val;
      }
      if (!Object.keys(patch).length) throw new ToolError('No fields given.');
      const { data, error } = await sb.from('vendors').update(patch).eq('id', v.id).select(VENDOR_COLS).single();
      if (error) throw new ToolError(error.message);
      return text({ updated: data });
    },
  },
  {
    name: 'extend_trial',
    description: 'Extend a stall\'s free trial by N days (counted from the later of today or the current trial end) and put it back in trialing state, which also makes the shop visible again.',
    inputSchema: obj({ vendor: str('id, slug, email or shop name'), days: { type: 'integer', description: 'Days to add (e.g. 30)' } }, ['vendor', 'days']),
    annotations: WRITE,
    run: async ({ vendor, days }) => {
      if (!Number.isFinite(days) || days < 1 || days > 365) throw new ToolError('days must be between 1 and 365.');
      const sb = supabaseAdmin();
      const v = await findVendor(sb, vendor);
      const cur = v.trial_ends_at ? new Date(v.trial_ends_at).getTime() : 0;
      const next = new Date(Math.max(cur, Date.now()) + days * 86400000).toISOString();
      const { error } = await sb.from('vendors').update({ trial_ends_at: next, subscription_status: 'trialing' }).eq('id', v.id);
      if (error) throw new ToolError(error.message);
      return text(`${v.shop_name}: trial now ends ${next.slice(0, 10)}.`);
    },
  },
  {
    name: 'platform_stats',
    description: 'Platform numbers: stalls by status, products, and buyer activity (views, WhatsApp, calls...) for the last 7 and 30 days.',
    inputSchema: obj({}),
    annotations: READ,
    run: async () => {
      const sb = supabaseAdmin();
      const since = new Date(Date.now() - 30 * 86400000).toISOString();
      const [v, p, logs] = await Promise.all([
        sb.from('vendors').select('status'),
        sb.from('products').select('id', { count: 'exact', head: true }),
        sb.from('inquiry_logs').select('event_type,created_at').gte('created_at', since).limit(20000),
      ]);
      const byStatus: any = {};
      (v.data || []).forEach((r: any) => (byStatus[r.status] = (byStatus[r.status] || 0) + 1));
      const week = Date.now() - 7 * 86400000;
      const a7: any = {};
      const a30: any = {};
      (logs.data || []).forEach((r: any) => {
        a30[r.event_type] = (a30[r.event_type] || 0) + 1;
        if (new Date(r.created_at).getTime() >= week) a7[r.event_type] = (a7[r.event_type] || 0) + 1;
      });
      return text({ stalls_by_status: byStatus, products: p.count ?? 0, activity_last_7_days: a7, activity_last_30_days: a30 });
    },
  },
  {
    name: 'create_shop',
    description:
      'Create a new stall and put it live immediately. Optionally creates its phone login (shop owner signs in with their mobile number + the password you set). Up to 3 categories by name.',
    inputSchema: obj(
      {
        shop_name: str('Shop name'),
        stall_number: str('Stall / location, e.g. "Shop 14, Raja Bazar"'),
        market: str('Market name or slug, e.g. "Raja Bazar"'),
        whatsapp: str('WhatsApp number, e.g. 03001234567'),
        email: str('Owner email (optional)'),
        description: str('Short bio (optional)'),
        categories: { type: 'array', items: { type: 'string' }, description: 'Up to 3 category names' },
        tier_id: str('Default t-standard'),
        is_verified: { type: 'boolean' },
        login_password: str('If given (8+ chars), creates the owner login using the WhatsApp number as phone'),
      },
      ['shop_name', 'stall_number', 'market', 'whatsapp']
    ),
    annotations: WRITE,
    run: async (a) => {
      const sb = supabaseAdmin();
      if (!String(a.shop_name || '').trim()) throw new ToolError('shop_name is required.');
      const market = await findMarket(sb, a.market);
      let catIds: string[] = [];
      if (a.categories?.length) {
        if (a.categories.length > 3) throw new ToolError('A stall can have at most 3 categories.');
        const { data: cats } = await sb.from('categories').select('id,name');
        for (const name of a.categories) {
          const c = (cats || []).find((x: any) => x.name.toLowerCase() === String(name).toLowerCase());
          if (!c) throw new ToolError(`Unknown category "${name}". Known: ${(cats || []).map((x: any) => x.name).join(', ')}. Use add_category first.`);
          catIds.push(c.id);
        }
      }
      const { data: v, error } = await sb
        .from('vendors')
        .insert({
          shop_name: a.shop_name.trim(),
          stall_number: a.stall_number,
          market_id: market.id,
          whatsapp: a.whatsapp,
          email: a.email?.trim() || null,
          description: a.description || `Verified wholesale vendor in ${market.name}.`,
          tier_id: a.tier_id || 't-standard',
          is_verified: a.is_verified ?? true,
          status: 'active',
          slug: slugify(a.shop_name),
        })
        .select('id,shop_name,slug')
        .single();
      if (error) throw new ToolError(error.message);
      const notes: string[] = [];
      if (catIds.length) {
        const { error: ce } = await sb.from('vendor_categories').insert(catIds.map((category_id) => ({ vendor_id: v.id, category_id })));
        if (ce) notes.push(`Categories not saved: ${ce.message}`);
      }
      if (a.login_password) {
        try {
          const phone = await createLogin(sb, v, a.whatsapp, a.login_password);
          notes.push(`Owner login created: ${phone}`);
        } catch (e: any) {
          await sb.from('vendors').delete().eq('id', v.id);
          throw new ToolError(`Shop was NOT created: ${e.message}`);
        }
      }
      return text({ created: v, market: market.name, notes });
    },
  },
  {
    name: 'approve_vendor',
    description: 'Approve a pending stall (sets it active so it appears in the directory). Use list_vendors with status "pending" to see who is waiting.',
    inputSchema: obj({ vendor: str('id, slug, email or shop name') }, ['vendor']),
    annotations: WRITE,
    run: async ({ vendor }) => {
      const sb = supabaseAdmin();
      const v = await findVendor(sb, vendor);
      const { error } = await sb.from('vendors').update({ status: 'active' }).eq('id', v.id);
      if (error) throw new ToolError(error.message);
      return text(`${v.shop_name} is now active (was ${v.status}).`);
    },
  },
  {
    name: 'suspend_vendor',
    description: 'Suspend a stall (hides it from the directory but keeps all its data). Reverse with approve_vendor.',
    inputSchema: obj({ vendor: str('id, slug, email or shop name') }, ['vendor']),
    annotations: WRITE,
    run: async ({ vendor }) => {
      const sb = supabaseAdmin();
      const v = await findVendor(sb, vendor);
      const { error } = await sb.from('vendors').update({ status: 'suspended' }).eq('id', v.id);
      if (error) throw new ToolError(error.message);
      return text(`${v.shop_name} is now suspended.`);
    },
  },
  {
    name: 'delete_vendor',
    description: 'PERMANENTLY delete a stall and its products/catalogues. Cannot be undone. confirm_shop_name must exactly equal the shop name.',
    inputSchema: obj({ vendor: str('id, slug, email or shop name'), confirm_shop_name: str('Exact shop name, as confirmation') }, ['vendor', 'confirm_shop_name']),
    annotations: DANGER,
    run: async ({ vendor, confirm_shop_name }) => {
      const sb = supabaseAdmin();
      const v = await findVendor(sb, vendor);
      if (String(confirm_shop_name).trim() !== String(v.shop_name).trim()) throw new ToolError(`Confirmation does not match. The shop name is exactly "${v.shop_name}".`);
      const { error } = await sb.from('vendors').delete().eq('id', v.id);
      if (error) throw new ToolError(error.message);
      return text(`Deleted ${v.shop_name}.`);
    },
  },
  {
    name: 'create_vendor_login',
    description: 'Create a phone + password login for a stall that has none (owner then signs in with that mobile number).',
    inputSchema: obj({ vendor: str('id, slug, email or shop name'), phone: str('Owner mobile, e.g. 03001234567'), password: str('8+ characters') }, ['vendor', 'phone', 'password']),
    annotations: WRITE,
    run: async ({ vendor, phone, password }) => {
      const sb = supabaseAdmin();
      const v = await findVendor(sb, vendor);
      if (v.user_id) throw new ToolError(`${v.shop_name} already has a login.`);
      const p = await createLogin(sb, v, phone, password);
      return text(`Login created for ${v.shop_name}: ${p}`);
    },
  },
  {
    name: 'customize_shop',
    description: `Change how a stall's public page looks and reads. Fields: ${CUSTOMIZATION_FIELDS.join(', ')}. Examples: {"theme_color":"#1E3A8A","accent_color":"#0284C7"}, {"hero_layout":"split_showcase"} (banner_overlay | split_showcase | clean_minimal | catalog_spotlight), {"hero_headline":"Premium Shawls"}, {"announcement_text":"Eid sale"}.`,
    inputSchema: obj({ vendor: str('id, slug, email or shop name'), fields: { type: 'object', description: 'Field/value pairs' } }, ['vendor', 'fields']),
    annotations: WRITE,
    run: async ({ vendor, fields }) => {
      const sb = supabaseAdmin();
      const v = await findVendor(sb, vendor);
      const patch: any = {};
      for (const [k, val] of Object.entries(fields || {})) {
        if (!CUSTOMIZATION_FIELDS.includes(k)) throw new ToolError(`Field "${k}" is not allowed. Allowed: ${CUSTOMIZATION_FIELDS.join(', ')}`);
        patch[k] = val;
      }
      if (!Object.keys(patch).length) throw new ToolError('No fields given.');
      patch.last_saved_at = new Date().toISOString();
      const upd = await sb.from('shop_customizations').update(patch).eq('vendor_id', v.id).select('vendor_id');
      if (upd.error) throw new ToolError(upd.error.message);
      if (!upd.data?.length) {
        const ins = await sb.from('shop_customizations').insert({ ...patch, vendor_id: v.id });
        if (ins.error) throw new ToolError(ins.error.message);
      }
      return text(`Updated ${v.shop_name}'s page: ${Object.keys(patch).filter((k) => k !== 'last_saved_at').join(', ')}.`);
    },
  },
  {
    name: 'list_products',
    description: 'List a stall\'s products (without photos).',
    inputSchema: obj({ vendor: str('id, slug, email or shop name') }, ['vendor']),
    annotations: READ,
    run: async ({ vendor }) => {
      const sb = supabaseAdmin();
      const v = await findVendor(sb, vendor);
      const { data, error } = await sb.from('products').select('id,name,fabric_type,price_range,moq,is_active,sort_order,description').eq('vendor_id', v.id).order('sort_order');
      if (error) throw new ToolError(error.message);
      return text({ shop: v.shop_name, products: data });
    },
  },
  {
    name: 'add_product',
    description: 'Add a product to a stall. Photos: give a public image URL in image_url (uploading photo files is not possible from chat; the owner can add photos in their dashboard).',
    inputSchema: obj(
      { vendor: str('id, slug, email or shop name'), name: str('Product name'), fabric_type: str('e.g. Khaddar'), price_range: str('e.g. Rs 3000'), moq: str('Minimum order'), description: str('Description'), image_url: str('Public image URL (optional)') },
      ['vendor', 'name']
    ),
    annotations: WRITE,
    run: async ({ vendor, image_url, ...rest }) => {
      const sb = supabaseAdmin();
      const v = await findVendor(sb, vendor);
      const row: any = { vendor_id: v.id, name: rest.name };
      for (const k of ['fabric_type', 'price_range', 'moq', 'description']) if (rest[k] !== undefined) row[k] = rest[k];
      if (image_url) { row.image_url = image_url; row.image_urls = [image_url]; }
      const { data, error } = await sb.from('products').insert(row).select('id,name').single();
      if (error) throw new ToolError(error.message);
      return text(`Added "${data.name}" to ${v.shop_name} (id ${data.id}).`);
    },
  },
  {
    name: 'update_product',
    description: `Edit a product. Fields: ${PRODUCT_FIELDS.join(', ')}.`,
    inputSchema: obj({ product_id: str('Product id from list_products'), fields: { type: 'object' } }, ['product_id', 'fields']),
    annotations: WRITE,
    run: async ({ product_id, fields }) => {
      const sb = supabaseAdmin();
      const patch: any = {};
      for (const [k, val] of Object.entries(fields || {})) {
        if (!PRODUCT_FIELDS.includes(k)) throw new ToolError(`Field "${k}" is not allowed. Allowed: ${PRODUCT_FIELDS.join(', ')}`);
        patch[k] = val;
      }
      if (patch.image_url) patch.image_urls = [patch.image_url];
      const { data, error } = await sb.from('products').update(patch).eq('id', product_id).select('id,name');
      if (error) throw new ToolError(error.message);
      if (!data?.length) throw new ToolError('No product with that id.');
      return text(`Updated "${data[0].name}".`);
    },
  },
  {
    name: 'delete_product',
    description: 'Delete a product permanently.',
    inputSchema: obj({ product_id: str('Product id from list_products') }, ['product_id']),
    annotations: DANGER,
    run: async ({ product_id }) => {
      const sb = supabaseAdmin();
      const { data, error } = await sb.from('products').delete().eq('id', product_id).select('name');
      if (error) throw new ToolError(error.message);
      if (!data?.length) throw new ToolError('No product with that id.');
      return text(`Deleted "${data[0].name}".`);
    },
  },
  {
    name: 'add_category',
    description: 'Add a fabric category.',
    inputSchema: obj({ name: str('Category name'), icon: str('Emoji icon, default 🧵') }, ['name']),
    annotations: WRITE,
    run: async ({ name, icon }) => {
      const sb = supabaseAdmin();
      const { data: m } = await sb.from('markets').select('id').order('created_at').limit(1);
      const { error } = await sb.from('categories').insert({ name: name.trim(), icon: icon || '🧵', slug: slugify(name), market_id: m?.[0]?.id ?? null });
      if (error) throw new ToolError(error.message);
      return text(`Category "${name}" added.`);
    },
  },
  {
    name: 'add_market',
    description: 'Add a wholesale market (e.g. Hall Road, Lahore).',
    inputSchema: obj({ name: str('Market name'), city: str('City') }, ['name', 'city']),
    annotations: WRITE,
    run: async ({ name, city }) => {
      const sb = supabaseAdmin();
      const { error } = await sb.from('markets').insert({ name: name.trim(), city: city.trim(), slug: slugify(name), country: 'Pakistan' });
      if (error) throw new ToolError(error.message);
      return text(`Market "${name}" (${city}) added.`);
    },
  },
  {
    name: 'update_tier',
    description: `Change a subscription tier (id such as t-standard / t-premium). Fields: ${TIER_FIELDS.join(', ')}. E.g. {"is_available":true} to open Premium, {"price_usd":7}.`,
    inputSchema: obj({ tier_id: str('Tier id'), fields: { type: 'object' } }, ['tier_id', 'fields']),
    annotations: WRITE,
    run: async ({ tier_id, fields }) => {
      const sb = supabaseAdmin();
      const patch: any = {};
      for (const [k, val] of Object.entries(fields || {})) {
        if (!TIER_FIELDS.includes(k)) throw new ToolError(`Field "${k}" is not allowed. Allowed: ${TIER_FIELDS.join(', ')}`);
        patch[k] = val;
      }
      const { data, error } = await sb.from('subscription_tiers').update(patch).eq('id', tier_id).select('id,display_name,price_usd,is_available');
      if (error) throw new ToolError(error.message);
      if (!data?.length) throw new ToolError('No tier with that id.');
      return text({ updated: data[0] });
    },
  },
  {
    name: 'run_sql',
    description:
      'Run SQL on the production database. By default read-only (SELECT). To change data or schema, set allow_write=true - double-check the statement first; there is no undo. Requires SUPABASE_ACCESS_TOKEN on the server.',
    inputSchema: obj({ sql: str('SQL to run'), allow_write: { type: 'boolean', description: 'Required for INSERT/UPDATE/DELETE/DDL' } }, ['sql']),
    annotations: DANGER,
    run: async ({ sql, allow_write }) => {
      const token = process.env.SUPABASE_ACCESS_TOKEN;
      const url = process.env.VITE_SUPABASE_URL || '';
      const ref = url.replace(/^https?:\/\//, '').split('.')[0];
      if (!token) throw new ToolError('SUPABASE_ACCESS_TOKEN is not set on the server, so run_sql is disabled. Use the vendor tools, or add the token.');
      if (!ref) throw new ToolError('Cannot work out the Supabase project ref.');
      const path = allow_write ? 'query' : 'query/read-only';
      const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/${path}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: sql }),
      });
      const body = await res.text();
      if (!res.ok) throw new ToolError(`Supabase ${res.status}: ${body.slice(0, 600)}`);
      return text(body.length > 20000 ? body.slice(0, 20000) + '\n…(truncated)' : body);
    },
  },
];

// ---------------------------------------------------------------- JSON-RPC / MCP

const SUPPORTED = ['2025-06-18', '2025-03-26', '2024-11-05'];

async function handleRpc(msg: any): Promise<any | null> {
  const { id, method, params } = msg || {};
  const isNotification = id === undefined || id === null;
  const reply = (result: any) => (isNotification ? null : { jsonrpc: '2.0', id, result });
  const error = (code: number, message: string) => (isNotification ? null : { jsonrpc: '2.0', id, error: { code, message } });

  switch (method) {
    case 'initialize': {
      const wanted = params?.protocolVersion;
      return reply({
        protocolVersion: SUPPORTED.includes(wanted) ? wanted : SUPPORTED[0],
        capabilities: { tools: { listChanged: false } },
        serverInfo: { name: 'amo-control', version: '1.0.0' },
        instructions:
          'Controls Azam Market Online. Shops, approvals, products, page looks, categories, markets and tiers have their own tools (data changes are immediate). For code/layout changes: edit_file/write_file (saved to a work branch), then changes_status, then deploy. Database: vendor tools or run_sql. Never deploy without telling the user what changed.',
      });
    }
    case 'ping':
      return reply({});
    case 'tools/list':
      return reply({ tools: tools.map(({ run, ...t }) => t) });
    case 'tools/call': {
      const tool = tools.find((t) => t.name === params?.name);
      if (!tool) return error(-32602, `Unknown tool: ${params?.name}`);
      try {
        return reply(await tool.run(params?.arguments || {}));
      } catch (e: any) {
        return reply(fail(e instanceof ToolError ? e.message : `Unexpected error: ${e?.message || e}`));
      }
    }
    case 'resources/list':
      return reply({ resources: [] });
    case 'prompts/list':
      return reply({ prompts: [] });
    default:
      if (isNotification) return null; // e.g. notifications/initialized
      return error(-32601, `Method not found: ${method}`);
  }
}

async function readJson(req: any): Promise<any> {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') return JSON.parse(req.body);
  const chunks: Buffer[] = [];
  for await (const c of req) chunks.push(c);
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'content-type, accept, mcp-protocol-version, mcp-session-id');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const secret = process.env.AMO_MCP_SECRET;
  if (!secret || secret.length < 16) return res.status(503).json({ error: 'MCP server is not configured (AMO_MCP_SECRET missing or too short).' });
  const key = String(req.query?.key || '');
  if (!safeEqual(key, secret)) return res.status(404).json({ error: 'Not found' });

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Use POST (Streamable HTTP, stateless).' });
  }

  let body: any;
  try {
    body = await readJson(req);
  } catch {
    return res.status(400).json({ jsonrpc: '2.0', id: null, error: { code: -32700, message: 'Parse error' } });
  }

  if (Array.isArray(body)) {
    const out = (await Promise.all(body.map(handleRpc))).filter(Boolean);
    return out.length ? res.status(200).json(out) : res.status(202).end();
  }
  const out = await handleRpc(body);
  return out ? res.status(200).json(out) : res.status(202).end();
}
