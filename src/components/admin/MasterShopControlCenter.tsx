import React, { useState, useMemo } from 'react';
import { FABRIC_TYPES } from '../../lib/fabricTypes';
import {
  Store,
  Search,
  Filter,
  ShieldCheck,
  Award,
  Sparkles,
  Sliders,
  Settings,
  Eye,
  LogIn,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Phone,
  PhoneCall,
  MessageSquare,
  MessageCircle,
  Layers,
  Palette,
  BookOpen,
  Package,
  CreditCard,
  TrendingUp,
  Download,
  RefreshCw,
  FileText,
  Check,
  ExternalLink,
  ChevronRight,
  Maximize2,
  Building,
  Users,
  Send,
  BarChart3,
  Clock,
  ArrowUpRight,
  Tag,
  Share2,
  X,
  Wallet,
} from 'lucide-react';
import { Vendor, Product, Catalogue, SubscriptionTier, Market, Category, ShopCustomization, PaymentTransaction } from '../../types';
import { ImageUploader } from '../common/ImageUploader';
import { PaymentCheckoutModal } from '../common/PaymentCheckoutModal';

interface MasterShopControlCenterProps {
  vendors: Vendor[];
  tiers: SubscriptionTier[];
  markets: Market[];
  categories: Category[];
  onRefreshData: () => void;
  onUpdateVendor: (vendorId: string, data: Partial<Vendor>) => Promise<void>;
  onDeleteVendor: (vendorId: string) => Promise<void>;
  onEnterVendorDashboard: (vendor: Vendor) => void;
  onViewLiveShop: (slug: string) => void;
  onOnboardNewVendor: () => void;
  onNotify?: (message: string, type: 'success' | 'info' | 'error') => void;
}

