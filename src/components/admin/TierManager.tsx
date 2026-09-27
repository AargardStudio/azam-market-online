import React from 'react';
import { CreditCard, Check, ShieldCheck } from 'lucide-react';
import { SubscriptionTier } from '../../types';

interface TierManagerProps {
  tiers: SubscriptionTier[];
}

export const TierManager: React.FC<TierManagerProps> = ({ tiers }) => {
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-1">
        <h2 className="font-serif text-2xl font-bold text-gray-900">
          Subscription Tiers & Monetization Settings
        </h2>
        <p className="text-xs text-gray-500">
          Aargard Business Solutions monthly subscription plan rates and upload caps.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tiers.map((t) => (
          <div key={t.id} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-lg text-gray-900">{t.display_name}</h3>
              {t.has_verified_badge && <ShieldCheck className="w-5 h-5 text-[#C9952A]" />}
            </div>

            <div className="font-serif text-3xl font-bold text-[#0F5C3A]">
              ₨{t.price_pkr.toLocaleString()} <span className="text-xs font-normal text-gray-500">PKR / mo</span>
            </div>

            <ul className="space-y-2 text-xs text-gray-700 pt-2 border-t border-gray-100">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#0F5C3A]" />
                <span>Max Products: <strong>{t.max_products === -1 ? 'Unlimited' : t.max_products}</strong></span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#0F5C3A]" />
                <span>PDF Catalogues: <strong>{t.max_catalogues === -1 ? 'Unlimited' : t.max_catalogues}</strong></span>
              </li>
              <li className="flex items-center gap-2">
                <Check className={`w-4 h-4 ${t.has_analytics ? 'text-[#0F5C3A]' : 'text-gray-300'}`} />
                <span className={t.has_analytics ? '' : 'text-gray-400 line-through'}>Analytics Enabled</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className={`w-4 h-4 ${t.has_verified_badge ? 'text-[#0F5C3A]' : 'text-gray-300'}`} />
                <span className={t.has_verified_badge ? '' : 'text-gray-400 line-through'}>Verified Badge</span>
              </li>
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};
