import React from 'react';
import { Users, CreditCard, DollarSign, Clock, TrendingUp, ShieldCheck, UserPlus, ArrowUpRight, Server, ArrowRight, Sliders, Sparkles } from 'lucide-react';
import { Vendor } from '../../types';

interface AdminOverviewProps {
  metrics: {
    totalVendors: number;
    activeVendorsCount: number;
    pendingApprovalsCount: number;
    suspendedCount: number;
    mrrUsd: number;
    mrrPkr: number;
    tierBreakdown: { basic: number; standard: number; premium: number };
    recentOnboards: Vendor[];
  };
  onNavigateTab: (tab: 'overview' | 'master_control' | 'vendors' | 'onboard' | 'pending' | 'subscriptions' | 'categories' | 'markets' | 'erp') => void;
}

export const AdminOverview: React.FC<AdminOverviewProps> = ({ metrics, onNavigateTab }) => {
  return (
    <div className="space-y-6">
      {/* Header Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs">
        <div>
          <span className="text-xs font-bold text-[#C9952A] uppercase tracking-wider">
            Aargard Operator Portal
          </span>
          <h1 className="font-serif text-2xl font-bold text-gray-900 mt-1">
            Azam Market Platform Control Room
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Monitor vendor subscriptions, active approvals, platform MRR, and directory health.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Master Shop Control Premier Button */}
          <button
            onClick={() => onNavigateTab('master_control')}
            className="bg-[#0F5C3A] hover:bg-[#1A7A4F] text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-md ring-1 ring-emerald-500/50"
          >
            <Sliders className="w-4 h-4 text-emerald-300" />
            <span>Master Shop Control</span>
          </button>

          <button
            onClick={() => onNavigateTab('erp')}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold px-3.5 py-2.5 rounded-xl border border-gray-300/80 flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Server className="w-4 h-4 text-amber-600" />
            <span>ERP Integration</span>
          </button>

          <button
            onClick={() => onNavigateTab('onboard')}
            className="bg-gray-900 hover:bg-black text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
          >
            <UserPlus className="w-4 h-4 text-emerald-400" />
            <span>Onboard Stall</span>
          </button>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Vendors */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase">Total Directory Vendors</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif text-2xl font-bold text-gray-900">
            {metrics.totalVendors}
          </div>
          <div className="text-[11px] text-gray-500">
            <strong className="text-emerald-600">{metrics.activeVendorsCount} Active</strong> • {metrics.suspendedCount} Suspended
          </div>
        </div>

        {/* Active Subscriptions MRR */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase">Monthly Recurring Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#0F5C3A] flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif text-2xl font-bold text-gray-900">
            ${metrics.mrrUsd.toLocaleString()} <span className="text-sm font-normal text-gray-400">/ mo</span>
          </div>
          <div className="text-[10px] text-gray-400">
            ≈ ₨{metrics.mrrPkr.toLocaleString()} PKR
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold">
            Across {metrics.activeVendorsCount} active paying vendors
          </div>
        </div>

        {/* Pending Approvals Queue */}
        <div className={`rounded-2xl border p-5 shadow-2xs space-y-3 ${
          metrics.pendingApprovalsCount > 0 ? 'bg-red-50/60 border-red-200' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase">Pending Approvals</span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              metrics.pendingApprovalsCount > 0 ? 'bg-red-100 text-red-600 font-bold' : 'bg-gray-100 text-gray-500'
            }`}>
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif text-2xl font-bold text-gray-900">
            {metrics.pendingApprovalsCount}
          </div>
          <div className="text-[11px]">
            {metrics.pendingApprovalsCount > 0 ? (
              <button
                onClick={() => onNavigateTab('pending')}
                className="text-red-700 font-bold hover:underline"
              >
                Review Approval Queue →
              </button>
            ) : (
              <span className="text-gray-400">Queue is completely clear</span>
            )}
          </div>
        </div>

        {/* Gold Verified Stall Ratio */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase">Verified Badge Stalls</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-[#C9952A] flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif text-2xl font-bold text-gray-900">
            {metrics.tierBreakdown.standard + metrics.tierBreakdown.premium}
          </div>
          <div className="text-[11px] text-gray-500">
            Standard & Premium Tier Verified Stalls
          </div>
        </div>
      </div>

      {/* Tier Distribution & Recent Onboards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tier Distribution Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-2xs space-y-4">
          <h3 className="font-serif font-bold text-base text-gray-900">
            Subscription Tier Distribution
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span>Basic Tier (₨2,500/mo)</span>
                <span>{metrics.tierBreakdown.basic} vendors</span>
              </div>
              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{
                    width: `${metrics.totalVendors ? (metrics.tierBreakdown.basic / metrics.totalVendors) * 100 : 0}%`,
                  }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span>Standard Tier (₨5,000/mo)</span>
                <span>{metrics.tierBreakdown.standard} vendors</span>
              </div>
              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#0F5C3A] rounded-full"
                  style={{
                    width: `${metrics.totalVendors ? (metrics.tierBreakdown.standard / metrics.totalVendors) * 100 : 0}%`,
                  }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span>Premium Tier (₨9,500/mo)</span>
                <span>{metrics.tierBreakdown.premium} vendors</span>
              </div>
              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#C9952A] rounded-full"
                  style={{
                    width: `${metrics.totalVendors ? (metrics.tierBreakdown.premium / metrics.totalVendors) * 100 : 0}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Onboarded Vendors */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-base text-gray-900">
              Recently Joined Vendors
            </h3>
            <button
              onClick={() => onNavigateTab('vendors')}
              className="text-xs text-[#0F5C3A] font-bold hover:underline"
            >
              View All Vendors →
            </button>
          </div>

          <div className="space-y-2">
            {metrics.recentOnboards.slice(0, 4).map((v) => (
              <div
                key={v.id}
                className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between text-xs"
              >
                <div>
                  <strong className="text-gray-900 block font-semibold">{v.shop_name}</strong>
                  <span className="text-gray-500">{v.stall_number} • {v.whatsapp}</span>
                </div>
                <span
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${
                    v.status === 'active'
                      ? 'bg-emerald-100 text-[#0F5C3A]'
                      : v.status === 'pending'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {v.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
