import React, { useState, useEffect } from 'react';
import {
  Award,
  MapPin,
  Phone,
  Mail,
  Globe,
  Calendar,
  FileText,
  Download,
  CheckCircle,
  CheckCircle2,
  ExternalLink,
  ArrowLeft,
  ShoppingBag,
  ShieldCheck,
  Shield,
  MessageCircle,
  Clock,
  CreditCard,
  Truck,
  Sparkles,
  Tag,
  MessageSquare,
  TrendingUp,
  HelpCircle,
  Landmark,
  Star,
  Video,
  Play,
  Layers,
  ChevronDown,
  ChevronUp,
  Wallet,
  Receipt,
  Building,
  Check,
} from 'lucide-react';
import { Vendor, Product, Catalogue, DEFAULT_SHOP_CUSTOMIZATION } from '../../types';
import { ContactBar } from './ContactBar';
import { Disclaimer } from './Disclaimer';

interface VendorShopProps {
  vendor: Vendor;
  onBackToDirectory: () => void;
  onOpenCatalogue: (catalogueId: string) => void;
  onLogEvent: (
    vendorId: string,
    type: 'whatsapp_click' | 'email_click' | 'call_click' | 'message_click' | 'profile_view' | 'catalogue_download',
    catId?: string
  ) => void;
}

