import React, { useState } from 'react';
import { LayoutDashboard, Users, UserPlus, Clock, Tag, Map, ArrowLeft, Sliders, CreditCard, MoreHorizontal, X } from 'lucide-react';

interface AdminSidebarProps {
  pendingCount: number;
  activeTab: 'overview' | 'master_control' | 'vendors' | 'onboard' | 'pending' | 'subscriptions' | 'categories' | 'markets';
  onSelectTab: (tab: 'overview' | 'master_control' | 'vendors' | 'onboard' | 'pending' | 'subscriptions' | 'categories' | 'markets') => void;
  onExitToDirectory: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  pendingCount,
  activeTab,
  onSelectTab,
  onExitToDirectory,
}) => {
  const [moreOpen, setMoreOpen] = useState(false);
  type Tab = AdminSidebarProps['activeTab'];
  const primary: { id: Tab; label: string; Icon: React.ElementType; badge?: number }[] = [
    { id: 'overview', label: 'Overview', Icon: LayoutDashboard },
    { id: 'master_control', label: 'Shops', Icon: Sliders },
    { id: 'vendors', label: 'Vendors', Icon: Users },
    { id: 'pending', label: 'Pending', Icon: Clock, badge: pendingCount },
  ];
  const more: { id: Tab; label: string; Icon: React.ElementType }[] = [
    { id: 'onboard', label: 'Onboard New Vendor', Icon: UserPlus },
    { id: 'subscriptions', label: 'Subscription Tiers', Icon: CreditCard },
    { id: 'categories', label: 'Categories Config', Icon: Tag },
    { id: 'markets', label: 'Markets Expansion', Icon: Map },
  ];
  const moreActive = more.some((m) => m.id === activeTab);
  return (
    <>
    <header className="md:hidden bg-[#111827] text-white px-4 py-3 flex items-center justify-between gap-3 border-b border-gray-800">
      <div className="flex items-center gap-2.5 min-w-0">
        <img src="/icon-192.png" alt="Azam Market Online" className="w-9 h-9 rounded-xl shrink-0" />
        <div className="min-w-0">
          <div className="font-serif font-bold text-sm truncate">Aargard Admin</div>
          <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Platform Operator</div>
        </div>
      </div>
      <button onClick={onExitToDirectory} className="shrink-0 min-h-[44px] px-3 text-xs text-gray-300 flex items-center gap-1 cursor-pointer">
        <ArrowLeft className="w-4 h-4" /> Exit
      </button>
    </header>

    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-gray-200 grid grid-cols-5 pb-[env(safe-area-inset-bottom)] shadow-[0_-2px_8px_rgba(0,0,0,0.06)]">
      {primary.map(({ id, label, Icon, badge }) => (
        <button
          key={id}
          onClick={() => { setMoreOpen(false); onSelectTab(id); }}
          className={`relative min-h-[56px] flex flex-col items-center justify-center gap-0.5 text-[11px] font-semibold cursor-pointer ${activeTab === id ? 'text-[#0F5C3A]' : 'text-gray-500'}`}
        >
          <span className="relative">
            <Icon className="w-5 h-5" />
            {!!badge && badge > 0 && (
              <span className="absolute -top-1.5 -right-2.5 bg-red-600 text-white text-[9px] font-bold px-1 rounded-full">{badge}</span>
            )}
          </span>
          {label}
        </button>
      ))}
      <button
        onClick={() => setMoreOpen(true)}
        className={`min-h-[56px] flex flex-col items-center justify-center gap-0.5 text-[11px] font-semibold cursor-pointer ${moreActive ? 'text-[#0F5C3A]' : 'text-gray-500'}`}
      >
        <MoreHorizontal className="w-5 h-5" />
        More
      </button>
    </nav>

    {moreOpen && (
      <div className="md:hidden fixed inset-0 z-50 flex items-end bg-black/40" onClick={() => setMoreOpen(false)}>
        <div className="w-full bg-white rounded-t-2xl p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] space-y-2" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold text-gray-900">More</span>
            <button onClick={() => setMoreOpen(false)} className="min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-500 cursor-pointer" aria-label="Close">
              <X className="w-5 h-5" />
            </button>
          </div>
          {more.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => { setMoreOpen(false); onSelectTab(id); }}
              className={`w-full min-h-[48px] flex items-center gap-3 px-3 rounded-xl text-sm font-semibold cursor-pointer ${activeTab === id ? 'bg-[#E8F5EE] text-[#0F5C3A]' : 'text-gray-700 bg-gray-50'}`}
            >
              <Icon className="w-5 h-5" /> {label}
            </button>
          ))}
        </div>
      </div>
    )}

    <aside className="hidden md:flex w-64 bg-[#111827] text-white min-h-screen p-4 flex flex-col justify-between border-r border-gray-800 shadow-2xl">
      <div className="space-y-6">
        {/* Brand Header */}
        <div className="pb-4 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img
              src="/icon-192.png"
              alt="Azam Market Online"
              className="w-9 h-9 rounded-xl"
            />
            <div>
              <span className="font-serif font-bold text-base text-white tracking-tight block">
                Aargard Admin
              </span>
              <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider block">
                Platform Operator
              </span>
            </div>
          </div>

          <button
            onClick={onExitToDirectory}
            className="text-xs text-gray-400 hover:text-white p-1 cursor-pointer"
            title="Exit to Directory"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-1 text-xs font-semibold">
          <button
            onClick={() => onSelectTab('overview')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-[#C9952A] text-gray-900 font-bold shadow-md'
                : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Platform Overview</span>
          </button>

          {/* MASTER SHOP CONTROL CENTER */}
          <button
            onClick={() => onSelectTab('master_control')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'master_control'
                ? 'bg-linear-to-r from-[#0F5C3A] to-emerald-700 text-white font-bold shadow-lg ring-1 ring-emerald-400/50'
                : 'text-emerald-300 hover:bg-gray-800 bg-emerald-950/30 border border-emerald-900/50'
            }`}
          >
            <div className="flex items-center gap-3">
              <Sliders className="w-4 h-4 text-emerald-400" />
              <span>Master Shop Control</span>
            </div>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#C9952A] text-gray-900 shadow-xs">
              All Aspects
            </span>
          </button>

          <button
            onClick={() => onSelectTab('vendors')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'vendors'
                ? 'bg-[#C9952A] text-gray-900 font-bold shadow-md'
                : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>All Vendors Directory</span>
          </button>

          <button
            onClick={() => onSelectTab('pending')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'pending'
                ? 'bg-[#C9952A] text-gray-900 font-bold shadow-md'
                : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4" />
              <span>Pending Approvals</span>
            </div>
            {pendingCount > 0 && (
              <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                {pendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onSelectTab('onboard')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'onboard'
                ? 'bg-[#C9952A] text-gray-900 font-bold shadow-md'
                : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            <UserPlus className="w-4 h-4 text-emerald-400" />
            <span>Onboard New Vendor</span>
          </button>

          <div className="pt-3 pb-1 border-t border-gray-800 text-[10px] font-bold text-gray-500 uppercase tracking-wider px-3">
            Platform Master Data
          </div>

          <button
            onClick={() => onSelectTab('subscriptions')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'subscriptions'
                ? 'bg-[#C9952A] text-gray-900 font-bold shadow-md'
                : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Subscription Tiers</span>
          </button>

          <button
            onClick={() => onSelectTab('categories')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'categories'
                ? 'bg-[#C9952A] text-gray-900 font-bold shadow-md'
                : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            <Tag className="w-4 h-4" />
            <span>Categories Config</span>
          </button>

          <button
            onClick={() => onSelectTab('markets')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'markets'
                ? 'bg-[#C9952A] text-gray-900 font-bold shadow-md'
                : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            <Map className="w-4 h-4" />
            <span>Markets Expansion</span>
          </button>

        </nav>
      </div>

      {/* Admin User Footer */}
      <div className="pt-4 border-t border-gray-800 text-xs">
        <div className="font-bold text-white">Aargard Admin Staff</div>
        <div className="text-[10px] text-gray-400">admin@aargard.com</div>
      </div>
    </aside>
    </>
  );
};
