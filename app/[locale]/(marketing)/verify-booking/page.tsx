import { CheckCircle, XCircle, Calendar, MapPin, Clock, User, Mail, Phone, School, ShieldCheck, QrCode } from 'lucide-react'
import { formatEventDateLabel } from '@/lib/dateUtils'
import { generateQRCodeDataURL } from '@/lib/qrCode'
import { collectionGet, getBookingByRegistrationId as lookupBookingByRegistrationId } from '@/lib/db/collections'
import type { Booking } from '@/types/booking'
import type { Event } from '@/types/event'
import type { RobofestContent, RobofestRegistration } from '@/lib/robofest-content'
import { format } from 'date-fns'
import Image from 'next/image'
import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { SITE_CONFIG, resolvePublicBaseUrl } from '@/lib/site-config'
import { buildPageMetadata } from '@/lib/seo-metadata'
import CopyButton from './CopyButton'
import RetryButton from './RetryButton'
import VerifyRobofestRegistration from './VerifyRobofestRegistration'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

interface VerificationPageProps {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ registrationId?: string; member?: string }>
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('verify.meta')
  return buildPageMetadata({
    title: t('title'),
    description: t('description'),
    path: '/verify-booking',
    noindex: true,
    ogImage: {
      url: '/robotics-event.jpg',
      width: 1200,
      height: 630,
      alt: `${SITE_CONFIG.name} - ${t('title')}`,
    },
    keywords: [
      'verify registration',
      'event verification',
      'robotics event registration',
      'registration confirmation',
      `${SITE_CONFIG.name} verification`,
    ],
  })
}

type VerificationLookup =
  | { kind: 'event'; booking: Booking; event: Event }
  | {
      kind: 'robofest'
      registration: RobofestRegistration
      content: RobofestContent
    }
  | { kind: 'none' }

async function getBookingByRegistrationId(
  registrationId: string,
): Promise<VerificationLookup> {
  try {
    if (!registrationId || registrationId.trim() === '') {
      return { kind: 'none' }
    }

    const bookingDoc = await lookupBookingByRegistrationId(registrationId.trim())
    if (bookingDoc) {
      const bookingData = bookingDoc as Record<string, unknown>
      const booking: Booking = {
        id: String(bookingDoc.id),
        ...bookingData,
        createdAt:
          bookingData.createdAt &&
          typeof bookingData.createdAt === 'object' &&
          'toDate' in bookingData.createdAt
            ? (bookingData.createdAt as { toDate: () => Date }).toDate()
            : bookingData.createdAt,
      } as Booking

      const eventDoc = await collectionGet('events', String(booking.eventId))
      if (!eventDoc) {
        return { kind: 'none' }
      }

      const eventData = eventDoc as Record<string, unknown>
      const event: Event = {
        id: String(eventDoc.id),
        ...eventData,
        createdAt:
          eventData.createdAt &&
          typeof eventData.createdAt === 'object' &&
          'toDate' in eventData.createdAt
            ? (eventData.createdAt as { toDate: () => Date }).toDate()
            : eventData.createdAt,
        updatedAt:
          eventData.updatedAt &&
          typeof eventData.updatedAt === 'object' &&
          'toDate' in eventData.updatedAt
            ? (eventData.updatedAt as { toDate: () => Date }).toDate()
            : eventData.updatedAt,
      } as Event

      return { kind: 'event', booking, event }
    }

    // Fallback: Robofest local-round registrations
    const { getRobofestRegistrationByRegistrationId } = await import(
      '@/lib/robofest-registration'
    )
    const { getRobofestContentFresh } = await import('@/lib/robofest-content')
    const robofestReg = await getRobofestRegistrationByRegistrationId(registrationId)
    if (!robofestReg || robofestReg.status === 'cancelled') {
      return { kind: 'none' }
    }

    const content = await getRobofestContentFresh()
    return { kind: 'robofest', registration: robofestReg, content }
  } catch {
    return { kind: 'none' }
  }
}

