import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Language } from '../types';

// -----------------------------------------------------------------------
// Lightweight EN / اردو (Urdu) translation layer for Azam Market Online.
// Covers the shared chrome every buyer and vendor sees (navigation,
// contact actions, filters, dashboard nav). Vendor-authored content
// (shop descriptions, product text, custom FAQs) is left as the vendor
// wrote it — auto-translating someone else's words would misrepresent
// their shop, so that content is untouched by this layer.
// -----------------------------------------------------------------------

const dict = {
  en: {
    'nav.directory': 'Wholesale Directory',
    'nav.vendorPortal': 'Vendor Portal',
    'nav.adminPortal': 'Aargard Admin',
    'nav.verifiedOnly': 'Verified Only',
    'nav.searchPlaceholder': 'Search stalls, fabrics, stall number...',
    'hero.title': "Asia's Largest Fabric Market — Now Online",
    'hero.subtitle': 'Search verified wholesale stalls in Azam Cloth Market, Lahore. Browse products, download PDF catalogues, and connect directly on WhatsApp.',
    'hero.stat.vendors': 'Verified Stalls',
    'hero.stat.categories': 'Fabric Categories',
    'hero.stat.catalogues': 'Catalogues Downloaded',
    'category.browse': 'Browse by Business Category',
    'filter.verified': 'Verified',
    'filter.featured': 'Featured',
    'filter.hasCatalogue': 'Has Catalogue',
    'filter.sort': 'Sort',
    'filter.sort.popular': 'Most Popular',
    'filter.sort.newest': 'Newest',
    'filter.sort.name': 'Name (A-Z)',
    'vendorCard.viewShop': 'View Shop',
    'vendorCard.hasCatalogue': 'PDF Catalogue',
    'contact.whatsapp': 'Chat on WhatsApp',
    'contact.call': 'Call Stall',
    'contact.sms': 'Send SMS',
    'contact.email': 'Email',
    'sidebar.overview': 'Dashboard Overview',
    'sidebar.shop': 'Edit Shop Profile',
    'sidebar.customize': 'Shop Customizer',
    'sidebar.products': 'Products Catalog',
    'sidebar.catalogues': 'PDF Catalogues',
    'sidebar.analytics': 'Inquiry Analytics',
    'sidebar.subscription': 'Subscription',
    'sidebar.updates': 'Updates & Assistance',
    'sub.trialDaysLeft': 'days left in your free trial',
    'sub.trialExpired': 'Your free trial has ended',
    'sub.active': 'Subscription active',
    'sub.subscribeCta': 'Subscribe – $5 / month',
    'sub.notLive': 'Your shop is hidden from the directory until you subscribe.',
  },
  ur: {
    'nav.directory': 'ہول سیل ڈائریکٹری',
    'nav.vendorPortal': 'وینڈر پورٹل',
    'nav.adminPortal': 'آرگارڈ ایڈمن',
    'nav.verifiedOnly': 'صرف تصدیق شدہ',
    'nav.searchPlaceholder': 'دکانیں، کپڑا، دکان نمبر تلاش کریں...',
    'hero.title': 'ایشیا کی سب سے بڑی کپڑا مارکیٹ — اب آن لائن',
    'hero.subtitle': 'اعظم کلاتھ مارکیٹ، لاہور کی تصدیق شدہ ہول سیل دکانیں تلاش کریں۔ پروڈکٹس دیکھیں، پی ڈی ایف کیٹلاگ ڈاؤن لوڈ کریں، اور براہ راست واٹس ایپ پر رابطہ کریں۔',
    'hero.stat.vendors': 'تصدیق شدہ دکانیں',
    'hero.stat.categories': 'کپڑے کی اقسام',
    'hero.stat.catalogues': 'ڈاؤن لوڈ شدہ کیٹلاگ',
    'category.browse': 'کاروبار کی قسم کے مطابق دیکھیں',
    'filter.verified': 'تصدیق شدہ',
    'filter.featured': 'نمایاں',
    'filter.hasCatalogue': 'کیٹلاگ موجود',
    'filter.sort': 'ترتیب',
    'filter.sort.popular': 'مقبول ترین',
    'filter.sort.newest': 'تازہ ترین',
    'filter.sort.name': 'نام (A-Z)',
    'vendorCard.viewShop': 'دکان دیکھیں',
    'vendorCard.hasCatalogue': 'پی ڈی ایف کیٹلاگ',
    'contact.whatsapp': 'واٹس ایپ پر بات کریں',
    'contact.call': 'دکان کو کال کریں',
    'contact.sms': 'ایس ایم ایس بھیجیں',
    'contact.email': 'ای میل',
    'sidebar.overview': 'ڈیش بورڈ کا جائزہ',
    'sidebar.shop': 'دکان کی پروفائل ترتیب دیں',
    'sidebar.customize': 'دکان کسٹمائزر',
    'sidebar.products': 'پروڈکٹس کیٹلاگ',
    'sidebar.catalogues': 'پی ڈی ایف کیٹلاگ',
    'sidebar.analytics': 'انکوائری اینالیٹکس',
    'sidebar.subscription': 'سبسکرپشن',
    'sidebar.updates': 'اپڈیٹس اور معاونت',
    'sub.trialDaysLeft': 'دن باقی ہیں آپ کے مفت ٹرائل میں',
    'sub.trialExpired': 'آپ کا مفت ٹرائل ختم ہو چکا ہے',
    'sub.active': 'سبسکرپشن فعال ہے',
    'sub.subscribeCta': 'سبسکرائب کریں – $5 / ماہانہ',
    'sub.notLive': 'سبسکرائب کرنے تک آپ کی دکان ڈائریکٹری میں نظر نہیں آئے گی۔',
  },
} as const;

export type TranslationKey = keyof typeof dict.en;

interface LanguageContextValue {
  lang: Language;
  setLang: (l: Language) => void;
  t: (key: TranslationKey) => string;
  dir: 'ltr' | 'rtl';
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

const STORAGE_KEY = 'azam_market_lang';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved === 'ur' ? 'ur' : 'en';
    } catch {
      return 'en';
    }
  });

  const setLang = (l: Language) => {
    setLangState(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* ignore */
    }
  };

  const dir: 'ltr' | 'rtl' = lang === 'ur' ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = lang;
  }, [dir, lang]);

  const t = (key: TranslationKey) => dict[lang][key] ?? dict.en[key] ?? key;

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextValue => {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    // Sensible fallback if a component renders outside the provider
    // (e.g. in isolation/tests) rather than crashing the app.
    return { lang: 'en', setLang: () => {}, t: (k) => dict.en[k] ?? k, dir: 'ltr' };
  }
  return ctx;
};
