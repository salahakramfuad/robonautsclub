import { Metadata } from 'next'
import { SITE_CONFIG } from '@/lib/site-config'
import { PAGE_SEO, buildPageMetadata } from '@/lib/seo-metadata'
import { LEGAL_LAST_UPDATED, REFUND_POLICY } from '@/lib/legal'
import { LegalLink, LegalList, LegalPage, LegalSection } from '@/components/legal/LegalPage'

export const metadata: Metadata = buildPageMetadata({
  title: PAGE_SEO.refund.title,
  description: PAGE_SEO.refund.description,
  path: '/refund-policy',
  absoluteTitle: true,
})

export default function RefundPolicyPage() {
  const email = SITE_CONFIG.email
  const r = REFUND_POLICY
  return (
    <LegalPage
      title="Refund & Cancellation"
      lastUpdated={LEGAL_LAST_UPDATED}
      intro={
        <p>
          This policy covers fees paid to {SITE_CONFIG.name} for workshops, courses, events, and
          Robofest competitions, including payments made through bKash.
        </p>
      }
    >
      <LegalSection title="If we cancel or reschedule">
        <LegalList>
          <li>
            <strong>Cancelled by us:</strong> you get a full refund of the registration fee.
          </li>
          <li>
            <strong>Rescheduled by us:</strong> your registration moves to the new date. If you
            can&apos;t attend the new date, you can ask for a full refund within 7 days of our
            announcement.
          </li>
        </LegalList>
      </LegalSection>

      <LegalSection title="If you cancel">
        <LegalList>
          <li>
            <strong>{r.fullRefundDays} or more days before the event:</strong> full refund, minus
            any non-refundable payment-gateway charges.
          </li>
          <li>
            <strong>
              {r.partialRefundDays}–{r.fullRefundDays - 1} days before the event:
            </strong>{' '}
            {r.partialRefundPercent}% refund.
          </li>
          <li>
            <strong>Less than {r.partialRefundDays} days before, on the day, or if you don&apos;t
            show up:</strong>{' '}
            no refund.
          </li>
          <li>
            If kits, materials, or certificates have already been issued for you, their cost
            may not be refunded.
          </li>
          <li>
            Some events, such as special competitions, may have a different policy. If so, it
            is stated on the event page, and that policy applies instead.
          </li>
        </LegalList>
      </LegalSection>

      <LegalSection title="Transfers">
        <p>
          Instead of a refund, you may ask to move your registration to another participant
          (with the same eligibility) or to a later session of the same program, if seats are
          available. Send the request at least {r.partialRefundDays} days before the event.
        </p>
      </LegalSection>

      <LegalSection title="Duplicate or failed payments">
        <p>
          If you were charged twice, or money left your account but your registration was not
          confirmed, email us within {r.paymentIssueReportDays} days with your bKash transaction
          ID. Once we have confirmed it, we refund duplicate charges in full.
        </p>
      </LegalSection>

      <LegalSection title="Disqualification">
        <p>
          If a participant is disqualified or removed for breaking the competition rules or our{' '}
          <LegalLink href="/code-of-conduct">Code of Conduct</LegalLink>, their fees are not
          refunded.
        </p>
      </LegalSection>

      <LegalSection title="How to request a refund">
        <p>
          Email <LegalLink href={`mailto:${email}`}>{email}</LegalLink> with the subject
          &quot;Refund request&quot; and include:
        </p>
        <LegalList>
          <li>The participant&apos;s name and the event</li>
          <li>Your booking ID or registration ID</li>
          <li>The bKash transaction ID and the number you paid from</li>
          <li>The reason for your request</li>
        </LegalList>
        <p>
          We process approved refunds within {r.processingBusinessDays} business days, and the
          money goes back to the bKash account it came from. Depending on bKash, it may take a
          little longer to appear in your account.
        </p>
      </LegalSection>

      <LegalSection title="Contact">
        <p>
          For questions about refunds, email{' '}
          <LegalLink href={`mailto:${email}`}>{email}</LegalLink> or call{' '}
          <LegalLink href={`tel:${SITE_CONFIG.phone}`}>{SITE_CONFIG.phone}</LegalLink>.
        </p>
      </LegalSection>
    </LegalPage>
  )
}
