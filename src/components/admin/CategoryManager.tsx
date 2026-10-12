import React, { useState } from 'react';
import { Plus, Tag, Edit3, Trash2 } from 'lucide-react';
import { Category } from '../../types';
import { ErrorBanner } from '../vendor/SaveFeedback';

interface CategoryManagerProps {
  categories: Category[];
  onAddCategory: (name: string, icon: string) => Promise<void>;
}

export const CategoryManager: React.FC<CategoryManagerProps> = ({
  categories,
  onAddCategory,
}) => {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('🧵');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [added, setAdded] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || saving) return;
    setSaving(true);
    setError('');
    setAdded('');
    try {
      await onAddCategory(name, icon);
      setAdded(name.trim());
      setName('');
      setTimeout(() => setAdded(''), 4000);
    } catch (err: any) {
      setError(err?.message || 'Could not add the category. Make sure you are logged in as an admin.');
    } finally {
      setSaving(false);
    }
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
          disabled={saving}
          className="bg-[#0F5C3A] hover:bg-[#1A7A4F] disabled:opacity-60 text-white font-bold px-4 py-2 rounded-xl flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> {saving ? 'Adding…' : 'Add Category'}
        </button>
      </form>
      {error && <ErrorBanner title="Category not added" message={error} onDismiss={() => setError('')} />}
      {added && (
        <div className="bg-emerald-50 border border-emerald-200 text-[#0F5C3A] rounded-xl p-3 text-xs font-bold">
          “{added}” added.
        </div>
      )}

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
