import type { Metadata } from "next";
import { SITE_CONFIG } from "./site-config";

export const NOINDEX_ROBOTS: NonNullable<Metadata["robots"]> = {
  index: false,
  follow: false,
  googleBot: { index: false, follow: false },
};

type OgImage = {
  url: string;
  width?: number;
  height?: number;
  alt?: string;
};

type PageMetadataOptions = {
  title: string;
  description: string;
  path: string;
  /** When true, title is used as-is (no `%s | Robonauts` template). */
  absoluteTitle?: boolean;
  ogImage?: OgImage;
  ogType?: "website" | "article";
  keywords?: string[];
  noindex?: boolean;
  twitterCard?: "summary" | "summary_large_image";
  /** Active locale; adds hreflang alternates and a locale-prefixed canonical. */
  locale?: string;
};

const LOCALES = ["en", "bn"] as const;
const DEFAULT_LOCALE = "en";
const OG_LOCALE: Record<string, string> = { en: "en_US", bn: "bn_BD" };

function prefixPath(path: string, locale: string): string {
  if (locale === DEFAULT_LOCALE) return path;
  return path === "/" ? `/${locale}` : `/${locale}${path}`;
}

/** hreflang map for an unprefixed path. */
export function languageAlternates(path: string): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const l of LOCALES) languages[l] = prefixPath(path, l);
  languages["x-default"] = path;
  return languages;
}

export const PAGE_SEO = {
  home: {
    title: "Robonauts | STEM, Robotics & Olympiad Education in Bangladesh",
    description:
      "Robonauts is Bangladesh's youth robotics club offering STEM education, programming, robotics workshops, and olympiad training for students.",
  },
  about: {
    title: "About Robonauts | STEM & Robotics Education in Bangladesh",
    description:
      "Learn about Robonauts — Bangladesh's youth robotics club. Discover our mission, values, and how we prepare students for Robofest and global STEM challenges.",
  },
  events: {
    title: "Robotics & STEM Events in Bangladesh | Robonauts",
    description:
      "Discover upcoming robotics workshops, competitions, bootcamps, and STEM events across Bangladesh with Robonauts.",
  },
  robofest: {
    title: "RoboFest Bangladesh 2026 | Robonauts",
    description:
      "Register for Robofest Bangladesh 2026 local rounds in Chittagong (11 Sep) and Dhaka (18 Sep). Compete in BottleSumo, BuildAthon, Line Following Bot, or Robo Exhibition.",
  },
  news: {
    title: "Robonauts News | Robotics, STEM & Student Achievements",
    description:
      "Updates, stories, and announcements from Robonauts — workshops, competitions, partnerships, and student achievements in robotics and STEM.",
  },
  gallery: {
    title: "Robonauts Gallery | Robotics, STEM & Events",
    description:
      "Photo gallery from Robonauts workshops, robotics competitions, Robofest, and community STEM events across Bangladesh.",
  },
  privacy: {
    title: "Privacy Policy | Robonauts",
    description:
      "How Robonauts collects, uses, and protects personal information, including cookies and advertising (Google AdSense).",
  },
  terms: {
    title: "Terms & Conditions | Robonauts",
    description:
      "Terms and conditions for using the Robonauts website and registering for workshops, events, and Robofest competitions.",
  },
  refund: {
    title: "Refund & Cancellation Policy | Robonauts",
    description:
      "How refunds and cancellations work for Robonauts event, workshop, and Robofest registration fees paid via bKash.",
  },
  cookies: {
    title: "Cookie Policy | Robonauts",
    description:
      "The cookies and similar technologies Robonauts uses, including Google Analytics and Google AdSense, and how to control them.",
  },
  codeOfConduct: {
    title: "Code of Conduct & Child Safety | Robonauts",
    description:
      "Expected behaviour, safety, and safeguarding rules for students, parents, mentors, and volunteers at Robonauts programs and events.",
  },
} as const;

const DEFAULT_OG_IMAGE: OgImage = {
  url: SITE_CONFIG.metadata.defaultImage,
  width: 407,
  height: 407,
  alt: SITE_CONFIG.metadata.defaultImageAlt,
};

export function buildPageMetadata({
  title,
  description,
  path,
  absoluteTitle = false,
  ogImage = DEFAULT_OG_IMAGE,
  ogType = "website",
  keywords,
  noindex = false,
  twitterCard = "summary_large_image",
  locale,
}: PageMetadataOptions): Metadata {
  const url = locale ? prefixPath(path, locale) : path;
  const resolvedTitle = absoluteTitle ? { absolute: title } : title;
  const ogTitle = absoluteTitle ? title : title.includes("|") ? title : `${title} | ${SITE_CONFIG.name}`;

  return {
    title: resolvedTitle,
    description,
    ...(keywords ? { keywords } : {}),
    openGraph: {
      type: ogType,
      title: ogTitle,
      description,
      url,
      siteName: SITE_CONFIG.name,
      images: [ogImage],
      ...(locale
        ? {
            locale: OG_LOCALE[locale] ?? locale,
            alternateLocale: LOCALES.filter((l) => l !== locale).map((l) => OG_LOCALE[l]),
          }
        : {}),
    },
    twitter: {
      card: twitterCard,
      title: ogTitle,
      description,
      images: [ogImage.url],
      creator: SITE_CONFIG.metadata.twitterCreator,
    },
    alternates: {
      canonical: url,
      ...(locale ? { languages: languageAlternates(path) } : {}),
    },
    ...(noindex ? { robots: NOINDEX_ROBOTS } : {}),
  };
}

export type PageSeoKey = keyof typeof PAGE_SEO;

/**
 * Localized title/description for a static page (from `messages/<locale>/seo.json`)
 * plus hreflang alternates. Server-only.
 */
export async function buildLocalizedPageMetadata(
  key: PageSeoKey,
  locale: string,
  options: Omit<PageMetadataOptions, "title" | "description" | "locale">,
): Promise<Metadata> {
  const { getTranslations } = await import("next-intl/server");
  const t = await getTranslations({ locale, namespace: "seo" });
  return buildPageMetadata({
    ...options,
    title: t(`${key}.title`),
    description: t(`${key}.description`),
    locale,
  });
}
