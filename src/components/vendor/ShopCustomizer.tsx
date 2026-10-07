import React, { useMemo, useState, useEffect, useRef } from 'react';
import {
  Palette,
  Layout,
  Type,
  Image as ImageIcon,
  Phone,
  MessageCircle,
  DollarSign,
  Layers,
  Globe,
  Eye,
  Check,
  Save,
  Send,
  RotateCcw,
  Smartphone,
  Tablet,
  Monitor,
  ArrowUp,
  ArrowDown,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Award,
  MapPin,
  Mail,
  Download,
  FileText,
  Clock,
  Truck,
  CreditCard,
  MessageSquare,
  PhoneCall,
  TrendingUp,
  Building,
  HelpCircle,
  Landmark,
  Star,
  Video,
  Plus,
  Trash2,
  Wallet,
  CheckCircle2,
  Play,
  Loader2,
} from 'lucide-react';
import { Vendor, ShopCustomization, DEFAULT_SHOP_CUSTOMIZATION, Product, Catalogue, PaymentTransaction } from '../../types';
import { ImageUploader } from '../common/ImageUploader';
import { PaymentCheckoutModal } from '../common/PaymentCheckoutModal';
import { ErrorBanner, SaveStatus, useUnsavedChangesGuard, RegisterSaver } from './SaveFeedback';
import { describeError } from '../../lib/errors';

interface ShopCustomizerProps {
  vendor: Vendor;
  onSaveCustomization: (customization: ShopCustomization, publish: boolean) => Promise<void>;
  onOpenLiveShop: (vendor: Vendor) => void;
  registerSaver?: RegisterSaver;
}

const PRESET_THEMES = [
  {
    name: 'Emerald & Gold (Azam Classic)',
    theme_color: '#0F5C3A',
    accent_color: '#C9952A',
    background_tone: 'white' as const,
    font_style: 'classic_serif' as const,
  },
  {
    name: 'Royal Indigo & Sky (Ajrak Rail)',
    theme_color: '#1E3A8A',
    accent_color: '#0284C7',
    background_tone: 'soft_gray' as const,
    font_style: 'modern_clean' as const,
  },
  {
    name: 'Crimson Ruby & Amber (Bridal Velvet)',
    theme_color: '#991B1B',
    accent_color: '#D97706',
    background_tone: 'warm_ivory' as const,
    font_style: 'heritage_bazaar' as const,
  },
  {
    name: 'Bazaar Midnight & Jade (Night Silk)',
    theme_color: '#064E3B',
    accent_color: '#10B981',
    background_tone: 'night_emerald' as const,
    font_style: 'classic_serif' as const,
  },
  {
    name: 'Plum Velvet & Rose (Organza Shimmer)',
    theme_color: '#581C87',
    accent_color: '#F43F5E',
    background_tone: 'warm_ivory' as const,
    font_style: 'classic_serif' as const,
  },
  {
    name: 'Slate Charcoal & Gold (Mill Executive)',
    theme_color: '#1E293B',
    accent_color: '#D97706',
    background_tone: 'white' as const,
    font_style: 'modern_clean' as const,
  },
  {
    name: 'Mughal Ochre & Terracotta (Shahi Qila)',
    theme_color: '#9A3412',
    accent_color: '#D97706',
    background_tone: 'warm_ivory' as const,
    font_style: 'heritage_bazaar' as const,
  },
  {
    name: 'Faisalabad Loom Steel (Denim & Cotton)',
    theme_color: '#0F172A',
    accent_color: '#38BDF8',
    background_tone: 'soft_gray' as const,
    font_style: 'modern_clean' as const,
  },
  {
    name: 'Rose Chiffon & Champagne (Pastel Bridal)',
    theme_color: '#BE185D',
    accent_color: '#FBBF24',
    background_tone: 'warm_ivory' as const,
    font_style: 'classic_serif' as const,
  },
  {
    name: 'Saffron & Festive Marigold (Mehendi Lawn)',
    theme_color: '#C2410C',
    accent_color: '#EAB308',
    background_tone: 'warm_ivory' as const,
    font_style: 'heritage_bazaar' as const,
  },
  {
    name: 'Imperial Sapphire & Cyan (Royal Voile)',
    theme_color: '#1D4ED8',
    accent_color: '#06B6D4',
    background_tone: 'white' as const,
    font_style: 'modern_clean' as const,
  },
  {
    name: 'Raw Karandi & Sand (Natural Handloom)',
    theme_color: '#78350F',
    accent_color: '#B45309',
    background_tone: 'warm_ivory' as const,
    font_style: 'heritage_bazaar' as const,
  },
  {
    name: 'Multani Turquoise & Cobalt (Glaze Tile)',
    theme_color: '#0E7490',
    accent_color: '#2563EB',
    background_tone: 'white' as const,
    font_style: 'modern_clean' as const,
  },
  {
    name: 'Kashmiri Pashmina Sage (Soft Wool)',
    theme_color: '#3F6212',
    accent_color: '#84CC16',
    background_tone: 'soft_gray' as const,
    font_style: 'classic_serif' as const,
  },
  {
    name: 'Karakul Bronze & Russet (Khyber Heritage)',
    theme_color: '#713F12',
    accent_color: '#CA8A04',
    background_tone: 'warm_ivory' as const,
    font_style: 'heritage_bazaar' as const,
  },
  {
    name: 'Obsidian & Pure Silver (Minimalist Chic)',
    theme_color: '#111827',
    accent_color: '#9CA3AF',
    background_tone: 'white' as const,
    font_style: 'modern_clean' as const,
  },
];

const COVER_PRESETS = [
  {
    name: 'Pure Silk Rolls',
    url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Vibrant Lawn Weaves',
    url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Embroidery & Zari Looms',
    url: 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Chiffon & Organza Shimmer',
    url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Modern Wholesale Showroom',
    url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80',
  },
];

export const ALL_AVAILABLE_BLOCKS = [
  { id: 'about', label: 'About Stall & Trade Terms', defaultTitle: 'About Stall & Fabric Specialties' },
  { id: 'fabric_guarantee', label: 'Fabric Guarantee & Testing', defaultTitle: 'Certified Fabric Guarantee & Mill Testing' },
  { id: 'featured_products', label: 'Featured Fabric Samples', defaultTitle: 'Featured Fabric Samples' },
  { id: 'bulk_pricing_tiers', label: 'Volume Discount Schedules', defaultTitle: 'Volume Discount Schedules & Wholesale Tiers' },
  { id: 'catalogues', label: 'PDF Lookbooks & Swatch Books', defaultTitle: 'PDF Lookbooks & Swatch Books' },
  { id: 'pricing_policy', label: 'Wholesale Trade & Cargo Policy', defaultTitle: 'Wholesale Trade & Pricing Policy' },
  { id: 'stall_location', label: 'Market Stall Map & Visiting Hours', defaultTitle: 'Market Stall Physical Location' },
  { id: 'market_landmark', label: 'Bazaar Gate & Hall Walking Landmark', defaultTitle: 'Bazaar Navigation & Landmark Wayfinding' },
  { id: 'buyer_reviews', label: 'Verified B2B Buyer Reviews', defaultTitle: 'Verified Wholesale Buyer Testimonials' },
  { id: 'faq_accordion', label: 'Buyer Frequently Asked Questions', defaultTitle: 'Frequently Asked Questions (Trade FAQs)' },
  { id: 'bank_payment_details', label: 'Bank & Mobile Wallet Payment Rails', defaultTitle: 'Wholesale Settlement & Payment Gateways' },
  { id: 'video_showcase', label: 'Stall Video Tour & Weaving Demonstration', defaultTitle: 'Stall Video Tour & Weaving Demonstration' },
  { id: 'contact_cta', label: 'Direct Stall Owner Contact CTA', defaultTitle: 'Direct Wholesale Inquiry' },
];

const initialConfigFor = (v: Vendor): ShopCustomization =>
  v.customization ? { ...DEFAULT_SHOP_CUSTOMIZATION, ...v.customization } : { ...DEFAULT_SHOP_CUSTOMIZATION };

// Fields the server stamps on save are ignored when deciding if there are unsaved edits.
const snapshotOf = (cfg: ShopCustomization): string => {
  const { is_published: _p, published_at: _pa, last_saved_at: _ls, ...rest } = cfg as any;
  return JSON.stringify(rest);
};

