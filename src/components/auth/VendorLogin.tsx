import React, { useState } from 'react';
import { Mail, ArrowRight, CheckCircle2, Loader2, Store, LogIn } from 'lucide-react';
import { Category, Vendor } from '../../types';
import { supabase } from '../../lib/supabaseClient';
import { VendorSignupFields, VendorSignupData } from './VendorSignupFields';

interface VendorLoginProps {
  /** Only used for the DEV-only quick-login shortcut below — never shown in production. */
  vendors: Vendor[];
  categories: Category[];
  /** DEV-only: bypass email entirely and log straight in as a sample vendor. */
  onSelectVendorToLogin: (vendor: Vendor) => void;
  onCancel: () => void;
}

const slugify = (s: string) =>
  `${s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')}-${Date.now().toString(36)}`;

export const VendorLogin: React.FC<VendorLoginProps> = ({
  vendors,
  categories,
  onSelectVendorToLogin,
  onCancel,
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [sentMagicLink, setSentMagicLink] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const sendMagicLink = async (toEmail: string) => {
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: toEmail.trim(),
      options: {
        emailRedirectTo: window.location.origin,
      },
    });
    if (otpError) throw otpError;
  };

  const handleSendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await sendMagicLink(email);
      setSentMagicLink(true);
    } catch (err: any) {
      setError(err?.message || 'Could not send the login link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (data: VendorSignupData) => {
    setError('');
    setLoading(true);
    try {
      // Every stall in this app belongs to the single default market; look
      // it up rather than hardcoding an id.
      const { data: market } = await supabase
        .from('markets')
        .select('id')
        .eq('slug', 'azam-cloth-market')
        .maybeSingle();

      const vendorId = crypto.randomUUID();
      const slug = slugify(data.shopName || 'stall');

      // No .select() here on purpose: this vendor row is 'pending' and has
      // no user_id yet, so under RLS it isn't visible to a SELECT from the
      // anon role that just created it (only an active/admin/owned row
      // is). Using return=minimal (the default without .select()) skips
      // that read entirely -- we already have the id we generated above.
      const { error: vendorErr } = await supabase.from('vendors').insert({
        id: vendorId,
        market_id: market?.id,
        tier_id: 't-basic',
        slug,
        shop_name: data.shopName,
        shop_address: data.shopAddress,
        whatsapp: data.whatsapp,
        email: data.email.trim(),
        description: data.description,
        website: data.website || null,
        instagram_url: data.instagram || null,
        tiktok_url: data.tiktok || null,
        google_url: data.googleUrl || null,
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
        .insert(data.categoryIds.map((categoryId) => ({ vendor_id: vendorId, category_id: categoryId })));
      if (catErr) console.error('Error assigning categories:', catErr);

      const { error: verErr } = await supabase.from('vendor_verification').insert({
        vendor_id: vendorId,
        cnic: data.cnic,
        ntn: data.ntn || null,
      });
      if (verErr) console.error('Error saving verification details:', verErr);

      await sendMagicLink(data.email);
      setEmail(data.email);
      setSentMagicLink(true);
    } catch (err: any) {
      setError(err?.message || 'Something went wrong submitting your registration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <img
            src="/icon-192.png"
            alt="Azam Market Online"
            className="w-14 h-14 rounded-2xl mx-auto"
          />
          <h2 className="font-serif text-2xl font-bold text-gray-900">
            {sentMagicLink ? 'Check your email' : mode === 'login' ? 'Vendor Portal Login' : 'Register Your Stall'}
          </h2>
          {!sentMagicLink && (
            <p className="text-xs text-gray-500">
              {mode === 'login'
                ? 'Enter your stall owner email to receive a secure login link.'
                : 'Tell us about your business — your stall goes live after a quick review.'}
            </p>
          )}
        </div>

        {!sentMagicLink && (
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl text-xs font-bold">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                mode === 'login' ? 'bg-white text-[#0F5C3A] shadow-xs' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Existing Vendor</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('signup')}
              className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                mode === 'signup' ? 'bg-white text-[#0F5C3A] shadow-xs' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>Register My Stall</span>
            </button>
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-700 border border-red-200 text-xs p-3 rounded-xl">
            {error}
          </div>
        )}

        {sentMagicLink ? (
          <div className="space-y-4 text-center">
            <CheckCircle2 className="w-12 h-12 text-[#0F5C3A] mx-auto" />
            <div className="space-y-1">
              <p className="text-xs text-gray-600">
                We sent a secure login link to <strong>{email}</strong>. Open it on
                this device to sign in — you can close this window.
              </p>
            </div>
            <button
              onClick={onCancel}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl text-xs transition-all cursor-pointer"
            >
              Close
            </button>
          </div>
        ) : mode === 'login' ? (
          <form onSubmit={handleSendMagicLink} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-gray-700 block mb-1">
                Stall Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  required
                  placeholder="razasilk.azam@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-semibold focus:outline-none focus:ring-2 focus:ring-[#0F5C3A]"
                />
              </div>
            </div>

            {/* DEV-ONLY shortcut: never rendered in a production build. Lets you
                test the vendor dashboard locally without waiting on a real email. */}
            {import.meta.env.DEV && vendors.length > 0 && (
              <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 space-y-1.5">
                <span className="text-[10px] font-bold text-amber-700 uppercase block">
                  Dev-only bypass (not shown in production):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {vendors.slice(0, 3).map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => onSelectVendorToLogin(v)}
                      className="bg-white hover:bg-amber-100 text-gray-800 border border-amber-200 text-[10px] font-bold px-2 py-1 rounded-md"
                    >
                      {v.shop_name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-between gap-2 pt-2">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 font-semibold text-gray-500 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-[#0F5C3A] hover:bg-[#1A7A4F] disabled:opacity-60 text-white font-bold px-5 py-2.5 rounded-xl shadow-md flex items-center gap-1.5"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Send Magic Link</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-3">
            <VendorSignupFields
              categories={categories}
              loading={loading}
              onSubmit={handleSignup}
            />
            <button
              type="button"
              onClick={onCancel}
              className="w-full text-center text-gray-500 hover:text-gray-800 font-semibold py-1"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
