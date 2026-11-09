import React, { useEffect, useState } from 'react';
import { Megaphone, X } from 'lucide-react';

/**
 * Time-boxed site notice: a slim banner plus a one-time popup.
 * To announce something new, add an entry to NOTICES. Times are Pakistan time (UTC+5).
 * An entry shows only between `from` and `until`, so it removes itself afterwards.
 */
interface Notice {
  id: string;
  from: string;   // ISO with offset
  until: string;  // ISO with offset
  title: string;
  message: string;
  urdu?: string;
}

const NOTICES: Notice[] = [
  {
    id: 'iqbal-day-2026-open',
    from: '2026-11-09T00:00:00+05:00',
    until: '2026-11-10T00:00:00+05:00',
    title: 'Open as usual on Iqbal Day',
    message: 'No holiday on 9th November (Iqbal Day). Azam Cloth Market is open all day, on normal timings.',
    urdu: '9 نومبر (یومِ اقبال) کی کوئی چھٹی نہیں۔ اعظم کلاتھ مارکیٹ پورا دن معمول کے اوقات میں کھلی ہے۔',
  },
];

const safeGet = (k: string) => { try { return localStorage.getItem(k); } catch { return null; } };
const safeSet = (k: string, v: string) => { try { localStorage.setItem(k, v); } catch { /* ignore */ } };
const sGet = (k: string) => { try { return sessionStorage.getItem(k); } catch { return null; } };
const sSet = (k: string, v: string) => { try { sessionStorage.setItem(k, v); } catch { /* ignore */ } };

export const SiteNotice: React.FC = () => {
  const now = Date.now();
  const notice = NOTICES.find((n) => now >= Date.parse(n.from) && now < Date.parse(n.until));
  const [showBanner, setShowBanner] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    if (!notice) return;
    setShowBanner(!sGet(`notice-banner:${notice.id}`));
    setShowPopup(!safeGet(`notice-popup:${notice.id}`));
  }, [notice?.id]);

  if (!notice) return null;

  const closePopup = () => { safeSet(`notice-popup:${notice.id}`, '1'); setShowPopup(false); };
  const closeBanner = () => { sSet(`notice-banner:${notice.id}`, '1'); setShowBanner(false); };

  return (
    <>
      {showBanner && (
        <div role="status" className="bg-[#0F5C3A] text-white text-sm">
          <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-start gap-3">
            <Megaphone className="w-4 h-4 mt-0.5 shrink-0 text-[#C9952A]" />
            <p className="flex-1 min-w-0 leading-snug">
              <strong>{notice.title}.</strong> {notice.message}
            </p>
            <button onClick={closeBanner} aria-label="Dismiss notice" className="shrink-0 -m-2 p-2 min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer text-emerald-100 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {showPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60" onClick={closePopup}>
          <div role="dialog" aria-modal="true" aria-labelledby="site-notice-title"
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-[#0F5C3A] px-6 py-5 text-white">
              <div className="w-11 h-11 rounded-full bg-[#C9952A] flex items-center justify-center mb-3">
                <Megaphone className="w-5 h-5" />
              </div>
              <h2 id="site-notice-title" className="font-serif text-xl font-bold leading-tight">{notice.title}</h2>
            </div>
            <div className="px-6 py-5 space-y-3">
              <p className="text-gray-800 text-base leading-relaxed">{notice.message}</p>
              {notice.urdu && <p dir="rtl" lang="ur" className="text-gray-700 text-lg leading-loose">{notice.urdu}</p>}
              <button onClick={closePopup} autoFocus className="w-full min-h-[48px] rounded-xl bg-[#0F5C3A] text-white font-bold cursor-pointer hover:bg-[#0c4a2f]">
                Got it
              </button>
            </div>
            <button onClick={closePopup} aria-label="Close" className="absolute top-2 right-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-white/80 hover:text-white cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
