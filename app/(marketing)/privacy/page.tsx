import { Metadata } from 'next'
import { SITE_CONFIG } from '@/lib/site-config'
import { PAGE_SEO, buildPageMetadata } from '@/lib/seo-metadata'
import { LEGAL_LAST_UPDATED } from '@/lib/legal'
import { LegalLink, LegalList, LegalPage, LegalSection } from '@/components/legal/LegalPage'

export const metadata: Metadata = buildPageMetadata({
  title: PAGE_SEO.privacy.title,
  description: PAGE_SEO.privacy.description,
  path: '/privacy',
  absoluteTitle: true,
})

const { address } = SITE_CONFIG

export default function PrivacyPolicyPage() {
  const email = SITE_CONFIG.email
  return (
    <LegalPage
      title="Privacy Policy"
      lastUpdated={LEGAL_LAST_UPDATED}
      intro={
        <p>
          This policy explains what personal information {SITE_CONFIG.name} collects, why we
          collect it, who we share it with, and the choices you have. It applies to our website,
          event and Robofest registrations, payments, and certificates.
        </p>
      }
    >
      <LegalSection title="Who we are">
        <p>
          {SITE_CONFIG.name} (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) operates{' '}
          <LegalLink href={SITE_CONFIG.url}>{SITE_CONFIG.url.replace(/\/$/, '')}</LegalLink> and
          related sites. We are based at {address.streetAddress}, {address.locality},{' '}
          {address.region}, Bangladesh. You can contact us at{' '}
          <LegalLink href={`mailto:${email}`}>{email}</LegalLink> or{' '}
          <LegalLink href={`tel:${SITE_CONFIG.phone}`}>{SITE_CONFIG.phone}</LegalLink>.
        </p>
      </LegalSection>

      <LegalSection title="Information we collect">
        <p>
          <strong>Information you give us</strong> when you register for an event, workshop, or
          Robofest competition, or when you contact us:
        </p>
        <LegalList>
          <li>Participant name, school or institution, class/grade, and age category</li>
          <li>Contact details: email address and phone number (often a parent or guardian&apos;s)</li>
          <li>Team details and members&apos; names, for team competitions</li>
          <li>Any extra information you add in registration forms</li>
          <li>Messages you send us by email, phone, WhatsApp, or social media</li>
        </LegalList>
        <p>
          <strong>Payment information.</strong> Payments go through bKash. We receive the
          transaction ID, the amount, the payment status, and the bKash account number used. We do
          not receive or store your bKash PIN or OTP.
        </p>
        <p>
          <strong>Information collected automatically</strong>, such as IP address, browser and
          device type, pages visited, and referring pages. Cookies and similar tools collect this
          for security, analytics, and advertising (see our{' '}
          <LegalLink href="/cookies">Cookie Policy</LegalLink>).
        </p>
        <p>
          <strong>Photos and video</strong> taken at our events, which may show participants.
        </p>
      </LegalSection>

      <LegalSection title="How we use information">
        <LegalList>
          <li>To process registrations and run workshops, events, and competitions</li>
          <li>To take payments and send confirmations, receipts, and reminders by email</li>
          <li>To issue certificates and let them be verified</li>
          <li>To answer your questions and give support</li>
          <li>To share program news and achievements, including event photos (see below)</li>
          <li>To understand how the site is used and improve it</li>
          <li>To show advertising (see the Advertising section below)</li>
          <li>To protect the site, prevent fraud, and meet legal obligations</li>
        </LegalList>
      </LegalSection>

      <LegalSection title="Legal basis and consent">
        <p>
          We use your information because you consented to it (for example, by ticking the
          agreement box when you register), because we need it to provide a service you asked for
          (such as a competition entry), because of our legitimate interests in running and
          protecting our programs, or because the law requires it.
        </p>
      </LegalSection>

      <LegalSection title="Registration and certificate verification">
        <p>
          Each registration and certificate has a unique ID with a verification link or QR code.
          Anyone who has that link can see the participant&apos;s name, the event, and the
          registration or certificate details, so event staff, schools, and others can check
          that it is genuine. Keep your registration ID private. If you don&apos;t want a record
          to be publicly verifiable, contact us.
        </p>
      </LegalSection>

      <LegalSection title="Event photos and media">
        <p>
          We may take photos and videos at our events and show them on our website, gallery, news
          pages, and social media. A parent or guardian, or a participant aged 18 or over, can ask
          us to remove a photo or to keep a participant out of published media by emailing{' '}
          <LegalLink href={`mailto:${email}`}>{email}</LegalLink>.
        </p>
      </LegalSection>

      <LegalSection title="Children's privacy">
        <p>
          Many of our participants are under 18. We expect a parent or guardian to register a
          minor, or to agree to the registration. We collect only what we need to run our
          programs, and we don&apos;t use children&apos;s data for personalised advertising. If you
          think we have collected a child&apos;s information without proper consent, contact us
          and we will review it and delete it where appropriate.
        </p>
      </LegalSection>

      <LegalSection title="Who we share information with">
        <p>We do not sell your personal information. We share it only with:</p>
        <LegalList>
          <li>
            <strong>Service providers</strong> who process data for us: Cloudflare (website hosting
            and database), Cloudinary (image hosting), Brevo (sending email), bKash (payments), and
            Google (Analytics and AdSense)
          </li>
          <li>
            <strong>Event partners</strong>, such as host schools or competition organisers, but
            only what they need to run a specific event
          </li>
          <li>
            <strong>Authorities</strong>, when the law requires it or to protect people&apos;s
            rights and safety
          </li>
        </LegalList>
        <p>
          Some of these providers process data outside Bangladesh. When they do, we rely on their
          own security and privacy commitments.
        </p>
      </LegalSection>

      <LegalSection title="Advertising (Google AdSense)">
        <p>
          We use Google AdSense to show ads. Google and its partners may use cookies, including the
          DoubleClick cookie, to show ads based on your visits to this site and other sites.
        </p>
        <p>
          To learn how Google uses data when you use our partners&apos; sites, see{' '}
          <LegalLink href="https://policies.google.com/technologies/partner-sites">
            policies.google.com/technologies/partner-sites
          </LegalLink>
          . You can turn off personalised ads in{' '}
          <LegalLink href="https://www.google.com/settings/ads">Google Ads Settings</LegalLink>, or
          opt out of interest-based ads at{' '}
          <LegalLink href="https://optout.networkadvertising.org/">
            optout.networkadvertising.org
          </LegalLink>
          .
        </p>
      </LegalSection>

      <LegalSection title="Data retention">
        <LegalList>
          <li>
            We keep registration and payment records for as long as we need them to run the event,
            issue certificates, and meet accounting and legal requirements (normally up to 5
            years).
          </li>
          <li>We keep certificate records so the certificates can still be verified.</li>
          <li>We keep messages and support emails for as long as we need them to deal with your request.</li>
          <li>Analytics data is kept according to Google&apos;s retention settings.</li>
        </LegalList>
      </LegalSection>

      <LegalSection title="How we protect information">
        <p>
          We use encrypted connections (HTTPS), restrict access to admin tools, use secure
          session cookies for staff accounts, and give access to personal data only to staff
          who need it. No system is completely secure. If you think your data has been put at
          risk, contact us right away.
        </p>
      </LegalSection>

      <LegalSection title="Your rights and choices">
        <LegalList>
          <li>Ask for a copy of the personal data we hold about you or your child</li>
          <li>Ask us to correct information that is wrong</li>
          <li>Ask us to delete your data, unless we have to keep it for legal or accounting reasons</li>
          <li>Withdraw consent to marketing emails or to the use of photos</li>
          <li>Block or delete cookies in your browser settings</li>
        </LegalList>
        <p>
          To make a request, email <LegalLink href={`mailto:${email}`}>{email}</LegalLink>. We
          may need to confirm your identity first, and we aim to reply within 30 days.
        </p>
      </LegalSection>

      <LegalSection title="Changes to this policy">
        <p>
          We may update this policy from time to time. When we do, we change the &quot;Last
          updated&quot; date at the top of this page. If the changes are significant, we may also
          tell you by email or with a notice on the site.
        </p>
      </LegalSection>

      <LegalSection title="Contact">
        <p>
          For questions about this policy, email{' '}
          <LegalLink href={`mailto:${email}`}>{email}</LegalLink> or visit our{' '}
          <LegalLink href="/contact">Contact</LegalLink> page.
        </p>
      </LegalSection>
    </LegalPage>
  )
}
