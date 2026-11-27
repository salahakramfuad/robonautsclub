import { Metadata } from 'next'
import { SITE_CONFIG } from '@/lib/site-config'
import { PAGE_SEO, buildPageMetadata } from '@/lib/seo-metadata'
import { LEGAL_LAST_UPDATED } from '@/lib/legal'
import { LegalLink, LegalList, LegalPage, LegalSection } from '@/components/legal/LegalPage'

export const metadata: Metadata = buildPageMetadata({
  title: PAGE_SEO.terms.title,
  description: PAGE_SEO.terms.description,
  path: '/terms',
  absoluteTitle: true,
})

export default function TermsPage() {
  const email = SITE_CONFIG.email
  const name = SITE_CONFIG.name
  return (
    <LegalPage
      title="Terms & Conditions"
      lastUpdated={LEGAL_LAST_UPDATED}
      intro={
        <p>
          These terms apply when you use the {name} website or register for any of our workshops,
          courses, events, or Robofest competitions. Please read them carefully.
        </p>
      }
    >
      <LegalSection title="1. Accepting these terms">
        <p>
          By using this website or submitting a registration, you agree to these Terms, our{' '}
          <LegalLink href="/privacy">Privacy Policy</LegalLink>, our{' '}
          <LegalLink href="/refund-policy">Refund &amp; Cancellation Policy</LegalLink>, and our{' '}
          <LegalLink href="/code-of-conduct">Code of Conduct</LegalLink>. If you do not agree,
          please do not use the site or register.
        </p>
      </LegalSection>

      <LegalSection title="2. Who can register">
        <LegalList>
          <li>
            A parent or legal guardian must register participants under 18, or agree to their
            registration. Whoever submits a registration confirms they have the authority to do so.
          </li>
          <li>
            Each event or competition may have its own requirements for age, grade, or team size.
            These are shown on the event page or in the rulebook.
          </li>
        </LegalList>
      </LegalSection>

      <LegalSection title="3. Registrations and accuracy">
        <LegalList>
          <li>Give accurate, complete, and up-to-date information. We may cancel registrations that use false details.</li>
          <li>A registration is confirmed only when you receive a confirmation and, for paid events, payment has gone through.</li>
          <li>Booking IDs, team numbers, and registration links are personal to you. Do not share them publicly.</li>
          <li>Spots are limited and may be filled on a first-come, first-served basis.</li>
        </LegalList>
      </LegalSection>

      <LegalSection title="4. Fees and payments">
        <p>
          Fees are shown in Bangladeshi Taka (BDT) and are paid through bKash. bKash&apos;s own
          terms also apply to your payment. Refunds follow our{' '}
          <LegalLink href="/refund-policy">Refund &amp; Cancellation Policy</LegalLink>. Do not
          close your browser during checkout until you see the confirmation message.
        </p>
      </LegalSection>

      <LegalSection title="5. Events, schedules, and changes">
        <p>
          We may change event dates, venues, formats, rules, or categories, or cancel an event, if
          there is a good reason, such as safety, low enrolment, venue problems, or circumstances
          outside our control. When that happens, we will tell registered participants using the
          contact details they gave us.
        </p>
      </LegalSection>

      <LegalSection title="6. Competitions and judging">
        <LegalList>
          <li>Participants must follow the rulebook for their category. Organisers may update rulebooks before the event.</li>
          <li>The judges&apos; decisions are final. You can raise a concern through the process the organisers announce at the event.</li>
          <li>Cheating, tampering with another team&apos;s robot, or breaking the rules can lead to disqualification.</li>
        </LegalList>
      </LegalSection>

      <LegalSection title="7. Certificates">
        <p>
          Certificates are issued based on participation or results, as recorded by {name}. Each
          one has a verification link. Changing a certificate or presenting a fake one is
          prohibited, and we may revoke certificates that were issued in error or obtained
          through fraud.
        </p>
      </LegalSection>

      <LegalSection title="8. Accounts">
        <p>
          Dashboard accounts are only for authorised {name} staff and partners. Keep your login
          details private, and tell us right away if you think someone has used your account
          without permission. We may suspend accounts that are misused.
        </p>
      </LegalSection>

      <LegalSection title="9. Acceptable use">
        <p>You must not:</p>
        <LegalList>
          <li>Break any law or anyone else&apos;s rights while using the site</li>
          <li>Try to get into accounts, systems, or data you are not authorised to access</li>
          <li>Disrupt the site, overload it, or scrape it at scale</li>
          <li>Upload or send malicious code, spam, or harmful content</li>
          <li>Pretend to be another person, school, or organisation</li>
        </LegalList>
      </LegalSection>

      <LegalSection title="10. Intellectual property">
        <p>
          The website content, the {name} and Robofest names and logos, our designs, graphics,
          rulebooks, and course materials belong to {name} or its licensors. You may view and share
          them for personal, non-commercial use. Any other use needs our written permission.
          Teams keep the rights to their own project designs.
        </p>
      </LegalSection>

      <LegalSection title="11. Photos and media">
        <p>
          Events may be photographed or filmed. When you attend, you agree that we may use these
          images to promote our programs, as described in our{' '}
          <LegalLink href="/privacy">Privacy Policy</LegalLink>. You can opt out at any time by
          emailing us.
        </p>
      </LegalSection>

      <LegalSection title="12. Safety and liability">
        <p>
          Robotics activities can involve tools, electronics, and batteries. Participants must
          follow safety instructions from staff. Parents and guardians remain responsible for
          their children travelling to and from our events.
        </p>
        <p>
          The site and our services are provided &quot;as is&quot;. To the extent the law allows,{' '}
          {name} is not liable for indirect or consequential losses, or for lost or damaged
          personal belongings or equipment at events. Our total liability for any claim is
          limited to the fees you paid for the event in question. Nothing in these terms limits
          liability that cannot be limited under Bangladeshi law.
        </p>
      </LegalSection>

      <LegalSection title="13. Third-party links and services">
        <p>
          The site may link to or use third-party services, such as bKash, Google, and social
          media. We are not responsible for their content or practices, and their own terms
          apply.
        </p>
      </LegalSection>

      <LegalSection title="14. Responsible disclosure (security)" id="security">
        <p>
          If you find a security vulnerability on our website, please report it privately to{' '}
          <LegalLink href={`mailto:${email}`}>{email}</LegalLink> with the subject line
          &quot;Security&quot;. Include enough detail for us to reproduce it. Please do not access,
          change, or delete other people&apos;s data, disrupt the service, or share the issue
          publicly before we have fixed it. We will not take action against good-faith research
          that follows these guidelines.
        </p>
      </LegalSection>

      <LegalSection title="15. Governing law">
        <p>
          These terms are governed by the laws of the People&apos;s Republic of Bangladesh. Disputes
          will be handled by the courts of Dhaka. We encourage you to contact us first, as most
          issues can be resolved quickly.
        </p>
      </LegalSection>

      <LegalSection title="16. Changes to these terms">
        <p>
          We may update these terms. When we do, we change the &quot;Last updated&quot; date above.
          If you keep using the site or register after a change, you accept the updated terms.
        </p>
      </LegalSection>

      <LegalSection title="17. Contact">
        <p>
          For questions about these terms, email{' '}
          <LegalLink href={`mailto:${email}`}>{email}</LegalLink> or call{' '}
          <LegalLink href={`tel:${SITE_CONFIG.phone}`}>{SITE_CONFIG.phone}</LegalLink>.
        </p>
      </LegalSection>
    </LegalPage>
  )
}
