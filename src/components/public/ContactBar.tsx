import React from 'react';
import { Phone, Mail, MessageCircle, MessageSquare } from 'lucide-react';
import { Vendor, DEFAULT_SHOP_CUSTOMIZATION } from '../../types';

interface ContactBarProps {
  vendor: Vendor;
  onLogEvent: (
    vendorId: string,
    type: 'whatsapp_click' | 'email_click' | 'call_click' | 'message_click' | 'profile_view' | 'catalogue_download',
    catId?: string
  ) => void;
}

export const ContactBar: React.FC<ContactBarProps> = ({ vendor, onLogEvent }) => {
  const cust = vendor.customization || DEFAULT_SHOP_CUSTOMIZATION;

  const handleWhatsApp = () => {
    onLogEvent(vendor.id, 'whatsapp_click');
    const phone = vendor.whatsapp.replace(/[^0-9+]/g, '');
    const defaultMsg =
      cust.whatsapp_button?.welcome_message ||
      `Hi ${vendor.shop_name}, I found your shop (${vendor.stall_number}) on Azam Market Online directory. I would like to inquire about wholesale orders and fabric pricing.`;
    const msg = encodeURIComponent(defaultMsg);
    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
  };

  const handleEmail = () => {
    onLogEvent(vendor.id, 'message_click');
    onLogEvent(vendor.id, 'email_click');
    const subject = encodeURIComponent(`Azam Market Inquiry for ${vendor.shop_name}`);
    const body = encodeURIComponent(`Hi ${vendor.shop_name},\n\nI am contacting you regarding your wholesale fabric listings on Azam Market Online.`);
    window.location.href = `mailto:${vendor.email}?subject=${subject}&body=${body}`;
  };

  const handleCall = () => {
    onLogEvent(vendor.id, 'call_click');
    const directPhone = cust.phone_button?.phone_number || vendor.whatsapp;
    window.location.href = `tel:${directPhone.replace(/[^0-9+]/g, '')}`;
  };

  const handleSms = () => {
    onLogEvent(vendor.id, 'message_click');
    const directPhone = (cust.phone_button?.phone_number || vendor.whatsapp).replace(/[^0-9+]/g, '');
    const body = encodeURIComponent(
      `Hi ${vendor.shop_name} (${vendor.stall_number}), I found your shop on Azam Market Online. I'd like to ask about wholesale fabric pricing.`
    );
    window.location.href = `sms:${directPhone}?&body=${body}`;
  };

  const primaryColor = cust.theme_color || '#0F5C3A';

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl py-3 px-4 sm:px-6 z-40 backdrop-blur-md bg-white/95">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left Stall Info */}
        <div className="hidden sm:flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-lg text-white flex items-center justify-center font-bold font-serif text-xs shadow-xs"
            style={{ backgroundColor: primaryColor }}
          >
            {vendor.shop_name[0]}
          </div>
          <div>
            <div className="font-serif font-bold text-xs text-gray-900 leading-tight">
              {vendor.shop_name}
            </div>
            <div className="text-[11px] text-gray-500">
              {vendor.stall_number} • Direct Wholesale Inquiry
            </div>
          </div>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {/* Email Button */}
          <button
            onClick={handleEmail}
            className="hidden md:flex bg-white hover:bg-gray-50 text-gray-800 text-xs font-bold py-2.5 px-4 rounded-xl border border-gray-300 items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Mail className="w-4 h-4 text-gray-600" />
            <span>Email</span>
          </button>

          {/* Attached Phone Call Button (if enabled) */}
          {cust.phone_button?.enabled && cust.phone_button?.show_in_sticky_bar !== false && (
            <button
              onClick={handleCall}
              className="flex-1 sm:flex-initial bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold py-2.5 px-4 rounded-xl border border-blue-200 flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
            >
              <Phone className="w-4 h-4" />
              <span>{cust.phone_button?.custom_label || 'Call Stall'}</span>
            </button>
          )}

          {/* SMS Button */}
          {cust.phone_button?.enabled && cust.phone_button?.show_in_sticky_bar !== false && (
            <button
              onClick={handleSms}
              className="hidden sm:flex bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold py-2.5 px-4 rounded-xl border border-purple-200 items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
            >
              <MessageSquare className="w-4 h-4" />
              <span>SMS</span>
            </button>
          )}

          {/* WhatsApp Button */}
          {cust.whatsapp_button?.enabled !== false && (
            <button
              onClick={handleWhatsApp}
              className="flex-1 sm:flex-initial bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold py-2.5 px-5 sm:px-6 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{cust.whatsapp_button?.custom_label || 'Chat on WhatsApp'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