export default async function VerifyBookingPage({ params, searchParams }: VerificationPageProps) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('verify.booking')
  const search = await searchParams
  const registrationId = search.registrationId
  const memberRaw = search.member?.trim()
  const certificateMemberIndex =
    memberRaw != null && memberRaw !== '' && /^\d+$/.test(memberRaw)
      ? Number.parseInt(memberRaw, 10)
      : undefined

  // Error State: No registration ID provided
  if (!registrationId) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-200 rounded-full blur-3xl opacity-30 transform translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-200 rounded-full blur-3xl opacity-30 transform -translate-x-1/2 translate-y-1/2" />
        </div>

        <Card className="relative z-10 max-w-md w-full shadow-2xl">
          <CardContent className="p-8 sm:p-10 text-center">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-linear-to-br from-red-100 to-red-200 flex items-center justify-center mx-auto mb-6 shadow-lg">
              <XCircle className="w-12 h-12 sm:w-14 sm:h-14 text-red-500" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">{t('missingIdTitle')}</h1>
            <p className="text-gray-600 mb-4 leading-relaxed">
              {t('missingIdBody')}
            </p>
            <Alert className="mt-6 border-blue-200 bg-blue-50 text-left">
              <AlertTitle className="text-blue-900">{t('whereToFindTitle')}</AlertTitle>
              <AlertDescription>
                <ul className="text-sm text-blue-800 space-y-1 mt-2">
                  <li className="flex items-center gap-2">
                    <span className="text-blue-500">•</span>
                    {t('whereEmail')}
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-blue-500">•</span>
                    {t('wherePdf')}
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-blue-500">•</span>
                    {t('whereFormat')}
                  </li>
                </ul>
              </AlertDescription>
            </Alert>
            <Button asChild className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg">
              <Link href="/events" prefetch={false}>
                {t('viewAllEvents')}
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const result = await getBookingByRegistrationId(registrationId)
  const isValid = result.kind !== 'none'
  
  // Generate base URL for QR code display
  const baseUrl = resolvePublicBaseUrl()
  const verificationUrl = `${baseUrl}/verify-booking?registrationId=${encodeURIComponent(registrationId)}`
  const qrCodeDataURL = isValid ? await generateQRCodeDataURL(verificationUrl, 200) : null

  // Error State: Registration not found
  if (!isValid) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-red-200 rounded-full blur-3xl opacity-30 transform translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-200 rounded-full blur-3xl opacity-30 transform -translate-x-1/2 translate-y-1/2" />
        </div>

        <Card className="relative z-10 max-w-lg w-full shadow-2xl">
          <CardContent className="p-8 sm:p-10 text-center">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-linear-to-br from-red-100 to-orange-100 flex items-center justify-center mx-auto mb-6 shadow-lg">
              <XCircle className="w-12 h-12 sm:w-14 sm:h-14 text-red-500" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">{t('notFoundTitle')}</h1>
            <p className="text-gray-600 mb-4 leading-relaxed">
              {t('notFoundBody')}
            </p>

            {/* Registration ID Display */}
            <Card className="bg-gray-50 border-2 border-gray-200 mb-6">
              <CardContent className="p-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{t('regNumberLabel')}</p>
                <p className="text-lg font-mono font-bold text-gray-900 break-all">{registrationId}</p>
              </CardContent>
            </Card>

            {/* Help Section */}
            <Alert className="mb-6 border-amber-200 bg-amber-50 text-left">
              <AlertTitle className="text-amber-900">{t('checkTitle')}</AlertTitle>
              <AlertDescription>
                <ul className="text-sm text-amber-800 space-y-1.5 mt-2">
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600 mt-0.5">•</span>
                    <span>{t('checkFormat')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600 mt-0.5">•</span>
                    <span>{t('checkSpaces')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600 mt-0.5">•</span>
                    <span>{t('checkCompleted')}</span>
                  </li>
                </ul>
              </AlertDescription>
            </Alert>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg">
                <Link href="/events" prefetch={false}>
                  {t('viewEvents')}
                </Link>
              </Button>
              <RetryButton />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (result.kind === 'robofest') {
    return (
      <VerifyRobofestRegistration
        registration={result.registration}
        content={result.content}
        qrCodeDataURL={qrCodeDataURL}
        certificateMemberIndex={certificateMemberIndex}
      />
    )
  }

  const booking = result.booking
  const event = result.event

  // Success State: Registration found and verified
  const formattedDate = formatEventDateLabel(event.date, 'long')
  const bookingDate = booking.createdAt instanceof Date 
    ? booking.createdAt 
    : new Date(booking.createdAt)

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-100 py-8 sm:py-12 px-4">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-200 rounded-full blur-3xl opacity-20 transform translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-200 rounded-full blur-3xl opacity-20 transform -translate-x-1/2 translate-y-1/2" />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-purple-200 rounded-full blur-3xl opacity-10 transform -translate-x-1/2 -translate-y-1/2" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Success Header Card */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-200 overflow-hidden mb-6 sm:mb-8">
          <div className="bg-linear-to-r from-green-500 via-emerald-500 to-teal-500 px-6 sm:px-8 py-8 sm:py-10 text-center relative overflow-hidden">
            {/* Decorative pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2" />
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl transform translate-x-1/2 translate-y-1/2" />
            </div>
            
            <div className="relative z-10">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-xl border-4 border-white/50">
                <CheckCircle className="w-14 h-14 sm:w-16 sm:h-16 text-white" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2 sm:mb-3 tracking-tight">
                {t('verifiedTitle')}
              </h1>
              <p className="text-base sm:text-lg text-green-50 font-medium">
                {t('verifiedSubtitle')}
              </p>
              <Badge className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm rounded-full text-sm font-semibold">
                <ShieldCheck className="w-5 h-5" />
                {t('validBadge')}
              </Badge>
            </div>
          </div>

          {/* Main Content */}
          <div className="p-6 sm:p-8 lg:p-10">
            {/* Registration ID Card - Prominent */}
            <div className="bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 border-2 border-indigo-200 rounded-2xl p-6 sm:p-8 mb-6 sm:mb-8 shadow-lg relative overflow-hidden">
              {/* Decorative corner accent */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-200/30 rounded-bl-full blur-2xl" />
              
              <div className="relative z-10">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                        <ShieldCheck className="w-5 h-5 text-indigo-600" />
                      </div>
                      <p className="text-sm font-semibold text-indigo-600 uppercase tracking-wider">
                        {t('idLabel')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-2xl sm:text-3xl font-bold text-indigo-900 font-mono tracking-tight">
                        {booking.registrationId}
                      </p>
                      <CopyButton text={booking.registrationId} label={t("idLabel")} />
                    </div>
                    <p className="text-xs text-indigo-700 mt-2 font-medium">
                      {t('saveId')}
                    </p>
                  </div>
                  
                  {qrCodeDataURL && (
                    <div className="shrink-0 flex flex-col items-center">
                      <div className="bg-white p-4 rounded-xl shadow-lg border-2 border-indigo-200 mb-3">
                        <Image
                          src={qrCodeDataURL}
                          alt={t("qrAlt")}
                          width={144}
                          height={144}
                          className="w-32 h-32 sm:w-36 sm:h-36"
                          unoptimized
                        />
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <QrCode className="w-4 h-4" />
                        <span className="font-medium">{t('scanVerify')}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid md:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
              {/* {t('eventDetails')} Card */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 sm:p-7 border border-gray-200 shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-300">
                  <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-indigo-600" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{t('eventDetails')}</h2>
                </div>
                <div className="space-y-4">
                  <div className="bg-white rounded-xl p-4 border border-gray-200">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">{t('eventName')}</p>
                    <p className="text-base sm:text-lg font-bold text-gray-900 leading-relaxed">{event.title}</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('date')}</p>
                    </div>
                    <p className="text-base font-semibold text-gray-900">{formattedDate}</p>
                  </div>
                  {event.time && (
                    <div className="bg-white rounded-xl p-4 border border-gray-200">
                      <div className="flex items-center gap-2 mb-1.5">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('time')}</p>
                      </div>
                      <p className="text-base font-semibold text-gray-900">{event.time}</p>
                    </div>
                  )}
                  {(event.venue || event.location) && (
                    <div className="bg-white rounded-xl p-4 border border-gray-200">
                      <div className="flex items-center gap-2 mb-1.5">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('venue')}</p>
                      </div>
                      <p className="text-base font-semibold text-gray-900 leading-relaxed">
                        {event.venue || event.location}
                      </p>
                    </div>
                  )}
                  {event.eligibility && (
                    <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                      <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider mb-1.5">{t('eligibility')}</p>
                      <p className="text-sm font-medium text-blue-900">{event.eligibility}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Registration Details Card */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 sm:p-7 border border-gray-200 shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-300">
                  <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
                    <User className="w-6 h-6 text-indigo-600" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{t('participantDetails')}</h2>
                </div>
                <div className="space-y-4">
                  <div className="bg-white rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center gap-2 mb-1.5">
                      <User className="w-4 h-4 text-gray-500" />
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('name')}</p>
                    </div>
                    <p className="text-base sm:text-lg font-bold text-gray-900">{booking.name}</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center gap-2 mb-1.5">
                      <School className="w-4 h-4 text-gray-500" />
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('school')}</p>
                    </div>
                    <p className="text-base font-semibold text-gray-900">{booking.school}</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('email')}</p>
                      </div>
                      <CopyButton text={booking.email} label={t("email")} />
                    </div>
                    <p className="text-base font-semibold text-gray-900 break-all">{booking.email}</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('phone')}</p>
                      </div>
                      <CopyButton text={booking.phone || ''} label={t("phone")} />
                    </div>
                    <p className="text-base font-semibold text-gray-900">{booking.phone || t('na')}</p>
                  </div>
                  {booking.bkashNumber && (
                    <div className="bg-white rounded-xl p-4 border border-gray-200">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-500" />
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('bkash')}</p>
                        </div>
                        <CopyButton text={booking.bkashNumber} label={t('bkash')} />
                      </div>
                      <p className="text-base font-semibold text-gray-900">{booking.bkashNumber}</p>
                    </div>
                  )}
                  <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-200">
                    <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wider mb-1.5">{t('registeredOn')}</p>
                    <p className="text-sm font-bold text-indigo-900">
                      {format(bookingDate, 'MMMM d, yyyy')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* {t('additionalInfo')} */}
            {booking.information && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 sm:p-8 border-2 border-blue-200 shadow-md mb-6 sm:mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900">{t('additionalInfo')}</h3>
                </div>
                <div className="bg-white rounded-xl p-4 sm:p-5 border border-blue-200">
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{booking.information}</p>
                </div>
              </div>
            )}

            {/* Action Footer */}
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 text-center">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <QrCode className="w-5 h-5 text-indigo-600" />
                  <p className="text-sm font-medium">
                    {t('footerQrNote')}
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button asChild variant="ghost" className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
                    <Link href="/events" prefetch={false}>
                      {t('viewEvents')}
                    </Link>
                  </Button>
                  <Button asChild variant="ghost" className="text-gray-600 hover:text-gray-700 hover:bg-gray-100">
                    <Link href="/" prefetch={false}>
                      {t('backHome')}
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Badge */}
        <div className="text-center">
          <Badge variant="outline" className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm shadow-md text-xs font-semibold text-gray-700">
            <ShieldCheck className="w-4 h-4 text-green-600" />
            {t('trustBadge', { name: SITE_CONFIG.name })}
          </Badge>
        </div>
      </div>
    </div>
  )
}
