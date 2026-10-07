import React, { useState, useEffect, useRef } from 'react';
import { Save, Palette, ArrowRight, Loader2, Undo2 } from 'lucide-react';
import { Vendor, Category } from '../../types';
import { ImageUploader } from '../common/ImageUploader';
import { ErrorBanner, SaveStatus, useUnsavedChangesGuard, RegisterSaver } from './SaveFeedback';
import { describeError } from '../../lib/errors';

interface ShopProfileFormProps {
  vendor: Vendor;
  allCategories: Category[];
  onSaveProfile: (updatedData: Partial<Vendor>) => void | Promise<void>;
  onOpenCustomizer?: () => void;
  registerSaver?: RegisterSaver;
}

export const ShopProfileForm: React.FC<ShopProfileFormProps> = ({
  vendor,
  allCategories,
  onSaveProfile,
  onOpenCustomizer,
  registerSaver,
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
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  // What is currently typed in the form, and what was last saved. Anything
  // different between the two means there are unsaved edits.
  const current = {
    shopName,
    stallNumber,
    whatsapp,
    email,
    website,
    description,
    logoUrl,
    coverUrl,
    tagsInput,
    selectedCatIds: [...selectedCatIds].sort(),
  };
  const [baseline, setBaseline] = useState(current);
  const dirty = JSON.stringify(current) !== JSON.stringify(baseline);
  useUnsavedChangesGuard(dirty);

  const handleDiscard = () => {
    setShopName(baseline.shopName);
    setStallNumber(baseline.stallNumber);
    setWhatsapp(baseline.whatsapp);
    setEmail(baseline.email);
    setWebsite(baseline.website);
    setDescription(baseline.description);
    setLogoUrl(baseline.logoUrl);
    setCoverUrl(baseline.coverUrl);
    setTagsInput(baseline.tagsInput);
    setSelectedCatIds(baseline.selectedCatIds);
    setSaveError('');
  };

  /** Returns null on success, or the error message. */
  const doSave = async (): Promise<string | null> => {
    const tagsArr = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const chosenCats = allCategories.filter((c) => selectedCatIds.includes(c.id));

    setIsSaving(true);
    setSaveError('');
    try {
      await onSaveProfile({
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
      setBaseline(current);
      setSavedAt(new Date());
      return null;
    } catch (err) {
      const msg = describeError(err, 'Could not save your stall profile.');
      setSaveError(msg);
      return msg;
    } finally {
      setIsSaving(false);
    }
  };

  // Let the dashboard's "Save all changes" button save this form too.
  const doSaveRef = useRef(doSave);
  doSaveRef.current = doSave;
  useEffect(() => {
    registerSaver?.('profile', {
      label: 'Shop profile',
      dirty,
      save: async () => {
        const msg = await doSaveRef.current();
        if (msg) throw new Error(msg);
      },
    });
  }, [dirty]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => registerSaver?.('profile', null), []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dirty || isSaving) return;
    void doSave();
  };

  const MAX_CATEGORIES = 3;
  const [catLimitMsg, setCatLimitMsg] = useState('');

  const toggleCategory = (catId: string) => {
    if (selectedCatIds.includes(catId)) {
      setSelectedCatIds(selectedCatIds.filter((id) => id !== catId));
      setCatLimitMsg('');
    } else if (selectedCatIds.length >= MAX_CATEGORIES) {
      setCatLimitMsg(`You can select up to ${MAX_CATEGORIES} categories.`);
    } else {
      setSelectedCatIds([...selectedCatIds, catId]);
      setCatLimitMsg('');
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

        <SaveStatus dirty={dirty} saving={isSaving} savedAt={savedAt} hasError={!!saveError} />
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
            Fabric Categories Handled (select up to {MAX_CATEGORIES}):
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {allCategories.map((cat) => {
              const checked = selectedCatIds.includes(cat.id);
              const disabled = !checked && selectedCatIds.length >= MAX_CATEGORIES;
              return (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => toggleCategory(cat.id)}
                  disabled={disabled}
                  className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2 ${
                    checked
                      ? 'bg-[#E8F5EE] border-[#0F5C3A] text-[#0F5C3A] font-bold cursor-pointer'
                      : disabled
                      ? 'bg-gray-50 border-gray-200 text-gray-300 cursor-not-allowed'
                      : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 cursor-pointer'
                  }`}
                >
                  <span className="text-base">{cat.icon}</span>
                  <span className="truncate">{cat.name}</span>
                </button>
              );
            })}
          </div>
          <p className="text-[11px] text-gray-400">
            {selectedCatIds.length}/{MAX_CATEGORIES} selected
          </p>
          {catLimitMsg && <p className="text-red-600 text-[11px]">{catLimitMsg}</p>}
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

        {/* Sticky Save Bar: always reachable while editing a long form */}
        <div className="sticky bottom-0 -mx-6 -mb-6 px-6 py-4 bg-white/95 backdrop-blur-sm border-t border-gray-200 rounded-b-2xl space-y-3">
          {saveError && (
            <ErrorBanner
              message={saveError}
              onDismiss={() => setSaveError('')}
              onRetry={dirty ? () => void doSave() : undefined}
            />
          )}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <SaveStatus dirty={dirty} saving={isSaving} savedAt={savedAt} hasError={!!saveError} />
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDiscard}
                disabled={!dirty || isSaving}
                className="text-xs font-bold px-4 py-3 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer"
              >
                <Undo2 className="w-4 h-4" />
                <span>Discard changes</span>
              </button>
              <button
                type="submit"
                disabled={!dirty || isSaving}
                className="bg-[#0F5C3A] hover:bg-[#1A7A4F] disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-xs font-bold px-6 py-3 rounded-xl flex items-center gap-2 shadow-md transition-all cursor-pointer"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>{isSaving ? 'Saving…' : 'Save Stall Profile'}</span>
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
