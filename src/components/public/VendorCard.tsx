import React from 'react';
import { Award, FileText, Phone, MapPin, CheckCircle, ExternalLink, ArrowRight } from 'lucide-react';
import { Vendor } from '../../types';

interface VendorCardProps {
  vendor: Vendor;
  onSelectVendor: (slug: string) => void;
  onOpenCatalogue: (catalogueId: string) => void;
  onLogEvent: (vendorId: string, type: 'whatsapp_click' | 'email_click' | 'profile_view', catId?: string) => void;
}

const GRADIENT_PRESETS = [
  'from-emerald-800 to-teal-900',
  'from-amber-700 to-yellow-900',
  'from-purple-800 to-indigo-950',
  'from-rose-800 to-pink-950',
  'from-blue-800 to-slate-900',
  'from-[#0F5C3A] to-emerald-950',
];

export const VendorCard: React.FC<VendorCardProps> = ({
  vendor,
  onSelectVendor,
  onOpenCatalogue,
  onLogEvent,
}) => {
  // Deterministic gradient fallback based on shop name
  const gradientIndex = Math.abs(
    vendor.shop_name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  ) % GRADIENT_PRESETS.length;
  const gradientClass = GRADIENT_PRESETS[gradientIndex];

  // Initials fallback
  const initials = vendor.shop_name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  const primaryCatalogue = vendor.catalogues && vendor.catalogues.length > 0 ? vendor.catalogues[0] : null;

  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onLogEvent(vendor.id, 'whatsapp_click');
    const cleanPhone = vendor.whatsapp.replace(/[^0-9+]/g, '');
    const msg = encodeURIComponent(`Hi ${vendor.shop_name}, I found your stall (${vendor.stall_number}) on Azam Market Online directory. I would like to inquire about wholesale fabric prices.`);
    window.open(`https://wa.me/${cleanPhone}?text=${msg}`, '_blank');
  };

  return (
    <div
      onClick={() => {
        onSelectVendor(vendor.slug);
      }}
      className="bg-white rounded-2xl border border-gray-200 shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden group flex flex-col cursor-pointer transform hover:-translate-y-1"
    >
      {/* Cover Image / Banner */}
      <div className="relative h-32 w-full overflow-hidden bg-gray-100">
        {vendor.cover_url ? (
          <img
            src={vendor.cover_url}
            alt={vendor.shop_name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-r ${gradientClass} flex items-center justify-center relative opacity-90`}>
            <span className="text-white/20 font-serif text-5xl font-bold tracking-widest select-none">
              AZAM
            </span>
          </div>
        )}

        {/* Badges Overlay */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap">
          {vendor.is_verified && (
            <span className="bg-[#FDF6E7] text-[#C9952A] text-[10px] font-bold px-2.5 py-1 rounded-full border border-[#C9952A]/40 shadow-xs flex items-center gap-1 backdrop-blur-xs">
              <Award className="w-3 h-3 text-[#C9952A]" /> Verified
            </span>
          )}

          {vendor.is_featured && (
            <span className="bg-purple-900/90 text-purple-200 text-[10px] font-bold px-2 py-0.5 rounded-full border border-purple-500/30">
              Featured
            </span>
          )}
        </div>

        {/* Tier Label */}
        <div className="absolute top-2.5 right-2.5">
          <span className="bg-black/60 text-white text-[10px] font-semibold px-2 py-0.5 rounded-md backdrop-blur-xs capitalize">
            {vendor.tier?.display_name || 'Vendor'}
          </span>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        {/* Logo + Title Header Row */}
        <div className="flex items-start gap-3">
          {/* Logo or Initials */}
          <div className="w-12 h-12 rounded-xl border-2 border-white shadow-md bg-gray-50 flex items-center justify-center overflow-hidden flex-shrink-0 -mt-7 relative z-10">
            {vendor.logo_url ? (
              <img src={vendor.logo_url} alt={vendor.shop_name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-[#0F5C3A] text-white font-bold text-sm flex items-center justify-center font-serif">
                {initials}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-serif font-bold text-base text-gray-900 group-hover:text-[#0F5C3A] transition-colors truncate flex items-center gap-1">
              <span>{vendor.shop_name}</span>
            </h3>
            <p className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5 truncate">
              <MapPin className="w-3 h-3 text-emerald-700 flex-shrink-0" />
              <span>{vendor.stall_number}</span>
            </p>
          </div>
        </div>

        {/* Fabric Tags */}
        <div className="flex flex-wrap gap-1">
          {vendor.categories?.slice(0, 2).map((cat) => (
            <span key={cat.id} className="bg-emerald-50 text-[#0F5C3A] text-[10px] font-semibold px-2 py-0.5 rounded-md">
              {cat.icon} {cat.name}
            </span>
          ))}
          {vendor.tags?.slice(0, 2).map((tag, idx) => (
            <span key={idx} className="bg-gray-100 text-gray-600 text-[10px] font-medium px-2 py-0.5 rounded-md">
              {tag}
            </span>
          ))}
        </div>

        {/* Description snippet */}
        <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
          {vendor.description}
        </p>

        {/* Action Buttons Row */}
        <div className="pt-2 border-t border-gray-100 grid grid-cols-2 gap-2">
          {/* WhatsApp Button */}
          <button
            onClick={handleWhatsAppClick}
            className="w-full bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold py-2 px-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </button>

          {/* Catalogue or View Shop */}
          {primaryCatalogue ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenCatalogue(primaryCatalogue.id);
              }}
              className="w-full bg-[#FDF6E7] hover:bg-[#f7e6c5] text-[#C9952A] text-xs font-bold py-2 px-2 rounded-xl border border-[#C9952A]/40 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-[#C9952A]" />
              <span>Catalogue</span>
            </button>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelectVendor(vendor.slug);
              }}
              className="w-full bg-gray-900 hover:bg-black text-white text-xs font-semibold py-2 px-2 rounded-xl flex items-center justify-center gap-1 transition-colors cursor-pointer"
            >
              <span>View Stall</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
