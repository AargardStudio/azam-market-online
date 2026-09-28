// Vercel Serverless Function — mirrors the /api/stripe/create-checkout-session
// route in server.ts (which is only used for local dev via `npm run dev`).
// Vercel doesn't run server.ts at all; every file under /api becomes its own
// function automatically.
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;
  const supabaseAdmin =
    process.env.VITE_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
      ? createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
      : null;

  if (!stripe || !supabaseAdmin) {
    return res.status(503).json({
      error:
        'Stripe is not configured yet. Add STRIPE_SECRET_KEY, STRIPE_PRICE_ID, VITE_SUPABASE_URL, and SUPABASE_SERVICE_ROLE_KEY as Environment Variables in the Vercel project settings.',
    });
  }

  const { vendorId } = req.body || {};
  if (!vendorId) return res.status(400).json({ error: 'vendorId is required' });

  try {
    const { data: vendor, error } = await supabaseAdmin
      .from('vendors')
      .select('id, email, shop_name, stripe_customer_id')
      .eq('id', vendorId)
      .single();
    if (error || !vendor) return res.status(404).json({ error: 'Vendor not found' });

    // Set APP_URL in Vercel's env vars to your production domain
    // (e.g. https://azammarketonline.vercel.app or your custom domain).
    // Falls back to the request's own host if it isn't set.
    const appUrl = process.env.APP_URL || `https://${req.headers.host}`;

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: vendor.stripe_customer_id || undefined,
      customer_email: vendor.stripe_customer_id ? undefined : vendor.email,
      line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
      success_url: `${appUrl}/?subscribed=1`,
      cancel_url: `${appUrl}/`,
      metadata: { vendor_id: vendor.id },
      subscription_data: { metadata: { vendor_id: vendor.id } },
    });

    res.json({ url: session.url });
  } catch (err: any) {
    console.error('Error creating Stripe checkout session:', err);
    res.status(500).json({ error: err.message || 'Could not create checkout session' });
  }
}
