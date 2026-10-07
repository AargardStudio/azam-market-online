import React from 'react';
import { Disclaimer } from './Disclaimer';
import {
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
  Truck,
  ArrowUpRight,
} from 'lucide-react';
import { Market, Category } from '../../types';

interface FooterProps {
  markets: Market[];
  categories: Category[];
  onNavigateView: (view: 'directory' | 'vendor_dashboard' | 'admin_dashboard') => void;
  onNavigateRegister: () => void;
  onOpenCeoMemoir: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  markets,
  categories,
  onNavigateView,
  onNavigateRegister,
  onOpenCeoMemoir,
}) => {
  return (
    <footer className="bg-gradient-to-b from-gray-900 via-gray-900 to-black text-gray-300 border-t border-gray-800 mt-16 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <Disclaimer dark />
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
                  onClick={onNavigateRegister}
                  className="hover:text-emerald-400 transition-colors text-left flex items-center gap-1 text-emerald-400 font-semibold"
                >
                  <span>Register Wholesale Stall</span>
                  <ArrowUpRight className="w-3 h-3" />
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
            <button
              onClick={onOpenCeoMemoir}
              className="hover:text-white transition-colors text-[11px]"
            >
              About Aargard
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
