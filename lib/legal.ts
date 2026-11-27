/**
 * Shared config for the legal / policy pages.
 * Footer, sitemap, and cross-links all read from here.
 */

export const LEGAL_LAST_UPDATED = '27 November 2026'

export const LEGAL_PAGES = [
  { href: '/privacy', title: 'Privacy Policy' },
  { href: '/terms', title: 'Terms & Conditions' },
  { href: '/refund-policy', title: 'Refund & Cancellation' },
  { href: '/cookies', title: 'Cookie Policy' },
  { href: '/code-of-conduct', title: 'Code of Conduct' },
] as const

/**
 * Refund windows (in days before the event start).
 * TODO(owner): confirm these values before going live.
 */
export const REFUND_POLICY = {
  /** Requests at least this many days before the event get a full refund (minus gateway fees). */
  fullRefundDays: 7,
  /** Requests between partialRefundDays and fullRefundDays get a partial refund. */
  partialRefundDays: 3,
  /** Percentage refunded within the partial window. */
  partialRefundPercent: 50,
  /** Business days to process an approved refund. */
  processingBusinessDays: 10,
  /** Days after a duplicate / failed charge to report it. */
  paymentIssueReportDays: 30,
} as const
