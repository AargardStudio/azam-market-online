import {
  db, requireAdmin, HttpError, SCOPES, WEBHOOK_EVENTS, newApiKey, newWebhookSecret,
  assertPublicHttpsUrl, processDue, deliverOne,
} from './_connect/lib.js';

// Backend for the admin "API & Integrations" screen. Requires a Supabase admin session.
export default async function handler(req: any, res: any) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ error: 'Method not allowed' }); }
  try {
    const sb = db();
    const admin = await requireAdmin(req, sb);
    const b = (typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body) || {};
    const audit = (detail: string) =>
      sb.from('connect_audit_log').insert({ actor: `admin:${admin.email || admin.id}`, method: 'ADMIN', path: String(b.action), status: 200, detail });
    const wrap = (data: any) => res.status(200).json({ data });

    switch (b.action) {
      case 'overview': {
        const [keys, eps, dels, logs] = await Promise.all([
          sb.from('connect_api_keys').select('id,name,environment,key_prefix,scopes,rate_limit_per_minute,is_active,expires_at,created_at,last_used_at,revoked_at').order('created_at', { ascending: false }),
          sb.from('connect_webhook_endpoints').select('id,name,url,events,is_active,failure_count,last_delivered_at,created_at').order('created_at', { ascending: false }),
          sb.from('connect_webhook_deliveries').select('id,endpoint_id,event,status,attempts,next_attempt_at,last_status_code,last_error,created_at,delivered_at').order('created_at', { ascending: false }).limit(50),
          sb.from('connect_audit_log').select('*').order('created_at', { ascending: false }).limit(100),
        ]);
        const missing = [keys, eps, dels, logs].find((r: any) => r.error);
        if (missing) throw new HttpError(503, 'migration_missing', 'Aargard Connect tables are missing. Run supabase/migrations/20261027120000_aargard_connect.sql in the Supabase SQL Editor.');
        return wrap({ keys: keys.data, endpoints: eps.data, deliveries: dels.data, logs: logs.data, scopes: SCOPES, events: WEBHOOK_EVENTS });
      }
      case 'create_key': {
        const name = String(b.name || '').trim();
        if (!name) throw new HttpError(400, 'invalid_name', 'Give the key a name.');
        const scopes = (Array.isArray(b.scopes) ? b.scopes : []).filter((s: string) => s in SCOPES);
        if (!scopes.length) throw new HttpError(400, 'invalid_scopes', 'Pick at least one scope.');
        const env = b.environment === 'test' ? 'test' : 'live';
        const rl = Math.min(10000, Math.max(1, parseInt(b.rate_limit_per_minute, 10) || 60));
        const days = parseInt(b.expires_in_days, 10);
        const k = newApiKey(env);
        const { error } = await sb.from('connect_api_keys').insert({
          name, environment: env, key_prefix: k.prefix, key_hash: k.hash, scopes, rate_limit_per_minute: rl,
          expires_at: days > 0 ? new Date(Date.now() + days * 86400000).toISOString() : null, created_by: admin.id,
        });
        if (error) throw new HttpError(400, 'database_error', error.message);
        await audit(`created key ${k.prefix}… (${name})`);
        return wrap({ key: k.raw, note: 'Copy this key now. It is stored hashed and cannot be shown again.' });
      }
      case 'revoke_key': {
        const { error } = await sb.from('connect_api_keys').update({ is_active: false, revoked_at: new Date().toISOString() }).eq('id', b.id);
        if (error) throw new HttpError(400, 'database_error', error.message);
        await audit(`revoked key ${b.id}`);
        return wrap({ ok: true });
      }
      case 'create_webhook': {
        const name = String(b.name || '').trim();
        if (!name) throw new HttpError(400, 'invalid_name', 'Give the endpoint a name.');
        await assertPublicHttpsUrl(String(b.url || ''));
        const events = (Array.isArray(b.events) ? b.events : []).filter((e: string) => e === '*' || WEBHOOK_EVENTS.includes(e));
        if (!events.length) throw new HttpError(400, 'invalid_events', 'Pick at least one event.');
        const secret = newWebhookSecret();
        const { data, error } = await sb.from('connect_webhook_endpoints').insert({ name, url: String(b.url).trim(), events, secret }).select('id').single();
        if (error) throw new HttpError(400, 'database_error', error.message);
        await audit(`created webhook ${name}`);
        return wrap({ id: data.id, secret, note: 'Copy the signing secret now; it is not shown again.' });
      }
      case 'set_webhook_active': {
        await sb.from('connect_webhook_endpoints').update({ is_active: !!b.is_active, failure_count: 0 }).eq('id', b.id);
        await audit(`webhook ${b.id} active=${!!b.is_active}`);
        return wrap({ ok: true });
      }
      case 'rotate_webhook_secret': {
        const secret = newWebhookSecret();
        await sb.from('connect_webhook_endpoints').update({ secret }).eq('id', b.id);
        await audit(`rotated secret for webhook ${b.id}`);
        return wrap({ secret });
      }
      case 'delete_webhook': {
        await sb.from('connect_webhook_endpoints').delete().eq('id', b.id);
        await audit(`deleted webhook ${b.id}`);
        return wrap({ ok: true });
      }
      case 'test_webhook': {
        const { data: ep } = await sb.from('connect_webhook_endpoints').select('id').eq('id', b.id).maybeSingle();
        if (!ep) throw new HttpError(404, 'not_found', 'Endpoint not found.');
        const { data: d, error } = await sb.from('connect_webhook_deliveries').insert({
          endpoint_id: ep.id, event: 'connect.ping',
          payload: { id: crypto.randomUUID(), event: 'connect.ping', created_at: new Date().toISOString(), data: { message: 'Test event from Aargard Connect' } },
        }).select('*').single();
        if (error) throw new HttpError(400, 'database_error', error.message);
        const ok = await deliverOne(sb, d);
        const { data: after } = await sb.from('connect_webhook_deliveries').select('status,last_status_code,last_error').eq('id', d.id).single();
        return wrap({ delivered: ok, ...after });
      }
      case 'retry_delivery': {
        await sb.from('connect_webhook_deliveries').update({ status: 'pending', next_attempt_at: new Date().toISOString(), attempts: 0 }).eq('id', b.id);
        return wrap({ ok: true, ...(await processDue(sb, 5)) });
      }
      case 'run_deliveries':
        return wrap(await processDue(sb, 25));
      case 'health': {
        const checks: { name: string; ok: boolean; detail: string }[] = [];
        const probe = async (name: string, table: string) => {
          const r = await sb.from(table).select('*', { count: 'exact', head: true });
          checks.push({ name: `Table ${table}`, ok: !r.error, detail: r.error ? r.error.message : `${r.count ?? 0} rows` });
        };
        for (const t of ['connect_api_keys', 'connect_webhook_endpoints', 'connect_webhook_deliveries', 'connect_audit_log', 'connect_rate_hits']) await probe('', t);
        const rl = await sb.rpc('connect_rate_hit', { p_key: '00000000-0000-0000-0000-000000000000', p_limit: 1000 });
        checks.push({ name: 'Rate limiter function', ok: !rl.error, detail: rl.error ? rl.error.message : 'ok' });
        await sb.from('connect_rate_hits').delete().eq('key_id', '00000000-0000-0000-0000-000000000000');
        checks.push({ name: 'CRON_SECRET set (webhook retries)', ok: !!process.env.CRON_SECRET, detail: process.env.CRON_SECRET ? 'configured' : 'Add CRON_SECRET in Vercel env vars so Vercel Cron can authenticate' });
        const pend = await sb.from('connect_webhook_deliveries').select('id', { count: 'exact', head: true }).eq('status', 'pending');
        checks.push({ name: 'Pending webhook deliveries', ok: (pend.count ?? 0) < 100, detail: String(pend.count ?? 0) });
        return wrap({ checks, all_ok: checks.every((c) => c.ok) });
      }
      default:
        throw new HttpError(400, 'unknown_action', 'Unknown action.');
    }
  } catch (e: any) {
    if (e instanceof HttpError) return res.status(e.status).json({ error: e.message, code: e.code });
    console.error('[connect-manage]', e);
    return res.status(500).json({ error: 'Unexpected server error.' });
  }
}
