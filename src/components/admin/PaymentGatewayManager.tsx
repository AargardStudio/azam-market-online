import React, { useState, useEffect } from 'react';
import {
  Wallet,
  CreditCard,
  Building,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Search,
  Filter,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  ArrowUpRight,
  Receipt,
  Clock,
  Download,
  Sliders,
  Check
} from 'lucide-react';
import { PaymentGateway, PaymentTransaction, Vendor } from '../../types';
import { PaymentCheckoutModal } from '../common/PaymentCheckoutModal';

interface PaymentGatewayManagerProps {
  vendors: Vendor[];
  onNotify?: (message: string, type: 'success' | 'info' | 'error') => void;
}

export const PaymentGatewayManager: React.FC<PaymentGatewayManagerProps> = ({
  vendors,
  onNotify,
}) => {
  const [gateways, setGateways] = useState<PaymentGateway[]>([]);
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGatewayFilter, setSelectedGatewayFilter] = useState<string>('all');
  const [selectedPurposeFilter, setSelectedPurposeFilter] = useState<string>('all');

  // Test modal state
  const [showTestModal, setShowTestModal] = useState(false);
  const [testVendorId, setTestVendorId] = useState<string>(vendors[0]?.id || 'v-1');
  const [testPurpose, setTestPurpose] = useState<'tier_subscription' | 'inquiry_lead_credit' | 'catalogue_sponsor' | 'sample_booking_deposit'>('tier_subscription');
  const [testAmount, setTestAmount] = useState<number>(15000);

  const fetchPaymentData = async () => {
    try {
      setLoading(true);
      const [gRes, tRes] = await Promise.all([
        fetch('/api/payments/gateways').then((r) => r.json()),
        fetch('/api/payments/transactions').then((r) => r.json()),
      ]);
      setGateways(Array.isArray(gRes) ? gRes : []);
      setTransactions(Array.isArray(tRes) ? tRes : []);
    } catch (err) {
      console.error('Failed to fetch payment data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentData();
  }, []);

  const totalVolume = transactions
    .filter((t) => t.status === 'completed')
    .reduce((sum, t) => sum + t.amount_pkr, 0);

  const filteredTransactions = transactions.filter((t) => {
    if (selectedGatewayFilter !== 'all' && t.gateway !== selectedGatewayFilter) return false;
    if (selectedPurposeFilter !== 'all' && t.purpose !== selectedPurposeFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchVendor = t.vendor_name?.toLowerCase().includes(q);
      const matchPayer = t.payer_name?.toLowerCase().includes(q);
      const matchRef = t.reference_id?.toLowerCase().includes(q);
      if (!matchVendor && !matchPayer && !matchRef) return false;
    }
    return true;
  });

  const getGatewayColor = (gw: string) => {
    switch (gw) {
      case 'jazzcash':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'payfast':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'keenu':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'stripe':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. HEADER & CONTROLS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0F5C3A] mb-1">
            <Wallet className="w-4 h-4" />
            Pakistani & Global Settlement Infrastructure
          </div>
          <h1 className="font-serif text-2xl font-bold text-gray-900">
            Payment Gateways & Ledger Control
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Real-time processing for JazzCash, PayFast 1Link, Keenu NetConnect, and Stripe across Azam Market stalls.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchPaymentData}
            className="p-2.5 rounded-xl border border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50 cursor-pointer"
            title="Refresh transactions"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => setShowTestModal(true)}
            className="bg-[#0F5C3A] hover:bg-[#147a4d] text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <CreditCard className="w-4 h-4" />
            <span>Test Gateway Simulation</span>
          </button>
        </div>
      </div>

      {/* 2. STATS OVERVIEW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 text-xs font-medium">
            <span>Total Settled Volume</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="font-serif text-2xl font-bold text-gray-900 mt-2">
            ₨{totalVolume.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-600 font-bold mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>100% Settled & Reconciled</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 text-xs font-medium">
            <span>Active Gateways</span>
            <Wallet className="w-4 h-4 text-blue-600" />
          </div>
          <div className="font-serif text-2xl font-bold text-gray-900 mt-2">
            {gateways.filter((g) => g.is_enabled).length} of {gateways.length}
          </div>
          <div className="text-[11px] text-gray-500 mt-1">
            JazzCash, PayFast, Keenu, Stripe
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 text-xs font-medium">
            <span>Total Transactions</span>
            <TrendingUp className="w-4 h-4 text-amber-600" />
          </div>
          <div className="font-serif text-2xl font-bold text-gray-900 mt-2">
            {transactions.length}
          </div>
          <div className="text-[11px] text-gray-500 mt-1">
            Across directory stall subscriptions & samples
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 text-xs font-medium">
            <span>Clearing Rails</span>
            <Building className="w-4 h-4 text-purple-600" />
          </div>
          <div className="font-serif text-2xl font-bold text-gray-900 mt-2">
            1Link & SBP Raast
          </div>
          <div className="text-[11px] text-purple-700 font-semibold mt-1">
            Compliant with Pakistan Interbank Rails
          </div>
        </div>
      </div>

      {/* 3. GATEWAY RAILS STATUS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {gateways.map((gw) => (
          <div
            key={gw.id}
            className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs flex flex-col justify-between space-y-4 hover:border-gray-300 transition-all"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-gray-900">{gw.name}</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    gw.is_enabled ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {gw.is_enabled ? (gw.is_sandbox ? 'SANDBOX' : 'LIVE') : 'DISABLED'}
                </span>
              </div>
              <p className="text-xs text-gray-500">{gw.subtitle}</p>
              <div className="inline-block text-[10px] font-medium text-[#0F5C3A] bg-emerald-50 px-2 py-0.5 rounded-md">
                {gw.badge}
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 space-y-1.5 text-[11px]">
              <div className="flex justify-between text-gray-600">
                <span>Merchant ID:</span>
                <strong className="text-gray-900 font-mono text-[10px]">{gw.merchant_id}</strong>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Currency:</span>
                <strong className="text-emerald-700">{gw.settlement_currency}</strong>
              </div>
              <div className="text-[10px] text-gray-500 pt-1 border-t border-gray-50">
                <strong>Methods:</strong> {gw.supported_methods.join(', ')}
              </div>
            </div>

            <button
              onClick={() => {
                setShowTestModal(true);
              }}
              className="w-full py-2 bg-gray-50 hover:bg-gray-100 text-gray-800 rounded-xl font-bold text-xs border border-gray-200 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <CreditCard className="w-3.5 h-3.5 text-gray-600" />
              <span>Test {gw.name}</span>
            </button>
          </div>
        ))}
      </div>

      {/* 4. TRANSACTIONS LEDGER */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-2xs overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-serif text-lg font-bold text-gray-900">
              Settlement Ledger & Transactions
            </h2>
            <p className="text-xs text-gray-500">
              Complete audit trail of all transactions processed via Pakistani and global gateways.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search vendor, payer, ref..."
                className="pl-9 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0F5C3A] w-56"
              />
            </div>

            <select
              value={selectedGatewayFilter}
              onChange={(e) => setSelectedGatewayFilter(e.target.value)}
              className="text-xs bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5 text-gray-700"
            >
              <option value="all">All Gateways</option>
              <option value="jazzcash">JazzCash</option>
              <option value="payfast">PayFast 1Link</option>
              <option value="keenu">Keenu NetConnect</option>
              <option value="stripe">Stripe Card</option>
            </select>

            <select
              value={selectedPurposeFilter}
              onChange={(e) => setSelectedPurposeFilter(e.target.value)}
              className="text-xs bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5 text-gray-700"
            >
              <option value="all">All Purposes</option>
              <option value="tier_subscription">Tier Subscription</option>
              <option value="sample_booking_deposit">Sample Booking Deposit</option>
              <option value="catalogue_sponsor">Catalogue Sponsor</option>
              <option value="inquiry_lead_credit">Lead Credits</option>
            </select>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/80 text-gray-500 uppercase tracking-wider text-[10px] border-b border-gray-200">
              <tr>
                <th className="py-3 px-5 font-semibold">Reference & Date</th>
                <th className="py-3 px-4 font-semibold">Stall / Vendor</th>
                <th className="py-3 px-4 font-semibold">Gateway Rail</th>
                <th className="py-3 px-4 font-semibold">Purpose</th>
                <th className="py-3 px-4 font-semibold">Payer Detail</th>
                <th className="py-3 px-4 font-semibold text-right">Amount (PKR)</th>
                <th className="py-3 px-5 font-semibold text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-gray-400">
                    No transactions match your search criteria.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="font-mono font-bold text-gray-900">{tx.reference_id}</div>
                      <div className="text-[10px] text-gray-400 mt-0.5">
                        {new Date(tx.created_at).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-gray-900">
                      {tx.vendor_name || 'Azam Market Direct'}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getGatewayColor(
                          tx.gateway
                        )}`}
                      >
                        {tx.gateway.toUpperCase()}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-gray-700 capitalize">
                      {tx.purpose.replace(/_/g, ' ')}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-gray-900 font-medium">{tx.payer_name}</div>
                      <div className="text-[10px] text-gray-400 font-mono">{tx.payer_contact}</div>
                    </td>

                    <td className="py-3.5 px-4 text-right font-bold text-gray-900 font-mono">
                      ₨{tx.amount_pkr.toLocaleString()}
                    </td>

                    <td className="py-3.5 px-5 text-center">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        <Check className="w-3 h-3" />
                        Completed
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Checkout Modal Simulation */}
      <PaymentCheckoutModal
        isOpen={showTestModal}
        onClose={() => setShowTestModal(false)}
        vendorId={testVendorId}
        vendorName={vendors.find((v) => v.id === testVendorId)?.shop_name || 'Al-Madina Silk Palace'}
        purpose={testPurpose}
        defaultAmountPkr={testAmount}
        onPaymentSuccess={(tx) => {
          setTransactions((prev) => [tx, ...prev]);
          setShowTestModal(false);
          if (onNotify) {
            onNotify(
              `Payment of ₨${tx.amount_pkr.toLocaleString()} via ${tx.gateway.toUpperCase()} completed and settled!`,
              'success'
            );
          }
        }}
      />
    </div>
  );
};
