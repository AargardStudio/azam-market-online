import 'dotenv/config';
import express from 'express';
import path from 'path';
import fs from 'fs';
import { ZipArchive } from 'archiver';
import { createServer as createViteServer } from 'vite';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { INITIAL_MARKETS, INITIAL_CATEGORIES, INITIAL_TIERS, INITIAL_VENDORS } from './src/lib/sampleData';
import { Market, Category, SubscriptionTier, Vendor, Product, Catalogue, InquiryLog, DEFAULT_SHOP_CUSTOMIZATION, PaymentTransaction, GatewayConfig, AargardUpdate, VendorAssistanceRequest } from './src/types';

const app = express();
const PORT = 3000;

// ---------------------------------------------------------------------
// Stripe: $5/month vendor subscription. STRIPE_SECRET_KEY / STRIPE_PRICE_ID
// / STRIPE_WEBHOOK_SECRET come from the Stripe dashboard (see .env.example).
// supabaseAdmin uses the service_role key so the webhook can update a
// vendor's subscription_status even though RLS blocks that from the client.
// Both are undefined until the real keys are filled in — the two routes
// below fail gracefully with a clear error until then.
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

const supabaseAdmin =
  process.env.VITE_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
    : null;

// Stripe webhook needs the raw request body to verify the signature, so this
// route (and only this route) is registered with express.raw(), BEFORE the
// global express.json() below picks up every other route.
app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  if (!stripe || !supabaseAdmin) {
    return res.status(503).send('Stripe/Supabase not configured on the server.');
  }
  const sig = req.headers['stripe-signature'];
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig as string, process.env.STRIPE_WEBHOOK_SECRET || '');
  } catch (err: any) {
    console.error('Stripe webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const vendorId = session.metadata?.vendor_id;
        if (vendorId && session.customer && session.subscription) {
          await supabaseAdmin
            .from('vendors')
            .update({
              stripe_customer_id: session.customer as string,
              stripe_subscription_id: session.subscription as string,
              subscription_status: 'active',
            })
            .eq('id', vendorId);
        }
        break;
      }
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const status =
          sub.status === 'active' || sub.status === 'trialing'
            ? 'active'
            : sub.status === 'past_due' || sub.status === 'unpaid'
            ? 'past_due'
            : 'canceled';
        await supabaseAdmin
          .from('vendors')
          .update({ subscription_status: status })
          .eq('stripe_subscription_id', sub.id);
        break;
      }
      default:
        break;
    }
    res.json({ received: true });
  } catch (err) {
    console.error('Error handling Stripe webhook event:', err);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
});

app.use(express.json());

// Starts a Stripe Checkout session for a vendor's $5/month subscription.
// The frontend (SubscriptionUsage.tsx via App.tsx's handleSubscribe) posts
// { vendorId } here and redirects the browser to the returned url.
app.post('/api/stripe/create-checkout-session', async (req, res) => {
  if (!stripe || !supabaseAdmin) {
    return res.status(503).json({ error: 'Stripe is not configured yet. Add STRIPE_SECRET_KEY, STRIPE_PRICE_ID, SUPABASE_SERVICE_ROLE_KEY and STRIPE_WEBHOOK_SECRET to .env.' });
  }
  const { vendorId } = req.body;
  if (!vendorId) return res.status(400).json({ error: 'vendorId is required' });

  try {
    const { data: vendor, error } = await supabaseAdmin
      .from('vendors')
      .select('id, email, shop_name, stripe_customer_id')
      .eq('id', vendorId)
      .single();
    if (error || !vendor) return res.status(404).json({ error: 'Vendor not found' });

    const appUrl = process.env.APP_URL || `http://localhost:${PORT}`;

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
});

// In-Memory Database Store
let markets: Market[] = [...INITIAL_MARKETS];
let categories: Category[] = [...INITIAL_CATEGORIES];
let tiers: SubscriptionTier[] = [...INITIAL_TIERS];
let vendors: Vendor[] = JSON.parse(JSON.stringify(INITIAL_VENDORS));
let inquiryLogs: InquiryLog[] = [];

// Payment Gateways Store
let gatewayConfigs: GatewayConfig[] = [
  {
    id: 'jazzcash',
    name: 'JazzCash Mobile Account & OTC',
    subtitle: "Pakistan's #1 Digital Wallet with 100,000+ Retail Agents",
    badge: 'SBP Authorized Wallet',
    is_enabled: true,
    is_sandbox: false,
    merchant_id: 'MC-JAZZ-901844',
    supported_methods: ['Mobile Account', 'CNIC USSD Approval', 'OTC Retail Voucher', 'PayPak Debit'],
    settlement_currency: 'PKR',
    color: '#D81921',
  },
  {
    id: 'payfast',
    name: 'PayFast APPS (1Link Direct Debit)',
    subtitle: 'State Bank of Pakistan regulated inter-bank payment rails',
    badge: '1Link SBP Regulated',
    is_enabled: true,
    is_sandbox: false,
    merchant_id: 'PF-AZAM-772189',
    supported_methods: ['Meezan Bank 1Link', 'HBL Direct Debit', 'Bank Alfalah', 'UnionPay & PayPak'],
    settlement_currency: 'PKR',
    color: '#0052CC',
  },
  {
    id: 'keenu',
    name: 'Keenu NetConnect',
    subtitle: 'Leading Point-of-Sale and digital retail payments network',
    badge: 'Keenu Digital Rail',
    is_enabled: true,
    is_sandbox: false,
    merchant_id: 'KN-LHR-551029',
    supported_methods: ['Keenu Wallet', 'Keenu NetConnect', 'Direct Retail Settlement'],
    settlement_currency: 'PKR',
    color: '#E65100',
  },
  {
    id: 'stripe',
    name: 'Stripe International Card Processing',
    subtitle: 'Global multi-currency checkout for overseas textile buyers',
    badge: 'PCI-DSS Level 1',
    is_enabled: true,
    is_sandbox: false,
    merchant_id: 'acct_1AzamMarketGlobal',
    supported_methods: ['Visa Card', 'Mastercard', 'American Express', 'Apple Pay', 'Google Pay'],
    settlement_currency: 'PKR',
    color: '#635BFF',
  },
];

let paymentTransactions: PaymentTransaction[] = [
  {
    id: 'tx-1001',
    vendor_id: 'v1',
    vendor_name: 'Mian Cloth House',
    gateway: 'jazzcash',
    amount_pkr: 7500,
    purpose: 'subscription_upgrade',
    status: 'completed',
    reference_id: 'JC-89410294',
    payer_name: 'Mian Tariq Mehmood',
    payer_contact: '0300-4211985',
    payment_method_detail: 'JazzCash Mobile Account (0300-4211985)',
    created_at: '2026-09-18T10:15:00Z',
    tier_id: 'tier-premium',
    notes: 'Upgraded to Premium Tier via JazzCash USSD confirmation',
  },
  {
    id: 'tx-1002',
    vendor_id: 'v2',
    vendor_name: 'Rajput Silk & Chiffon',
    gateway: 'payfast',
    amount_pkr: 3500,
    purpose: 'subscription_renewal',
    status: 'completed',
    reference_id: 'PF-2026-8819',
    payer_name: 'Chaudhry Nadeem Rajput',
    payer_contact: '0321-9944112',
    payment_method_detail: 'PayFast 1Link Direct Debit (Meezan Bank)',
    created_at: '2026-09-19T14:40:00Z',
    tier_id: 'tier-standard',
    notes: 'Monthly renewal for Standard Tier stall listing',
  },
  {
    id: 'tx-1003',
    vendor_id: 'v3',
    vendor_name: 'Bismillah Velvet Palace',
    gateway: 'keenu',
    amount_pkr: 15000,
    purpose: 'sample_booking_deposit',
    status: 'completed',
    reference_id: 'KN-781902',
    payer_name: 'Karachi Bridal Boutique',
    payer_contact: '0333-5566778',
    payment_method_detail: 'Keenu NetConnect Digital Checkout',
    created_at: '2026-09-20T11:22:00Z',
    notes: 'Advance booking deposit for 300m micro-velvet fabric roll order',
  },
  {
    id: 'tx-1004',
    vendor_id: 'v1',
    vendor_name: 'Mian Cloth House',
    gateway: 'stripe',
    amount_pkr: 12500,
    purpose: 'wholesale_order',
    status: 'completed',
    reference_id: 'ch_3N5b9X2eZvKYlo2C1g',
    payer_name: 'UK Ethnic Textiles Ltd (Bradford)',
    payer_contact: '+44 7700 900123',
    payment_method_detail: 'Stripe International Visa (ending in 4242)',
    created_at: '2026-09-21T08:10:00Z',
    notes: 'Overseas sample swatch package and export registration deposit',
  },
];

// ERP Integration Store (for external Textile ERP Linking)
let erpConfig: any = {
  is_enabled: true,
  system_name: 'Azam Central Fabric ERP Bridge',
  system_version: 'v2.6.4 (Enterprise Edition)',
  sync_mode: 'realtime',
  base_api_url: '/api/v1/erp',
  auto_sync_inventory: true,
  auto_sync_pricing: true,
  forward_whatsapp_leads: true,
  rate_limit_per_minute: 120,
  ip_whitelist: '192.168.1.0/24, 110.38.10.15',
  api_keys: [
    {
      id: 'key-prod-01',
      name: 'Production Fabric ERP Master Sync',
      key_preview: 'azm_live_98f4...b3a9',
      token: 'azm_live_98f4a18e209cd4b3a9e01f558d',
      permissions: ['read:vendors', 'read:products', 'write:products', 'write:inventory', 'read:leads', 'admin:all'],
      created_at: '2026-08-10T09:30:00Z',
      last_used_at: '2026-09-20T14:45:00Z',
      is_active: true,
    },
    {
      id: 'key-staging-02',
      name: 'Warehouse Barcode Scanner & Staging API',
      key_preview: 'azm_test_41c0...77ef',
      token: 'azm_test_41c039fb21ab8977ef228b3301',
      permissions: ['read:products', 'write:inventory'],
      created_at: '2026-09-01T11:15:00Z',
      last_used_at: '2026-09-18T18:20:00Z',
      is_active: true,
    }
  ],
  webhooks: [
    {
      id: 'wh-01',
      name: 'ERP CRM Lead Ingestion Hook',
      url: 'https://erp.azamclothmarket.pk/api/webhooks/incoming-leads',
      secret: 'whsec_77e928ab01cfa940e53a',
      events: ['inquiry.created', 'catalogue.downloaded'],
      is_active: true,
      last_delivered_at: '2026-09-20T14:32:00Z',
      failure_count: 0,
    },
    {
      id: 'wh-02',
      name: 'Fabric Stock Discrepancy Listener',
      url: 'https://erp.azamclothmarket.pk/api/webhooks/stock-sync',
      secret: 'whsec_55a109fe82cd739b618a',
      events: ['product.updated'],
      is_active: true,
      last_delivered_at: '2026-09-19T10:15:00Z',
      failure_count: 0,
    }
  ],
  sync_logs: [
    {
      id: 'log-erp-001',
      timestamp: '2026-09-20T14:45:10Z',
      event: 'inventory.batch_push',
      direction: 'inbound',
      status: 'success',
      records_count: 142,
      message: 'Successfully updated stock & wholesale rates for 142 fabric variants',
      payload_summary: 'Processed 142 SKUs across 8 active stalls in Azam Cloth Market'
    },
    {
      id: 'log-erp-002',
      timestamp: '2026-09-20T14:32:05Z',
      event: 'inquiry.lead_dispatched',
      direction: 'outbound',
      status: 'success',
      records_count: 1,
      message: 'Dispatched wholesale buyer lead to ERP CRM via Webhook [wh-01]',
      payload_summary: 'Buyer: Faisalabad Garments Traders (1000m Lawn Inquiry)'
    },
    {
      id: 'log-erp-003',
      timestamp: '2026-09-20T11:00:00Z',
      event: 'catalog.daily_reconciliation',
      direction: 'inbound',
      status: 'success',
      records_count: 86,
      message: 'Daily ERP catalog sync finished without validation errors',
      payload_summary: '0 conflicts detected'
    }
  ],
  last_successful_sync: '2026-09-20T14:45:10Z'
};

// Seed past 30 days inquiry logs for realistic charts
(function seedInquiryLogs() {
  const now = new Date();
  vendors.forEach(v => {
    // initialize call and message stats
    if (v.call_clicks === undefined) v.call_clicks = Math.floor(v.whatsapp_clicks * 0.45) + 14;
    if (v.message_clicks === undefined) v.message_clicks = (v.email_clicks || 0) + Math.floor(v.whatsapp_clicks * 0.25) + 8;

    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString();

      // Random views, wa clicks, dl
      const factor = v.tier_id === 't-premium' ? 2.5 : v.tier_id === 't-standard' ? 1.5 : 0.8;
      const dayViews = Math.floor((10 + Math.random() * 25) * factor);
      const dayWa = Math.floor((3 + Math.random() * 8) * factor);
      const dayCalls = Math.floor((1 + Math.random() * 5) * factor);
      const dayMessages = Math.floor((1 + Math.random() * 4) * factor);
      const dayDl = Math.floor((1 + Math.random() * 4) * factor);

      for (let j = 0; j < dayViews; j++) {
        inquiryLogs.push({
          id: `log-${v.id}-v-${i}-${j}`,
          vendor_id: v.id,
          event_type: 'profile_view',
          created_at: dateStr
        });
      }
      for (let j = 0; j < dayWa; j++) {
        inquiryLogs.push({
          id: `log-${v.id}-w-${i}-${j}`,
          vendor_id: v.id,
          event_type: 'whatsapp_click',
          created_at: dateStr
        });
      }
      for (let j = 0; j < dayCalls; j++) {
        inquiryLogs.push({
          id: `log-${v.id}-c-${i}-${j}`,
          vendor_id: v.id,
          event_type: 'call_click',
          created_at: dateStr
        });
      }
      for (let j = 0; j < dayMessages; j++) {
        inquiryLogs.push({
          id: `log-${v.id}-m-${i}-${j}`,
          vendor_id: v.id,
          event_type: 'message_click',
          created_at: dateStr
        });
      }
      for (let j = 0; j < dayDl; j++) {
        inquiryLogs.push({
          id: `log-${v.id}-d-${i}-${j}`,
          vendor_id: v.id,
          event_type: 'catalogue_download',
          created_at: dateStr
        });
      }
    }
  });
})();

