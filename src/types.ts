export interface Market {
  id: string;
  name: string;
  slug: string;
  city: string;
  country: string;
  is_active: boolean;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  name_ur?: string; // Urdu display name
  slug: string;
  icon: string;
  market_id?: string;
  vendor_count: number;
}

export type Language = 'en' | 'ur';

export interface SubscriptionTier {
  id: string;
  name: 'basic' | 'standard' | 'premium';
  display_name: string;
  price_pkr: number;
  max_products: number; // -1 = unlimited
  max_catalogues: number; // -1 = unlimited
  has_analytics: boolean;
  has_verified_badge: boolean;
  has_featured_placement: boolean;
  stripe_price_id?: string;
}

export interface Product {
  id: string;
  vendor_id: string;
  name: string;
  description: string;
  fabric_type: string;
  price_range: string; // e.g., '₨800–1200/m'
  moq: string; // e.g., '50 metres'
  image_url: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface Catalogue {
  id: string;
  vendor_id: string;
  title: string;
  description: string;
  pdf_url: string;
  file_size_mb: number;
  season: string; // e.g. 'Summer 2026', 'Winter 2025'
  download_count: number;
  is_active: boolean;
  created_at: string;
}

export interface ShopCustomizationBlock {
  id:
    | 'about'
    | 'featured_products'
    | 'catalogues'
    | 'pricing_policy'
    | 'stall_location'
    | 'contact_cta'
    | 'fabric_guarantee'
    | 'bulk_pricing_tiers'
    | 'market_landmark'
    | 'buyer_reviews'
    | 'faq_accordion'
    | 'bank_payment_details'
    | 'video_showcase';
  label: string;
  enabled: boolean;
  sort_order: number;
  custom_title?: string;
  subtitle?: string;
}

export interface ShopCustomization {
  is_published: boolean;
  published_at?: string;
  last_saved_at?: string;

  // Theme Colors
  theme_color: string; // primary brand hex
  accent_color: string; // secondary / gold / highlight hex
  background_tone: 'white' | 'warm_ivory' | 'soft_gray' | 'night_emerald' | 'obsidian_black' | 'terracotta_blush';
  font_style: 'classic_serif' | 'modern_clean' | 'heritage_bazaar' | 'urdu_nastaliq_vibe';

  // Header options
  header_layout: 'standard' | 'centered' | 'compact' | 'split_contact';
  show_announcement: boolean;
  announcement_text: string;
  show_market_badge: boolean;
  logo_shape: 'rounded' | 'square' | 'circle' | 'pill';
  logo_url?: string; // custom logo override

  // Hero options
  hero_layout: 'banner_overlay' | 'split_showcase' | 'clean_minimal' | 'catalog_spotlight';
  hero_headline: string;
  hero_tagline: string;
  hero_cover_url?: string;
  hero_show_whatsapp: boolean;
  hero_show_phone: boolean;
  hero_show_catalogue_btn: boolean;
  hero_badge_text?: string;
  verification_badge_url?: string; // Quality/Trade certificate stamp
  video_url?: string; // Loom/Workshop showcase video

  // WhatsApp Button
  whatsapp_button: {
    enabled: boolean;
    custom_label: string;
    welcome_message: string;
    show_floating_badge: boolean;
    online_status_text: string;
  };

  // Phone Attached Button
  phone_button: {
    enabled: boolean;
    custom_label: string;
    phone_number: string;
    show_in_header: boolean;
    show_in_sticky_bar: boolean;
  };

  // Product Pricing
  product_pricing: {
    show_public_prices: boolean;
    price_badge_format: 'pkr_metre' | 'pkr_roll' | 'pkr_suit' | 'pkr_thaan';
    show_moq_badge: boolean;
    enable_bulk_discount_banner: boolean;
    bulk_discount_text: string;
  };

  // Storefront Engagement & Activity Stats Display
  show_stats?: boolean;
  stats_display?: {
    enabled: boolean;
    show_views: boolean;
    show_whatsapp: boolean;
    show_messages: boolean;
    show_calls: boolean;
  };

  // Bank & Direct Wire Clearing Details
  bank_details?: {
    bank_name: string;
    account_title: string;
    iban: string;
    raast_id: string;
    jazzcash_no: string;
    easypaisa_no: string;
  };

  // FAQs
  faqs?: { question: string; answer: string }[];

