/**
 * Client-safe feature flag definitions. Values are stored in the D1
 * `feature_flags` table and read on the server via lib/feature-flags.ts.
 */

export const FEATURE_FLAG_DEFS = [
  {
    key: 'registration.events',
    group: 'Registration',
    label: 'Event registration',
    description: 'Lets students register for events. Turn off to pause all event sign-ups (e.g. if bKash is down).',
    defaultEnabled: true,
  },
  {
    key: 'registration.robofest',
    group: 'Registration',
    label: 'Robofest registration',
    description: 'Lets teams register for Robofest. Turn off to pause Robofest sign-ups immediately.',
    defaultEnabled: true,
  },
  {
    key: 'ads.enabled',
    group: 'Ads',
    label: 'Google AdSense',
    description: 'Loads AdSense and shows ad units on public pages.',
    defaultEnabled: true,
  },
  {
    key: 'ui.mobileActionBar',
    group: 'Site features',
    label: 'Mobile action bar',
    description: 'Bottom bar on phones with Join / WhatsApp / Call buttons.',
    defaultEnabled: true,
  },
  {
    key: 'ui.heroVideo',
    group: 'Site features',
    label: 'Homepage hero video',
    description: 'Plays the background video on desktop. When off, a still image is shown (faster).',
    defaultEnabled: true,
  },
  {
    key: 'pages.courses',
    group: 'Site features',
    label: 'Courses page',
    description: 'Shows the /courses page and its menu link.',
    defaultEnabled: true,
  },
  {
    key: 'pages.contactForm',
    group: 'Site features',
    label: 'Contact form',
    description: 'Shows the message form on /contact. When off, only WhatsApp, phone and email are shown.',
    defaultEnabled: true,
  },
  {
    key: 'banner.announcement',
    group: 'Announcement',
    label: 'Announcement banner',
    description: 'Shows a strip at the top of every public page with your message.',
    defaultEnabled: false,
    hasText: true,
  },
] as const

export type FeatureFlagKey = (typeof FEATURE_FLAG_DEFS)[number]['key']

export type FeatureFlagState = {
  enabled: boolean
  /** Text payload (announcement message). */
  value: string | null
}

export type FeatureFlags = Record<FeatureFlagKey, FeatureFlagState>

export const FEATURE_FLAG_KEYS = FEATURE_FLAG_DEFS.map((d) => d.key) as FeatureFlagKey[]

export function isFeatureFlagKey(key: string): key is FeatureFlagKey {
  return (FEATURE_FLAG_KEYS as string[]).includes(key)
}

export function defaultFeatureFlags(): FeatureFlags {
  return Object.fromEntries(
    FEATURE_FLAG_DEFS.map((d) => [d.key, { enabled: d.defaultEnabled, value: null }]),
  ) as FeatureFlags
}

/** Announcement text is stored as JSON: { message, href? }. */
export type AnnouncementValue = { message: string; href?: string }

export function parseAnnouncement(value: string | null): AnnouncementValue | null {
  if (!value) return null
  try {
    const parsed = JSON.parse(value) as Partial<AnnouncementValue>
    const message = typeof parsed.message === 'string' ? parsed.message.trim() : ''
    if (!message) return null
    const href = typeof parsed.href === 'string' && parsed.href.trim() ? parsed.href.trim() : undefined
    return { message, href }
  } catch {
    return null
  }
}

/** Only same-site paths or https links are allowed in the banner. */
export function isSafeBannerHref(href: string): boolean {
  if (href.startsWith('/') && !href.startsWith('//')) return true
  try {
    return new URL(href).protocol === 'https:'
  } catch {
    return false
  }
}