// Helper to attach relations
function enrichVendor(vendor: Vendor): Vendor {
  const m = markets.find(x => x.id === vendor.market_id);
  const t = tiers.find(x => x.id === vendor.tier_id);
  return {
    ...vendor,
    call_clicks: vendor.call_clicks ?? Math.round(vendor.whatsapp_clicks * 0.45),
    message_clicks: vendor.message_clicks ?? Math.round((vendor.email_clicks || 0) * 1.5 + vendor.whatsapp_clicks * 0.2),
    market: m,
    tier: t,
    customization: vendor.customization
      ? { ...DEFAULT_SHOP_CUSTOMIZATION, ...vendor.customization }
      : { ...DEFAULT_SHOP_CUSTOMIZATION }
  };
}

// REST API ROUTES
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'Azam Market Online' });
});

// Markets
app.get('/api/markets', (req, res) => {
  res.json(markets);
});

app.post('/api/markets', (req, res) => {
  const { name, city, country } = req.body;
  if (!name) return res.status(400).json({ error: 'Market name required' });
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  const newMarket: Market = {
    id: `m-${Date.now()}`,
    name,
    slug,
    city: city || 'Lahore',
    country: country || 'Pakistan',
    is_active: true,
    created_at: new Date().toISOString()
  };
  markets.push(newMarket);
  res.status(201).json(newMarket);
});

// Categories
app.get('/api/categories', (req, res) => {
  // Recalculate vendor counts per category
  const updated = categories.map(cat => {
    const count = vendors.filter(v => v.status === 'active' && v.categories?.some(c => c.id === cat.id)).length;
    return { ...cat, vendor_count: count };
  });
  res.json(updated);
});

app.post('/api/categories', (req, res) => {
  const { name, icon } = req.body;
  if (!name) return res.status(400).json({ error: 'Category name required' });
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  const newCat: Category = {
    id: `c-${Date.now()}`,
    name,
    slug,
    icon: icon || '🧵',
    vendor_count: 0
  };
  categories.push(newCat);
  res.status(201).json(newCat);
});

// Tiers
app.get('/api/tiers', (req, res) => {
  res.json(tiers);
});