  // Blocks
  blocks: ShopCustomizationBlock[];
}

export const DEFAULT_SHOP_CUSTOMIZATION: ShopCustomization = {
  is_published: true,
  published_at: '2026-08-01T10:00:00Z',
  last_saved_at: '2026-08-01T10:00:00Z',
  theme_color: '#0F5C3A',
  accent_color: '#C9952A',
  background_tone: 'white',
  font_style: 'classic_serif',
  header_layout: 'standard',
  show_announcement: true,
  announcement_text: 'Direct Wholesale Mill Stall • Special Rates for Bulk Orders Across Pakistan',
  show_market_badge: true,
  logo_shape: 'rounded',
  hero_layout: 'banner_overlay',
  hero_headline: '',
  hero_tagline: '',
  hero_cover_url: '',
  hero_show_whatsapp: true,
  hero_show_phone: true,
  hero_show_catalogue_btn: true,
  hero_badge_text: 'Verified Azam Market Stall',
  show_stats: true,
  stats_display: {
    enabled: true,
    show_views: true,
    show_whatsapp: true,
    show_messages: true,
    show_calls: true,
  },
  whatsapp_button: {
    enabled: true,
    custom_label: 'Chat on WhatsApp',
    welcome_message: 'Assalam-o-Alaikum! I am contacting you from Azam Market Online regarding bulk fabric orders.',
    show_floating_badge: true,
    online_status_text: 'Online • Fast Reply',
  },
  phone_button: {
    enabled: true,
    custom_label: 'Direct Call Stall',
    phone_number: '',
    show_in_header: true,
    show_in_sticky_bar: true,
  },
  product_pricing: {
    show_public_prices: true,
    price_badge_format: 'pkr_metre',
    show_moq_badge: true,
    enable_bulk_discount_banner: true,
    bulk_discount_text: 'Wholesale Discount: Special rebate on orders exceeding 500 metres',
  },
  bank_details: {
    bank_name: 'Meezan Bank Ltd (Islamic Banking)',
    account_title: 'Azam Market Wholesale Textile Account',
    iban: 'PK12MEZN0001090102938475',
    raast_id: '+923001234567',
    jazzcash_no: '0300-1234567',
    easypaisa_no: '0345-7654321',
  },
  faqs: [
    {
      question: 'What is the Minimum Order Quantity (MOQ) for wholesale rolls?',
      answer: 'Standard minimum order is 50 metres per color or 1 full thaan (approx. 40-50m). Sample cuts (2m) are available for verified buyers before placing bulk roll bookings.',
    },
    {
      question: 'Which cargo services do you use for delivery across Pakistan?',
      answer: 'We dispatch daily via Bilal Cargo, Daewoo Express, Faisal Movers, and Al-Madina Cargo to Karachi, Faisalabad, Rawalpindi, Peshawar, Multan, and Quetta. Tracking bilti receipts are dispatched via WhatsApp.',
    },
    {
      question: 'Can we inspect fabric swatches in person at your Azam Market stall?',
      answer: 'Yes! You are welcome to visit our physical stall in Azam Cloth Market, Lahore from Monday to Saturday, 10:00 AM to 8:00 PM. Stall location and floor directions are provided above.',
    },
    {
      question: 'What payment methods do you accept for bulk bookings?',
      answer: 'We accept direct online bank transfer (Meezan/HBL/Alfalah), JazzCash, PayFast, Keenu, and credit/debit cards via Stripe. Cash on delivery is also available for delivery within Lahore textile bazaars.',
    },
  ],
  blocks: [
    { id: 'about', label: 'About Stall & Trade Terms', enabled: true, sort_order: 1 },
    { id: 'fabric_guarantee', label: 'Fabric Quality & Mill Direct Guarantee', enabled: true, sort_order: 2 },
    { id: 'featured_products', label: 'Product Listings & Roll Samples', enabled: true, sort_order: 3 },
    { id: 'bulk_pricing_tiers', label: 'Wholesale Volume Pricing Matrix', enabled: true, sort_order: 4 },
    { id: 'catalogues', label: 'PDF Lookbooks & Swatch Books', enabled: true, sort_order: 5 },
    { id: 'pricing_policy', label: 'Wholesale Trade & Cargo Policy', enabled: true, sort_order: 6 },
    { id: 'stall_location', label: 'Market Stall Map & Visiting Hours', enabled: true, sort_order: 7 },
    { id: 'market_landmark', label: 'Bazaar Gate & Hall Walking Landmark', enabled: true, sort_order: 8 },
    { id: 'buyer_reviews', label: 'Verified B2B Buyer Reviews', enabled: true, sort_order: 9 },
    { id: 'faq_accordion', label: 'Buyer Frequently Asked Questions', enabled: true, sort_order: 10 },
    { id: 'bank_payment_details', label: 'Bank & Mobile Wallet Payment Details', enabled: true, sort_order: 11 },
    { id: 'contact_cta', label: 'Direct Stall Owner Contact CTA', enabled: true, sort_order: 12 },
  ],
};

export interface Vendor {
  id: string;
  user_id?: string;
  market_id: string;
  tier_id: string;
  slug: string;
  shop_name: string;
  stall_number: string;
  description: string;
  logo_url: string | null;
  cover_url: string | null;
  whatsapp: string;
  phone?: string;
  products_offered?: string;
  email: string;
  website?: string;
  shop_address?: string;
  instagram_url?: string;
  tiktok_url?: string;
  google_url?: string; // Google Maps / Business Profile link
  tags: string[];
  categories: Category[];
  is_verified: boolean;
  is_featured: boolean;
  status: 'pending' | 'active' | 'suspended';
  profile_views: number;
  whatsapp_clicks: number;
  email_clicks: number;
  call_clicks?: number;
  message_clicks?: number;
  onboarded_by?: string;
  created_at: string;
  updated_at: string;
  products?: Product[];
  catalogues?: Catalogue[];
  tier?: SubscriptionTier;
  market?: Market;
  customization?: ShopCustomization;
  verification?: VendorVerification;

