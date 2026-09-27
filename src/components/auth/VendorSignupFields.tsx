import React, { useState } from 'react';
import { ShieldCheck, Instagram, Globe, MapPin } from 'lucide-react';
import { Category } from '../../types';

export interface VendorSignupData {
  shopName: string;
  shopAddress: string;
  whatsapp: string;
  email: string;
  description: string;
  categoryIds: string[];
  cnic: string;
  ntn: string;
  website: string;
  instagram: string;
  tiktok: string;
  googleUrl: string;
}

interface VendorSignupFieldsProps {
  categories: Category[];
  loading: boolean;
  onSubmit: (data: VendorSignupData) => void;
}

export const VendorSignupFields: React.FC<VendorSignupFieldsProps> = ({
  categories,
  loading,
  onSubmit,
}) => {
  const [shopName, setShopName] = useState('');
  const [shopAddress, setShopAddress] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [description, setDescription] = useState('');
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [cnic, setCnic] = useState('');
  const [ntn, setNtn] = useState('');
  const [website, setWebsite] = useState('');
  const [instagram, setInstagram] = useState('');
  const [tiktok, setTiktok] = useState('');
  const [googleUrl, setGoogleUrl] = useState('');
  const [catError, setCatError] = useState('');

  const toggleCategory = (id: string) => {
    setCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (categoryIds.length === 0) {
      setCatError('Select at least one fabric category.');
      return;
    }
    setCatError('');
    onSubmit({
      shopName,
      shopAddress,
      whatsapp,
      email,
      description,
      categoryIds,
      cnic,
      ntn,
      website,
      instagram,
      tiktok,
      googleUrl,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-xs max-h-[65vh] overflow-y-auto pr-1">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2">
          <label className="font-bold text-gray-700 block mb-1">
            Business / Stall Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={shopName}
            onChange={(e) => setShopName(e.target.value)}
            placeholder="e.g. Raza Silk House"
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0F5C3A]"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="font-bold text-gray-700 flex items-center gap-1 mb-1">
            <MapPin className="w-3.5 h-3.5 text-[#0F5C3A]" />
            Shop Address <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={shopAddress}
            onChange={(e) => setShopAddress(e.target.value)}
            placeholder="e.g. Shop 14, Azam Cloth Market, Lahore"
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0F5C3A]"
          />
        </div>

        <div>
          <label className="font-bold text-gray-700 block mb-1">
            WhatsApp Number (+92) <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder="+92 300 1234567"
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0F5C3A]"
          />
        </div>

        <div>
          <label className="font-bold text-gray-700 block mb-1">
            Business Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@business.com"
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0F5C3A]"
          />
          <p className="text-[10px] text-gray-400 mt-1">We'll send your secure login link here.</p>
        </div>
      </div>

      {/* Cloth Categories */}
      <div>
        <label className="font-bold text-gray-700 block mb-1">
          Cloth Category / Categories <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {categories.map((cat) => {
            const checked = categoryIds.includes(cat.id);
            return (
              <button
                type="button"
                key={cat.id}
                onClick={() => toggleCategory(cat.id)}
                className={`p-2 rounded-xl border text-left flex items-center gap-1.5 transition-colors cursor-pointer ${
                  checked
                    ? 'bg-[#E8F5EE] border-[#0F5C3A] text-[#0F5C3A] font-bold'
                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span>{cat.icon}</span>
                <span className="truncate">{cat.name}</span>
              </button>
            );
          })}
        </div>
        {catError && <p className="text-red-600 text-[11px] mt-1">{catError}</p>}
      </div>

      {/* Business Description */}
      <div>
        <label className="font-bold text-gray-700 block mb-1">
          Business Description <span className="text-red-500">*</span>
        </label>
        <textarea
          required
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe what you sell, mill connections, MOQ, export experience..."
          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0F5C3A]"
        />
      </div>

      {/* Verification: CNIC / NTN */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 space-y-3">
        <div className="flex items-center gap-1.5 text-amber-800 font-bold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Business Verification (kept private — never shown publicly)</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="font-bold text-gray-700 block mb-1">
              CNIC Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={cnic}
              onChange={(e) => setCnic(e.target.value)}
              placeholder="35202-1234567-1"
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0F5C3A]"
            />
          </div>
          <div>
            <label className="font-bold text-gray-700 block mb-1">
              NTN (if registered)
            </label>
            <input
              type="text"
              value={ntn}
              onChange={(e) => setNtn(e.target.value)}
              placeholder="1234567-8"
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0F5C3A]"
            />
          </div>
        </div>
      </div>

      {/* Optional online presence */}
      <div className="space-y-2">
        <label className="font-bold text-gray-700 flex items-center gap-1.5">
          <Globe className="w-3.5 h-3.5 text-[#C9952A]" />
          Website & Social Links (if any)
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <input
            type="url"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="Website URL"
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0F5C3A]"
          />
          <input
            type="url"
            value={googleUrl}
            onChange={(e) => setGoogleUrl(e.target.value)}
            placeholder="Google Maps / Business URL"
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0F5C3A]"
          />
          <input
            type="url"
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
            placeholder="Instagram URL"
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0F5C3A]"
          />
          <input
            type="url"
            value={tiktok}
            onChange={(e) => setTiktok(e.target.value)}
            placeholder="TikTok URL"
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0F5C3A]"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#0F5C3A] hover:bg-[#1A7A4F] disabled:opacity-60 text-white font-bold py-3 rounded-xl shadow-md flex items-center justify-center gap-1.5"
      >
        {loading ? 'Submitting...' : 'Submit & Send Login Link'}
      </button>
      <p className="text-[10px] text-gray-400 text-center flex items-center justify-center gap-1">
        <Instagram className="w-3 h-3" /> Your stall goes live after Aargard review approves it.
      </p>
    </form>
  );
};
