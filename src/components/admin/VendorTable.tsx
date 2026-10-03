import React, { useState } from 'react';
import { Search, ShieldCheck, Edit3, Eye, AlertTriangle, CheckCircle, XCircle, MoreVertical, Award, ArrowUpRight, Sliders } from 'lucide-react';
import { Vendor, SubscriptionTier } from '../../types';

interface VendorTableProps {
  vendors: Vendor[];
  tiers: SubscriptionTier[];
  onUpdateVendorStatus: (vendorId: string, newStatus: 'active' | 'pending' | 'suspended') => void;
  onUpdateVendorTier: (vendorId: string, newTierId: string) => void;
  onSelectVendorToEdit: (vendor: Vendor) => void;
  onViewLiveShop: (slug: string) => void;
}

export const VendorTable: React.FC<VendorTableProps> = ({
  vendors,
  tiers,
  onUpdateVendorStatus,
  onUpdateVendorTier,
  onSelectVendorToEdit,
  onViewLiveShop,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [tierFilter, setTierFilter] = useState<string>('all');

  const filtered = vendors.filter((v) => {
    if (statusFilter !== 'all' && v.status !== statusFilter) return false;
    if (tierFilter !== 'all' && v.tier_id !== tierFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        v.shop_name.toLowerCase().includes(q) ||
        v.stall_number.toLowerCase().includes(q) ||
        v.whatsapp.includes(q) ||
        v.email.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs p-6 space-y-4">
      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-xl font-bold text-gray-900">
            Platform Vendors Directory ({filtered.length})
          </h2>
          <p className="text-xs text-gray-500">
            Manage onboarding approvals, subscription tiers, and vendor statuses.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search vendor or stall..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#0F5C3A]"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#0F5C3A]"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="pending">Pending Approval</option>
            <option value="suspended">Suspended</option>
          </select>

          {/* Tier Filter */}
          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#0F5C3A]"
          >
            <option value="all">All Tiers</option>
            {tiers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.display_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-gray-200 rounded-xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50 text-gray-500 uppercase font-bold text-[10px] border-b border-gray-200">
            <tr>
              <th className="p-3">Vendor / Stall Name</th>
              <th className="p-3">Market / Stall No</th>
              <th className="p-3">WhatsApp & Email</th>
              <th className="p-3">Subscription Tier</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 font-medium">
            {filtered.map((v) => (
              <tr key={v.id} className="hover:bg-gray-50/80 transition-colors">
                <td className="p-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#0F5C3A] text-white font-serif font-bold text-xs flex items-center justify-center shrink-0">
                      {v.shop_name[0]}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 flex items-center gap-1">
                        <span>{v.shop_name}</span>
                        {v.is_verified && <Award className="w-3.5 h-3.5 text-[#C9952A]" />}
                      </div>
                      <div className="text-[10px] text-gray-400">
                        {v.products?.length || 0} Products • {v.catalogues?.length || 0} Lookbooks
                      </div>
                    </div>
                  </div>
                </td>

                <td className="p-3">
                  <div className="text-gray-900 font-semibold">{v.stall_number}</div>
                  <div className="text-[10px] text-gray-400">{v.market?.name || 'Azam Cloth Market'}</div>
                </td>

                <td className="p-3">
                  <div className="text-gray-900 font-bold">{v.whatsapp}</div>
                  <div className="text-[10px] text-gray-400">{v.email}</div>
                </td>

                <td className="p-3">
                  <select
                    value={v.tier_id}
                    onChange={(e) => onUpdateVendorTier(v.id, e.target.value)}
                    className="bg-emerald-50 text-[#0F5C3A] font-bold text-[11px] px-2 py-1 rounded-lg border border-emerald-200 cursor-pointer focus:outline-none"
                  >
                    {tiers.map((t) => (
                      <option key={t.id} value={t.id} disabled={!t.is_available && v.tier_id !== t.id}>
                        {t.display_name} (${t.price_usd.toLocaleString()}){!t.is_available ? ' — Coming Soon' : ''}
                      </option>
                    ))}
                  </select>
                </td>

                <td className="p-3">
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${
                      v.status === 'active'
                        ? 'bg-emerald-100 text-[#0F5C3A]'
                        : v.status === 'pending'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {v.status}
                  </span>
                </td>

                <td className="p-3 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {/* Status Toggle Actions */}
                    {v.status === 'pending' && (
                      <button
                        onClick={() => onUpdateVendorStatus(v.id, 'active')}
                        className="bg-[#0F5C3A] hover:bg-[#1A7A4F] text-white text-[10px] font-bold px-2.5 py-1 rounded-md"
                      >
                        Approve
                      </button>
                    )}

                    {v.status === 'active' ? (
                      <button
                        onClick={() => onUpdateVendorStatus(v.id, 'suspended')}
                        className="bg-red-50 hover:bg-red-100 text-red-700 text-[10px] font-bold px-2 py-1 rounded-md border border-red-200"
                      >
                        Suspend
                      </button>
                    ) : v.status === 'suspended' ? (
                      <button
                        onClick={() => onUpdateVendorStatus(v.id, 'active')}
                        className="bg-emerald-50 hover:bg-emerald-100 text-[#0F5C3A] text-[10px] font-bold px-2 py-1 rounded-md border border-emerald-200"
                      >
                        Reinstate
                      </button>
                    ) : null}

                    <button
                      onClick={() => onSelectVendorToEdit(v)}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-[10px] font-bold px-2 py-1 rounded-md border border-gray-300 flex items-center gap-1 cursor-pointer"
                      title="Control All Aspects in Master Controller"
                    >
                      <Sliders className="w-3 h-3 text-[#0F5C3A]" />
                      <span>Aspects</span>
                    </button>

                    <button
                      onClick={() => onViewLiveShop(v.slug)}
                      className="p-1.5 text-gray-600 hover:text-gray-900 rounded-md border border-gray-200"
                      title="View Live Shop"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
