import React from 'react';
import { ShieldAlert } from 'lucide-react';

/** Directory disclaimer. `compact` is the slim strip used on shop pages; `dark` suits the footer. */
export const Disclaimer: React.FC<{ compact?: boolean; dark?: boolean }> = ({ compact = false, dark = false }) => (
  <div
    role="note"
    className={`flex items-start gap-3 rounded-xl border ${
      compact ? 'px-3 py-2 text-[11px]' : 'px-4 py-3 text-xs'
    } ${
      dark
        ? 'bg-amber-500/10 border-amber-500/30 text-amber-100'
        : 'bg-amber-50 border-amber-200 text-amber-900'
    }`}
  >
    <ShieldAlert className={`shrink-0 ${compact ? 'w-4 h-4' : 'w-5 h-5'} ${dark ? 'text-amber-300' : 'text-amber-600'}`} />
    <p className="leading-relaxed">
      <strong>Disclaimer:</strong> Azam Market Online is a listings directory. We do not take responsibility for any
      transaction between buyers and vendors.{' '}
      <strong>Talk, verify, then trade.</strong>
    </p>
  </div>
);
