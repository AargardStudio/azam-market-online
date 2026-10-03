import React from 'react';
import { Search, ShieldCheck, Download, Store, ArrowUpRight, FileText } from 'lucide-react';

interface VendorHeroProps {
  totalVendors: number;
  totalCategories: number;
  totalCataloguesDownloaded: number;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSelectCategory: (categorySlug: string) => void;
}

export const VendorHero: React.FC<VendorHeroProps> = ({
  totalVendors,
  totalCategories,
  totalCataloguesDownloaded,
  searchQuery,
  onSearchChange,
  onSelectCategory,
}) => {
  return (
    <div className="bg-gray-900 text-white relative overflow-hidden min-h-[560px] sm:min-h-[620px] md:min-h-[700px] flex items-center">
      {/* Banner photograph */}
      <img
        src="/hero-banner.jpg"
        alt="Azam Market Online"
        className="absolute inset-0 w-full h-full object-cover object-[75%_center]"
      />
      {/* Gradient overlay: neutral dark tint on the left where the text and
          search bar sit, fading out toward the right so the photo (and its
          own Azam Market Online logo) stays visible, with no green color cast. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(to right, rgba(10,10,10,0.92) 0%, rgba(10,10,10,0.85) 30%, rgba(10,10,10,0.5) 55%, rgba(10,10,10,0.2) 75%, rgba(10,10,10,0.1) 100%)',
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Text */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#C9952A] border border-[#C9952A]/30 text-xs font-semibold backdrop-blur-xs">
              <ShieldCheck className="w-4 h-4 text-[#C9952A]" />
              <span>Official Azam Market B2B Textile Directory</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight tracking-tight">
              Lahore's Wholesale Cloth Market, <span className="text-[#C9952A] underline decoration-[#C9952A]/40 decoration-wavy underline-offset-8">Online.</span>
            </h1>

            <p className="text-gray-200 text-sm sm:text-base max-w-2xl leading-relaxed">
              Browse verified stalls across unstitched suits, bases, shawls &amp; dupattas, home textile, men's wear and branded stock from Lahore's historic Azam Cloth Market. Download PDF lookbooks, compare pricing, and initiate direct WhatsApp inquiries with stall owners.
            </p>

            {/* Integrated Search Input in Hero */}
            <div className="pt-2">
              <div className="relative max-w-xl mx-auto lg:mx-0">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search fabric type (e.g. Lawn, Silk, Micro Velvet 9000), shop or stall number..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full pl-12 pr-28 py-3.5 bg-white text-gray-900 rounded-2xl text-sm placeholder-gray-400 shadow-xl focus:outline-none focus:ring-3 focus:ring-[#C9952A]"
                />
                <button 
                  onClick={() => {}} 
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#C9952A] hover:bg-[#b58322] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
                >
                  Search
                </button>
              </div>

              {/* Quick Preset Tags */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 mt-3 text-xs text-gray-200">
                <span className="text-gray-300/80 font-medium">Popular:</span>
                <button onClick={() => onSelectCategory('2pc-unstitched')} className="bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-md text-gray-100 transition-colors">2 Pc Unstitched</button>
                <button onClick={() => onSelectCategory('3pc-unstitched')} className="bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-md text-gray-100 transition-colors">3 Pc Unstitched</button>
                <button onClick={() => onSelectCategory('shawls-dupattas')} className="bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-md text-gray-100 transition-colors">Shawls / Dupattas</button>
                <button onClick={() => onSelectCategory('brands')} className="bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-md text-gray-100 transition-colors">Brands</button>
              </div>
            </div>
          </div>

          {/* Right Live Stats Card Grid */}
          <div className="lg:col-span-5">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 p-6 shadow-2xl space-y-4">
              <div className="text-xs font-bold uppercase tracking-wider text-[#C9952A]">
                Platform Metrics Live
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white/15 rounded-xl p-4 text-center border border-white/10">
                  <div className="flex justify-center text-[#C9952A] mb-1">
                    <Store className="w-5 h-5" />
                  </div>
                  <div className="font-serif text-2xl font-bold text-white">
                    {totalVendors}
                  </div>
                  <div className="text-[11px] text-gray-300 font-medium mt-0.5">
                    Verified Stalls
                  </div>
                </div>

                <div className="bg-white/15 rounded-xl p-4 text-center border border-white/10">
                  <div className="flex justify-center text-[#C9952A] mb-1">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="font-serif text-2xl font-bold text-white">
                    {totalCategories}
                  </div>
                  <div className="text-[11px] text-gray-300 font-medium mt-0.5">
                    Categories
                  </div>
                </div>

                <div className="bg-white/15 rounded-xl p-4 text-center border border-white/10">
                  <div className="flex justify-center text-[#C9952A] mb-1">
                    <Download className="w-5 h-5" />
                  </div>
                  <div className="font-serif text-2xl font-bold text-white">
                    {totalCataloguesDownloaded}
                  </div>
                  <div className="text-[11px] text-gray-300 font-medium mt-0.5">
                    PDF Lookbooks
                  </div>
                </div>
              </div>

              <div className="bg-black/40 rounded-xl p-3.5 border border-white/15 text-xs flex items-center justify-between text-gray-200">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Active Wholesale Buyers Online Now</span>
                </div>
                <span className="font-bold text-white">340+ Inquiries</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
