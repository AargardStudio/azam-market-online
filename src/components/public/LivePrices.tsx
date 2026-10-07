import React from 'react';
import { TrendingUp } from 'lucide-react';

export interface LivePriceItem {
  name: string;
  price: string;
  unit: string;
}

// Edit this list to update the prices shown on the home page.
export const LIVE_PRICES: LivePriceItem[] = [
  { name: 'Fast Cotton', price: '225', unit: 'm' },
  { name: 'Fast Khaddar', price: '225', unit: 'm' },
  { name: 'Burewala', price: '225', unit: 'm' },
  { name: 'IRIS Cotton', price: '225', unit: 'm' },
  { name: 'Reborn Super Soft', price: '55', unit: 'yard' },
];

export const LivePrices: React.FC<{ items?: LivePriceItem[] }> = ({ items = LIVE_PRICES }) => (
  <section aria-label="Live prices" className="bg-white border-b border-gray-200">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
        </span>
        <TrendingUp className="w-4 h-4 text-[#0F5C3A]" />
        <h2 className="font-serif text-base sm:text-lg font-bold text-gray-900">Live prices</h2>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-1 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 no-scrollbar">
        {items.map((it) => (
          <div
            key={it.name}
            className="shrink-0 min-w-[150px] rounded-xl border border-emerald-100 bg-emerald-50/50 px-4 py-2.5"
          >
            <div className="text-xs font-semibold text-gray-600">{it.name}</div>
            <div className="text-lg font-bold text-[#0F5C3A] leading-tight">
              {it.price}
              <span className="text-xs font-semibold text-gray-500"> /{it.unit}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);