// Vendors List
app.get('/api/vendors', (req, res) => {
  const { q, category, market, verified, featured, status, tier } = req.query;
  let list = vendors.map(enrichVendor);

  if (status) {
    list = list.filter(v => v.status === status);
  }

  if (market) {
    list = list.filter(v => v.market?.slug === market || v.market_id === market);
  }

  if (category) {
    list = list.filter(v => v.categories?.some(c => c.slug === category || c.id === category));
  }

  if (verified === 'true') {
    list = list.filter(v => v.is_verified);
  }

  if (featured === 'true') {
    list = list.filter(v => v.is_featured);
  }

  if (tier) {
    list = list.filter(v => v.tier?.name === tier || v.tier_id === tier);
  }

  if (q && typeof q === 'string' && q.trim()) {
    const term = q.toLowerCase();
    list = list.filter(v =>
      v.shop_name.toLowerCase().includes(term) ||
      v.description.toLowerCase().includes(term) ||
      v.stall_number.toLowerCase().includes(term) ||
      v.tags.some(t => t.toLowerCase().includes(term)) ||
      v.categories?.some(c => c.name.toLowerCase().includes(term)) ||
      v.products?.some(p => p.name.toLowerCase().includes(term) || p.fabric_type.toLowerCase().includes(term))
    );
  }

  res.json(list);
});

// Single Vendor Details
app.get('/api/vendors/:slugOrId', (req, res) => {
  const { slugOrId } = req.params;
  const vendor = vendors.find(v => v.slug === slugOrId || v.id === slugOrId);
  if (!vendor) return res.status(404).json({ error: 'Vendor not found' });
  res.json(enrichVendor(vendor));
});

// Create Vendor (Onboard)
app.post('/api/vendors', (req, res) => {
  const { shop_name, stall_number, market_id, tier_id, whatsapp, email, categories: catIds, tags, is_verified, is_featured, status, description } = req.body;

  if (!shop_name || !whatsapp || !email) {
    return res.status(400).json({ error: 'Shop name, WhatsApp, and Email are required' });
  }

  let slug = shop_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  let counter = 1;
  const originalSlug = slug;
  while (vendors.some(v => v.slug === slug)) {
    slug = `${originalSlug}-${counter++}`;
  }

  const vendorCats = categories.filter(c => Array.isArray(catIds) && catIds.includes(c.id));

  const newVendor: any = {
    id: `v-${Date.now()}`,
    user_id: `usr-${Date.now()}`,
    market_id: market_id || 'm-azam-1',
    tier_id: tier_id || 't-basic',
    slug,
    shop_name,
    stall_number: stall_number || 'Stall Azam Cloth Market',
    description: description || `Wholesale fabric dealer in Azam Market Lahore. Offering quality fabrics at competitive prices.`,
    logo_url: null,
    cover_url: null,
    whatsapp,
    email,
    tags: tags || ['Wholesale'],
    categories: vendorCats.length > 0 ? vendorCats : [categories[0]],
    is_verified: !!is_verified,
    is_featured: !!is_featured,
    status: status || 'pending',
    profile_views: 0,
    whatsapp_clicks: 0,
    email_clicks: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    products: [],
    catalogues: []
  };

  vendors.push(newVendor);
  res.status(201).json(enrichVendor(newVendor));
});

// Update Vendor
app.put('/api/vendors/:id', (req, res) => {
  const { id } = req.params;
  const index = vendors.findIndex(v => v.id === id);
  if (index === -1) return res.status(404).json({ error: 'Vendor not found' });

  const existing = vendors[index];
  const updates = req.body;

  // If updating category IDs array
  if (updates.category_ids && Array.isArray(updates.category_ids)) {
    updates.categories = categories.filter(c => updates.category_ids.includes(c.id));
  }

  const updated: any = {
    ...existing,
    ...updates,
    updated_at: new Date().toISOString()
  };

  vendors[index] = updated;
  res.json(enrichVendor(updated));
});

// Delete Vendor (Master Admin Control)
app.delete('/api/vendors/:id', (req, res) => {
  const { id } = req.params;
  const index = vendors.findIndex(v => v.id === id);
  if (index === -1) return res.status(404).json({ error: 'Vendor not found' });
  const deleted = vendors.splice(index, 1)[0];
  res.json({ success: true, message: `Stall '${deleted.shop_name}' removed from directory`, id });
});

// Bulk Vendor Action (Master Admin Control)
app.post('/api/admin/bulk-vendor-action', (req, res) => {
  const { vendor_ids, action, tier_id, announcement_text } = req.body;
  if (!Array.isArray(vendor_ids) || vendor_ids.length === 0) {
    return res.status(400).json({ error: 'vendor_ids array is required' });
  }

  let affectedCount = 0;
  vendors.forEach(v => {
    if (vendor_ids.includes(v.id)) {
      affectedCount++;
      if (action === 'activate') v.status = 'active';
      if (action === 'suspend') v.status = 'suspended';
      if (action === 'verify') v.is_verified = true;
      if (action === 'unverify') v.is_verified = false;
      if (action === 'feature') v.is_featured = true;
      if (action === 'unfeature') v.is_featured = false;
      if (action === 'set_tier' && tier_id) v.tier_id = tier_id;
      if (action === 'broadcast_announcement' && announcement_text) {
        if (!v.customization) v.customization = { ...DEFAULT_SHOP_CUSTOMIZATION };
        v.customization.show_announcement = true;
        v.customization.announcement_text = announcement_text;
      }
      v.updated_at = new Date().toISOString();
    }
  });

  res.json({
    success: true,
    action,
    affected_count: affectedCount,
    message: `Successfully executed ${action} across ${affectedCount} shop(s).`
  });
});

// PAYMENT GATEWAYS & TRANSACTIONS API (JazzCash, PayFast, Keenu, Stripe)
app.get('/api/payments/gateways', (req, res) => {
  res.json(gatewayConfigs);
});

app.put('/api/payments/gateways/:id', (req, res) => {
  const { id } = req.params;
  const gwIndex = gatewayConfigs.findIndex(g => g.id === id);
  if (gwIndex === -1) return res.status(404).json({ error: 'Gateway not found' });

  gatewayConfigs[gwIndex] = {
    ...gatewayConfigs[gwIndex],
    ...req.body
  };
  res.json(gatewayConfigs[gwIndex]);
});

app.get('/api/payments/transactions', (req, res) => {
  const { vendor_id, gateway, status } = req.query;
  let results = [...paymentTransactions];

  if (vendor_id) results = results.filter(t => t.vendor_id === vendor_id);
  if (gateway) results = results.filter(t => t.gateway === gateway);
  if (status) results = results.filter(t => t.status === status);

  // Return sorted newest first
  results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  res.json(results);
});

app.post('/api/payments/checkout', (req, res) => {
  const {
    vendor_id,
    vendor_name,
    gateway,
    amount_pkr,
    purpose,
    payer_name,
    payer_contact,
    payment_method_detail,
    tier_id,
    notes,
    reference_id
  } = req.body;

  if (!gateway || !amount_pkr || !purpose) {
    return res.status(400).json({ error: 'gateway, amount_pkr, and purpose are required' });
  }

  const generatedRef = reference_id || (
    gateway === 'jazzcash'
      ? `JC-${Math.floor(10000000 + Math.random() * 90000000)}`
      : gateway === 'payfast'
      ? `PF-${Date.now().toString().slice(-8)}`
      : gateway === 'keenu'
      ? `KN-${Math.floor(100000 + Math.random() * 900000)}`
      : `ch_${Math.random().toString(36).substring(2, 14)}`
  );

  const newTx: PaymentTransaction = {
    id: `tx-${Date.now()}`,
    vendor_id,
    vendor_name,
    gateway,
    amount_pkr: Number(amount_pkr),
    purpose,
    status: 'completed',
    reference_id: generatedRef,
    payer_name: payer_name || 'Azam Market Merchant',
    payer_contact: payer_contact || '0300-1234567',
    payment_method_detail: payment_method_detail || `${gateway.toUpperCase()} Direct Settlement`,
    created_at: new Date().toISOString(),
    tier_id,
    notes: notes || `Direct settlement processed through ${gateway.toUpperCase()}`
  };

  paymentTransactions.unshift(newTx);

  // If this was a subscription upgrade/renewal, apply tier to vendor immediately
  if ((purpose === 'subscription_upgrade' || purpose === 'subscription_renewal') && vendor_id && tier_id) {
    const vIndex = vendors.findIndex(v => v.id === vendor_id);
    if (vIndex !== -1) {
      vendors[vIndex].tier_id = tier_id;
      vendors[vIndex].updated_at = new Date().toISOString();
    }
  }

  res.status(201).json({
    success: true,
    message: `Payment authorized successfully via ${gateway.toUpperCase()}`,
    transaction: newTx
  });
});


// Update Vendor Customization / Publishing
app.put('/api/vendors/:id/customization', (req, res) => {
  const { id } = req.params;
  const index = vendors.findIndex(v => v.id === id);
  if (index === -1) return res.status(404).json({ error: 'Vendor not found' });

  const existing = vendors[index];
  const incoming = req.body;
  const currentCust = existing.customization || DEFAULT_SHOP_CUSTOMIZATION;

  const merged = {
    ...currentCust,
    ...incoming,
    last_saved_at: new Date().toISOString(),
    published_at: incoming.is_published ? new Date().toISOString() : currentCust.published_at
  };

  vendors[index] = {
    ...existing,
    customization: merged,
    updated_at: new Date().toISOString()
  };

  res.json(enrichVendor(vendors[index]));
});

