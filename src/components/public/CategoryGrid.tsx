import React from 'react';
import { Category } from '../../types';
import { useLanguage } from '../../lib/i18n';

interface CategoryGridProps {
  categories: Category[];
  selectedCategory: string | null;
  onSelectCategory: (slug: string | null) => void;
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  const { lang, t } = useLanguage();
  return (
    <div className="my-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-serif text-xl font-bold text-gray-900">
            {t('category.browse')}
          </h2>
          <p className="text-xs text-gray-500">
            Select a business category to filter the stall directory
          </p>
        </div>
        {selectedCategory && (
          <button
            onClick={() => onSelectCategory(null)}
            className="text-xs text-[#0F5C3A] hover:underline font-semibold"
          >
            Clear Filter (Show All)
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.slug;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(isSelected ? null : cat.slug)}
              className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                isSelected
                  ? 'bg-[#0F5C3A] border-[#0F5C3A] text-white shadow-md transform -translate-y-0.5'
                  : 'bg-white border-gray-200 hover:border-[#0F5C3A] hover:bg-emerald-50/40 text-gray-800'
              }`}
            >
              <span className="text-2xl">{cat.icon || '🧵'}</span>
              <span className="text-xs font-semibold leading-tight line-clamp-2">
                {lang === 'ur' && cat.name_ur ? cat.name_ur : cat.name}
              </span>
              <span
                className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                  isSelected
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                {cat.vendor_count} stalls
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
