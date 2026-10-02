import React, { useEffect, useState } from 'react';
import { Market, Category, SubscriptionTier, Vendor, Product, Catalogue, VendorAnalytics, ShopCustomization } from './types';
import { supabase } from './lib/supabaseClient';
import { Navbar } from './components/public/Navbar';
import { VendorHero } from './components/public/VendorHero';
import { CategoryGrid } from './components/public/CategoryGrid';
import { FilterBar } from './components/public/FilterBar';
import { VendorCard } from './components/public/VendorCard';
import { VendorShop } from './components/public/VendorShop';
import { CatalogueViewerModal } from './components/public/CatalogueViewerModal';
import { VendorSidebar } from './components/vendor/VendorSidebar';
import { VendorOverview } from './components/vendor/VendorOverview';
import { ShopProfileForm } from './components/vendor/ShopProfileForm';
import { ShopCustomizer } from './components/vendor/ShopCustomizer';
import { ProductManager } from './components/vendor/ProductManager';
import { CatalogueManager } from './components/vendor/CatalogueManager';
import { VendorAnalytics as VendorAnalyticsComponent } from './components/vendor/VendorAnalytics';
import { SubscriptionUsage } from './components/vendor/SubscriptionUsage';
import { AdminSidebar } from './components/admin/AdminSidebar';
import { AdminOverview } from './components/admin/AdminOverview';
import { VendorTable } from './components/admin/VendorTable';
import { OnboardForm } from './components/admin/OnboardForm';
import { PendingQueue } from './components/admin/PendingQueue';
import { CategoryManager } from './components/admin/CategoryManager';
import { MarketManager } from './components/admin/MarketManager';
import { TierManager } from './components/admin/TierManager';
import { MasterShopControlCenter } from './components/admin/MasterShopControlCenter';
import { VendorUpdateLog } from './components/vendor/VendorUpdateLog';
import { Footer } from './components/public/Footer';
import { VendorLogin } from './components/auth/VendorLogin';
import { VendorRegisterPage } from './components/auth/VendorRegisterPage';
import { AdminLogin } from './components/auth/AdminLogin';
import { LanguageProvider } from './lib/i18n';

