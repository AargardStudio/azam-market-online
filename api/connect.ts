import {
  db, authenticateKey, HttpError, SCOPES, WEBHOOK_EVENTS, VENDOR_FIELDS, PRODUCT_FIELDS, TIER_FIELDS,
  slugify, ipHash, processDue,
} from './_connect/lib.js';
import { openApiSpec } from './_connect/openapi.js';

// Aargard Connect V2.0 — admin API for controlling the marketplace.
// Public URL: /api/connect/v1/* (rewritten here by vercel.json).

const VERSION = '2.0.0';
const clampInt = (v: any, d: number, min: number, max: number) => {
  const n = parseInt(String(v ?? ''), 10);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : d;
};
const publicVendor = (v: any) => {
  const { stripe_customer_id, stripe_subscription_id, user_id, ...rest } = v || {};
  return rest;
};
const need = (key: any, scope: string, write = false) => {
  if (!key.scopes.includes(scope)) throw new HttpError(403, 'insufficient_scope', `This key lacks the "${scope}" scope.`);
  if (write && key.environment === 'test') throw new HttpError(403, 'test_key_read_only', 'Test keys are read-only. Use a live key for changes.');
};
const bodyOf = (req: any) => (typeof req.body === 'string' ? safeJson(req.body) : req.body) || {};
const safeJson = (s: string) => { try { return JSON.parse(s); } catch { throw new HttpError(400, 'invalid_json', 'Body must be valid JSON.'); } };
const pick = (src: any, allowed: string[]) => {
  const out: any = {};
  for (const [k, v] of Object.entries(src || {})) {
    if (!allowed.includes(k)) throw new HttpError(400, 'field_not_allowed', `Field "${k}" cannot be set. Allowed: ${allowed.join(', ')}`);
    out[k] = v;
  }
  if (!Object.keys(out).length) throw new HttpError(400, 'empty_update', 'No fields supplied.');
  return out;
};
const dbErr = (error: any) => { if (error) throw new HttpError(400, 'database_error', error.message); };

async function findVendor(sb: any, ref: string) {
  const isUuid = /^[0-9a-f-]{36}$/i.test(ref);
  const q = sb.from('vendors').select('*');
  const { data } = await (isUuid ? q.eq('id', ref) : q.eq('slug', ref)).maybeSingle();
  if (!data) throw new HttpError(404, 'not_found', 'Shop not found.');
  return data;
}