export const MasterShopControlCenter: React.FC<MasterShopControlCenterProps> = ({
  vendors,
  tiers,
  markets,
  categories,
  onRefreshData,
  onUpdateVendor,
  onDeleteVendor,
  onEnterVendorDashboard,
  onViewLiveShop,
  onOnboardNewVendor,
  onNotify,
}) => {
  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMarketId, setSelectedMarketId] = useState<string>('all');
  const [selectedTierId, setSelectedTierId] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [filterVerified, setFilterVerified] = useState<boolean | null>(null);
  const [filterFeatured, setFilterFeatured] = useState<boolean | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Selected Vendor for Deep Aspect Inspector Modal
  const [inspectingVendor, setInspectingVendor] = useState<Vendor | null>(null);
  const [activeAspectTab, setActiveAspectTab] = useState<
    'identity' | 'contact' | 'products' | 'catalogues' | 'theme' | 'stats' | 'subscription' | 'payments'
  >('identity');
  const [showAdminPaymentModal, setShowAdminPaymentModal] = useState<boolean>(false);
  const [adminPaymentPurpose, setAdminPaymentPurpose] = useState<'tier_subscription' | 'inquiry_lead_credit' | 'catalogue_sponsor' | 'sample_booking_deposit'>('tier_subscription');
  const [adminPaymentAmount, setAdminPaymentAmount] = useState<number>(15000);

  // Bulk Selection
  const [selectedVendorIds, setSelectedVendorIds] = useState<string[]>([]);
  const [showBulkActionModal, setShowBulkActionModal] = useState<boolean>(false);
  const [bulkActionType, setBulkActionType] = useState<'activate' | 'suspend' | 'verify' | 'unverify' | 'feature' | 'set_tier' | 'broadcast_announcement'>('verify');
  const [bulkTargetTier, setBulkTargetTier] = useState<string>('t-standard');
  const [bulkAnnouncementText, setBulkAnnouncementText] = useState<string>('Eid-ul-Fitr 2026 Wholesale Booking Now Open across Azam Market stalls!');
  const [isProcessingBulk, setIsProcessingBulk] = useState<boolean>(false);

  // Quick Product Add State inside Inspector
  const [showAddProductModal, setShowAddProductModal] = useState<boolean>(false);
  const [newProductName, setNewProductName] = useState('');
  const [newProductFabric, setNewProductFabric] = useState('Lawn 90/70');
  const [showCustomStallFabric, setShowCustomStallFabric] = useState(true);
  const [newProductPrice, setNewProductPrice] = useState('₨950–1,250/m');
  const [newProductMoq, setNewProductMoq] = useState('50 metres');
  const [newProductImage, setNewProductImage] = useState('https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80');

  // Quick Lookbook Add State inside Inspector
  const [showAddCatalogueModal, setShowAddCatalogueModal] = useState<boolean>(false);
  const [newCatTitle, setNewCatTitle] = useState('');
  const [newCatSeason, setNewCatSeason] = useState('Summer 2026');
  const [newCatDescription, setNewCatDescription] = useState('Official wholesale lookbook with volume tier discounts.');

  // Notification helper
  const notify = (msg: string, type: 'success' | 'info' | 'error' = 'success') => {
    if (onNotify) onNotify(msg, type);
  };

  // Cross-Stall Aggregated Metrics
  const platformStats = useMemo(() => {
    const totalStalls = vendors.length;
    const activeStalls = vendors.filter(v => v.status === 'active').length;
    const pendingStalls = vendors.filter(v => v.status === 'pending').length;
    const suspendedStalls = vendors.filter(v => v.status === 'suspended').length;
    const verifiedStalls = vendors.filter(v => v.is_verified).length;
    const featuredStalls = vendors.filter(v => v.is_featured).length;

    const totalViews = vendors.reduce((sum, v) => sum + (v.profile_views || 0), 0);
    const totalWhatsapp = vendors.reduce((sum, v) => sum + (v.whatsapp_clicks || 0), 0);
    const totalCalls = vendors.reduce((sum, v) => sum + (v.call_clicks || Math.round((v.whatsapp_clicks || 0) * 0.45)), 0);
    const totalMessages = vendors.reduce((sum, v) => sum + (v.message_clicks || v.email_clicks || 0), 0);
    const totalCatalogues = vendors.reduce((sum, v) => sum + (v.catalogues?.length || 0), 0);
    const totalProducts = vendors.reduce((sum, v) => sum + (v.products?.length || 0), 0);

    const mrrUsd = vendors.filter(v => v.status === 'active').reduce((sum, v) => {
      const t = tiers.find(tier => tier.id === v.tier_id);
      return sum + (t ? t.price_usd : 0);
    }, 0);

    return {
      totalStalls,
      activeStalls,
      pendingStalls,
      suspendedStalls,
      verifiedStalls,
      featuredStalls,
      totalViews,
      totalWhatsapp,
      totalCalls,
      totalMessages,
      totalCatalogues,
      totalProducts,
      mrrUsd,
    };
  }, [vendors, tiers]);

  // Filtered Vendors List
  const filteredVendors = useMemo(() => {
    return vendors.filter(v => {
      if (selectedMarketId !== 'all' && v.market_id !== selectedMarketId) return false;
      if (selectedTierId !== 'all' && v.tier_id !== selectedTierId) return false;
      if (selectedStatus !== 'all' && v.status !== selectedStatus) return false;
      if (filterVerified !== null && v.is_verified !== filterVerified) return false;
      if (filterFeatured !== null && v.is_featured !== filterFeatured) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = v.shop_name.toLowerCase().includes(q);
        const matchStall = v.stall_number.toLowerCase().includes(q);
        const matchPhone = v.whatsapp.includes(q) || (v.customization?.phone_button?.phone_number || '').includes(q);
        const matchEmail = v.email.toLowerCase().includes(q);
        const matchCat = v.categories?.some(c => c.name.toLowerCase().includes(q));
        const matchProd = v.products?.some(p => p.name.toLowerCase().includes(q) || p.fabric_type.toLowerCase().includes(q));
        return matchName || matchStall || matchPhone || matchEmail || matchCat || matchProd;
      }

      return true;
    });
  }, [vendors, selectedMarketId, selectedTierId, selectedStatus, filterVerified, filterFeatured, searchQuery]);

  // Multi-Select Handlers
  const handleSelectAll = () => {
    if (selectedVendorIds.length === filteredVendors.length) {
      setSelectedVendorIds([]);
    } else {
      setSelectedVendorIds(filteredVendors.map(v => v.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedVendorIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Run Bulk Actions
  const handleExecuteBulkAction = async () => {
    if (selectedVendorIds.length === 0) return;
    setIsProcessingBulk(true);
    try {
      const res = await fetch('/api/admin/bulk-vendor-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendor_ids: selectedVendorIds,
          action: bulkActionType,
          tier_id: bulkTargetTier,
          announcement_text: bulkAnnouncementText,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        notify(data.message || `Executed ${bulkActionType} on ${selectedVendorIds.length} stalls`, 'success');
        onRefreshData();
        setShowBulkActionModal(false);
        setSelectedVendorIds([]);
      } else {
        notify(data.error || 'Failed to execute bulk action', 'error');
      }
    } catch (e) {
      console.error(e);
      notify('Error executing bulk action', 'error');
    } finally {
      setIsProcessingBulk(false);
    }
  };

  // Export Audit Report
  const handleExportAuditReport = () => {
    const reportData = vendors.map(v => ({
      stall_id: v.id,
      shop_name: v.shop_name,
      stall_number: v.stall_number,
      market: v.market?.name || 'Azam Cloth Market',
      tier: v.tier?.display_name || v.tier_id,
      status: v.status,
      verified: v.is_verified,
      featured: v.is_featured,
      whatsapp: v.whatsapp,
      email: v.email,
      products_count: v.products?.length || 0,
      catalogues_count: v.catalogues?.length || 0,
      profile_views: v.profile_views || 0,
      whatsapp_inquiries: v.whatsapp_clicks || 0,
      call_clicks: v.call_clicks || 0,
      message_clicks: v.message_clicks || 0,
      created_at: v.created_at,
    }));

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `azam-market-stalls-audit-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    notify('Stalls Master Audit JSON exported successfully', 'info');
  };

  // Synchronize current inspecting vendor with fresh data
  const currentInspector = inspectingVendor
    ? vendors.find(v => v.id === inspectingVendor.id) || inspectingVendor
    : null;

  return (
    <div className="space-y-6">
      {/* 1. MASTER COMMAND HEADER */}
      <div className="bg-linear-to-r from-gray-900 via-gray-800 to-[#0F5C3A] text-white p-6 rounded-3xl border border-gray-800 shadow-xl relative overflow-hidden">
        {/* Subtle decorative grid/glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#C9952A]/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#C9952A] text-[11px] font-bold tracking-wide uppercase border border-white/10">
              <Sparkles className="w-3.5 h-3.5 text-[#C9952A]" />
              Super-Admin Master Controller • Central Command Room
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight">
              Master Control Center: All Stalls & Aspects
            </h1>
            <p className="text-xs sm:text-sm text-gray-300 max-w-2xl leading-relaxed">
              Real-time centralized control over every stall in Azam Cloth Market. Oversee identities, WhatsApp & call channels, products, lookbooks, storefront customization, analytics, and instant stall masquerade.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={onRefreshData}
              className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl border border-white/20 flex items-center gap-2 transition-all cursor-pointer shadow-xs"
              title="Sync with Live Database"
            >
              <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
              <span>Sync All</span>
            </button>

            <button
              onClick={handleExportAuditReport}
              className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl border border-white/20 flex items-center gap-2 transition-all cursor-pointer shadow-xs"
              title="Export JSON Master Audit"
            >
              <Download className="w-3.5 h-3.5 text-[#C9952A]" />
              <span>Export Audit</span>
            </button>

            <button
              onClick={onOnboardNewVendor}
              className="bg-[#C9952A] hover:bg-[#b58320] text-gray-900 text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-lg"
            >
              <Plus className="w-4 h-4 text-gray-900" />
              <span>Create Stall</span>
            </button>
          </div>
        </div>

        {/* 2. AGGREGATED METRICS BAR */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-6 mt-6 border-t border-white/10 text-xs">
          <div className="bg-black/25 backdrop-blur-xs p-3 rounded-2xl border border-white/10">
            <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Total Stalls</div>
            <div className="font-serif text-xl font-bold text-white mt-1">
              {platformStats.totalStalls}
            </div>
            <div className="text-[10px] text-emerald-400 mt-0.5">
              {platformStats.activeStalls} Active • {platformStats.pendingStalls} Pending
            </div>
          </div>

          <div className="bg-black/25 backdrop-blur-xs p-3 rounded-2xl border border-white/10">
            <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Total Products</div>
            <div className="font-serif text-xl font-bold text-white mt-1">
              {platformStats.totalProducts}
            </div>
            <div className="text-[10px] text-gray-400 mt-0.5">
              Across all categories
            </div>
          </div>

          <div className="bg-black/25 backdrop-blur-xs p-3 rounded-2xl border border-white/10">
            <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Cumulative Views</div>
            <div className="font-serif text-xl font-bold text-emerald-300 mt-1">
              {platformStats.totalViews.toLocaleString()}
            </div>
            <div className="text-[10px] text-gray-400 mt-0.5">
              Buyer impressions
            </div>
          </div>

          <div className="bg-black/25 backdrop-blur-xs p-3 rounded-2xl border border-white/10">
            <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">WhatsApp Leads</div>
            <div className="font-serif text-xl font-bold text-[#25D366] mt-1">
              {platformStats.totalWhatsapp.toLocaleString()}
            </div>
            <div className="text-[10px] text-gray-400 mt-0.5">
              Direct roll inquiries
            </div>
          </div>

          <div className="bg-black/25 backdrop-blur-xs p-3 rounded-2xl border border-white/10">
            <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Call Inquiries</div>
            <div className="font-serif text-xl font-bold text-blue-300 mt-1">
              {platformStats.totalCalls.toLocaleString()}
            </div>
            <div className="text-[10px] text-gray-400 mt-0.5">
              Telephone dials
            </div>
          </div>

          <div className="bg-black/25 backdrop-blur-xs p-3 rounded-2xl border border-white/10">
            <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Platform MRR</div>
            <div className="font-serif text-xl font-bold text-[#C9952A] mt-1">
              ${platformStats.mrrUsd.toLocaleString()}
            </div>
            <div className="text-[10px] text-gray-400 mt-0.5">
              Subscription revenue
            </div>
          </div>
        </div>
      </div>

      {/* 3. MASTER FILTER & SEARCH CONTROL MATRIX */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-2xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Main Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search across all shops by name, stall number (e.g. G-14), phone, fabric type, or owner..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0F5C3A] focus:bg-white transition-all font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
              >
                Clear
              </button>
            )}
          </div>

          {/* Quick View Switches & Counter */}
          <div className="flex items-center gap-2">
            <div className="text-xs text-gray-500 font-semibold px-2">
              Showing <strong className="text-gray-900">{filteredVendors.length}</strong> of {vendors.length} stalls
            </div>

            <div className="flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200 text-xs">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  viewMode === 'grid' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Grid Cards
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  viewMode === 'table' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Data Table
              </button>
            </div>
          </div>
        </div>

        {/* Filter Badges Bar */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100 text-xs">
          <span className="text-[11px] font-bold text-gray-400 uppercase flex items-center gap-1 mr-1">
            <Filter className="w-3 h-3" /> Filters:
          </span>

          {/* Market / Hall */}
          <select
            value={selectedMarketId}
            onChange={(e) => setSelectedMarketId(e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5 font-medium text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#0F5C3A]"
          >
            <option value="all">All Markets / Halls</option>
            {markets.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>

          {/* Tier */}
          <select
            value={selectedTierId}
            onChange={(e) => setSelectedTierId(e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5 font-medium text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#0F5C3A]"
          >
            <option value="all">All Subscription Tiers</option>
            {tiers.map(t => (
              <option key={t.id} value={t.id}>{t.display_name} (${t.price_usd.toLocaleString()})</option>
            ))}
          </select>

          {/* Status */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5 font-medium text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#0F5C3A]"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="pending">Pending Approval</option>
            <option value="suspended">Suspended Only</option>
          </select>

          {/* Verified Toggle */}
          <button
            onClick={() => setFilterVerified(prev => prev === true ? null : true)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              filterVerified === true
                ? 'bg-[#C9952A]/10 border-[#C9952A] text-[#9A6F14]'
                : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            Verified Stalls
          </button>

          {/* Featured Toggle */}
          <button
            onClick={() => setFilterFeatured(prev => prev === true ? null : true)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              filterFeatured === true
                ? 'bg-amber-100 border-amber-400 text-amber-900'
                : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Featured Only
          </button>

          {(selectedMarketId !== 'all' || selectedTierId !== 'all' || selectedStatus !== 'all' || filterVerified !== null || filterFeatured !== null || searchQuery) && (
            <button
              onClick={() => {
                setSelectedMarketId('all');
                setSelectedTierId('all');
                setSelectedStatus('all');
                setFilterVerified(null);
                setFilterFeatured(null);
                setSearchQuery('');
              }}
              className="text-[#0F5C3A] hover:underline font-bold text-xs ml-auto"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Bulk Action Sticky Bar (when 1 or more stalls selected) */}
        {selectedVendorIds.length > 0 && (
          <div className="bg-[#0F5C3A] text-white p-3 rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-2 text-xs font-bold">
              <span className="w-6 h-6 rounded-full bg-white text-[#0F5C3A] flex items-center justify-center font-bold">
                {selectedVendorIds.length}
              </span>
              <span>Stalls selected across directory</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setBulkActionType('verify');
                  setShowBulkActionModal(true);
                }}
                className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-lg border border-white/20 cursor-pointer"
              >
                Bulk Verify
              </button>

              <button
                onClick={() => {
                  setBulkActionType('set_tier');
                  setShowBulkActionModal(true);
                }}
                className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-lg border border-white/20 cursor-pointer"
              >
                Migrate Tier
              </button>

              <button
                onClick={() => {
                  setBulkActionType('broadcast_announcement');
                  setShowBulkActionModal(true);
                }}
                className="bg-[#C9952A] hover:bg-[#b58320] text-gray-900 text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer"
              >
                Broadcast Banner
              </button>

              <button
                onClick={() => setSelectedVendorIds([])}
                className="text-white/80 hover:text-white text-xs font-medium ml-2"
              >
                Deselect
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 4. MASTER SHOPS DISPLAY (GRID OR TABLE) */}
      {filteredVendors.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 text-gray-500 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto text-xl">
            🔍
          </div>
          <h3 className="font-serif text-lg font-bold text-gray-900">No Stalls Match Your Filters</h3>
          <p className="text-xs max-w-md mx-auto">
            Try resetting your search query or loosening your market/status filter parameters.
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID CARDS VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredVendors.map((vendor) => {
            const isSelected = selectedVendorIds.includes(vendor.id);
            return (
              <div
                key={vendor.id}
                className={`bg-white rounded-2xl border transition-all hover:shadow-md flex flex-col justify-between overflow-hidden ${
                  isSelected ? 'border-[#0F5C3A] ring-2 ring-[#0F5C3A]/20' : 'border-gray-200 shadow-2xs'
                }`}
              >
                {/* Stall Header Banner */}
                <div
                  className="p-4 relative"
                  style={{
                    backgroundColor: vendor.customization?.theme_color
                      ? `${vendor.customization.theme_color}10`
                      : '#0F5C3A0A',
                    borderBottom: '1px solid #f3f4f6',
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(vendor.id)}
                        className="w-4 h-4 text-[#0F5C3A] rounded-sm focus:ring-[#0F5C3A] cursor-pointer"
                      />

                      <div
                        className="w-10 h-10 rounded-xl text-white font-serif font-bold text-sm flex items-center justify-center shadow-xs shrink-0"
                        style={{
                          backgroundColor: vendor.customization?.theme_color || '#0F5C3A',
                        }}
                      >
                        {vendor.shop_name[0]}
                      </div>

                      <div>
                        <div className="font-serif font-bold text-gray-900 text-sm flex items-center gap-1.5">
                          <span className="truncate max-w-[170px]" title={vendor.shop_name}>
                            {vendor.shop_name}
                          </span>
                          {vendor.is_verified && (
                            <Award className="w-3.5 h-3.5 text-[#C9952A] shrink-0" title="Verified Trade Stall" />
                          )}
                        </div>

                        <div className="text-[11px] text-gray-500 flex items-center gap-2">
                          <span className="font-semibold text-gray-700">{vendor.stall_number}</span>
                          <span>•</span>
                          <span className="truncate">{vendor.market?.name || 'Azam Cloth Market'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        vendor.status === 'active'
                          ? 'bg-emerald-100 text-[#0F5C3A]'
                          : vendor.status === 'pending'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {vendor.status}
                    </span>
                  </div>

                  {/* Tier pill */}
                  <div className="flex items-center justify-between mt-3 text-[11px]">
                    <span className="bg-white/80 backdrop-blur-xs px-2 py-0.5 rounded-md border border-gray-200/80 font-bold text-gray-700">
                      Tier: {vendor.tier?.display_name || vendor.tier_id}
                    </span>

                    {vendor.is_featured && (
                      <span className="bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-md flex items-center gap-1 text-[10px]">
                        <Sparkles className="w-3 h-3 text-amber-600" /> Featured Stall
                      </span>
                    )}
                  </div>
                </div>

                {/* Stall Aspects Quick Summary */}
                <div className="p-4 space-y-3 flex-1 text-xs">
                  {/* Channels Bar */}
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="bg-gray-50 rounded-lg p-2 border border-gray-100 flex items-center gap-1.5 truncate">
                      <MessageCircle className="w-3.5 h-3.5 text-[#25D366] shrink-0" />
                      <span className="truncate font-medium text-gray-700">{vendor.whatsapp}</span>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-2 border border-gray-100 flex items-center gap-1.5 truncate">
                      <PhoneCall className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span className="truncate font-medium text-gray-700">
                        {vendor.customization?.phone_button?.phone_number || vendor.whatsapp}
                      </span>
                    </div>
                  </div>

                  {/* Live Stats Row */}
                  <div className="grid grid-cols-4 gap-1.5 py-2 px-3 bg-gray-50 rounded-xl border border-gray-200 text-center">
                    <div>
                      <div className="text-[9px] text-gray-400 font-bold uppercase">Views</div>
                      <div className="font-bold text-gray-900 text-xs">
                        {(vendor.profile_views || 0).toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-[9px] text-gray-400 font-bold uppercase">WhatsApp</div>
                      <div className="font-bold text-[#25D366] text-xs">
                        {(vendor.whatsapp_clicks || 0).toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-[9px] text-gray-400 font-bold uppercase">Calls</div>
                      <div className="font-bold text-blue-600 text-xs">
                        {(vendor.call_clicks || Math.round((vendor.whatsapp_clicks || 0) * 0.45)).toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-[9px] text-gray-400 font-bold uppercase">Products</div>
                      <div className="font-bold text-gray-900 text-xs">
                        {vendor.products?.length || 0}
                      </div>
                    </div>
                  </div>

                  {/* Description Snippet */}
                  <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">
                    {vendor.description || 'No description provided by stall owner.'}
                  </p>
                </div>

                {/* Card Action Footer */}
                <div className="p-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => {
                      setInspectingVendor(vendor);
                      setActiveAspectTab('identity');
                    }}
                    className="flex-1 bg-white hover:bg-gray-100 text-gray-900 text-xs font-bold py-2 px-3 rounded-xl border border-gray-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  >
                    <Sliders className="w-3.5 h-3.5 text-[#0F5C3A]" />
                    <span>Control All Aspects</span>
                  </button>

                  {/* Impersonate / Enter Stall as Owner */}
                  <button
                    onClick={() => onEnterVendorDashboard(vendor)}
                    className="bg-emerald-50 hover:bg-emerald-100 text-[#0F5C3A] text-xs font-bold p-2 rounded-xl border border-emerald-200 transition-colors cursor-pointer"
                    title="Enter Stall Dashboard (Ghost Masquerade Mode)"
                  >
                    <LogIn className="w-4 h-4" />
                  </button>

                  {/* View Live Shop */}
                  <button
                    onClick={() => onViewLiveShop(vendor.slug)}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold p-2 rounded-xl border border-gray-200 transition-colors cursor-pointer"
                    title="View Public Storefront"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* DATA TABLE VIEW */
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 uppercase font-bold text-[10px] border-b border-gray-200">
                <tr>
                  <th className="p-3 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={selectedVendorIds.length === filteredVendors.length && filteredVendors.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-[#0F5C3A] rounded-sm focus:ring-[#0F5C3A]"
                    />
                  </th>
                  <th className="p-3">Stall & Shop Name</th>
                  <th className="p-3">Stall No / Market</th>
                  <th className="p-3">WhatsApp & Call</th>
                  <th className="p-3">Subscription Tier</th>
                  <th className="p-3">Stats (Views / WA / Calls)</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Master Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {filteredVendors.map((vendor) => {
                  const isSelected = selectedVendorIds.includes(vendor.id);
                  return (
                    <tr
                      key={vendor.id}
                      className={`hover:bg-gray-50/80 transition-colors ${
                        isSelected ? 'bg-emerald-50/30' : ''
                      }`}
                    >
                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(vendor.id)}
                          className="w-4 h-4 text-[#0F5C3A] rounded-sm focus:ring-[#0F5C3A]"
                        />
                      </td>

                      <td className="p-3">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-8 h-8 rounded-lg text-white font-serif font-bold text-xs flex items-center justify-center shrink-0"
                            style={{ backgroundColor: vendor.customization?.theme_color || '#0F5C3A' }}
                          >
                            {vendor.shop_name[0]}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900 flex items-center gap-1">
                              <span>{vendor.shop_name}</span>
                              {vendor.is_verified && <Award className="w-3.5 h-3.5 text-[#C9952A]" />}
                              {vendor.is_featured && <Sparkles className="w-3 h-3 text-amber-500" />}
                            </div>
                            <div className="text-[10px] text-gray-400">
                              {vendor.products?.length || 0} Products • {vendor.catalogues?.length || 0} Lookbooks
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="p-3">
                        <div className="font-semibold text-gray-900">{vendor.stall_number}</div>
                        <div className="text-[10px] text-gray-400">{vendor.market?.name || 'Azam Cloth Market'}</div>
                      </td>

                      <td className="p-3">
                        <div className="text-gray-900 font-bold flex items-center gap-1">
                          <MessageCircle className="w-3 h-3 text-[#25D366]" />
                          <span>{vendor.whatsapp}</span>
                        </div>
                        <div className="text-[10px] text-gray-400">{vendor.email}</div>
                      </td>

                      <td className="p-3">
                        <select
                          value={vendor.tier_id}
                          onChange={async (e) => {
                            await onUpdateVendor(vendor.id, { tier_id: e.target.value });
                            notify(`Updated tier for ${vendor.shop_name}`);
                          }}
                          className="bg-emerald-50 text-[#0F5C3A] font-bold text-[11px] px-2 py-1 rounded-lg border border-emerald-200 cursor-pointer focus:outline-none"
                        >
                          {tiers.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.display_name} (${t.price_usd.toLocaleString()})
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="p-3">
                        <div className="text-xs text-gray-800 font-semibold">
                          {(vendor.profile_views || 0).toLocaleString()} views
                        </div>
                        <div className="text-[10px] text-gray-500">
                          <span className="text-[#25D366] font-bold">{vendor.whatsapp_clicks || 0} WA</span> •{' '}
                          <span className="text-blue-600 font-bold">
                            {vendor.call_clicks || Math.round((vendor.whatsapp_clicks || 0) * 0.45)} Calls
                          </span>
                        </div>
                      </td>

                      <td className="p-3">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            vendor.status === 'active'
                              ? 'bg-emerald-100 text-[#0F5C3A]'
                              : vendor.status === 'pending'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {vendor.status}
                        </span>
                      </td>

                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setInspectingVendor(vendor);
                              setActiveAspectTab('identity');
                            }}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-[11px] font-bold px-2.5 py-1 rounded-lg border border-gray-300 flex items-center gap-1 cursor-pointer"
                          >
                            <Sliders className="w-3 h-3 text-[#0F5C3A]" />
                            <span>Aspects</span>
                          </button>

                          <button
                            onClick={() => onEnterVendorDashboard(vendor)}
                            className="p-1.5 text-[#0F5C3A] hover:bg-emerald-50 rounded-lg border border-emerald-200"
                            title="Enter Stall Dashboard (Ghost Masquerade)"
                          >
                            <LogIn className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => onViewLiveShop(vendor.slug)}
                            className="p-1.5 text-gray-600 hover:text-gray-900 rounded-lg border border-gray-200"
                            title="View Public Storefront"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. DEEP ASPECT CONTROLLER MODAL / DRAWER FOR SELECTED SHOP              */}
      {/* ========================================================================= */}
      {currentInspector && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-3xl border border-gray-200 shadow-2xl w-full max-w-5xl my-auto overflow-hidden flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="p-5 bg-gray-900 text-white flex items-center justify-between border-b border-gray-800 shrink-0">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl font-serif font-bold text-base flex items-center justify-center text-white shadow-sm shrink-0"
                  style={{ backgroundColor: currentInspector.customization?.theme_color || '#0F5C3A' }}
                >
                  {currentInspector.shop_name[0]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-serif text-lg font-bold tracking-tight">
                      {currentInspector.shop_name}
                    </h2>
                    <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-emerald-300 font-mono">
                      {currentInspector.stall_number}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        currentInspector.status === 'active'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {currentInspector.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400">
                    Master Aspect Control Suite • ID: {currentInspector.id}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Enter Ghost Masquerade Button */}
                <button
                  onClick={() => {
                    onEnterVendorDashboard(currentInspector);
                    setInspectingVendor(null);
                  }}
                  className="bg-[#0F5C3A] hover:bg-[#1A7A4F] text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                  title="Operate entire vendor portal as this stall owner"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Enter Stall Dashboard</span>
                </button>

                {/* View Live Shop */}
                <button
                  onClick={() => {
                    onViewLiveShop(currentInspector.slug);
                    setInspectingVendor(null);
                  }}
                  className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-xl border border-white/20 flex items-center gap-1.5 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Live Shop</span>
                </button>

                <button
                  onClick={() => setInspectingVendor(null)}
                  className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors ml-2"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Aspect Navigation Tabs */}
            <div className="bg-gray-50 border-b border-gray-200 px-5 flex gap-1 sm:gap-2 overflow-x-auto shrink-0 text-xs font-bold text-gray-600">
              <button
                onClick={() => setActiveAspectTab('identity')}
                className={`py-3 px-3 border-b-2 flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap ${
                  activeAspectTab === 'identity'
                    ? 'border-[#0F5C3A] text-[#0F5C3A] font-bold'
                    : 'border-transparent hover:text-gray-900'
                }`}
              >
                <Store className="w-3.5 h-3.5" />
                <span>1. Identity & Stall</span>
              </button>

              <button
                onClick={() => setActiveAspectTab('contact')}
                className={`py-3 px-3 border-b-2 flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap ${
                  activeAspectTab === 'contact'
                    ? 'border-[#0F5C3A] text-[#0F5C3A] font-bold'
                    : 'border-transparent hover:text-gray-900'
                }`}
              >
                <Phone className="w-3.5 h-3.5" />
                <span>2. Contact & Leads</span>
              </button>

              <button
                onClick={() => setActiveAspectTab('products')}
                className={`py-3 px-3 border-b-2 flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap ${
                  activeAspectTab === 'products'
                    ? 'border-[#0F5C3A] text-[#0F5C3A] font-bold'
                    : 'border-transparent hover:text-gray-900'
                }`}
              >
                <Package className="w-3.5 h-3.5" />
                <span>3. Products ({currentInspector.products?.length || 0})</span>
              </button>

              <button
                onClick={() => setActiveAspectTab('catalogues')}
                className={`py-3 px-3 border-b-2 flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap ${
                  activeAspectTab === 'catalogues'
                    ? 'border-[#0F5C3A] text-[#0F5C3A] font-bold'
                    : 'border-transparent hover:text-gray-900'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>4. Lookbooks ({currentInspector.catalogues?.length || 0})</span>
              </button>

              <button
                onClick={() => setActiveAspectTab('theme')}
                className={`py-3 px-3 border-b-2 flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap ${
                  activeAspectTab === 'theme'
                    ? 'border-[#0F5C3A] text-[#0F5C3A] font-bold'
                    : 'border-transparent hover:text-gray-900'
                }`}
              >
                <Palette className="w-3.5 h-3.5" />
                <span>5. Theme & Layout</span>
              </button>

              <button
                onClick={() => setActiveAspectTab('stats')}
                className={`py-3 px-3 border-b-2 flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap ${
                  activeAspectTab === 'stats'
                    ? 'border-[#0F5C3A] text-[#0F5C3A] font-bold'
                    : 'border-transparent hover:text-gray-900'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>6. Stats & Tuning</span>
              </button>

              <button
                onClick={() => setActiveAspectTab('subscription')}
                className={`py-3 px-3 border-b-2 flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap ${
                  activeAspectTab === 'subscription'
                    ? 'border-[#0F5C3A] text-[#0F5C3A] font-bold'
                    : 'border-transparent hover:text-gray-900'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>7. Subscription Tier</span>
              </button>

              <button
                onClick={() => setActiveAspectTab('payments')}
                className={`py-3 px-3 border-b-2 flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap ${
                  activeAspectTab === 'payments'
                    ? 'border-[#0F5C3A] text-[#0F5C3A] font-bold'
                    : 'border-transparent hover:text-gray-900'
                }`}
              >
                <Wallet className="w-3.5 h-3.5 text-emerald-600" />
                <span>8. Payments & Gateways</span>
              </button>
            </div>

            {/* Modal Body: Active Aspect Content */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {/* ========================================================= */}
              {/* ASPECT 1: IDENTITY & STALL ALLOCATION                    */}
              {/* ========================================================= */}
              {activeAspectTab === 'identity' && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">Stall Identity & Platform Allocation</h3>
                      <p className="text-xs text-gray-500">Edit business name, physical stall allocation, market hall, and status flags.</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={async () => {
                          const newStatus = currentInspector.status === 'active' ? 'suspended' : 'active';
                          await onUpdateVendor(currentInspector.id, { status: newStatus });
                          notify(`Stall status set to ${newStatus}`);
                        }}
                        className={`text-xs font-bold px-3 py-1.5 rounded-xl border ${
                          currentInspector.status === 'active'
                            ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                            : 'bg-emerald-50 text-[#0F5C3A] border-emerald-200 hover:bg-emerald-100'
                        }`}
                      >
                        {currentInspector.status === 'active' ? 'Suspend Stall' : 'Activate Stall'}
                      </button>

                      <button
                        onClick={async () => {
                          if (window.confirm(`Permanently remove ${currentInspector.shop_name} from Azam Market?`)) {
                            await onDeleteVendor(currentInspector.id);
                            setInspectingVendor(null);
                            notify('Stall removed permanently');
                          }
                        }}
                        className="text-xs font-bold px-3 py-1.5 rounded-xl bg-gray-100 text-red-600 hover:bg-red-50 border border-gray-200"
                      >
                        Delete Stall
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="font-bold text-gray-700 block mb-1">Shop / Business Name</label>
                      <input
                        type="text"
                        defaultValue={currentInspector.shop_name}
                        onBlur={async (e) => {
                          if (e.target.value !== currentInspector.shop_name) {
                            await onUpdateVendor(currentInspector.id, { shop_name: e.target.value });
                            notify('Shop name updated');
                          }
                        }}
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-900 focus:bg-white focus:ring-1 focus:ring-[#0F5C3A]"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-gray-700 block mb-1">Physical Stall Allocation</label>
                      <input
                        type="text"
                        defaultValue={currentInspector.stall_number}
                        onBlur={async (e) => {
                          if (e.target.value !== currentInspector.stall_number) {
                            await onUpdateVendor(currentInspector.id, { stall_number: e.target.value });
                            notify('Stall number updated');
                          }
                        }}
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-900 focus:bg-white focus:ring-1 focus:ring-[#0F5C3A]"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-gray-700 block mb-1">Market & Hall Placement</label>
                      <select
                        value={currentInspector.market_id}
                        onChange={async (e) => {
                          await onUpdateVendor(currentInspector.id, { market_id: e.target.value });
                          notify('Market location updated');
                        }}
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-900 focus:bg-white focus:ring-1 focus:ring-[#0F5C3A]"
                      >
                        {markets.map(m => (
                          <option key={m.id} value={m.id}>{m.name} ({m.city})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-gray-700 block mb-1">Public URL Slug</label>
                      <input
                        type="text"
                        defaultValue={currentInspector.slug}
                        onBlur={async (e) => {
                          if (e.target.value !== currentInspector.slug) {
                            await onUpdateVendor(currentInspector.id, { slug: e.target.value });
                            notify('URL slug updated');
                          }
                        }}
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-900 font-mono focus:bg-white focus:ring-1 focus:ring-[#0F5C3A]"
                      />
                    </div>
                  </div>

                  {/* Badges and Verification Flags */}
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-3 text-xs">
                    <div className="font-bold text-gray-900">Market Trust & Placement Flags</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <label className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200 cursor-pointer">
                        <div className="flex items-center gap-2">
                          <Award className="w-4 h-4 text-[#C9952A]" />
                          <div>
                            <div className="font-bold text-gray-900">Verified Trade Stall Badge</div>
                            <div className="text-[11px] text-gray-500">Displays golden verified badge across directory</div>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={currentInspector.is_verified}
                          onChange={async (e) => {
                            await onUpdateVendor(currentInspector.id, { is_verified: e.target.checked });
                            notify(`Verified badge ${e.target.checked ? 'granted' : 'removed'}`);
                          }}
                          className="w-4 h-4 text-[#0F5C3A] rounded-sm"
                        />
                      </label>

                      <label className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200 cursor-pointer">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-amber-500" />
                          <div>
                            <div className="font-bold text-gray-900">Featured Homepage Placement</div>
                            <div className="text-[11px] text-gray-500">Pinnable to top premium carousel</div>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={currentInspector.is_featured}
                          onChange={async (e) => {
                            await onUpdateVendor(currentInspector.id, { is_featured: e.target.checked });
                            notify(`Featured status ${e.target.checked ? 'enabled' : 'disabled'}`);
                          }}
                          className="w-4 h-4 text-[#0F5C3A] rounded-sm"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Description Box */}
                  <div>
                    <label className="font-bold text-gray-700 block mb-1 text-xs">Stall Bio & Trade Specialization</label>
                    <textarea
                      rows={3}
                      defaultValue={currentInspector.description}
                      onBlur={async (e) => {
                        if (e.target.value !== currentInspector.description) {
                          await onUpdateVendor(currentInspector.id, { description: e.target.value });
                          notify('Description updated');
                        }
                      }}
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:ring-1 focus:ring-[#0F5C3A]"
                    />
                  </div>

                  {/* Stall Branding & Image Uploads */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-gray-200">
                    <div>
                      <ImageUploader
                        aspect="logo"
                        label="Stall Logo / Profile Icon"
                        description="Appears in search results, stall header, and verified badges."
                        value={currentInspector.logo_url}
                        onChange={async (newUrl) => {
                          await onUpdateVendor(currentInspector.id, { logo_url: newUrl });
                          notify('Stall logo updated');
                        }}
                      />
                    </div>

                    <div>
                      <ImageUploader
                        aspect="cover"
                        label="Hero Cover Banner"
                        description="Wide banner displayed on the stall's showcase page."
                        value={currentInspector.cover_image_url}
                        onChange={async (newUrl) => {
                          await onUpdateVendor(currentInspector.id, { cover_image_url: newUrl });
                          notify('Cover banner updated');
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* ASPECT 2: CONTACT & LEAD CHANNELS                        */}
              {/* ========================================================= */}
              {activeAspectTab === 'contact' && (
                <div className="space-y-5">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">Contact & Buyer Lead Ingestion</h3>
                    <p className="text-xs text-gray-500">Control phone, WhatsApp chat numbers, email alerts, and default greeting messages.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="font-bold text-gray-700 block mb-1 flex items-center gap-1.5">
                        <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
                        <span>Official WhatsApp Number</span>
                      </label>
                      <input
                        type="text"
                        defaultValue={currentInspector.whatsapp}
                        onBlur={async (e) => {
                          if (e.target.value !== currentInspector.whatsapp) {
                            await onUpdateVendor(currentInspector.id, { whatsapp: e.target.value });
                            notify('WhatsApp number updated');
                          }
                        }}
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-900 focus:bg-white"
                      />
                      <span className="text-[10px] text-gray-400">Include Pakistan country code (e.g. +92 300 1234567)</span>
                    </div>

                    <div>
                      <label className="font-bold text-gray-700 block mb-1 flex items-center gap-1.5">
                        <PhoneCall className="w-3.5 h-3.5 text-blue-600" />
                        <span>Direct Telephone / Mobile</span>
                      </label>
                      <input
                        type="text"
                        defaultValue={currentInspector.customization?.phone_button?.phone_number || currentInspector.whatsapp}
                        onBlur={async (e) => {
                          const updatedCust = {
                            ...(currentInspector.customization || {}),
                            phone_button: {
                              ...(currentInspector.customization?.phone_button || {
                                enabled: true,
                                custom_label: 'Call Stall Direct',
                                show_in_header: true,
                                show_in_sticky_bar: true,
                              }),
                              phone_number: e.target.value,
                            },
                          };
                          await onUpdateVendor(currentInspector.id, { customization: updatedCust as ShopCustomization });
                          notify('Direct phone updated');
                        }}
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-900 focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-gray-700 block mb-1">Notification Email</label>
                      <input
                        type="email"
                        defaultValue={currentInspector.email}
                        onBlur={async (e) => {
                          if (e.target.value !== currentInspector.email) {
                            await onUpdateVendor(currentInspector.id, { email: e.target.value });
                            notify('Email updated');
                          }
                        }}
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-900 focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-gray-700 block mb-1">WhatsApp Pre-filled Greeting Message</label>
                      <input
                        type="text"
                        defaultValue={currentInspector.customization?.whatsapp_button?.welcome_message}
                        onBlur={async (e) => {
                          const updatedCust = {
                            ...(currentInspector.customization || {}),
                            whatsapp_button: {
                              ...(currentInspector.customization?.whatsapp_button || {
                                enabled: true,
                                custom_label: 'Chat on WhatsApp',
                                show_floating_badge: true,
                                online_status_text: 'Online • Fast Reply',
                              }),
                              welcome_message: e.target.value,
                            },
                          };
                          await onUpdateVendor(currentInspector.id, { customization: updatedCust as ShopCustomization });
                          notify('WhatsApp welcome message updated');
                        }}
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-900 focus:bg-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* ASPECT 3: PRODUCT INVENTORY & PRICING                    */}
              {/* ========================================================= */}
              {activeAspectTab === 'products' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">
                        Product Catalog & Roll Samples ({currentInspector.products?.length || 0})
                      </h3>
                      <p className="text-xs text-gray-500">
                        View, add, edit pricing, or remove fabric rolls and designs for this stall.
                      </p>
                    </div>

                    <button
                      onClick={() => setShowAddProductModal(true)}
                      className="bg-[#0F5C3A] hover:bg-[#1A7A4F] text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Product as Admin</span>
                    </button>
                  </div>

                  {/* Add Product Inline Modal */}
                  {showAddProductModal && (
                    <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200 space-y-3 text-xs">
                      <div className="font-bold text-emerald-900 flex items-center justify-between">
                        <span>New Fabric Listing</span>
                        <button onClick={() => setShowAddProductModal(false)} className="text-gray-500 hover:text-gray-800">
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                        <div>
                          <label className="font-bold text-gray-700 block mb-1">Product Title</label>
                          <input
                            type="text"
                            placeholder="e.g. Swiss Lawn Embroidered"
                            value={newProductName}
                            onChange={(e) => setNewProductName(e.target.value)}
                            className="w-full p-2 bg-white border border-gray-200 rounded-lg"
                          />
                        </div>

                        <div>
                          <label className="font-bold text-gray-700 block mb-1">Fabric Category</label>
                          <select
                            value={showCustomStallFabric ? '__other__' : newProductFabric}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === '__other__') {
                                setShowCustomStallFabric(true);
                                setNewProductFabric('');
                              } else {
                                setShowCustomStallFabric(false);
                                setNewProductFabric(val);
                              }
                            }}
                            className="w-full p-2 bg-white border border-gray-200 rounded-lg"
                          >
                            <option value="" disabled>Select a type</option>
                            {FABRIC_TYPES.map((f) => (
                              <option key={f.slug} value={f.name}>{f.name}</option>
                            ))}
                            <option value="__other__">Other (type your own)</option>
                          </select>
                          {showCustomStallFabric && (
                            <input
                              type="text"
                              placeholder="e.g. Lawn, Khaddar, Silk"
                              value={newProductFabric}
                              onChange={(e) => setNewProductFabric(e.target.value)}
                              className="w-full mt-2 p-2 bg-white border border-gray-200 rounded-lg"
                            />
                          )}
                        </div>

                        <div>
                          <label className="font-bold text-gray-700 block mb-1">Wholesale Price</label>
                          <input
                            type="text"
                            placeholder="e.g. ₨850–1,200/m"
                            value={newProductPrice}
                            onChange={(e) => setNewProductPrice(e.target.value)}
                            className="w-full p-2 bg-white border border-gray-200 rounded-lg"
                          />
                        </div>

                        <div>
                          <label className="font-bold text-gray-700 block mb-1">Minimum Order (MOQ)</label>
                          <input
                            type="text"
                            placeholder="e.g. 50 metres"
                            value={newProductMoq}
                            onChange={(e) => setNewProductMoq(e.target.value)}
                            className="w-full p-2 bg-white border border-gray-200 rounded-lg"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          onClick={() => setShowAddProductModal(false)}
                          className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 font-bold"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={async () => {
                            if (!newProductName.trim()) {
                              alert('Please provide product name');
                              return;
                            }
                            try {
                              const res = await fetch(`/api/vendors/${currentInspector.id}/products`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  name: newProductName,
                                  fabric_type: newProductFabric,
                                  price_range: newProductPrice,
                                  moq: newProductMoq,
                                  image_url: newProductImage,
                                }),
                              });
                              if (res.ok) {
                                notify('Product created for stall');
                                setShowAddProductModal(false);
                                onRefreshData();
                              }
                            } catch (e) {
                              console.error(e);
                            }
                          }}
                          className="px-4 py-1.5 rounded-lg bg-[#0F5C3A] text-white font-bold"
                        >
                          Save Product
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Products Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {currentInspector.products?.map((prod) => (
                      <div key={prod.id} className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex gap-3 text-xs">
                        <img
                          src={prod.image_url}
                          alt={prod.name}
                          className="w-16 h-16 rounded-lg object-cover border border-gray-200 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="font-bold text-gray-900 truncate" title={prod.name}>
                            {prod.name}
                          </div>
                          <div className="text-[10px] text-gray-500">{prod.fabric_type}</div>
                          <div className="text-[#0F5C3A] font-bold text-[11px]">{prod.price_range}</div>
                          <div className="text-[10px] text-gray-400">MOQ: {prod.moq}</div>
                        </div>

                        <button
                          onClick={async () => {
                            if (window.confirm(`Delete product ${prod.name}?`)) {
                              await fetch(`/api/products/${prod.id}`, { method: 'DELETE' });
                              notify('Product deleted');
                              onRefreshData();
                            }
                          }}
                          className="text-gray-400 hover:text-red-600 p-1 self-start"
                          title="Delete Product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* ASPECT 4: PDF LOOKBOOKS & CATALOGUES                     */}
              {/* ========================================================= */}
              {activeAspectTab === 'catalogues' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">
                        Wholesale PDF Lookbooks & Swatch Books ({currentInspector.catalogues?.length || 0})
                      </h3>
                      <p className="text-xs text-gray-500">
                        Manage downloadable seasonal lookbooks with download tracking and specs.
                      </p>
                    </div>

                    <button
                      onClick={() => setShowAddCatalogueModal(true)}
                      className="bg-[#0F5C3A] hover:bg-[#1A7A4F] text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Upload Lookbook</span>
                    </button>
                  </div>

                  {/* Add Lookbook Inline Modal */}
                  {showAddCatalogueModal && (
                    <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200 space-y-3 text-xs">
                      <div className="font-bold text-emerald-900 flex items-center justify-between">
                        <span>New Lookbook / Swatch Catalog</span>
                        <button onClick={() => setShowAddCatalogueModal(false)} className="text-gray-500 hover:text-gray-800">
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="font-bold text-gray-700 block mb-1">Catalog Title</label>
                          <input
                            type="text"
                            placeholder="e.g. Lawn Volume 1 Summer 2026"
                            value={newCatTitle}
                            onChange={(e) => setNewCatTitle(e.target.value)}
                            className="w-full p-2 bg-white border border-gray-200 rounded-lg"
                          />
                        </div>

                        <div>
                          <label className="font-bold text-gray-700 block mb-1">Season / Year</label>
                          <input
                            type="text"
                            placeholder="e.g. Summer 2026"
                            value={newCatSeason}
                            onChange={(e) => setNewCatSeason(e.target.value)}
                            className="w-full p-2 bg-white border border-gray-200 rounded-lg"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          onClick={() => setShowAddCatalogueModal(false)}
                          className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 font-bold"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={async () => {
                            if (!newCatTitle.trim()) {
                              alert('Please provide catalogue title');
                              return;
                            }
                            try {
                              const res = await fetch(`/api/vendors/${currentInspector.id}/catalogues`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  title: newCatTitle,
                                  season: newCatSeason,
                                  description: newCatDescription,
                                  file_size_mb: 4.8,
                                }),
                              });
                              if (res.ok) {
                                notify('Catalogue uploaded for stall');
                                setShowAddCatalogueModal(false);
                                onRefreshData();
                              }
                            } catch (e) {
                              console.error(e);
                            }
                          }}
                          className="px-4 py-1.5 rounded-lg bg-[#0F5C3A] text-white font-bold"
                        >
                          Save Lookbook
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Catalogues List */}
                  <div className="space-y-2">
                    {currentInspector.catalogues?.map((cat) => (
                      <div key={cat.id} className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-red-100 text-red-700 flex items-center justify-center font-bold text-xs">
                            PDF
                          </div>
                          <div>
                            <div className="font-bold text-gray-900">{cat.title}</div>
                            <div className="text-[10px] text-gray-500">
                              {cat.season} • {cat.file_size_mb} MB • {cat.download_count || 0} Downloads
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <a
                            href={`/api/download/${cat.id}`}
                            target="_blank"
                            rel="noreferrer"
                            className="bg-white hover:bg-gray-100 text-gray-800 text-[11px] font-bold px-2.5 py-1 rounded-lg border border-gray-200 flex items-center gap-1"
                          >
                            <Download className="w-3 h-3 text-[#0F5C3A]" />
                            <span>Preview</span>
                          </a>

                          <button
                            onClick={async () => {
                              if (window.confirm(`Delete lookbook ${cat.title}?`)) {
                                await fetch(`/api/catalogues/${cat.id}`, { method: 'DELETE' });
                                notify('Lookbook deleted');
                                onRefreshData();
                              }
                            }}
                            className="p-1 text-gray-400 hover:text-red-600"
                            title="Delete Lookbook"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* ASPECT 5: STOREFRONT THEME & LAYOUT                      */}
              {/* ========================================================= */}
              {activeAspectTab === 'theme' && (
                <div className="space-y-4 text-xs">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">Storefront Design & Brand Colors</h3>
                    <p className="text-xs text-gray-500">
                      Configure stall branding, primary palette, header layout, and announcement banner text.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <label className="font-bold text-gray-700 block mb-1">Primary Brand Hex</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={currentInspector.customization?.theme_color || '#0F5C3A'}
                          onChange={async (e) => {
                            const val = e.target.value;
                            await onUpdateVendor(currentInspector.id, {
                              customization: {
                                ...(currentInspector.customization || {}),
                                theme_color: val,
                              } as ShopCustomization,
                            });
                          }}
                          className="w-10 h-10 rounded-lg cursor-pointer border border-gray-300"
                        />
                        <input
                          type="text"
                          value={currentInspector.customization?.theme_color || '#0F5C3A'}
                          readOnly
                          className="w-24 p-2 bg-gray-50 border border-gray-200 rounded-lg font-mono font-bold"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="font-bold text-gray-700 block mb-1">Accent Gold Hex</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={currentInspector.customization?.accent_color || '#C9952A'}
                          onChange={async (e) => {
                            const val = e.target.value;
                            await onUpdateVendor(currentInspector.id, {
                              customization: {
                                ...(currentInspector.customization || {}),
                                accent_color: val,
                              } as ShopCustomization,
                            });
                          }}
                          className="w-10 h-10 rounded-lg cursor-pointer border border-gray-300"
                        />
                        <input
                          type="text"
                          value={currentInspector.customization?.accent_color || '#C9952A'}
                          readOnly
                          className="w-24 p-2 bg-gray-50 border border-gray-200 rounded-lg font-mono font-bold"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="font-bold text-gray-700 block mb-1">Header Style</label>
                      <select
                        value={currentInspector.customization?.header_layout || 'standard'}
                        onChange={async (e) => {
                          await onUpdateVendor(currentInspector.id, {
                            customization: {
                              ...(currentInspector.customization || {}),
                              header_layout: e.target.value as any,
                            } as ShopCustomization,
                          });
                          notify('Header style updated');
                        }}
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                      >
                        <option value="standard">Standard Classic</option>
                        <option value="centered">Centered Prestige</option>
                        <option value="compact">Compact Dense</option>
                        <option value="split_contact">Split Contact Focused</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Top Announcement Marquee</label>
                    <input
                      type="text"
                      defaultValue={currentInspector.customization?.announcement_text}
                      onBlur={async (e) => {
                        await onUpdateVendor(currentInspector.id, {
                          customization: {
                            ...(currentInspector.customization || {}),
                            show_announcement: true,
                            announcement_text: e.target.value,
                          } as ShopCustomization,
                        });
                        notify('Announcement banner updated');
                      }}
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-medium"
                    />
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* ASPECT 6: STATS & ENGAGEMENT TUNING                      */}
              {/* ========================================================= */}
              {activeAspectTab === 'stats' && (
                <div className="space-y-4 text-xs">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">Stall Engagement Numbers & Calibrator</h3>
                    <p className="text-xs text-gray-500">
                      Audit and calibrate engagement metrics (Shop views, WhatsApp inquiries, telephone calls, and messages).
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                      <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Shop Profile Views</label>
                      <input
                        type="number"
                        defaultValue={currentInspector.profile_views || 0}
                        onBlur={async (e) => {
                          await onUpdateVendor(currentInspector.id, { profile_views: parseInt(e.target.value) || 0 });
                          notify('Views calibrated');
                        }}
                        className="w-full p-2 bg-white border border-gray-200 rounded-lg font-bold font-serif text-sm"
                      />
                    </div>

                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                      <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">WhatsApp Inquiries</label>
                      <input
                        type="number"
                        defaultValue={currentInspector.whatsapp_clicks || 0}
                        onBlur={async (e) => {
                          await onUpdateVendor(currentInspector.id, { whatsapp_clicks: parseInt(e.target.value) || 0 });
                          notify('WhatsApp count calibrated');
                        }}
                        className="w-full p-2 bg-white border border-gray-200 rounded-lg font-bold font-serif text-sm text-[#25D366]"
                      />
                    </div>

                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                      <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Direct Stall Calls</label>
                      <input
                        type="number"
                        defaultValue={currentInspector.call_clicks || Math.round((currentInspector.whatsapp_clicks || 0) * 0.45)}
                        onBlur={async (e) => {
                          await onUpdateVendor(currentInspector.id, { call_clicks: parseInt(e.target.value) || 0 });
                          notify('Call count calibrated');
                        }}
                        className="w-full p-2 bg-white border border-gray-200 rounded-lg font-bold font-serif text-sm text-blue-600"
                      />
                    </div>

                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                      <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Form & Direct Messages</label>
                      <input
                        type="number"
                        defaultValue={currentInspector.message_clicks || currentInspector.email_clicks || 0}
                        onBlur={async (e) => {
                          await onUpdateVendor(currentInspector.id, { message_clicks: parseInt(e.target.value) || 0 });
                          notify('Messages calibrated');
                        }}
                        className="w-full p-2 bg-white border border-gray-200 rounded-lg font-bold font-serif text-sm text-purple-600"
                      />
                    </div>
                  </div>

                  {/* Public Stats Display Switch */}
                  <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-emerald-950">Show Stats Bar on Public Storefront</div>
                      <div className="text-[11px] text-emerald-800">
                        Renders the verified engagement counter underneath the stall header
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={currentInspector.customization?.show_stats !== false}
                      onChange={async (e) => {
                        await onUpdateVendor(currentInspector.id, {
                          customization: {
                            ...(currentInspector.customization || {}),
                            show_stats: e.target.checked,
                          } as ShopCustomization,
                        });
                        notify(`Stats bar ${e.target.checked ? 'visible' : 'hidden'}`);
                      }}
                      className="w-5 h-5 text-[#0F5C3A] rounded-sm"
                    />
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* ASPECT 7: SUBSCRIPTION TIER & BILLING                    */}
              {/* ========================================================= */}
              {activeAspectTab === 'subscription' && (
                <div className="space-y-4 text-xs">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">Subscription Tier & Platform Privileges</h3>
                    <p className="text-xs text-gray-500">
                      Assign membership tier, check MRR contributions, and manage platform quotas.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {tiers.map((t) => {
                      const isCurrent = currentInspector.tier_id === t.id;
                      return (
                        <div
                          key={t.id}
                          className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                            isCurrent
                              ? 'bg-emerald-50/50 border-[#0F5C3A] ring-2 ring-[#0F5C3A]/20'
                              : 'bg-white border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={async () => {
                            if (!isCurrent) {
                              await onUpdateVendor(currentInspector.id, { tier_id: t.id });
                              notify(`Stall upgraded to ${t.display_name}`);
                            }
                          }}
                        >
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-gray-900 text-sm">{t.display_name}</span>
                              {isCurrent && (
                                <span className="bg-[#0F5C3A] text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                                  Current
                                </span>
                              )}
                            </div>
                            <div className="font-serif text-lg font-bold text-[#0F5C3A] mt-2">
                              ${t.price_usd.toLocaleString()}
                              <span className="text-[10px] text-gray-500 font-sans"> / mo</span>
                            </div>

                            <ul className="mt-3 space-y-1 text-[11px] text-gray-600">
                              <li>• Products: {t.max_products === -1 ? 'Unlimited' : t.max_products}</li>
                              <li>• Lookbooks: {t.max_catalogues === -1 ? 'Unlimited' : t.max_catalogues}</li>
                              <li>• Analytics: {t.has_analytics ? 'Enabled' : 'Disabled'}</li>
                              <li>• Verified Badge: {t.has_verified_badge ? 'Included' : 'No'}</li>
                            </ul>
                          </div>

                          <button
                            className={`mt-4 w-full py-1.5 rounded-xl font-bold text-xs ${
                              isCurrent ? 'bg-[#0F5C3A] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {isCurrent ? 'Active Plan' : 'Select Plan'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* ASPECT 8: PAYMENTS, GATEWAYS & SETTLEMENT RAILS          */}
              {/* ========================================================= */}
              {activeAspectTab === 'payments' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-linear-to-r from-emerald-900 to-teal-900 text-white p-4 rounded-2xl shadow-sm">
                    <div>
                      <h3 className="text-sm font-bold flex items-center gap-2">
                        <Wallet className="w-4 h-4 text-emerald-400" />
                        Wholesale Payment Settlement & Digital Gateways
                      </h3>
                      <p className="text-xs text-white/80 mt-0.5">
                        Configure Pakistani payment gateways (JazzCash, PayFast 1Link, Keenu) and global Stripe checkout for this stall.
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setAdminPaymentPurpose('sample_booking_deposit');
                        setAdminPaymentAmount(10000);
                        setShowAdminPaymentModal(true);
                      }}
                      className="bg-[#C9952A] hover:bg-[#b58320] text-gray-900 text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-md cursor-pointer shrink-0"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Test Checkout Gateway</span>
                    </button>
                  </div>

                  {/* Supported Payment Gateways Status */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="p-3.5 rounded-xl border border-red-200 bg-red-50/50 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-red-900">JazzCash</span>
                        <span className="text-[10px] bg-red-600 text-white font-bold px-2 py-0.5 rounded-full">ACTIVE</span>
                      </div>
                      <p className="text-[11px] text-red-700">Direct mobile wallet debits & OTC payments via 100k+ agents.</p>
                      <div className="text-[10px] text-gray-500 font-mono">Channel: 0300-JazzCash</div>
                    </div>

                    <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/50 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-blue-900">PayFast (1Link)</span>
                        <span className="text-[10px] bg-blue-600 text-white font-bold px-2 py-0.5 rounded-full">ACTIVE</span>
                      </div>
                      <p className="text-[11px] text-blue-700">Bank accounts across Pakistan with 1Link interbank clearing.</p>
                      <div className="text-[10px] text-gray-500 font-mono">1Link Direct Debit</div>
                    </div>

                    <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/50 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-900">Keenu NetConnect</span>
                        <span className="text-[10px] bg-amber-600 text-white font-bold px-2 py-0.5 rounded-full">ACTIVE</span>
                      </div>
                      <p className="text-[11px] text-amber-700">Pakistani debit cards, PayPak, and Keenu digital wallets.</p>
                      <div className="text-[10px] text-gray-500 font-mono">Terminal: POS NetConnect</div>
                    </div>

                    <div className="p-3.5 rounded-xl border border-purple-200 bg-purple-50/50 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-purple-900">Stripe Global</span>
                        <span className="text-[10px] bg-purple-600 text-white font-bold px-2 py-0.5 rounded-full">ACTIVE</span>
                      </div>
                      <p className="text-[11px] text-purple-700">Visa, Mastercard & American Express for diaspora buyers.</p>
                      <div className="text-[10px] text-gray-500 font-mono">Currency: PKR / USD</div>
                    </div>
                  </div>

                  {/* Bank & Wallet Account Fields */}
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-4 text-xs">
                    <h4 className="font-bold text-gray-900 flex items-center gap-1.5">
                      <Building className="w-4 h-4 text-[#0F5C3A]" />
                      Stall Bank & Mobile Wallet Allocation
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="font-bold text-gray-700 block mb-1">Settlement Bank Name</label>
                        <input
                          type="text"
                          defaultValue={currentInspector.customization?.bank_details?.bank_name || 'Meezan Bank Ltd (Circular Road Branch)'}
                          onBlur={async (e) => {
                            const newBank = e.target.value;
                            const prevCust = currentInspector.customization || {};
                            await onUpdateVendor(currentInspector.id, {
                              customization: {
                                ...prevCust,
                                bank_details: {
                                  ...prevCust.bank_details,
                                  bank_name: newBank,
                                },
                              },
                            });
                            notify('Bank name updated');
                          }}
                          className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-gray-900 focus:ring-1 focus:ring-[#0F5C3A]"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-gray-700 block mb-1">Account Title</label>
                        <input
                          type="text"
                          defaultValue={currentInspector.customization?.bank_details?.account_title || currentInspector.shop_name}
                          onBlur={async (e) => {
                            const newTitle = e.target.value;
                            const prevCust = currentInspector.customization || {};
                            await onUpdateVendor(currentInspector.id, {
                              customization: {
                                ...prevCust,
                                bank_details: {
                                  ...prevCust.bank_details,
                                  account_title: newTitle,
                                },
                              },
                            });
                            notify('Account title updated');
                          }}
                          className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-gray-900 focus:ring-1 focus:ring-[#0F5C3A]"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-gray-700 block mb-1">IBAN Number (24 Characters)</label>
                        <input
                          type="text"
                          defaultValue={currentInspector.customization?.bank_details?.iban || 'PK36MEZN0001234567890123'}
                          onBlur={async (e) => {
                            const newIban = e.target.value;
                            const prevCust = currentInspector.customization || {};
                            await onUpdateVendor(currentInspector.id, {
                              customization: {
                                ...prevCust,
                                bank_details: {
                                  ...prevCust.bank_details,
                                  iban: newIban,
                                },
                              },
                            });
                            notify('IBAN number updated');
                          }}
                          className="w-full p-2.5 bg-white border border-gray-200 rounded-xl font-mono text-gray-900 focus:ring-1 focus:ring-[#0F5C3A]"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-gray-700 block mb-1">JazzCash Merchant / Wallet Number</label>
                        <input
                          type="text"
                          defaultValue={currentInspector.customization?.bank_details?.jazzcash_no || currentInspector.whatsapp}
                          onBlur={async (e) => {
                            const newJc = e.target.value;
                            const prevCust = currentInspector.customization || {};
                            await onUpdateVendor(currentInspector.id, {
                              customization: {
                                ...prevCust,
                                bank_details: {
                                  ...prevCust.bank_details,
                                  jazzcash_no: newJc,
                                },
                              },
                            });
                            notify('JazzCash number updated');
                          }}
                          className="w-full p-2.5 bg-white border border-gray-200 rounded-xl font-mono text-gray-900 focus:ring-1 focus:ring-[#0F5C3A]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between shrink-0 text-xs">
              <span className="text-gray-500">
                All changes to stall aspects persist instantly to the master database.
              </span>
              <button
                onClick={() => setInspectingVendor(null)}
                className="bg-gray-900 text-white font-bold px-4 py-2 rounded-xl hover:bg-black cursor-pointer"
              >
                Close Controller
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. BULK ACTION MODAL DIALOG                                              */}
      {/* ========================================================================= */}
      {showBulkActionModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl border border-gray-200 shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="p-5 bg-gray-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-[#C9952A]" />
                <h3 className="font-serif text-base font-bold">
                  Execute Bulk Action on {selectedVendorIds.length} Stalls
                </h3>
              </div>
              <button onClick={() => setShowBulkActionModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Choose Operation</label>
                <select
                  value={bulkActionType}
                  onChange={(e) => setBulkActionType(e.target.value as any)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold"
                >
                  <option value="verify">Grant Verified Trade Badge</option>
                  <option value="unverify">Revoke Verified Trade Badge</option>
                  <option value="feature">Promote to Featured Placement</option>
                  <option value="activate">Set Status: Active</option>
                  <option value="suspend">Set Status: Suspended</option>
                  <option value="set_tier">Migrate to Specific Subscription Tier</option>
                  <option value="broadcast_announcement">Broadcast Announcement Banner to All</option>
                </select>
              </div>

              {bulkActionType === 'set_tier' && (
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Target Subscription Tier</label>
                  <select
                    value={bulkTargetTier}
                    onChange={(e) => setBulkTargetTier(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold"
                  >
                    {tiers.map(t => (
                      <option key={t.id} value={t.id}>{t.display_name} (${t.price_usd.toLocaleString()}/mo)</option>
                    ))}
                  </select>
                </div>
              )}

              {bulkActionType === 'broadcast_announcement' && (
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Banner Announcement Text</label>
                  <textarea
                    rows={2}
                    value={bulkAnnouncementText}
                    onChange={(e) => setBulkAnnouncementText(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-medium"
                  />
                </div>
              )}

              <p className="text-[11px] text-gray-500 leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100">
                This action will be batched across the selected {selectedVendorIds.length} stall records instantly.
              </p>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-2 text-xs">
              <button
                onClick={() => setShowBulkActionModal(false)}
                className="px-4 py-2 rounded-xl border border-gray-200 font-bold text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteBulkAction}
                disabled={isProcessingBulk}
                className="px-4 py-2 rounded-xl bg-[#0F5C3A] text-white font-bold hover:bg-[#1A7A4F] flex items-center gap-1.5"
              >
                {isProcessingBulk ? 'Processing...' : 'Confirm & Execute'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Gateway Modal (JazzCash, PayFast, Keenu, Stripe) for Admin Control */}
      {currentInspector && (
        <PaymentCheckoutModal
          isOpen={showAdminPaymentModal}
          onClose={() => setShowAdminPaymentModal(false)}
          vendorId={currentInspector.id}
          vendorName={currentInspector.shop_name}
          purpose={adminPaymentPurpose}
          defaultAmountPkr={adminPaymentAmount}
          onPaymentSuccess={(tx) => {
            setShowAdminPaymentModal(false);
            notify(`Gateway settlement test successful! ₨${tx.amount_pkr.toLocaleString()} via ${tx.gateway.toUpperCase()}`);
          }}
        />
      )}
    </div>
  );
};
