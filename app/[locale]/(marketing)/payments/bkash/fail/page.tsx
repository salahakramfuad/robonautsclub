import { getTranslations, setRequestLocale } from 'next-intl/server'
import { XCircle } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

type FailPageProps = {
  params: Promise<{ locale: string }>
  searchParams: Promise<{
    error?: string
  }>
}

export default async function BkashFailPage({ params, searchParams }: FailPageProps) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('payments.fail')
  const query = await searchParams
  const error = query.error || t('defaultError')

  return (
    <main className="min-h-[60vh] flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-2xl border-2 border-red-200 shadow-lg">
        <CardContent className="p-8">
          <h1 className="text-2xl font-bold text-red-700 mb-3">{t('title')}</h1>
          <Alert variant="destructive" className="mb-6">
            <XCircle className="h-5 w-5" />
            <AlertTitle>{t('alertTitle')}</AlertTitle>
            <AlertDescription>
              {t('body', { title: error })}
            </AlertDescription>
          </Alert>
          <Button asChild className="bg-indigo-600 hover:bg-indigo-700 text-white">
            <Link href="/events" prefetch={false}>
              {t('retry')}
            </Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  )
}
