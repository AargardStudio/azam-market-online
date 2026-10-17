import { createClient } from '@supabase/supabase-js';

// Keep server-only helpers inside the serverless bundle instead of crossing into
// the browser source tree, which can make Vercel fail while loading the function.
const normalizePakistanPhone = (value: string): string => {
  const digits = value.replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('92')) return `+${digits}`;
  if (digits.startsWith('0')) return `+92${digits.slice(1)}`;
  if (digits.length === 10 && digits.startsWith('3')) return `+92${digits}`;
  return value.trim().startsWith('+') ? `+${digits}` : '';
};

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const url = process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    return res.status(503).json({ error: 'Server authentication is not configured.' });
  }

  const token = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!token) return res.status(401).json({ error: 'Authentication required.' });

  const admin = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
  const { data: userData, error: userError } = await admin.auth.getUser(token);
  if (userError || !userData.user) return res.status(401).json({ error: 'Invalid session.' });

  const { data: adminRow } = await admin
    .from('admin_users')
    .select('id')
    .eq('user_id', userData.user.id)
    .maybeSingle();
  if (!adminRow) return res.status(403).json({ error: 'Master admin access required.' });

  const vendorId = String(req.body?.vendorId || '');
  const phone = normalizePakistanPhone(String(req.body?.phone || ''));
  const password = String(req.body?.password || '');
  if (!vendorId || !phone) return res.status(400).json({ error: 'A valid Pakistani mobile number is required.' });
  if (password.length < 8) return res.status(400).json({ error: 'Password must contain at least 8 characters.' });

  const { data: vendor, error: vendorError } = await admin
    .from('vendors')
    .select('id,shop_name,user_id')
    .eq('id', vendorId)
    .single();
  if (vendorError || !vendor) return res.status(404).json({ error: 'Shop not found.' });
  if (vendor.user_id) return res.status(409).json({ error: 'This shop already has a login account.' });

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    phone,
    password,
    phone_confirm: true,
    user_metadata: { vendor_id: vendor.id, shop_name: vendor.shop_name },
  });
  if (createError || !created.user) {
    return res.status(createError?.status || 400).json({ error: createError?.message || 'Could not create login.' });
  }

  const { error: linkError } = await admin
    .from('vendors')
    .update({ user_id: created.user.id, phone })
    .eq('id', vendor.id);
  if (linkError) {
    await admin.auth.admin.deleteUser(created.user.id);
    return res.status(500).json({ error: 'The login was not linked to the shop.' });
  }

  return res.status(201).json({ ok: true, phone });
}

