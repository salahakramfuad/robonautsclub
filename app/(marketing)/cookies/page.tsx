import { Metadata } from 'next'
import { SITE_CONFIG } from '@/lib/site-config'
import { PAGE_SEO, buildPageMetadata } from '@/lib/seo-metadata'
import { LEGAL_LAST_UPDATED } from '@/lib/legal'
import { LegalLink, LegalList, LegalPage, LegalSection } from '@/components/legal/LegalPage'

export const metadata: Metadata = buildPageMetadata({
  title: PAGE_SEO.cookies.title,
  description: PAGE_SEO.cookies.description,
  path: '/cookies',
  absoluteTitle: true,
})

type CookieRow = { name: string; provider: string; purpose: string; duration: string }

const COOKIE_GROUPS: { title: string; description: string; rows: CookieRow[] }[] = [
  {
    title: 'Strictly necessary',
    description:
      'Needed for secure sign-in to the staff dashboard. These are set only when an authorised user logs in, and the site needs them to work.',
    rows: [
      {
        name: 'auth-token',
        provider: SITE_CONFIG.name,
        purpose: 'Secure (HttpOnly) session token for signed-in staff',
        duration: '30 minutes',
      },
      {
        name: 'session-start',
        provider: SITE_CONFIG.name,
        purpose: 'Enforces the session time-out',
        duration: '30 minutes',
      },
      {
        name: 'user-info',
        provider: SITE_CONFIG.name,
        purpose: 'Display-only copy of the signed-in user’s name and role',
        duration: '30 minutes',
      },
    ],
  },
  {
    title: 'Analytics',
    description:
      'Help us understand how visitors use the site so we can improve it. These are not loaded on the staff dashboard.',
    rows: [
      {
        name: '_ga, _ga_*',
        provider: 'Google Analytics',
        purpose: 'Tell visitors apart and measure page views and sessions',
        duration: 'Up to 2 years',
      },
    ],
  },
  {
    title: 'Advertising',
    description:
      'Used by Google AdSense to show ads, limit how often an ad repeats, and measure ad performance. Google may personalise ads based on your activity on other sites.',
    rows: [
      {
        name: '__gads, __gpi, IDE, DSID, NID',
        provider: 'Google AdSense / DoubleClick',
        purpose: 'Show ads and measure them; personalised ads where allowed',
        duration: 'Up to 13 months',
      },
    ],
  },
]

export default function CookiePolicyPage() {
  return (
    <LegalPage
      title="Cookie Policy"
      lastUpdated={LEGAL_LAST_UPDATED}
      intro={
        <p>
          Cookies are small text files stored on your device. This page explains the cookies and
          similar technologies (such as local storage) that {SITE_CONFIG.name} uses, and how you
          can control them. Read it together with our{' '}
          <LegalLink href="/privacy">Privacy Policy</LegalLink>.
        </p>
      }
    >
      {COOKIE_GROUPS.map((group) => (
        <LegalSection key={group.title} title={group.title}>
          <p>{group.description}</p>
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="bg-slate-50 text-slate-700">
                <tr>
                  <th className="px-3 py-2 font-semibold">Cookie</th>
                  <th className="px-3 py-2 font-semibold">Provider</th>
                  <th className="px-3 py-2 font-semibold">Purpose</th>
                  <th className="px-3 py-2 font-semibold">Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {group.rows.map((row) => (
                  <tr key={row.name}>
                    <td className="px-3 py-2 font-mono text-xs text-slate-900">{row.name}</td>
                    <td className="px-3 py-2">{row.provider}</td>
                    <td className="px-3 py-2">{row.purpose}</td>
                    <td className="px-3 py-2 whitespace-nowrap">{row.duration}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </LegalSection>
      ))}

      <LegalSection title="Payment pages">
        <p>
          When you pay, you are sent to bKash&apos;s secure checkout. bKash may set its own cookies,
          which are covered by bKash&apos;s privacy policy.
        </p>
      </LegalSection>

      <LegalSection title="How to control cookies">
        <LegalList>
          <li>
            <strong>Browser settings:</strong> most browsers let you block or delete cookies. If
            you block strictly necessary cookies, dashboard sign-in will stop working.
          </li>
          <li>
            <strong>Google Analytics:</strong> install the{' '}
            <LegalLink href="https://tools.google.com/dlpage/gaoptout">
              Google Analytics opt-out add-on
            </LegalLink>
            .
          </li>
          <li>
            <strong>Personalised ads:</strong> change your choices in{' '}
            <LegalLink href="https://www.google.com/settings/ads">Google Ads Settings</LegalLink> or
            at{' '}
            <LegalLink href="https://optout.networkadvertising.org/">
              optout.networkadvertising.org
            </LegalLink>
            .
          </li>
          <li>
            For more about how Google uses data, see{' '}
            <LegalLink href="https://policies.google.com/technologies/cookies">
              policies.google.com/technologies/cookies
            </LegalLink>
            .
          </li>
        </LegalList>
      </LegalSection>

      <LegalSection title="Contact">
        <p>
          For questions about cookies, email{' '}
          <LegalLink href={`mailto:${SITE_CONFIG.email}`}>{SITE_CONFIG.email}</LegalLink>.
        </p>
      </LegalSection>
    </LegalPage>
  )
}
