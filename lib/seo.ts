/**
 * SEO utility functions and structured data generators
 */

import { SITE_CONFIG, getSiteOrigin } from "./site-config";
import { eventPublicHref } from "./event-ui";

export { SITE_CONFIG, getSiteOrigin };

/** Absolute URL for a site path (path must start with `/` or be empty). */
export function absoluteSiteUrl(path: string): string {
  const origin = getSiteOrigin();
  if (!path || path === "/") return `${origin}/`;
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${origin}${p}`;
}

function organizationId(): string {
  return `${getSiteOrigin()}/#organization`;
}

function websiteId(): string {
  return `${getSiteOrigin()}/#website`;
}

function sameAsFromSocial(): string[] {
  return (Object.values(SITE_CONFIG.social) as string[]).filter((u) =>
    u.startsWith("http"),
  );
}

function buildEventStartDate(dateValue: string, time?: string): string {
  if (!dateValue) return "";
  if (time) {
    const match = time.match(/^(\d{1,2}):(\d{2})/);
    if (match) {
      const hours = match[1].padStart(2, "0");
      return `${dateValue}T${hours}:${match[2]}:00`;
    }
  }
  return `${dateValue}T00:00:00`;
}

/**
 * Generate Organization structured data (JSON-LD)
 */
export function getOrganizationSchema() {
  const origin = getSiteOrigin();
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": organizationId(),
    name: SITE_CONFIG.name,
    alternateName: SITE_CONFIG.alternateName,
    url: `${origin}/`,
    logo: absoluteSiteUrl(SITE_CONFIG.assets.logo),
    description: SITE_CONFIG.description,
    address: {
      "@type": "PostalAddress",
      streetAddress: SITE_CONFIG.address.streetAddress,
      addressLocality: SITE_CONFIG.address.locality,
      addressRegion: SITE_CONFIG.address.region,
      addressCountry: SITE_CONFIG.address.country,
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: SITE_CONFIG.phone,
      contactType: "Customer Service",
      email: SITE_CONFIG.email,
      areaServed: "BD",
      availableLanguage: ["en", "bn"],
    },
    sameAs: sameAsFromSocial(),
    areaServed: {
      "@type": "Country",
      name: "Bangladesh",
    },
    audience: {
      "@type": "EducationalAudience",
      educationalRole: "student",
    },
  };
}

/**
 * Generate WebSite structured data (JSON-LD)
 */
export function getWebSiteSchema() {
  const origin = getSiteOrigin();
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": websiteId(),
    url: `${origin}/`,
    name: SITE_CONFIG.name,
    publisher: {
      "@id": organizationId(),
    },
  };
}

/**
 * Generate NewsArticle structured data (JSON-LD)
 */
export function getArticleSchema(article: {
  title: string;
  description: string;
  path: string;
  imageUrl?: string;
  datePublished?: string;
  dateModified?: string;
}) {
  const pageUrl = absoluteSiteUrl(article.path);
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.description,
    url: pageUrl,
    mainEntityOfPage: pageUrl,
    ...(article.imageUrl ? { image: [article.imageUrl] } : {}),
    ...(article.datePublished ? { datePublished: article.datePublished } : {}),
    ...(article.dateModified ? { dateModified: article.dateModified } : {}),
    author: {
      "@type": "Organization",
      name: SITE_CONFIG.name,
      url: `${getSiteOrigin()}/`,
    },
    publisher: {
      "@id": organizationId(),
    },
  };
}

/**
 * Generate Event structured data (JSON-LD)
 */
export function getEventSchema(event: {
  id: string;
  title: string;
  description: string;
  date: string | string[];
  time?: string;
  location: string;
  venue?: string;
  image?: string;
  url: string;
  /** Offer price in major currency units (e.g. BDT). Defaults to 0. */
  price?: string | number;
  priceCurrency?: string;
  endDate?: string;
}) {
  // Handle both single date string and multiple dates (use first date for schema)
  const dateValue = Array.isArray(event.date) 
    ? event.date.length > 0 ? event.date[0] : ''
    : typeof event.date === 'string' && event.date.includes(',')
    ? event.date.split(',')[0].trim()
    : event.date || ''
  
  const startDate = buildEventStartDate(dateValue, event.time);

  const imageUrl = event.image
    ? event.image.startsWith("http")
      ? event.image
      : absoluteSiteUrl(
          event.image.startsWith("/") ? event.image : `/${event.image}`,
        )
    : absoluteSiteUrl(SITE_CONFIG.assets.defaultEventImage);

  const price =
    event.price === undefined || event.price === null
      ? "0"
      : String(event.price);

  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: event.description,
    startDate: startDate,
    ...(event.endDate
      ? {
          endDate: buildEventStartDate(event.endDate, event.time),
        }
      : {}),
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: event.venue || event.location,
      address: {
        "@type": "PostalAddress",
        addressLocality: event.location,
        addressCountry: "BD",
      },
    },
    image: imageUrl,
    organizer: {
      "@type": "Organization",
      "@id": organizationId(),
      name: SITE_CONFIG.name,
      url: `${getSiteOrigin()}/`,
    },
    offers: {
      "@type": "Offer",
      url: event.url.startsWith("http") ? event.url : absoluteSiteUrl(event.url),
      price,
      priceCurrency: event.priceCurrency || "BDT",
      availability: "https://schema.org/InStock",
    },
  };
}

/**
 * Generate BreadcrumbList structured data
 */
export function getBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : absoluteSiteUrl(item.url),
    })),
  };
}

export type ItemListEventItem = { id: string; title: string; slug?: string; href?: string };

/**
 * ItemList JSON-LD for an events index (cap length for reasonable payload size).
 */
export function getEventsItemListSchema(events: ItemListEventItem[], maxItems = 20) {
  const slice = events.slice(0, maxItems);
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: slice.map((e, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: e.title,
      url: absoluteSiteUrl(eventPublicHref(e)),
    })),
  };
}
