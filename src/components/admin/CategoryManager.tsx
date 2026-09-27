import React, { useState } from 'react';
import { Plus, Tag, Edit3, Trash2 } from 'lucide-react';
import { Category } from '../../types';

interface CategoryManagerProps {
  categories: Category[];
  onAddCategory: (name: string, icon: string) => void;
}

export const CategoryManager: React.FC<CategoryManagerProps> = ({
  categories,
  onAddCategory,
}) => {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('🧵');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    onAddCategory(name, icon);
    setName('');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-1">
        <h2 className="font-serif text-2xl font-bold text-gray-900">
          Fabric Categories Configuration ({categories.length})
        </h2>
        <p className="text-xs text-gray-500">
          Manage fabric taxonomies and primary category icons across the directory.
        </p>
      </div>

      {/* Add Form */}
      <form onSubmit={handleSubmit} className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs flex flex-wrap items-center gap-3 text-xs">
        <input
          type="text"
          placeholder="Icon (e.g. 🧵, 🌿, ✨)"
          value={icon}
          onChange={(e) => setIcon(e.target.value)}
          className="w-20 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-bold text-center"
        />

        <input
          type="text"
          required
          placeholder="Category Name (e.g. Brocade & Jacquard)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl"
        />

        <button
          type="submit"
          className="bg-[#0F5C3A] hover:bg-[#1A7A4F] text-white font-bold px-4 py-2 rounded-xl flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </form>

      {/* Categories Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {categories.map((c) => (
          <div key={c.id} className="bg-white p-4 rounded-xl border border-gray-200 text-center space-y-1">
            <span className="text-3xl block">{c.icon}</span>
            <div className="font-bold text-sm text-gray-900">{c.name}</div>
            <span className="text-[10px] text-gray-400 block font-semibold">{c.vendor_count} Stalls</span>
          </div>
        ))}
      </div>
    </div>
  );
};
