import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { VendorAnalytics as AnalyticsType, Vendor } from '../../types';
import { BarChart3, TrendingUp, Eye, Phone, Download, MessageSquare, PhoneCall, CheckCircle2 } from 'lucide-react';

interface VendorAnalyticsProps {
  vendor: Vendor;
  analytics: AnalyticsType;
}

export const VendorAnalytics: React.FC<VendorAnalyticsProps> = ({ vendor, analytics }) => {
  const totalViews = analytics.totalViews || vendor.profile_views || 0;
  const totalWhatsapp = analytics.totalWhatsapp || vendor.whatsapp_clicks || 0;
  const totalCalls = analytics.totalCalls ?? vendor.call_clicks ?? 0;
  const totalMessages = analytics.totalMessages ?? vendor.message_clicks ?? analytics.totalEmails ?? vendor.email_clicks ?? 0;
  const totalDownloads = analytics.totalDownloads || 0;

  const totalInquiries = totalWhatsapp + totalCalls + totalMessages;
  const conversionRate = totalViews > 0 ? ((totalInquiries / totalViews) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-1">
        <span className="text-xs font-bold text-[#0F5C3A] uppercase tracking-wider">
          Performance Intelligence
        </span>
        <h2 className="font-serif text-2xl font-bold text-gray-900">
          Inquiry & Traffic Trends (Last 30 Days)
        </h2>
        <p className="text-xs text-gray-500">
          Daily metrics for stall shop views, direct WhatsApp inquiries, message inquiries, and phone calls.
        </p>
      </div>

      {/* 4 Core Engagement Stats Chips + Conversion Rate */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* 1. Shop Views */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs space-y-2 hover:border-emerald-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Shop Views</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#0F5C3A] flex items-center justify-center font-bold">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif text-2xl font-bold text-gray-900">{totalViews.toLocaleString()}</div>
          <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
            <TrendingUp className="w-3 h-3" /> +{analytics.viewsMoM}% MoM
          </span>
        </div>

        {/* 2. Click to WhatsApp */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs space-y-2 hover:border-green-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Click to WhatsApp</span>
            <div className="w-8 h-8 rounded-lg bg-green-50 text-[#25D366] flex items-center justify-center font-bold">
              <Phone className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif text-2xl font-bold text-gray-900">{totalWhatsapp.toLocaleString()}</div>
          <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
            <TrendingUp className="w-3 h-3" /> +{analytics.whatsappMoM}% MoM
          </span>
        </div>

        {/* 3. Click to Message */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs space-y-2 hover:border-purple-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Click to Message</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif text-2xl font-bold text-gray-900">{totalMessages.toLocaleString()}</div>
          <span className="text-[10px] font-bold text-purple-600 flex items-center gap-0.5">
            <TrendingUp className="w-3 h-3" /> +{analytics.messagesMoM || analytics.emailsMoM || 14}% MoM
          </span>
        </div>

        {/* 4. Click to Call */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs space-y-2 hover:border-blue-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Click to Call</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <PhoneCall className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif text-2xl font-bold text-gray-900">{totalCalls.toLocaleString()}</div>
          <span className="text-[10px] font-bold text-blue-600 flex items-center gap-0.5">
            <TrendingUp className="w-3 h-3" /> +{analytics.callsMoM || 18.5}% MoM
          </span>
        </div>

        {/* 5. Inquiries & Conversion Rate */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white p-4 rounded-xl border border-gray-700 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-300 uppercase tracking-wide">Conversion Rate</span>
            <div className="w-8 h-8 rounded-lg bg-white/10 text-emerald-400 flex items-center justify-center font-bold">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif text-2xl font-bold text-white">{conversionRate}%</div>
          <span className="text-[10px] text-gray-300 block">
            {totalInquiries} total direct buyer inquiries
          </span>
        </div>
      </div>

      {/* Recharts Chart */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="font-serif font-bold text-base text-gray-900">
            30-Day Activity Graph
          </h3>
          <div className="text-xs text-gray-400">
            Comparing daily views, WhatsApp clicks, direct calls, and inquiries
          </div>
        </div>

        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={analytics.dailyMetrics}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" stroke="#9ca3af" fontSize={11} />
              <YAxis stroke="#9ca3af" fontSize={11} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Line type="monotone" dataKey="views" name="Shop Views" stroke="#0F5C3A" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="whatsapp" name="WhatsApp Clicks" stroke="#25D366" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="calls" name="Click to Call" stroke="#2563EB" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="messages" name="Click to Message" stroke="#9333EA" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="downloads" name="Catalogue DLs" stroke="#C9952A" strokeWidth={1.5} strokeDasharray="3 3" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
