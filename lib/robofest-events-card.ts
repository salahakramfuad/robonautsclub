import type { Event } from '@/types/event'
import { ROBOFEST_LOCAL } from '@/lib/robofest-local'

/** Stable synthetic id — not a Firestore document. */
export const ROBOFEST_EVENTS_LIST_CARD_ID = 'robofest-local-2026'

/** Bangla copy for the public Events list card (English comes from ROBOFEST_LOCAL). */
const ROBOFEST_EVENTS_CARD_BN = {
  description:
    'ঢাকা ও চট্টগ্রামে প্রতিযোগিতা করুন, আর এগিয়ে যান দক্ষিণ কোরিয়ায় RoboFest World Championship 2027-এর পথে।',
  tags: ['Robofest', 'প্রতিযোগিতা'],
} as const

/**
 * Hardcoded Robofest card for the public Events list.
 * Links to /robofest; no Events booking/registration.
 * Stays Upcoming until both round dates have passed (BD calendar).
 * Pass `locale: 'bn'` for Bangla copy; defaults to English.
 */
export function getRobofestEventsListCard(locale: string = 'en'): Event {
  const now = new Date().toISOString()
  const bn = locale === 'bn' ? ROBOFEST_EVENTS_CARD_BN : null
  return {
    id: ROBOFEST_EVENTS_LIST_CARD_ID,
    slug: 'robofest',
    title: ROBOFEST_LOCAL.headline,
    date: ['2026-09-11', '2026-09-18'],
    location: ROBOFEST_LOCAL.venueLabel,
    description: bn?.description ?? ROBOFEST_LOCAL.lead,
    image: '/robofest/robofest.jpg',
    tags: bn ? [...bn.tags] : ['Robofest', 'Competition'],
    href: '/robofest',
    registrationDisabled: true,
    createdAt: now,
    updatedAt: now,
    createdBy: 'system',
  }
}