export default function App() {
  // Data States
  const [markets, setMarkets] = useState<Market[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tiers, setTiers] = useState<SubscriptionTier[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [adminMetrics, setAdminMetrics] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // View Routing State
  const [currentView, setCurrentView] = useState<'directory' | 'vendor_dashboard' | 'admin_dashboard' | 'vendor_shop' | 'vendor_register'>('directory');
  const [activeVendorSlug, setActiveVendorSlug] = useState<string | null>(null);

  // Vendor Portal State
  const [activeVendorInDashboard, setActiveVendorInDashboard] = useState<Vendor | null>(null);
  const [vendorDashboardTab, setVendorDashboardTab] = useState<'overview' | 'shop' | 'customize' | 'products' | 'catalogues' | 'analytics' | 'subscription' | 'updates'>('overview');
  const [vendorAnalytics, setVendorAnalytics] = useState<VendorAnalytics | null>(null);

  // Admin Portal State
  const [adminTab, setAdminTab] = useState<'overview' | 'master_control' | 'vendors' | 'onboard' | 'pending' | 'subscriptions' | 'categories' | 'markets'>('master_control');

  // Directory Filters State
  const [currentMarket, setCurrentMarket] = useState<string>('azam-cloth-market');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(false);
  const [featuredOnly, setFeaturedOnly] = useState<boolean>(false);
  const [hasCatalogueOnly, setHasCatalogueOnly] = useState<boolean>(false);
  const [activeTier, setActiveTier] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'popular' | 'newest' | 'name'>('popular');

  // Modals
  const [activeCatalogue, setActiveCatalogue] = useState<Catalogue | null>(null);
  const [showVendorLogin, setShowVendorLogin] = useState<boolean>(false);
  const [showAdminLogin, setShowAdminLogin] = useState<boolean>(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);

  // ---------------------------------------------------------------------
  // Supabase Auth bridge: restores an admin/vendor session on page load
  // (including right after a vendor clicks their magic-link email) and
  // whenever auth state changes. Runs once; reads the latest `vendors`
  // list via a ref so it doesn't need to be re-subscribed on every fetch.
  // ---------------------------------------------------------------------
  const vendorsRef = React.useRef<Vendor[]>([]);
  useEffect(() => {
    vendorsRef.current = vendors;
  }, [vendors]);

  useEffect(() => {
    let isMounted = true;

    const handleSession = async (session: import('@supabase/supabase-js').Session | null) => {
      if (!session?.user) return;

      // Admin accounts take priority: an admin_users row for this auth user
      // means they signed in with the Aargard operator email/password.
      const { data: adminRow } = await supabase
        .from('admin_users')
        .select('id')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (adminRow) {
        if (isMounted) {
          setIsAdminAuthenticated(true);
          setCurrentView('admin_dashboard');
        }
        return;
      }

      // Otherwise treat this as a vendor magic-link sign-in.
      const email = session.user.email;
      if (!email) return;

      let vendor = vendorsRef.current.find((v) => v.email.toLowerCase() === email.toLowerCase());

      if (!vendor) {
        const { data: existing } = await supabase
          .from('vendors')
          .select('*')
          .eq('email', email)
          .maybeSingle();
        vendor = existing ?? undefined;
      }

      if (!vendor) {
        // First time this email has signed in: create a pending stall for
        // them to fill in, tied to their auth account.
        const { data: market } = await supabase
          .from('markets')
          .select('id')
          .eq('slug', 'azam-cloth-market')
          .maybeSingle();

        const slug = `${email.split('@')[0].toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString(36)}`;

        const { data: created, error: createError } = await supabase
          .from('vendors')
          .insert({
            user_id: session.user.id,
            market_id: market?.id,
            tier_id: 't-basic',
            slug,
            shop_name: 'New Stall (finish setup)',
            email,
            status: 'pending',
          })
          .select()
          .single();

        if (!createError) {
          vendor = created ?? undefined;
        }
      } else if (!vendor.user_id) {
        // A vendor row exists (e.g. onboarded by admin) but isn't linked to
        // an auth account yet — link it now that they've verified this email.
        await supabase.from('vendors').update({ user_id: session.user.id }).eq('id', vendor.id);
      }

      if (vendor && isMounted) {
        setActiveVendorInDashboard(vendor);
        setCurrentView('vendor_dashboard');
      }
    };

    supabase.auth.getSession().then(({ data }) => handleSession(data.session));
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      handleSession(session);
    });

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------------------------------------------------------------------
  // Supabase data layer. VENDOR_SELECT hydrates a vendor row the same shape
  // the rest of the app already expects (nested tier/market/customization/
  // products/catalogues/categories), so every component below this line
  // needed no changes.
  // ---------------------------------------------------------------------
  const VENDOR_SELECT = `
    *,
    tier:subscription_tiers(*),
    market:markets(*),
    customization:shop_customizations(*),
    products(*),
    catalogues(*),
    vendor_categories(category:categories(*))
  `;

  const hydrateVendor = (row: any): Vendor => ({
    ...row,
    categories: (row.vendor_categories || [])
      .map((vc: any) => vc.category)
      .filter(Boolean),
  });

  const refetchVendor = async (vendorId: string): Promise<Vendor | null> => {
    const { data, error } = await supabase
      .from('vendors')
      .select(VENDOR_SELECT)
      .eq('id', vendorId)
      .single();
    if (error || !data) {
      console.error('Error refetching vendor:', error);
      return null;
    }
    return hydrateVendor(data);
  };

  const applyVendorUpdate = (updated: Vendor) => {
    setVendors((prev) => prev.map((v) => (v.id === updated.id ? updated : v)));
    setActiveVendorInDashboard((prev) => (prev && prev.id === updated.id ? updated : prev));
  };

  const fetchAllData = async () => {
    try {
      setLoading(true);

      const [marketsRes, categoriesRes, tiersRes, vendorsRes] = await Promise.all([
        supabase.from('markets').select('*').order('name'),
        supabase.from('categories').select('*').order('name'),
        supabase.from('subscription_tiers').select('*'),
        supabase
          .from('vendors')
          .select(VENDOR_SELECT)
          .order('created_at', { ascending: false }),
      ]);

      if (marketsRes.error) console.error('Error loading markets:', marketsRes.error);
      if (categoriesRes.error) console.error('Error loading categories:', categoriesRes.error);
      if (tiersRes.error) console.error('Error loading tiers:', tiersRes.error);
      if (vendorsRes.error) console.error('Error loading vendors:', vendorsRes.error);

      const loadedMarkets = marketsRes.data ?? [];
      const loadedCategories = categoriesRes.data ?? [];
      const loadedTiers = tiersRes.data ?? [];
      const loadedVendors = (vendorsRes.data ?? []).map(hydrateVendor);

      setMarkets(loadedMarkets);
      setCategories(loadedCategories);
      setTiers(loadedTiers);
      setVendors(loadedVendors);

      const activeCount = loadedVendors.filter((v) => v.status === 'active').length;
      const pendingCount = loadedVendors.filter((v) => v.status === 'pending').length;
      const suspendedCount = loadedVendors.filter((v) => v.status === 'suspended').length;
      const mrr = loadedVendors
        .filter((v) => v.status === 'active')
        .reduce((sum, v) => {
          const t = loadedTiers.find((x: SubscriptionTier) => x.id === v.tier_id);
          return sum + (t ? t.price_pkr : 0);
        }, 0);

      setAdminMetrics({
        totalVendors: loadedVendors.length,
        activeVendorsCount: activeCount,
        pendingApprovalsCount: pendingCount,
        suspendedCount: suspendedCount,
        mrrPkr: mrr,
        tierBreakdown: {
          basic: loadedVendors.filter((v) => v.tier_id === 't-basic' && v.status === 'active').length,
          standard: loadedVendors.filter((v) => v.tier_id === 't-standard' && v.status === 'active').length,
          premium: loadedVendors.filter((v) => v.tier_id === 't-premium' && v.status === 'active').length,
        },
        recentOnboards: loadedVendors.slice(0, 5),
      });

      if (loadedVendors.length > 0 && !activeVendorInDashboard) {
        setActiveVendorInDashboard(loadedVendors[0]);
      }
    } catch (err) {
      console.error('Error during data initialization:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Admin sign-in is reached only via a direct URL (e.g. /admin), not a
  // public nav link — keeps the storefront looking like a plain buyer
  // directory to anyone just browsing it.
  useEffect(() => {
    const path = window.location.pathname.replace(/\/+$/, '');
    if (path === '/admin' && !isAdminAuthenticated) {
      setShowAdminLogin(true);
    }
    // Vendor self-registration also lives at its own direct URL rather
    // than a public nav link that competes with the plain "Vendor Portal"
    // login button -- reached via the dedicated CTA in the Navbar/Footer.
    if (path === '/register') {
      setCurrentView('vendor_register');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch Vendor Analytics (last 30 days, from inquiry_logs) when active vendor changes
  useEffect(() => {
    if (!activeVendorInDashboard) return;
    let cancelled = false;

    (async () => {
      const dayKey = (d: Date) => d.toISOString().slice(0, 10);
      const today = new Date();
      const days = Array.from({ length: 30 }, (_, i) => {
        const d = new Date(today);
        d.setDate(d.getDate() - (29 - i));
        return dayKey(d);
      });
      const windowStart = new Date(today);
      windowStart.setDate(windowStart.getDate() - 59); // fetch 60d to compute MoM deltas

      const { data: logs, error } = await supabase
        .from('inquiry_logs')
        .select('event_type, created_at')
        .eq('vendor_id', activeVendorInDashboard.id)
        .gte('created_at', windowStart.toISOString());

      if (cancelled) return;
      if (error) {
        console.error('Error loading vendor analytics:', error);
        return;
      }

      type Bucket = { views: number; whatsapp: number; downloads: number; emails: number; calls: number; messages: number };
      const emptyBucket = (): Bucket => ({ views: 0, whatsapp: 0, downloads: 0, emails: 0, calls: 0, messages: 0 });
      const buckets: Record<string, Bucket> = {};
      days.forEach((d) => (buckets[d] = emptyBucket()));
      const prev: Bucket = emptyBucket();
      const cutoff = days[0];

      (logs || []).forEach((log) => {
        const d = dayKey(new Date(log.created_at as string));
        const key =
          log.event_type === 'profile_view' ? 'views' :
          log.event_type === 'whatsapp_click' ? 'whatsapp' :
          log.event_type === 'catalogue_download' ? 'downloads' :
          log.event_type === 'email_click' ? 'emails' :
          log.event_type === 'call_click' ? 'calls' :
          log.event_type === 'message_click' ? 'messages' :
          null;
        if (!key) return;

        if (d >= cutoff && buckets[d]) {
          buckets[d][key] += 1;
        } else if (d < cutoff) {
          prev[key] += 1;
        }
      });

      const totals = days.reduce(
        (acc, d) => ({
          views: acc.views + buckets[d].views,
          whatsapp: acc.whatsapp + buckets[d].whatsapp,
          downloads: acc.downloads + buckets[d].downloads,
          emails: acc.emails + buckets[d].emails,
          calls: acc.calls + buckets[d].calls,
          messages: acc.messages + buckets[d].messages,
        }),
        emptyBucket()
      );

      const momPct = (cur: number, prevVal: number) =>
        prevVal === 0 ? (cur > 0 ? 100 : 0) : Math.round(((cur - prevVal) / prevVal) * 1000) / 10;

      if (!cancelled) {
        setVendorAnalytics({
          dailyMetrics: days.map((d) => ({ date: d, ...buckets[d] })),
          totalViews: totals.views,
          totalWhatsapp: totals.whatsapp,
          totalDownloads: totals.downloads,
          totalEmails: totals.emails,
          totalCalls: totals.calls,
          totalMessages: totals.messages,
          viewsMoM: momPct(totals.views, prev.views),
          whatsappMoM: momPct(totals.whatsapp, prev.whatsapp),
          downloadsMoM: momPct(totals.downloads, prev.downloads),
          emailsMoM: momPct(totals.emails, prev.emails),
          callsMoM: momPct(totals.calls, prev.calls),
          messagesMoM: momPct(totals.messages, prev.messages),
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [activeVendorInDashboard?.id]);

  // Handle Event Logging (WhatsApp click, Email click, Call click, Message click, Profile view, Catalogue download)
  // Vendor stat counters (profile_views, whatsapp_clicks, ...) and
  // catalogues.download_count are bumped server-side by a trigger — see
  // supabase/migrations/20260927000100_inquiry_log_counters.sql — so this
  // is a plain insert, no client-side counter math.
  const logEvent = async (
    vendorId: string,
    event_type: 'whatsapp_click' | 'email_click' | 'call_click' | 'message_click' | 'profile_view' | 'catalogue_download',
    catalogue_id?: string
  ) => {
    try {
      const { error } = await supabase
        .from('inquiry_logs')
        .insert({ vendor_id: vendorId, event_type, catalogue_id: catalogue_id ?? null });
      if (error) throw error;
    } catch (e) {
      console.error(e);
    }
  };

  // Directory Filtered Vendors
  const activeVendors = vendors.filter(v => v.status === 'active');

  const filteredDirectoryVendors = activeVendors.filter(v => {
    if (currentMarket && v.market?.slug !== currentMarket) return false;
    if (selectedCategory && !v.categories?.some(c => c.slug === selectedCategory)) return false;
    if (verifiedOnly && !v.is_verified) return false;
    if (featuredOnly && !v.is_featured) return false;
    if (hasCatalogueOnly && (!v.catalogues || v.catalogues.length === 0)) return false;
    if (activeTier && v.tier?.name !== activeTier) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        v.shop_name.toLowerCase().includes(q) ||
        v.description.toLowerCase().includes(q) ||
        v.stall_number.toLowerCase().includes(q) ||
        v.tags?.some(t => t.toLowerCase().includes(q)) ||
        v.categories?.some(c => c.name.toLowerCase().includes(q)) ||
        v.products?.some(p => p.name.toLowerCase().includes(q) || p.fabric_type.toLowerCase().includes(q))
      );
    }

    return true;
  }).sort((a, b) => {
    if (sortBy === 'popular') return (b.profile_views || 0) - (a.profile_views || 0);
    if (sortBy === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    if (sortBy === 'name') return a.shop_name.localeCompare(b.shop_name);
    return 0;
  });

  // Featured Vendors (Top Slider Row)
  const featuredVendors = activeVendors.filter(v => v.is_featured);

  // Total Catalogues Downloaded live count
  const totalCataloguesDownloaded = vendors.reduce((sum, v) => {
    return sum + (v.catalogues?.reduce((cSum, c) => cSum + (c.download_count || 0), 0) || 0);
  }, 0);

  // Handlers
  const handleOpenVendorShop = (slug: string) => {
    setActiveVendorSlug(slug);
    setCurrentView('vendor_shop');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenCatalogueModal = (catalogueId: string) => {
    for (const v of vendors) {
      if (v.catalogues) {
        const found = v.catalogues.find(c => c.id === catalogueId);
        if (found) {
          setActiveCatalogue(found);
          break;
        }
      }
    }
  };

  const handleDownloadCatalogue = async (catId: string) => {
    const catalogue =
      activeCatalogue?.id === catId
        ? activeCatalogue
        : vendors.flatMap((v) => v.catalogues || []).find((c) => c.id === catId);

    // TODO: once a Storage bucket is set up for catalogue PDFs, pdf_url will
    // be a real Supabase Storage URL and this open() will just work. Until
    // then this opens whatever URL is on the row.
    if (catalogue?.pdf_url) {
      window.open(catalogue.pdf_url, '_blank');
    }
    await logEvent(catalogue?.vendor_id || activeCatalogue?.vendor_id || '', 'catalogue_download', catId);
    fetchAllData();
  };

  const handleSaveShopProfile = async (updatedData: Partial<Vendor>) => {
    if (!activeVendorInDashboard) return;
    try {
      const { categories: _categories, products: _products, catalogues: _catalogues, tier: _tier, market: _market, customization: _customization, ...columnData } = updatedData as any;
      const { error } = await supabase
        .from('vendors')
        .update(columnData)
        .eq('id', activeVendorInDashboard.id);
      if (error) throw error;
      const hydrated = await refetchVendor(activeVendorInDashboard.id);
      if (hydrated) applyVendorUpdate(hydrated);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveCustomization = async (customization: ShopCustomization, publish: boolean) => {
    if (!activeVendorInDashboard) return;
    try {
      const now = new Date().toISOString();
      const { error } = await supabase
        .from('shop_customizations')
        .update({
          ...customization,
          is_published: publish,
          last_saved_at: now,
          published_at: publish ? now : customization.published_at,
        })
        .eq('vendor_id', activeVendorInDashboard.id);
      if (error) throw error;
      const hydrated = await refetchVendor(activeVendorInDashboard.id);
      if (!hydrated) throw new Error('Failed to reload vendor after saving customization');
      applyVendorUpdate(hydrated);
    } catch (err) {
      console.error('Error saving customization:', err);
      throw err;
    }
  };

  const handleAddProduct = async (prodData: Partial<Product>) => {
    if (!activeVendorInDashboard) return;
    try {
      const { error } = await supabase
        .from('products')
        .insert({ ...prodData, vendor_id: activeVendorInDashboard.id });
      if (error) throw error;
      const hydrated = await refetchVendor(activeVendorInDashboard.id);
      if (hydrated) applyVendorUpdate(hydrated);
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateProduct = async (prodId: string, prodData: Partial<Product>) => {
    try {
      const { error } = await supabase.from('products').update(prodData).eq('id', prodId);
      if (error) throw error;
      if (activeVendorInDashboard) {
        const hydrated = await refetchVendor(activeVendorInDashboard.id);
        if (hydrated) applyVendorUpdate(hydrated);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteProduct = async (prodId: string) => {
    try {
      const { error } = await supabase.from('products').delete().eq('id', prodId);
      if (error) throw error;
      if (activeVendorInDashboard) {
        const hydrated = await refetchVendor(activeVendorInDashboard.id);
        if (hydrated) applyVendorUpdate(hydrated);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddCatalogue = async (catData: Partial<Catalogue>) => {
    if (!activeVendorInDashboard) return;
    try {
      const { error } = await supabase
        .from('catalogues')
        .insert({ ...catData, vendor_id: activeVendorInDashboard.id });
      if (error) throw error;
      const hydrated = await refetchVendor(activeVendorInDashboard.id);
      if (hydrated) applyVendorUpdate(hydrated);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteCatalogue = async (catId: string) => {
    try {
      const { error } = await supabase.from('catalogues').delete().eq('id', catId);
      if (error) throw error;
      if (activeVendorInDashboard) {
        const hydrated = await refetchVendor(activeVendorInDashboard.id);
        if (hydrated) applyVendorUpdate(hydrated);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const slugify = (s: string) =>
    `${s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')}-${Date.now().toString(36)}`;

  const handleOnboardVendor = async (vendorData: Partial<Vendor>) => {
    try {
      const defaultMarketId = vendorData.market_id || markets[0]?.id;
      const { error } = await supabase.from('vendors').insert({
        tier_id: 't-basic',
        status: 'active', // admin-onboarded stalls go live immediately (RLS allows this for admins)
        ...vendorData,
        market_id: defaultMarketId,
        slug: vendorData.slug || slugify(vendorData.shop_name || 'stall'),
      });
      if (error) throw error;
      fetchAllData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateVendorStatus = async (vendorId: string, newStatus: 'active' | 'pending' | 'suspended') => {
    try {
      const { error } = await supabase.from('vendors').update({ status: newStatus }).eq('id', vendorId);
      if (error) throw error;
      fetchAllData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateVendorTier = async (vendorId: string, newTierId: string) => {
    try {
      const { error } = await supabase.from('vendors').update({ tier_id: newTierId }).eq('id', vendorId);
      if (error) throw error;
      fetchAllData();
      if (activeVendorInDashboard && activeVendorInDashboard.id === vendorId) {
        const hydrated = await refetchVendor(vendorId);
        if (hydrated) applyVendorUpdate(hydrated);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Starts a Stripe Checkout session for the vendor's $5/month subscription
  // (trial gating / visibility is enforced by RLS server-side; this just
  // sends the vendor to Stripe's hosted checkout page and back).
  const [subscribeLoading, setSubscribeLoading] = useState(false);
  const handleSubscribe = async (vendorId: string) => {
    setSubscribeLoading(true);
    try {
      const res = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendorId }),
      });
      const data = await res.json();
      if (data?.url) {
        window.location.href = data.url;
      } else {
        console.error('Stripe checkout session error:', data?.error);
        alert(data?.error || 'Could not start checkout. Please try again.');
      }
    } catch (e) {
      console.error(e);
      alert('Could not reach the payments server. Please try again.');
    } finally {
      setSubscribeLoading(false);
    }
  };

  // If Stripe redirected back with ?subscribed=1, refetch so the dashboard
  // reflects the new subscription_status once the webhook has landed.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('subscribed') === '1') {
      fetchAllData();
      window.history.replaceState({}, '', window.location.pathname);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUpdateVendor = async (vendorId: string, data: Partial<Vendor>) => {
    try {
      const { categories: _categories, products: _products, catalogues: _catalogues, tier: _tier, market: _market, customization: _customization, ...columnData } = data as any;
      const { error } = await supabase.from('vendors').update(columnData).eq('id', vendorId);
      if (error) throw error;
      fetchAllData();
      if (activeVendorInDashboard && activeVendorInDashboard.id === vendorId) {
        const hydrated = await refetchVendor(vendorId);
        if (hydrated) applyVendorUpdate(hydrated);
      }
    } catch (e) {
      console.error('Error updating vendor:', e);
    }
  };

  const handleDeleteVendor = async (vendorId: string) => {
    try {
      const { error } = await supabase.from('vendors').delete().eq('id', vendorId);
      if (error) throw error;
      fetchAllData();
      if (activeVendorInDashboard && activeVendorInDashboard.id === vendorId) {
        setActiveVendorInDashboard(null);
      }
    } catch (e) {
      console.error('Error deleting vendor:', e);
    }
  };

  const handleAddCategory = async (name: string, icon: string) => {
    try {
      const { error } = await supabase.from('categories').insert({
        name,
        icon,
        slug: slugify(name),
        market_id: markets[0]?.id ?? null,
      });
      if (error) throw error;
      fetchAllData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddMarket = async (name: string, city: string) => {
    try {
      const { error } = await supabase.from('markets').insert({
        name,
        city,
        slug: slugify(name),
        country: 'Pakistan',
      });
      if (error) throw error;
      fetchAllData();
    } catch (e) {
      console.error(e);
    }
  };

  // Render Current View
  const selectedShopVendor = vendors.find(v => v.slug === activeVendorSlug);

  if (loading && vendors.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <img
          src="/icon-192.png"
          alt="Azam Market Online"
          className="w-14 h-14 rounded-2xl animate-bounce shadow-lg"
        />
        <div className="mt-4 font-serif text-lg font-bold text-gray-900">
          Loading Azam Market Online...
        </div>
        <div className="text-xs text-gray-500 mt-1">
          Connecting to Lahore Wholesale Directory
        </div>
      </div>
    );
  }

  // Vendor self-registration -- its own full page at /register, not a
  // modal, so it can hold the full account-creation + business-details
  // flow without competing with the rest of the directory chrome.
  if (currentView === 'vendor_register') {
    return (
      <VendorRegisterPage
        categories={categories}
        tiers={tiers}
        onExit={() => {
          window.history.replaceState({}, '', '/');
          setCurrentView('directory');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* PUBLIC SURFACE (Directory or Single Shop) */}
      {(currentView === 'directory' || currentView === 'vendor_shop') && (
        <>
          <Navbar
            markets={markets}
            currentMarket={currentMarket}
            onMarketChange={setCurrentMarket}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            currentView={currentView}
            onNavigateView={(view) => {
              if (view === 'vendor_dashboard') {
                setShowVendorLogin(true);
              } else if (view === 'admin_dashboard') {
                if (isAdminAuthenticated) {
                  setCurrentView('admin_dashboard');
                } else {
                  setShowAdminLogin(true);
                }
              } else {
                setCurrentView('directory');
              }
            }}
            onNavigateRegister={() => {
              window.history.pushState({}, '', '/register');
              setCurrentView('vendor_register');
            }}
            verifiedOnly={verifiedOnly}
            onToggleVerifiedOnly={() => setVerifiedOnly(!verifiedOnly)}
            onOpenCeoMemoir={() => window.open('https://aargard.com', '_blank')}
          />

          {currentView === 'directory' ? (
            <main className="flex-1">
              {/* Hero Banner */}
              <VendorHero
                totalVendors={activeVendors.length}
                totalCategories={categories.length}
                totalCataloguesDownloaded={totalCataloguesDownloaded}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onSelectCategory={(catSlug) => setSelectedCategory(catSlug)}
              />

              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                {/* Category Grid */}
                <CategoryGrid
                  categories={categories}
                  selectedCategory={selectedCategory}
                  onSelectCategory={setSelectedCategory}
                />

                {/* Featured Vendors Row */}
                {featuredVendors.length > 0 && !selectedCategory && !searchQuery && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="font-serif text-xl font-bold text-gray-900">
                          Featured & Premium Wholesale Suppliers
                        </h2>
                        <p className="text-xs text-gray-500">
                          Handpicked verified mills and direct importers from Azam Cloth Market
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {featuredVendors.slice(0, 3).map((v) => (
                        <VendorCard
                          key={v.id}
                          vendor={v}
                          onSelectVendor={handleOpenVendorShop}
                          onOpenCatalogue={handleOpenCatalogueModal}
                          onLogEvent={logEvent}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* All Vendors Section with Filter Bar */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-serif text-xl font-bold text-gray-900">
                        {selectedCategory
                          ? `${categories.find((c) => c.slug === selectedCategory)?.name || 'Category'} Stalls`
                          : 'All Verified Stalls'}
                      </h2>
                      <p className="text-xs text-gray-500">
                        Browse wholesale stall listings, download PDF catalogues, and connect on WhatsApp
                      </p>
                    </div>
                  </div>

                  <FilterBar
                    verifiedOnly={verifiedOnly}
                    onToggleVerified={() => setVerifiedOnly(!verifiedOnly)}
                    featuredOnly={featuredOnly}
                    onToggleFeatured={() => setFeaturedOnly(!featuredOnly)}
                    hasCatalogueOnly={hasCatalogueOnly}
                    onToggleHasCatalogue={() => setHasCatalogueOnly(!hasCatalogueOnly)}
                    activeTier={activeTier}
                    onSelectTier={setActiveTier}
                    sortBy={sortBy}
                    onSortChange={setSortBy}
                    totalResults={filteredDirectoryVendors.length}
                  />

                  {filteredDirectoryVendors.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                      {filteredDirectoryVendors.map((vendor) => (
                        <VendorCard
                          key={vendor.id}
                          vendor={vendor}
                          onSelectVendor={handleOpenVendorShop}
                          onOpenCatalogue={handleOpenCatalogueModal}
                          onLogEvent={logEvent}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white rounded-2xl p-12 text-center border border-gray-200 text-gray-500 space-y-3">
                      <div className="text-4xl">🔍</div>
                      <h3 className="font-serif text-lg font-bold text-gray-900">
                        No Stall Vendors Found
                      </h3>
                      <p className="text-xs max-w-md mx-auto">
                        No vendors matched your search criteria or filter selections. Try clearing your search or filters.
                      </p>
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setSelectedCategory(null);
                          setVerifiedOnly(false);
                          setFeaturedOnly(false);
                          setHasCatalogueOnly(false);
                        }}
                        className="bg-[#0F5C3A] text-white text-xs font-bold px-4 py-2 rounded-xl mt-2"
                      >
                        Reset All Filters
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </main>
          ) : (
            selectedShopVendor && (
              <VendorShop
                vendor={selectedShopVendor}
                onBackToDirectory={() => setCurrentView('directory')}
                onOpenCatalogue={handleOpenCatalogueModal}
                onLogEvent={logEvent}
              />
            )
          )}

          {/* PUBLIC FOOTER WITH PROJECT DOWNLOAD BUTTON */}
          <Footer
            markets={markets}
            categories={categories}
            onNavigateView={(view) => {
              if (view === 'vendor_dashboard') {
                setShowVendorLogin(true);
              } else if (view === 'admin_dashboard') {
                if (isAdminAuthenticated) {
                  setCurrentView('admin_dashboard');
                } else {
                  setShowAdminLogin(true);
                }
              } else {
                setCurrentView('directory');
              }
            }}
            onNavigateRegister={() => {
              window.history.pushState({}, '', '/register');
              setCurrentView('vendor_register');
            }}
            onOpenCeoMemoir={() => window.open('https://aargard.com', '_blank')}
          />
        </>
      )}

      {/* VENDOR DASHBOARD SURFACE */}
      {currentView === 'vendor_dashboard' && activeVendorInDashboard && (
        <div className="flex min-h-screen">
          <VendorSidebar
            vendors={vendors}
            activeVendor={activeVendorInDashboard}
            onSelectVendor={setActiveVendorInDashboard}
            activeTab={vendorDashboardTab}
            onSelectTab={setVendorDashboardTab}
            onExitToDirectory={() => {
              supabase.auth.signOut();
              setActiveVendorInDashboard(null);
              setCurrentView('directory');
            }}
          />

          <main className="flex-1 p-6 md:p-8 bg-gray-50 overflow-y-auto">
            {vendorDashboardTab === 'overview' && vendorAnalytics && (
              <VendorOverview
                vendor={activeVendorInDashboard}
                analytics={vendorAnalytics}
                onNavigateTab={setVendorDashboardTab}
              />
            )}

            {vendorDashboardTab === 'shop' && (
              <ShopProfileForm
                vendor={activeVendorInDashboard}
                allCategories={categories}
                onSaveProfile={handleSaveShopProfile}
                onOpenCustomizer={() => setVendorDashboardTab('customize')}
              />
            )}

            {vendorDashboardTab === 'customize' && (
              <ShopCustomizer
                vendor={activeVendorInDashboard}
                onSaveCustomization={handleSaveCustomization}
                onOpenLiveShop={(v) => {
                  setActiveVendorSlug(v.slug);
                  setCurrentView('vendor_shop');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            )}

            {vendorDashboardTab === 'products' && (
              <ProductManager
                vendor={activeVendorInDashboard}
                onAddProduct={handleAddProduct}
                onUpdateProduct={handleUpdateProduct}
                onDeleteProduct={handleDeleteProduct}
              />
            )}

            {vendorDashboardTab === 'catalogues' && (
              <CatalogueManager
                vendor={activeVendorInDashboard}
                onAddCatalogue={handleAddCatalogue}
                onDeleteCatalogue={handleDeleteCatalogue}
              />
            )}

            {vendorDashboardTab === 'analytics' && vendorAnalytics && (
              <VendorAnalyticsComponent
                vendor={activeVendorInDashboard}
                analytics={vendorAnalytics}
              />
            )}

            {vendorDashboardTab === 'subscription' && (
              <SubscriptionUsage
                vendor={activeVendorInDashboard}
                tiers={tiers}
                onSubscribe={handleSubscribe}
                subscribeLoading={subscribeLoading}
              />
            )}

            {vendorDashboardTab === 'updates' && (
              <VendorUpdateLog vendor={activeVendorInDashboard} />
            )}
          </main>
        </div>
      )}

      {/* AARGARD ADMIN DASHBOARD SURFACE */}
      {currentView === 'admin_dashboard' && adminMetrics && (
        <div className="flex min-h-screen">
          <AdminSidebar
            pendingCount={vendors.filter((v) => v.status === 'pending').length}
            activeTab={adminTab}
            onSelectTab={setAdminTab}
            onExitToDirectory={() => {
              supabase.auth.signOut();
              setIsAdminAuthenticated(false);
              setCurrentView('directory');
            }}
          />

          <main className="flex-1 p-6 md:p-8 bg-gray-50 overflow-y-auto">
            {adminTab === 'overview' && (
              <AdminOverview
                metrics={adminMetrics}
                onNavigateTab={setAdminTab}
              />
            )}

            {adminTab === 'master_control' && (
              <MasterShopControlCenter
                vendors={vendors}
                tiers={tiers}
                markets={markets}
                categories={categories}
                onRefreshData={fetchAllData}
                onUpdateVendor={handleUpdateVendor}
                onDeleteVendor={handleDeleteVendor}
                onEnterVendorDashboard={(vendor) => {
                  setActiveVendorInDashboard(vendor);
                  setCurrentView('vendor_dashboard');
                }}
                onViewLiveShop={(slug) => {
                  setActiveVendorSlug(slug);
                  setCurrentView('vendor_shop');
                }}
                onOnboardNewVendor={() => setAdminTab('onboard')}
              />
            )}

            {adminTab === 'vendors' && (
              <VendorTable
                vendors={vendors}
                tiers={tiers}
                onUpdateVendorStatus={handleUpdateVendorStatus}
                onUpdateVendorTier={handleUpdateVendorTier}
                onSelectVendorToEdit={() => setAdminTab('master_control')}
                onViewLiveShop={(slug) => {
                  setActiveVendorSlug(slug);
                  setCurrentView('vendor_shop');
                }}
              />
            )}

            {adminTab === 'onboard' && (
              <OnboardForm
                markets={markets}
                categories={categories}
                tiers={tiers}
                onOnboardVendor={handleOnboardVendor}
              />
            )}

            {adminTab === 'pending' && (
              <PendingQueue
                pendingVendors={vendors.filter((v) => v.status === 'pending')}
                onApprove={(id) => handleUpdateVendorStatus(id, 'active')}
                onReject={(id) => handleUpdateVendorStatus(id, 'suspended')}
              />
            )}

            {adminTab === 'subscriptions' && (
              <TierManager tiers={tiers} />
            )}

            {adminTab === 'categories' && (
              <CategoryManager
                categories={categories}
                onAddCategory={handleAddCategory}
              />
            )}

            {adminTab === 'markets' && (
              <MarketManager
                markets={markets}
                onAddMarket={handleAddMarket}
              />
            )}
          </main>
        </div>
      )}

      {/* MODALS */}

      {/* PDF Catalogue Viewer Modal */}
      {activeCatalogue && (
        <CatalogueViewerModal
          catalogue={activeCatalogue}
          vendor={vendors.find((v) => v.id === activeCatalogue.vendor_id)}
          onClose={() => setActiveCatalogue(null)}
          onDownload={handleDownloadCatalogue}
        />
      )}

      {/* Vendor Login Modal */}
      {showVendorLogin && (
        <VendorLogin
          vendors={vendors}
          onSelectVendorToLogin={(v) => {
            setActiveVendorInDashboard(v);
            setShowVendorLogin(false);
            setCurrentView('vendor_dashboard');
          }}
          onGoToRegister={() => {
            setShowVendorLogin(false);
            window.history.pushState({}, '', '/register');
            setCurrentView('vendor_register');
          }}
          onCancel={() => setShowVendorLogin(false)}
        />
      )}

      {/* Admin Login Modal */}
      {showAdminLogin && (
        <AdminLogin
          onAdminAuthenticated={() => {
            setIsAdminAuthenticated(true);
            setShowAdminLogin(false);
            setCurrentView('admin_dashboard');
          }}
          onCancel={() => setShowAdminLogin(false)}
        />
      )}
    </div>
  );
}
