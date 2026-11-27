import { Link } from '@/i18n/navigation'
import { AlertTriangle, CheckCircle, Ticket } from 'lucide-react'
import CopyButton from '../../../verify-booking/CopyButton'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { getTranslations, setRequestLocale } from 'next-intl/server'

type SuccessPageProps = {
  params: Promise<{ locale: string }>
  searchParams: Promise<{
    bookingId?: string
    registrationDocId?: string
    registrationId?: string
    source?: string
    emailSent?: string
    emailWarning?: string
    code?: string
    t?: string
  }>
}

export default async function BkashSuccessPage({ params: routeParams, searchParams }: SuccessPageProps) {
  const { locale } = await routeParams
  setRequestLocale(locale)
  const t = await getTranslations('payments')
  const params = await searchParams
  const bookingId = params.bookingId || ''
  const registrationId = params.registrationId || ''
  const isRobofest = params.source === 'robofest'
  const emailSent = params.emailSent !== '0'
  const emailWarning = params.emailWarning?.trim() || ''
  const isResearchHub = params.source === 'researchHub'
  const hubCode = params.code || ''
  const hubToken = params.t || ''

  if (isResearchHub) {
    return (
      <main className="min-h-[60vh] flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-2xl border-2 border-green-200 shadow-lg">
          <CardContent className="p-8">
            <h1 className="text-2xl font-bold text-green-700 mb-3">{t('success.title')}</h1>
            <Alert className="mb-4 border-green-200 bg-green-50">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <AlertTitle className="text-green-900">{t('researchHub.confirmedTitle')}</AlertTitle>
              <AlertDescription className="text-green-800">
                <p>{emailSent ? t('researchHub.confirmed') : t('researchHub.confirmedNoEmail')}</p>
              </AlertDescription>
            </Alert>
            {hubCode ? (
              <div className="mb-6 rounded-xl border border-dashed border-[#1f3a6f]/30 bg-slate-50 px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  {t('researchHub.codeLabel')}
                </p>
                <div className="mt-1 flex items-center">
                  <span className="font-mono text-lg font-bold text-slate-900 break-all">{hubCode}</span>
                  <CopyButton text={hubCode} label={t('researchHub.code')} />
                </div>
              </div>
            ) : null}
            <div className="flex flex-col gap-3 sm:flex-row">
              {hubCode && hubToken ? (
                <Button asChild className="bg-[#1f3a6f] hover:bg-[#14264a] text-white">
                  <Link
                    href={`/research-hub/booking/${encodeURIComponent(hubCode)}?t=${encodeURIComponent(hubToken)}`}
                    prefetch={false}
                  >
                    <Ticket className="size-4" aria-hidden />
                    {t('researchHub.viewPass')}
                  </Link>
                </Button>
              ) : null}
              <Button asChild variant="outline">
                <Link href="/research-hub" prefetch={false}>
                  {t('backToResearchHub')}
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    )
  }

  return (
    <main className="min-h-[60vh] flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-2xl border-2 border-green-200 shadow-lg">
        <CardContent className="p-8">
          <h1 className="text-2xl font-bold text-green-700 mb-3">{t('success.title')}</h1>
          <Alert className="mb-4 border-green-200 bg-green-50">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <AlertTitle className="text-green-900">
              {t('success.alertTitle')}
            </AlertTitle>
            <AlertDescription className="text-green-800 space-y-2">
              {isRobofest ? (
                <>
                  <p>
                    {t('success.robofestConfirmed')}
                  </p>
                  {emailSent && !emailWarning ? (
                    <p>
                      {t('success.robofestEmailSent')}
                    </p>
                  ) : null}
                  <p className="font-medium text-green-900">
                    {t('success.robofestSafeToLeave')}
                  </p>
                </>
              ) : (
                <p>
                  {t('success.eventConfirmed')}
                </p>
              )}
            </AlertDescription>
          </Alert>
          {isRobofest && (!emailSent || emailWarning) ? (
            <Alert className="mb-4 border-amber-200 bg-amber-50">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <AlertTitle className="text-amber-900">
                {emailSent ? t('success.emailIncomplete') : t('success.emailNotSent')}
              </AlertTitle>
              <AlertDescription className="text-amber-900 space-y-2">
                <p>
                  {emailWarning || t('success.emailNotSentText')}
                </p>
                <p>
                  {t('success.checkSpam')}
                </p>
              </AlertDescription>
            </Alert>
          ) : null}
          {registrationId ? (
            <div className="mb-4 rounded-xl border border-dashed border-[#1f3a6f]/30 bg-slate-50 px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                {t('success.registrationIdLabel')}
              </p>
              <div className="mt-1 flex items-center">
                <span className="font-mono text-lg font-bold text-slate-900 break-all">{registrationId}</span>
                <CopyButton text={registrationId} label={t('success.registrationId')} />
              </div>
            </div>
          ) : null}
          {bookingId && !isRobofest ? (
            <p className="text-xs text-gray-500 mb-6">{t('success.bookingReference', { id: bookingId })}</p>
          ) : (
            <div className="mb-6" />
          )}
          <div className="flex flex-col gap-3 sm:flex-row">
            {registrationId ? (
              <Button asChild className="bg-[#1f3a6f] hover:bg-[#14264a] text-white">
                <Link
                  href={`/verify-booking?registrationId=${encodeURIComponent(registrationId)}`}
                  prefetch={false}
                >
                  <Ticket className="size-4" aria-hidden />
                  {t('success.viewPass')}
                </Link>
              </Button>
            ) : null}
            <Button asChild variant="outline">
              <Link href={isRobofest ? '/robofest' : '/events'} prefetch={false}>
                {isRobofest ? t('backToRobofest') : t('backToEvents')}
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
