/**
 * Single source of truth for all website constants.
 * Import from here instead of hardcoding values across the codebase.
 */

/** Canonical production origin — never use preview/workers hosts for SEO URLs in production. */
export const PRIMARY_SITE_ORIGIN = 'https://www.robonautsltd.com' as const

/** Dev / non-production fallbacks only (not used when NODE_ENV=production). */
export const PUBLIC_BASE_URL_FALLBACKS = [
  PRIMARY_SITE_ORIGIN,
  'https://www.robonautsclub.com',
  'https://robonautsclubbd.atm3collab.workers.dev',
] as const

function normalizeOrigin(raw: string): string {
  let url = raw.trim().replace(/\/+$/, '')
  if (
    process.env.NODE_ENV === 'production' &&
    url.startsWith('http://') &&
    !/localhost|127\.0\.0\.1/i.test(url)
  ) {
    url = `https://${url.slice('http://'.length)}`
  }
  return url
}

/**
 * Resolve the public site/base URL for PDFs, emails, verification, and payment callbacks.
 * Order: explicit arg → NEXT_PUBLIC_BASE_URL → NEXT_PUBLIC_SITE_URL →
 * (non-production only) Vercel preview / localhost / legacy fallbacks →
 * (production) PRIMARY_SITE_ORIGIN only
 */
export function resolvePublicBaseUrl(explicit?: string | null): string {
  const candidates: Array<string | null | undefined> = [
    explicit,
    process.env.NEXT_PUBLIC_BASE_URL,
    process.env.NEXT_PUBLIC_SITE_URL,
  ]

  if (process.env.NODE_ENV !== 'production') {
    if (process.env.VERCEL_URL) {
      candidates.push(`https://${process.env.VERCEL_URL}`)
    }
    if (process.env.VERCEL_BRANCH_URL) {
      const branch = process.env.VERCEL_BRANCH_URL
      candidates.push(branch.startsWith('http') ? branch : `https://${branch}`)
    }
    if (process.env.NODE_ENV === 'development') {
      candidates.push('http://localhost:3000')
    }
    candidates.push(...PUBLIC_BASE_URL_FALLBACKS)
  } else {
    candidates.push(PRIMARY_SITE_ORIGIN)
  }

  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim()) {
      return normalizeOrigin(candidate)
    }
  }

  return PRIMARY_SITE_ORIGIN
}

/** Canonical site origin with no trailing slash (safe for string concatenation). */
export function getSiteOrigin(): string {
  return resolvePublicBaseUrl(
    process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL,
  )
}

export const SITE_CONFIG = {
  name: "Robonauts",
  alternateName: "Robonauts  Bangladesh",
  tagline: "Innovation meets curiosity in STEM education",
  /** Prefer `getSiteOrigin()` / `resolvePublicBaseUrl()` when building absolute URLs. */
  url: `${PRIMARY_SITE_ORIGIN}/`,
  description:
    "Bangladesh's first youth robotics club preparing students for Robofest & global STEM challenges.",
  extendedDescription:
    "Bangladesh's first youth robotics club preparing students for Robofest and global STEM challenges through hands-on robotics workshops, programming, and competition training.",
  email: "info@robonautsltd.com",
  noreplyEmail: "no-reply@robonautsltd.com",
  phone: "+8801824863366",
  location: "5B, House #4, Road #7, Sector #3, Uttara",
  address: {
    streetAddress: "5B, House #4, Road #7, Sector #3",
    locality: "Uttara",
    region: "Dhaka",
    country: "BD",
  },
  social: {
    facebook: "https://www.facebook.com/robonautsltd",
    instagram: "https://www.instagram.com/robonautsltd",
    whatsapp: "https://wa.me/8801824863366",
    linkedin: "https://www.linkedin.com/company/robonauts-ltd/",
    youtube: "https://www.youtube.com/@RobonautsLtd",
  },
  navLinks: [
    { title: "Home", href: "/" },
    { title: "Events", href: "/events" },
    { title: "News", href: "/news" },
    { title: "Robofest", href: "/robofest" },
    { title: "Gallery", href: "/gallery" },
    { title: "About us", href: "/about" },
  ],
  services: [
    "Robotics Workshops",
    "Hands-on Training",
    "Robo Fair",
    "Competitions and Simulations",
  ],
  metadata: {
    defaultTitle:
      "Robonauts | STEM, Robotics & Olympiad Education in Bangladesh",
    titleTemplate: "%s | Robonauts",
    defaultDescription:
      "Robonauts is Bangladesh's youth robotics club offering STEM education, programming, robotics workshops, and olympiad training for students.",
    keywords: [
      "robotics Bangladesh",
      "STEM education Bangladesh",
      "Robofest Bangladesh",
      "youth robotics club",
      "robotics workshop Dhaka",
      "STEM training Bangladesh",
      "robotics competition Bangladesh",
      "robotics education",
      "coding workshop Bangladesh",
      "AI education Bangladesh",
      "electronics training",
      "robotics for kids",
      "robotics for students",
      "robotics club Dhaka",
      "STEM club Bangladesh",
    ],
    /** Used for Open Graph / Twitter link previews (1200×630). */
    defaultImage: "/og-default.jpg",
    defaultImageAlt: "Robonauts — STEM, robotics & olympiad education in Bangladesh",
    defaultImageWidth: 1200,
    defaultImageHeight: 630,
    twitterCreator: "@robonauts_club",
  },
  assets: {
    logo: "/robologo.png",
    defaultEventImage: "/robotics-event.jpg",
  },
  developer: {
    name: "Mohammad Salah",
    url: "https://github.com/salahakramfuad",
  },
} as const;
