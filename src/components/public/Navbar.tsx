import React, { useState } from 'react';
import { Search, ShieldCheck, Store, SlidersHorizontal, ChevronDown, Award, ArrowRight, Languages } from 'lucide-react';
import { Market } from '../../types';
import { useLanguage } from '../../lib/i18n';

interface NavbarProps {
  markets: Market[];
  currentMarket: string;
  onMarketChange: (slug: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  currentView: 'directory' | 'vendor_dashboard' | 'admin_dashboard' | 'vendor_shop';
  onNavigateView: (view: 'directory' | 'vendor_dashboard' | 'admin_dashboard') => void;
  onNavigateRegister: () => void;
  activeVendorSlug?: string;
  verifiedOnly: boolean;
  onToggleVerifiedOnly: () => void;
  onOpenCeoMemoir?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  markets,
  currentMarket,
  onMarketChange,
  searchQuery,
  onSearchChange,
  currentView,
  onNavigateView,
  onNavigateRegister,
  verifiedOnly,
  onToggleVerifiedOnly,
  onOpenCeoMemoir,
}) => {
  const [showMarketMenu, setShowMarketMenu] = useState(false);
  const activeMarketObj = markets.find(m => m.slug === currentMarket) || markets[0];
  const { lang, setLang, t } = useLanguage();

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-xs">
      {/* Top Banner */}
      <div className="bg-[#0F5C3A] text-white text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="bg-[#C9952A] text-gray-900 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              B2B Directory
            </span>
            <span className="hidden sm:inline">Direct Wholesale Contact with Verified Lahore Textile Mills & Stall Owners</span>
            <span className="sm:hidden">Lahore Wholesale Fabric Stalls</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-emerald-100">
            {onOpenCeoMemoir && (
              <button
                onClick={onOpenCeoMemoir}
                className="hover:text-white font-medium cursor-pointer text-[#C9952A]"
              >
                📜 About Aargard
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => onNavigateView('directory')}
            className="flex items-center gap-2.5 text-left cursor-pointer group"
          >
            <img
              src="/icon-192.png"
              alt="Azam Market Online"
              className="w-10 h-10 rounded-xl shadow-sm group-hover:opacity-90 transition-opacity"
            />
            <div>
              <span className="font-serif text-xl font-bold text-gray-900 tracking-tight block leading-tight">
                AZAM MARKET <span className="text-[#0F5C3A]">ONLINE</span>
              </span>
              <span className="text-[10px] uppercase font-semibold text-[#C9952A] tracking-wider block">
                Wholesale Fabric Directory
              </span>
            </div>
          </button>

          {/* Market Selector Dropdown */}
          <div className="relative hidden md:block border-l border-gray-200 pl-4 ml-2">
            <button
              onClick={() => setShowMarketMenu(!showMarketMenu)}
              className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200 transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>{activeMarketObj ? activeMarketObj.name : 'Azam Cloth Market'}</span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </button>

            {showMarketMenu && (
              <div className="absolute top-full left-4 mt-1.5 w-56 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-50">
                <div className="px-3 py-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Select Market Directory
                </div>
                {markets.map(m => (
                  <button
                    key={m.id}
                    onClick={() => {
                      onMarketChange(m.slug);
                      setShowMarketMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-emerald-50 transition-colors ${
                      currentMarket === m.slug ? 'font-bold text-[#0F5C3A] bg-emerald-50/50' : 'text-gray-700'
                    }`}
                  >
                    <span>{m.name}</span>
                    <span className="text-[10px] text-gray-400">{m.city}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Global Search Bar (Only visible in directory view or header) */}
        {currentView === 'directory' && (
          <div className="flex-1 max-w-md hidden sm:block">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={t('nav.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0F5C3A] focus:bg-white transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        )}

        {/* Right Navigation Actions */}
        <div className="flex items-center gap-2">
          {/* EN / اردو Language Toggle */}
          <button
            onClick={() => setLang(lang === 'en' ? 'ur' : 'en')}
            title="Switch language / زبان تبدیل کریں"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Languages className="w-3.5 h-3.5 text-[#0F5C3A]" />
            <span>{lang === 'en' ? 'اردو' : 'EN'}</span>
          </button>

          {currentView === 'directory' && (
            <button
              onClick={onToggleVerifiedOnly}
              className={`hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                verifiedOnly
                  ? 'bg-[#FDF6E7] border-[#C9952A] text-[#C9952A] font-semibold'
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Award className="w-3.5 h-3.5 text-[#C9952A]" />
              <span>{t('nav.verifiedOnly')}</span>
            </button>
          )}

          <button
            onClick={onNavigateRegister}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#C9952A] text-white hover:bg-[#b3831f] transition-all cursor-pointer shadow-2xs"
          >
            <Store className="w-4 h-4" />
            <span>Register My Stall</span>
          </button>

          <button
            onClick={() => onNavigateView('vendor_dashboard')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#E8F5EE] text-[#0F5C3A] hover:bg-[#0F5C3A] hover:text-white transition-all cursor-pointer shadow-2xs"
          >
            <Store className="w-4 h-4" />
            <span>{t('nav.vendorPortal')}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
