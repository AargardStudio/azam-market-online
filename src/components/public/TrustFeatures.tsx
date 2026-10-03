import React from 'react';
import { BadgeCheck, Building2, HandCoins, Rocket } from 'lucide-react';

const FEATURES = [
  {
    icon: BadgeCheck,
    title: 'Quality',
    desc: 'Verified stalls and inspected fabric quality you can trust.',
  },
  {
    icon: Building2,
    title: "Largest Textile Market",
    desc: "Lahore's largest wholesale cloth market, now online.",
  },
  {
    icon: HandCoins,
    title: 'Direct Dealing, No Commissions',
    desc: 'Deal directly with stall owners — no middlemen, no hidden fees.',
  },
  {
    icon: Rocket,
    title: 'Start Your Retail Business',
    desc: 'Source wholesale stock and launch your own retail venture.',
  },
];

export const TrustFeatures: React.FC = () => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {FEATURES.map(({ icon: Icon, title, desc }) => (
        <div
          key={title}
          className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col items-center text-center gap-2 hover:border-[#0F5C3A]/40 hover:shadow-md transition-all"
        >
          <div className="w-12 h-12 rounded-xl bg-[#0F5C3A]/10 flex items-center justify-center text-[#0F5C3A]">
            <Icon className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-sm sm:text-base font-bold text-gray-900 leading-tight">
            {title}
          </h3>
          <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
        </div>
      ))}
    </div>
  );
};
