import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Armchair, Bot, Cpu, LifeBuoy, MapPin, MessageCircle, Wifi, Wrench } from 'lucide-react'
import { buildPageMetadata } from '@/lib/seo-metadata'
import { isFeatureEnabled } from '@/lib/feature-flags'
import { getDayAvailability } from '@/lib/research-hub/availability'
import {
  INVENTORY_CATEGORIES,
  addDays,
  calculateAmount,
  dhakaToday,
  weekdayOf,
  type Weekday,
} from '@/lib/research-hub/shared'
import {
  getResearchHubContent,
  getResearchHubSettings,
  listUpcomingClosures,
} from '@/lib/research-hub/store'
import { SITE_CONFIG } from '@/lib/site-config'
import { Button } from '@/components/ui/button'
import { getPublicEnglishMediumSchools } from '../events/public-data'
import BookingWidget, { type DateOption } from './BookingWidget'
import SeatBoard from './SeatBoard'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'researchHub.meta' })
  return buildPageMetadata({
    title: t('title'),
    description: t('description'),
    path: '/research-hub',
    absoluteTitle: true,
    locale,
  })
}

const FALLBACK_FEATURES = [
  { key: 'seating', icon: Armchair },
  { key: 'kits', icon: Bot },
  { key: 'components', icon: Cpu },
  { key: 'tools', icon: Wrench },
  { key: 'wifi', icon: Wifi },
  { key: 'help', icon: LifeBuoy },
] as const

// Bangladesh week starts on Saturday.
const WEEK_ORDER: Weekday[] = ['6', '0', '1', '2', '3', '4', '5']

