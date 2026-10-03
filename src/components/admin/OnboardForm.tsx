import React, { useState } from 'react';
import { UserPlus, CheckCircle2, Award, ShieldCheck } from 'lucide-react';
import { Market, Category, SubscriptionTier, Vendor } from '../../types';

interface OnboardFormProps {
  markets: Market[];
  categories: Category[];
  tiers: SubscriptionTier[];
  onOnboardVendor: (vendorData: Partial<Vendor>) => void;
}

export const OnboardForm: React.FC<OnboardFormProps> = ({
  markets,
  categories,
  tiers,
  onOnboardVendor,
}) => {
  const [shopName, setShopName] = useState('');
  const [stallNumber, setStallNumber] = useState('');
  const [marketId, setMarketId] = useState(markets[0]?.id || 'm-azam-1');
  const [tierId, setTierId] = useState(tiers[1]?.id || 't-standard');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [description, setDescription] = useState('');
  const [isVerified, setIsVerified] = useState(true);
  const [selectedCatIds, setSelectedCatIds] = useState<string[]>([categories[0]?.id || 'c-silk']);
  const [successMsg, setSuccessMsg] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onOnboardVendor({
      shop_name: shopName,
      stall_number: stallNumber,
      market_id: marketId,
      tier_id: tierId,
      whatsapp,
      email,
      description: description || `Verified wholesale fabric vendor in ${markets.find(m=>m.id===marketId)?.name || 'Azam Cloth Market'}.`,
      is_verified: isVerified,
      status: 'active',
      category_ids: selectedCatIds,
    } as any);

    setSuccessMsg(true);
    setShopName('');
    setStallNumber('');
    setWhatsapp('');
    setEmail('');
    setDescription('');
    setTimeout(() => setSuccessMsg(false), 4000);
  };

  const MAX_CATEGORIES = 3;
  const [catLimitMsg, setCatLimitMsg] = useState('');

  const toggleCategory = (id: string) => {
    if (selectedCatIds.includes(id)) {
      setSelectedCatIds(selectedCatIds.filter((c) => c !== id));
      setCatLimitMsg('');
    } else if (selectedCatIds.length >= MAX_CATEGORIES) {
      setCatLimitMsg(`You can select up to ${MAX_CATEGORIES} categories.`);
    } else {
      setSelectedCatIds([...selectedCatIds, id]);
      setCatLimitMsg('');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs p-6 max-w-3xl">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
        <div>
          <h2 className="font-serif text-xl font-bold text-gray-900">
            Onboard New Market Stall Vendor
          </h2>
          <p className="text-xs text-gray-500">
            Register new fabric stall owners into the Azam Market B2B directory.
          </p>
        </div>

        {successMsg && (
          <span className="bg-emerald-50 text-[#0F5C3A] text-xs font-bold px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#0F5C3A]" /> Vendor Onboarded & Active!
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="font-bold text-gray-700 block mb-1">
              Shop / Stall Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              placeholder="e.g. Mughal Fabric Traders"
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl"
            />
          </div>

          <div>
            <label className="font-bold text-gray-700 block mb-1">
              Stall Number / Location <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={stallNumber}
              onChange={(e) => setStallNumber(e.target.value)}
              placeholder="e.g. Stall B-14, Main Azam Market"
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl"
            />
          </div>

          <div>
            <label className="font-bold text-gray-700 block mb-1">
              Market Location <span className="text-red-500">*</span>
            </label>
            <select
              value={marketId}
              onChange={(e) => setMarketId(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl"
            >
              {markets.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.city})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-bold text-gray-700 block mb-1">
              Subscription Plan <span className="text-red-500">*</span>
            </label>
            <select
              value={tierId}
              onChange={(e) => setTierId(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-bold text-[#0F5C3A]"
            >
              {tiers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.display_name} Tier (${t.price_usd.toLocaleString()} / mo)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-bold text-gray-700 block mb-1">
              WhatsApp Wholesale Number (+92) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="+92 300 0000000"
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl"
            />
          </div>

          <div>
            <label className="font-bold text-gray-700 block mb-1">
              Vendor Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vendor@gmail.com"
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl"
            />
          </div>
        </div>

        {/* Categories Selection */}
        <div>
          <label className="font-bold text-gray-700 block mb-1">
            Assign Fabric Categories (up to {MAX_CATEGORIES}):
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {categories.map((cat) => {
              const checked = selectedCatIds.includes(cat.id);
              const disabled = !checked && selectedCatIds.length >= MAX_CATEGORIES;
              return (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => toggleCategory(cat.id)}
                  disabled={disabled}
                  className={`p-2 rounded-xl border text-left flex items-center gap-2 ${
                    checked
                      ? 'bg-[#E8F5EE] border-[#0F5C3A] text-[#0F5C3A] font-bold cursor-pointer'
                      : disabled
                      ? 'bg-gray-50 border-gray-200 text-gray-300 cursor-not-allowed'
                      : 'bg-gray-50 border-gray-200 text-gray-700 cursor-pointer'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span className="truncate">{cat.name}</span>
                </button>
              );
            })}
          </div>
          <p className="text-[11px] text-gray-400 mt-1">
            {selectedCatIds.length}/{MAX_CATEGORIES} selected
          </p>
          {catLimitMsg && <p className="text-red-600 text-[11px] mt-1">{catLimitMsg}</p>}
        </div>

        {/* Verified Badge Checkbox */}
        <div className="pt-2">
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isVerified}
              onChange={(e) => setIsVerified(e.target.checked)}
              className="rounded border-gray-300 text-[#0F5C3A] focus:ring-[#0F5C3A]"
            />
            <span className="font-bold text-gray-800">Assign Gold Verified Stall Badge</span>
          </label>
        </div>

        <div className="pt-4 border-t border-gray-100 flex justify-end">
          <button
            type="submit"
            className="bg-[#0F5C3A] hover:bg-[#1A7A4F] text-white font-bold px-6 py-2.5 rounded-xl flex items-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Onboard & Activate Vendor</span>
          </button>
        </div>
      </form>
    </div>
  );
};
