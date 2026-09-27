import React, { useState } from 'react';
import { Plus, MapPin } from 'lucide-react';
import { Market } from '../../types';

interface MarketManagerProps {
  markets: Market[];
  onAddMarket: (name: string, city: string) => void;
}

export const MarketManager: React.FC<MarketManagerProps> = ({ markets, onAddMarket }) => {
  const [name, setName] = useState('');
  const [city, setCity] = useState('Lahore');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    onAddMarket(name, city);
    setName('');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-1">
        <h2 className="font-serif text-2xl font-bold text-gray-900">
          Wholesale Markets Expansion Directory ({markets.length})
        </h2>
        <p className="text-xs text-gray-500">
          Add new wholesale market hubs to expand beyond Azam Cloth Market (e.g. Hall Road, Urdu Bazaar).
        </p>
      </div>

      {/* Add Form */}
      <form onSubmit={handleSubmit} className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs flex flex-wrap items-center gap-3 text-xs">
        <input
          type="text"
          required
          placeholder="Market Name (e.g. Hall Road Electronics Hub)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl"
        />

        <input
          type="text"
          required
          placeholder="City"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="w-32 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl"
        />

        <button
          type="submit"
          className="bg-[#0F5C3A] hover:bg-[#1A7A4F] text-white font-bold px-4 py-2 rounded-xl flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Add Market
        </button>
      </form>

      {/* Markets List */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {markets.map((m) => (
          <div key={m.id} className="bg-white p-4 rounded-xl border border-gray-200 space-y-1">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#0F5C3A]" />
              <strong className="text-sm font-bold text-gray-900">{m.name}</strong>
            </div>
            <div className="text-xs text-gray-500">{m.city}, {m.country}</div>
            <span className="inline-block mt-2 bg-emerald-50 text-[#0F5C3A] text-[10px] font-bold px-2 py-0.5 rounded-md">
              Active Directory
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
