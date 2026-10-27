import { db, processDue } from './_connect/lib.js';

// Called by Vercel Cron (see vercel.json). Vercel sends "Authorization: Bearer $CRON_SECRET".
export default async function handler(req: any, res: any) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.authorization !== `Bearer ${secret}`) return res.status(401).json({ error: 'Unauthorized' });
  const sb = db();
  const result = await processDue(sb, 50);
  const cutoff = (days: number) => new Date(Date.now() - days * 86400000).toISOString();
  await sb.from('connect_audit_log').delete().lt('created_at', cutoff(30));
  await sb.from('connect_rate_hits').delete().lt('window_start', cutoff(1));
  await sb.from('connect_webhook_deliveries').delete().neq('status', 'pending').lt('created_at', cutoff(30));
  return res.status(200).json({ ok: true, ...result });
}