export const ShopCustomizer: React.FC<ShopCustomizerProps> = ({
  vendor,
  onSaveCustomization,
  onOpenLiveShop,
  registerSaver,
}) => {
  // Initialize config with existing customization or default fallback
  const [config, setConfig] = useState<ShopCustomization>(() => initialConfigFor(vendor));
  const [savedConfig, setSavedConfig] = useState<ShopCustomization>(() => initialConfigFor(vendor));
  const savedSnapshot = useMemo(() => snapshotOf(savedConfig), [savedConfig]);
  const [saveError, setSaveError] = useState('');
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  const [activeTab, setActiveTab] = useState<
    'theme' | 'header' | 'hero' | 'contact' | 'pricing' | 'blocks' | 'publishing'
  >('theme');
  const [devicePreview, setDevicePreview] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Payment checkout modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentPurpose, setPaymentPurpose] = useState<'tier_subscription' | 'inquiry_lead_credit' | 'catalogue_sponsor' | 'sample_booking_deposit'>('tier_subscription');
  const [paymentAmount, setPaymentAmount] = useState(15000);
  const [lastTx, setLastTx] = useState<PaymentTransaction | null>(null);

  // Expanded editor states for blocks
  const [expandedBlockSettings, setExpandedBlockSettings] = useState<string | null>(null);
  const [newFaqQuestion, setNewFaqQuestion] = useState('');
  const [newFaqAnswer, setNewFaqAnswer] = useState('');

  // Live preview interactive state
  const [previewShopTab, setPreviewShopTab] = useState<'overview' | 'products' | 'catalogues'>('overview');
  const [previewSelectedProduct, setPreviewSelectedProduct] = useState<Product | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const dirty = useMemo(() => snapshotOf(config) !== savedSnapshot, [config, savedSnapshot]);
  useUnsavedChangesGuard(dirty);

  const handleApplyPreset = (preset: (typeof PRESET_THEMES)[0]) => {
    setConfig((prev) => ({
      ...prev,
      theme_color: preset.theme_color,
      accent_color: preset.accent_color,
      background_tone: preset.background_tone,
      font_style: preset.font_style,
    }));
    showToast(`Applied preset: ${preset.name}`);
  };

  /**
   * Persist the current edits WITHOUT changing whether the shop is live.
   * (Previously "Save Draft" always flipped is_published to false, which
   * silently took an already-live customized shop offline for buyers.)
   */
  const handleSave = async (): Promise<string | null> => {
    if (isSaving) return null;
    setIsSaving(true);
    setSaveError('');
    try {
      const now = new Date().toISOString();
      const live = !!config.is_published;
      const updated = { ...config, last_saved_at: now, ...(live ? { published_at: now } : {}) };
      await onSaveCustomization(updated, live);
      setConfig(updated);
      setSavedConfig(updated);
      setSavedAt(new Date());
      showToast(live ? 'Saved — your changes are live on the shop.' : 'Draft saved. Click "Publish" when ready to make it live.');
      return null;
    } catch (err) {
      console.error(err);
      const msg = describeError(err, 'Your changes could not be saved.');
      setSaveError(msg);
      return msg;
    } finally {
      setIsSaving(false);
    }
  };

  // Let the dashboard's "Save all changes" button save this editor too.
  const handleSaveRef = useRef(handleSave);
  handleSaveRef.current = handleSave;
  useEffect(() => {
    registerSaver?.('customizer', {
      label: 'Shop customizer',
      dirty,
      save: async () => {
        const msg = await handleSaveRef.current();
        if (msg) throw new Error(msg);
      },
    });
  }, [dirty]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => registerSaver?.('customizer', null), []); // eslint-disable-line react-hooks/exhaustive-deps

  /** Explicitly take the customized shop offline and keep edits as a draft. */
  const handleSaveDraft = async () => {
    if (
      config.is_published &&
      !window.confirm(
        'This takes your customized shop offline: buyers will see the plain default layout until you publish again. Continue?'
      )
    ) {
      return;
    }
    setIsSaving(true);
    setSaveError('');
    try {
      const now = new Date().toISOString();
      const updated = { ...config, is_published: false, last_saved_at: now };
      await onSaveCustomization(updated, false);
      setConfig(updated);
      setSavedConfig(updated);
      setSavedAt(new Date());
      showToast('Saved as draft. Your shop is not live until you publish.');
    } catch (err) {
      console.error(err);
      setSaveError(describeError(err, 'Your draft could not be saved.'));
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    setIsSaving(true);
    setSaveError('');
    try {
      const now = new Date().toISOString();
      const updated = {
        ...config,
        is_published: true,
        published_at: now,
        last_saved_at: now,
      };
      await onSaveCustomization(updated, true);
      setConfig(updated);
      setSavedConfig(updated);
      setSavedAt(new Date());
      showToast('🎉 Shop changes published live to Azam Market Online directory!');
    } catch (err) {
      console.error(err);
      setSaveError(describeError(err, 'Your shop could not be published.'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetDefaults = () => {
    if (window.confirm('Reset shop styling and block layouts back to default settings?')) {
      setConfig({ ...DEFAULT_SHOP_CUSTOMIZATION });
      showToast('Reset to default configuration');
    }
  };

  const handleMoveBlock = (index: number, direction: 'up' | 'down') => {
    const newBlocks = [...config.blocks];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newBlocks.length) return;

    const temp = newBlocks[index];
    newBlocks[index] = newBlocks[targetIdx];
    newBlocks[targetIdx] = temp;

    // re-assign sort_order
    const updated = newBlocks.map((b, i) => ({ ...b, sort_order: i + 1 }));
    setConfig((prev) => ({ ...prev, blocks: updated }));
  };

  const handleToggleBlock = (id: string) => {
    setConfig((prev) => ({
      ...prev,
      blocks: prev.blocks.map((b) => (b.id === id ? { ...b, enabled: !b.enabled } : b)),
    }));
  };

  // Render a preview of vendor with current draft config
  const previewVendor: Vendor = {
    ...vendor,
    customization: config,
  };

  const bgClass =
    config.background_tone === 'warm_ivory'
      ? 'bg-[#FAF7F2] text-gray-900'
      : config.background_tone === 'soft_gray'
      ? 'bg-[#F1F5F9] text-gray-900'
      : config.background_tone === 'night_emerald'
      ? 'bg-[#0B1E16] text-emerald-50'
      : 'bg-gray-50 text-gray-900';

  const fontClass =
    config.font_style === 'classic_serif'
      ? 'font-serif'
      : config.font_style === 'heritage_bazaar'
      ? 'font-serif tracking-wide'
      : 'font-sans';

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-2xl border border-gray-700 flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-[#C9952A]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Bar */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="font-serif text-xl sm:text-2xl font-bold text-gray-900">
              Shop Customizer & Live Studio
            </h1>
            {config.is_published ? (
              <span className="bg-emerald-50 text-[#0F5C3A] text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-200 inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#0F5C3A] animate-pulse"></span>
                Published & Live
              </span>
            ) : (
              <span className="bg-amber-50 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-full border border-amber-200 inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                Unpublished Draft Changes
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500">
            Customize {vendor.shop_name}’s branding, theme colors, modular blocks, WhatsApp & call buttons, and wholesale pricing display in real-time.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleResetDefaults}
            title="Reset theme and block orders to defaults"
            className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer text-xs flex items-center gap-1"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">Reset</span>
          </button>

          <button
            onClick={() => onOpenLiveShop(previewVendor)}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold px-3.5 py-2.5 rounded-xl inline-flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Eye className="w-4 h-4 text-gray-600" />
            <span>Live View Shop</span>
          </button>

          <SaveStatus dirty={dirty} saving={isSaving} savedAt={savedAt} hasError={!!saveError} />

          <button
            onClick={handleSave}
            disabled={isSaving || !dirty}
            className="bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-800 text-xs font-bold px-3.5 py-2.5 rounded-xl border border-gray-300 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin text-gray-500" /> : <Save className="w-4 h-4 text-gray-500" />}
            <span>{config.is_published ? 'Save changes' : 'Save draft'}</span>
          </button>

          {!config.is_published && (
            <button
              onClick={handlePublish}
              disabled={isSaving}
              className="bg-[#0F5C3A] hover:bg-[#1A7A4F] disabled:opacity-60 text-white text-xs font-bold px-4 py-2.5 rounded-xl inline-flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Publish Changes</span>
            </button>
          )}
        </div>
      </div>

      {saveError && (
        <ErrorBanner
          message={saveError}
          onDismiss={() => setSaveError('')}
          onRetry={dirty ? () => void handleSave() : undefined}
        />
      )}

      {/* Main Studio Grid: Left Settings / Right Interactive Live Preview */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Customizer Controls (5 cols on xl) */}
        <div className="xl:col-span-5 space-y-4">
          {/* Studio Navigation Tabs */}
          <div className="bg-white rounded-2xl border border-gray-200 p-2 shadow-2xs">
            <div className="grid grid-cols-4 sm:grid-cols-4 lg:grid-cols-8 gap-1 text-[11px] font-bold text-gray-600">
              <button
                onClick={() => setActiveTab('theme')}
                className={`py-2 px-1 rounded-xl flex flex-col items-center gap-1 transition-all cursor-pointer ${
                  activeTab === 'theme' ? 'bg-[#0F5C3A] text-white shadow-xs' : 'hover:bg-gray-100'
                }`}
              >
                <Palette className="w-3.5 h-3.5" />
                <span>Theme</span>
              </button>

              <button
                onClick={() => setActiveTab('header')}
                className={`py-2 px-1 rounded-xl flex flex-col items-center gap-1 transition-all cursor-pointer ${
                  activeTab === 'header' ? 'bg-[#0F5C3A] text-white shadow-xs' : 'hover:bg-gray-100'
                }`}
              >
                <Layout className="w-3.5 h-3.5" />
                <span>Header</span>
              </button>

              <button
                onClick={() => setActiveTab('hero')}
                className={`py-2 px-1 rounded-xl flex flex-col items-center gap-1 transition-all cursor-pointer ${
                  activeTab === 'hero' ? 'bg-[#0F5C3A] text-white shadow-xs' : 'hover:bg-gray-100'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Hero</span>
              </button>

              <button
                onClick={() => setActiveTab('contact')}
                className={`py-2 px-1 rounded-xl flex flex-col items-center gap-1 transition-all cursor-pointer ${
                  activeTab === 'contact' ? 'bg-[#0F5C3A] text-white shadow-xs' : 'hover:bg-gray-100'
                }`}
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Buttons</span>
              </button>

              <button
                onClick={() => setActiveTab('pricing')}
                className={`py-2 px-1 rounded-xl flex flex-col items-center gap-1 transition-all cursor-pointer ${
                  activeTab === 'pricing' ? 'bg-[#0F5C3A] text-white shadow-xs' : 'hover:bg-gray-100'
                }`}
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>Pricing</span>
              </button>

              <button
                onClick={() => setActiveTab('blocks')}
                className={`py-2 px-1 rounded-xl flex flex-col items-center gap-1 transition-all cursor-pointer ${
                  activeTab === 'blocks' ? 'bg-[#0F5C3A] text-white shadow-xs' : 'hover:bg-gray-100'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Blocks</span>
              </button>

              <button
                onClick={() => setActiveTab('publishing')}
                className={`py-2 px-1 rounded-xl flex flex-col items-center gap-1 transition-all cursor-pointer ${
                  activeTab === 'publishing' ? 'bg-[#0F5C3A] text-white shadow-xs' : 'hover:bg-gray-100'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Publish</span>
              </button>
            </div>
          </div>

          {/* ACTIVE TAB PANEL CONTENT */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-5">
            {/* 1. THEME & COLORS */}
            {activeTab === 'theme' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <Palette className="w-4 h-4 text-[#0F5C3A]" />
                    Theme Colors & Visual Identity
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Select curated Pakistani textile bazaar palettes or fine-tune brand HEX colors.
                  </p>
                </div>

                {/* Preset Palettes */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-700 block">
                    Curated Presets
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {PRESET_THEMES.map((preset, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleApplyPreset(preset)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                          config.theme_color === preset.theme_color &&
                          config.accent_color === preset.accent_color
                            ? 'border-[#0F5C3A] bg-emerald-50/50 ring-1 ring-[#0F5C3A]'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center -space-x-1.5 shrink-0">
                          <span
                            className="w-5 h-5 rounded-full border-2 border-white shadow-xs"
                            style={{ backgroundColor: preset.theme_color }}
                          ></span>
                          <span
                            className="w-5 h-5 rounded-full border-2 border-white shadow-xs"
                            style={{ backgroundColor: preset.accent_color }}
                          ></span>
                        </div>
                        <span className="text-[11px] font-bold text-gray-800 truncate">
                          {preset.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Color Pickers */}
                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 block">
                      Primary Theme Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={config.theme_color}
                        onChange={(e) => setConfig((prev) => ({ ...prev, theme_color: e.target.value }))}
                        className="w-9 h-9 rounded-lg border border-gray-200 cursor-pointer p-0.5"
                      />
                      <input
                        type="text"
                        value={config.theme_color}
                        onChange={(e) => setConfig((prev) => ({ ...prev, theme_color: e.target.value }))}
                        className="w-full text-xs font-mono font-bold px-2 py-1.5 rounded-lg border border-gray-200 uppercase"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 block">
                      Accent / Gold Highlight
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={config.accent_color}
                        onChange={(e) => setConfig((prev) => ({ ...prev, accent_color: e.target.value }))}
                        className="w-9 h-9 rounded-lg border border-gray-200 cursor-pointer p-0.5"
                      />
                      <input
                        type="text"
                        value={config.accent_color}
                        onChange={(e) => setConfig((prev) => ({ ...prev, accent_color: e.target.value }))}
                        className="w-full text-xs font-mono font-bold px-2 py-1.5 rounded-lg border border-gray-200 uppercase"
                      />
                    </div>
                  </div>
                </div>

                {/* Background Tone */}
                <div className="space-y-2 pt-2 border-t border-gray-100">
                  <label className="text-xs font-bold text-gray-700 block">
                    Canvas Background Tone
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    {[
                      { id: 'white', label: 'Crisp White', colorClass: 'bg-white text-gray-800' },
                      { id: 'warm_ivory', label: 'Warm Ivory', colorClass: 'bg-[#FAF7F2] text-amber-950' },
                      { id: 'soft_gray', label: 'Soft Pearl', colorClass: 'bg-[#F1F5F9] text-slate-800' },
                      { id: 'night_emerald', label: 'Midnight Green', colorClass: 'bg-[#0B1E16] text-emerald-100' },
                    ].map((tone) => (
                      <button
                        key={tone.id}
                        onClick={() =>
                          setConfig((prev) => ({ ...prev, background_tone: tone.id as any }))
                        }
                        className={`p-2 rounded-xl border text-center font-semibold cursor-pointer ${
                          config.background_tone === tone.id
                            ? 'border-[#0F5C3A] ring-2 ring-[#0F5C3A]/20 shadow-xs'
                            : 'border-gray-200 hover:border-gray-300'
                        } ${tone.colorClass}`}
                      >
                        {tone.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Font Typography Style */}
                <div className="space-y-2 pt-2 border-t border-gray-100">
                  <label className="text-xs font-bold text-gray-700 block">
                    Typography Style
                  </label>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    {[
                      { id: 'classic_serif', label: 'Classic Serif', sample: 'Luxury Textile' },
                      { id: 'modern_clean', label: 'Modern Sans', sample: 'Clean Minimal' },
                      { id: 'heritage_bazaar', label: 'Heritage Bazaar', sample: 'Azam Tradition' },
                    ].map((f) => (
                      <button
                        key={f.id}
                        onClick={() => setConfig((prev) => ({ ...prev, font_style: f.id as any }))}
                        className={`p-2.5 rounded-xl border text-left cursor-pointer ${
                          config.font_style === f.id
                            ? 'border-[#0F5C3A] bg-emerald-50/40 ring-1 ring-[#0F5C3A]'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="font-bold text-gray-900">{f.label}</div>
                        <div className="text-[10px] text-gray-500 mt-0.5 italic">{f.sample}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 2. HEADER & ANNOUNCEMENT */}
            {activeTab === 'header' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <Layout className="w-4 h-4 text-[#0F5C3A]" />
                    Header Layout & Announcement
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Control how your shop header, brand badge, and top announcement banner appear.
                  </p>
                </div>

                {/* Header Layout */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-700 block">
                    Header Layout Style
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {[
                      { id: 'standard', label: 'Standard Stall Bar', desc: 'Logo left, contact right' },
                      { id: 'centered', label: 'Centered Luxury', desc: 'Centered logo & title' },
                      { id: 'compact', label: 'Compact Sleek', desc: 'Minimal slim top bar' },
                      { id: 'split_contact', label: 'Split Direct Contact', desc: 'Dual phone & WhatsApp' },
                    ].map((layout) => (
                      <button
                        key={layout.id}
                        onClick={() => setConfig((prev) => ({ ...prev, header_layout: layout.id as any }))}
                        className={`p-2.5 rounded-xl border text-left cursor-pointer ${
                          config.header_layout === layout.id
                            ? 'border-[#0F5C3A] bg-emerald-50/50 ring-1 ring-[#0F5C3A]'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="font-bold text-gray-900">{layout.label}</div>
                        <div className="text-[10px] text-gray-500 mt-0.5">{layout.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Announcement Bar */}
                <div className="space-y-3 pt-2 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-xs font-bold text-gray-900 block">
                        Top Announcement Ribbon
                      </label>
                      <span className="text-[11px] text-gray-500">
                        Displays an attractive announcement ticker at the top of your shop.
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={config.show_announcement}
                      onChange={(e) =>
                        setConfig((prev) => ({ ...prev, show_announcement: e.target.checked }))
                      }
                      className="w-4 h-4 text-[#0F5C3A] rounded-sm cursor-pointer"
                    />
                  </div>

                  {config.show_announcement && (
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-gray-600 block">
                        Announcement Text
                      </label>
                      <input
                        type="text"
                        value={config.announcement_text}
                        onChange={(e) =>
                          setConfig((prev) => ({ ...prev, announcement_text: e.target.value }))
                        }
                        placeholder="e.g. Direct Mill Importers • Wholesale shipments nationwide via cargo"
                        className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#0F5C3A]"
                      />
                    </div>
                  )}
                </div>

                {/* Logo Image Upload */}
                <div className="pt-2 border-t border-gray-100">
                  <ImageUploader
                    value={vendor.logo_url}
                    onChange={(url) => {
                      vendor.logo_url = url;
                      setConfig((prev) => ({ ...prev }));
                    }}
                    aspect="logo"
                    label="Stall Logo / Profile Icon"
                    description="Upload your stall logo or brand monogram (PNG, JPG, SVG)."
                    placeholderText="Upload stall icon or paste image URL..."
                  />
                </div>

                {/* Logo Shape */}
                <div className="space-y-2 pt-2 border-t border-gray-100">
                  <label className="text-xs font-bold text-gray-700 block">
                    Logo Display Shape
                  </label>
                  <div className="grid grid-cols-4 gap-2 text-xs">
                    {[
                      { id: 'rounded', label: 'Rounded 16px' },
                      { id: 'square', label: 'Square' },
                      { id: 'circle', label: 'Circle' },
                      { id: 'pill', label: 'Pill' },
                    ].map((shape) => (
                      <button
                        key={shape.id}
                        onClick={() => setConfig((prev) => ({ ...prev, logo_shape: shape.id as any }))}
                        className={`py-2 px-1 text-center rounded-xl border text-[11px] font-semibold cursor-pointer ${
                          config.logo_shape === shape.id
                            ? 'border-[#0F5C3A] bg-emerald-50 text-[#0F5C3A] font-bold'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        {shape.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Market Breadcrumb Badge */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <div>
                    <label className="text-xs font-bold text-gray-900 block">
                      Show Market Badge
                    </label>
                    <span className="text-[11px] text-gray-500">
                      Display verified market stall indicator
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.show_market_badge}
                    onChange={(e) =>
                      setConfig((prev) => ({ ...prev, show_market_badge: e.target.checked }))
                    }
                    className="w-4 h-4 text-[#0F5C3A] rounded-sm cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* 3. HERO SHOWCASE */}
            {activeTab === 'hero' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-[#0F5C3A]" />
                    Hero Section Customization
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Fine-tune headline, banner imagery, and prominent call-to-action buttons.
                  </p>
                </div>

                {/* Hero Layout */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-700 block">
                    Hero Display Style
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {[
                      { id: 'banner_overlay', label: 'Full Banner Overlay', desc: 'Atmospheric fabric banner' },
                      { id: 'split_showcase', label: 'Split Showcase', desc: 'Hero with quick Lookbook preview' },
                      { id: 'clean_minimal', label: 'Clean Minimalist', desc: 'Sleek, typography-focused' },
                      { id: 'catalog_spotlight', label: 'Lookbook Spotlight', desc: 'Prominent PDF catalog hero' },
                    ].map((h) => (
                      <button
                        key={h.id}
                        onClick={() => setConfig((prev) => ({ ...prev, hero_layout: h.id as any }))}
                        className={`p-2.5 rounded-xl border text-left cursor-pointer ${
                          config.hero_layout === h.id
                            ? 'border-[#0F5C3A] bg-emerald-50/50 ring-1 ring-[#0F5C3A]'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="font-bold text-gray-900">{h.label}</div>
                        <div className="text-[10px] text-gray-500 mt-0.5">{h.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Headline & Tagline */}
                <div className="space-y-3 pt-2 border-t border-gray-100">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700 block">
                      Custom Hero Headline (Optional)
                    </label>
                    <input
                      type="text"
                      value={config.hero_headline}
                      onChange={(e) => setConfig((prev) => ({ ...prev, hero_headline: e.target.value }))}
                      placeholder={`Default: ${vendor.shop_name}`}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#0F5C3A]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700 block">
                      Hero Subtitle / Tagline
                    </label>
                    <input
                      type="text"
                      value={config.hero_tagline}
                      onChange={(e) => setConfig((prev) => ({ ...prev, hero_tagline: e.target.value }))}
                      placeholder="e.g. Direct Wholesale Importers & Manufacturers of Pure Silk & Chiffon"
                      className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#0F5C3A]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700 block">
                      Badge Text
                    </label>
                    <input
                      type="text"
                      value={config.hero_badge_text || ''}
                      onChange={(e) => setConfig((prev) => ({ ...prev, hero_badge_text: e.target.value }))}
                      placeholder="e.g. Verified Azam Market Stall • Est. 1994"
                      className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#0F5C3A]"
                    />
                  </div>
                </div>

                {/* Cover Presets */}
                <div className="space-y-2 pt-2 border-t border-gray-100">
                  <label className="text-xs font-bold text-gray-700 block">
                    Hero Cover Banner
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {COVER_PRESETS.map((cp, idx) => (
                      <button
                        key={idx}
                        onClick={() => setConfig((prev) => ({ ...prev, hero_cover_url: cp.url }))}
                        className={`rounded-xl overflow-hidden border text-left group cursor-pointer relative h-16 ${
                          config.hero_cover_url === cp.url
                            ? 'ring-2 ring-[#0F5C3A] border-transparent'
                            : 'border-gray-200'
                        }`}
                      >
                        <img src={cp.url} alt={cp.name} className="w-full h-full object-cover" />
                        <span className="absolute inset-x-0 bottom-0 bg-black/70 text-[9px] text-white p-1 truncate font-medium">
                          {cp.name}
                        </span>
                      </button>
                    ))}
                  </div>

                  <div className="mt-3">
                    <ImageUploader
                      value={config.hero_cover_url || vendor.cover_url || ''}
                      onChange={(url) => setConfig((prev) => ({ ...prev, hero_cover_url: url }))}
                      aspect="cover"
                      label="Upload Custom Hero Cover Banner"
                      description={
                        !config.hero_cover_url && vendor.cover_url
                          ? 'Currently showing the banner from your Shop Profile. Upload here only to use a different banner on your storefront; "Remove Image" goes back to the profile banner.'
                          : 'Panoramic fabric banner (wide 16:9 or 3:1) for your storefront header.'
                      }
                      placeholderText="Upload panoramic banner or paste image URL..."
                    />
                  </div>
                </div>

                {/* Hero CTAs */}
                <div className="space-y-2 pt-2 border-t border-gray-100 text-xs">
                  <label className="font-bold text-gray-700 block">Hero Action Buttons</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.hero_show_whatsapp}
                        onChange={(e) =>
                          setConfig((prev) => ({ ...prev, hero_show_whatsapp: e.target.checked }))
                        }
                        className="w-4 h-4 text-[#0F5C3A] rounded-sm"
                      />
                      <span className="text-gray-800">Show prominent WhatsApp button in Hero</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.hero_show_phone}
                        onChange={(e) =>
                          setConfig((prev) => ({ ...prev, hero_show_phone: e.target.checked }))
                        }
                        className="w-4 h-4 text-[#0F5C3A] rounded-sm"
                      />
                      <span className="text-gray-800">Show Phone Number call button in Hero</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.hero_show_catalogue_btn}
                        onChange={(e) =>
                          setConfig((prev) => ({ ...prev, hero_show_catalogue_btn: e.target.checked }))
                        }
                        className="w-4 h-4 text-[#0F5C3A] rounded-sm"
                      />
                      <span className="text-gray-800">Show "View PDF Lookbooks" button in Hero</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* 4. WHATSAPP & PHONE ATTACHED BUTTON */}
            {activeTab === 'contact' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-[#25D366]" />
                    WhatsApp & Phone Attached Buttons
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Configure direct buyer wholesale inquiry channels, labels, and pre-filled greetings.
                  </p>
                </div>

                {/* WhatsApp Section */}
                <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-[#25D366] text-white flex items-center justify-center">
                        <MessageCircle className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-gray-900">WhatsApp Wholesale Desk</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={config.whatsapp_button.enabled}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          whatsapp_button: { ...prev.whatsapp_button, enabled: e.target.checked },
                        }))
                      }
                      className="w-4 h-4 text-[#0F5C3A] rounded-sm cursor-pointer"
                    />
                  </div>

                  <div className="space-y-2">
                    <div>
                      <label className="text-[11px] font-semibold text-gray-700 block">
                        WhatsApp Button Label
                      </label>
                      <input
                        type="text"
                        value={config.whatsapp_button.custom_label}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            whatsapp_button: { ...prev.whatsapp_button, custom_label: e.target.value },
                          }))
                        }
                        placeholder="e.g. Chat with Stall Owner"
                        className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-1 focus:ring-[#0F5C3A]"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-gray-700 block">
                        Default Inquiry Welcome Message
                      </label>
                      <textarea
                        rows={2}
                        value={config.whatsapp_button.welcome_message}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            whatsapp_button: { ...prev.whatsapp_button, welcome_message: e.target.value },
                          }))
                        }
                        placeholder="Greeting sent when buyer clicks WhatsApp..."
                        className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-1 focus:ring-[#0F5C3A]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div>
                        <label className="text-[11px] font-semibold text-gray-700 block">
                          Online Status Pill Text
                        </label>
                        <input
                          type="text"
                          value={config.whatsapp_button.online_status_text}
                          onChange={(e) =>
                            setConfig((prev) => ({
                              ...prev,
                              whatsapp_button: { ...prev.whatsapp_button, online_status_text: e.target.value },
                            }))
                          }
                          placeholder="e.g. Online • Quick Reply"
                          className="w-full text-xs px-3 py-1.5 rounded-xl border border-gray-200 bg-white"
                        />
                      </div>

                      <div className="flex items-center gap-2 pt-4">
                        <input
                          type="checkbox"
                          id="floating_badge"
                          checked={config.whatsapp_button.show_floating_badge}
                          onChange={(e) =>
                            setConfig((prev) => ({
                              ...prev,
                              whatsapp_button: { ...prev.whatsapp_button, show_floating_badge: e.target.checked },
                            }))
                          }
                          className="w-4 h-4 text-[#0F5C3A] rounded-sm cursor-pointer"
                        />
                        <label htmlFor="floating_badge" className="text-[11px] font-semibold text-gray-700 cursor-pointer">
                          Show Floating Icon in Bottom Corner
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Attached Phone Call Button Section */}
                <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                        <Phone className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-gray-900">Phone Call Attached Button</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={config.phone_button.enabled}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          phone_button: { ...prev.phone_button, enabled: e.target.checked },
                        }))
                      }
                      className="w-4 h-4 text-blue-600 rounded-sm cursor-pointer"
                    />
                  </div>

                  <div className="space-y-2">
                    <div>
                      <label className="text-[11px] font-semibold text-gray-700 block">
                        Attached Button Label
                      </label>
                      <input
                        type="text"
                        value={config.phone_button.custom_label}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            phone_button: { ...prev.phone_button, custom_label: e.target.value },
                          }))
                        }
                        placeholder="e.g. Call Stall Directly"
                        className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-gray-700 block">
                        Stall Attached Phone Number (for direct dialing)
                      </label>
                      <input
                        type="text"
                        value={config.phone_button.phone_number || vendor.whatsapp}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            phone_button: { ...prev.phone_button, phone_number: e.target.value },
                          }))
                        }
                        placeholder="+92 300 1234567"
                        className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-1 text-xs">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={config.phone_button.show_in_header}
                          onChange={(e) =>
                            setConfig((prev) => ({
                              ...prev,
                              phone_button: { ...prev.phone_button, show_in_header: e.target.checked },
                            }))
                          }
                          className="w-4 h-4 text-blue-600 rounded-sm"
                        />
                        <span className="text-gray-700">Display in Header</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={config.phone_button.show_in_sticky_bar}
                          onChange={(e) =>
                            setConfig((prev) => ({
                              ...prev,
                              phone_button: { ...prev.phone_button, show_in_sticky_bar: e.target.checked },
                            }))
                          }
                          className="w-4 h-4 text-blue-600 rounded-sm"
                        />
                        <span className="text-gray-700">Display in Bottom Bar</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 6. PRODUCT PRICING & WHOLESALE */}
            {activeTab === 'pricing' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-[#0F5C3A]" />
                    Product Pricing & Wholesale Rules
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Choose whether to disclose rates publicly or require WhatsApp inquiries for pricing.
                  </p>
                </div>

                {/* Show Public Prices Toggle */}
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <strong className="text-xs font-bold text-gray-900 block">
                        Public Wholesale Pricing Visibility
                      </strong>
                      <p className="text-[11px] text-gray-500">
                        {config.product_pricing.show_public_prices
                          ? 'Showing exact price ranges (e.g. ₨800–1,200/m) on all cards'
                          : 'Hiding public prices — product cards show "WhatsApp for Wholesale Price"'}
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={config.product_pricing.show_public_prices}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          product_pricing: {
                            ...prev.product_pricing,
                            show_public_prices: e.target.checked,
                          },
                        }))
                      }
                      className="w-4 h-4 text-[#0F5C3A] rounded-sm cursor-pointer"
                    />
                  </div>
                </div>

                {/* Price Format & Units */}
                <div className="space-y-2 pt-2 border-t border-gray-100">
                  <label className="text-xs font-bold text-gray-700 block">
                    Preferred Wholesale Unit Format
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    {[
                      { id: 'pkr_metre', label: '₨ / Metre', sample: '₨1,200/m' },
                      { id: 'pkr_roll', label: '₨ / Roll', sample: '₨2,500/roll' },
                      { id: 'pkr_suit', label: '₨ / Suit', sample: '₨3,800/suit' },
                      { id: 'pkr_thaan', label: '₨ / Thaan', sample: '₨15,000/thaan' },
                    ].map((unit) => (
                      <button
                        key={unit.id}
                        onClick={() =>
                          setConfig((prev) => ({
                            ...prev,
                            product_pricing: {
                              ...prev.product_pricing,
                              price_badge_format: unit.id as any,
                            },
                          }))
                        }
                        className={`p-2 rounded-xl border text-center cursor-pointer ${
                          config.product_pricing.price_badge_format === unit.id
                            ? 'border-[#0F5C3A] bg-emerald-50 text-[#0F5C3A] font-bold'
                            : 'border-gray-200 text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <div>{unit.label}</div>
                        <div className="text-[10px] text-gray-400 mt-0.5">{unit.sample}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* MOQ Badge */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <div>
                    <label className="text-xs font-bold text-gray-900 block">
                      Display MOQ (Minimum Order Quantity)
                    </label>
                    <span className="text-[11px] text-gray-500">
                      Show minimum wholesale roll or metre thresholds on product cards
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.product_pricing.show_moq_badge}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        product_pricing: {
                          ...prev.product_pricing,
                          show_moq_badge: e.target.checked,
                        },
                      }))
                    }
                    className="w-4 h-4 text-[#0F5C3A] rounded-sm cursor-pointer"
                  />
                </div>

                {/* Bulk Order Discount Ribbon */}
                <div className="space-y-3 pt-2 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-xs font-bold text-gray-900 block">
                        Bulk Discount Banner on Product Catalog
                      </label>
                      <span className="text-[11px] text-gray-500">
                        Incentivize bulk buyers with volume discount notifications
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={config.product_pricing.enable_bulk_discount_banner}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          product_pricing: {
                            ...prev.product_pricing,
                            enable_bulk_discount_banner: e.target.checked,
                          },
                        }))
                      }
                      className="w-4 h-4 text-[#0F5C3A] rounded-sm cursor-pointer"
                    />
                  </div>

                  {config.product_pricing.enable_bulk_discount_banner && (
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-gray-600 block">
                        Discount Announcement Message
                      </label>
                      <input
                        type="text"
                        value={config.product_pricing.bulk_discount_text}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            product_pricing: {
                              ...prev.product_pricing,
                              bulk_discount_text: e.target.value,
                            },
                          }))
                        }
                        placeholder="e.g. Wholesale Discount: 5% off on 500m+ orders, 10% on full rolls"
                        className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#0F5C3A]"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 6. MODULAR BLOCKS & REORDERING */}
            {activeTab === 'blocks' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#0F5C3A]" />
                    Modular Blocks & Page Ordering
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Drag, reorder, or toggle sections that appear on your shop landing page.
                  </p>
                </div>

                <div className="space-y-3">
                  {config.blocks.map((block, index) => {
                    const isExpanded = expandedBlockSettings === block.id;
                    return (
                      <div
                        key={block.id}
                        className={`rounded-xl border transition-all overflow-hidden ${
                          block.enabled
                            ? 'bg-white border-gray-200 shadow-2xs'
                            : 'bg-gray-50 border-gray-200 opacity-60'
                        }`}
                      >
                        <div className="p-3 flex items-center justify-between gap-3">
                          <div
                            onClick={() => setExpandedBlockSettings(isExpanded ? null : block.id)}
                            className="flex items-center gap-3 cursor-pointer flex-1"
                          >
                            <span className="w-6 h-6 rounded-md bg-gray-100 text-gray-600 font-mono text-xs flex items-center justify-center font-bold">
                              {index + 1}
                            </span>
                            <div>
                              <span className="text-xs font-bold text-gray-900 block hover:text-[#0F5C3A]">
                                {block.custom_title || block.label}
                              </span>
                              <span className="text-[10px] text-gray-400">
                                Type: {block.id} • Click to configure
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {/* Up button */}
                            <button
                              onClick={() => handleMoveBlock(index, 'up')}
                              disabled={index === 0}
                              className="p-1 text-gray-400 hover:text-gray-800 disabled:opacity-30 cursor-pointer"
                              title="Move Up"
                            >
                              <ArrowUp className="w-4 h-4" />
                            </button>

                            {/* Down button */}
                            <button
                              onClick={() => handleMoveBlock(index, 'down')}
                              disabled={index === config.blocks.length - 1}
                              className="p-1 text-gray-400 hover:text-gray-800 disabled:opacity-30 cursor-pointer"
                              title="Move Down"
                            >
                              <ArrowDown className="w-4 h-4" />
                            </button>

                            {/* Toggle switch */}
                            <button
                              onClick={() => handleToggleBlock(block.id)}
                              className={`w-8 h-4 rounded-full transition-colors relative cursor-pointer ml-1 ${
                                block.enabled ? 'bg-[#0F5C3A]' : 'bg-gray-300'
                              }`}
                            >
                              <span
                                className={`w-3 h-3 rounded-full bg-white absolute top-0.5 transition-transform ${
                                  block.enabled ? 'left-4.5' : 'left-0.5'
                                }`}
                              ></span>
                            </button>
                          </div>
                        </div>

                        {/* Expandable settings for this block */}
                        {isExpanded && (
                          <div className="p-3 bg-gray-50 border-t border-gray-100 space-y-2 text-xs">
                            <label className="text-[11px] font-bold text-gray-700 block">
                              Custom Heading / Block Title
                            </label>
                            <input
                              type="text"
                              value={block.custom_title || ''}
                              onChange={(e) => {
                                const newTitle = e.target.value;
                                setConfig((prev) => ({
                                  ...prev,
                                  blocks: prev.blocks.map((b) =>
                                    b.id === block.id ? { ...b, custom_title: newTitle } : b
                                  ),
                                }));
                              }}
                              placeholder={block.label}
                              className="w-full text-xs px-3 py-1.5 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-1 focus:ring-[#0F5C3A]"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Add Available Blocks */}
                {(() => {
                  const existingIds = new Set(config.blocks.map((b) => b.id));
                  const availableToAdd = ALL_AVAILABLE_BLOCKS.filter((b) => !existingIds.has(b.id as any));
                  if (availableToAdd.length === 0) return null;
                  return (
                    <div className="pt-3 border-t border-gray-100 space-y-2">
                      <label className="text-xs font-bold text-gray-800 block flex items-center gap-1.5">
                        <Plus className="w-3.5 h-3.5 text-[#0F5C3A]" />
                        Add Additional Section Blocks
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {availableToAdd.map((b) => (
                          <button
                            key={b.id}
                            onClick={() => {
                              setConfig((prev) => ({
                                ...prev,
                                blocks: [
                                  ...prev.blocks,
                                  {
                                    id: b.id as any,
                                    label: b.label,
                                    custom_title: b.defaultTitle,
                                    enabled: true,
                                    sort_order: prev.blocks.length + 1,
                                  },
                                ],
                              }));
                              showToast(`Added block: ${b.label}`);
                            }}
                            className="text-left p-2.5 rounded-xl border border-dashed border-gray-300 hover:border-[#0F5C3A] hover:bg-emerald-50/40 text-xs text-gray-700 flex items-center justify-between group cursor-pointer transition-all"
                          >
                            <span className="font-semibold text-[11px] truncate group-hover:text-[#0F5C3A]">
                              {b.label}
                            </span>
                            <Plus className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#0F5C3A] shrink-0" />
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* INLINE SETTINGS: BANK & DIGITAL PAYMENT GATEWAYS */}
                <div className="pt-4 border-t border-gray-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                        <Building className="w-4 h-4 text-emerald-700" />
                        Bank Details & Payment Gateways Configuration
                      </h4>
                      <p className="text-[11px] text-gray-500">
                        Supports JazzCash, PayFast 1Link, Keenu, and Stripe checkout for buyer deposits and subscription tiers.
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setPaymentPurpose('subscription_upgrade');
                        setPaymentAmount(15000);
                        setShowPaymentModal(true);
                      }}
                      className="bg-emerald-800 hover:bg-emerald-900 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer shrink-0 shadow-xs"
                    >
                      <Wallet className="w-3.5 h-3.5" />
                      <span>Test Checkout Flow</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-gray-50 p-3.5 rounded-xl border border-gray-200 text-xs">
                    <div>
                      <label className="text-[11px] font-bold text-gray-700 block">Bank Name</label>
                      <input
                        type="text"
                        value={config.bank_details?.bank_name || ''}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            bank_details: { ...prev.bank_details, bank_name: e.target.value },
                          }))
                        }
                        placeholder="e.g. Meezan Bank Ltd (Circular Road)"
                        className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white mt-1"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-gray-700 block">Account Title</label>
                      <input
                        type="text"
                        value={config.bank_details?.account_title || ''}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            bank_details: { ...prev.bank_details, account_title: e.target.value },
                          }))
                        }
                        placeholder="e.g. Al-Madina Textiles"
                        className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white mt-1"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-gray-700 block">IBAN Number</label>
                      <input
                        type="text"
                        value={config.bank_details?.iban || ''}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            bank_details: { ...prev.bank_details, iban: e.target.value },
                          }))
                        }
                        placeholder="PK..."
                        className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white mt-1 font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-gray-700 block">JazzCash Wallet Number</label>
                      <input
                        type="text"
                        value={config.bank_details?.jazzcash_no || ''}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            bank_details: { ...prev.bank_details, jazzcash_no: e.target.value },
                          }))
                        }
                        placeholder="0300-1234567"
                        className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white mt-1 font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* INLINE SETTINGS: B2B TRADE FAQS */}
                <div className="pt-4 border-t border-gray-200 space-y-3">
                  <h4 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-amber-600" />
                    B2B Trade Frequently Asked Questions
                  </h4>

                  {/* List of FAQs */}
                  <div className="space-y-2">
                    {config.faqs?.map((faq, idx) => (
                      <div key={idx} className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-2 text-xs">
                        <div className="flex items-center justify-between gap-2">
                          <input
                            type="text"
                            value={faq.question}
                            onChange={(e) => {
                              const newQ = e.target.value;
                              setConfig((prev) => ({
                                ...prev,
                                faqs: prev.faqs?.map((f, i) => (i === idx ? { ...f, question: newQ } : f)),
                              }));
                            }}
                            className="flex-1 font-bold text-gray-900 px-2.5 py-1 bg-white border border-gray-200 rounded-lg text-xs"
                          />
                          <button
                            onClick={() => {
                              setConfig((prev) => ({
                                ...prev,
                                faqs: prev.faqs?.filter((_, i) => i !== idx),
                              }));
                            }}
                            className="p-1 text-red-500 hover:text-red-700 cursor-pointer"
                            title="Delete FAQ"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <textarea
                          rows={2}
                          value={faq.answer}
                          onChange={(e) => {
                            const newA = e.target.value;
                            setConfig((prev) => ({
                              ...prev,
                              faqs: prev.faqs?.map((f, i) => (i === idx ? { ...f, answer: newA } : f)),
                            }));
                          }}
                          className="w-full text-xs px-2.5 py-1 bg-white border border-gray-200 rounded-lg text-gray-700"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Add new FAQ */}
                  <div className="p-3 bg-white border border-dashed border-gray-300 rounded-xl space-y-2 text-xs">
                    <span className="font-bold text-gray-700 block text-[11px]">Add New Question & Answer</span>
                    <input
                      type="text"
                      placeholder="e.g. Can we place bulk orders on 30-day post-dated cheques?"
                      value={newFaqQuestion}
                      onChange={(e) => setNewFaqQuestion(e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 border border-gray-200 rounded-lg"
                    />
                    <textarea
                      rows={2}
                      placeholder="Answer..."
                      value={newFaqAnswer}
                      onChange={(e) => setNewFaqAnswer(e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 border border-gray-200 rounded-lg"
                    />
                    <button
                      type="button"
                      disabled={!newFaqQuestion.trim() || !newFaqAnswer.trim()}
                      onClick={() => {
                        setConfig((prev) => ({
                          ...prev,
                          faqs: [
                            ...(prev.faqs || []),
                            { question: newFaqQuestion.trim(), answer: newFaqAnswer.trim() },
                          ],
                        }));
                        setNewFaqQuestion('');
                        setNewFaqAnswer('');
                        showToast('Added new FAQ question');
                      }}
                      className="bg-[#0F5C3A] disabled:opacity-40 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add FAQ</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 7. PUBLISHING & STATUS */}
            {activeTab === 'publishing' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-[#0F5C3A]" />
                    Shop Publishing & Live Visibility
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Deploy your latest customization changes live to Azam Market Online.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-gray-900 block">
                        Publication Status
                      </span>
                      <span className="text-[11px] text-gray-500">
                        {config.is_published
                          ? 'Your shop is actively published and visible to buyers worldwide.'
                          : 'Your shop has unpublished draft changes waiting to be deployed.'}
                      </span>
                    </div>
                    {config.is_published ? (
                      <span className="bg-emerald-100 text-[#0F5C3A] text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5" /> Published
                      </span>
                    ) : (
                      <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full">
                        Draft Mode
                      </span>
                    )}
                  </div>

                  <div className="pt-2 border-t border-gray-200 text-xs space-y-1">
                    <div className="text-gray-500">
                      Public Shop Link:{' '}
                      <strong className="text-gray-900">
                        /shop/{vendor.slug}
                      </strong>
                    </div>
                    {config.published_at && (
                      <div className="text-gray-500 text-[11px]">
                        Last Published: {new Date(config.published_at).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>

                {config.is_published ? (
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleSave}
                        disabled={isSaving || !dirty}
                        className="flex-1 bg-[#0F5C3A] hover:bg-[#1A7A4F] disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-xs font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                      >
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        <span>{dirty ? 'Save changes (goes live immediately)' : 'All changes saved'}</span>
                      </button>

                      <button
                        onClick={handleSaveDraft}
                        disabled={isSaving}
                        className="bg-white hover:bg-gray-50 text-gray-800 text-xs font-bold py-3 px-4 rounded-xl border border-gray-300 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <span>Take offline</span>
                      </button>
                    </div>
                    <p className="text-[11px] text-gray-500">
                      Your shop is live, so saved edits appear to buyers right away. "Take offline" switches the
                      customized shop back to a draft.
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={handlePublish}
                      disabled={isSaving}
                      className="flex-1 bg-[#0F5C3A] hover:bg-[#1A7A4F] disabled:opacity-60 text-white text-xs font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                      <span>Publish Changes to Live Shop</span>
                    </button>

                    <button
                      onClick={handleSave}
                      disabled={isSaving || !dirty}
                      className="bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-800 text-xs font-bold py-3 px-4 rounded-xl border border-gray-300 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Save className="w-4 h-4 text-gray-500" />
                      <span>Save Draft</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sticky Save Bar: lets a vendor save from any tab without scrolling back up */}
          {(dirty || saveError || isSaving) && (
            <div className="sticky bottom-4 z-30 bg-white/95 backdrop-blur-sm border border-gray-300 shadow-lg rounded-2xl p-3 space-y-2">
              {saveError && (
                <ErrorBanner message={saveError} onDismiss={() => setSaveError('')} onRetry={() => void handleSave()} />
              )}
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <SaveStatus dirty={dirty} saving={isSaving} savedAt={savedAt} hasError={!!saveError} />
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setConfig((prev) => ({
                        ...savedConfig,
                        is_published: prev.is_published,
                        published_at: prev.published_at,
                        last_saved_at: prev.last_saved_at,
                      }));
                      setSaveError('');
                    }}
                    disabled={isSaving || !dirty}
                    className="text-xs font-bold px-3.5 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Discard changes
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving || !dirty}
                    className="bg-[#0F5C3A] hover:bg-[#1A7A4F] disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-xs font-bold px-4 py-2.5 rounded-xl inline-flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
                  >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    <span>{config.is_published ? 'Save changes' : 'Save draft'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Interactive Live View Screen (7 cols on xl) */}
        <div className="xl:col-span-7 space-y-3">
          {/* Live View Device Controls Bar */}
          <div className="bg-white rounded-2xl border border-gray-200 p-3 shadow-2xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-[#0F5C3A]" />
                Interactive Shop Live View
              </span>
              <span className="hidden sm:inline bg-emerald-50 text-[#0F5C3A] text-[10px] font-bold px-2 py-0.5 rounded-md">
                Live Simulator
              </span>
            </div>

            {/* Device Switcher */}
            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
              <button
                onClick={() => setDevicePreview('desktop')}
                title="Desktop View"
                className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                  devicePreview === 'desktop'
                    ? 'bg-white text-gray-900 shadow-xs font-bold'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setDevicePreview('tablet')}
                title="Tablet View"
                className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                  devicePreview === 'tablet'
                    ? 'bg-white text-gray-900 shadow-xs font-bold'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <Tablet className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setDevicePreview('mobile')}
                title="Mobile Phone View"
                className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                  devicePreview === 'mobile'
                    ? 'bg-white text-gray-900 shadow-xs font-bold'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* SIMULATOR FRAME */}
          <div
            className={`mx-auto transition-all duration-300 ${
              devicePreview === 'mobile'
                ? 'max-w-[390px] border-8 border-gray-900 rounded-[38px] shadow-2xl overflow-hidden'
                : devicePreview === 'tablet'
                ? 'max-w-[720px] border-6 border-gray-800 rounded-[28px] shadow-xl overflow-hidden'
                : 'w-full rounded-2xl border border-gray-200 shadow-xs overflow-hidden'
            }`}
          >
            {/* Mobile / Tablet Screen Notch (if simulated) */}
            {devicePreview === 'mobile' && (
              <div className="bg-gray-900 text-white text-[10px] px-6 py-1.5 flex items-center justify-between select-none">
                <span>9:41</span>
                <div className="w-16 h-3 bg-black rounded-full mx-auto"></div>
                <div className="flex items-center gap-1 text-[9px]">
                  <span>5G</span>
                  <span>100%</span>
                </div>
              </div>
            )}

            {/* SIMULATED LIVE SHOP VIEW CONTENT CONTAINER */}
            <div
              className={`h-[720px] overflow-y-auto ${bgClass} ${fontClass} relative select-none`}
              style={{
                // Custom CSS variables for live color application
                ['--shop-primary' as any]: config.theme_color,
                ['--shop-accent' as any]: config.accent_color,
              }}
            >
              {/* TOP ANNOUNCEMENT BAR (IF ENABLED) */}
              {config.show_announcement && (
                <div
                  className="py-1.5 px-4 text-center text-xs font-bold text-white transition-colors"
                  style={{ backgroundColor: config.theme_color }}
                >
                  <span className="inline-block truncate max-w-full">
                    📢 {config.announcement_text || `Direct Wholesale Mill Importers • ${vendor.market?.name || 'Azam Cloth Market'}`}
                  </span>
                </div>
              )}

              {/* HEADER BAR (BASED ON CHOSEN HEADER LAYOUT) */}
              <div className="bg-white/95 backdrop-blur-md border-b border-gray-200 py-2.5 px-4 sticky top-0 z-30 shadow-2xs">
                <div className="flex items-center justify-between gap-3">
                  {/* Brand info */}
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-9 h-9 text-white flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden shadow-xs ${
                        config.logo_shape === 'circle'
                          ? 'rounded-full'
                          : config.logo_shape === 'square'
                          ? 'rounded-none'
                          : config.logo_shape === 'pill'
                          ? 'rounded-2xl'
                          : 'rounded-xl'
                      }`}
                      style={{ backgroundColor: config.theme_color }}
                    >
                      {vendor.logo_url ? (
                        <img src={vendor.logo_url} alt={vendor.shop_name} className="w-full h-full object-cover" />
                      ) : (
                        <span>{vendor.shop_name[0]}</span>
                      )}
                    </div>
                    <div className="leading-tight">
                      <div className="font-bold text-xs text-gray-900 truncate">
                        {vendor.shop_name}
                      </div>
                      <div className="text-[10px] text-gray-500 truncate">
                        {vendor.stall_number}
                      </div>
                    </div>
                  </div>

                  {/* Header CTA Buttons */}
                  <div className="flex items-center gap-1.5">
                    {/* Attached Phone Call Button (if enabled in header) */}
                    {config.phone_button.enabled && config.phone_button.show_in_header && (
                      <a
                        href={`tel:${config.phone_button.phone_number || vendor.whatsapp}`}
                        className="bg-blue-50 text-blue-700 hover:bg-blue-100 text-[10px] font-bold px-2.5 py-1.5 rounded-lg border border-blue-200 flex items-center gap-1 transition-colors"
                      >
                        <Phone className="w-3 h-3" />
                        <span className="hidden sm:inline">
                          {config.phone_button.custom_label || 'Call Stall'}
                        </span>
                      </a>
                    )}

                    {/* WhatsApp Button */}
                    {config.whatsapp_button.enabled && (
                      <a
                        href={`https://wa.me/${vendor.whatsapp.replace(/[^0-9+]/g, '')}?text=${encodeURIComponent(
                          config.whatsapp_button.welcome_message
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-[#25D366] hover:bg-[#20ba5a] text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-colors shadow-2xs"
                      >
                        <MessageCircle className="w-3 h-3" />
                        <span className="hidden sm:inline">
                          {config.whatsapp_button.custom_label || 'WhatsApp'}
                        </span>
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* HERO SECTION */}
              <div className="relative overflow-hidden">
                {/* Hero Background image or solid gradient */}
                <div
                  className="relative h-44 sm:h-52 w-full flex items-end p-5 text-white"
                  style={{
                    backgroundColor: config.theme_color,
                    backgroundImage: (config.hero_cover_url || vendor.cover_url)
                      ? `linear-gradient(to top, rgba(0,0,0,0.85), rgba(0,0,0,0.3)), url("${config.hero_cover_url || vendor.cover_url}")`
                      : `linear-gradient(135deg, ${config.theme_color}, #072e1d)`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                >
                  <div className="space-y-1.5 max-w-lg z-10">
                    {/* Badge */}
                    <div className="flex items-center gap-2">
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full border shadow-xs"
                        style={{
                          backgroundColor: '#FDF6E7',
                          color: config.accent_color,
                          borderColor: `${config.accent_color}55`,
                        }}
                      >
                        {config.hero_badge_text && config.hero_badge_text !== 'Verified Azam Market Stall' ? config.hero_badge_text : `Verified ${vendor.market?.name || 'Azam Cloth Market'} Stall`}
                      </span>
                    </div>

                    <h2 className="text-xl sm:text-2xl font-bold font-serif leading-tight">
                      {config.hero_headline || vendor.shop_name}
                    </h2>

                    <p className="text-xs text-gray-200 line-clamp-2">
                      {config.hero_tagline || vendor.description}
                    </p>

                    {/* Hero CTAs */}
                    <div className="flex items-center gap-2 pt-1 flex-wrap">
                      {config.hero_show_whatsapp && config.whatsapp_button.enabled && (
                        <span className="bg-[#25D366] text-white text-[10px] font-bold px-3 py-1.5 rounded-lg inline-flex items-center gap-1 shadow-xs">
                          <MessageCircle className="w-3 h-3" />
                          {config.whatsapp_button.custom_label || 'WhatsApp Order'}
                        </span>
                      )}

                      {config.hero_show_phone && config.phone_button.enabled && (
                        <span className="bg-white text-gray-900 text-[10px] font-bold px-3 py-1.5 rounded-lg inline-flex items-center gap-1 shadow-xs">
                          <Phone className="w-3 h-3 text-blue-600" />
                          {config.phone_button.custom_label || 'Call Direct'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* SHOP NAVIGATION TABS SIMULATOR */}
              <div className="bg-white border-b border-gray-200 px-4 flex gap-4 text-xs font-semibold">
                <button
                  onClick={() => setPreviewShopTab('overview')}
                  className={`py-3 border-b-2 transition-colors cursor-pointer ${
                    previewShopTab === 'overview'
                      ? 'text-gray-900 font-bold'
                      : 'border-transparent text-gray-500'
                  }`}
                  style={{
                    borderColor: previewShopTab === 'overview' ? config.theme_color : 'transparent',
                    color: previewShopTab === 'overview' ? config.theme_color : undefined,
                  }}
                >
                  Shop Overview
                </button>
                <button
                  onClick={() => setPreviewShopTab('products')}
                  className={`py-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                    previewShopTab === 'products'
                      ? 'text-gray-900 font-bold'
                      : 'border-transparent text-gray-500'
                  }`}
                  style={{
                    borderColor: previewShopTab === 'products' ? config.theme_color : 'transparent',
                    color: previewShopTab === 'products' ? config.theme_color : undefined,
                  }}
                >
                  <span>Products ({vendor.products?.length || 0})</span>
                </button>
                <button
                  onClick={() => setPreviewShopTab('catalogues')}
                  className={`py-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                    previewShopTab === 'catalogues'
                      ? 'text-gray-900 font-bold'
                      : 'border-transparent text-gray-500'
                  }`}
                  style={{
                    borderColor: previewShopTab === 'catalogues' ? config.theme_color : 'transparent',
                    color: previewShopTab === 'catalogues' ? config.theme_color : undefined,
                  }}
                >
                  <span>PDF Lookbooks ({vendor.catalogues?.length || 0})</span>
                </button>
              </div>

              {/* DYNAMIC MODULAR BLOCKS RENDERER */}
              <div className="p-4 space-y-4 pb-20">
                {previewShopTab === 'overview' && (
                  <>
                    {/* Render blocks in user-configured sorted order */}
                    {config.blocks
                      .filter((b) => b.enabled)
                      .map((block) => {
                        switch (block.id) {
                          case 'about':
                            return (
                              <div
                                key={block.id}
                                className="bg-white rounded-xl border border-gray-200 p-4 shadow-2xs space-y-3"
                              >
                                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                                  <span
                                    className="w-2 h-2 rounded-full"
                                    style={{ backgroundColor: config.theme_color }}
                                  ></span>
                                  {block.custom_title || 'About Stall & Fabric Specialties'}
                                </h3>
                                <p className="text-xs text-gray-600 leading-relaxed">
                                  {vendor.description}
                                </p>
                                <div className="flex flex-wrap gap-1.5 pt-1">
                                  {vendor.tags?.map((tag, i) => (
                                    <span
                                      key={i}
                                      className="text-[10px] font-semibold px-2 py-0.5 rounded-md border"
                                      style={{
                                        backgroundColor: `${config.theme_color}10`,
                                        color: config.theme_color,
                                        borderColor: `${config.theme_color}25`,
                                      }}
                                    >
                                      ✓ {tag}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            );

                          case 'featured_products':
                            return (
                              <div
                                key={block.id}
                                className="bg-white rounded-xl border border-gray-200 p-4 shadow-2xs space-y-3"
                              >
                                <div className="flex items-center justify-between">
                                  <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                                    {block.custom_title || 'Featured Fabric Samples'}
                                  </h3>
                                  <button
                                    onClick={() => setPreviewShopTab('products')}
                                    className="text-[10px] font-bold"
                                    style={{ color: config.theme_color }}
                                  >
                                    View All →
                                  </button>
                                </div>

                                {/* Bulk discount banner if enabled */}
                                {config.product_pricing.enable_bulk_discount_banner && (
                                  <div
                                    className="p-2 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 border"
                                    style={{
                                      backgroundColor: '#FDF6E7',
                                      color: config.accent_color,
                                      borderColor: `${config.accent_color}35`,
                                    }}
                                  >
                                    <span>🎁</span>
                                    <span>
                                      {config.product_pricing.bulk_discount_text ||
                                        'Wholesale Discount: Up to 10% off for 500m+ bulk bookings'}
                                    </span>
                                  </div>
                                )}

                                <div className="grid grid-cols-2 gap-2">
                                  {vendor.products?.slice(0, 2).map((prod) => (
                                    <div
                                      key={prod.id}
                                      onClick={() => setPreviewSelectedProduct(prod)}
                                      className="border border-gray-200 rounded-xl overflow-hidden group cursor-pointer hover:shadow-md transition-shadow bg-gray-50"
                                    >
                                      <div className="h-24 bg-gray-200 overflow-hidden">
                                        <img
                                          src={prod.image_url}
                                          alt={prod.name}
                                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                        />
                                      </div>
                                      <div className="p-2 space-y-1">
                                        <div className="text-[11px] font-bold text-gray-900 truncate">
                                          {prod.name}
                                        </div>
                                        <div className="flex items-center justify-between text-[10px]">
                                          <span
                                            className="font-bold"
                                            style={{ color: config.theme_color }}
                                          >
                                            {config.product_pricing.show_public_prices
                                              ? prod.price_range
                                              : 'WhatsApp for Price'}
                                          </span>
                                          {config.product_pricing.show_moq_badge && (
                                            <span className="text-gray-400">
                                              MOQ: {prod.moq}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );

                          case 'catalogues':
                            return (
                              <div
                                key={block.id}
                                className="bg-white rounded-xl border border-gray-200 p-4 shadow-2xs space-y-3"
                              >
                                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center justify-between">
                                  <span>{block.custom_title || 'PDF Lookbooks & Swatch Books'}</span>
                                  <span className="text-[10px] text-gray-400 font-normal">
                                    {vendor.catalogues?.length || 0} Lookbooks
                                  </span>
                                </h3>

                                {vendor.catalogues && vendor.catalogues.length > 0 ? (
                                  <div className="space-y-2">
                                    {vendor.catalogues.slice(0, 1).map((cat) => (
                                      <div
                                        key={cat.id}
                                        className="p-2.5 rounded-xl border border-gray-200 flex items-center justify-between gap-3 bg-gray-50/50"
                                      >
                                        <div className="flex items-center gap-2">
                                          <div
                                            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                                            style={{
                                              backgroundColor: `${config.accent_color}20`,
                                              color: config.accent_color,
                                            }}
                                          >
                                            <FileText className="w-4 h-4" />
                                          </div>
                                          <div>
                                            <div className="text-xs font-bold text-gray-900 truncate">
                                              {cat.title}
                                            </div>
                                            <div className="text-[10px] text-gray-500">
                                              {cat.season} • {cat.file_size_mb} MB PDF
                                            </div>
                                          </div>
                                        </div>
                                        <span
                                          className="text-[10px] font-bold px-2.5 py-1 rounded-lg text-white shrink-0"
                                          style={{ backgroundColor: config.theme_color }}
                                        >
                                          Download
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="text-xs text-gray-400 text-center py-2">
                                    No PDF lookbooks uploaded yet.
                                  </div>
                                )}
                              </div>
                            );

                          case 'pricing_policy':
                            return (
                              <div
                                key={block.id}
                                className="bg-white rounded-xl border border-gray-200 p-4 shadow-2xs space-y-3"
                              >
                                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                                  <CreditCard className="w-3.5 h-3.5 text-[#0F5C3A]" />
                                  {block.custom_title || 'Wholesale Trade & Pricing Policy'}
                                </h3>
                                <div className="grid grid-cols-2 gap-2 text-[11px]">
                                  <div className="p-2 rounded-lg bg-gray-50 border border-gray-100">
                                    <strong className="block text-gray-900">Payment Terms</strong>
                                    <span className="text-gray-500">Online Bank Transfer / Lahore Cash on Delivery</span>
                                  </div>
                                  <div className="p-2 rounded-lg bg-gray-50 border border-gray-100">
                                    <strong className="block text-gray-900">Nationwide Cargo</strong>
                                    <span className="text-gray-500">Bilal Cargo, Al-Madina & Daewoo Express</span>
                                  </div>
                                </div>
                              </div>
                            );

                          case 'stall_location':
                            return (
                              <div
                                key={block.id}
                                className="bg-white rounded-xl border border-gray-200 p-4 shadow-2xs space-y-2.5"
                              >
                                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                                  <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                                  {block.custom_title || 'Market Stall Physical Location'}
                                </h3>
                                <div className="text-xs text-gray-700 space-y-1">
                                  <div>
                                    <strong>Stall Address:</strong> {vendor.stall_number}
                                  </div>
                                  <div className="text-gray-500 text-[11px]">
                                    {`${vendor.market?.name || 'Azam Cloth Market'}, ${vendor.market?.city || 'Lahore'}`}
                                  </div>
                                  <div className="text-gray-500 text-[11px] flex items-center gap-1 pt-1">
                                    <Clock className="w-3 h-3" />
                                    <span>Mon – Sat: 10:00 AM – 8:00 PM (Closed Sundays)</span>
                                  </div>
                                </div>
                              </div>
                            );

                          case 'contact_cta':
                            return (
                              <div
                                key={block.id}
                                className="rounded-xl p-4 text-white space-y-2 shadow-2xs"
                                style={{ backgroundColor: config.theme_color }}
                              >
                                <h4 className="font-bold text-xs uppercase tracking-wider">
                                  {block.custom_title || 'Direct Wholesale Inquiry'}
                                </h4>
                                <p className="text-[11px] text-white/90">
                                  For bulk rolls, custom dyeing, or sample swatch cards, reach out directly to the stall master.
                                </p>
                                <div className="flex items-center gap-2 pt-1">
                                  {config.whatsapp_button.enabled && (
                                    <span className="bg-[#25D366] text-white text-[10px] font-bold px-3 py-1.5 rounded-lg inline-flex items-center gap-1">
                                      <MessageCircle className="w-3 h-3" /> WhatsApp
                                    </span>
                                  )}
                                  {config.phone_button.enabled && (
                                    <span className="bg-white text-gray-900 text-[10px] font-bold px-3 py-1.5 rounded-lg inline-flex items-center gap-1">
                                      <Phone className="w-3 h-3 text-blue-600" /> Call
                                    </span>
                                  )}
                                </div>
                              </div>
                            );

                          case 'fabric_guarantee':
                            return (
                              <div
                                key={block.id}
                                className="bg-white rounded-xl border border-gray-200 p-4 shadow-2xs space-y-3"
                              >
                                <div className="flex items-center justify-between">
                                  <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                                    {block.custom_title || 'Certified Fabric Guarantee & Mill Testing'}
                                  </h3>
                                  <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold">
                                    100% Guaranteed
                                  </span>
                                </div>
                                <div className="grid grid-cols-3 gap-2 text-[10px]">
                                  <div className="p-2 rounded-lg bg-gray-50 border border-gray-100">
                                    <strong className="text-gray-900 block font-bold">Color Fast Grade 4+</strong>
                                    <span className="text-gray-500">Zero bleeding on hot wash</span>
                                  </div>
                                  <div className="p-2 rounded-lg bg-gray-50 border border-gray-100">
                                    <strong className="text-gray-900 block font-bold">Heavy Warp/Weft</strong>
                                    <span className="text-gray-500">Suited for zari embroidery</span>
                                  </div>
                                  <div className="p-2 rounded-lg bg-gray-50 border border-gray-100">
                                    <strong className="text-gray-900 block font-bold">Transit Wrapped</strong>
                                    <span className="text-gray-500">Moisture-proof bales</span>
                                  </div>
                                </div>
                              </div>
                            );

                          case 'bank_payment_details':
                            return (
                              <div
                                key={block.id}
                                className="bg-white rounded-xl border border-gray-200 p-4 shadow-2xs space-y-3"
                              >
                                <div className="flex items-center justify-between">
                                  <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                                    <Building className="w-4 h-4 text-emerald-700" />
                                    {block.custom_title || 'Wholesale Settlement & Payment Gateways'}
                                  </h3>
                                  <button
                                    onClick={() => {
                                      setPaymentPurpose('sample_booking_deposit');
                                      setPaymentAmount(5000);
                                      setShowPaymentModal(true);
                                    }}
                                    className="text-[10px] bg-[#0F5C3A] text-white px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 cursor-pointer"
                                  >
                                    <Wallet className="w-3 h-3" /> Pay Now
                                  </button>
                                </div>

                                <div className="grid grid-cols-4 gap-1.5 text-[9px] text-center font-bold">
                                  <span className="p-1.5 rounded-lg bg-red-50 text-red-700 border border-red-200">
                                    JazzCash
                                  </span>
                                  <span className="p-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
                                    PayFast 1Link
                                  </span>
                                  <span className="p-1.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-200">
                                    Keenu
                                  </span>
                                  <span className="p-1.5 rounded-lg bg-purple-50 text-purple-700 border border-purple-200">
                                    Stripe Card
                                  </span>
                                </div>

                                <div className="text-[11px] bg-gray-50 p-2.5 rounded-lg border border-gray-100 space-y-1">
                                  <div className="flex justify-between">
                                    <span className="text-gray-500">Bank:</span>
                                    <strong className="text-gray-900">{config.bank_details?.bank_name || 'Meezan Bank Ltd'}</strong>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-500">Title:</span>
                                    <strong className="text-gray-900">{config.bank_details?.account_title || vendor.shop_name}</strong>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-500">JazzCash:</span>
                                    <strong className="text-red-700 font-mono">{config.bank_details?.jazzcash_no || vendor.whatsapp}</strong>
                                  </div>
                                </div>
                              </div>
                            );

                          case 'faq_accordion':
                            return (
                              <div
                                key={block.id}
                                className="bg-white rounded-xl border border-gray-200 p-4 shadow-2xs space-y-2.5"
                              >
                                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                                  <HelpCircle className="w-4 h-4 text-amber-600" />
                                  {block.custom_title || 'Frequently Asked Questions (Trade FAQs)'}
                                </h3>

                                <div className="space-y-1.5">
                                  {(config.faqs && config.faqs.length > 0 ? config.faqs.slice(0, 3) : [
                                    { question: 'What is the MOQ for wholesale buyers?', answer: '1 full thaan (25–40m).' },
                                    { question: 'Which cargo services do you use?', answer: 'Bilal Cargo & Daewoo across Pakistan.' }
                                  ]).map((faq, fidx) => (
                                    <div key={fidx} className="border border-gray-100 rounded-lg p-2 bg-gray-50/70 text-xs">
                                      <strong className="text-gray-900 block text-[11px]">{faq.question}</strong>
                                      <p className="text-gray-500 text-[10px] mt-0.5">{faq.answer}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );

                          case 'market_landmark':
                            return (
                              <div
                                key={block.id}
                                className="bg-white rounded-xl border border-gray-200 p-4 shadow-2xs space-y-2"
                              >
                                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                                  <Landmark className="w-4 h-4 text-emerald-800" />
                                  {block.custom_title || 'Bazaar Navigation & Landmark Wayfinding'}
                                </h3>
                                <p className="text-[11px] text-gray-600">
                                  Enter via Delhi Gate / Chowk Wazir Khan, proceed through Katra Neelkanth. Stall {vendor.stall_number}.
                                </p>
                              </div>
                            );

                          case 'buyer_reviews':
                            return (
                              <div
                                key={block.id}
                                className="bg-white rounded-xl border border-gray-200 p-4 shadow-2xs space-y-2"
                              >
                                <div className="flex items-center justify-between">
                                  <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                                    {block.custom_title || 'Verified Wholesale Buyer Testimonials'}
                                  </h3>
                                  <span className="text-[10px] text-amber-600 font-bold">★ 4.9 (140+ orders)</span>
                                </div>
                                <div className="p-2 rounded-lg bg-gray-50 border border-gray-100 text-[10px] italic text-gray-600">
                                  "Prompt cargo dispatch of 400m chiffon to Karachi Tariq Road. 100% exact to swatch."
                                </div>
                              </div>
                            );

                          case 'bulk_pricing_tiers':
                            return (
                              <div
                                key={block.id}
                                className="bg-white rounded-xl border border-gray-200 p-4 shadow-2xs space-y-2"
                              >
                                <div className="flex items-center justify-between">
                                  <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                                    <TrendingUp className="w-3.5 h-3.5 text-emerald-700" />
                                    {block.custom_title || 'Volume Discount Schedules & Wholesale Tiers'}
                                  </h3>
                                  <span className="text-[9px] bg-emerald-50 text-emerald-800 font-bold px-1.5 py-0.5 rounded">Wholesale</span>
                                </div>
                                <div className="grid grid-cols-3 gap-1.5 text-[10px] text-center">
                                  <div className="p-1.5 bg-gray-50 rounded border border-gray-100">
                                    <strong className="block text-gray-800">1 Thaan</strong>
                                    <span className="text-gray-500 text-[9px]">Standard</span>
                                  </div>
                                  <div className="p-1.5 bg-emerald-50 rounded border border-emerald-100 text-[#0F5C3A]">
                                    <strong className="block">5–15 Thaans</strong>
                                    <span className="text-[9px]">5% Rebate</span>
                                  </div>
                                  <div className="p-1.5 bg-amber-50 rounded border border-amber-100 text-amber-800">
                                    <strong className="block">Full Roll (1000m+)</strong>
                                    <span className="text-[9px]">10% Off</span>
                                  </div>
                                </div>
                              </div>
                            );

                          case 'video_showcase':
                            return (
                              <div
                                key={block.id}
                                className="bg-white rounded-xl border border-gray-200 p-4 shadow-2xs space-y-2"
                              >
                                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                                  <Video className="w-3.5 h-3.5 text-red-600" />
                                  {block.custom_title || 'Stall Video Tour & Weaving Demonstration'}
                                </h3>
                                <div className="h-32 bg-gray-900 rounded-lg relative overflow-hidden flex items-center justify-center">
                                  <img
                                    src={vendor.cover_url || 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1200&q=80'}
                                    alt="Video preview"
                                    className="w-full h-full object-cover opacity-60"
                                  />
                                  <div className="absolute w-10 h-10 rounded-full bg-white/90 text-[#0F5C3A] flex items-center justify-center shadow">
                                    <Play className="w-4 h-4 fill-[#0F5C3A] ml-0.5" />
                                  </div>
                                </div>
                              </div>
                            );

                          default:
                            return null;
                        }
                      })}
                  </>
                )}

                {/* PRODUCTS TAB PREVIEW */}
                {previewShopTab === 'products' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-900">
                        Fabric Catalog ({vendor.products?.length || 0})
                      </span>
                      <span className="text-[10px] text-gray-500">
                        Format: {config.product_pricing.price_badge_format}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {vendor.products?.map((p) => (
                        <div
                          key={p.id}
                          className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-2xs"
                        >
                          <div className="h-28 bg-gray-100 overflow-hidden relative">
                            <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                            <span className="absolute top-1 left-1 bg-black/70 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                              {p.fabric_type}
                            </span>
                          </div>
                          <div className="p-2 space-y-1">
                            <div className="font-bold text-xs text-gray-900 truncate">{p.name}</div>
                            <div className="text-[11px] font-bold" style={{ color: config.theme_color }}>
                              {config.product_pricing.show_public_prices
                                ? p.price_range
                                : 'Inquire on WhatsApp'}
                            </div>
                            {config.product_pricing.show_moq_badge && (
                              <div className="text-[10px] text-gray-400">Min: {p.moq}</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* CATALOGUES TAB PREVIEW */}
                {previewShopTab === 'catalogues' && (
                  <div className="space-y-3">
                    <span className="text-xs font-bold text-gray-900 block">
                      Wholesale Lookbooks ({vendor.catalogues?.length || 0})
                    </span>
                    <div className="space-y-2">
                      {vendor.catalogues?.map((cat) => (
                        <div
                          key={cat.id}
                          className="bg-white rounded-xl border border-gray-200 p-3 flex items-center justify-between gap-3 shadow-2xs"
                        >
                          <div className="flex items-center gap-2">
                            <FileText className="w-6 h-6 text-amber-600 shrink-0" />
                            <div>
                              <div className="font-bold text-xs text-gray-900">{cat.title}</div>
                              <div className="text-[10px] text-gray-500">{cat.season} • {cat.file_size_mb} MB</div>
                            </div>
                          </div>
                          <span
                            className="text-[10px] font-bold px-3 py-1.5 rounded-lg text-white shrink-0"
                            style={{ backgroundColor: config.theme_color }}
                          >
                            Download
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* FLOATING WHATSAPP BUTTON (IF ENABLED) */}
              {config.whatsapp_button.enabled && config.whatsapp_button.show_floating_badge && (
                <div className="absolute bottom-16 right-4 z-40 flex items-center gap-2 group cursor-pointer animate-pulse">
                  <span className="bg-gray-900 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg border border-gray-700 hidden sm:inline">
                    {config.whatsapp_button.online_status_text || 'Online'}
                  </span>
                  <div className="w-11 h-11 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-xl hover:scale-105 transition-transform">
                    <MessageCircle className="w-6 h-6" />
                  </div>
                </div>
              )}

              {/* FIXED BOTTOM CONTACT BAR (SIMULATOR) */}
              <div className="sticky bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-gray-200 py-2 px-3 flex items-center justify-between gap-2 z-30 shadow-lg">
                <div className="truncate text-xs font-bold text-gray-900">
                  {vendor.shop_name}
                </div>

                <div className="flex items-center gap-1.5">
                  {config.phone_button.enabled && config.phone_button.show_in_sticky_bar && (
                    <a
                      href={`tel:${config.phone_button.phone_number || vendor.whatsapp}`}
                      className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 border border-blue-200"
                    >
                      <Phone className="w-3 h-3" />
                      <span>{config.phone_button.custom_label || 'Call'}</span>
                    </a>
                  )}

                  {config.whatsapp_button.enabled && (
                    <span className="bg-[#25D366] text-white text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1">
                      <MessageCircle className="w-3 h-3" />
                      <span>{config.whatsapp_button.custom_label || 'WhatsApp'}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Gateway Modal (JazzCash, PayFast, Keenu, Stripe) */}
      <PaymentCheckoutModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        vendorId={vendor.id}
        vendorName={vendor.shop_name}
        purpose={paymentPurpose}
        defaultAmountPkr={paymentAmount}
        onPaymentSuccess={(tx) => {
          setLastTx(tx);
          setShowPaymentModal(false);
          showToast(`Payment of ₨${tx.amount_pkr.toLocaleString()} via ${tx.gateway.toUpperCase()} verified successfully!`);
        }}
      />
    </div>
  );
};
