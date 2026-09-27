import React from 'react';
import { LayoutDashboard, Store, Palette, ShoppingBag, FileText, BarChart3, ShieldCheck, LogOut, ArrowLeft, RefreshCw, Sparkles, Bell, LifeBuoy } from 'lucide-react';
import { Vendor } from '../../types';

interface VendorSidebarProps {
  vendors: Vendor[];
  activeVendor: Vendor;
  onSelectVendor: (vendor: Vendor) => void;
  activeTab: 'overview' | 'shop' | 'customize' | 'products' | 'catalogues' | 'analytics' | 'subscription' | 'updates';
  onSelectTab: (tab: 'overview' | 'shop' | 'customize' | 'products' | 'catalogues' | 'analytics' | 'subscription' | 'updates') => void;
  onExitToDirectory: () => void;
}

export const VendorSidebar: React.FC<VendorSidebarProps> = ({
  vendors,
  activeVendor,
  onSelectVendor,
  activeTab,
  onSelectTab,
  onExitToDirectory,
}) => {
  return (
    <aside className="w-64 bg-[#0F5C3A] text-white min-h-screen p-4 flex flex-col justify-between border-r border-emerald-900 shadow-xl">
      <div className="space-y-6">
        {/* Top Vendor Portal Header */}
        <div className="space-y-3 pb-4 border-b border-emerald-800">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#C9952A] bg-emerald-950/60 px-2 py-0.5 rounded-full border border-[#C9952A]/30">
              Vendor Portal
            </span>
            <button
              onClick={onExitToDirectory}
              className="text-xs text-emerald-200 hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Public Site
            </button>
          </div>

          {/* Active Vendor Switcher Dropdown */}
          <div className="bg-emerald-950/50 p-2.5 rounded-xl border border-emerald-700/50">
            <label className="text-[10px] text-emerald-300 font-semibold block uppercase mb-1">
              Active Vendor Shop:
            </label>
            <select
              value={activeVendor.id}
              onChange={(e) => {
                const found = vendors.find((v) => v.id === e.target.value);
                if (found) onSelectVendor(found);
              }}
              className="w-full bg-emerald-900 text-white text-xs font-bold rounded-lg px-2 py-1.5 border border-emerald-600 focus:outline-none focus:ring-1 focus:ring-[#C9952A] cursor-pointer"
            >
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.shop_name} ({v.tier?.display_name || 'Tier'})
                </option>
              ))}
            </select>
            <div className="text-[10px] text-emerald-300 mt-1 flex items-center justify-between">
              <span>Stall: {activeVendor.stall_number}</span>
              <span className="capitalize text-[#C9952A] font-bold">{activeVendor.status}</span>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-1 text-xs font-semibold">
          <button
            onClick={() => onSelectTab('overview')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-white text-[#0F5C3A] shadow-md font-bold'
                : 'text-emerald-100 hover:bg-emerald-800/60'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard Overview</span>
          </button>

          <button
            onClick={() => onSelectTab('shop')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'shop'
                ? 'bg-white text-[#0F5C3A] shadow-md font-bold'
                : 'text-emerald-100 hover:bg-emerald-800/60'
            }`}
          >
            <Store className="w-4 h-4" />
            <span>Edit Shop Profile</span>
          </button>

          <button
            onClick={() => onSelectTab('customize')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'customize'
                ? 'bg-white text-[#0F5C3A] shadow-md font-bold'
                : 'text-emerald-100 hover:bg-emerald-800/60'
            }`}
          >
            <div className="flex items-center gap-3">
              <Palette className="w-4 h-4 text-amber-400" />
              <span>Shop Customizer</span>
            </div>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#C9952A] text-white">
              Studio
            </span>
          </button>

          <button
            onClick={() => onSelectTab('products')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'products'
                ? 'bg-white text-[#0F5C3A] shadow-md font-bold'
                : 'text-emerald-100 hover:bg-emerald-800/60'
            }`}
          >
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-4 h-4" />
              <span>Products Catalog</span>
            </div>
            <span className="bg-emerald-900 text-white text-[10px] px-2 py-0.5 rounded-full">
              {activeVendor.products?.length || 0}
            </span>
          </button>

          <button
            onClick={() => onSelectTab('catalogues')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'catalogues'
                ? 'bg-white text-[#0F5C3A] shadow-md font-bold'
                : 'text-emerald-100 hover:bg-emerald-800/60'
            }`}
          >
            <div className="flex items-center gap-3">
              <FileText className="w-4 h-4" />
              <span>PDF Catalogues</span>
            </div>
            <span className="bg-[#C9952A] text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
              {activeVendor.catalogues?.length || 0}
            </span>
          </button>

          <button
            onClick={() => onSelectTab('analytics')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'analytics'
                ? 'bg-white text-[#0F5C3A] shadow-md font-bold'
                : 'text-emerald-100 hover:bg-emerald-800/60'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Inquiry Analytics</span>
          </button>

          <button
            onClick={() => onSelectTab('subscription')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'subscription'
                ? 'bg-white text-[#0F5C3A] shadow-md font-bold'
                : 'text-emerald-100 hover:bg-emerald-800/60'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-[#C9952A]" />
            <span>Subscription Tier</span>
          </button>

          <button
            onClick={() => onSelectTab('updates')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'updates'
                ? 'bg-white text-[#0F5C3A] shadow-md font-bold'
                : 'text-emerald-100 hover:bg-emerald-800/60'
            }`}
          >
            <div className="flex items-center gap-3">
              <Bell className="w-4 h-4 text-[#C9952A]" />
              <span>Updates & Assistance</span>
            </div>
            <span className="bg-[#C9952A] text-gray-900 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
              Hub
            </span>
          </button>
        </nav>
      </div>

      {/* Footer User Info */}
      <div className="pt-4 border-t border-emerald-800 space-y-2 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#C9952A] text-white font-bold flex items-center justify-center font-serif text-xs">
            {activeVendor.shop_name[0]}
          </div>
          <div className="overflow-hidden">
            <div className="font-bold text-white truncate">{activeVendor.shop_name}</div>
            <div className="text-[10px] text-emerald-300 truncate">{activeVendor.email}</div>
          </div>
        </div>
      </div>
    </aside>
  );
};
