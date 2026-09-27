import React, { useState, useEffect } from 'react';
import { 
  X, 
  Quote, 
  Sparkles, 
  Award, 
  Calendar, 
  Truck, 
  Camera, 
  CreditCard, 
  Database, 
  CheckCircle2, 
  ExternalLink, 
  ArrowRight, 
  Building2, 
  History, 
  Layers,
  ChevronRight,
  ShieldCheck,
  Send,
  Download
} from 'lucide-react';
import { CeoProfile, AargardUpdate, AargardService } from '../../types';

interface CeoMemoirModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenDownloadProject?: () => void;
}

export const CeoMemoirModal: React.FC<CeoMemoirModalProps> = ({
  isOpen,
  onClose,
  onOpenDownloadProject
}) => {
  const [activeTab, setActiveTab] = useState<'memoir' | 'updates' | 'services'>('memoir');
  const [ceoProfile, setCeoProfile] = useState<CeoProfile | null>(null);
  const [updates, setUpdates] = useState<AargardUpdate[]>([]);
  const [services, setServices] = useState<AargardService[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      Promise.all([
        fetch('/api/aargard/ceo-profile').then(r => r.json()),
        fetch('/api/aargard/updates').then(r => r.json()),
        fetch('/api/aargard/services').then(r => r.json())
      ])
        .then(([profileData, updatesData, servicesData]) => {
          setCeoProfile(profileData);
          setUpdates(updatesData);
          setServices(servicesData);
          setLoading(false);
        })
        .catch(err => {
          console.error('Failed to load Aargard data:', err);
          setLoading(false);
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full overflow-hidden border border-gray-100 flex flex-col max-h-[92vh] my-auto">
        
        {/* Hero Header */}
        <div className="bg-gradient-to-r from-[#0F5C3A] via-[#163f2d] to-[#1B2A4A] p-6 sm:p-8 text-white relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-emerald-200 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="relative">
              <img
                src={ceoProfile?.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400'}
                alt={ceoProfile?.ceo_name || 'CEO'}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-[#C9952A] shadow-xl"
              />
              <span className="absolute -bottom-2 -right-2 bg-[#C9952A] text-gray-900 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md">
                CEO
              </span>
            </div>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-emerald-200 text-xs font-semibold border border-white/20">
                <Sparkles className="w-3.5 h-3.5 text-[#C9952A]" />
                <span>Executive Vision & Platform Architecture</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">
                {ceoProfile?.ceo_name || 'Mian Tariq Aargard'}
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100/90 max-w-xl">
                {ceoProfile?.ceo_title || 'Founding CEO, AArgard Technologies & Azam Market Digital Federation'}
              </p>
            </div>
          </div>

          {/* Navigation Bar inside modal */}
          <div className="flex items-center gap-2 mt-6 border-t border-white/10 pt-4 overflow-x-auto">
            <button
              onClick={() => setActiveTab('memoir')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'memoir'
                  ? 'bg-white text-[#0F5C3A] shadow-lg'
                  : 'text-emerald-100 hover:bg-white/10'
              }`}
            >
              The Aargard Memoir
            </button>

            <button
              onClick={() => setActiveTab('updates')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === 'updates'
                  ? 'bg-white text-[#0F5C3A] shadow-lg'
                  : 'text-emerald-100 hover:bg-white/10'
              }`}
            >
              <span>Platform Updates Log</span>
              <span className="bg-[#C9952A] text-gray-900 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {updates.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('services')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === 'services'
                  ? 'bg-white text-[#0F5C3A] shadow-lg'
                  : 'text-emerald-100 hover:bg-white/10'
              }`}
            >
              <span>AArgard Commercial Services</span>
              <span className="bg-emerald-900 text-white text-[10px] px-2 py-0.5 rounded-full">
                {services.length}
              </span>
            </button>

            {onOpenDownloadProject && (
              <button
                onClick={() => {
                  onClose();
                  onOpenDownloadProject();
                }}
                className="ml-auto px-3.5 py-1.5 rounded-xl bg-[#C9952A] hover:bg-[#b08123] text-gray-900 text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer shadow-md"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Code (.ZIP)</span>
              </button>
            )}
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-8">
          {loading ? (
            <div className="py-16 text-center space-y-3 text-gray-500">
              <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs">Loading CEO Memoir & Updates...</p>
            </div>
          ) : (
            <>
              {/* TAB 1: MEMOIR & QUOTE */}
              {activeTab === 'memoir' && ceoProfile && (
                <div className="space-y-8 animate-fade-in">
                  
                  {/* Spotlight Quote */}
                  <div className="relative bg-gradient-to-r from-amber-50 via-emerald-50 to-gray-50 p-6 sm:p-8 rounded-3xl border border-[#C9952A]/30 shadow-sm">
                    <Quote className="w-12 h-12 text-[#C9952A]/20 absolute top-4 left-4 -scale-x-100 pointer-events-none" />
                    <div className="relative z-10 pl-6 sm:pl-8 space-y-3">
                      <p className="font-serif italic text-lg sm:text-xl text-gray-900 leading-relaxed font-semibold">
                        "{ceoProfile.core_quote}"
                      </p>
                      <div>
                        <div className="font-bold text-sm text-[#0F5C3A]">
                          — {ceoProfile.quote_author}
                        </div>
                        <div className="text-xs text-gray-500">
                          {ceoProfile.quote_subtext}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Memoir Story Text */}
                  <div className="space-y-4">
                    <div className="border-b border-gray-100 pb-3">
                      <h3 className="font-serif text-2xl font-bold text-gray-900">
                        {ceoProfile.memoir_title}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-500 mt-1">
                        {ceoProfile.memoir_subtitle}
                      </p>
                    </div>

                    <div className="prose text-gray-700 text-sm leading-relaxed space-y-4">
                      {ceoProfile.memoir_paragraphs.map((p, idx) => (
                        <p key={idx} className="text-justify sm:text-left text-gray-700">
                          {p}
                        </p>
                      ))}
                    </div>

                    {/* Signature */}
                    <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                      <div>
                        <div className="font-serif italic text-lg font-bold text-[#0F5C3A]">
                          {ceoProfile.signature_text}
                        </div>
                        <div className="text-[11px] text-gray-400">
                          Founder & Executive Chairman • Azam Market Digital Federation
                        </div>
                      </div>
                      <span className="text-[11px] font-mono text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                        Est. {ceoProfile.founded_year}
                      </span>
                    </div>
                  </div>

                  {/* 4 Pillars of Vision */}
                  <div>
                    <h4 className="font-serif text-lg font-bold text-gray-900 mb-4">
                      Strategic Vision Pillars
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {ceoProfile.vision_pillars.map((pillar, i) => (
                        <div key={i} className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
                          <div className="flex items-center gap-2 font-bold text-sm text-gray-900">
                            <span className="w-2 h-2 rounded-full bg-[#0F5C3A]"></span>
                            <span>{pillar.title}</span>
                          </div>
                          <p className="text-xs text-gray-600 leading-relaxed">
                            {pillar.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Historical Milestones */}
                  <div>
                    <h4 className="font-serif text-lg font-bold text-gray-900 mb-4">
                      Historical Milestones
                    </h4>
                    <div className="relative border-l-2 border-emerald-600/30 pl-6 ml-3 space-y-6">
                      {ceoProfile.milestones.map((m, i) => (
                        <div key={i} className="relative">
                          <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-[#0F5C3A] border-4 border-white shadow-md"></div>
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                            <span className="font-mono text-xs font-bold text-[#C9952A]">
                              {m.year}
                            </span>
                            {m.stat && (
                              <span className="text-[10px] font-bold bg-emerald-100 text-[#0F5C3A] px-2 py-0.5 rounded-full w-max">
                                {m.stat}
                              </span>
                            )}
                          </div>
                          <h5 className="font-bold text-sm text-gray-900 mt-1">
                            {m.title}
                          </h5>
                          <p className="text-xs text-gray-600 mt-0.5">
                            {m.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: PLATFORM UPDATES LOG */}
              {activeTab === 'updates' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <div>
                      <h3 className="font-serif text-xl font-bold text-gray-900">
                        Platform Changelog & Updates Log
                      </h3>
                      <p className="text-xs text-gray-500">
                        Official announcements, feature releases, and market policy notices
                      </p>
                    </div>
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                      Live Broadcast
                    </span>
                  </div>

                  <div className="space-y-4">
                    {updates.map((update) => (
                      <div
                        key={update.id}
                        className="bg-gray-50 hover:bg-white rounded-2xl p-5 border border-gray-200 hover:border-emerald-300 transition-all space-y-3 shadow-sm"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold bg-[#0F5C3A] text-white px-2.5 py-0.5 rounded-lg">
                              {update.version}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                              {update.badge}
                            </span>
                            {update.importance === 'critical' && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                                Critical Notice
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-gray-400 font-mono">
                            {update.date}
                          </span>
                        </div>

                        <h4 className="font-serif text-base font-bold text-gray-900">
                          {update.title}
                        </h4>

                        <p className="text-xs text-gray-600 leading-relaxed">
                          {update.summary}
                        </p>

                        {update.details && update.details.length > 0 && (
                          <ul className="space-y-1 bg-white p-3 rounded-xl border border-gray-200 text-xs text-gray-600">
                            {update.details.map((d, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                                <span>{d}</span>
                              </li>
                            ))}
                          </ul>
                        )}

                        {update.vendor_impact && (
                          <div className="text-[11px] bg-emerald-50 text-emerald-900 p-2.5 rounded-xl border border-emerald-200 font-medium">
                            <span className="font-bold">Vendor Impact: </span>
                            {update.vendor_impact}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: AARGARD COMMERCIAL SERVICES */}
              {activeTab === 'services' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="border-b border-gray-100 pb-3">
                    <h3 className="font-serif text-xl font-bold text-gray-900">
                      AArgard Specialized Platform Services
                    </h3>
                    <p className="text-xs text-gray-500">
                      On-demand digitization, freight dispatch, and ERP connectivity for Azam Market stall owners
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {services.map((service) => (
                      <div
                        key={service.id}
                        className="bg-gray-50 rounded-2xl p-5 border border-gray-200 space-y-4 hover:border-emerald-400 hover:shadow-md transition-all flex flex-col justify-between"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="p-2.5 rounded-xl bg-[#0F5C3A] text-white">
                              {service.category === 'digitization' && <Camera className="w-5 h-5" />}
                              {service.category === 'logistics' && <Truck className="w-5 h-5" />}
                              {service.category === 'payments' && <CreditCard className="w-5 h-5" />}
                              {service.category === 'enterprise' && <Database className="w-5 h-5" />}
                            </span>
                            <span className="text-[11px] font-bold text-[#C9952A] bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                              {service.pricing_tier}
                            </span>
                          </div>

                          <div>
                            <h4 className="font-serif text-base font-bold text-gray-900">
                              {service.title}
                            </h4>
                            <p className="text-xs text-[#0F5C3A] font-medium mt-0.5">
                              {service.tagline}
                            </p>
                          </div>

                          <p className="text-xs text-gray-600 leading-relaxed">
                            {service.description}
                          </p>

                          <div className="space-y-1 pt-1">
                            {service.features.map((f, i) => (
                              <div key={i} className="flex items-center gap-1.5 text-xs text-gray-700">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span>{f}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="pt-3 border-t border-gray-200 flex items-center justify-between">
                          <span className="text-[10px] text-gray-400 font-mono">
                            Turnaround: {service.turnaround_time}
                          </span>
                          <a
                            href={`https://wa.me/${service.contact_whatsapp}?text=${encodeURIComponent(`Hello Aargard Desk, I want to book: ${service.title}`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#0F5C3A] hover:bg-[#0c4b2f] text-white font-bold text-xs shadow-sm transition-all"
                          >
                            <span>Book on WhatsApp</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer info bar */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>AArgard Digital Federation • Lahore</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
