/**
 * Google AdSense publisher config.
 * Auto ads work once this client ID is loaded and Auto ads are enabled in AdSense.
 * Manual units need slot IDs from AdSense → Ads → By ad unit.
 */
export const ADSENSE_PUBLISHER_ID =
  process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID?.trim() ||
  'ca-pub-1079258526503093'

/** In-article / mid-content responsive unit (news articles, long pages). */
export const ADSENSE_SLOT_IN_ARTICLE =
  process.env.NEXT_PUBLIC_ADSENSE_SLOT_IN_ARTICLE?.trim() || ''

/** General display unit (listings, sidebars). */
export const ADSENSE_SLOT_DISPLAY =
  process.env.NEXT_PUBLIC_ADSENSE_SLOT_DISPLAY?.trim() || ''

export function adsenseScriptSrc(clientId = ADSENSE_PUBLISHER_ID): string {
  return `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`
}
