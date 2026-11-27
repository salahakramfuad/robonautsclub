import { Link } from '@/i18n/navigation'
import { XCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { SITE_CONFIG } from '@/lib/site-config'
import { getTranslations, setRequestLocale } from 'next-intl/server'

type FailPageProps = {
  params: Promise<{ locale: string }>
  searchParams: Promise<{
    error?: string
    source?: string
    reason?: string
  }>
}

export default async function BkashFailPage({ params: routeParams, searchParams }: FailPageProps) {
  const { locale } = await routeParams
  setRequestLocale(locale)
  const t = await getTranslations('payments')
  const params = await searchParams
  const error = params.error || t('fail.defaultError')
  const isResearchHub = params.source === 'researchHub'
  const hubReasons = ['cancelled', 'slotTaken', 'refunded', 'paymentFailed', 'error'] as const
  const hubReason = hubReasons.find((r) => r === params.reason) ?? 'paymentFailed'

  return (
    <main className="min-h-[60vh] flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-2xl border-2 border-red-200 shadow-lg">
        <CardContent className="p-8">
          <h1 className="text-2xl font-bold text-red-700 mb-3">{t('fail.title')}</h1>
          <Alert variant="destructive" className="mb-6">
            <XCircle className="h-5 w-5" />
            <AlertTitle>{isResearchHub ? t('researchHub.failTitle') : t('fail.alertTitle')}</AlertTitle>
            <AlertDescription>
              {isResearchHub ? t(`researchHub.${hubReason}`, { error }) : t('fail.alertText', { error })}
            </AlertDescription>
          </Alert>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild className="bg-[#1f3a6f] hover:bg-[#14264a] text-white">
              <Link href={isResearchHub ? '/research-hub#book' : '/events'} prefetch={false}>
                {isResearchHub ? t('researchHub.tryAgain') : t('fail.tryAgain')}
              </Link>
            </Button>
            <Button asChild variant="outline">
              <a href={SITE_CONFIG.social.whatsapp} target="_blank" rel="noreferrer">
                {t('fail.whatsapp')}
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
