import React, { useState } from 'react';
import {
  Store,
  MapPin,
  Phone,
  MessageCircle,
  Package,
  ShieldCheck,
  Globe,
  CheckCircle2,
  Loader2,
  ArrowLeft,
  Award,
  Mail,
} from 'lucide-react';
import { Category, SubscriptionTier, Market } from '../../types';
import { supabase } from '../../lib/supabaseClient';

interface VendorRegisterPageProps {
  markets: Market[];
  categories: Category[];
  tiers: SubscriptionTier[];
  onExit: () => void;
}

const slugify = (s: string) =>
  `${s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')}-${Date.now().toString(36)}`;

export const VendorRegisterPage: React.FC<VendorRegisterPageProps> = ({
  markets,
  categories,
  tiers,
  onExit,
}) => {
  // Account creation
  const [shopName, setShopName] = useState('');
  const [email, setEmail] = useState('');

  // Registration details
  const [marketId, setMarketId] = useState('');
  const [shopAddress, setShopAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [productsOffered, setProductsOffered] = useState('');
  const [description, setDescription] = useState('');
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [tierId, setTierId] = useState<string>('');
  const [cnic, setCnic] = useState('');
  const [ntn, setNtn] = useState('');
  const [website, setWebsite] = useState('');
  const [instagram, setInstagram] = useState('');
  const [tiktok, setTiktok] = useState('');
  const [googleUrl, setGoogleUrl] = useState('');

  const [catError, setCatError] = useState('');
  const [marketError, setMarketError] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Retired tiers (unavailable AND free, e.g. the old Basic plan) are
  // dropped entirely -- they're not coming back. An unavailable PAID tier
  // (e.g. Premium while it's paused) still shows up, just disabled, so
  // vendors know it exists.
  const sortedTiers = [...tiers]
    .filter((t) => t.is_available || t.price_usd > 0)
    .sort((a, b) => a.price_usd - b.price_usd);
  const effectiveTierId = tierId || sortedTiers.find((t) => t.is_available)?.id || sortedTiers[0]?.id || 't-standard';
  const effectiveMarketId = marketId;

  const MAX_CATEGORIES = 3;

  const toggleCategory = (id: string) => {
    setCategoryIds((prev) => {
      if (prev.includes(id)) return prev.filter((c) => c !== id);
      if (prev.length >= MAX_CATEGORIES) {
        setCatError(`You can select up to ${MAX_CATEGORIES} categories.`);
        return prev;
      }
      setCatError('');
      return [...prev, id];
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let hasValidationError = false;
    if (!effectiveMarketId) {
      setMarketError('Select which market your stall is in.');
      hasValidationError = true;
    } else {
      setMarketError('');
    }
    if (categoryIds.length === 0) {
      setCatError('Select at least one fabric category.');
      hasValidationError = true;
    } else {
      setCatError('');
    }
    if (hasValidationError) return;
    setError('');
    setLoading(true);

    try {
      const vendorId = crypto.randomUUID();
      const slug = slugify(shopName || 'stall');

      // No .select() here on purpose -- this vendor row is 'pending' and has
      // no user_id yet, so RLS hides it from the anon role that just
      // created it. return=minimal (the default without .select()) skips
      // that blocked read entirely; we already have the id we generated.
      const { error: vendorErr } = await supabase.from('vendors').insert({
        id: vendorId,
        market_id: effectiveMarketId,
        tier_id: effectiveTierId,
        slug,
        shop_name: shopName,
        shop_address: shopAddress,
        phone: phone || null,
        whatsapp,
        email: email.trim(),
        description,
        products_offered: productsOffered || null,
        website: website || null,
        instagram_url: instagram || null,
        tiktok_url: tiktok || null,
        google_url: googleUrl || null,
        status: 'pending',
      });

      if (vendorErr) {
        if ((vendorErr as any).code === '23505') {
          throw new Error('An account with this email already exists. Try logging in instead.');
        }
        throw vendorErr;
      }

      const { error: catErr } = await supabase
        .from('vendor_categories')
        .insert(categoryIds.map((categoryId) => ({ vendor_id: vendorId, category_id: categoryId })));
      if (catErr) console.error('Error assigning categories:', catErr);

      const { error: verErr } = await supabase.from('vendor_verification').insert({
        vendor_id: vendorId,
        cnic,
        ntn: ntn || null,
      });
      if (verErr) console.error('Error saving verification details:', verErr);

      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { emailRedirectTo: window.location.origin },
      });
      if (otpError) throw otpError;

      setSuccess(true);
    } catch (err: any) {
      setError(err?.message || 'Something went wrong submitting your registration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-xl text-center space-y-4">
          <CheckCircle2 className="w-14 h-14 text-[#0F5C3A] mx-auto" />
          <h2 className="font-serif text-2xl font-bold text-gray-900">Check your email</h2>
          <p className="text-sm text-gray-600">
            We sent a secure login link to <strong>{email}</strong>. Open it on this device to
            sign in. Your stall will go live after a quick Aargard review.
          </p>
          <button
            onClick={onExit}
            className="w-full bg-[#0F5C3A] hover:bg-[#1A7A4F] text-white font-bold py-3 rounded-xl shadow-md"
          >
            Back to Directory
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page header */}
      <div className="bg-[#0F5C3A] text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 flex items-center gap-4">
          <button
            onClick={onExit}
            className="flex items-center gap-1 text-emerald-100 hover:text-white text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div className="flex items-center gap-3">
            <img src="/icon-192.png" alt="Azam Market Online" className="w-11 h-11 rounded-xl" />
            <div>
              <h1 className="font-serif text-xl sm:text-2xl font-bold">Create Your Vendor Account</h1>
              <p className="text-emerald-100 text-xs">Azam Market Online — Wholesale Fabric Directory</p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {error && (
          <div className="bg-red-50 text-red-700 border border-red-200 text-sm p-3 rounded-xl">
            {error}
          </div>
        )}

        {/* ------------------------------------------------------------ */}
        {/* SECTION 1: ACCOUNT CREATION                                   */}
        {/* ------------------------------------------------------------ */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-[#0F5C3A] text-white text-xs font-bold flex items-center justify-center">1</span>
            <h2 className="font-serif text-lg font-bold text-gray-900">Account Creation</h2>
          </div>
          <p className="text-xs text-gray-500">
            This is how buyers will find your stall, and where we'll send your secure login link.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="sm:col-span-2">
              <label className="font-bold text-gray-700 flex items-center gap-1 mb-1">
                <Store className="w-3.5 h-3.5 text-[#0F5C3A]" />
                Business / Stall Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                placeholder="e.g. Raza Silk House"
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0F5C3A]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-bold text-gray-700 flex items-center gap-1 mb-1">
                <Mail className="w-3.5 h-3.5 text-[#0F5C3A]" />
                Business Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@business.com"
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0F5C3A]"
              />
              <p className="text-[10px] text-gray-400 mt-1">We'll send your secure login link here — no password needed.</p>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------ */}
        {/* SECTION 2: REGISTRATION                                       */}
        {/* ------------------------------------------------------------ */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-5">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-[#0F5C3A] text-white text-xs font-bold flex items-center justify-center">2</span>
            <h2 className="font-serif text-lg font-bold text-gray-900">Business Registration</h2>
          </div>
          <p className="text-xs text-gray-500">
            Tell us about your business — your stall goes live after a quick Aargard review.
          </p>

          {/* Market */}
          <div>
            <label className="font-bold text-gray-700 block mb-1.5 text-xs">
              Market <span className="text-red-500">*</span>
            </label>
            {marketError && <p className="text-red-600 text-[11px] mb-1.5">{marketError}</p>}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {markets.map((m) => {
                const checked = effectiveMarketId === m.id;
                return (
                  <button
                    type="button"
                    key={m.id}
                    onClick={() => setMarketId(m.id)}
                    className={`p-2.5 rounded-xl border text-left transition-colors cursor-pointer ${
                      checked
                        ? 'bg-[#E8F5EE] border-[#0F5C3A] text-[#0F5C3A]'
                        : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="font-bold text-xs block truncate">{m.name}</span>
                    <span className="text-[10px] text-gray-400">{m.city}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
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
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0F5C3A]"
              />
            </div>

            <div>
              <label className="font-bold text-gray-700 flex items-center gap-1 mb-1">
                <Phone className="w-3.5 h-3.5 text-[#0F5C3A]" />
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+92 42 1234567"
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0F5C3A]"
              />
            </div>

            <div>
              <label className="font-bold text-gray-700 flex items-center gap-1 mb-1">
                <MessageCircle className="w-3.5 h-3.5 text-[#0F5C3A]" />
                WhatsApp Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="+92 300 1234567"
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0F5C3A]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-bold text-gray-700 flex items-center gap-1 mb-1">
                <Package className="w-3.5 h-3.5 text-[#0F5C3A]" />
                Products You Sell <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={2}
                value={productsOffered}
                onChange={(e) => setProductsOffered(e.target.value)}
                placeholder="e.g. Lawn suits, Chiffon dupattas, Pure silk by the yard, Winter shawls"
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0F5C3A]"
              />
              <p className="text-[10px] text-gray-400 mt-1">
                A quick list for now — you'll add up to 10 full product listings with pricing once your account is live.
              </p>
            </div>

            <div className="sm:col-span-2">
              <label className="font-bold text-gray-700 block mb-1">
                Business Description <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what you sell, mill connections, MOQ, export experience..."
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0F5C3A]"
              />
            </div>
          </div>

          {/* Cloth Categories */}
          <div>
            <label className="font-bold text-gray-700 block mb-1.5 text-xs">
              Cloth Category / Categories <span className="text-red-500">*</span>
              <span className="font-normal text-gray-400"> (select up to {MAX_CATEGORIES})</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {categories.map((cat) => {
                const checked = categoryIds.includes(cat.id);
                const disabled = !checked && categoryIds.length >= MAX_CATEGORIES;
                return (
                  <button
                    type="button"
                    key={cat.id}
                    onClick={() => toggleCategory(cat.id)}
                    disabled={disabled}
                    className={`p-2 rounded-xl border text-left flex items-center gap-1.5 text-xs transition-colors ${
                      checked
                        ? 'bg-[#E8F5EE] border-[#0F5C3A] text-[#0F5C3A] font-bold cursor-pointer'
                        : disabled
                        ? 'bg-gray-50 border-gray-200 text-gray-300 cursor-not-allowed'
                        : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 cursor-pointer'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span className="truncate">{cat.name}</span>
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-gray-400 mt-1">
              {categoryIds.length}/{MAX_CATEGORIES} selected
            </p>
            {catError && <p className="text-red-600 text-[11px] mt-1">{catError}</p>}
          </div>

          {/* Subscription Tier */}
          <div>
            <label className="font-bold text-gray-700 block mb-1.5 text-xs">
              Subscription Tier <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {sortedTiers.map((tier) => {
                const checked = effectiveTierId === tier.id;
                const unavailable = !tier.is_available;
                return (
                  <button
                    type="button"
                    key={tier.id}
                    disabled={unavailable}
                    onClick={() => !unavailable && setTierId(tier.id)}
                    className={`relative p-3 rounded-xl border text-left transition-colors ${
                      unavailable
                        ? 'bg-gray-50 border-gray-200 opacity-60 cursor-not-allowed'
                        : checked
                        ? 'bg-[#FDF6E7] border-[#C9952A] ring-1 ring-[#C9952A] cursor-pointer'
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100 cursor-pointer'
                    }`}
                  >
                    {unavailable && (
                      <span className="absolute top-1.5 right-1.5 bg-gray-200 text-gray-500 text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                        Coming Soon
                      </span>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-900 text-xs">{tier.display_name}</span>
                      {tier.has_verified_badge && <Award className="w-3.5 h-3.5 text-[#C9952A]" />}
                    </div>
                    <p className="text-sm font-bold text-[#0F5C3A] mt-1">
                      {tier.price_usd > 0 ? `$${tier.price_usd.toLocaleString()}/mo` : 'Free'}
                    </p>
                    <p className="text-[10px] text-gray-500 mt-0.5">
                      {tier.max_products === -1 ? 'Unlimited products' : `Up to ${tier.max_products} products`}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Verification: CNIC / NTN */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 space-y-3">
            <div className="flex items-center gap-1.5 text-amber-800 font-bold text-xs">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Business Verification (kept private — never shown publicly)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
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
                <label className="font-bold text-gray-700 block mb-1">NTN (if registered)</label>
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

          {/* Website & Social Links */}
          <div className="space-y-2">
            <label className="font-bold text-gray-700 flex items-center gap-1.5 text-xs">
              <Globe className="w-3.5 h-3.5 text-[#C9952A]" />
              Website & Social Media Links (if any)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
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
        </section>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#0F5C3A] hover:bg-[#1A7A4F] disabled:opacity-60 text-white font-bold py-3.5 rounded-xl shadow-md flex items-center justify-center gap-1.5 text-sm"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <span>Submit Registration & Send Login Link</span>
          )}
        </button>
        <p className="text-[10px] text-gray-400 text-center pb-6">
          By registering you agree to Azam Market Online's vendor review process. Your CNIC/NTN are kept private.
        </p>
      </form>
    </div>
  );
};