export const VendorShop: React.FC<VendorShopProps> = ({
  vendor,
  onBackToDirectory,
  onOpenCatalogue,
  onLogEvent,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'catalogues'>('overview');
  const [coverFailed, setCoverFailed] = useState(false);
  useEffect(() => setCoverFailed(false), [vendor.id, vendor.cover_url]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeImageIdx, setActiveImageIdx] = useState<number>(0);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  // Extract customization settings with fallback
  const cust = vendor.customization || DEFAULT_SHOP_CUSTOMIZATION;
  const primaryColor = cust.theme_color || '#0F5C3A';
  const accentColor = cust.accent_color || '#C9952A';

  const initials = vendor.shop_name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  const handleWhatsAppInquiry = (customMsg?: string) => {
    onLogEvent(vendor.id, 'whatsapp_click');
    const phone = vendor.whatsapp.replace(/[^0-9+]/g, '');
    const msgText =
      customMsg ||
      cust.whatsapp_button?.welcome_message ||
      `Hi ${vendor.shop_name}, I found your shop (${vendor.stall_number}) on Azam Market Online directory. I would like to inquire about wholesale fabric roll prices and minimum order quantities.`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msgText)}`, '_blank');
  };

  const handleDirectCall = () => {
    onLogEvent(vendor.id, 'call_click');
    const directNum = cust.phone_button?.phone_number || vendor.whatsapp;
    window.location.href = `tel:${directNum.replace(/[^0-9+]/g, '')}`;
  };

  const handleMessageInquiry = () => {
    onLogEvent(vendor.id, 'message_click');
    onLogEvent(vendor.id, 'email_click');
    const subject = encodeURIComponent(`Azam Market Inquiry: ${vendor.shop_name}`);
    const body = encodeURIComponent(
      `Hi ${vendor.shop_name} (${vendor.stall_number}),\n\nI am contacting you from the Azam Market Online directory regarding your wholesale fabric collections.`
    );
    window.location.href = `mailto:${vendor.email}?subject=${subject}&body=${body}`;
  };

  const handleSmsInquiry = () => {
    onLogEvent(vendor.id, 'message_click');
    const directNum = (cust.phone_button?.phone_number || vendor.whatsapp).replace(/[^0-9+]/g, '');
    const body = encodeURIComponent(
      `Hi ${vendor.shop_name} (${vendor.stall_number}), I found your shop on Azam Market Online. I'd like to ask about wholesale fabric pricing.`
    );
    window.location.href = `sms:${directNum}?&body=${body}`;
  };

  // Background tone styling
  const bgClass =
    cust.background_tone === 'warm_ivory'
      ? 'bg-[#FAF7F2] text-stone-900'
      : cust.background_tone === 'soft_gray'
      ? 'bg-[#F1F5F9] text-slate-900'
      : cust.background_tone === 'night_emerald'
      ? 'bg-[#0B1E16] text-emerald-50'
      : 'bg-gray-50 text-gray-900';

  const fontClass =
    cust.font_style === 'classic_serif'
      ? 'font-serif'
      : cust.font_style === 'heritage_bazaar'
      ? 'font-serif tracking-wide'
      : 'font-sans';

  // Logo shape class
  const logoShapeClass =
    cust.logo_shape === 'circle'
      ? 'rounded-full'
      : cust.logo_shape === 'square'
      ? 'rounded-none'
      : cust.logo_shape === 'pill'
      ? 'rounded-3xl'
      : 'rounded-2xl';

  const coverUrl = cust.hero_cover_url || vendor.cover_url;

  // Show the stall's real market (e.g. Raja Bazar, Rawalpindi), not a hard-coded one.
  const marketName = vendor.market?.name || 'Azam Cloth Market';
  const marketCity = vendor.market?.city || 'Lahore';
  const marketLine = `${marketName}, ${marketCity}`;
  const DEFAULT_BADGES = ['', 'Verified Azam Market Stall', 'Azam Cloth Market • Direct Wholesale Stall'];
  const heroBadge = DEFAULT_BADGES.includes(cust.hero_badge_text || '')
    ? `Verified ${marketName} Stall`
    : (cust.hero_badge_text as string);

  return (
    <div className={`min-h-screen ${bgClass} pb-28 ${fontClass}`}>
      <div className="max-w-7xl mx-auto px-3 sm:px-6 pt-3">
        <Disclaimer compact />
      </div>
      {/* 1. TOP ANNOUNCEMENT BANNER (IF ENABLED) */}
      {cust.show_announcement && (
        <div
          className="py-2 px-4 text-center text-xs font-bold text-white shadow-xs transition-colors"
          style={{ backgroundColor: primaryColor }}
        >
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <span className="truncate">
              {cust.announcement_text ||
                'Direct Mill Importers & Manufacturers • Bulk Cargo Shipments Dispatched Daily'}
            </span>
          </div>
        </div>
      )}

      {/* 2. TOP DIRECTORY NAVIGATION BAR */}
      <div className="bg-white/95 backdrop-blur-md border-b border-gray-200 py-3 px-4 sm:px-6 lg:px-8 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <button
            onClick={onBackToDirectory}
            className="inline-flex items-center gap-2 text-xs font-semibold hover:opacity-80 transition-opacity cursor-pointer"
            style={{ color: primaryColor }}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Azam Market Directory</span>
          </button>

          {/* Verification & Status Badges */}
          <div className="flex items-center gap-2">
            {cust.show_market_badge && (
              <span className="bg-emerald-50 text-emerald-800 text-[11px] font-bold px-2.5 py-1 rounded-full border border-emerald-200 hidden sm:inline-flex items-center gap-1">
                <MapPin className="w-3 h-3 text-emerald-700" /> {marketLine}
              </span>
            )}
            {vendor.is_verified && (
              <span
                className="text-[11px] font-bold px-2.5 py-1 rounded-full border inline-flex items-center gap-1"
                style={{
                  backgroundColor: '#FDF6E7',
                  color: accentColor,
                  borderColor: `${accentColor}40`,
                }}
              >
                <Award className="w-3.5 h-3.5" /> Verified Stall
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 3. HERO / COVER BANNER SECTION */}
      <div className="relative h-60 sm:h-72 lg:h-80 w-full overflow-hidden">
        {coverUrl && !coverFailed ? (
          <img
            src={coverUrl}
            alt={vendor.shop_name}
            className="w-full h-full object-cover"
            onError={() => setCoverFailed(true)}
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${primaryColor}, #072e1d)`,
            }}
          >
            <span className="font-serif text-white/15 text-6xl sm:text-8xl font-bold tracking-widest select-none">
              {marketName.toUpperCase()}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent"></div>

        {/* Hero Overlay Details for 'banner_overlay' layout */}
        <div className="absolute bottom-6 inset-x-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white z-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <span
              className="text-[11px] font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 shadow-xs border"
              style={{
                backgroundColor: '#FDF6E7',
                color: accentColor,
                borderColor: `${accentColor}55`,
              }}
            >
              {heroBadge}
            </span>
            <h1 className="font-serif text-2xl sm:text-4xl font-bold leading-tight">
              {cust.hero_headline || vendor.shop_name}
            </h1>
            <p className="text-xs sm:text-sm text-gray-200 line-clamp-2">
              {cust.hero_tagline || vendor.description}
            </p>
          </div>

          {/* Hero Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {cust.hero_show_phone && cust.phone_button?.enabled && (
              <button
                onClick={handleDirectCall}
                className="bg-white hover:bg-gray-100 text-gray-900 text-xs font-bold px-4 py-2.5 rounded-xl shadow-md inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Phone className="w-4 h-4 text-blue-600" />
                <span>{cust.phone_button.custom_label || 'Call Stall'}</span>
              </button>
            )}

            {cust.hero_show_whatsapp && cust.whatsapp_button?.enabled !== false && (
              <button
                onClick={() => handleWhatsAppInquiry()}
                className="bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md inline-flex items-center gap-2 transition-colors cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>{cust.whatsapp_button?.custom_label || 'WhatsApp Order'}</span>
              </button>
            )}

            {cust.hero_show_phone && cust.phone_button?.enabled && (
              <button
                onClick={handleSmsInquiry}
                className="bg-white hover:bg-gray-100 text-gray-900 text-xs font-bold px-4 py-2.5 rounded-xl shadow-md inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 text-purple-600" />
                <span>Send SMS</span>
              </button>
            )}

            {cust.hero_show_catalogue_btn && vendor.catalogues && vendor.catalogues.length > 0 && (
              <button
                onClick={() => setActiveTab('catalogues')}
                className="bg-black/50 hover:bg-black/70 backdrop-blur-md text-white text-xs font-bold px-4 py-2.5 rounded-xl border border-white/30 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <FileText className="w-4 h-4 text-amber-300" />
                <span>PDF Catalogues</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 4. SHOP PROFILE HEADER CARD */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 mt-4">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-5 sm:p-6">
          <div
            className={`flex flex-col gap-6 ${
              cust.header_layout === 'centered'
                ? 'items-center text-center'
                : 'md:flex-row md:items-center justify-between'
            }`}
          >
            {/* Logo + Details */}
            <div
              className={`flex flex-col sm:flex-row items-center gap-4 ${
                cust.header_layout === 'centered' ? 'justify-center text-center' : ''
              }`}
            >
              {/* Logo Frame with customized shape */}
              <div
                className={`w-20 h-20 sm:w-24 sm:h-24 border-4 border-white shadow-xl bg-gray-100 flex items-center justify-center overflow-hidden shrink-0 ${logoShapeClass}`}
                style={{ backgroundColor: primaryColor }}
              >
                {vendor.logo_url ? (
                  <img
                    src={vendor.logo_url}
                    alt={vendor.shop_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className="w-full h-full text-white font-serif font-bold text-3xl flex items-center justify-center"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {initials}
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <div
                  className={`flex items-center gap-2 flex-wrap ${
                    cust.header_layout === 'centered' ? 'justify-center' : ''
                  }`}
                >
                  <h2 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900">
                    {vendor.shop_name}
                  </h2>
                  <span
                    className="text-xs font-semibold px-2.5 py-0.5 rounded-full uppercase"
                    style={{
                      backgroundColor: `${primaryColor}15`,
                      color: primaryColor,
                    }}
                  >
                    {vendor.tier?.display_name || 'Vendor'}
                  </span>
                </div>

                <div
                  className={`flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-600 ${
                    cust.header_layout === 'centered' ? 'justify-center' : ''
                  }`}
                >
                  <span className="flex items-center gap-1 font-semibold text-gray-900">
                    <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                    <strong>{vendor.stall_number}</strong>
                  </span>
                  <span>•</span>
                  <span>{marketLine}</span>
                  <span>•</span>
                  <span>{vendor.profile_views} Stall Views</span>
                </div>
              </div>
            </div>

            {/* Header Action Buttons (Header Layout Variants) */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Attached Phone Call Button */}
              {cust.phone_button?.enabled && cust.phone_button?.show_in_header && (
                <button
                  onClick={handleDirectCall}
                  className="bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold px-3.5 py-2.5 rounded-xl border border-blue-200 inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <Phone className="w-4 h-4" />
                  <span>{cust.phone_button.custom_label || 'Call Stall'}</span>
                </button>
              )}

              {/* WhatsApp Button */}
              {cust.whatsapp_button?.enabled !== false && (
                <button
                  onClick={() => handleWhatsAppInquiry()}
                  className="bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs inline-flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{cust.whatsapp_button?.custom_label || 'WhatsApp Vendor'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="mt-6 border-b border-gray-200 flex gap-6 text-sm font-semibold">
            <button
              onClick={() => setActiveTab('overview')}
              className={`pb-3 border-b-2 transition-colors cursor-pointer ${
                activeTab === 'overview'
                  ? 'border-current font-bold'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
              style={{
                color: activeTab === 'overview' ? primaryColor : undefined,
                borderColor: activeTab === 'overview' ? primaryColor : 'transparent',
              }}
            >
              Shop Overview
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className={`pb-3 border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
                activeTab === 'products'
                  ? 'border-current font-bold'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
              style={{
                color: activeTab === 'products' ? primaryColor : undefined,
                borderColor: activeTab === 'products' ? primaryColor : 'transparent',
              }}
            >
              <span>Product Listings</span>
              <span
                className="text-xs px-2 py-0.5 rounded-full font-bold"
                style={{
                  backgroundColor: `${primaryColor}15`,
                  color: primaryColor,
                }}
              >
                {vendor.products?.length || 0}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('catalogues')}
              className={`pb-3 border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
                activeTab === 'catalogues'
                  ? 'border-current font-bold'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
              style={{
                color: activeTab === 'catalogues' ? primaryColor : undefined,
                borderColor: activeTab === 'catalogues' ? primaryColor : 'transparent',
              }}
            >
              <span>PDF Lookbooks</span>
              <span
                className="text-xs px-2 py-0.5 rounded-full font-bold"
                style={{
                  backgroundColor: '#FDF6E7',
                  color: accentColor,
                }}
              >
                {vendor.catalogues?.length || 0}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 5. MAIN TAB CONTENT AREA */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {/* OVERVIEW TAB: RENDERS DYNAMICALLY ORDERED MODULAR BLOCKS */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Columns: Configurable Blocks */}
            <div className="lg:col-span-2 space-y-6">
              {cust.blocks
                .filter((b) => b.enabled)
                .map((block) => {
                  switch (block.id) {
                    case 'about':
                      return (
                        <div
                          key={block.id}
                          className="bg-white rounded-2xl border border-gray-200 p-6 shadow-2xs space-y-3"
                        >
                          <h3 className="font-serif text-lg font-bold text-gray-900 flex items-center gap-2">
                            <span
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: primaryColor }}
                            ></span>
                            {block.custom_title || `About ${vendor.shop_name}`}
                          </h3>
                          <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                            {vendor.description}
                          </p>

                          {/* Specialties / Fabric Tags */}
                          {vendor.tags && vendor.tags.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-gray-100">
                              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                                Fabric Specialties & Wholesale Terms
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {vendor.tags.map((tag, idx) => (
                                  <span
                                    key={idx}
                                    className="text-xs font-semibold px-3 py-1 rounded-lg border"
                                    style={{
                                      backgroundColor: `${primaryColor}10`,
                                      color: primaryColor,
                                      borderColor: `${primaryColor}20`,
                                    }}
                                  >
                                    ✓ {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );

                    case 'featured_products':
                      return (
                        <div
                          key={block.id}
                          className="bg-white rounded-2xl border border-gray-200 p-6 shadow-2xs space-y-4"
                        >
                          <div className="flex items-center justify-between">
                            <h3 className="font-serif text-lg font-bold text-gray-900">
                              {block.custom_title || 'Featured Fabric Samples'}
                            </h3>
                            <button
                              onClick={() => setActiveTab('products')}
                              className="text-xs font-bold hover:underline"
                              style={{ color: primaryColor }}
                            >
                              View All ({vendor.products?.length || 0}) →
                            </button>
                          </div>

                          {/* Bulk discount banner if configured */}
                          {cust.product_pricing?.enable_bulk_discount_banner && (
                            <div
                              className="p-3 rounded-xl text-xs font-semibold flex items-center gap-2 border"
                              style={{
                                backgroundColor: '#FDF6E7',
                                color: accentColor,
                                borderColor: `${accentColor}40`,
                              }}
                            >
                              <Sparkles className="w-4 h-4 shrink-0" />
                              <span>
                                {cust.product_pricing.bulk_discount_text ||
                                  'Wholesale Discount: Up to 10% off for full roll bookings (500m+)'}
                              </span>
                            </div>
                          )}

                          {vendor.products && vendor.products.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                              {vendor.products.slice(0, 3).map((prod) => (
                                <div
                                  key={prod.id}
                                  onClick={() => { setSelectedProduct(prod); setActiveImageIdx(0); }}
                                  className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden cursor-pointer group hover:shadow-md transition-all flex flex-col justify-between"
                                >
                                  <div className="h-32 bg-gray-200 overflow-hidden relative">
                                    <img
                                      src={prod.image_url}
                                      alt={prod.name}
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                    />
                                    <span className="absolute top-2 left-2 bg-black/70 text-white text-[9px] font-bold px-2 py-0.5 rounded-md">
                                      {prod.fabric_type}
                                    </span>
                                  </div>
                                  <div className="p-3 space-y-1">
                                    <h4 className="text-xs font-bold text-gray-900 truncate">
                                      {prod.name}
                                    </h4>
                                    <div className="flex items-center justify-between text-xs pt-1">
                                      <span
                                        className="font-bold text-xs"
                                        style={{ color: primaryColor }}
                                      >
                                        {cust.product_pricing?.show_public_prices !== false
                                          ? prod.price_range
                                          : 'WhatsApp for Price'}
                                      </span>
                                      {cust.product_pricing?.show_moq_badge && (
                                        <span className="text-[10px] text-gray-400">
                                          MOQ: {prod.moq}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-gray-400 py-4 text-center">
                              No product listings uploaded yet.
                            </p>
                          )}
                        </div>
                      );

                    case 'catalogues':
                      return (
                        <div
                          key={block.id}
                          className="bg-white rounded-2xl border border-gray-200 p-6 shadow-2xs space-y-4"
                        >
                          <div className="flex items-center justify-between">
                            <h3 className="font-serif text-lg font-bold text-gray-900">
                              {block.custom_title || 'PDF Lookbooks & Swatch Books'}
                            </h3>
                            <button
                              onClick={() => setActiveTab('catalogues')}
                              className="text-xs font-bold hover:underline"
                              style={{ color: primaryColor }}
                            >
                              Browse All →
                            </button>
                          </div>

                          {vendor.catalogues && vendor.catalogues.length > 0 ? (
                            <div className="space-y-3">
                              {vendor.catalogues.slice(0, 2).map((cat) => (
                                <div
                                  key={cat.id}
                                  className="p-3.5 rounded-xl border border-gray-200 flex items-center justify-between gap-3 bg-gray-50/50"
                                >
                                  <div className="flex items-center gap-3">
                                    <div
                                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                                      style={{
                                        backgroundColor: '#FDF6E7',
                                        color: accentColor,
                                      }}
                                    >
                                      <FileText className="w-5 h-5" />
                                    </div>
                                    <div>
                                      <div className="text-xs font-bold text-gray-900">
                                        {cat.title}
                                      </div>
                                      <div className="text-[11px] text-gray-500">
                                        {cat.season} • {cat.file_size_mb} MB PDF • {cat.download_count} downloads
                                      </div>
                                    </div>
                                  </div>

                                  <button
                                    onClick={() => onOpenCatalogue(cat.id)}
                                    className="text-xs font-bold px-3.5 py-1.5 rounded-xl text-white inline-flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                                    style={{ backgroundColor: primaryColor }}
                                  >
                                    <Download className="w-3.5 h-3.5" />
                                    <span>Download</span>
                                  </button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-gray-400 py-4 text-center">
                              No PDF lookbooks uploaded yet.
                            </p>
                          )}
                        </div>
                      );

                    case 'pricing_policy':
                      return (
                        <div
                          key={block.id}
                          className="bg-white rounded-2xl border border-gray-200 p-6 shadow-2xs space-y-4"
                        >
                          <h3 className="font-serif text-lg font-bold text-gray-900 flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-[#0F5C3A]" />
                            {block.custom_title || 'Wholesale Trade & Pricing Policy'}
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 space-y-1">
                              <strong className="block text-gray-900 text-xs font-bold">
                                💳 Payment Terms
                              </strong>
                              <p className="text-gray-600 text-[11px] leading-relaxed">
                                Standard wholesale trade terms: 30% advance booking via HBL/Meezan bank transfer, balance on dispatch. Cash on delivery available inside Lahore market zone.
                              </p>
                            </div>
                            <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 space-y-1">
                              <strong className="block text-gray-900 text-xs font-bold">
                                🚚 Nationwide Cargo Shipping
                              </strong>
                              <p className="text-gray-600 text-[11px] leading-relaxed">
                                Daily dispatches to Faisalabad, Karachi, Rawalpindi, Peshawar & Multan via Bilal Cargo, Al-Madina and Daewoo Express with tracking receipts provided on WhatsApp.
                              </p>
                            </div>
                          </div>
                        </div>
                      );

                    case 'stall_location':
                      return (
                        <div
                          key={block.id}
                          className="bg-white rounded-2xl border border-gray-200 p-6 shadow-2xs space-y-3"
                        >
                          <h3 className="font-serif text-lg font-bold text-gray-900 flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-emerald-700" />
                            {block.custom_title || 'Market Stall Physical Location & Visiting Hours'}
                          </h3>
                          <div className="text-xs text-gray-700 space-y-2">
                            <p>
                              <strong>Physical Stall:</strong> {vendor.stall_number}, {marketLine}, Pakistan.
                            </p>
                            <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 flex items-center gap-2 text-[11px] text-emerald-950">
                              <Clock className="w-4 h-4 text-emerald-700 shrink-0" />
                              <span>
                                <strong>Bazaar Hours:</strong> Monday through Saturday: 10:00 AM – 8:00 PM (Closed on Sundays)
                              </span>
                            </div>
                          </div>
                        </div>
                      );

                    case 'contact_cta':
                      return (
                        <div
                          key={block.id}
                          className="rounded-2xl p-6 text-white space-y-3 shadow-md"
                          style={{ backgroundColor: primaryColor }}
                        >
                          <h4 className="font-serif text-lg font-bold">
                            {block.custom_title || `Order Wholesale Fabric from ${vendor.shop_name}`}
                          </h4>
                          <p className="text-xs text-white/90 leading-relaxed max-w-xl">
                            Looking for full-roll bookings, custom seasonal dyeing, or swatch book dispatches? Reach out directly to the stall master on WhatsApp or via direct phone call.
                          </p>
                          <div className="flex items-center gap-3 pt-2 flex-wrap">
                            {cust.whatsapp_button?.enabled !== false && (
                              <button
                                onClick={() => handleWhatsAppInquiry()}
                                className="bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold px-4 py-2.5 rounded-xl inline-flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
                              >
                                <MessageCircle className="w-4 h-4" />
                                <span>{cust.whatsapp_button?.custom_label || 'WhatsApp Stall'}</span>
                              </button>
                            )}

                            {cust.phone_button?.enabled && (
                              <button
                                onClick={handleDirectCall}
                                className="bg-white text-gray-900 hover:bg-gray-100 text-xs font-bold px-4 py-2.5 rounded-xl inline-flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
                              >
                                <Phone className="w-4 h-4 text-blue-600" />
                                <span>{cust.phone_button?.custom_label || 'Call Stall Directly'}</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );

                    case 'fabric_guarantee':
                      return (
                        <div
                          key={block.id}
                          className="bg-white rounded-2xl border border-gray-200 p-6 shadow-2xs space-y-4"
                        >
                          <div className="flex items-center justify-between">
                            <h3 className="font-serif text-lg font-bold text-gray-900 flex items-center gap-2">
                              <ShieldCheck className="w-5 h-5 text-emerald-600" />
                              {block.custom_title || 'Certified Fabric Guarantee & Mill Testing'}
                            </h3>
                            <span className="bg-emerald-50 text-emerald-700 text-[11px] font-bold px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> 100% Guaranteed Quality
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                            <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 space-y-1.5">
                              <div className="flex items-center gap-2 font-bold text-gray-900">
                                <Award className="w-4 h-4 text-amber-600" />
                                <span>Color Fastness Grade 4+</span>
                              </div>
                              <p className="text-gray-600 text-[11px] leading-relaxed">
                                Tested against sunlight fading, dry rubbing, and industrial wash cycles. Zero bleeding on wet press.
                              </p>
                            </div>

                            <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 space-y-1.5">
                              <div className="flex items-center gap-2 font-bold text-gray-900">
                                <Layers className="w-4 h-4 text-blue-600" />
                                <span>High Warp/Weft Density</span>
                              </div>
                              <p className="text-gray-600 text-[11px] leading-relaxed">
                                Calibrated thread count and yarn twist ratio suited for heavy embroidery, zari work, and designer stitching.
                              </p>
                            </div>

                            <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 space-y-1.5">
                              <div className="flex items-center gap-2 font-bold text-gray-900">
                                <Truck className="w-4 h-4 text-emerald-600" />
                                <span>Transit Protection Guarantee</span>
                              </div>
                              <p className="text-gray-600 text-[11px] leading-relaxed">
                                Double-polythene wrapped water-resistant bales for secure cargo delivery to Karachi, Peshawar, or Quetta.
                              </p>
                            </div>
                          </div>
                        </div>
                      );

                    case 'bank_payment_details':
                      return (
                        <div
                          key={block.id}
                          className="bg-white rounded-2xl border border-gray-200 p-6 shadow-2xs space-y-5"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
                            <div>
                              <h3 className="font-serif text-lg font-bold text-gray-900 flex items-center gap-2">
                                <Building className="w-5 h-5 text-emerald-700" />
                                {block.custom_title || 'Direct Bank & Wallet Details'}
                              </h3>
                              <p className="text-xs text-gray-500 mt-0.5">
                                Settlement details shared by {vendor.shop_name} for buyers who arrange payment directly with the stall — contact them via WhatsApp or call first to confirm an order.
                              </p>
                            </div>
                          </div>

                          {/* Gateway Badges */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                            <div className="p-2.5 rounded-xl bg-red-50 border border-red-200/80 flex items-center gap-2">
                              <span className="w-3 h-3 rounded-full bg-[#D81921]"></span>
                              <div>
                                <strong className="text-gray-900 block text-[11px]">JazzCash</strong>
                                <span className="text-[10px] text-gray-500">Wallet / USSD 100K+ Agents</span>
                              </div>
                            </div>

                            <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200/80 flex items-center gap-2">
                              <span className="w-3 h-3 rounded-full bg-[#0052CC]"></span>
                              <div>
                                <strong className="text-gray-900 block text-[11px]">PayFast 1Link</strong>
                                <span className="text-[10px] text-gray-500">SBP Interbank Direct Debit</span>
                              </div>
                            </div>

                            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center gap-2">
                              <span className="w-3 h-3 rounded-full bg-[#E65100]"></span>
                              <div>
                                <strong className="text-gray-900 block text-[11px]">Keenu NetConnect</strong>
                                <span className="text-[10px] text-gray-500">Retail Card Settlement</span>
                              </div>
                            </div>

                            <div className="p-2.5 rounded-xl bg-purple-50 border border-purple-200/80 flex items-center gap-2">
                              <span className="w-3 h-3 rounded-full bg-[#635BFF]"></span>
                              <div>
                                <strong className="text-gray-900 block text-[11px]">Stripe Card</strong>
                                <span className="text-[10px] text-gray-500">Visa / Mastercard / Amex</span>
                              </div>
                            </div>
                          </div>

                          {/* Bank details grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-gray-50 p-4 rounded-xl border border-gray-200">
                            <div>
                              <span className="text-[10px] uppercase font-bold text-gray-400 block">Bank Account</span>
                              <strong className="text-gray-900 text-xs block mt-0.5">
                                {cust.bank_details?.bank_name || 'Meezan Bank Ltd (Circular Road Branch)'}
                              </strong>
                              <span className="text-gray-600 block mt-0.5">
                                Title: <strong>{cust.bank_details?.account_title || vendor.shop_name}</strong>
                              </span>
                              <span className="font-mono text-gray-800 block mt-0.5 font-bold">
                                A/C: {cust.bank_details?.account_number || '0289-0104928192'}
                              </span>
                            </div>

                            <div>
                              <span className="text-[10px] uppercase font-bold text-gray-400 block">Digital Mobile Accounts</span>
                              <div className="space-y-1 mt-1 text-gray-700">
                                <div>
                                  <span className="text-red-700 font-bold">JazzCash:</span>{' '}
                                  <span className="font-mono font-bold">{cust.bank_details?.jazzcash_number || vendor.whatsapp}</span>
                                </div>
                                <div>
                                  <span className="text-emerald-700 font-bold">IBAN (1Link):</span>{' '}
                                  <span className="font-mono text-[11px] font-semibold">{cust.bank_details?.iban || 'PK64MEZN0002890104928192'}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                        </div>
                      );

                    case 'faq_accordion':
                      const faqList = cust.faqs && cust.faqs.length > 0 ? cust.faqs : [
                        {
                          question: 'What is the Minimum Order Quantity (MOQ) for wholesale buyers?',
                          answer: 'For running stock in Azam Market, our minimum is usually 1 full thaan (approx. 25 to 40 metres) or 1 roll. For custom mill dyeing or customized jacquard weaves, MOQ begins at 500 metres.'
                        },
                        {
                          question: 'How do you handle cargo dispatches outside Lahore?',
                          answer: 'We dispatch daily through Bilal Cargo, Al-Madina Cargo, Asia Cargo, and Daewoo Express to all major hubs (Karachi, Faisalabad, Peshawar, Rawalpindi, Quetta). The cargo receipt and tracking bility are immediately sent to your WhatsApp.'
                        },
                        {
                          question: 'Can you send physical sample swatches before placing a bulk order?',
                          answer: 'Yes! We ship swatches and lookbooks across Pakistan via TCS or Leopards Courier. You can request swatches directly through our WhatsApp desk.'
                        },
                        {
                          question: 'What payment methods do you accept?',
                          answer: 'We accept instant digital transfers via JazzCash, PayFast 1Link Direct Debit, Keenu NetConnect, Meezan/HBL bank transfer, and international Stripe card processing.'
                        }
                      ];

                      return (
                        <div
                          key={block.id}
                          className="bg-white rounded-2xl border border-gray-200 p-6 shadow-2xs space-y-4"
                        >
                          <h3 className="font-serif text-lg font-bold text-gray-900 flex items-center gap-2">
                            <HelpCircle className="w-5 h-5 text-amber-600" />
                            {block.custom_title || 'Frequently Asked Questions (Trade FAQs)'}
                          </h3>

                          <div className="space-y-2">
                            {faqList.map((faq, idx) => {
                              const isOpen = expandedFaq === idx;
                              return (
                                <div
                                  key={idx}
                                  className="border border-gray-200 rounded-xl overflow-hidden transition-all"
                                >
                                  <button
                                    onClick={() => setExpandedFaq(isOpen ? null : idx)}
                                    className="w-full text-left p-3.5 bg-gray-50/70 hover:bg-gray-100 flex items-center justify-between gap-3 text-xs font-bold text-gray-900 cursor-pointer"
                                  >
                                    <span>{faq.question}</span>
                                    {isOpen ? (
                                      <ChevronUp className="w-4 h-4 text-gray-500 shrink-0" />
                                    ) : (
                                      <ChevronDown className="w-4 h-4 text-gray-500 shrink-0" />
                                    )}
                                  </button>
                                  {isOpen && (
                                    <div className="p-3.5 bg-white text-xs text-gray-600 leading-relaxed border-t border-gray-100">
                                      {faq.answer}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );

                    case 'market_landmark':
                      return (
                        <div
                          key={block.id}
                          className="bg-white rounded-2xl border border-gray-200 p-6 shadow-2xs space-y-4"
                        >
                          <div className="flex items-center justify-between">
                            <h3 className="font-serif text-lg font-bold text-gray-900 flex items-center gap-2">
                              <Landmark className="w-5 h-5 text-emerald-800" />
                              {block.custom_title || 'Bazaar Navigation & Landmark Wayfinding'}
                            </h3>
                            <span className="text-[11px] text-gray-500 font-semibold">
                              Stall: {vendor.stall_number}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/70 space-y-1">
                              <strong className="text-gray-900 block font-bold flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-amber-700" /> Entering via Delhi Gate / Chowk Wazir Khan
                              </strong>
                              <p className="text-gray-600 text-[11px] leading-relaxed">
                                Enter through the main arched bazaar corridor, proceed past Katra Neelkanth toward the central cloth arcade. Our stall is located on the second turning lane.
                              </p>
                            </div>

                            <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200/70 space-y-1">
                              <strong className="text-gray-900 block font-bold flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-emerald-700" /> Best Time for Wholesale Buyers
                              </strong>
                              <p className="text-gray-600 text-[11px] leading-relaxed">
                                11:30 AM to 4:00 PM for uninterrupted sample review, bale inspection, and cargo booking before evening peak bazaar rush.
                              </p>
                            </div>
                          </div>
                        </div>
                      );

                    case 'buyer_reviews':
                      return (
                        <div
                          key={block.id}
                          className="bg-white rounded-2xl border border-gray-200 p-6 shadow-2xs space-y-4"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-serif text-lg font-bold text-gray-900 flex items-center gap-2">
                                <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                                {block.custom_title || 'Verified Wholesale Buyer Testimonials'}
                              </h3>
                              <p className="text-xs text-gray-500 mt-0.5">
                                Feedback from verified garment manufacturers, boutique chains, and regional retailers.
                              </p>
                            </div>

                            <div className="text-right">
                              <div className="text-base font-extrabold text-gray-900 flex items-center gap-1">
                                <span>4.9</span>
                                <div className="flex text-amber-400">
                                  {'★'.repeat(5)}
                                </div>
                              </div>
                              <span className="text-[10px] text-gray-400">140+ Trade Orders</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 space-y-2">
                              <div className="flex items-center justify-between">
                                <strong className="text-gray-900">Al-Raza Boutique (Karachi Tariq Rd)</strong>
                                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">Verified Buyer</span>
                              </div>
                              <p className="text-gray-600 text-[11px] leading-relaxed italic">
                                "Received 400 metres of pure dyed chiffon in Karachi within 36 hours via Bilal Cargo. Color match and thaan count were 100% exact to our swatch sample."
                              </p>
                            </div>

                            <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 space-y-2">
                              <div className="flex items-center justify-between">
                                <strong className="text-gray-900">Chaudhry Garments (Faisalabad Karkhana)</strong>
                                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">Verified Buyer</span>
                              </div>
                              <p className="text-gray-600 text-[11px] leading-relaxed italic">
                                "Working with {vendor.shop_name} for 3 seasons now. Fair rates, zero yardage shrinkage, and very cooperative on wholesale bank settlements."
                              </p>
                            </div>
                          </div>
                        </div>
                      );

                    case 'bulk_pricing_tiers':
                      return (
                        <div
                          key={block.id}
                          className="bg-white rounded-2xl border border-gray-200 p-6 shadow-2xs space-y-4"
                        >
                          <div className="flex items-center justify-between">
                            <h3 className="font-serif text-lg font-bold text-gray-900 flex items-center gap-2">
                              <TrendingUp className="w-5 h-5 text-emerald-700" />
                              {block.custom_title || 'Volume Discount Schedules & Wholesale Tiers'}
                            </h3>
                            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                              Wholesale Rates
                            </span>
                          </div>

                          <div className="overflow-x-auto">
                            <table className="w-full text-xs text-left">
                              <thead>
                                <tr className="border-b border-gray-200 bg-gray-50 text-gray-600">
                                  <th className="p-3 rounded-l-xl">Order Bracket</th>
                                  <th className="p-3">Minimum Volume</th>
                                  <th className="p-3">Price Advantage</th>
                                  <th className="p-3 rounded-r-xl">Dispatch Timeline</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100">
                                <tr>
                                  <td className="p-3 font-bold text-gray-900">Sample Swatch / Thaan</td>
                                  <td className="p-3 text-gray-600">1 Thaan (25–35m)</td>
                                  <td className="p-3 text-gray-600">Standard Wholesale</td>
                                  <td className="p-3 text-emerald-700 font-semibold">Same Day Dispatch</td>
                                </tr>
                                <tr className="bg-emerald-50/30">
                                  <td className="p-3 font-bold text-gray-900">Commercial Bale Tier</td>
                                  <td className="p-3 text-gray-600">5 to 15 Thaans (250m+)</td>
                                  <td className="p-3 text-[#0F5C3A] font-bold">5% Off Total Invoice</td>
                                  <td className="p-3 text-emerald-700 font-semibold">24 Hours via Cargo</td>
                                </tr>
                                <tr>
                                  <td className="p-3 font-bold text-gray-900">Direct Mill Lot Container</td>
                                  <td className="p-3 text-gray-600">1,000m+ Full Rolls</td>
                                  <td className="p-3 text-amber-700 font-bold">10% Off + Free Packaging</td>
                                  <td className="p-3 text-emerald-700 font-semibold">Scheduled Freight</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      );

                    case 'video_showcase':
                      return (
                        <div
                          key={block.id}
                          className="bg-white rounded-2xl border border-gray-200 p-6 shadow-2xs space-y-4"
                        >
                          <div className="flex items-center justify-between">
                            <h3 className="font-serif text-lg font-bold text-gray-900 flex items-center gap-2">
                              <Video className="w-5 h-5 text-red-600" />
                              {block.custom_title || 'Stall Video Tour & Weaving Demonstration'}
                            </h3>
                            <span className="text-[11px] text-gray-400 font-medium">HD 1080p Fabric Walkthrough</span>
                          </div>

                          <div className="relative rounded-2xl overflow-hidden bg-gray-900 h-64 sm:h-80 flex items-center justify-center text-white group cursor-pointer border border-gray-800">
                            <img
                              src={vendor.cover_url || 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1200&q=80'}
                              alt="Video Preview"
                              className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>

                            <div className="absolute flex flex-col items-center gap-3">
                              <div className="w-16 h-16 rounded-full bg-white/90 text-[#0F5C3A] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                <Play className="w-7 h-7 fill-[#0F5C3A] ml-1" />
                              </div>
                              <span className="text-xs font-bold bg-black/60 px-3 py-1 rounded-full backdrop-blur-xs">
                                Watch 3-Minute Stall Stockroom & Fabric Drape Tour
                              </span>
                            </div>
                          </div>
                        </div>
                      );

                    default:
                      return null;
                  }
                })}
            </div>

            {/* Right Column: Persistent Stall & Contact Details */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-2xs space-y-4">
                <h3 className="font-serif text-base font-bold text-gray-900 border-b border-gray-100 pb-2">
                  Stall Contact & Credentials
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase font-bold">
                        Stall Address
                      </span>
                      <strong className="text-gray-900">{vendor.stall_number}</strong>
                      <p className="text-gray-500 text-[11px]">
                        {marketLine}
                      </p>
                    </div>
                  </div>

                  {/* WhatsApp contact */}
                  <div className="flex items-start gap-3">
                    <MessageCircle className="w-4 h-4 text-[#25D366] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase font-bold">
                        WhatsApp Wholesale Desk
                      </span>
                      <button
                        onClick={() => handleWhatsAppInquiry()}
                        className="text-gray-900 font-bold hover:underline cursor-pointer"
                      >
                        {vendor.whatsapp}
                      </button>
                    </div>
                  </div>

                  {/* Direct Phone */}
                  {cust.phone_button?.enabled && (
                    <div className="flex items-start gap-3">
                      <Phone className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-gray-400 block text-[10px] uppercase font-bold">
                          Direct Stall Phone
                        </span>
                        <a
                          href={`tel:${cust.phone_button.phone_number || vendor.whatsapp}`}
                          className="text-blue-700 font-bold hover:underline cursor-pointer"
                        >
                          {cust.phone_button.phone_number || vendor.whatsapp}
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Email */}
                  <div className="flex items-start gap-3">
                    <Mail className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase font-bold">
                        Official Email
                      </span>
                      <a
                        href={`mailto:${vendor.email}`}
                        className="text-gray-900 font-bold hover:underline"
                      >
                        {vendor.email}
                      </a>
                    </div>
                  </div>

                  {vendor.website && (
                    <div className="flex items-start gap-3">
                      <Globe className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-gray-400 block text-[10px] uppercase font-bold">
                          Website
                        </span>
                        <a
                          href={vendor.website}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 font-bold hover:underline"
                        >
                          {vendor.website}
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                {/* Verification Box */}
                <div className="bg-[#FDF6E7] rounded-xl p-3 border border-[#C9952A]/30 text-xs text-amber-950 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#C9952A] shrink-0" />
                  <div>
                    <strong className="block font-semibold">Aargard Verified Stall</strong>
                    <span className="text-[11px] text-amber-800">
                      Physical stall identity and contact credentials verified by platform auditors.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PRODUCTS TAB */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-xl font-bold text-gray-900">
                Wholesale Fabric Catalog ({vendor.products?.length || 0} Products)
              </h3>
              <span className="text-xs text-gray-500">
                Click any fabric roll to inspect specifications & wholesale MOQs
              </span>
            </div>

            {/* Bulk Discount Banner in Products Tab if enabled */}
            {cust.product_pricing?.enable_bulk_discount_banner && (
              <div
                className="p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 border shadow-xs"
                style={{
                  backgroundColor: '#FDF6E7',
                  color: accentColor,
                  borderColor: `${accentColor}40`,
                }}
              >
                <Sparkles className="w-4 h-4 shrink-0" />
                <span>
                  {cust.product_pricing.bulk_discount_text ||
                    'Wholesale Discount: Up to 10% off for full roll bookings (500m+)'}
                </span>
              </div>
            )}

            {vendor.products && vendor.products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {vendor.products.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => { setSelectedProduct(p); setActiveImageIdx(0); }}
                    className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div className="h-48 bg-gray-100 overflow-hidden relative">
                      <img
                        src={p.image_url}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute top-2 left-2 bg-black/70 text-white text-[10px] font-bold px-2.5 py-1 rounded-md backdrop-blur-xs">
                        {p.fabric_type}
                      </span>
                    </div>

                    <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                      <div>
                        <h4
                          className="font-bold text-sm text-gray-900 transition-colors"
                          style={{ color: undefined }}
                        >
                          {p.name}
                        </h4>
                        <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                          {p.description}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                        <div>
                          <span className="text-[10px] text-gray-400 block font-semibold uppercase">
                            Wholesale Price
                          </span>
                          <span
                            className="font-bold text-sm"
                            style={{ color: primaryColor }}
                          >
                            {cust.product_pricing?.show_public_prices !== false
                              ? p.price_range
                              : 'WhatsApp for Price'}
                          </span>
                        </div>
                        {cust.product_pricing?.show_moq_badge && (
                          <div className="text-right">
                            <span className="text-[10px] text-gray-400 block font-semibold uppercase">
                              Min Order
                            </span>
                            <span className="font-semibold text-gray-700">{p.moq}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-12 text-center border border-gray-200 text-gray-500">
                No active product listings uploaded yet for this stall.
              </div>
            )}
          </div>
        )}

        {/* CATALOGUES TAB */}
        {activeTab === 'catalogues' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-xl font-bold text-gray-900">
                  PDF Lookbooks & Swatch Books ({vendor.catalogues?.length || 0})
                </h3>
                <p className="text-xs text-gray-500">
                  Download high-resolution wholesale PDF catalogues directly to your device
                </p>
              </div>
            </div>

            {vendor.catalogues && vendor.catalogues.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {vendor.catalogues.map((cat) => (
                  <div
                    key={cat.id}
                    className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 border"
                        style={{
                          backgroundColor: '#FDF6E7',
                          color: accentColor,
                          borderColor: `${accentColor}30`,
                        }}
                      >
                        <FileText className="w-7 h-7" />
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className="text-[10px] font-bold px-2 py-0.5 rounded-md"
                            style={{
                              backgroundColor: `${primaryColor}15`,
                              color: primaryColor,
                            }}
                          >
                            {cat.season || 'Collection'}
                          </span>
                          <span className="text-xs text-gray-400">{cat.file_size_mb} MB PDF</span>
                        </div>
                        <h4 className="font-serif font-bold text-base text-gray-900">
                          {cat.title}
                        </h4>
                        <p className="text-xs text-gray-600">{cat.description}</p>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        Downloaded <strong>{cat.download_count}</strong> times
                      </span>

                      <button
                        onClick={() => onOpenCatalogue(cat.id)}
                        className="text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                        style={{ backgroundColor: primaryColor }}
                      >
                        <Download className="w-4 h-4" />
                        <span>Download PDF Catalogue</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-12 text-center border border-gray-200 text-gray-500">
                No PDF catalogues uploaded yet for this vendor.
              </div>
            )}
          </div>
        )}
      </div>

      {/* 6. LIGHTBOX PRODUCT DETAIL MODAL */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl space-y-4">
            <div className="relative h-64 bg-gray-100">
              <img
                src={(selectedProduct.image_urls && selectedProduct.image_urls[activeImageIdx]) || selectedProduct.image_url}
                alt={selectedProduct.name}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute top-3 right-3 bg-black/60 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold hover:bg-black cursor-pointer"
              >
                ✕
              </button>
            </div>

            {selectedProduct.image_urls && selectedProduct.image_urls.length > 1 && (
              <div className="px-6 flex items-center gap-2 overflow-x-auto no-scrollbar">
                {selectedProduct.image_urls.map((url, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIdx(idx)}
                    className={`w-14 h-14 rounded-lg overflow-hidden border-2 shrink-0 cursor-pointer ${
                      idx === activeImageIdx ? 'border-[#0F5C3A]' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={url} alt={`${selectedProduct.name} ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            <div className="p-6 pt-0 space-y-3">
              <span
                className="text-xs font-bold px-2.5 py-1 rounded-md"
                style={{
                  backgroundColor: `${primaryColor}15`,
                  color: primaryColor,
                }}
              >
                {selectedProduct.fabric_type}
              </span>
              <h3 className="font-serif text-xl font-bold text-gray-900">
                {selectedProduct.name}
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                {selectedProduct.description}
              </p>

              <div className="bg-gray-50 rounded-xl p-3 border border-gray-200 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-gray-400 block font-semibold uppercase text-[10px]">
                    Wholesale Price
                  </span>
                  <strong
                    className="text-sm"
                    style={{ color: primaryColor }}
                  >
                    {cust.product_pricing?.show_public_prices !== false
                      ? selectedProduct.price_range
                      : 'Inquire on WhatsApp'}
                  </strong>
                </div>
                <div>
                  <span className="text-gray-400 block font-semibold uppercase text-[10px]">
                    Minimum Order
                  </span>
                  <strong className="text-gray-800 text-sm">
                    {selectedProduct.moq}
                  </strong>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                {cust.phone_button?.enabled && (
                  <button
                    onClick={handleDirectCall}
                    className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold py-3 rounded-xl flex items-center justify-center gap-2 border border-blue-200 transition-colors cursor-pointer"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Call Stall</span>
                  </button>
                )}

                <button
                  onClick={() =>
                    handleWhatsAppInquiry(
                      `Hi ${vendor.shop_name}, I am interested in ordering bulk roll of ${selectedProduct.name} (${selectedProduct.fabric_type}). MOQ: ${selectedProduct.moq}.`
                    )
                  }
                  className="flex-2 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 text-xs transition-colors cursor-pointer shadow-xs"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Inquire on WhatsApp</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. FLOATING WHATSAPP BUTTON (IF CONFIGURED) */}
      {cust.whatsapp_button?.enabled !== false && cust.whatsapp_button?.show_floating_badge && (
        <div
          onClick={() => handleWhatsAppInquiry()}
          className="fixed bottom-20 right-4 sm:right-6 z-40 flex items-center gap-2 group cursor-pointer"
        >
          <span className="bg-gray-900 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-2xl border border-gray-700 hidden sm:inline-block animate-pulse">
            {cust.whatsapp_button.online_status_text || 'Online • Quick Reply'}
          </span>
          <div className="w-13 h-13 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white flex items-center justify-center shadow-2xl hover:scale-105 transition-transform">
            <MessageCircle className="w-7 h-7" />
          </div>
        </div>
      )}

      {/* 9. FIXED STICKY CONTACT BAR AT PAGE BOTTOM */}
      <ContactBar vendor={vendor} onLogEvent={onLogEvent} />
    </div>
  );
};
