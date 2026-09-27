import React from 'react';
import { Eye, Phone, Download, Mail, TrendingUp, Plus, Upload, Palette, MessageSquare, PhoneCall, BarChart3, CheckCircle2 } from 'lucide-react';
import { Vendor, VendorAnalytics, ShopCustomization } from '../../types';

interface VendorOverviewProps {
  vendor: Vendor;
  analytics: VendorAnalytics;
  onNavigateTab: (tab: 'overview' | 'shop' | 'customize' | 'products' | 'catalogues' | 'analytics' | 'subscription') => void;
  onSaveCustomization?: (customization: Partial<ShopCustomization>, isPublish?: boolean) => void;
}

export const VendorOverview: React.FC<VendorOverviewProps> = ({
  vendor,
  analytics,
  onNavigateTab,
  onSaveCustomization,
}) => {
  const productCount = vendor.products?.length || 0;
  const catalogueCount = vendor.catalogues?.length || 0;
  const maxProducts = vendor.tier?.max_products ?? 10;
  const maxCatalogues = vendor.tier?.max_catalogues ?? 1;

  const isUnlimitedProducts = maxProducts === -1;
  const isUnlimitedCatalogues = maxCatalogues === -1;

  const cust = vendor.customization;
  const statsEnabled = cust?.show_stats !== false && (cust?.stats_display?.enabled ?? true);

  const handleToggleStorefrontStats = async () => {
    if (!onSaveCustomization) {
      onNavigateTab('customize');
      return;
    }
    const newStatsEnabled = !statsEnabled;
    await onSaveCustomization({
      ...cust,
      show_stats: newStatsEnabled,
      stats_display: {
        enabled: newStatsEnabled,
        show_views: cust?.stats_display?.show_views ?? true,
        show_whatsapp: cust?.stats_display?.show_whatsapp ?? true,
        show_messages: cust?.stats_display?.show_messages ?? true,
        show_calls: cust?.stats_display?.show_calls ?? true,
      },
    }, true);
  };

  return (
    <div className="space-y-6">
      {/* Header Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs">
        <div>
          <span className="text-xs font-bold text-[#C9952A] uppercase tracking-wider">
            Vendor Dashboard
          </span>
          <h1 className="font-serif text-2xl font-bold text-gray-900 mt-1">
            Welcome back, {vendor.shop_name}!
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Monitor buyer inquiries, stall profile views, direct phone calls, and wholesale engagement.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => onNavigateTab('customize')}
            className="bg-amber-50 hover:bg-amber-100 text-[#C9952A] text-xs font-bold px-3.5 py-2.5 rounded-xl border border-amber-300/60 flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <Palette className="w-4 h-4 text-[#C9952A]" />
            <span>Customize Shop Studio</span>
          </button>

          <button
            onClick={() => onNavigateTab('products')}
            className="bg-[#0F5C3A] hover:bg-[#1A7A4F] text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>

          <button
            onClick={() => onNavigateTab('catalogues')}
            className="bg-[#FDF6E7] hover:bg-[#f7e6c5] text-[#C9952A] text-xs font-bold px-4 py-2.5 rounded-xl border border-[#C9952A]/40 flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Upload PDF Lookbook</span>
          </button>
        </div>
      </div>

      {/* 4 Core Engagement Metric Cards: Shop Views, Click to WhatsApp, Click to Message, Click to Call */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#0F5C3A]" />
            <h2 className="text-sm font-bold text-gray-900">
              Live Buyer Engagement & Direct Conversion Metrics
            </h2>
          </div>
          <button
            onClick={() => onNavigateTab('analytics')}
            className="text-xs font-bold text-[#0F5C3A] hover:underline"
          >
            View Detailed 30-Day Trends →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Shop Views */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-2xs space-y-3 hover:border-emerald-300 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Shop Views</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#0F5C3A] flex items-center justify-center">
                <Eye className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="font-serif text-3xl font-bold text-gray-900">
                {(vendor.profile_views || analytics.totalViews || 0).toLocaleString()}
              </span>
              <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-0.5 bg-emerald-50 px-2 py-0.5 rounded-full">
                <TrendingUp className="w-3 h-3" /> +{analytics.viewsMoM}%
              </span>
            </div>
            <p className="text-[11px] text-gray-400">Total directory visits to your stall profile</p>
          </div>

          {/* 2. Click to WhatsApp */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-2xs space-y-3 hover:border-green-300 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Click to WhatsApp</span>
              <div className="w-8 h-8 rounded-xl bg-green-50 text-[#25D366] flex items-center justify-center">
                <Phone className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="font-serif text-3xl font-bold text-gray-900">
                {(vendor.whatsapp_clicks || analytics.totalWhatsapp || 0).toLocaleString()}
              </span>
              <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-0.5 bg-emerald-50 px-2 py-0.5 rounded-full">
                <TrendingUp className="w-3 h-3" /> +{analytics.whatsappMoM}%
              </span>
            </div>
            <p className="text-[11px] text-gray-400">Direct WhatsApp chats initiated by fabric buyers</p>
          </div>

          {/* 3. Click to Message */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-2xs space-y-3 hover:border-purple-300 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Click to Message</span>
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <MessageSquare className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="font-serif text-3xl font-bold text-gray-900">
                {(vendor.message_clicks ?? vendor.email_clicks ?? analytics.totalMessages ?? analytics.totalEmails ?? 0).toLocaleString()}
              </span>
              <span className="text-[11px] font-bold text-purple-600 flex items-center gap-0.5 bg-purple-50 px-2 py-0.5 rounded-full">
                <TrendingUp className="w-3 h-3" /> +{analytics.messagesMoM || analytics.emailsMoM || 12.4}%
              </span>
            </div>
            <p className="text-[11px] text-gray-400">Direct inquiries & message submissions received</p>
          </div>

          {/* 4. Click to Call */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-2xs space-y-3 hover:border-blue-300 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Click to Call</span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <PhoneCall className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="font-serif text-3xl font-bold text-gray-900">
                {(vendor.call_clicks ?? analytics.totalCalls ?? 0).toLocaleString()}
              </span>
              <span className="text-[11px] font-bold text-blue-600 flex items-center gap-0.5 bg-blue-50 px-2 py-0.5 rounded-full">
                <TrendingUp className="w-3 h-3" /> +{analytics.callsMoM || 18.5}%
              </span>
            </div>
            <p className="text-[11px] text-gray-400">Direct stall phone calls dialed by buyers</p>
          </div>
        </div>
      </div>

      {/* Storefront Stats Visibility Toggle Banner */}
      <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-white rounded-2xl border border-emerald-200/80 p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-[#0F5C3A] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              Storefront Feature
            </span>
            <h3 className="font-serif text-base font-bold text-gray-900">
              Public Storefront Engagement Stats Display
            </h3>
          </div>
          <p className="text-xs text-gray-600 max-w-2xl">
            Choose whether to display your verified statistics (<strong>Shop Views, WhatsApp, Messages, Calls</strong>) publicly on your stall page. Displaying high activity builds instant buyer trust and converts more orders.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleToggleStorefrontStats}
            className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-2 shadow-2xs ${
              statsEnabled
                ? 'bg-[#0F5C3A] text-white hover:bg-[#1A7A4F]'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <CheckCircle2 className={`w-4 h-4 ${statsEnabled ? 'text-white' : 'text-gray-400'}`} />
            <span>{statsEnabled ? 'Stats Visible on Shop: ON' : 'Stats Hidden on Shop: OFF'}</span>
          </button>

          <button
            onClick={() => onNavigateTab('customize')}
            className="text-xs font-bold text-[#0F5C3A] hover:underline px-2 py-1"
          >
            Configure →
          </button>
        </div>
      </div>

      {/* Tier Usage Progress Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tier Limits Progress Bar */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-base text-gray-900">
              Subscription Plan Quota Usage
            </h3>
            <span className="bg-[#FDF6E7] text-[#C9952A] text-xs font-bold px-2.5 py-1 rounded-full border border-[#C9952A]/30 capitalize">
              {vendor.tier?.display_name || 'Standard'} Tier
            </span>
          </div>

          {/* Products Usage Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-gray-700">Products Uploaded</span>
              <span className="text-gray-900">
                {productCount} / {isUnlimitedProducts ? 'Unlimited' : maxProducts}
              </span>
            </div>
            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#0F5C3A] rounded-full transition-all duration-500"
                style={{
                  width: isUnlimitedProducts
                    ? '25%'
                    : `${Math.min(100, (productCount / maxProducts) * 100)}%`,
                }}
              ></div>
            </div>
          </div>

          {/* Catalogues Usage Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-gray-700">PDF Lookbooks</span>
              <span className="text-gray-900">
                {catalogueCount} / {isUnlimitedCatalogues ? 'Unlimited' : maxCatalogues}
              </span>
            </div>
            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#C9952A] rounded-full transition-all duration-500"
                style={{
                  width: isUnlimitedCatalogues
                    ? '30%'
                    : `${Math.min(100, (catalogueCount / maxCatalogues) * 100)}%`,
                }}
              ></div>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between text-xs">
            <span className="text-gray-500">Need more upload slots or verified badges?</span>
            <button
              onClick={() => onNavigateTab('subscription')}
              className="text-[#0F5C3A] font-bold hover:underline"
            >
              Upgrade Subscription →
            </button>
          </div>
        </div>

        {/* Recent Active Catalogues Preview */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-base text-gray-900">
              Active PDF Catalogues ({catalogueCount})
            </h3>
            <button
              onClick={() => onNavigateTab('catalogues')}
              className="text-xs text-[#0F5C3A] font-bold hover:underline"
            >
              Manage Catalogues →
            </button>
          </div>

          {vendor.catalogues && vendor.catalogues.length > 0 ? (
            <div className="space-y-3">
              {vendor.catalogues.map((cat) => (
                <div
                  key={cat.id}
                  className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between text-xs"
                >
                  <div>
                    <strong className="text-gray-900 block font-semibold">{cat.title}</strong>
                    <span className="text-gray-500">{cat.season} • {cat.file_size_mb} MB</span>
                  </div>
                  <span className="bg-emerald-100 text-[#0F5C3A] font-bold px-2.5 py-1 rounded-full">
                    {cat.download_count} DLs
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              No PDF catalogues uploaded yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