export default async function handler(req: any, res: any) {
  const requestId = Math.random().toString(36).slice(2, 10);
  res.setHeader('X-Request-Id', requestId);
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const raw = req.query?.path;
  const path = (Array.isArray(raw) ? raw.join('/') : String(raw || '')).replace(/^\/?(v1\/)?/, '').replace(/\/+$/, '');
  const seg = path.split('/').filter(Boolean);
  const method = String(req.method);
  let key: any = null;
  let status = 200;
  let sb: any = null;

  let pending: { code: number; body: any } = { code: 500, body: {} };
  // The response is sent only after logging/delivery work, because Vercel may freeze the function once it responds.
  const send = (code: number, body: any) => { status = code; pending = { code, body }; };

  try {
    // ---- unauthenticated
    if (method === 'GET' && (path === 'health' || path === '')) {
      return send(200, { status: 'ok', service: 'aargard-connect', version: VERSION, time: new Date().toISOString() });
    }
    if (method === 'GET' && path === 'openapi.json') return send(200, openApiSpec(VERSION));

    sb = db();
    key = await authenticateKey(req, sb);
    const q = req.query || {};
    const body = ['POST', 'PATCH'].includes(method) ? bodyOf(req) : {};
    const ok = (data: any, meta?: any) => send(200, { data, ...(meta ? { meta } : {}), request_id: requestId });
    const created = (data: any) => send(201, { data, request_id: requestId });

    // ---- capabilities
    if (method === 'GET' && path === 'capabilities') {
      return ok({
        service: 'aargard-connect', version: VERSION, app: 'Azam Market Online',
        key: { name: key.name, environment: key.environment, scopes: key.scopes, rate_limit_per_minute: key.rate_limit_per_minute },
        available_scopes: SCOPES, webhook_events: WEBHOOK_EVENTS,
        not_available: ['orders', 'customers', 'carts', 'payments between buyers and shops'],
        core_interop: 'Aargard Connect Core is not deployed; no cross-app integration is claimed.',
      });
    }

    // ---- marketplace stats
    if (method === 'GET' && path === 'stats') {
      need(key, 'marketplace:read');
      const since = new Date(Date.now() - 30 * 86400000).toISOString();
      const [v, p, logs] = await Promise.all([
        sb.from('vendors').select('status,subscription_status'),
        sb.from('products').select('id', { count: 'exact', head: true }),
        sb.from('inquiry_logs').select('event_type,created_at').gte('created_at', since).limit(20000),
      ]);
      const byStatus: any = {}, bySub: any = {}, a7: any = {}, a30: any = {};
      (v.data || []).forEach((r: any) => {
        byStatus[r.status] = (byStatus[r.status] || 0) + 1;
        bySub[r.subscription_status] = (bySub[r.subscription_status] || 0) + 1;
      });
      const week = Date.now() - 7 * 86400000;
      (logs.data || []).forEach((r: any) => {
        a30[r.event_type] = (a30[r.event_type] || 0) + 1;
        if (new Date(r.created_at).getTime() >= week) a7[r.event_type] = (a7[r.event_type] || 0) + 1;
      });
      return ok({ shops_by_status: byStatus, shops_by_subscription: bySub, products: p.count ?? 0, activity_last_7_days: a7, activity_last_30_days: a30 });
    }

    // ---- vendors
    if (seg[0] === 'vendors') {
      if (method === 'GET' && seg.length === 1) {
        need(key, 'vendors:read');
        const limit = clampInt(q.limit, 50, 1, 100), offset = clampInt(q.offset, 0, 0, 100000);
        let qb = sb.from('vendors').select('*', { count: 'exact' }).order('created_at', { ascending: false }).range(offset, offset + limit - 1);
        if (q.status) qb = qb.eq('status', String(q.status));
        if (q.market_id) qb = qb.eq('market_id', String(q.market_id));
        if (q.tier_id) qb = qb.eq('tier_id', String(q.tier_id));
        if (q.subscription_status) qb = qb.eq('subscription_status', String(q.subscription_status));
        const { data, error, count } = await qb; dbErr(error);
        return ok((data || []).map(publicVendor), { total: count, limit, offset });
      }
      if (method === 'GET' && seg.length === 2) {
        need(key, 'vendors:read');
        return ok(publicVendor(await findVendor(sb, seg[1])));
      }
      if (method === 'PATCH' && seg.length === 2) {
        need(key, 'vendors:write', true);
        const v = await findVendor(sb, seg[1]);
        const patch = pick(body, VENDOR_FIELDS);
        if ('status' in patch && !['pending', 'active', 'suspended'].includes(patch.status)) throw new HttpError(400, 'invalid_status', 'status must be pending, active or suspended.');
        const { data, error } = await sb.from('vendors').update(patch).eq('id', v.id).select('*').single(); dbErr(error);
        return ok(publicVendor(data));
      }
      if (method === 'POST' && seg.length === 3 && ['approve', 'suspend', 'reinstate'].includes(seg[2])) {
        need(key, 'vendors:write', true);
        const v = await findVendor(sb, seg[1]);
        const next = seg[2] === 'suspend' ? 'suspended' : 'active';
        const { error } = await sb.from('vendors').update({ status: next }).eq('id', v.id); dbErr(error);
        return ok({ id: v.id, shop_name: v.shop_name, previous_status: v.status, status: next });
      }
      if (method === 'POST' && seg.length === 3 && seg[2] === 'extend-trial') {
        need(key, 'vendors:write', true);
        const days = Number(body.days);
        if (!Number.isInteger(days) || days < 1 || days > 365) throw new HttpError(400, 'invalid_days', 'days must be an integer between 1 and 365.');
        const v = await findVendor(sb, seg[1]);
        const cur = v.trial_ends_at ? new Date(v.trial_ends_at).getTime() : 0;
        const next = new Date(Math.max(cur, Date.now()) + days * 86400000).toISOString();
        const { error } = await sb.from('vendors').update({ trial_ends_at: next, subscription_status: 'trialing' }).eq('id', v.id); dbErr(error);
        return ok({ id: v.id, shop_name: v.shop_name, trial_ends_at: next });
      }
    }

    // ---- products
    if (seg[0] === 'products') {
      if (method === 'GET' && seg.length === 1) {
        need(key, 'products:read');
        const limit = clampInt(q.limit, 50, 1, 100), offset = clampInt(q.offset, 0, 0, 100000);
        let qb = sb.from('products').select('id,vendor_id,name,description,fabric_type,price_range,moq,image_url,is_active,sort_order,created_at', { count: 'exact' })
          .order('created_at', { ascending: false }).range(offset, offset + limit - 1);
        if (q.vendor_id) qb = qb.eq('vendor_id', String(q.vendor_id));
        if (q.active !== undefined) qb = qb.eq('is_active', String(q.active) === 'true');
        const { data, error, count } = await qb; dbErr(error);
        return ok(data, { total: count, limit, offset });
      }
      if (method === 'GET' && seg.length === 2) {
        need(key, 'products:read');
        const { data } = await sb.from('products').select('*').eq('id', seg[1]).maybeSingle();
        if (!data) throw new HttpError(404, 'not_found', 'Product not found.');
        return ok(data);
      }
      if (method === 'POST' && seg.length === 1) {
        need(key, 'products:write', true);
        const v = await findVendor(sb, String(body.vendor_id || ''));
        const { vendor_id, ...rest } = body;
        if (!rest.name || typeof rest.name !== 'string') throw new HttpError(400, 'invalid_name', 'name is required.');
        const row: any = { vendor_id: v.id, ...pick(rest, PRODUCT_FIELDS) };
        if (row.image_url) row.image_urls = [row.image_url];
        const { data, error } = await sb.from('products').insert(row).select('*').single(); dbErr(error);
        return created(data);
      }
      if (method === 'PATCH' && seg.length === 2) {
        need(key, 'products:write', true);
        const patch = pick(body, PRODUCT_FIELDS);
        if (patch.image_url) patch.image_urls = [patch.image_url];
        const { data, error } = await sb.from('products').update(patch).eq('id', seg[1]).select('*').maybeSingle(); dbErr(error);
        if (!data) throw new HttpError(404, 'not_found', 'Product not found.');
        return ok(data);
      }
    }

    // ---- catalog
    if (method === 'GET' && ['categories', 'markets', 'tiers'].includes(seg[0]) && seg.length === 1) {
      need(key, 'catalog:read');
      const table = seg[0] === 'tiers' ? 'subscription_tiers' : seg[0];
      const { data, error } = await sb.from(table).select('*'); dbErr(error);
      return ok(data);
    }
    if (method === 'POST' && seg[0] === 'categories' && seg.length === 1) {
      need(key, 'catalog:write', true);
      const name = String(body.name || '').trim();
      if (!name) throw new HttpError(400, 'invalid_name', 'name is required.');
      const { data: m } = await sb.from('markets').select('id').order('created_at').limit(1);
      const { data, error } = await sb.from('categories').insert({ name, icon: body.icon || '🧵', slug: slugify(name), market_id: body.market_id || m?.[0]?.id || null }).select('*').single(); dbErr(error);
      return created(data);
    }
    if (method === 'POST' && seg[0] === 'markets' && seg.length === 1) {
      need(key, 'catalog:write', true);
      const name = String(body.name || '').trim(), city = String(body.city || '').trim();
      if (!name || !city) throw new HttpError(400, 'invalid_body', 'name and city are required.');
      const { data, error } = await sb.from('markets').insert({ name, city, slug: slugify(name), country: body.country || 'Pakistan' }).select('*').single(); dbErr(error);
      return created(data);
    }
    if (method === 'PATCH' && seg[0] === 'tiers' && seg.length === 2) {
      need(key, 'tiers:write', true);
      const { data, error } = await sb.from('subscription_tiers').update(pick(body, TIER_FIELDS)).eq('id', seg[1]).select('*').maybeSingle(); dbErr(error);
      if (!data) throw new HttpError(404, 'not_found', 'Tier not found.');
      return ok(data);
    }

    // ---- inquiries
    if (method === 'GET' && path === 'inquiries') {
      need(key, 'inquiries:read');
      const limit = clampInt(q.limit, 100, 1, 500), offset = clampInt(q.offset, 0, 0, 1000000);
      let qb = sb.from('inquiry_logs').select('id,vendor_id,event_type,catalogue_id,created_at', { count: 'exact' })
        .order('created_at', { ascending: false }).range(offset, offset + limit - 1);
      if (q.vendor_id) qb = qb.eq('vendor_id', String(q.vendor_id));
      if (q.type) qb = qb.eq('event_type', String(q.type));
      if (q.since) qb = qb.gte('created_at', String(q.since));
      const { data, error, count } = await qb; dbErr(error);
      return ok(data, { total: count, limit, offset });
    }

    throw new HttpError(404, 'not_found', `No route for ${method} /${path}.`);
  } catch (e: any) {
    const err = e instanceof HttpError ? e : new HttpError(500, 'internal_error', 'Unexpected server error.');
    if (!(e instanceof HttpError)) console.error('[connect]', requestId, e);
    send(err.status, { error: { code: err.code, message: err.message }, request_id: requestId });
  } finally {
    if (sb && key) {
      try {
        await sb.from('connect_audit_log').insert({
          key_id: key.id, actor: 'api', method, path: `/${path}`.slice(0, 200), status, ip_hash: ipHash(req),
        });
        if (method !== 'GET') await processDue(sb, 5); // opportunistic webhook delivery after changes
      } catch { /* logging must never break a response */ }
    }
    res.status(pending.code).json(pending.body);
  }
}
