import React from 'react';
import { Award, FileText, CheckCircle2, Sparkles, Filter } from 'lucide-react';

interface FilterBarProps {
  verifiedOnly: boolean;
  onToggleVerified: () => void;
  featuredOnly: boolean;
  onToggleFeatured: () => void;
  hasCatalogueOnly: boolean;
  onToggleHasCatalogue: () => void;
  activeTier: string | null;
  onSelectTier: (tier: string | null) => void;
  sortBy: 'popular' | 'newest' | 'name';
  onSortChange: (sort: 'popular' | 'newest' | 'name') => void;
  totalResults: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  verifiedOnly,
  onToggleVerified,
  featuredOnly,
  onToggleFeatured,
  hasCatalogueOnly,
  onToggleHasCatalogue,
  activeTier,
  onSelectTier,
  sortBy,
  onSortChange,
  totalResults,
}) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-2xs mb-6 flex flex-col md:flex-row md:items-center justify-between gap-3">
      {/* Left Filter Pills */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-gray-500 flex items-center gap-1 pr-1 border-r border-gray-200">
          <Filter className="w-3.5 h-3.5 text-gray-400" /> Filters:
        </span>

        <button
          onClick={onToggleVerified}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1.5 transition-colors cursor-pointer ${
            verifiedOnly
              ? 'bg-[#FDF6E7] border-[#C9952A] text-[#C9952A]'
              : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Award className="w-3.5 h-3.5 text-[#C9952A]" />
          <span>Verified Only</span>
        </button>

        <button
          onClick={onToggleFeatured}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1.5 transition-colors cursor-pointer ${
            featuredOnly
              ? 'bg-purple-50 border-purple-400 text-purple-700'
              : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-600" />
          <span>Featured Suppliers</span>
        </button>

        <button
          onClick={onToggleHasCatalogue}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1.5 transition-colors cursor-pointer ${
            hasCatalogueOnly
              ? 'bg-emerald-50 border-[#0F5C3A] text-[#0F5C3A]'
              : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <FileText className="w-3.5 h-3.5 text-[#0F5C3A]" />
          <span>Has PDF Catalogue</span>
        </button>
      </div>

      {/* Right Sort & Count */}
      <div className="flex items-center justify-between md:justify-end gap-3 text-xs">
        <span className="text-gray-500 font-medium">
          Showing <strong className="text-gray-900">{totalResults}</strong> vendors
        </span>

        <div className="flex items-center gap-1.5">
          <span className="text-gray-400">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as 'popular' | 'newest' | 'name')}
            className="bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#0F5C3A]"
          >
            <option value="popular">Most Popular</option>
            <option value="newest">Newest Onboarded</option>
            <option value="name">Shop Name A-Z</option>
          </select>
        </div>
      </div>
    </div>
  );
};
