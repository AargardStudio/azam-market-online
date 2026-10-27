import { createClient } from '@supabase/supabase-js';
import crypto from 'node:crypto';
import dns from 'node:dns/promises';
import net from 'node:net';

// Shared helpers for Aargard Connect. The leading underscore keeps Vercel from
// exposing this folder as a function.

export const SCOPES: Record<string, string> = {
  'marketplace:read': 'Platform statistics and analytics summaries',
  'vendors:read': 'List and read shops (contact details included, Stripe ids excluded)',
  'vendors:write': 'Approve, suspend, reinstate, edit shop details, extend trials',
  'products:read': 'List and read products across all shops',
  'products:write': 'Create and update products in any shop',
  'catalog:read': 'Read categories, markets and subscription tiers',
  'catalog:write': 'Create categories and markets',
  'tiers:write': 'Change subscription tier pricing, limits and availability',
  'inquiries:read': 'Read buyer inquiry events (views, WhatsApp, calls, downloads)',
};

export const WEBHOOK_EVENTS = [
  'vendor.created',
  'vendor.status_changed',
  'product.created',
  'product.updated',
  'inquiry.created',
  'connect.ping',
];

export const VENDOR_FIELDS = [
  'shop_name', 'stall_number', 'whatsapp', 'phone', 'email', 'description', 'status',
  'tier_id', 'is_verified', 'is_featured', 'is_subscription_exempt',
];
export const PRODUCT_FIELDS = ['name', 'description', 'fabric_type', 'price_range', 'moq', 'image_url', 'is_active', 'sort_order'];
export const TIER_FIELDS = ['display_name', 'price_usd', 'price_pkr', 'max_products', 'max_catalogues', 'is_available', 'has_verified_badge', 'has_featured_placement', 'has_analytics'];

export const BACKOFF_SECONDS = [60, 300, 1800, 7200, 43200]; // then give up (6 attempts total)

export function db() {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new HttpError(503, 'not_configured', 'Server is not configured (Supabase service key missing).');
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

export class HttpError extends Error {
  constructor(public status: number, public code: string, message: string) {
    super(message);
  }
}

export const sha256 = (s: string) => crypto.createHash('sha256').update(s).digest('hex');

export function newApiKey(environment: 'live' | 'test') {
  const raw = `amo_${environment}_${crypto.randomBytes(24).toString('base64url')}`;
  return { raw, prefix: raw.slice(0, 14), hash: sha256(raw) };
}

export const newWebhookSecret = () => `whsec_${crypto.randomBytes(24).toString('base64url')}`;

export function signPayload(secret: string, timestamp: string, body: string) {
  return crypto.createHmac('sha256', secret).update(`${timestamp}.${body}`).digest('hex');
}

export const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

export function ipHash(req: any) {
  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  return sha256(ip + (process.env.AMO_MCP_SECRET || 'amo')).slice(0, 16);
}

// ---------------------------------------------------------------- SSRF guard
function isPrivateIp(ip: string): boolean {
  if (net.isIPv4(ip)) {
    const [a, b] = ip.split('.').map(Number);
    return (
      a === 10 || a === 127 || a === 0 ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 100 && b >= 64 && b <= 127) ||
      a >= 224
    );
  }
  const v = ip.toLowerCase();
  return v === '::1' || v === '::' || v.startsWith('fc') || v.startsWith('fd') || v.startsWith('fe80') || v.startsWith('::ffff:');
}

export async function assertPublicHttpsUrl(raw: string) {
  let u: URL;
  try { u = new URL(raw); } catch { throw new HttpError(400, 'invalid_url', 'Webhook URL is not valid.'); }
  if (u.protocol !== 'https:') throw new HttpError(400, 'invalid_url', 'Webhook URL must use https.');
  const host = u.hostname.replace(/^\[|\]$/g, '');
  if (host === 'localhost' || host.endsWith('.local') || host.endsWith('.internal')) {
    throw new HttpError(400, 'invalid_url', 'Webhook URL must be a public address.');
  }
  const addrs = net.isIP(host) ? [{ address: host }] : await dns.lookup(host, { all: true }).catch(() => []);
  if (!addrs.length) throw new HttpError(400, 'invalid_url', 'Webhook host could not be resolved.');
  if (addrs.some((a) => isPrivateIp(a.address))) throw new HttpError(400, 'invalid_url', 'Webhook URL must be a public address.');
  return u;
}

