import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Category, Vendor } from '../../types';
import { VendorCard } from './VendorCard';
import { useLanguage } from '../../lib/i18n';

interface CategoryShopRowsProps {
  categories: Category[];
  vendors: Vendor[];
  onSelectVendor: (slug: string) => void;
  onOpenCatalogue: (catalogueId: string) => void;
  onLogEvent: (vendorId: string, type: 'whatsapp_click' | 'email_click' | 'profile_view', catId?: string) => void;
  onSelectCategory: (slug: string) => void;
}

export const CategoryShopRows: React.FC<CategoryShopRowsProps> = ({
  categories,
  vendors,
  onSelectVendor,
  onOpenCatalogue,
  onLogEvent,
  onSelectCategory,
}) => {
  const { lang } = useLanguage();

  return (
    <div className="space-y-10">
      {categories.map((cat) => {
        const catVendors = vendors.filter((v) =>
          (v.categories || []).some((c) => c.slug === cat.slug)
        );
        if (catVendors.length === 0) return null;

        const name = lang === 'ur' && cat.name_ur ? cat.name_ur : cat.name;

        return (
          <div key={cat.id} className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {cat.image_url ? (
                  <img
                    src={cat.image_url}
                    alt={name}
                    className="w-8 h-8 rounded-lg object-cover border border-gray-200"
                  />
                ) : (
                  <span className="text-xl">{cat.icon || '🧵'}</span>
                )}
                <h2 className="font-serif text-lg sm:text-xl font-bold text-gray-900">
                  {name}
                </h2>
                <span className="text-xs text-gray-400 font-medium">
                  {catVendors.length} shop{catVendors.length === 1 ? '' : 's'}
                </span>
              </div>
              <button
                onClick={() => onSelectCategory(cat.slug)}
                className="flex items-center gap-1 text-xs font-semibold text-[#0F5C3A] hover:underline shrink-0"
              >
                View All
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-3 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 snap-x snap-mandatory no-scrollbar">
              {catVendors.map((vendor) => (
                <div key={vendor.id} className="w-[260px] sm:w-[280px] shrink-0 snap-start">
                  <VendorCard
                    vendor={vendor}
                    onSelectVendor={onSelectVendor}
                    onOpenCatalogue={onOpenCatalogue}
                    onLogEvent={onLogEvent}
                  />
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
