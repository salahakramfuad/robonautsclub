import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Info } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

type Props = { params: Promise<{ locale: string }> }

export default async function BkashCancelPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('payments.cancel')

  return (
    <main className="min-h-[60vh] flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-2xl border-2 border-amber-200 shadow-lg">
        <CardContent className="p-8">
          <h1 className="text-2xl font-bold text-amber-700 mb-3">{t('title')}</h1>
          <Alert className="mb-6 border-amber-200 bg-amber-50">
            <Info className="h-5 w-5 text-amber-600" />
            <AlertTitle className="text-amber-900">{t('alertTitle')}</AlertTitle>
            <AlertDescription className="text-amber-800">
              {t('body')}
            </AlertDescription>
          </Alert>
          <Button asChild className="bg-indigo-600 hover:bg-indigo-700 text-white">
            <Link href="/events" prefetch={false}>
              {t('back')}
            </Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  )
}
