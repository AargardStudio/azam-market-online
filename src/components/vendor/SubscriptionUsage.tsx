import React from 'react';
import { ShieldCheck, Check, Sparkles, Clock, AlertTriangle, Loader2 } from 'lucide-react';
import { Vendor, SubscriptionTier } from '../../types';

interface SubscriptionUsageProps {
  vendor: Vendor;
  tiers: SubscriptionTier[];
  onSubscribe: (vendorId: string) => void;
  subscribeLoading: boolean;
}

export const SubscriptionUsage: React.FC<SubscriptionUsageProps> = ({
  vendor,
  tiers,
  onSubscribe,
  subscribeLoading,
}) => {
  const isActive = vendor.subscription_status === 'active';
  const isPastDue = vendor.subscription_status === 'past_due';
  const isCanceled = vendor.subscription_status === 'canceled';
  const trialEndsAt = vendor.trial_ends_at ? new Date(vendor.trial_ends_at) : null;
  const daysLeft = trialEndsAt
    ? Math.ceil((trialEndsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0;
  const isTrialing = vendor.subscription_status === 'trialing';
  const trialExpired = isTrialing && daysLeft <= 0;
  const isLive = isActive || (isTrialing && !trialExpired);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-2">
        <span className="text-xs font-bold text-[#C9952A] uppercase tracking-wider">
          Vendor Membership
        </span>
        <h2 className="font-serif text-2xl font-bold text-gray-900">Subscription</h2>
        <p className="text-xs text-gray-500">
          Azam Market Online is a flat <strong className="text-gray-900">$5 / month</strong> subscription per shop —
          no tiers, no surprises. New shops get a 30-day free trial before billing starts.
        </p>
      </div>

      {/* Status banner */}
      {isActive && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-[#0F5C3A] shrink-0" />
          <div>
            <div className="font-bold text-sm text-[#0F5C3A]">Subscription active</div>
            <p className="text-xs text-emerald-800/80 mt-0.5">
              Your shop is live in the Azam Market Online directory. Thank you for subscribing!
            </p>
          </div>
        </div>
      )}

      {isPastDue && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-5 flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0" />
          <div>
            <div className="font-bold text-sm text-amber-900">Payment past due</div>
            <p className="text-xs text-amber-800/80 mt-0.5">
              Your last payment didn't go through. Please update your card to keep your shop visible.
            </p>
          </div>
        </div>
      )}

      {(isTrialing || isCanceled) && (
        <div
          className={`rounded-2xl p-5 flex items-center gap-3 border ${
            trialExpired || isCanceled
              ? 'bg-red-50 border-red-200'
              : 'bg-amber-50 border-amber-200'
          }`}
        >
          {trialExpired || isCanceled ? (
            <AlertTriangle className="w-6 h-6 text-red-600 shrink-0" />
          ) : (
            <Clock className="w-6 h-6 text-amber-600 shrink-0" />
          )}
          <div>
            <div className={`font-bold text-sm ${trialExpired || isCanceled ? 'text-red-900' : 'text-amber-900'}`}>
              {isCanceled
                ? 'Subscription canceled'
                : trialExpired
                ? 'Your free trial has ended'
                : `${daysLeft} day${daysLeft === 1 ? '' : 's'} left in your free trial`}
            </div>
            <p className={`text-xs mt-0.5 ${trialExpired || isCanceled ? 'text-red-800/80' : 'text-amber-800/80'}`}>
              {isLive
                ? 'Your shop is visible in the directory during your trial.'
                : 'Your shop is hidden from the public directory until you subscribe.'}
            </p>
          </div>
        </div>
      )}

      {/* Subscribe card */}
      {!isActive && (
        <div className="rounded-2xl border border-[#0F5C3A] bg-gradient-to-b from-emerald-50/60 to-white p-6 space-y-5 shadow-md">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-lg text-gray-900">Azam Market Online — Standard</h3>
            <Sparkles className="w-5 h-5 text-[#C9952A]" />
          </div>

          <div className="font-serif text-4xl font-bold text-gray-900">
            $5 <span className="text-sm font-normal text-gray-500">/ month</span>
          </div>

          <ul className="space-y-2 text-xs text-gray-700 pt-2 border-t border-gray-100">
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-[#0F5C3A]" />
              <span>Your shop listed in the public directory</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-[#0F5C3A]" />
              <span>Up to {vendor.tier?.max_products ?? 10} products with your own pricing</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-[#0F5C3A]" />
              <span>PDF catalogue upload</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-[#0F5C3A]" />
              <span>WhatsApp, call & SMS inquiries with analytics</span>
            </li>
          </ul>

          <button
            onClick={() => onSubscribe(vendor.id)}
            disabled={subscribeLoading}
            className="w-full bg-[#0F5C3A] hover:bg-[#1A7A4F] disabled:opacity-60 text-white font-bold text-sm py-3 rounded-xl transition-colors cursor-pointer shadow-sm flex items-center justify-center gap-2"
          >
            {subscribeLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Redirecting to checkout...</span>
              </>
            ) : (
              <span>Subscribe – $5 / month</span>
            )}
          </button>
          <p className="text-[11px] text-gray-400 text-center">
            Secure checkout powered by Stripe. Cancel anytime.
          </p>
        </div>
      )}
    </div>
  );
};
