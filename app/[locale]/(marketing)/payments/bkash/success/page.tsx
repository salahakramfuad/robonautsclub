import { getTranslations, setRequestLocale } from 'next-intl/server'
import { AlertTriangle, CheckCircle } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

type SuccessPageProps = {
  params: Promise<{ locale: string }>
  searchParams: Promise<{
    bookingId?: string
    registrationDocId?: string
    registrationId?: string
    source?: string
    emailSent?: string
    emailWarning?: string
  }>
}

export default async function BkashSuccessPage({ params, searchParams }: SuccessPageProps) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('payments.success')
  const query = await searchParams
  const bookingId = query.bookingId || ''
  const registrationId = query.registrationId || ''
  const isRobofest = query.source === 'robofest'
  const emailSent = query.emailSent !== '0'
  const emailWarning = query.emailWarning?.trim() || ''

  return (
    <main className="min-h-[60vh] flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-2xl border-2 border-green-200 shadow-lg">
        <CardContent className="p-8">
          <h1 className="text-2xl font-bold text-green-700 mb-3">{t('title')}</h1>
          <Alert className="mb-4 border-green-200 bg-green-50">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <AlertTitle className="text-green-900">
              {t('confirmedTitle')}
            </AlertTitle>
            <AlertDescription className="text-green-800 space-y-2">
              {isRobofest ? (
                <>
                  <p>{t('robofestBody')}</p>
                  {emailSent && !emailWarning ? (
                    <p>{t('robofestEmail')}</p>
                  ) : null}
                  <p className="font-medium text-green-900">
                    {t('safeLeave')}
                  </p>
                </>
              ) : (
                <p>{t('eventBody')}</p>
              )}
            </AlertDescription>
          </Alert>
          {isRobofest && (!emailSent || emailWarning) ? (
            <Alert className="mb-4 border-amber-200 bg-amber-50">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <AlertTitle className="text-amber-900">
                {emailSent
                  ? t('emailIncompleteTitle')
                  : t('emailNotSentTitle')}
              </AlertTitle>
              <AlertDescription className="text-amber-900 space-y-2">
                <p>
                  {emailWarning || t('emailFallback')}
                </p>
                <p>{t('emailResendHint')}</p>
              </AlertDescription>
            </Alert>
          ) : null}
          {registrationId ? (
            <p className="text-sm text-gray-500 mb-2">
              {t('registrationId')}{' '}
              <span className="font-mono font-semibold">{registrationId}</span>
            </p>
          ) : null}
          {bookingId && !isRobofest ? (
            <p className="text-sm text-gray-500 mb-6">
              {t('bookingId')} {bookingId}
            </p>
          ) : (
            <div className="mb-6" />
          )}
          <Button asChild className="bg-indigo-600 hover:bg-indigo-700 text-white">
            <Link href={isRobofest ? '/robofest' : '/events'} prefetch={false}>
              {isRobofest ? t('backRobofest') : t('backEvents')}
            </Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  )
}