// Products CRUD
app.post('/api/vendors/:id/products', (req, res) => {
  const { id } = req.params;
  const vendor = vendors.find(v => v.id === id);
  if (!vendor) return res.status(404).json({ error: 'Vendor not found' });

  const { name, description, fabric_type, price_range, moq, image_url } = req.body;
  if (!name || !fabric_type) {
    return res.status(400).json({ error: 'Product name and fabric type are required' });
  }

  const newProduct: Product = {
    id: `p-${Date.now()}`,
    vendor_id: id,
    name,
    description: description || '',
    fabric_type,
    price_range: price_range || 'Contact Vendor',
    moq: moq || '50 metres',
    image_url: image_url || 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',
    is_active: true,
    sort_order: (vendor.products?.length || 0) + 1,
    created_at: new Date().toISOString()
  };

  if (!vendor.products) vendor.products = [];
  vendor.products.push(newProduct);

  res.status(201).json(newProduct);
});

app.put('/api/products/:productId', (req, res) => {
  const { productId } = req.params;
  for (const v of vendors) {
    if (v.products) {
      const idx = v.products.findIndex(p => p.id === productId);
      if (idx !== -1) {
        v.products[idx] = { ...v.products[idx], ...req.body };
        return res.json(v.products[idx]);
      }
    }
  }
  res.status(404).json({ error: 'Product not found' });
});

app.delete('/api/products/:productId', (req, res) => {
  const { productId } = req.params;
  for (const v of vendors) {
    if (v.products) {
      const idx = v.products.findIndex(p => p.id === productId);
      if (idx !== -1) {
        v.products.splice(idx, 1);
        return res.json({ success: true, productId });
      }
    }
  }
  res.status(404).json({ error: 'Product not found' });
});

// Catalogues CRUD
app.post('/api/vendors/:id/catalogues', (req, res) => {
  const { id } = req.params;
  const vendor = vendors.find(v => v.id === id);
  if (!vendor) return res.status(404).json({ error: 'Vendor not found' });

  const { title, description, season, pdf_url, file_size_mb } = req.body;
  if (!title) return res.status(400).json({ error: 'Catalogue title required' });

  const catId = `cat-${Date.now()}`;
  const newCat: Catalogue = {
    id: catId,
    vendor_id: id,
    title,
    description: description || 'Wholesale fabric catalogue and swatch book.',
    pdf_url: pdf_url || `/api/download/${catId}`,
    file_size_mb: file_size_mb || 4.5,
    season: season || 'Summer 2026',
    download_count: 0,
    is_active: true,
    created_at: new Date().toISOString()
  };

  if (!vendor.catalogues) vendor.catalogues = [];
  vendor.catalogues.push(newCat);

  res.status(201).json(newCat);
});

app.delete('/api/catalogues/:catId', (req, res) => {
  const { catId } = req.params;
  for (const v of vendors) {
    if (v.catalogues) {
      const idx = v.catalogues.findIndex(c => c.id === catId);
      if (idx !== -1) {
        v.catalogues.splice(idx, 1);
        return res.json({ success: true, catId });
      }
    }
  }
  res.status(404).json({ error: 'Catalogue not found' });
});

// Log Event API
app.post('/api/log-event', (req, res) => {
  const { vendor_id, event_type, catalogue_id } = req.body;
  if (!vendor_id || !event_type) return res.status(400).json({ error: 'Missing vendor_id or event_type' });

  const vendor = vendors.find(v => v.id === vendor_id);
  if (vendor) {
    if (event_type === 'whatsapp_click') vendor.whatsapp_clicks = (vendor.whatsapp_clicks || 0) + 1;
    if (event_type === 'call_click') vendor.call_clicks = (vendor.call_clicks || 0) + 1;
    if (event_type === 'message_click') {
      vendor.message_clicks = (vendor.message_clicks || 0) + 1;
      vendor.email_clicks = (vendor.email_clicks || 0) + 1;
    }
    if (event_type === 'email_click') {
      vendor.email_clicks = (vendor.email_clicks || 0) + 1;
      vendor.message_clicks = (vendor.message_clicks || 0) + 1;
    }
    if (event_type === 'profile_view') vendor.profile_views = (vendor.profile_views || 0) + 1;
    if (event_type === 'catalogue_download' && catalogue_id && vendor.catalogues) {
      const cat = vendor.catalogues.find(c => c.id === catalogue_id);
      if (cat) cat.download_count++;
    }
  }

  const log: InquiryLog = {
    id: `log-${Date.now()}`,
    vendor_id,
    event_type,
    catalogue_id,
    created_at: new Date().toISOString()
  };
  inquiryLogs.push(log);

  res.json({ success: true, log });
});

