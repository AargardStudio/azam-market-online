import React, { useState } from 'react';
import { Store, Save, CheckCircle2, Image, Upload, MapPin, Palette, Sparkles, ArrowRight } from 'lucide-react';
import { Vendor, Category } from '../../types';
import { ImageUploader } from '../common/ImageUploader';

interface ShopProfileFormProps {
  vendor: Vendor;
  allCategories: Category[];
  onSaveProfile: (updatedData: Partial<Vendor>) => void;
  onOpenCustomizer?: () => void;
}

export const ShopProfileForm: React.FC<ShopProfileFormProps> = ({
  vendor,
  allCategories,
  onSaveProfile,
  onOpenCustomizer,
}) => {
  const [shopName, setShopName] = useState(vendor.shop_name);
  const [stallNumber, setStallNumber] = useState(vendor.stall_number);
  const [whatsapp, setWhatsapp] = useState(vendor.whatsapp);
  const [email, setEmail] = useState(vendor.email);
  const [website, setWebsite] = useState(vendor.website || '');
  const [description, setDescription] = useState(vendor.description);
  const [logoUrl, setLogoUrl] = useState(vendor.logo_url || '');
  const [coverUrl, setCoverUrl] = useState(vendor.cover_url || '');
  const [tagsInput, setTagsInput] = useState(vendor.tags ? vendor.tags.join(', ') : '');
  const [selectedCatIds, setSelectedCatIds] = useState<string[]>(
    vendor.categories ? vendor.categories.map((c) => c.id) : []
  );
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tagsArr = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const chosenCats = allCategories.filter((c) => selectedCatIds.includes(c.id));

    onSaveProfile({
      shop_name: shopName,
      stall_number: stallNumber,
      whatsapp,
      email,
      website,
      description,
      logo_url: logoUrl || null,
      cover_url: coverUrl || null,
      tags: tagsArr,
      categories: chosenCats,
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const toggleCategory = (catId: string) => {
    if (selectedCatIds.includes(catId)) {
      setSelectedCatIds(selectedCatIds.filter((id) => id !== catId));
    } else {
      setSelectedCatIds([...selectedCatIds, catId]);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
        <div>
          <h2 className="font-serif text-xl font-bold text-gray-900">
            Edit Stall Profile & Trade Information
          </h2>
          <p className="text-xs text-gray-500">
            Keep your stall details, WhatsApp contact, and fabric categories updated for B2B buyers.
          </p>
        </div>

        {savedSuccess && (
          <span className="bg-emerald-50 text-[#0F5C3A] text-xs font-bold px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#0F5C3A]" /> Stall Profile Saved Successfully!
          </span>
        )}
      </div>

      {/* Direct Link to Shop Customizer Studio */}
      {onOpenCustomizer && (
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-amber-50 border border-emerald-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0F5C3A] text-white flex items-center justify-center shrink-0 shadow-xs">
              <Palette className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="font-bold text-xs text-gray-900 flex items-center gap-1.5">
                <span>Shop Customizer & Live Studio</span>
                <span className="bg-[#C9952A] text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full">
                  NEW
                </span>
              </div>
              <p className="text-[11px] text-gray-600">
                Customize theme colors, hero banners, WhatsApp & attached phone buttons, modular layout blocks, and wholesale pricing.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenCustomizer}
            className="bg-[#0F5C3A] hover:bg-[#1A7A4F] text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer shadow-xs"
          >
            <span>Open Customizer</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="font-bold text-gray-700 block mb-1">
              Shop / Stall Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0F5C3A]"
            />
          </div>

          <div>
            <label className="font-bold text-gray-700 block mb-1">
              Stall Number / Location in Azam Market <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={stallNumber}
              onChange={(e) => setStallNumber(e.target.value)}
              placeholder="e.g. Stall A-12, Ghee Mandi Bazaar"
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0F5C3A]"
            />
          </div>

          <div>
            <label className="font-bold text-gray-700 block mb-1">
              WhatsApp Wholesale Number (+92 Format) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="+92 300 1234567"
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0F5C3A]"
            />
          </div>

          <div>
            <label className="font-bold text-gray-700 block mb-1">
              Official Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0F5C3A]"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="font-bold text-gray-700 block mb-1">
              Website or Social Link (Optional)
            </label>
            <input
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://razasilk.pk"
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0F5C3A]"
            />
          </div>
        </div>

        {/* Categories Selection */}
        <div className="text-xs space-y-2">
          <label className="font-bold text-gray-700 block">
            Fabric Categories Handled (Multi-Select):
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {allCategories.map((cat) => {
              const checked = selectedCatIds.includes(cat.id);
              return (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => toggleCategory(cat.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2 ${
                    checked
                      ? 'bg-[#E8F5EE] border-[#0F5C3A] text-[#0F5C3A] font-bold'
                      : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-base">{cat.icon}</span>
                  <span className="truncate">{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Description */}
        <div className="text-xs">
          <label className="font-bold text-gray-700 block mb-1">
            Shop Description & Wholesale Trade Terms
          </label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your fabric specialization, mill connections, export experience, and trade policies..."
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0F5C3A]"
          ></textarea>
        </div>

        {/* Tags */}
        <div className="text-xs">
          <label className="font-bold text-gray-700 block mb-1">
            Specialty Tags (Comma separated)
          </label>
          <input
            type="text"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="Wholesale, Direct Import, Pure Silk, MOQ 50m, Export Quality"
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0F5C3A]"
          />
        </div>

        {/* Logo & Cover Images with File Upload */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
          <div>
            <ImageUploader
              value={logoUrl}
              onChange={(url) => setLogoUrl(url)}
              aspect="logo"
              label="Stall Logo / Shop Icon"
              description="Upload your shop crest, insignia, or brand logo (PNG, JPG, SVG)."
              placeholderText="Paste image URL or upload file..."
            />
          </div>

          <div>
            <ImageUploader
              value={coverUrl}
              onChange={(url) => setCoverUrl(url)}
              aspect="cover"
              label="Shop Header & Cover Banner"
              description="Panoramic fabric banner displayed across your shop storefront."
              placeholderText="Paste image URL or upload file..."
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-gray-100 flex justify-end">
          <button
            type="submit"
            className="bg-[#0F5C3A] hover:bg-[#1A7A4F] text-white text-xs font-bold px-6 py-3 rounded-xl flex items-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Stall Profile</span>
          </button>
        </div>
      </form>
    </div>
  );
};
