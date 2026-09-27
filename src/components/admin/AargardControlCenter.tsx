import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Quote, 
  Sparkles, 
  Plus, 
  Save, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  LifeBuoy, 
  Layers, 
  Truck, 
  Camera, 
  Database, 
  CreditCard,
  Edit3,
  Send,
  MessageSquare,
  Award
} from 'lucide-react';
import { CeoProfile, AargardUpdate, AargardService, VendorAssistanceRequest } from '../../types';

export const AargardControlCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'memoir' | 'updates' | 'services' | 'requests'>('memoir');
  const [ceoProfile, setCeoProfile] = useState<CeoProfile | null>(null);
  const [updates, setUpdates] = useState<AargardUpdate[]>([]);
  const [services, setServices] = useState<AargardService[]>([]);
  const [requests, setRequests] = useState<VendorAssistanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // New update modal/form
  const [showAddUpdate, setShowAddUpdate] = useState(false);
  const [newUpdateVersion, setNewUpdateVersion] = useState('v2.5.1');
  const [newUpdateTitle, setNewUpdateTitle] = useState('');
  const [newUpdateBadge, setNewUpdateBadge] = useState('New Feature');
  const [newUpdateSummary, setNewUpdateSummary] = useState('');
  const [newUpdateImpact, setNewUpdateImpact] = useState('');
  const [newUpdateImportance, setNewUpdateImportance] = useState<'normal' | 'high' | 'critical'>('normal');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [profileRes, updatesRes, servicesRes, requestsRes] = await Promise.all([
        fetch('/api/aargard/ceo-profile').then(r => r.json()),
        fetch('/api/aargard/updates').then(r => r.json()),
        fetch('/api/aargard/services').then(r => r.json()),
        fetch('/api/aargard/assistance-requests').then(r => r.json())
      ]);
      setCeoProfile(profileRes);
      setUpdates(updatesRes);
      setServices(servicesRes);
      setRequests(requestsRes);
    } catch (err) {
      console.error('Failed to load Aargard dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCeoProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ceoProfile) return;

    try {
      const res = await fetch('/api/aargard/ceo-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ceoProfile)
      });
      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Failed to save CEO profile:', err);
    }
  };

  const handleCreateUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/aargard/updates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          version: newUpdateVersion,
          title: newUpdateTitle,
          badge: newUpdateBadge,
          summary: newUpdateSummary,
          vendor_impact: newUpdateImpact,
          importance: newUpdateImportance,
          details: [newUpdateSummary]
        })
      });
      if (res.ok) {
        const created = await res.json();
        setUpdates(prev => [created, ...prev]);
        setShowAddUpdate(false);
        setNewUpdateTitle('');
        setNewUpdateSummary('');
        setNewUpdateImpact('');
      }
    } catch (err) {
      console.error('Error creating update:', err);
    }
  };

  const handleUpdateRequestStatus = async (id: string, status: 'pending' | 'in_progress' | 'resolved', admin_notes: string) => {
    try {
      const res = await fetch(`/api/aargard/assistance-requests/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, admin_notes })
      });
      if (res.ok) {
        const updated = await res.json();
        setRequests(prev => prev.map(r => r.id === id ? updated : r));
      }
    } catch (err) {
      console.error('Error updating assistance ticket:', err);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-gray-400 space-y-3">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs">Loading AArgard Executive Control Center...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-gray-900 via-[#14231b] to-black text-white p-6 sm:p-8 rounded-3xl border border-gray-800 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C9952A]/20 text-[#C9952A] border border-[#C9952A]/30 text-xs font-bold mb-2">
            <Award className="w-3.5 h-3.5" />
            <span>Executive Command Hub</span>
          </div>
          <h2 className="font-serif text-2xl font-bold text-white">
            AArgard CEO Memoir, Updates & Services Control
          </h2>
          <p className="text-xs text-gray-400 mt-1 max-w-xl">
            Manage the public CEO memoir, keynote quote, system-wide updates changelog, and vendor assistance ticketing desk.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 bg-gray-800/80 p-1.5 rounded-2xl border border-gray-700">
          <button
            onClick={() => setActiveTab('memoir')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'memoir' ? 'bg-[#C9952A] text-gray-900 shadow-md' : 'text-gray-300 hover:text-white'
            }`}
          >
            CEO Memoir & Quote
          </button>

          <button
            onClick={() => setActiveTab('updates')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'updates' ? 'bg-[#C9952A] text-gray-900 shadow-md' : 'text-gray-300 hover:text-white'
            }`}
          >
            <span>Updates Log</span>
            <span className="bg-gray-900 text-white text-[10px] px-1.5 py-0.2 rounded-full">
              {updates.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('services')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'services' ? 'bg-[#C9952A] text-gray-900 shadow-md' : 'text-gray-300 hover:text-white'
            }`}
          >
            Services Catalog
          </button>

          <button
            onClick={() => setActiveTab('requests')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'requests' ? 'bg-[#C9952A] text-gray-900 shadow-md' : 'text-gray-300 hover:text-white'
            }`}
          >
            <span>Assistance Tickets</span>
            <span className="bg-red-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
              {requests.filter(r => r.status === 'pending').length}
            </span>
          </button>
        </div>
      </div>

      {/* TAB 1: CEO MEMOIR & KEYNOTE QUOTE */}
      {activeTab === 'memoir' && ceoProfile && (
        <form onSubmit={handleSaveCeoProfile} className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-serif text-lg font-bold text-gray-900">
                  CEO Executive Profile & Memoir Content
                </h3>
                <p className="text-xs text-gray-500">
                  Content displayed in the public modal when visitors click "CEO Memoir"
                </p>
              </div>

              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#0F5C3A] hover:bg-[#0c4b2f] text-white text-xs font-bold flex items-center gap-2 shadow-md cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            </div>

            {saveSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>CEO Profile & Memoir changes saved successfully!</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  CEO Full Name
                </label>
                <input
                  type="text"
                  value={ceoProfile.ceo_name}
                  onChange={(e) => setCeoProfile({ ...ceoProfile, ceo_name: e.target.value })}
                  className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#0F5C3A]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Executive Title & Organization
                </label>
                <input
                  type="text"
                  value={ceoProfile.ceo_title}
                  onChange={(e) => setCeoProfile({ ...ceoProfile, ceo_title: e.target.value })}
                  className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#0F5C3A]"
                />
              </div>
            </div>

            {/* Core Quote Box */}
            <div className="p-5 bg-amber-50/60 rounded-2xl border border-amber-200 space-y-3">
              <label className="block text-xs font-bold text-amber-900 flex items-center gap-1.5">
                <Quote className="w-4 h-4 text-[#C9952A]" />
                <span>Platform Keynote Quote</span>
              </label>
              <textarea
                rows={3}
                value={ceoProfile.core_quote}
                onChange={(e) => setCeoProfile({ ...ceoProfile, core_quote: e.target.value })}
                className="w-full text-xs p-3 rounded-xl border border-amber-300 focus:outline-none focus:border-amber-600 bg-white"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Quote Attribution</label>
                  <input
                    type="text"
                    value={ceoProfile.quote_author}
                    onChange={(e) => setCeoProfile({ ...ceoProfile, quote_author: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-300 bg-white"
                  />
                </div>
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Occasion / Subtext</label>
                  <input
                    type="text"
                    value={ceoProfile.quote_subtext}
                    onChange={(e) => setCeoProfile({ ...ceoProfile, quote_subtext: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-300 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Memoir Paragraphs */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-gray-700">
                Memoir Narrative Paragraphs
              </label>
              {ceoProfile.memoir_paragraphs.map((p, idx) => (
                <div key={idx} className="space-y-1">
                  <span className="text-[10px] font-bold text-gray-400">Paragraph {idx + 1}</span>
                  <textarea
                    rows={3}
                    value={p}
                    onChange={(e) => {
                      const updated = [...ceoProfile.memoir_paragraphs];
                      updated[idx] = e.target.value;
                      setCeoProfile({ ...ceoProfile, memoir_paragraphs: updated });
                    }}
                    className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#0F5C3A]"
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#0F5C3A] hover:bg-[#0c4b2f] text-white text-xs font-bold flex items-center gap-2 shadow-md cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save All Memoir Updates</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* TAB 2: UPDATES LOG */}
      {activeTab === 'updates' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-lg font-bold text-gray-900">
                System Updates & Changelog Broadcast
              </h3>
              <p className="text-xs text-gray-500">
                Posts logged here appear on the public footer, CEO Memoir modal, and Vendor Dashboards
              </p>
            </div>

            <button
              onClick={() => setShowAddUpdate(!showAddUpdate)}
              className="px-4 py-2 rounded-xl bg-[#0F5C3A] hover:bg-[#0c4b2f] text-white text-xs font-bold flex items-center gap-2 shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Log New Update</span>
            </button>
          </div>

          {showAddUpdate && (
            <form onSubmit={handleCreateUpdate} className="bg-white p-6 rounded-2xl border border-emerald-300 shadow-md space-y-4 animate-fade-in">
              <h4 className="font-serif text-sm font-bold text-gray-900 border-b border-gray-100 pb-2">
                Log New Platform Update
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Version</label>
                  <input
                    type="text"
                    required
                    value={newUpdateVersion}
                    onChange={(e) => setNewUpdateVersion(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-gray-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Badge Tag</label>
                  <input
                    type="text"
                    required
                    value={newUpdateBadge}
                    onChange={(e) => setNewUpdateBadge(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-gray-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Importance</label>
                  <select
                    value={newUpdateImportance}
                    onChange={(e) => setNewUpdateImportance(e.target.value as any)}
                    className="w-full text-xs p-2.5 rounded-xl border border-gray-300 bg-white"
                  >
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Update Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Autumn 2026 High-Res Swatch Digitization Caravan"
                  value={newUpdateTitle}
                  onChange={(e) => setNewUpdateTitle(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-300"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Summary & Details</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detailed description of features, bug fixes, or policy changes..."
                  value={newUpdateSummary}
                  onChange={(e) => setNewUpdateSummary(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-300"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Vendor Impact Note</label>
                <input
                  type="text"
                  placeholder="e.g. Free 4K photography available for verified stalls this week"
                  value={newUpdateImpact}
                  onChange={(e) => setNewUpdateImpact(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-300"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddUpdate(false)}
                  className="px-4 py-2 rounded-xl text-xs text-gray-600 hover:bg-gray-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0F5C3A] text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  Publish Update
                </button>
              </div>
            </form>
          )}

          {/* Updates List */}
          <div className="space-y-3">
            {updates.map((item) => (
              <div
                key={item.id}
                className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 bg-emerald-50 text-[#0F5C3A] rounded border border-emerald-200">
                      {item.version}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                      {item.badge}
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono">{item.date}</span>
                  </div>
                  <h4 className="font-bold text-sm text-gray-900">{item.title}</h4>
                  <p className="text-xs text-gray-500 max-w-xl">{item.summary}</p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                    Live Broadcast
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: SERVICES */}
      {activeTab === 'services' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-lg font-bold text-gray-900">
                AArgard Commercial Services Catalog
              </h3>
              <p className="text-xs text-gray-500">
                Configure services offered to stall owners across digitization, cargo, and financial rails
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {services.map((service) => (
              <div
                key={service.id}
                className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="p-2 rounded-xl bg-emerald-100 text-[#0F5C3A]">
                    {service.category === 'digitization' && <Camera className="w-5 h-5" />}
                    {service.category === 'logistics' && <Truck className="w-5 h-5" />}
                    {service.category === 'payments' && <CreditCard className="w-5 h-5" />}
                    {service.category === 'enterprise' && <Database className="w-5 h-5" />}
                  </span>
                  <span className="text-xs font-bold text-[#C9952A] bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                    {service.pricing_tier}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-sm text-gray-900">{service.title}</h4>
                  <p className="text-xs text-[#0F5C3A] font-medium">{service.tagline}</p>
                </div>

                <p className="text-xs text-gray-500">{service.description}</p>

                <div className="text-[11px] text-gray-400 font-mono pt-2 border-t border-gray-100 flex items-center justify-between">
                  <span>Turnaround: {service.turnaround_time}</span>
                  <span className="text-emerald-700 font-bold">Active</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: ASSISTANCE TICKETS */}
      {activeTab === 'requests' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-lg font-bold text-gray-900">
                Vendor Assistance Tickets & Field Desk
              </h3>
              <p className="text-xs text-gray-500">
                Incoming support requests from stall owners for photography caravan, cargo bilty, and catalogue uploads
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {requests.length === 0 ? (
              <div className="p-12 text-center text-gray-400 text-xs bg-white rounded-2xl border border-gray-200">
                No vendor assistance tickets currently logged.
              </div>
            ) : (
              requests.map((ticket) => (
                <div
                  key={ticket.id}
                  className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3">
                    <div>
                      <span className="font-serif font-bold text-base text-gray-900">{ticket.vendor_name}</span>
                      <span className="text-xs text-gray-500 ml-2">({ticket.stall_number})</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        ticket.status === 'resolved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : ticket.status === 'in_progress'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {ticket.status === 'resolved' ? '✓ Resolved' : ticket.status === 'in_progress' ? '⚙ In Progress' : '⏳ Pending'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-bold text-sm text-gray-900">{ticket.subject}</h5>
                    <p className="text-xs text-gray-600 mt-1">{ticket.message}</p>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-gray-500 pt-2 border-t border-gray-100">
                    <div className="flex items-center gap-3">
                      <span>Contact: <strong className="text-gray-800">{ticket.contact_person}</strong></span>
                      <a
                        href={`https://wa.me/${ticket.whatsapp.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-700 font-bold hover:underline flex items-center gap-1"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>WhatsApp: {ticket.whatsapp}</span>
                      </a>
                    </div>

                    <div className="flex items-center gap-2">
                      {ticket.status !== 'in_progress' && (
                        <button
                          onClick={() => handleUpdateRequestStatus(ticket.id, 'in_progress', 'Field team dispatched')}
                          className="px-3 py-1 rounded-lg bg-blue-50 text-blue-800 hover:bg-blue-100 text-[11px] font-bold"
                        >
                          Mark In Progress
                        </button>
                      )}
                      {ticket.status !== 'resolved' && (
                        <button
                          onClick={() => handleUpdateRequestStatus(ticket.id, 'resolved', 'Assistance completed on-site')}
                          className="px-3 py-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 text-[11px] font-bold"
                        >
                          Mark Resolved
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