// ---------------------------------------------------------------- delivery
export async function deliverOne(sb: any, delivery: any) {
  const { data: ep } = await sb.from('connect_webhook_endpoints').select('*').eq('id', delivery.endpoint_id).maybeSingle();
  const attempts = (delivery.attempts || 0) + 1;
  const fail = async (error: string, code: number | null) => {
    const giveUp = attempts > BACKOFF_SECONDS.length;
    await sb.from('connect_webhook_deliveries').update({
      attempts,
      status: giveUp ? 'failed' : 'pending',
      last_status_code: code,
      last_error: error.slice(0, 300),
      next_attempt_at: new Date(Date.now() + (BACKOFF_SECONDS[attempts - 1] ?? 86400) * 1000).toISOString(),
    }).eq('id', delivery.id);
    if (ep) await sb.from('connect_webhook_endpoints').update({ failure_count: (ep.failure_count || 0) + 1 }).eq('id', ep.id);
    return false;
  };
  if (!ep || !ep.is_active) {
    await sb.from('connect_webhook_deliveries').update({ status: 'failed', attempts, last_error: 'Endpoint missing or disabled' }).eq('id', delivery.id);
    return false;
  }
  try {
    const url = await assertPublicHttpsUrl(ep.url);
    const body = JSON.stringify(delivery.payload);
    const ts = String(Math.floor(Date.now() / 1000));
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 5000);
    const resp = await fetch(url, {
      method: 'POST',
      redirect: 'manual',
      signal: ctrl.signal,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'AargardConnect/2.0',
        'X-Aargard-Event': delivery.event,
        'X-Aargard-Delivery': delivery.id,
        'X-Aargard-Timestamp': ts,
        'X-Aargard-Signature': `sha256=${signPayload(ep.secret, ts, body)}`,
      },
      body,
    }).finally(() => clearTimeout(timer));
    if (resp.status >= 200 && resp.status < 300) {
      await sb.from('connect_webhook_deliveries').update({
        status: 'delivered', attempts, last_status_code: resp.status, last_error: null, delivered_at: new Date().toISOString(),
      }).eq('id', delivery.id);
      await sb.from('connect_webhook_endpoints').update({ last_delivered_at: new Date().toISOString(), failure_count: 0 }).eq('id', ep.id);
      return true;
    }
    return await fail(`HTTP ${resp.status}`, resp.status);
  } catch (e: any) {
    return await fail(e?.name === 'AbortError' ? 'Timed out after 5s' : e?.message || 'Delivery error', null);
  }
}

/** Deliver due webhooks. Claims each row first so overlapping runs do not double-send. */
export async function processDue(sb: any, max = 20) {
  const nowIso = new Date().toISOString();
  const { data: due } = await sb.from('connect_webhook_deliveries').select('*')
    .eq('status', 'pending').lte('next_attempt_at', nowIso).order('next_attempt_at').limit(max);
  let delivered = 0, failed = 0;
  for (const d of due || []) {
    const { data: claimed } = await sb.from('connect_webhook_deliveries')
      .update({ next_attempt_at: new Date(Date.now() + 5 * 60000).toISOString() })
      .eq('id', d.id).eq('status', 'pending').lte('next_attempt_at', nowIso).select('id');
    if (!claimed?.length) continue;
    (await deliverOne(sb, d)) ? delivered++ : failed++;
  }
  return { processed: delivered + failed, delivered, failed };
}

// ---------------------------------------------------------------- admin auth
export async function requireAdmin(req: any, sb: any) {
  const token = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!token) throw new HttpError(401, 'unauthorized', 'Authentication required.');
  const { data, error } = await sb.auth.getUser(token);
  if (error || !data?.user) throw new HttpError(401, 'unauthorized', 'Invalid session.');
  const { data: row } = await sb.from('admin_users').select('id').eq('user_id', data.user.id).maybeSingle();
  if (!row) throw new HttpError(403, 'forbidden', 'Master admin access required.');
  return data.user as { id: string; email?: string };
}

// ---------------------------------------------------------------- key auth
export async function authenticateKey(req: any, sb: any) {
  const raw = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '').trim();
  if (!raw.startsWith('amo_')) throw new HttpError(401, 'unauthorized', 'Send your key as "Authorization: Bearer amo_live_...".');
  const { data: key } = await sb.from('connect_api_keys').select('*').eq('key_hash', sha256(raw)).maybeSingle();
  if (!key || !key.is_active || key.revoked_at) throw new HttpError(401, 'unauthorized', 'Invalid or revoked API key.');
  if (key.expires_at && new Date(key.expires_at).getTime() < Date.now()) throw new HttpError(401, 'key_expired', 'This API key has expired.');
  const { data: ok } = await sb.rpc('connect_rate_hit', { p_key: key.id, p_limit: key.rate_limit_per_minute });
  if (ok === false) throw new HttpError(429, 'rate_limited', `Rate limit of ${key.rate_limit_per_minute}/minute exceeded. Retry shortly.`);
  sb.from('connect_api_keys').update({ last_used_at: new Date().toISOString() }).eq('id', key.id).then(() => {}, () => {});
  return key as { id: string; scopes: string[]; environment: 'live' | 'test'; name: string; rate_limit_per_minute: number };
}
