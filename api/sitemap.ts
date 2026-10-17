import { createClient } from '@supabase/supabase-js';

const SITE_URL = 'https://www.azammarketonline.com';

const escapeXml = (value: string) =>
  value.replace(/[<>&'\"]/g, (character) => {
    const entities: Record<string, string> = {
      '<': '&lt;',
      '>': '&gt;',
      '&': '&amp;',
      "'": '&apos;',
      '"': '&quot;',
    };
    return entities[character];
  });

const urlEntry = (url: string, lastModified?: string, priority = '0.8') => `
  <url>
    <loc>${escapeXml(url)}</loc>${
      lastModified ? `\n    <lastmod>${escapeXml(lastModified.slice(0, 10))}</lastmod>` : ''
    }
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
  </url>`;

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    return res.status(405).send('Method not allowed');
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const publishableKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;
  let dynamicEntries = '';

  if (supabaseUrl && publishableKey) {
    const supabase = createClient(supabaseUrl, publishableKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });
    const [vendorsResult, categoriesResult, marketsResult] = await Promise.all([
      supabase.from('vendors').select('slug,updated_at').eq('status', 'active').order('updated_at', { ascending: false }),
      supabase.from('categories').select('slug').order('name'),
      supabase.from('markets').select('slug,created_at').eq('is_active', true).order('name'),
    ]);

    if (vendorsResult.error || categoriesResult.error || marketsResult.error) {
      console.error('Could not load all public sitemap records:', {
        vendors: vendorsResult.error?.message,
        categories: categoriesResult.error?.message,
        markets: marketsResult.error?.message,
      });
    } else {
      const vendorEntries = (vendorsResult.data || [])
        .filter((vendor) => vendor.slug)
        .map((vendor) =>
          urlEntry(`${SITE_URL}/shops/${encodeURIComponent(vendor.slug)}`, vendor.updated_at, '0.8')
        )
        .join('');
      const categoryEntries = (categoriesResult.data || [])
        .filter((category) => category.slug)
        .map((category) => urlEntry(`${SITE_URL}/categories/${encodeURIComponent(category.slug)}`, undefined, '0.7'))
        .join('');
      const marketEntries = (marketsResult.data || [])
        .filter((market) => market.slug)
        .map((market) => urlEntry(`${SITE_URL}/markets/${encodeURIComponent(market.slug)}`, market.created_at, '0.8'))
        .join('');
      dynamicEntries = `${marketEntries}${categoryEntries}${vendorEntries}`;
    }
  } else {
    console.error('Sitemap is missing the public Supabase URL or publishable key.');
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urlEntry(SITE_URL, undefined, '1.0')}${dynamicEntries}
</urlset>\n`;

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
  return res.status(200).send(req.method === 'HEAD' ? '' : xml);
}

