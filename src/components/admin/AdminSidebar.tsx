import React from 'react';
import { LayoutDashboard, Users, UserPlus, Clock, ShieldCheck, Tag, Map, ArrowLeft, Building, CreditCard, Server, Cpu, Sliders, Sparkles, Wallet, BookOpen, Award } from 'lucide-react';

interface AdminSidebarProps {
  pendingCount: number;
  activeTab: 'overview' | 'master_control' | 'vendors' | 'onboard' | 'pending' | 'subscriptions' | 'categories' | 'markets' | 'erp' | 'payments' | 'aargard';
  onSelectTab: (tab: 'overview' | 'master_control' | 'vendors' | 'onboard' | 'pending' | 'subscriptions' | 'categories' | 'markets' | 'erp' | 'payments' | 'aargard') => void;
  onExitToDirectory: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  pendingCount,
  activeTab,
  onSelectTab,
  onExitToDirectory,
}) => {
  return (
    <aside className="w-64 bg-[#111827] text-white min-h-screen p-4 flex flex-col justify-between border-r border-gray-800 shadow-2xl">
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

          <button
            onClick={() => onSelectTab('payments')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'payments'
                ? 'bg-[#C9952A] text-gray-900 font-bold shadow-md'
                : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            <div className="flex items-center gap-3">
              <Wallet className="w-4 h-4 text-emerald-400" />
              <span>Payment Gateways</span>
            </div>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              JazzCash / Stripe
            </span>
          </button>

          <div className="pt-3 pb-1 border-t border-gray-800 text-[10px] font-bold text-gray-500 uppercase tracking-wider px-3">
            External Systems & API
          </div>

          <button
            onClick={() => onSelectTab('erp')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'erp'
                ? 'bg-[#C9952A] text-gray-900 font-bold shadow-md'
                : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            <div className="flex items-center gap-3">
              <Server className="w-4 h-4 text-amber-400" />
              <span>ERP Integration</span>
            </div>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              API Hub
            </span>
          </button>

          <div className="pt-3 pb-1 border-t border-gray-800 text-[10px] font-bold text-gray-500 uppercase tracking-wider px-3">
            Federation & Leadership
          </div>

          <button
            onClick={() => onSelectTab('aargard')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'aargard'
                ? 'bg-[#C9952A] text-gray-900 font-bold shadow-md'
                : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            <div className="flex items-center gap-3">
              <Award className="w-4 h-4 text-[#C9952A]" />
              <span>CEO Memoir & Services</span>
            </div>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
              AArgard Hub
            </span>
          </button>
        </nav>
      </div>

      {/* Admin User Footer */}
      <div className="pt-4 border-t border-gray-800 text-xs">
        <div className="font-bold text-white">Aargard Admin Staff</div>
        <div className="text-[10px] text-gray-400">admin@aargard.com</div>
      </div>
    </aside>
  );
};