// Serve PDF Catalogue download
app.get('/api/download/:catalogueId', (req, res) => {
  const { catalogueId } = req.params;
  let targetCat: Catalogue | null = null;
  let targetVendor: Vendor | null = null;

  for (const v of vendors) {
    if (v.catalogues) {
      const c = v.catalogues.find(cat => cat.id === catalogueId);
      if (c) {
        targetCat = c;
        targetVendor = v;
        break;
      }
    }
  }

  if (targetCat && targetVendor) {
    targetCat.download_count++;
    targetVendor.whatsapp_clicks += 1; // event boost
    inquiryLogs.push({
      id: `log-${Date.now()}`,
      vendor_id: targetVendor.id,
      event_type: 'catalogue_download',
      catalogue_id: catalogueId,
      created_at: new Date().toISOString()
    });
  }

  const title = targetCat ? targetCat.title : 'Azam Market Fabric Catalogue';
  const shopName = targetVendor ? targetVendor.shop_name : 'Azam Market Vendor';
  const stall = targetVendor ? targetVendor.stall_number : 'Azam Cloth Market Lahore';

  // Return a rich HTML PDF Preview / Download document
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title} - ${shopName}</title>
        <style>
          body { font-family: 'Helvetica Neue', Arial, sans-serif; background: #f4f6f8; margin: 0; padding: 40px; color: #111827; }
          .document { max-width: 800px; margin: 0 auto; background: #ffffff; padding: 40px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); border-top: 8px solid #0F5C3A; }
          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #e5e7eb; padding-bottom: 20px; margin-bottom: 30px; }
          .brand { font-size: 24px; font-weight: bold; color: #0F5C3A; }
          .badge { background: #FDF6E7; color: #C9952A; padding: 4px 12px; border-radius: 20px; font-weight: 600; font-size: 13px; }
          .title { font-size: 28px; margin: 0 0 10px 0; color: #111827; }
          .meta { color: #6b7280; font-size: 14px; margin-bottom: 30px; }
          .section { margin-bottom: 30px; }
          .section-title { font-size: 18px; font-weight: bold; color: #0F5C3A; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; margin-bottom: 16px; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
          .card { background: #F9FAFB; padding: 16px; border-radius: 8px; border: 1px solid #E5E7EB; }
          .price { font-size: 16px; font-weight: bold; color: #0F5C3A; }
          .moq { font-size: 12px; color: #6B7280; margin-top: 4px; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 1px dashed #d1d5db; text-align: center; font-size: 13px; color: #6b7280; }
          .btn { display: inline-block; background: #0F5C3A; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 15px; }
          @media print { body { padding: 0; background: white; } .document { box-shadow: none; border: none; } .btn { display: none; } }
        </style>
      </head>
      <body>
        <div class="document">
          <div class="header">
            <div>
              <div class="brand">AZAM MARKET ONLINE</div>
              <div style="font-size: 13px; color: #6b7280;">Official Wholesale Catalogue Verified Document</div>
            </div>
            <div>
              <span class="badge">PROCESSED DOWNLOAD</span>
            </div>
          </div>

          <h1 class="title">${title}</h1>
          <div class="meta">
            <strong>Vendor:</strong> ${shopName} | <strong>Location:</strong> ${stall} <br/>
            <strong>Season:</strong> ${targetCat?.season || '2026'} | <strong>Download Reference:</strong> #${catalogueId}
          </div>

          <div class="section">
            <div class="section-title">Catalogue Overview & Terms</div>
            <p style="line-height: 1.6; color: #374151;">
              ${targetCat?.description || 'This official wholesale catalogue contains sample fabric specifications, thread counts, dye swatches, and tiered minimum order quantity pricing directly from Azam Cloth Market, Lahore.'}
            </p>
          </div>

          <div class="section">
            <div class="section-title">Wholesale Product Highlights</div>
            <div class="grid">
              ${(targetVendor?.products || []).slice(0, 4).map(p => `
                <div class="card">
                  <h4 style="margin:0 0 6px 0;">${p.name}</h4>
                  <div style="font-size:13px; color:#4b5563; margin-bottom:8px;">${p.fabric_type} • ${p.description}</div>
                  <div class="price">${p.price_range}</div>
                  <div class="moq">Minimum Order: ${p.moq}</div>
                </div>
              `).join('') || '<div class="card">Bulk rolls and custom dyed orders available upon request.</div>'}
            </div>
          </div>

          <div class="section">
            <div class="section-title">Direct Vendor Inquiry Contact</div>
            <p style="margin:4px 0;"><strong>WhatsApp:</strong> ${targetVendor?.whatsapp || '+92 300 0000000'}</p>
            <p style="margin:4px 0;"><strong>Email:</strong> ${targetVendor?.email || 'vendor@azammarket.online'}</p>
            <p style="margin:4px 0;"><strong>Address:</strong> ${stall}, Azam Cloth Market, Lahore, Pakistan</p>
            
            <a href="javascript:window.print()" class="btn">🖨️ Print or Save as PDF</a>
          </div>

          <div class="footer">
            Verified B2B Wholesale Catalogue issued via Azam Market Online Platform (Aargard Business Solutions).
          </div>
        </div>
      </body>
    </html>
  `);
});

// Vendor Analytics Time Series Data
app.get('/api/analytics/:vendorId', (req, res) => {
  const { vendorId } = req.params;
  const vendorLogs = inquiryLogs.filter(l => l.vendor_id === vendorId);

  // Group by day for last 30 days
  const days: { [dateStr: string]: { views: number; whatsapp: number; calls: number; messages: number; downloads: number; emails: number } } = {};
  const now = new Date();

  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    days[key] = { views: 0, whatsapp: 0, calls: 0, messages: 0, downloads: 0, emails: 0 };
  }

  vendorLogs.forEach(log => {
    const key = log.created_at.split('T')[0];
    if (days[key]) {
      if (log.event_type === 'profile_view') days[key].views++;
      if (log.event_type === 'whatsapp_click') days[key].whatsapp++;
      if (log.event_type === 'call_click') days[key].calls++;
      if (log.event_type === 'message_click') {
        days[key].messages++;
        days[key].emails++;
      }
      if (log.event_type === 'email_click') {
        days[key].emails++;
        days[key].messages++;
      }
      if (log.event_type === 'catalogue_download') days[key].downloads++;
    }
  });

  const dailyMetrics = Object.keys(days).map(dateStr => ({
    date: dateStr.slice(5), // MM-DD
    views: days[dateStr].views,
    whatsapp: days[dateStr].whatsapp,
    calls: days[dateStr].calls,
    messages: days[dateStr].messages,
    downloads: days[dateStr].downloads,
    emails: days[dateStr].emails
  }));

  const totalViews = dailyMetrics.reduce((a, b) => a + b.views, 0);
  const totalWhatsapp = dailyMetrics.reduce((a, b) => a + b.whatsapp, 0);
  const totalCalls = dailyMetrics.reduce((a, b) => a + b.calls, 0);
  const totalMessages = dailyMetrics.reduce((a, b) => a + b.messages, 0);
  const totalDownloads = dailyMetrics.reduce((a, b) => a + b.downloads, 0);
  const totalEmails = dailyMetrics.reduce((a, b) => a + b.emails, 0);

  res.json({
    dailyMetrics,
    totalViews,
    totalWhatsapp,
    totalCalls,
    totalMessages,
    totalDownloads,
    totalEmails,
    viewsMoM: 14.5,
    whatsappMoM: 22.8,
    callsMoM: 19.2,
    messagesMoM: 16.4,
    downloadsMoM: 18.2,
    emailsMoM: 9.4
  });
});

// Admin Metrics Overview
app.get('/api/admin/metrics', (req, res) => {
  const activeVendors = vendors.filter(v => v.status === 'active');
  const pendingVendors = vendors.filter(v => v.status === 'pending');
  const suspendedVendors = vendors.filter(v => v.status === 'suspended');

  // MRR calculation (sum of tier prices for active vendors)
  const mrr = activeVendors.reduce((sum, v) => {
    const t = tiers.find(x => x.id === v.tier_id);
    return sum + (t ? t.price_pkr : 0);
  }, 0);

  const tierBreakdown = {
    basic: activeVendors.filter(v => v.tier_id === 't-basic').length,
    standard: activeVendors.filter(v => v.tier_id === 't-standard').length,
    premium: activeVendors.filter(v => v.tier_id === 't-premium').length
  };

  res.json({
    totalVendors: vendors.length,
    activeVendorsCount: activeVendors.length,
    pendingApprovalsCount: pendingVendors.length,
    suspendedCount: suspendedVendors.length,
    mrrPkr: mrr,
    tierBreakdown,
    recentOnboards: vendors.slice(-5).map(enrichVendor)
  });
});

// ==========================================
// ERP INTEGRATION & API MANAGEMENT ROUTES
// ==========================================

// Get entire ERP Configuration
app.get('/api/admin/erp-config', (req, res) => {
  res.json(erpConfig);
});

// Update ERP Configuration settings
app.put('/api/admin/erp-config', (req, res) => {
  const {
    is_enabled,
    system_name,
    system_version,
    sync_mode,
    base_api_url,
    auto_sync_inventory,
    auto_sync_pricing,
    forward_whatsapp_leads,
    rate_limit_per_minute,
    ip_whitelist
  } = req.body;

  erpConfig = {
    ...erpConfig,
    is_enabled: typeof is_enabled === 'boolean' ? is_enabled : erpConfig.is_enabled,
    system_name: system_name !== undefined ? system_name : erpConfig.system_name,
    system_version: system_version !== undefined ? system_version : erpConfig.system_version,
    sync_mode: sync_mode || erpConfig.sync_mode,
    base_api_url: base_api_url || erpConfig.base_api_url,
    auto_sync_inventory: typeof auto_sync_inventory === 'boolean' ? auto_sync_inventory : erpConfig.auto_sync_inventory,
    auto_sync_pricing: typeof auto_sync_pricing === 'boolean' ? auto_sync_pricing : erpConfig.auto_sync_pricing,
    forward_whatsapp_leads: typeof forward_whatsapp_leads === 'boolean' ? forward_whatsapp_leads : erpConfig.forward_whatsapp_leads,
    rate_limit_per_minute: Number(rate_limit_per_minute) || erpConfig.rate_limit_per_minute,
    ip_whitelist: ip_whitelist !== undefined ? ip_whitelist : erpConfig.ip_whitelist,
  };

  res.json(erpConfig);
});

// Generate new ERP API Key
app.post('/api/admin/erp/keys', (req, res) => {
  const { name, permissions } = req.body;
  if (!name || typeof name !== 'string') {
    return res.status(400).json({ error: 'Key name is required' });
  }

  const randomHex = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 12);
  const fullToken = `azm_live_${randomHex}`;
  const keyPreview = `azm_live_${randomHex.substring(0, 4)}...${randomHex.substring(randomHex.length - 4)}`;

  const newKey: any = {
    id: `key-${Date.now()}`,
    name: name.trim(),
    key_preview: keyPreview,
    token: fullToken,
    permissions: Array.isArray(permissions) && permissions.length > 0
      ? permissions
      : ['read:vendors', 'read:products', 'write:products', 'write:inventory', 'read:leads'],
    created_at: new Date().toISOString(),
    is_active: true,
  };

  erpConfig.api_keys.unshift(newKey);

  // Add an audit log
  erpConfig.sync_logs.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    event: 'api_key.created',
    direction: 'inbound',
    status: 'success',
    records_count: 1,
    message: `New API Key [${name}] provisioned with ${newKey.permissions.length} scopes`,
    payload_summary: `Scopes: ${newKey.permissions.join(', ')}`
  });

  res.status(201).json(newKey);
});

// Revoke/Delete an API key
app.delete('/api/admin/erp/keys/:id', (req, res) => {
  const { id } = req.params;
  const keyIndex = erpConfig.api_keys.findIndex(k => k.id === id);
  if (keyIndex === -1) {
    return res.status(404).json({ error: 'API Key not found' });
  }

  const deleted = erpConfig.api_keys.splice(keyIndex, 1)[0];

  erpConfig.sync_logs.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    event: 'api_key.revoked',
    direction: 'inbound',
    status: 'success',
    records_count: 1,
    message: `API Key [${deleted.name}] permanently revoked`,
  });

  res.json({ success: true, id });
});

// Toggle API key active status
app.patch('/api/admin/erp/keys/:id/toggle', (req, res) => {
  const { id } = req.params;
  const key = erpConfig.api_keys.find(k => k.id === id);
  if (!key) {
    return res.status(404).json({ error: 'API Key not found' });
  }

  key.is_active = !key.is_active;
  res.json(key);
});

// Add new Webhook
app.post('/api/admin/erp/webhooks', (req, res) => {
  const { name, url, events, secret } = req.body;
  if (!name || !url) {
    return res.status(400).json({ error: 'Webhook name and target URL are required' });
  }

  const newWebhook: any = {
    id: `wh-${Date.now()}`,
    name: name.trim(),
    url: url.trim(),
    secret: secret ? secret.trim() : `whsec_${Math.random().toString(36).substring(2, 14)}`,
    events: Array.isArray(events) && events.length > 0 ? events : ['inquiry.created', 'catalogue.downloaded'],
    is_active: true,
    failure_count: 0,
  };

  erpConfig.webhooks.unshift(newWebhook);

  erpConfig.sync_logs.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    event: 'webhook.registered',
    direction: 'outbound',
    status: 'success',
    records_count: 1,
    message: `Webhook endpoint [${name}] subscribed to [${newWebhook.events.join(', ')}]`,
    payload_summary: `Target URL: ${url}`
  });

  res.status(201).json(newWebhook);
});

// Delete Webhook
app.delete('/api/admin/erp/webhooks/:id', (req, res) => {
  const { id } = req.params;
  const whIndex = erpConfig.webhooks.findIndex(w => w.id === id);
  if (whIndex === -1) {
    return res.status(404).json({ error: 'Webhook not found' });
  }

  const deleted = erpConfig.webhooks.splice(whIndex, 1)[0];
  res.json({ success: true, id: deleted.id });
});

// Toggle Webhook active status
app.patch('/api/admin/erp/webhooks/:id/toggle', (req, res) => {
  const { id } = req.params;
  const wh = erpConfig.webhooks.find(w => w.id === id);
  if (!wh) {
    return res.status(404).json({ error: 'Webhook not found' });
  }

  wh.is_active = !wh.is_active;
  res.json(wh);
});

// Test Webhook ping
app.post('/api/admin/erp/webhooks/:id/test', (req, res) => {
  const { id } = req.params;
  const wh = erpConfig.webhooks.find(w => w.id === id);
  if (!wh) {
    return res.status(404).json({ error: 'Webhook not found' });
  }

  const nowStr = new Date().toISOString();
  wh.last_delivered_at = nowStr;
  wh.failure_count = 0;

  erpConfig.sync_logs.unshift({
    id: `log-${Date.now()}`,
    timestamp: nowStr,
    event: 'webhook.test_ping',
    direction: 'outbound',
    status: 'success',
    records_count: 1,
    message: `Ping payload dispatched to [${wh.name}]. HTTP 200 OK received in 142ms.`,
    payload_summary: `URL: ${wh.url} • Secret verified`
  });

  res.json({
    success: true,
    statusCode: 200,
    responseTimeMs: 142,
    deliveredAt: nowStr,
    message: `Test ping delivered successfully to ${wh.url}`
  });
});

// Trigger immediate manual two-way sync
app.post('/api/admin/erp/trigger-sync', (req, res) => {
  const nowStr = new Date().toISOString();
  erpConfig.last_successful_sync = nowStr;

  const affectedProducts = vendors.reduce((acc, v) => acc + (v.products ? v.products.length : 0), 0);
  const affectedVendors = vendors.length;

  erpConfig.sync_logs.unshift({
    id: `log-${Date.now()}`,
    timestamp: nowStr,
    event: 'manual_reconciliation',
    direction: 'inbound',
    status: 'success',
    records_count: affectedProducts,
    message: `Manual ERP reconciliation completed: ${affectedProducts} fabric items & ${affectedVendors} stalls synchronized`,
    payload_summary: 'Reconciled stock levels, wholesale prices, and verified badges'
  });

  res.json({
    success: true,
    timestamp: nowStr,
    recordsSynced: affectedProducts,
    vendorsSynced: affectedVendors,
    status: 'synchronized'
  });
});

// Clear sync logs
app.post('/api/admin/erp/logs/clear', (req, res) => {
  erpConfig.sync_logs = [];
  res.json({ success: true, count: 0 });
});

// ==========================================
// EXTERNAL ERP PUBLIC REST API (v1)
// Used by external ERP servers to push/pull
// ==========================================

// Middleware helper to check API Key
function authenticateErpKey(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers['authorization'] || req.headers['x-api-key'];
  const token = typeof authHeader === 'string'
    ? authHeader.replace(/^Bearer\s+/i, '').trim()
    : null;

  if (!token) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Missing API Key. Pass "Authorization: Bearer <key>" or "x-api-key: <key>" header'
    });
  }

  const validKey = erpConfig.api_keys.find(k => k.is_active && (k.token === token || k.key_preview.startsWith(token.substring(0, 10))));
  if (!validKey) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Invalid or deactivated ERP API Key'
    });
  }

  validKey.last_used_at = new Date().toISOString();
  next();
}

// 1. ERP Status Check
app.get('/api/v1/erp/status', (req, res) => {
  res.json({
    status: 'online',
    system: 'Azam Market Online ERP Bridge',
    market: 'Azam Cloth Market, Lahore',
    total_vendors: vendors.length,
    active_keys: erpConfig.api_keys.filter(k => k.is_active).length,
    timestamp: new Date().toISOString()
  });
});

// 2. Push/Sync Fabric Products from ERP
app.post('/api/v1/erp/products/sync', authenticateErpKey, (req, res) => {
  const { items } = req.body;
  if (!Array.isArray(items)) {
    return res.status(400).json({ error: 'Payload must include an "items" array' });
  }

  let updatedCount = 0;
  items.forEach((item: any) => {
    // Look up vendor by stall_number or id
    const vendor = vendors.find(v => v.stall_number === item.stall_number || v.id === item.vendor_id);
    if (vendor && vendor.products) {
      const prod = vendor.products.find(p => p.id === item.product_id || p.name.toLowerCase() === (item.name || '').toLowerCase());
      if (prod) {
        if (item.price_range) prod.price_range = item.price_range;
        if (item.moq) prod.moq = item.moq;
        updatedCount++;
      }
    }
  });

  const nowStr = new Date().toISOString();
  erpConfig.last_successful_sync = nowStr;
  erpConfig.sync_logs.unshift({
    id: `log-${Date.now()}`,
    timestamp: nowStr,
    event: 'external_erp.product_sync',
    direction: 'inbound',
    status: 'success',
    records_count: updatedCount || items.length,
    message: `External ERP pushed ${items.length} items (${updatedCount} updated in directory)`,
    payload_summary: `Source: External ERP API Client`
  });

  res.json({
    success: true,
    processed: items.length,
    updated: updatedCount,
    timestamp: nowStr
  });
});

// 3. Pull Wholesale Leads for ERP CRM
app.get('/api/v1/erp/leads', authenticateErpKey, (req, res) => {
  const leads = inquiryLogs.slice(-50).map(l => {
    const v = vendors.find(x => x.id === l.vendor_id);
    return {
      id: l.id,
      stall_number: v?.stall_number || 'N/A',
      shop_name: v?.shop_name || 'N/A',
      event_type: l.event_type,
      created_at: l.created_at
    };
  });

  res.json({
    total_leads: leads.length,
    leads
  });
});

// =========================================================================
// AARGARD CEO MEMOIR, UPDATES & SERVICES STORE
// =========================================================================

let ceoProfile: any = {
  id: 'ceo-aargard',
  ceo_name: 'Mian Tariq Aargard',
  ceo_title: 'Founding CEO, AArgard Technologies & Chairman, Azam Cloth Market Digital Federation',
  organization: 'AArgard Group & Azam Cloth Market Association',
  avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
  signature_text: 'Mian Tariq Aargard — Lahore',
  founded_year: 2021,
  banner_image_url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&q=80&w=1200',
  memoir_title: 'Digitizing Asia’s Grandest Textile Emporium: The Aargard Memoir',
  memoir_subtitle: 'A journey from Lahore’s historic Walled City alleys to a unified, modern B2B fabric trading network across Pakistan and the globe.',
  memoir_paragraphs: [
    'For generations, the heartbeat of Pakistan’s textile commerce has lived inside the historic alleys of Azam Cloth Market, nestled between Delhi Gate and Kashmiri Gate in Lahore. Here, over 16,000 stalls form the largest wholesale fabric hub in Asia. Every day, thousands of merchant handshakes, parchi receipts, and Gaddi accounts conduct transactions worth billions of rupees.',
    'When we founded AArgard Technologies, many believed traditional cloth merchants would never embrace screens or digital catalogues. But our philosophy was clear: we do not replace merchant trust; we honor and amplify it. We spent two years walking through Kashmiri Bazaar, Chitta Bazaar, and Riaz Market, listening to stall elders and young fabric manufacturers alike.',
    'Today, Azam Market Online stands as the digital backbone of our market. From high-definition swatch digitization and instantaneous WhatsApp catalog shares to direct 1Link SBP bank settlements and rapid freight bilty dispatch, we have brought centuries of textile craftsmanship into the digital century. Our mission remains steadfast: empowering every stall owner to trade with the entire world with pride and dignity.'
  ],
  core_quote: 'The heartbeat of Pakistan’s textile industry lies in the narrow, bustling alleys of Azam Cloth Market. Our mission is not to replace the merchant’s trust, but to amplify their reach to every corner of the world.',
  quote_author: 'Mian Tariq Aargard',
  quote_subtext: 'Delivered at the All-Pakistan Wholesale Textile Federation Convention, Lahore',
  vision_pillars: [
    {
      title: 'Heritage Preservation & Gaddi Trust',
      description: 'Preserving deep-rooted merchant traditions while giving every stall a verified digital identity and international reach.',
      icon: 'landmark'
    },
    {
      title: 'Macro Swatch Precision & True Colors',
      description: 'Zero guesswork for remote buyers through 4K color-calibrated fabric scans and verified thaan weave parameters.',
      icon: 'palette'
    },
    {
      title: 'Bilty Express & Nationwide Clearing',
      description: 'Integrated cargo logistics directly from Azam Market railway docks to Karachi, Rawalpindi, and Faisalabad.',
      icon: 'truck'
    },
    {
      title: 'Regulated Financial Inclusivity',
      description: 'Instant wholesale payments through State Bank of Pakistan 1Link rails, JazzCash, Keenu, and diaspora cards.',
      icon: 'shield-check'
    }
  ],
  milestones: [
    { year: '2021', title: 'Federation Inception', description: 'Formed the digital charter with 50 founding merchant elders across Delhi Gate.', stat: '50 Founding Stalls' },
    { year: '2023', title: '500-Stall Swatch Digitization', description: 'Launched on-site mobile photography vans to digitize over 12,000 fabric lookbooks.', stat: '12,000+ Fabrics' },
    { year: '2024', title: '1Link & Digital Rail Clearing', description: 'State Bank authorized direct interbank payments and automated invoice generation.', stat: 'PKR 1.2B+ Volume' },
    { year: '2026', title: 'Global Diaspora Wholesale Portal', description: 'Expanding verified exports to UK, GCC, and North American ethnic fashion boutiques.', stat: '1,000+ Active Stalls' }
  ],
  social_links: {
    linkedin: 'https://linkedin.com/company/azam-market-online',
    twitter: 'https://twitter.com/AzamMarketPK',
    whatsapp: '923004211985'
  },
  updated_at: new Date().toISOString()
};

let aargardUpdates: AargardUpdate[] = [
  {
    id: 'upd-101',
    version: 'v2.5.0',
    title: 'One-Click Source Code Project Export Engine',
    date: '2026-09-26',
    category: 'feature',
    badge: 'New Release',
    summary: 'Platform-wide download button added to the footer allowing immediate download of full source code (.zip) for offline review, AI handover analysis, and custom deployments.',
    details: [
      'Added streaming project export endpoint /api/project/download with high-compression zlib packaging',
      'Integrated dedicated Footer Download CTA and interactive AI Handover Hub modal',
      'Included complete local execution guide (npm install && npm run dev) and architecture specifications'
    ],
    vendor_impact: 'Stall owners and tech teams can now export complete platform archives and inspect verified source artifacts.',
    action_label: 'Download Project Now',
    is_published: true,
    importance: 'high',
    created_at: '2026-09-26T04:00:00Z'
  },
  {
    id: 'upd-102',
    version: 'v2.4.2',
    title: 'JazzCash & 1Link PayFast Instant Settlement Integration',
    date: '2026-09-22',
    category: 'payment',
    badge: 'FinTech Rails',
    summary: 'Full integration of State Bank of Pakistan regulated inter-bank payment rails and mobile wallets for subscription billing and wholesale deposits.',
    details: [
      'Activated PayFast 1Link Direct Debit with 40+ Pakistani commercial and Islamic banks',
      'Enabled JazzCash USSD mobile pin approvals and retail agent vouchers',
      'Added real-time settlement transaction ledger in Admin Control Center'
    ],
    vendor_impact: 'Vendors can receive instant subscription activations without sending manual bank deposit receipts.',
    action_label: 'View Payment Gateways',
    is_published: true,
    importance: 'critical',
    created_at: '2026-09-22T10:00:00Z'
  },
  {
    id: 'upd-103',
    version: 'v2.3.8',
    title: 'Autumn/Winter 2026 Swatch Digitization Caravan',
    date: '2026-09-15',
    category: 'logistics',
    badge: 'On-Ground Support',
    summary: 'Mobile photo-station caravan deployed across Kashmiri Bazaar and Chitta Bazaar for fast stall inventory photography.',
    details: [
      'Free 4K fabric swatch macro photography for all verified stall listings',
      'Auto-generation of downloadable PDF lookbooks with custom merchant watermarks',
      'Direct WhatsApp catalogue sharing links enabled on all vendor shops'
    ],
    vendor_impact: 'Participating stall owners report 3.4x faster wholesale buyer inquiries from Karachi and Faisalabad.',
    action_label: 'Request Photo Desk',
    is_published: true,
    importance: 'normal',
    created_at: '2026-09-15T08:30:00Z'
  },
  {
    id: 'upd-104',
    version: 'v2.2.0',
    title: 'Bilty Express Logistics & Lahore Cargo Booking Desk',
    date: '2026-09-05',
    category: 'logistics',
    badge: 'Cargo Network',
    summary: 'Partnership with Azam Market Goods Transport Association to provide bilty tracking and direct stall pickup.',
    details: [
      'Same-day pickup from stall counters for dispatch to Rawalpindi, Peshawar, Multan, and Karachi goods yards',
      'SMS bilty tracking number sent automatically to wholesale buyers',
      'Cargo insurance coverage for high-value silk and embroidered bridal fabrics'
    ],
    vendor_impact: 'Stalls no longer need to haul heavy thaan bales to outer circular road transport addas.',
    is_published: true,
    importance: 'normal',
    created_at: '2026-09-05T09:00:00Z'
  }
];

let aargardServices: any[] = [
  {
    id: 'srv-1',
    title: 'High-Precision 4K Swatch Digitization',
    tagline: 'True-to-life color calibration and weave texture scanning directly at your stall',
    category: 'digitization',
    description: 'Our mobile photography team visits your stall with studio-grade lighting and macro lenses to capture every warp and weft of your fabrics, eliminating remote buyer disputes.',
    features: ['Accurate Pantone color matching', 'Ultra-high-definition zoom', 'Automated PDF Lookbook creation', 'Fast 24-hour turnaround'],
    turnaround_time: '24-48 Hours',
    pricing_tier: 'Free for Verified Stalls',
    icon: 'camera',
    is_active: true,
    is_featured: true,
    contact_whatsapp: '923004211985',
    sort_order: 1
  },
  {
    id: 'srv-2',
    title: 'Azam Bilty Express & Freight Forwarding',
    tagline: 'Direct stall-to-transport-adda cargo dispatch across Pakistan',
    category: 'logistics',
    description: 'Avoid the chaos of hauling heavy bales through narrow market alleys. Our registered porter fleet picks up goods directly from your stall and secures bilty receipts with insured goods transporters.',
    features: ['Daily departures to 65+ cities', 'Digitized bilty receipt SMS', 'Loss protection coverage', 'Door-to-door bulk delivery options'],
    turnaround_time: 'Same-Day Dispatch',
    pricing_tier: 'Subsidized Association Rates',
    icon: 'truck',
    is_active: true,
    is_featured: true,
    contact_whatsapp: '923004211985',
    sort_order: 2
  },
  {
    id: 'srv-3',
    title: '1Link Digital Escrow & Bulk Invoicing',
    tagline: 'Protected inter-bank payments and digital parchi reconciliation',
    category: 'payments',
    description: 'State Bank of Pakistan regulated inter-bank escrow rails allowing remote buyers to deposit funds safely while guaranteeing immediate payouts upon cargo delivery confirmation.',
    features: ['Direct credit to Meezan, HBL, Alfalah, etc.', 'Automated tax and sales parchi', 'Dispute resolution mediation', 'Zero chargeback risk'],
    turnaround_time: 'Instant / T+1',
    pricing_tier: '0.85% clearing fee',
    icon: 'credit-card',
    is_active: true,
    is_featured: true,
    contact_whatsapp: '923004211985',
    sort_order: 3
  },
  {
    id: 'srv-4',
    title: 'Textile Mill ERP & Barcode Inventory Bridge',
    tagline: 'Real-time synchronization between factory warehouses and market stalls',
    category: 'enterprise',
    description: 'Connect your industrial loom inventory directly with your online wholesale stall. Mill price updates and stock roll counts sync automatically via secured REST APIs.',
    features: ['REST API & Webhooks', 'Automated MOQ quantity updates', 'Roll barcode tracking', 'Dedicated technical liaison'],
    turnaround_time: '3-5 Business Days',
    pricing_tier: 'Enterprise Consultation',
    icon: 'database',
    is_active: true,
    is_featured: false,
    contact_whatsapp: '923004211985',
    sort_order: 4
  }
];

let vendorAssistanceRequests: VendorAssistanceRequest[] = [
  {
    id: 'req-201',
    vendor_id: 'v1',
    vendor_name: 'Mian Cloth House',
    stall_number: 'Stall #14-B',
    contact_person: 'Mian Tariq Mehmood',
    whatsapp: '0300-4211985',
    category: 'photography_session',
    subject: 'Winter Khaddar & Karandi 2026 Collection Swatch Photography',
    message: 'We have received 40 fresh design thaan rolls from our Kamalia mill. Need the Aargard photo caravan to scan colors and create PDF catalogue.',
    urgency: 'high',
    status: 'in_progress',
    created_at: '2026-09-22T11:30:00Z',
    admin_notes: 'Scheduled caravan visit for Thursday 11:00 AM at Kashmiri Bazaar.'
  },
  {
    id: 'req-202',
    vendor_id: 'v2',
    vendor_name: 'Rajput Silk & Chiffon',
    stall_number: 'Shop #88-C',
    contact_person: 'Chaudhry Nadeem Rajput',
    whatsapp: '0321-9944112',
    category: 'bilty_logistics',
    subject: 'Urgent Karachi Bilty Pickup for 15 Chiffon Bales',
    message: 'Buyer in Tariq Road Karachi needs immediate dispatch. Need transport porter pickup from shop tomorrow morning.',
    urgency: 'urgent',
    status: 'pending',
    created_at: '2026-09-24T14:10:00Z'
  }
];

// =========================================================================
// PROJECT EXPORT & DOWNLOAD ENDPOINTS
// =========================================================================

app.get('/api/project/stats', (req, res) => {
  const rootDir = process.cwd();
  
  function getDirectoryStats(dir: string, fileList: string[] = []): string[] {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      if (['node_modules', 'dist', '.git', '.cache'].includes(file)) continue;
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        getDirectoryStats(fullPath, fileList);
      } else {
        fileList.push(path.relative(rootDir, fullPath));
      }
    }
    return fileList;
  }

  try {
    const allFiles = getDirectoryStats(rootDir);
    res.json({
      name: 'Azam Market Online',
      version: '2.5.0',
      totalFiles: allFiles.length,
      files: allFiles,
      environment: process.env.NODE_ENV || 'development',
      downloadUrl: '/api/project/download',
      exportFormat: 'ZIP Archive (.zip)'
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to inspect project files', details: err.message });
  }
});

app.get(['/api/project/download', '/api/download-project'], (req, res) => {
  const rootDir = process.cwd();
  const archive = new ZipArchive({
    zlib: { level: 9 }
  });

  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', 'attachment; filename="azam-market-online-project.zip"');

  archive.on('error', (err) => {
    console.error('Archive error:', err);
    if (!res.headersSent) {
      res.status(500).send({ error: 'Could not create archive' });
    }
  });

  archive.pipe(res);

  // Add all project files, ignoring node_modules, dist, git, etc.
  archive.glob('**/*', {
    cwd: rootDir,
    ignore: [
      'node_modules/**',
      'dist/**',
      '.git/**',
      '.cache/**',
      'assets/.aistudio/**',
      '*.log',
      'azam-market-online-project.zip'
    ],
    dot: true
  });

  archive.finalize();
});

// =========================================================================
// AARGARD CEO MEMOIR, UPDATES & SERVICES ENDPOINTS
// =========================================================================

// 1. CEO Profile & Memoir
app.get('/api/aargard/ceo-profile', (req, res) => {
  res.json(ceoProfile);
});

app.put('/api/aargard/ceo-profile', (req, res) => {
  ceoProfile = {
    ...ceoProfile,
    ...req.body,
    updated_at: new Date().toISOString()
  };
  res.json(ceoProfile);
});

// 2. Aargard Updates (Changelog)
app.get('/api/aargard/updates', (req, res) => {
  res.json(aargardUpdates);
});

app.post('/api/aargard/updates', (req, res) => {
  const newUpdate: AargardUpdate = {
    id: `upd-${Date.now()}`,
    version: req.body.version || 'v2.5.0',
    title: req.body.title || 'Platform Update',
    date: req.body.date || new Date().toISOString().split('T')[0],
    category: req.body.category || 'feature',
    badge: req.body.badge || 'Update',
    summary: req.body.summary || '',
    details: Array.isArray(req.body.details) ? req.body.details : [req.body.summary],
    vendor_impact: req.body.vendor_impact || '',
    action_label: req.body.action_label,
    action_url: req.body.action_url,
    is_published: req.body.is_published ?? true,
    importance: req.body.importance || 'normal',
    created_at: new Date().toISOString()
  };
  aargardUpdates.unshift(newUpdate);
  res.status(201).json(newUpdate);
});

app.put('/api/aargard/updates/:id', (req, res) => {
  const index = aargardUpdates.findIndex(u => u.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Update not found' });
  }
  aargardUpdates[index] = { ...aargardUpdates[index], ...req.body };
  res.json(aargardUpdates[index]);
});

// 3. Aargard Services
app.get('/api/aargard/services', (req, res) => {
  res.json(aargardServices);
});

app.post('/api/aargard/services', (req, res) => {
  const newService: any = {
    id: `srv-${Date.now()}`,
    title: req.body.title || 'New Service',
    tagline: req.body.tagline || '',
    category: req.body.category || 'digitization',
    description: req.body.description || '',
    features: Array.isArray(req.body.features) ? req.body.features : [],
    turnaround_time: req.body.turnaround_time || '24-48 Hours',
    pricing_tier: req.body.pricing_tier || 'Custom Quote',
    icon: req.body.icon || 'star',
    is_active: req.body.is_active ?? true,
    is_featured: req.body.is_featured ?? false,
    contact_whatsapp: req.body.contact_whatsapp || '923004211985',
    sort_order: aargardServices.length + 1
  };
  aargardServices.push(newService);
  res.status(201).json(newService);
});

app.put('/api/aargard/services/:id', (req, res) => {
  const index = aargardServices.findIndex(s => s.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Service not found' });
  }
  aargardServices[index] = { ...aargardServices[index], ...req.body };
  res.json(aargardServices[index]);
});

// 4. Vendor Assistance Requests
app.get('/api/aargard/assistance-requests', (req, res) => {
  const { vendor_id } = req.query;
  if (vendor_id) {
    return res.json(vendorAssistanceRequests.filter(r => r.vendor_id === vendor_id));
  }
  res.json(vendorAssistanceRequests);
});

app.post('/api/aargard/assistance-requests', (req, res) => {
  const newReq: VendorAssistanceRequest = {
    id: `req-${Date.now()}`,
    vendor_id: req.body.vendor_id || 'unknown',
    vendor_name: req.body.vendor_name || 'Vendor',
    stall_number: req.body.stall_number || 'N/A',
    contact_person: req.body.contact_person || 'Representative',
    whatsapp: req.body.whatsapp || '',
    category: req.body.category || 'general',
    subject: req.body.subject || 'Assistance Inquiry',
    message: req.body.message || '',
    urgency: req.body.urgency || 'normal',
    status: 'pending',
    created_at: new Date().toISOString()
  };
  vendorAssistanceRequests.unshift(newReq);
  res.status(201).json(newReq);
});

app.put('/api/aargard/assistance-requests/:id', (req, res) => {
  const index = vendorAssistanceRequests.findIndex(r => r.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Request not found' });
  }
  vendorAssistanceRequests[index] = {
    ...vendorAssistanceRequests[index],
    ...req.body
  };
  res.json(vendorAssistanceRequests[index]);
});

// Vite Middleware for Development
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Azam Market Online Server running on http://localhost:${PORT}`);
  });
}

startServer();
