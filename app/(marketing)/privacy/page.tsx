import { Metadata } from 'next'
import Link from 'next/link'
import { SITE_CONFIG } from '@/lib/site-config'
import { PAGE_SEO, buildPageMetadata } from '@/lib/seo-metadata'

export const metadata: Metadata = buildPageMetadata({
  title: PAGE_SEO.privacy.title,
  description: PAGE_SEO.privacy.description,
  path: '/privacy',
  absoluteTitle: true,
})

const LAST_UPDATED = '6 October 2026'

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-linear-to-b from-slate-50 via-white to-slate-50/80">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-indigo-600 sm:text-xs">
          Legal
        </p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
          Privacy Policy
        </h1>
        <p className="mt-3 text-sm text-slate-500">Last updated: {LAST_UPDATED}</p>

        <div className="mt-10 space-y-8 text-base leading-relaxed text-gray-800 sm:text-[1.05rem] sm:leading-[1.75]">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900">Who we are</h2>
            <p>
              {SITE_CONFIG.name} (&quot;we&quot;, &quot;us&quot;) operates{' '}
              <a
                href={SITE_CONFIG.url}
                className="font-medium text-indigo-600 underline-offset-2 hover:underline"
              >
                {SITE_CONFIG.url.replace(/\/$/, '')}
              </a>{' '}
              and related sites. Contact:{' '}
              <a
                href={`mailto:${SITE_CONFIG.email}`}
                className="font-medium text-indigo-600 underline-offset-2 hover:underline"
              >
                {SITE_CONFIG.email}
              </a>
              .
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900">Information we collect</h2>
            <p>We may collect information you provide directly, such as:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Name, email, phone, and school details for event or Robofest registration</li>
              <li>Payment-related details needed to process fees (handled via payment partners such as bKash)</li>
              <li>Messages you send us via forms, email, or messaging apps</li>
            </ul>
            <p>
              We also collect limited technical data automatically, such as IP address, browser type,
              device information, and pages visited, through analytics and advertising tools.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900">How we use information</h2>
            <ul className="list-disc space-y-1 pl-5">
              <li>To run workshops, events, competitions, and registrations</li>
              <li>To process payments and send confirmations or certificates</li>
              <li>To improve the website and understand how it is used</li>
              <li>To show relevant advertising (see Advertising below)</li>
              <li>To respond to inquiries and maintain site security</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900">Cookies and similar technologies</h2>
            <p>
              We use cookies and similar technologies for essential site functions, analytics
              (Google Analytics), and advertising (Google AdSense). These may store or access
              information on your device to measure traffic, remember preferences, and deliver ads.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900">Advertising (Google AdSense)</h2>
            <p>
              We use Google AdSense to display ads. Google and its partners may use cookies
              (including the DoubleClick cookie) and similar technologies to serve ads based on
              your prior visits to this site or other sites. This helps show ads that may be more
              relevant to you.
            </p>
            <p>
              You can learn more about how Google uses data when you use our partners&apos; sites or
              apps at{' '}
              <a
                href="https://policies.google.com/technologies/partner-sites"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-indigo-600 underline-offset-2 hover:underline"
              >
                policies.google.com/technologies/partner-sites
              </a>
              . You can opt out of personalized advertising by visiting{' '}
              <a
                href="https://www.google.com/settings/ads"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-indigo-600 underline-offset-2 hover:underline"
              >
                Google Ads Settings
              </a>
              , or manage interest-based ads via the Network Advertising Initiative at{' '}
              <a
                href="https://optout.networkadvertising.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-indigo-600 underline-offset-2 hover:underline"
              >
                optout.networkadvertising.org
              </a>
              .
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900">Sharing of information</h2>
            <p>
              We do not sell your personal information. We may share data with service providers
              who help us operate the site (hosting, payments, email, analytics, advertising), or
              when required by law.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900">Data retention and security</h2>
            <p>
              We keep registration and operational records only as long as needed for the purposes
              above or as required by law. We use reasonable technical and organizational measures
              to protect information, but no online transmission is completely secure.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900">Children</h2>
            <p>
              Our programs serve students (often with parent or guardian involvement). If you believe
              we have collected a child&apos;s personal information inappropriately, contact us and we
              will take appropriate steps.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900">Your choices</h2>
            <p>
              You may request access to, correction of, or deletion of personal data we hold about
              you, subject to legal and operational limits, by emailing{' '}
              <a
                href={`mailto:${SITE_CONFIG.email}`}
                className="font-medium text-indigo-600 underline-offset-2 hover:underline"
              >
                {SITE_CONFIG.email}
              </a>
              . You can also control cookies through your browser settings.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900">Changes</h2>
            <p>
              We may update this policy from time to time. The &quot;Last updated&quot; date at the top
              will change when we do. Continued use of the site after changes means you accept the
              updated policy.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900">Contact</h2>
            <p>
              Questions about this policy:{' '}
              <a
                href={`mailto:${SITE_CONFIG.email}`}
                className="font-medium text-indigo-600 underline-offset-2 hover:underline"
              >
                {SITE_CONFIG.email}
              </a>
              {' · '}
              <Link
                href="/about"
                className="font-medium text-indigo-600 underline-offset-2 hover:underline"
              >
                About &amp; contact
              </Link>
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}
