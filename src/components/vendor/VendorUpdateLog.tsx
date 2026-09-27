import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  LifeBuoy, 
  CheckCircle2, 
  Clock, 
  Send, 
  AlertCircle, 
  Camera, 
  Truck, 
  CreditCard, 
  FileText, 
  ExternalLink,
  MessageSquare,
  Sparkles,
  ChevronRight,
  HelpCircle,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { Vendor, AargardUpdate, VendorAssistanceRequest, AssistanceCategory } from '../../types';

interface VendorUpdateLogProps {
  vendor: Vendor;
}

export const VendorUpdateLog: React.FC<VendorUpdateLogProps> = ({ vendor }) => {
  const [activeTab, setActiveTab] = useState<'updates' | 'assistance'>('updates');
  const [updates, setUpdates] = useState<AargardUpdate[]>([]);
  const [requests, setRequests] = useState<VendorAssistanceRequest[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  // Form state
  const [category, setCategory] = useState<AssistanceCategory>('photography_session');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [urgency, setUrgency] = useState<'normal' | 'high' | 'urgent'>('normal');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    fetchData();
  }, [vendor.id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [updatesRes, requestsRes] = await Promise.all([
        fetch('/api/aargard/updates').then(r => r.json()),
        fetch(`/api/aargard/assistance-requests?vendor_id=${vendor.id}`).then(r => r.json())
      ]);
      setUpdates(updatesRes);
      setRequests(requestsRes);
    } catch (err) {
      console.error('Error fetching vendor updates & assistance:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/aargard/assistance-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendor_id: vendor.id,
          vendor_name: vendor.shop_name,
          stall_number: vendor.stall_number,
          contact_person: vendor.contact_person || 'Owner',
          whatsapp: vendor.phone,
          category,
          subject,
          message,
          urgency
        })
      });

      if (res.ok) {
        const newReq = await res.json();
        setRequests(prev => [newReq, ...prev]);
        setSubject('');
        setMessage('');
        setSubmitSuccess(true);
        setTimeout(() => setSubmitSuccess(false), 4000);
      }
    } catch (err) {
      console.error('Failed to submit assistance request:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredUpdates = selectedCategory === 'all'
    ? updates
    : updates.filter(u => u.category === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Header with Navigation Pills */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-100 text-[#0F5C3A]">
              <Bell className="w-5 h-5" />
            </span>
            <h2 className="font-serif text-xl font-bold text-gray-900">
              Platform Updates & Vendor Assistance Hub
            </h2>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Stay informed with official Azam Market updates and request dedicated support for your stall
          </p>
        </div>

        <div className="flex items-center gap-2 bg-gray-100 p-1.5 rounded-2xl w-fit">
          <button
            onClick={() => setActiveTab('updates')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'updates'
                ? 'bg-[#0F5C3A] text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Platform Updates</span>
            <span className="bg-emerald-900 text-white text-[10px] px-1.5 py-0.2 rounded-full">
              {updates.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('assistance')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'assistance'
                ? 'bg-[#0F5C3A] text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <LifeBuoy className="w-3.5 h-3.5" />
            <span>Assistance Desk</span>
            {requests.length > 0 && (
              <span className="bg-[#C9952A] text-gray-900 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                {requests.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* TAB 1: UPDATES LOG */}
      {activeTab === 'updates' && (
        <div className="space-y-6">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            {['all', 'feature', 'logistics', 'payment', 'security', 'market_policy'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl font-medium capitalize transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-[#0F5C3A] text-white font-bold shadow-sm'
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {cat === 'all' ? 'All Updates' : cat.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Updates List */}
          <div className="space-y-4">
            {filteredUpdates.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4 hover:border-emerald-300 transition-all"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2.5 py-1 bg-emerald-50 text-[#0F5C3A] rounded-lg border border-emerald-200">
                      {item.version}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                      {item.badge}
                    </span>
                    {item.importance === 'critical' && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 animate-pulse">
                        Action Required
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-400 font-mono flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {item.date}
                  </span>
                </div>

                <div>
                  <h3 className="font-serif text-lg font-bold text-gray-900">
                    {item.title}
                  </h3>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                    {item.summary}
                  </p>
                </div>

                {item.details && item.details.length > 0 && (
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                      Update Highlights:
                    </span>
                    <ul className="space-y-1.5 text-xs text-gray-700">
                      {item.details.map((detail, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {item.vendor_impact && (
                  <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-200 text-xs text-emerald-950 flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-[#C9952A] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Impact on Your Stall: </span>
                      {item.vendor_impact}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: ASSISTANCE DESK */}
      {activeTab === 'assistance' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Interactive Form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-5">
              <div className="border-b border-gray-100 pb-3">
                <h3 className="font-serif text-lg font-bold text-gray-900">
                  Submit Stall Assistance Ticket
                </h3>
                <p className="text-xs text-gray-500">
                  Request photo caravan visits, bilty freight dispatches, catalog design, or payment gateway support
                </p>
              </div>

              {submitSuccess && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Your assistance ticket has been logged with the AArgard Field Desk. We will WhatsApp you shortly!</span>
                </div>
              )}

              <form onSubmit={handleSubmitRequest} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Assistance Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as AssistanceCategory)}
                      className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#0F5C3A] bg-white"
                    >
                      <option value="photography_session">4K Swatch Photography Session</option>
                      <option value="bilty_logistics">Bilty Freight & Cargo Booking</option>
                      <option value="catalog_upload">PDF Lookbook / Catalogue Upload</option>
                      <option value="payment_gateway">1Link / JazzCash Payment Rails</option>
                      <option value="erp_sync">Textile Mill ERP Integration</option>
                      <option value="dispute_resolution">Buyer Inquiry / Order Dispute</option>
                      <option value="general">General Stall Assistance</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Urgency Level
                    </label>
                    <select
                      value={urgency}
                      onChange={(e) => setUrgency(e.target.value as any)}
                      className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#0F5C3A] bg-white"
                    >
                      <option value="normal">Normal (Within 24-48 Hours)</option>
                      <option value="high">High (Within 12 Hours)</option>
                      <option value="urgent">Urgent (Immediate On-Site Visit)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Subject / Topic
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Schedule photo caravan for 30 new lawn thaan rolls"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#0F5C3A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Detailed Message & Specific Requirements
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Provide details about the fabric types, quantities, destination cities, or issues you need help with..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#0F5C3A]"
                  />
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <span className="text-[11px] text-gray-500">
                    Stall: <span className="font-bold text-gray-900">{vendor.stall_number}</span> • WhatsApp: <span className="font-bold text-gray-900">{vendor.phone}</span>
                  </span>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 rounded-xl bg-[#0F5C3A] hover:bg-[#0c4b2f] text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{submitting ? 'Submitting...' : 'Submit Request'}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Previous Tickets List */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
              <h3 className="font-serif text-base font-bold text-gray-900">
                Your Assistance Tickets History
              </h3>

              {requests.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-xs">
                  No assistance requests logged yet. Submit a ticket above if your stall needs photography or bilty logistics!
                </div>
              ) : (
                <div className="space-y-3">
                  {requests.map((req) => (
                    <div
                      key={req.id}
                      className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-gray-900">{req.subject}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          req.status === 'resolved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : req.status === 'in_progress'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {req.status === 'resolved' ? '✓ Resolved' : req.status === 'in_progress' ? '⚙ In Progress' : '⏳ Pending'}
                        </span>
                      </div>
                      <p className="text-gray-600 text-[11px]">{req.message}</p>
                      
                      {req.admin_notes && (
                        <div className="bg-emerald-50 p-2.5 rounded-lg border border-emerald-200 text-emerald-900 text-[11px]">
                          <span className="font-bold">AArgard Response: </span>
                          {req.admin_notes}
                        </div>
                      )}

                      <div className="flex items-center justify-between text-[10px] text-gray-400 pt-1">
                        <span>Category: {req.category.replace('_', ' ')}</span>
                        <span>{new Date(req.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Direct Quick Action Cards */}
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-[#0F5C3A] to-[#1B2A4A] rounded-2xl p-6 text-white space-y-4 shadow-lg">
              <div className="flex items-center gap-2">
                <LifeBuoy className="w-5 h-5 text-[#C9952A]" />
                <h4 className="font-serif font-bold text-sm">Direct Field Helpline</h4>
              </div>

              <p className="text-xs text-emerald-100/90 leading-relaxed">
                Need on-ground assistance at Azam Market immediately? Call or WhatsApp the field operations manager:
              </p>

              <a
                href="https://wa.me/923004211985"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 rounded-xl bg-white text-[#0F5C3A] font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:bg-emerald-50 transition-all"
              >
                <MessageSquare className="w-4 h-4" />
                <span>WhatsApp: +92 300 4211985</span>
              </a>

              <div className="text-[10px] text-emerald-200/80 pt-2 border-t border-white/10">
                Operating Hours: Mon–Sat 10:00 AM – 8:00 PM PKT
              </div>
            </div>

            {/* Fast Service Cards */}
            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm space-y-3 text-xs">
              <h4 className="font-bold text-gray-900 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-[#0F5C3A]" />
                <span>Swatch Photo Caravan</span>
              </h4>
              <p className="text-gray-500 text-[11px]">
                Mobile high-res camera unit visits stalls on Tuesdays & Thursdays at Kashmiri Bazaar and Chitta Bazaar.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm space-y-3 text-xs">
              <h4 className="font-bold text-gray-900 flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-amber-600" />
                <span>Bilty Express Dispatch</span>
              </h4>
              <p className="text-gray-500 text-[11px]">
                Porter pickup from stall counter at 4:00 PM daily for Lahore Railway Station and Badami Bagh goods terminals.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
