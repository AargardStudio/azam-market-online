import React, { useState } from 'react';
import { ShieldCheck, Check, Award, Sparkles, Star, Zap } from 'lucide-react';
import { Vendor, SubscriptionTier } from '../../types';

interface SubscriptionUsageProps {
  vendor: Vendor;
  tiers: SubscriptionTier[];
  onUpgradeTier: (vendorId: string, tierId: string) => void;
}

export const SubscriptionUsage: React.FC<SubscriptionUsageProps> = ({
  vendor,
  tiers,
  onUpgradeTier,
}) => {
  const [upgradedMsg, setUpgradedMsg] = useState(false);

  const handleSelectTier = (t: SubscriptionTier) => {
    onUpgradeTier(vendor.id, t.id);
    setUpgradedMsg(true);
    setTimeout(() => setUpgradedMsg(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-1">
        <span className="text-xs font-bold text-[#C9952A] uppercase tracking-wider">
          Vendor Membership
        </span>
        <h2 className="font-serif text-2xl font-bold text-gray-900">
          Subscription Tiers & Feature Caps
        </h2>
        <p className="text-xs text-gray-500">
          Current Plan: <strong className="text-gray-900 capitalize">{vendor.tier?.display_name || 'Standard'} Tier</strong> (₨{vendor.tier?.price_pkr.toLocaleString()} PKR / mo)
        </p>

        {upgradedMsg && (
          <div className="mt-3 bg-emerald-50 text-[#0F5C3A] text-xs font-bold p-3 rounded-xl border border-emerald-200">
            ✓ Subscription Tier updated! Product & catalogue limits have been expanded.
          </div>
        )}
      </div>

      {/* Tier Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tiers.map((t) => {
          const isCurrent = vendor.tier_id === t.id;
          const isPremium = t.name === 'premium';

          return (
            <div
              key={t.id}
              className={`rounded-2xl border p-6 flex flex-col justify-between space-y-6 relative transition-all ${
                isCurrent
                  ? 'bg-white border-[#0F5C3A] shadow-xl ring-2 ring-[#0F5C3A]'
                  : isPremium
                  ? 'bg-gradient-to-b from-amber-50/50 to-white border-[#C9952A] shadow-md'
                  : 'bg-white border-gray-200 shadow-2xs'
              }`}
            >
              {isCurrent && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#0F5C3A] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Active Subscription
                </span>
              )}

              {isPremium && !isCurrent && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#C9952A] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Recommended
                </span>
              )}

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif font-bold text-lg text-gray-900">{t.display_name}</h3>
                  {t.has_verified_badge && (
                    <Award className="w-5 h-5 text-[#C9952A]" />
                  )}
                </div>

                <div className="font-serif text-3xl font-bold text-gray-900">
                  ₨{t.price_pkr.toLocaleString()} <span className="text-xs font-normal text-gray-500">/ month</span>
                </div>

                <ul className="space-y-2 text-xs text-gray-700 pt-2 border-t border-gray-100">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#0F5C3A]" />
                    <span>Max Products: <strong>{t.max_products === -1 ? 'Unlimited' : t.max_products}</strong></span>
                  </li>

                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#0F5C3A]" />
                    <span>PDF Lookbooks: <strong>{t.max_catalogues === -1 ? 'Unlimited' : t.max_catalogues}</strong></span>
                  </li>

                  <li className="flex items-center gap-2">
                    <Check className={`w-4 h-4 ${t.has_analytics ? 'text-[#0F5C3A]' : 'text-gray-300'}`} />
                    <span className={t.has_analytics ? '' : 'text-gray-400 line-through'}>Analytics Dashboard</span>
                  </li>

                  <li className="flex items-center gap-2">
                    <Check className={`w-4 h-4 ${t.has_verified_badge ? 'text-[#0F5C3A]' : 'text-gray-300'}`} />
                    <span className={t.has_verified_badge ? '' : 'text-gray-400 line-through'}>Gold Verified Badge</span>
                  </li>

                  <li className="flex items-center gap-2">
                    <Check className={`w-4 h-4 ${t.has_featured_placement ? 'text-[#0F5C3A]' : 'text-gray-300'}`} />
                    <span className={t.has_featured_placement ? '' : 'text-gray-400 line-through'}>Homepage Featured Slot</span>
                  </li>
                </ul>
              </div>

              <div>
                {isCurrent ? (
                  <button disabled className="w-full bg-emerald-100 text-[#0F5C3A] font-bold text-xs py-2.5 rounded-xl cursor-default">
                    Current Active Tier
                  </button>
                ) : (
                  <button
                    onClick={() => handleSelectTier(t)}
                    className="w-full bg-[#0F5C3A] hover:bg-[#1A7A4F] text-white font-bold text-xs py-2.5 rounded-xl transition-colors cursor-pointer shadow-sm"
                  >
                    Switch to {t.display_name}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
