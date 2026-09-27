import React from 'react';
import { Clock, CheckCircle2, XCircle, Store, Phone, Mail } from 'lucide-react';
import { Vendor } from '../../types';

interface PendingQueueProps {
  pendingVendors: Vendor[];
  onApprove: (vendorId: string) => void;
  onReject: (vendorId: string) => void;
}

export const PendingQueue: React.FC<PendingQueueProps> = ({
  pendingVendors,
  onApprove,
  onReject,
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-1">
        <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
          Approval Queue
        </span>
        <h2 className="font-serif text-2xl font-bold text-gray-900">
          Pending Vendor Approvals ({pendingVendors.length})
        </h2>
        <p className="text-xs text-gray-500">
          Review credentials of newly registered vendors before granting active public directory visibility.
        </p>
      </div>

      {pendingVendors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pendingVendors.map((v) => (
            <div
              key={v.id}
              className="bg-white rounded-2xl border border-amber-200 p-6 shadow-2xs space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                    Pending Approval
                  </span>
                  <h3 className="font-serif font-bold text-lg text-gray-900 mt-1">
                    {v.shop_name}
                  </h3>
                  <div className="text-xs text-gray-500">{v.stall_number}</div>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-100">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-[#25D366]" />
                  <span><strong>WhatsApp:</strong> {v.whatsapp}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-emerald-700" />
                  <span><strong>Email:</strong> {v.email}</span>
                </div>
                <p className="text-gray-500 text-[11px] pt-1">{v.description}</p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  onClick={() => onReject(v.id)}
                  className="bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs px-4 py-2 rounded-xl border border-red-200"
                >
                  Reject & Suspend
                </button>

                <button
                  onClick={() => onApprove(v.id)}
                  className="bg-[#0F5C3A] hover:bg-[#1A7A4F] text-white font-bold text-xs px-5 py-2 rounded-xl shadow-sm"
                >
                  Approve & Publish Live
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-200 text-gray-500 space-y-2">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
          <h3 className="font-serif text-lg font-bold text-gray-900">Queue Clear!</h3>
          <p className="text-xs">There are no pending vendor onboarding applications requiring approval.</p>
        </div>
      )}
    </div>
  );
};
