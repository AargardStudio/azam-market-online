import { useEffect } from 'react';
import { Category, Market, Vendor } from '../../types';
import { PUBLIC_FAQS } from '../../lib/publicFaq';

const SITE_URL = 'https://www.azammarketonline.com';
const DEFAULT_TITLE = 'Azam Market Online | Lahore Wholesale Fabric Directory';
const DEFAULT_DESCRIPTION =
  'Find wholesale fabric suppliers, verified stalls, products and catalogues from Azam Cloth Market and other textile markets in Lahore, Pakistan.';
const DEFAULT_SOCIAL_IMAGE = `${SITE_URL}/hero-banner.jpg`;

interface SeoMetadataProps {
  vendor?: Vendor;
  category?: Category;
  market?: Market;
  resultCount?: number;
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

export function SeoMetadata({ vendor, category, market, resultCount = 0 }: SeoMetadataProps) {
  useEffect(() => {
    const canonicalUrl = vendor
      ? `${SITE_URL}/shops/${encodeURIComponent(vendor.slug)}`
      : category
        ? `${SITE_URL}/categories/${encodeURIComponent(category.slug)}`
        : market
          ? `${SITE_URL}/markets/${encodeURIComponent(market.slug)}`
          : `${SITE_URL}/`;
    const marketName = vendor?.market?.name || market?.name || 'Azam Cloth Market';
    const city = vendor?.market?.city || market?.city || 'Lahore';
    const title = vendor
      ? `${vendor.shop_name} | Wholesale Fabric Supplier in ${city}`
      : category
        ? `${category.name} Wholesale Suppliers | Azam Market Online`
        : market
          ? `${market.name} Wholesale Fabric Directory | ${market.city}`
          : DEFAULT_TITLE;
    const description = vendor
      ? `${vendor.description || `${vendor.shop_name} is a wholesale textile supplier in ${marketName}, ${city}.`} Browse products, catalogues and direct enquiry details.`.slice(0, 160)
      : category
        ? `Browse ${resultCount} active ${category.name.toLowerCase()} wholesale stall${resultCount === 1 ? '' : 's'} on Azam Market Online. View products, catalogues and direct contact details.`.slice(0, 160)
        : market
          ? `Browse ${resultCount} active wholesale fabric stall${resultCount === 1 ? '' : 's'} listed in ${market.name}, ${market.city}. View products, catalogues and contact details.`.slice(0, 160)
          : DEFAULT_DESCRIPTION;
    const image = vendor?.logo_url || vendor?.cover_url || DEFAULT_SOCIAL_IMAGE;
    const imageAlt = vendor
      ? `${vendor.shop_name} wholesale fabric stall in ${marketName}, ${city}`
      : 'Azam Market Online wholesale fabric directory in Lahore';

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
    setMeta('meta[property="og:image:alt"]', 'property', 'og:image:alt', imageAlt);
    setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', title);
    setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', description);
    setMeta('meta[name="twitter:image"]', 'name', 'twitter:image', image);
    setMeta('meta[name="twitter:image:alt"]', 'name', 'twitter:image:alt', imageAlt);

    const defaultImageMetadata = [
      ['meta[property="og:image:width"]', 'og:image:width', '1920'],
      ['meta[property="og:image:height"]', 'og:image:height', '1080'],
      ['meta[property="og:image:type"]', 'og:image:type', 'image/jpeg'],
    ] as const;
    defaultImageMetadata.forEach(([selector, key, content]) => {
      if (image === DEFAULT_SOCIAL_IMAGE) setMeta(selector, 'property', key, content);
      else document.head.querySelector(selector)?.remove();
    });

    const scriptId = 'public-page-structured-data';
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
          streetAddress: vendor.shop_address || `${vendor.stall_number}, ${marketName}`,
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
    } else {
      const faqStructuredData = {
        '@type': 'FAQPage',
        '@id': `${canonicalUrl}#faq`,
        mainEntity: PUBLIC_FAQS.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: { '@type': 'Answer', text: item.answer },
        })),
      };
      const pageStructuredData = category || market ? {
        '@type': 'CollectionPage',
        '@id': `${canonicalUrl}#collection`,
        name: title,
        description,
        url: canonicalUrl,
        numberOfItems: resultCount,
        about: category
          ? { '@type': 'Thing', name: category.name }
          : { '@type': 'Place', name: market?.name, address: { '@type': 'PostalAddress', addressLocality: city, addressCountry: market?.country || 'PK' } },
        isPartOf: { '@id': `${SITE_URL}/#website` },
      } : {
        '@type': 'WebPage',
        '@id': `${canonicalUrl}#webpage`,
        name: title,
        description,
        url: canonicalUrl,
        isPartOf: { '@id': `${SITE_URL}/#website` },
      };
      const structuredData = {
        '@context': 'https://schema.org',
        '@graph': [pageStructuredData, faqStructuredData],
      };
      const script = document.createElement('script');
      script.id = scriptId;
      script.type = 'application/ld+json';
      script.text = JSON.stringify(structuredData);
      document.head.appendChild(script);
    }
  }, [vendor, category, market, resultCount]);

  return null;
}

