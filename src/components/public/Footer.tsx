import React, { useState } from 'react';
import { 
  Download, 
  FolderArchive, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Sparkles, 
  Layers, 
  ExternalLink, 
  CheckCircle2, 
  BookOpen, 
  ShieldCheck, 
  Bot, 
  Truck, 
  ArrowUpRight,
  Loader2,
  Code
} from 'lucide-react';
import { Market, Category } from '../../types';

interface FooterProps {
  markets: Market[];
  categories: Category[];
  onNavigateView: (view: 'directory' | 'vendor_dashboard' | 'admin_dashboard') => void;
  onOpenCeoMemoir: () => void;
  onOpenDownloadModal: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  markets,
  categories,
  onNavigateView,
  onOpenCeoMemoir,
  onOpenDownloadModal,
}) => {
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleDirectDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setDownloading(true);
      setDownloadSuccess(false);

      const response = await fetch('/api/project/download');
      if (!response.ok) throw new Error('Download request failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'azam-market-online-project.zip';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (err) {
      console.error('Direct download error:', err);
      window.location.href = '/api/project/download';
    } finally {
      setDownloading(false);
    }
  };

  return (
    <footer className="bg-gradient-to-b from-gray-900 via-gray-900 to-black text-gray-300 border-t border-gray-800 mt-16 font-sans">
      {/* Top Banner / Project Download Spotlight Section */}
      <div className="border-b border-gray-800/80 bg-gradient-to-r from-emerald-950/40 via-gray-900 to-amber-950/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-gradient-to-r from-[#0F5C3A]/30 via-gray-800/80 to-[#1B2A4A]/40 rounded-3xl p-6 sm:p-8 border border-emerald-500/30 shadow-2xl relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-6">
            {/* Background decorative glow */}
            <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-[#C9952A]/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="space-y-2 text-center lg:text-left relative z-10 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold">
                <FolderArchive className="w-3.5 h-3.5" />
                <span>Full-Stack Source Code Available</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              </div>

              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Download Entire Project Codebase
              </h3>
              
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                Export all source files, schemas, and Express API routes in a single, clean ZIP package. Ready to run locally with <code className="bg-black/50 text-emerald-300 px-2 py-0.5 rounded font-mono text-xs">npm install && npm run dev</code>, or share with external AI agents for analysis.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 relative z-10 w-full sm:w-auto shrink-0">
              {/* Primary Instant Download Button */}
              <button
                onClick={handleDirectDownload}
                disabled={downloading}
                title="Download full project as .zip"
                className={`w-full sm:w-auto px-6 py-3.5 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-all shadow-xl cursor-pointer ${
                  downloadSuccess
                    ? 'bg-emerald-600 text-white'
                    : downloading
                    ? 'bg-emerald-800 text-gray-200 cursor-not-allowed'
                    : 'bg-[#0F5C3A] hover:bg-[#0c4b2f] text-white hover:scale-105 active:scale-95 border border-emerald-400/30'
                }`}
              >
                {downloading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-200" />
                    <span>Archiving Project...</span>
                  </>
                ) : downloadSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                    <span>ZIP Downloaded!</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 text-[#C9952A]" />
                    <span>Download Project (.ZIP)</span>
                  </>
                )}
              </button>

              {/* Handover & Details Modal Trigger */}
              <button
                onClick={onOpenDownloadModal}
                className="w-full sm:w-auto px-5 py-3.5 rounded-2xl font-bold text-xs sm:text-sm bg-gray-800/90 hover:bg-gray-700 text-white border border-gray-700 transition-all flex items-center justify-center gap-2 cursor-pointer hover:border-gray-500"
              >
                <Bot className="w-4 h-4 text-emerald-400" />
                <span>AI Handover & Setup</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Directory Columns */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-6">
          
          {/* Brand & Market Identity */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="/icon-192.png"
                alt="Azam Market Online"
                className="w-10 h-10 rounded-2xl border border-emerald-500/30 shadow-lg"
              />
              <div>
                <h4 className="font-serif text-lg font-bold text-white tracking-wide">
                  Azam Market Online
                </h4>
                <p className="text-[11px] text-[#C9952A] font-medium">
                  Asia's Grand Wholesale Fabric Emporium • Lahore
                </p>
              </div>
            </div>

            <p className="text-xs text-gray-400 leading-relaxed max-w-sm">
              Connecting 1,000+ verified cloth mills, importers, and stall merchants across the historic Walled City of Lahore with wholesale fabric buyers throughout Pakistan and the global diaspora.
            </p>

            <div className="space-y-2 text-xs text-gray-400 pt-1">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Azam Cloth Market, Between Delhi Gate & Kashmiri Gate, Walled City, Lahore, Pakistan.</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Mon – Sat: 10:00 AM – 8:00 PM PKT (Sunday Closed)</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>WhatsApp Field Helpline: +92 300 4211985</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                <span>azammarketonline@gmail.com</span>
              </div>
            </div>
          </div>

          {/* Quick Links & Platform Features */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-white border-b border-gray-800 pb-2">
              Marketplace Hub
            </h5>
            <ul className="space-y-2 text-xs text-gray-400">
              <li>
                <button
                  onClick={() => onNavigateView('directory')}
                  className="hover:text-emerald-400 transition-colors text-left flex items-center gap-1.5"
                >
                  <span>Verified Stalls Directory</span>
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenCeoMemoir}
                  className="hover:text-[#C9952A] transition-colors text-left flex items-center gap-1.5 font-medium text-emerald-300"
                >
                  <BookOpen className="w-3.5 h-3.5 text-[#C9952A]" />
                  <span>CEO Aargard Memoir</span>
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenCeoMemoir}
                  className="hover:text-emerald-400 transition-colors text-left flex items-center gap-1.5"
                >
                  <span>Platform Updates Log</span>
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenCeoMemoir}
                  className="hover:text-emerald-400 transition-colors text-left flex items-center gap-1.5"
                >
                  <Truck className="w-3.5 h-3.5 text-amber-400" />
                  <span>AArgard Services & Bilty Desk</span>
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenDownloadModal}
                  className="hover:text-emerald-400 transition-colors text-left flex items-center gap-1.5 text-gray-300"
                >
                  <Code className="w-3.5 h-3.5 text-blue-400" />
                  <span>Project Source & AI Specs</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Popular Fabric Categories */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-white border-b border-gray-800 pb-2">
              Fabric Categories
            </h5>
            <ul className="space-y-2 text-xs text-gray-400">
              {categories.slice(0, 5).map(cat => (
                <li key={cat.id}>
                  <button
                    onClick={() => onNavigateView('directory')}
                    className="hover:text-emerald-400 transition-colors text-left flex items-center justify-between w-full"
                  >
                    <span>{cat.name}</span>
                    <span className="text-[10px] text-gray-600 font-mono">B2B</span>
                  </button>
                </li>
              ))}
              <li>
                <button
                  onClick={() => onNavigateView('directory')}
                  className="text-[#C9952A] hover:underline text-[11px] font-semibold mt-1 block"
                >
                  View All Categories →
                </button>
              </li>
            </ul>
          </div>

          {/* Merchant & Administration */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-white border-b border-gray-800 pb-2">
              Merchant Portals
            </h5>
            <ul className="space-y-2 text-xs text-gray-400">
              <li>
                <button
                  onClick={() => onNavigateView('vendor_dashboard')}
                  className="hover:text-emerald-400 transition-colors text-left flex items-center gap-1.5"
                >
                  <span>Stall Owner Login</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateView('vendor_dashboard')}
                  className="hover:text-emerald-400 transition-colors text-left flex items-center gap-1.5"
                >
                  <span>Vendor Update Log & Support</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateView('admin_dashboard')}
                  className="hover:text-amber-400 transition-colors text-left flex items-center gap-1.5 text-gray-300 font-medium"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                  <span>AArgard Admin Dashboard</span>
                </button>
              </li>
              <li>
                <a
                  href={`https://wa.me/923004211985?text=${encodeURIComponent('Hello Azam Market Online, I want to onboard my stall at Azam Cloth Market.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-400 transition-colors text-left flex items-center gap-1 text-emerald-400 font-semibold"
                >
                  <span>Register Wholesale Stall</span>
                  <ArrowUpRight className="w-3 h-3" />
                </a>
              </li>
              <li>
                <button
                  onClick={onOpenDownloadModal}
                  className="hover:text-white transition-colors text-left flex items-center gap-1.5 text-[#C9952A] font-bold text-xs pt-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Codebase (.ZIP)</span>
                </button>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Bottom Legal & Download Bar */}
      <div className="border-t border-gray-800/80 bg-black/60 py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-2 text-center sm:text-left">
            <span>© 2026 Azam Cloth Market Traders Association & AArgard Technology.</span>
            <span className="hidden sm:inline text-gray-700">•</span>
            <span className="hidden sm:inline text-gray-400">All rights reserved.</span>
          </div>

          <div className="flex items-center gap-4">
            {/* Quick 1-click Download Button in bottom bar */}
            <button
              onClick={handleDirectDownload}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-800 hover:bg-[#0F5C3A] text-emerald-300 hover:text-white border border-gray-700 hover:border-emerald-600 transition-all font-semibold text-[11px] cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#C9952A]" />
              <span>Download Project</span>
            </button>

            <button
              onClick={onOpenDownloadModal}
              className="hover:text-white transition-colors text-[11px]"
            >
              AI Handover Text
            </button>

            <button
              onClick={onOpenCeoMemoir}
              className="hover:text-white transition-colors text-[11px]"
            >
              CEO Memoir
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
