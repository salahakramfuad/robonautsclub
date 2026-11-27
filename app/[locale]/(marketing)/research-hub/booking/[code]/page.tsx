import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { NOINDEX_ROBOTS } from '@/lib/seo-metadata'
import { SITE_CONFIG } from '@/lib/site-config'
import { getBookingByCode, getResearchHubSettings } from '@/lib/research-hub/store'
import { BOOKING_STATUSES, type BookingStatus } from '@/lib/research-hub/shared'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'researchHub.pass' })
  return { title: t('metaTitle'), robots: NOINDEX_ROBOTS }
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

export default async function ResearchHubPassPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; code: string }>
  searchParams: Promise<{ t?: string }>
}) {
  const { locale, code } = await params
  setRequestLocale(locale)
  const { t: token = '' } = await searchParams
  const t = await getTranslations('researchHub.pass')

  const booking = await getBookingByCode(decodeURIComponent(code)).catch(() => null)
  if (!booking || !token || !timingSafeEqual(booking.manageToken, token)) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center px-4 py-12">
        <p className="text-gray-700">{t('notFound')}</p>
      </main>
    )
  }

  const settings = await getResearchHubSettings()
  const QRCode = (await import('qrcode')).default
  const qrSvg = await QRCode.toString(booking.code, { type: 'svg', margin: 1, width: 220, errorCorrectionLevel: 'M' })

  const intlLocale = locale === 'bn' ? 'bn-BD' : 'en-GB'
  const [y, m, d] = booking.date.split('-').map(Number)
  const dateLabel = new Intl.DateTimeFormat(intlLocale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(y, m - 1, d)))
  const hourFmt = new Intl.DateTimeFormat(locale === 'bn' ? 'bn-BD' : 'en-US', { hour: 'numeric', timeZone: 'UTC' })
  const hourLabel = (h: number) => hourFmt.format(new Date(Date.UTC(2000, 0, 1, h % 24)))
  const status: BookingStatus = (BOOKING_STATUSES as readonly string[]).includes(booking.status)
    ? (booking.status as BookingStatus)
    : 'confirmed'
  const active = status === 'confirmed' || status === 'checked_in'
  const numberFmt = new Intl.NumberFormat(locale === 'bn' ? 'bn-BD' : 'en-US')

  const rows: Array<[string, string]> = [
    [t('name'), booking.name],
    [t('date'), dateLabel],
    [t('time'), `${hourLabel(booking.startHour)} – ${hourLabel(booking.startHour + booking.hours)}`],
    [t('persons'), numberFmt.format(booking.persons)],
    [t('amount'), `৳${numberFmt.format(booking.amountPaid ?? booking.amount)}`],
    ...(booking.trxId ? ([[t('trxId'), booking.trxId]] as Array<[string, string]>) : []),
    [t('location'), settings.location || SITE_CONFIG.location],
  ]

  return (
    <main className="flex min-h-[60vh] items-center justify-center bg-gray-50 px-4 py-12">
      <Card className="w-full max-w-md overflow-hidden">
        <div className="bg-[#1f3a6f] px-6 py-5 text-white">
          <p className="text-sm text-white/80">{SITE_CONFIG.name}</p>
          <h1 className="text-xl font-bold">{t('title')}</h1>
        </div>
        <CardContent className="space-y-5 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{t('code')}</p>
              <p className="font-mono text-xl font-bold text-gray-900">{booking.code}</p>
            </div>
            <Badge variant={active ? 'default' : 'secondary'}>{t(`status.${status}`)}</Badge>
          </div>
          {active ? (
            <div className="flex flex-col items-center gap-2">
              <div
                className="rounded-xl border border-gray-200 bg-white p-2 [&_svg]:size-52"
                // QR SVG generated server-side from the booking code only.
                dangerouslySetInnerHTML={{ __html: qrSvg }}
              />
              <p className="text-center text-sm text-gray-600">{t('showAtDesk')}</p>
            </div>
          ) : null}
          <dl className="divide-y divide-gray-100 border-y border-gray-100 text-sm">
            {rows.map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4 py-2">
                <dt className="text-gray-500">{label}</dt>
                <dd className="text-right font-medium text-gray-900">{value}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>
    </main>
  )
}
