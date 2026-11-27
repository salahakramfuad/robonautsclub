import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'
import { SITE_CONFIG } from '@/lib/site-config'
import { buildLocalizedPageMetadata } from '@/lib/seo-metadata'
import {
  LegalList,
  LegalPage,
  LegalSection,
  getLegalContent,
} from '@/components/legal/LegalPage'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  return buildLocalizedPageMetadata('cookies', locale, {
    path: '/cookies',
    absoluteTitle: true,
  })
}

/** Cookie names and providers stay as-is; purpose/duration text lives in legal.cookies.groups. */
type CookieRow = { key: string; name: string; provider: string }

const COOKIE_GROUPS: { key: string; rows: CookieRow[] }[] = [
  {
    key: 'necessary',
    rows: [
      { key: 'authToken', name: 'auth-token', provider: SITE_CONFIG.name },
      { key: 'sessionStart', name: 'session-start', provider: SITE_CONFIG.name },
      { key: 'userInfo', name: 'user-info', provider: SITE_CONFIG.name },
      { key: 'paymentLocale', name: 'payment-locale', provider: SITE_CONFIG.name },
    ],
  },
  {
    key: 'analytics',
    rows: [{ key: 'ga', name: '_ga, _ga_*', provider: 'Google Analytics' }],
  },
  {
    key: 'advertising',
    rows: [
      {
        key: 'ads',
        name: '__gads, __gpi, IDE, DSID, NID',
        provider: 'Google AdSense / DoubleClick',
      },
    ],
  },
]

export default async function CookiePolicyPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const { t, rich, items } = await getLegalContent('cookies')

  return (
    <LegalPage pageKey="cookies" intro={<p>{rich('intro')}</p>}>
      {COOKIE_GROUPS.map((group) => (
        <LegalSection key={group.key} title={t(`groups.${group.key}.title`)}>
          <p>{rich(`groups.${group.key}.description`)}</p>
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="bg-slate-50 text-slate-700">
                <tr>
                  <th className="px-3 py-2 font-semibold">{t('table.cookie')}</th>
                  <th className="px-3 py-2 font-semibold">{t('table.provider')}</th>
                  <th className="px-3 py-2 font-semibold">{t('table.purpose')}</th>
                  <th className="px-3 py-2 font-semibold">{t('table.duration')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {group.rows.map((row) => (
                  <tr key={row.key}>
                    <td className="px-3 py-2 font-mono text-xs text-slate-900">{row.name}</td>
                    <td className="px-3 py-2">{row.provider}</td>
                    <td className="px-3 py-2">
                      {t(`groups.${group.key}.rows.${row.key}.purpose`)}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      {t(`groups.${group.key}.rows.${row.key}.duration`)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </LegalSection>
      ))}

      <LegalSection title={t('payment.title')}>
        <p>{rich('payment.body')}</p>
      </LegalSection>

      <LegalSection title={t('control.title')}>
        <LegalList>{items('control.items')}</LegalList>
      </LegalSection>

      <LegalSection title={t('contact.title')}>
        <p>{rich('contact.body')}</p>
      </LegalSection>
    </LegalPage>
  )
}