export default async function ResearchHubPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ date?: string; start?: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  if (!(await isFeatureEnabled('registration.researchHub'))) notFound()

  const t = await getTranslations('researchHub')
  const query = await searchParams
  const isBn = locale === 'bn'
  const num = new Intl.NumberFormat(isBn ? 'bn-BD' : 'en-US')
  const intlLocale = isBn ? 'bn-BD' : 'en-GB'

  const [settings, content, institutions] = await Promise.all([
    getResearchHubSettings(),
    getResearchHubContent(),
    getPublicEnglishMediumSchools().catch(() => [] as string[]),
  ])
  const today = dhakaToday()
  const closures = settings.configured ? await listUpcomingClosures(today).catch(() => []) : []
  const fullDayClosures = new Set(
    closures.filter((c) => c.startHour == null || c.endHour == null).map((c) => c.date),
  )

  const dates: DateOption[] = Array.from({ length: settings.bookingHorizonDays + 1 }, (_, i) => {
    const date = addDays(today, i)
    return {
      date,
      closed: !settings.openingHours[weekdayOf(date)].open || fullDayClosures.has(date),
    }
  })
  const firstOpen = dates.find((d) => !d.closed)?.date ?? today

  // A time picked on the seat board (?date=…&start=…) preselects the booking form.
  const requested = dates.find((d) => d.date === query.date && !d.closed)?.date
  const initialDate = requested ?? firstOpen
  const [boardDay, initialDay] = await Promise.all([
    getDayAvailability(firstOpen, { settings }),
    initialDate === firstOpen ? null : getDayAvailability(initialDate, { settings }),
  ])
  const initialAvailability = initialDay ?? boardDay
  const requestedStart = Number(query.start)
  const initialStart = initialAvailability.hours.some((h) => h.hour === requestedStart && h.bookable)
    ? requestedStart
    : null

  const live = settings.configured && settings.ratePerPersonHour > 0
  const intro = (isBn ? content.introBn : content.introEn) || t('hero.subtitle')
  const rules = (isBn ? content.rulesBn : content.rulesEn).length
    ? isBn
      ? content.rulesBn
      : content.rulesEn
    : (['r1', 'r2', 'r3', 'r4', 'r5'] as const).map((k) => t(`rules.${k}`))
  const location = settings.location || SITE_CONFIG.location
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${location}, Dhaka`)}`
  const weekdayFmt = new Intl.DateTimeFormat(intlLocale, { weekday: 'long', timeZone: 'UTC' })
  const hourFmt = new Intl.DateTimeFormat(isBn ? 'bn-BD' : 'en-US', { hour: 'numeric', timeZone: 'UTC' })
  const hourLabel = (h: number) => hourFmt.format(new Date(Date.UTC(2000, 0, 1, h % 24)))
  // 2000-01-01 was a Saturday; offset to each JS weekday.
  const weekdayName = (d: Weekday) => weekdayFmt.format(new Date(Date.UTC(2000, 0, 2 + Number(d))))

  const inventoryGroups = INVENTORY_CATEGORIES.map((cat) => ({
    cat,
    items: content.inventory.filter((i) => i.category === cat),
  })).filter((g) => g.items.length > 0)
  const [mainPhoto, ...morePhotos] = content.photos

  return (
    <div className="min-h-screen bg-[#f4f7fb] text-slate-900">
      {/* Hero: pitch on the left, live seat board on the right */}
      <section className="relative overflow-hidden bg-[#14264a] text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:28px_28px]"
        />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-14 lg:py-20">
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-sm text-sky-200">
              <MapPin className="size-4" aria-hidden />
              {t('hero.where')}
            </p>
            <h1 className="mt-4 text-[2.5rem] font-bold leading-[1.05] tracking-tight text-balance sm:text-6xl">
              {t('hero.title')}
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/80">{intro}</p>

            {live ? (
              <div className="mt-8 flex flex-wrap items-end gap-x-4 gap-y-1">
                <p className="text-5xl font-bold tabular-nums tracking-tight">
                  ৳{num.format(settings.ratePerPersonHour)}
                </p>
                <div className="pb-1.5 text-sm text-white/70">
                  <p className="font-medium text-white">{t('hero.perPersonHour')}</p>
                  <p>{t('hero.groupNote', { example: num.format(calculateAmount(settings.ratePerPersonHour, 3, 2)) })}</p>
                </div>
              </div>
            ) : null}

            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="h-12 bg-white px-6 text-base text-[#14264a] hover:bg-sky-50">
                <a href="#book">{t('hero.cta')}</a>
              </Button>
              <Button
                asChild
                size="lg"
                variant="ghost"
                className="h-12 px-5 text-base text-white hover:bg-white/10 hover:text-white"
              >
                <a href="#inside">{t('hero.seeInventory')}</a>
              </Button>
            </div>
          </div>

          {live ? (
            <SeatBoard
              day={boardDay}
              isToday={boardDay.date === today}
              dateLabel={new Intl.DateTimeFormat(intlLocale, {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                timeZone: 'UTC',
              }).format(new Date(`${boardDay.date}T00:00:00Z`))}
              locale={locale}
            />
          ) : null}
        </div>
      </section>

      {/* Photos (dashboard-managed) */}
      {mainPhoto ? (
        <section aria-label={t('photos.title')} className="mx-auto max-w-6xl px-4 pt-10 sm:px-6">
          <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-4 md:grid-rows-2">
            <div className="relative col-span-2 aspect-[4/3] overflow-hidden rounded-2xl bg-slate-200 md:row-span-2 md:aspect-auto">
              <Image
                src={mainPhoto.url}
                alt={mainPhoto.alt || t('photos.title')}
                fill
                priority
                sizes="(min-width: 768px) 560px, 100vw"
                className="object-cover"
              />
            </div>
            {morePhotos.slice(0, 4).map((photo) => (
              <div key={photo.url} className="relative aspect-[4/3] overflow-hidden rounded-xl bg-slate-200">
                <Image
                  src={photo.url}
                  alt={photo.alt || t('photos.title')}
                  fill
                  sizes="(min-width: 768px) 280px, 50vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* What's in the hub (dashboard-managed inventory, or default overview) */}
      <section id="inside" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-16 sm:px-6">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-bold tracking-tight">{t('inventory.title')}</h2>
          <p className="mt-3 text-slate-600">{t('inventory.subtitle')}</p>
        </div>

        {inventoryGroups.length > 0 ? (
          <div className="mt-10 gap-x-12 sm:columns-2 lg:columns-3">
            {inventoryGroups.map(({ cat, items }) => (
              <div key={cat} className="mb-10 break-inside-avoid">
                <h3 className="border-b-2 border-[#14264a] pb-2 font-semibold text-[#14264a]">
                  {t(`inventory.categories.${cat}`)}
                </h3>
                <ul className="divide-y divide-slate-200">
                  {items.map((item) => (
                    <li key={item.id} className="flex items-baseline justify-between gap-4 py-2.5">
                      <span className="min-w-0">
                        <span className="text-slate-900">{item.name}</span>
                        {item.note ? <span className="block text-sm text-slate-500">{item.note}</span> : null}
                      </span>
                      {item.quantity != null ? (
                        <span className="shrink-0 font-semibold tabular-nums text-slate-700">
                          ×{num.format(item.quantity)}
                        </span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <ul className="mt-10 grid gap-x-12 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
            {FALLBACK_FEATURES.map(({ key, icon: Icon }) => (
              <li key={key} className="flex gap-4">
                <Icon className="mt-0.5 size-6 shrink-0 text-[#14264a]" aria-hidden />
                <div>
                  <h3 className="font-semibold">{t(`features.${key}.title`)}</h3>
                  <p className="mt-1 text-slate-600">{t(`features.${key}.text`)}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Booking */}
      <section id="book" className="scroll-mt-20 border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="text-3xl font-bold tracking-tight">{t('widget.title')}</h2>
          <div className="mt-8">
            <BookingWidget
              key={`${initialDate}-${initialStart ?? ''}`}
              locale={locale}
              dates={dates}
              initialDate={initialDate}
              initialStart={initialStart}
              initialAvailability={initialAvailability}
              horizonDays={settings.bookingHorizonDays}
              institutions={institutions}
            />
          </div>
        </div>
      </section>

      {/* Visit: hours, address, rules */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="text-3xl font-bold tracking-tight">{t('visit.title')}</h2>
        <div className="mt-10 grid gap-12 md:grid-cols-[1fr_1fr] lg:grid-cols-[0.9fr_0.9fr_1.4fr]">
          <div>
            <h3 className="font-semibold">{t('visit.hours')}</h3>
            <table className="mt-3 w-full text-sm">
              <tbody className="divide-y divide-slate-200">
                {WEEK_ORDER.map((d) => {
                  const oh = settings.openingHours[d]
                  return (
                    <tr key={d}>
                      <th scope="row" className="py-2 text-left font-normal text-slate-600">
                        {weekdayName(d)}
                      </th>
                      <td className="py-2 text-right tabular-nums">
                        {oh.open ? `${hourLabel(oh.start)} – ${hourLabel(oh.end)}` : (
                          <span className="text-slate-400">{t('visit.closed')}</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div>
            <h3 className="font-semibold">{t('visit.address')}</h3>
            <p className="mt-3 text-slate-700">{location}</p>
            <a
              href={mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-sky-700 underline-offset-4 hover:underline"
            >
              <MapPin className="size-4" aria-hidden /> Google Maps
            </a>
            <h3 className="mt-8 font-semibold">{t('visit.questions')}</h3>
            <a
              href={SITE_CONFIG.social.whatsapp}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium hover:border-slate-400"
            >
              <MessageCircle className="size-4 text-green-600" aria-hidden />
              {t('visit.whatsapp')}
            </a>
          </div>
          <div className="md:col-span-2 lg:col-span-1">
            <h3 className="font-semibold">{t('rules.title')}</h3>
            <ul className="mt-3 space-y-2.5 text-slate-700">
              {rules.map((rule) => (
                <li key={rule} className="flex gap-3">
                  <span aria-hidden className="mt-2.5 size-1.5 shrink-0 rounded-full bg-[#14264a]" />
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  )
}
