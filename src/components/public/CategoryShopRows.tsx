import React from 'react';
import { ChevronRight, Store } from 'lucide-react';
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
  onNavigateRegister: () => void;
}

export const CategoryShopRows: React.FC<CategoryShopRowsProps> = ({
  categories,
  vendors,
  onSelectVendor,
  onOpenCatalogue,
  onLogEvent,
  onSelectCategory,
  onNavigateRegister,
}) => {
  const { lang } = useLanguage();

  return (
    <div className="space-y-10">
      {categories.map((cat) => {
        const catVendors = vendors.filter((v) =>
          (v.categories || []).some((c) => c.slug === cat.slug)
        );
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
              {catVendors.length > 0 && (
                <button
                  onClick={() => onSelectCategory(cat.slug)}
                  className="flex items-center gap-1 text-xs font-semibold text-[#0F5C3A] hover:underline shrink-0"
                >
                  View All
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {catVendors.length > 0 ? (
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
            ) : (
              <button
                onClick={onNavigateRegister}
                className="w-full flex items-center gap-3 bg-white rounded-2xl border border-dashed border-gray-300 p-5 text-left hover:border-[#0F5C3A] hover:bg-emerald-50/30 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 shrink-0">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700">
                    No stalls listed in {name} yet
                  </p>
                  <p className="text-xs text-gray-400">
                    Be the first vendor to register your stall in this category.
                  </p>
                </div>
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};