  // Subscription (Stripe, $5/mo flat, 30-day free trial)
  subscription_status: 'trialing' | 'active' | 'past_due' | 'canceled';
  trial_ends_at: string;
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
}

// CNIC (Pakistan national ID) + NTN (tax number). Kept off the main Vendor
// shape's public columns on purpose -- see supabase/migrations/
// 20260927000400_vendor_signup_fields.sql for why this lives in its own
// RLS-locked table (only the owning vendor or an admin can ever read it).
export interface VendorVerification {
  vendor_id: string;
  cnic?: string;
  ntn?: string;
  created_at: string;
  updated_at: string;
}

export interface InquiryLog {
  id: string;
  vendor_id: string;
  event_type: 'whatsapp_click' | 'email_click' | 'call_click' | 'message_click' | 'catalogue_download' | 'profile_view';
  catalogue_id?: string;
  ip_hash?: string;
  created_at: string;
}

export interface AdminUser {
  id: string;
  user_id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'staff';
  created_at: string;
}

export interface VendorAnalytics {
  dailyMetrics: {
    date: string;
    views: number;
    whatsapp: number;
    downloads: number;
    emails: number;
    calls: number;
    messages: number;
  }[];
  totalViews: number;
  totalWhatsapp: number;
  totalDownloads: number;
  totalEmails: number;
  totalCalls: number;
  totalMessages: number;
  viewsMoM: number;
  whatsappMoM: number;
  downloadsMoM: number;
  emailsMoM: number;
  callsMoM: number;
  messagesMoM: number;
}

// Payment Gateway & Transaction Types
export type PaymentGatewayId = 'jazzcash' | 'payfast' | 'keenu' | 'stripe';

export interface PaymentTransaction {
  id: string;
  vendor_id?: string;
  vendor_name?: string;
  gateway: PaymentGatewayId;
  amount_pkr: number;
  purpose: 'subscription_upgrade' | 'subscription_renewal' | 'sample_booking_deposit' | 'wholesale_order';
  status: 'completed' | 'pending' | 'failed';
  reference_id: string;
  payer_name: string;
  payer_contact: string;
  payment_method_detail: string;
  created_at: string;
  tier_id?: string;
  notes?: string;
}

export interface GatewayConfig {
  id: PaymentGatewayId;
  name: string;
  subtitle: string;
  badge: string;
  is_enabled: boolean;
  is_sandbox: boolean;
  merchant_id: string;
  supported_methods: string[];
  settlement_currency: 'PKR' | 'USD';
  color: string;
}

export type PaymentGateway = GatewayConfig;

// =========================================================================
// PLATFORM UPDATES & VENDOR ASSISTANCE TYPES
// =========================================================================

export type UpdateCategory = 'feature' | 'logistics' | 'security' | 'market_policy' | 'payment' | 'vendor_guide';

export interface AargardUpdate {
  id: string;
  version: string;
  title: string;
  date: string;
  category: UpdateCategory;
  badge: string;
  summary: string;
  details: string[];
  vendor_impact?: string;
  action_label?: string;
  action_url?: string;
  is_published: boolean;
  importance: 'normal' | 'high' | 'critical';
  created_at: string;
}

export type AssistanceCategory =
  | 'catalog_upload'
  | 'photography_session'
  | 'bilty_logistics'
  | 'payment_gateway'
  | 'erp_sync'
  | 'dispute_resolution'
  | 'general';

export interface VendorAssistanceRequest {
  id: string;
  vendor_id: string;
  vendor_name: string;
  stall_number: string;
  contact_person: string;
  whatsapp: string;
  category: AssistanceCategory;
  subject: string;
  message: string;
  urgency: 'normal' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'resolved';
  created_at: string;
  admin_notes?: string;
}


