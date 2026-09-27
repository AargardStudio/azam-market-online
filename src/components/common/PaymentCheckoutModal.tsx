import React, { useState } from 'react';
import {
  X,
  CreditCard,
  Smartphone,
  ShieldCheck,
  CheckCircle,
  Building,
  Lock,
  ArrowRight,
  Printer,
  Copy,
  Check,
  AlertCircle,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { PaymentGatewayId, PaymentTransaction } from '../../types';

interface PaymentCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  amountPkr: number;
  purpose: 'subscription_upgrade' | 'subscription_renewal' | 'sample_booking_deposit' | 'wholesale_order';
  title?: string;
  subtitle?: string;
  vendorId?: string;
  vendorName?: string;
  tierId?: string;
  onSuccess: (transaction: PaymentTransaction) => void;
}

export const PaymentCheckoutModal: React.FC<PaymentCheckoutModalProps> = ({
  isOpen,
  onClose,
  amountPkr,
  purpose,
  title,
  subtitle,
  vendorId,
  vendorName,
  tierId,
  onSuccess,
}) => {
  const [selectedGateway, setSelectedGateway] = useState<PaymentGatewayId>('jazzcash');
  const [step, setStep] = useState<'select' | 'details' | 'processing' | 'success'>('select');

  // JazzCash states
  const [jazzTab, setJazzTab] = useState<'mobile' | 'voucher' | 'card'>('mobile');
  const [jazzMobile, setJazzMobile] = useState('0300-1234567');
  const [jazzCnicLast6, setJazzCnicLast6] = useState('123456');
  const [jazzMpin, setJazzMpin] = useState('');

  // PayFast states
  const [payFastMethod, setPayFastMethod] = useState<'1link_bank' | 'card'>('1link_bank');
  const [selectedBank, setSelectedBank] = useState('Meezan Bank');
  const [bankAccountNo, setBankAccountNo] = useState('');
  const [payFastOtp, setPayFastOtp] = useState('');

  // Keenu states
  const [keenuMobile, setKeenuMobile] = useState('0321-9876543');
  const [keenuOtp, setKeenuOtp] = useState('');

  // Stripe states
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('992');
  const [cardHolder, setCardHolder] = useState(vendorName || 'Muhammad Usman');

  // General state
  const [isCopied, setIsCopied] = useState(false);
  const [transactionResult, setTransactionResult] = useState<PaymentTransaction | null>(null);

  if (!isOpen) return null;

  const handleProcessPayment = () => {
    setStep('processing');

    setTimeout(() => {
      let referenceId = '';
      let methodDetail = '';

      if (selectedGateway === 'jazzcash') {
        referenceId = `JC-${Math.floor(10000000 + Math.random() * 90000000)}`;
        methodDetail =
          jazzTab === 'mobile'
            ? `JazzCash Mobile Account (${jazzMobile})`
            : jazzTab === 'voucher'
            ? `JazzCash Retail Voucher (${referenceId})`
            : 'JazzCash PayPak Debit Card';
      } else if (selectedGateway === 'payfast') {
        referenceId = `PF-${Date.now().toString().slice(-8)}`;
        methodDetail =
          payFastMethod === '1link_bank'
            ? `PayFast 1Link Direct Debit (${selectedBank})`
            : 'PayFast Multi-Bank Visa/Mastercard';
      } else if (selectedGateway === 'keenu') {
        referenceId = `KN-${Math.floor(100000 + Math.random() * 900000)}`;
        methodDetail = `Keenu NetConnect Digital Wallet (${keenuMobile})`;
      } else {
        referenceId = `ch_${Math.random().toString(36).substring(2, 14)}`;
        methodDetail = `Stripe Global Card (ending in ${cardNumber.slice(-4)})`;
      }

      const tx: PaymentTransaction = {
        id: `tx-${Date.now()}`,
        vendor_id: vendorId,
        vendor_name: vendorName,
        gateway: selectedGateway,
        amount_pkr: amountPkr,
        purpose,
        status: 'completed',
        reference_id: referenceId,
        payer_name: cardHolder || vendorName || 'Azam Market Merchant',
        payer_contact: jazzMobile || keenuMobile || '0300-1234567',
        payment_method_detail: methodDetail,
        created_at: new Date().toISOString(),
        tier_id: tierId,
        notes: `Settled via ${selectedGateway.toUpperCase()} secure gateway on Azam Market Online.`,
      };

      setTransactionResult(tx);
      setStep('success');
      onSuccess(tx);
    }, 1800);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-gray-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <Lock className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-lg font-bold">
                  {title || 'Azam Market Secure Checkout'}
                </h3>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  256-Bit SSL
                </span>
              </div>
              <p className="text-xs text-gray-300">
                {subtitle || 'State Bank of Pakistan regulated & Global Gateway Settlement'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Bill Summary Bar */}
        <div className="bg-emerald-50/70 border-b border-emerald-100 p-4 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              Amount Due
            </div>
            <div className="font-serif text-2xl font-bold text-[#0F5C3A]">
              ₨{amountPkr.toLocaleString()}{' '}
              <span className="text-xs font-normal text-gray-600">PKR</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[11px] font-semibold text-gray-500">Invoice Purpose</div>
            <div className="text-xs font-bold text-gray-800 capitalize">
              {purpose.replace(/_/g, ' ')}
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {/* STEP 1 & 2: SELECT GATEWAY & ENTER DETAILS */}
          {(step === 'select' || step === 'details') && (
            <div className="space-y-5">
              {/* GATEWAYS SELECTION CARDS */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Select Payment Gateway
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {/* 1. JAZZCASH */}
                  <div
                    onClick={() => {
                      setSelectedGateway('jazzcash');
                      setStep('details');
                    }}
                    className={`border-2 rounded-2xl p-3 cursor-pointer transition-all flex flex-col justify-between ${
                      selectedGateway === 'jazzcash'
                        ? 'border-red-600 bg-red-50/50 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-red-600 tracking-tight">
                          JazzCash
                        </span>
                        {selectedGateway === 'jazzcash' && (
                          <span className="w-2 h-2 rounded-full bg-red-600"></span>
                        )}
                      </div>
                      <div className="text-[10px] text-gray-500 leading-tight">
                        Pakistan #1 Wallet & OTC
                      </div>
                    </div>
                    <span className="text-[9px] font-bold text-red-700 mt-2 bg-red-100/70 px-1.5 py-0.5 rounded text-center">
                      Mobile & Voucher
                    </span>
                  </div>

                  {/* 2. PAYFAST */}
                  <div
                    onClick={() => {
                      setSelectedGateway('payfast');
                      setStep('details');
                    }}
                    className={`border-2 rounded-2xl p-3 cursor-pointer transition-all flex flex-col justify-between ${
                      selectedGateway === 'payfast'
                        ? 'border-blue-600 bg-blue-50/50 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-blue-700 tracking-tight">
                          PayFast
                        </span>
                        {selectedGateway === 'payfast' && (
                          <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                        )}
                      </div>
                      <div className="text-[10px] text-gray-500 leading-tight">
                        APPS 1Link SBP Regulated
                      </div>
                    </div>
                    <span className="text-[9px] font-bold text-blue-700 mt-2 bg-blue-100/70 px-1.5 py-0.5 rounded text-center">
                      Direct Bank Debit
                    </span>
                  </div>

                  {/* 3. KEENU */}
                  <div
                    onClick={() => {
                      setSelectedGateway('keenu');
                      setStep('details');
                    }}
                    className={`border-2 rounded-2xl p-3 cursor-pointer transition-all flex flex-col justify-between ${
                      selectedGateway === 'keenu'
                        ? 'border-amber-600 bg-amber-50/50 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-amber-700 tracking-tight">
                          Keenu
                        </span>
                        {selectedGateway === 'keenu' && (
                          <span className="w-2 h-2 rounded-full bg-amber-600"></span>
                        )}
                      </div>
                      <div className="text-[10px] text-gray-500 leading-tight">
                        Keenu NetConnect
                      </div>
                    </div>
                    <span className="text-[9px] font-bold text-amber-800 mt-2 bg-amber-100/70 px-1.5 py-0.5 rounded text-center">
                      Wallet & Bank
                    </span>
                  </div>

                  {/* 4. STRIPE */}
                  <div
                    onClick={() => {
                      setSelectedGateway('stripe');
                      setStep('details');
                    }}
                    className={`border-2 rounded-2xl p-3 cursor-pointer transition-all flex flex-col justify-between ${
                      selectedGateway === 'stripe'
                        ? 'border-indigo-600 bg-indigo-50/50 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-indigo-700 tracking-tight">
                          Stripe
                        </span>
                        {selectedGateway === 'stripe' && (
                          <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                        )}
                      </div>
                      <div className="text-[10px] text-gray-500 leading-tight">
                        Global Visa / Master
                      </div>
                    </div>
                    <span className="text-[9px] font-bold text-indigo-700 mt-2 bg-indigo-100/70 px-1.5 py-0.5 rounded text-center">
                      International Cards
                    </span>
                  </div>
                </div>
              </div>

              {/* DETAILS FORM BY GATEWAY */}
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-4">
                {/* 1. JAZZCASH FORM */}
                {selectedGateway === 'jazzcash' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                      <div className="flex items-center gap-1.5">
                        <Smartphone className="w-4 h-4 text-red-600" />
                        <span className="text-xs font-bold text-gray-900">
                          JazzCash Checkout Gateway
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px]">
                        <button
                          type="button"
                          onClick={() => setJazzTab('mobile')}
                          className={`px-2 py-0.5 rounded font-bold transition-colors cursor-pointer ${
                            jazzTab === 'mobile'
                              ? 'bg-red-600 text-white'
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          Mobile Wallet
                        </button>
                        <button
                          type="button"
                          onClick={() => setJazzTab('voucher')}
                          className={`px-2 py-0.5 rounded font-bold transition-colors cursor-pointer ${
                            jazzTab === 'voucher'
                              ? 'bg-red-600 text-white'
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          OTC Voucher
                        </button>
                      </div>
                    </div>

                    {jazzTab === 'mobile' && (
                      <div className="space-y-2.5">
                        <div>
                          <label className="block text-[11px] font-bold text-gray-700 mb-1">
                            JazzCash Mobile Number
                          </label>
                          <input
                            type="text"
                            value={jazzMobile}
                            onChange={(e) => setJazzMobile(e.target.value)}
                            placeholder="0300-1234567"
                            className="w-full text-xs px-3 py-2 border border-gray-300 rounded-xl bg-white font-mono"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[11px] font-bold text-gray-700 mb-1">
                              CNIC Last 6 Digits
                            </label>
                            <input
                              type="password"
                              maxLength={6}
                              value={jazzCnicLast6}
                              onChange={(e) => setJazzCnicLast6(e.target.value)}
                              placeholder="123456"
                              className="w-full text-xs px-3 py-2 border border-gray-300 rounded-xl bg-white font-mono tracking-widest"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-gray-700 mb-1">
                              Simulated MPIN
                            </label>
                            <input
                              type="password"
                              maxLength={4}
                              value={jazzMpin}
                              onChange={(e) => setJazzMpin(e.target.value)}
                              placeholder="••••"
                              className="w-full text-xs px-3 py-2 border border-gray-300 rounded-xl bg-white font-mono tracking-widest"
                            />
                          </div>
                        </div>
                        <p className="text-[10px] text-gray-500">
                          An instant USSD approval prompt will be sent to your Jazz number. Enter
                          your MPIN on your handset to approve.
                        </p>
                      </div>
                    )}

                    {jazzTab === 'voucher' && (
                      <div className="space-y-2 text-xs">
                        <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-amber-900 text-[11px]">
                          <strong>Pay at Any Retail Agent:</strong> Click below to generate an
                          official 12-digit JazzCash OTC voucher code. You can pay with cash at any
                          JazzCash shop in Azam Market or across Pakistan.
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 2. PAYFAST (APPS) FORM */}
                {selectedGateway === 'payfast' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                      <div className="flex items-center gap-1.5">
                        <Building className="w-4 h-4 text-blue-600" />
                        <span className="text-xs font-bold text-gray-900">
                          PayFast 1Link Direct Debit
                        </span>
                      </div>
                      <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded">
                        All Pakistani Banks
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      <div>
                        <label className="block text-[11px] font-bold text-gray-700 mb-1">
                          Select Your Bank
                        </label>
                        <select
                          value={selectedBank}
                          onChange={(e) => setSelectedBank(e.target.value)}
                          className="w-full text-xs px-3 py-2 border border-gray-300 rounded-xl bg-white"
                        >
                          <option value="Meezan Bank">Meezan Bank Ltd (Islamic Banking)</option>
                          <option value="Habib Bank Limited (HBL)">Habib Bank Limited (HBL)</option>
                          <option value="Bank Alfalah">Bank Alfalah</option>
                          <option value="Faysal Bank">Faysal Bank</option>
                          <option value="MCB Bank">MCB Bank Ltd</option>
                          <option value="Allied Bank">Allied Bank Limited</option>
                          <option value="United Bank Limited (UBL)">United Bank Limited (UBL)</option>
                          <option value="Standard Chartered">Standard Chartered Pakistan</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-bold text-gray-700 mb-1">
                            Account Number / IBAN
                          </label>
                          <input
                            type="text"
                            value={bankAccountNo}
                            onChange={(e) => setBankAccountNo(e.target.value)}
                            placeholder="0101-2938475..."
                            className="w-full text-xs px-3 py-2 border border-gray-300 rounded-xl bg-white font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-gray-700 mb-1">
                            Bank Registered Mobile
                          </label>
                          <input
                            type="text"
                            defaultValue="0300-8899221"
                            className="w-full text-xs px-3 py-2 border border-gray-300 rounded-xl bg-white font-mono"
                          />
                        </div>
                      </div>

                      <p className="text-[10px] text-gray-500">
                        Protected by State Bank of Pakistan 1Link 2FA OTP protocol.
                      </p>
                    </div>
                  </div>
                )}

                {/* 3. KEENU FORM */}
                {selectedGateway === 'keenu' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                      <div className="flex items-center gap-1.5">
                        <Zap className="w-4 h-4 text-amber-600" />
                        <span className="text-xs font-bold text-gray-900">
                          Keenu NetConnect Gateway
                        </span>
                      </div>
                      <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded">
                        Keenu App & Wallet
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      <div>
                        <label className="block text-[11px] font-bold text-gray-700 mb-1">
                          Keenu Registered Mobile Number
                        </label>
                        <input
                          type="text"
                          value={keenuMobile}
                          onChange={(e) => setKeenuMobile(e.target.value)}
                          placeholder="0321-9876543"
                          className="w-full text-xs px-3 py-2 border border-gray-300 rounded-xl bg-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-gray-700 mb-1">
                          Keenu Passcode / PIN
                        </label>
                        <input
                          type="password"
                          value={keenuOtp}
                          onChange={(e) => setKeenuOtp(e.target.value)}
                          placeholder="••••••"
                          maxLength={6}
                          className="w-full text-xs px-3 py-2 border border-gray-300 rounded-xl bg-white font-mono tracking-widest"
                        />
                      </div>
                      <p className="text-[10px] text-gray-500">
                        Zero transaction fees for Azam Cloth Market merchant transactions.
                      </p>
                    </div>
                  </div>
                )}

                {/* 4. STRIPE FORM */}
                {selectedGateway === 'stripe' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                      <div className="flex items-center gap-1.5">
                        <CreditCard className="w-4 h-4 text-indigo-600" />
                        <span className="text-xs font-bold text-gray-900">
                          Stripe International Checkout
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-gray-500 font-mono">
                        <span>Visa</span>
                        <span>•</span>
                        <span>MC</span>
                        <span>•</span>
                        <span>Amex</span>
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      <div>
                        <label className="block text-[11px] font-bold text-gray-700 mb-1">
                          Cardholder Name
                        </label>
                        <input
                          type="text"
                          value={cardHolder}
                          onChange={(e) => setCardHolder(e.target.value)}
                          className="w-full text-xs px-3 py-2 border border-gray-300 rounded-xl bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-gray-700 mb-1">
                          Card Number
                        </label>
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          className="w-full text-xs px-3 py-2 border border-gray-300 rounded-xl bg-white font-mono"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-bold text-gray-700 mb-1">
                            Expires
                          </label>
                          <input
                            type="text"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            placeholder="MM/YY"
                            className="w-full text-xs px-3 py-2 border border-gray-300 rounded-xl bg-white font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-gray-700 mb-1">
                            CVC / CVV
                          </label>
                          <input
                            type="password"
                            value={cardCvc}
                            onChange={(e) => setCardCvc(e.target.value)}
                            placeholder="CVC"
                            maxLength={4}
                            className="w-full text-xs px-3 py-2 border border-gray-300 rounded-xl bg-white font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 bg-white hover:bg-gray-100 text-gray-700 text-xs font-bold py-3 rounded-xl border border-gray-300 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleProcessPayment}
                  className="flex-2 bg-[#0F5C3A] hover:bg-[#1A7A4F] text-white text-xs font-bold py-3 px-4 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer group"
                >
                  <span>Pay ₨{amountPkr.toLocaleString()} PKR via {selectedGateway.toUpperCase()}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: PROCESSING SIMULATION */}
          {step === 'processing' && (
            <div className="py-12 text-center space-y-4">
              <div className="relative w-16 h-16 mx-auto">
                <div className="w-16 h-16 rounded-full border-4 border-emerald-100 border-t-[#0F5C3A] animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Lock className="w-6 h-6 text-[#0F5C3A]" />
                </div>
              </div>
              <div>
                <h4 className="font-serif text-lg font-bold text-gray-900">
                  Verifying with {selectedGateway.toUpperCase()}...
                </h4>
                <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
                  Connecting to secure gateway server and verifying banking authorization. Please do not close this window.
                </p>
              </div>
            </div>
          )}

          {/* STEP 4: SUCCESS RECEIPT */}
          {step === 'success' && transactionResult && (
            <div className="space-y-5 animate-in fade-in duration-300">
              <div className="text-center space-y-2">
                <div className="w-14 h-14 bg-emerald-100 text-[#0F5C3A] rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h4 className="font-serif text-xl font-bold text-gray-900">
                  Payment Confirmed!
                </h4>
                <p className="text-xs text-emerald-800 bg-emerald-50 py-1.5 px-3 rounded-full inline-block font-semibold border border-emerald-200">
                  ✓ Transaction Authorized & Recorded on Ledger
                </p>
              </div>

              {/* Transaction Receipt Card */}
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 text-xs space-y-3 font-mono">
                <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-500 font-sans">Reference ID</span>
                  <div className="flex items-center gap-1.5">
                    <strong className="text-gray-900">{transactionResult.reference_id}</strong>
                    <button
                      onClick={() => handleCopy(transactionResult.reference_id)}
                      className="text-gray-400 hover:text-gray-700 p-0.5 cursor-pointer"
                      title="Copy reference code"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-500 font-sans">Payment Gateway</span>
                  <span className="font-bold text-gray-900 uppercase">
                    {transactionResult.gateway}
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-500 font-sans">Method Detail</span>
                  <span className="text-gray-800 text-[11px] truncate max-w-[240px]">
                    {transactionResult.payment_method_detail}
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-500 font-sans">Amount Paid</span>
                  <strong className="text-emerald-700 font-sans text-sm">
                    ₨{transactionResult.amount_pkr.toLocaleString()} PKR
                  </strong>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-500 font-sans">Date & Time</span>
                  <span className="text-gray-700 text-[11px]">
                    {new Date(transactionResult.created_at).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex-1 bg-white hover:bg-gray-100 text-gray-800 text-xs font-bold py-3 rounded-xl border border-gray-300 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-gray-500" />
                  <span>Print Receipt</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 bg-[#0F5C3A] hover:bg-[#1A7A4F] text-white text-xs font-bold py-3 rounded-xl transition-colors cursor-pointer shadow-md"
                >
                  Done & Continue
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
