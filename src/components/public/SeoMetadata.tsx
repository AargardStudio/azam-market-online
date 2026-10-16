import { useEffect } from 'react';
import { Vendor } from '../../types';

const SITE_URL = 'https://www.azammarketonline.com';
const DEFAULT_TITLE = 'Azam Market Online | Lahore Wholesale Fabric Directory';
const DEFAULT_DESCRIPTION =
  'Find wholesale fabric suppliers, verified stalls, products and catalogues from Azam Cloth Market and other textile markets in Lahore, Pakistan.';

interface SeoMetadataProps {
  vendor?: Vendor;
}

const setMeta = (selector: string, attribute: 'name' | 'property', key: string, content: string) => {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.content = content;
};

export function SeoMetadata({ vendor }: SeoMetadataProps) {
  useEffect(() => {
    const canonicalUrl = vendor ? `${SITE_URL}/shops/${encodeURIComponent(vendor.slug)}` : `${SITE_URL}/`;
    const market = vendor?.market?.name || 'Azam Cloth Market';
    const city = vendor?.market?.city || 'Lahore';
    const title = vendor
      ? `${vendor.shop_name} | Wholesale Fabric Supplier in ${city}`
      : DEFAULT_TITLE;
    const description = vendor
      ? `${vendor.description || `${vendor.shop_name} is a wholesale textile supplier in ${market}, ${city}.`} Browse products, catalogues and direct enquiry details.`.slice(0, 160)
      : DEFAULT_DESCRIPTION;
    const image = vendor?.logo_url || vendor?.cover_url || `${SITE_URL}/logo-full.png`;

    document.title = title;
    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;

    setMeta('meta[name="description"]', 'name', 'description', description);
    setMeta('meta[property="og:title"]', 'property', 'og:title', title);
    setMeta('meta[property="og:description"]', 'property', 'og:description', description);
    setMeta('meta[property="og:url"]', 'property', 'og:url', canonicalUrl);
    setMeta('meta[property="og:image"]', 'property', 'og:image', image);
    setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', title);
    setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', description);
    setMeta('meta[name="twitter:image"]', 'name', 'twitter:image', image);

    const scriptId = 'vendor-structured-data';
    document.getElementById(scriptId)?.remove();
    if (vendor) {
      const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'Store',
        '@id': `${canonicalUrl}#store`,
        name: vendor.shop_name,
        description,
        url: canonicalUrl,
        image,
        telephone: vendor.phone || vendor.whatsapp,
        email: vendor.email,
        address: {
          '@type': 'PostalAddress',
          streetAddress: vendor.shop_address || `${vendor.stall_number}, ${market}`,
          addressLocality: city,
          addressCountry: vendor.market?.country || 'PK',
        },
        parentOrganization: { '@id': `${SITE_URL}/#organization` },
        ...(vendor.categories?.length
          ? { knowsAbout: vendor.categories.map((category) => category.name) }
          : {}),
        ...(vendor.products?.length
          ? {
              makesOffer: vendor.products
                .filter((product) => product.is_active)
                .slice(0, 20)
                .map((product) => ({
                  '@type': 'Offer',
                  itemOffered: {
                    '@type': 'Product',
                    name: product.name,
                    description: product.description,
                    category: product.fabric_type,
                    ...(product.image_url ? { image: product.image_url } : {}),
                  },
                })),
            }
          : {}),
      };
      const script = document.createElement('script');
      script.id = scriptId;
      script.type = 'application/ld+json';
      script.text = JSON.stringify(structuredData);
      document.head.appendChild(script);
    }
  }, [vendor]);

  return null;
}

