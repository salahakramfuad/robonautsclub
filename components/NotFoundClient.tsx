'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Home, ArrowRight, Plug } from 'lucide-react'
import { Link, useRouter } from '@/i18n/navigation'

export default function NotFoundClient() {
  const t = useTranslations('errors.notFound')
  const router = useRouter()
  const [countdown, setCountdown] = useState(3)

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (countdown === 0) {
      router.push('/')
    }
  }, [countdown, router])

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 bg-gray-50">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="flex justify-center mb-4">
          <div className="relative">
            <div className="w-32 h-32 mx-auto relative">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-20 h-16 bg-gray-200 rounded-lg opacity-50">
                <div className="absolute top-1/2 left-6 transform -translate-y-1/2 w-2 h-2 bg-gray-400 rounded-full opacity-30" />
                <div className="absolute top-1/2 right-6 transform -translate-y-1/2 w-2 h-2 bg-gray-400 rounded-full opacity-30" />
              </div>

              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-24 h-20 bg-gray-200 rounded-lg opacity-50">
                <div className="absolute top-3 left-1/2 transform -translate-x-1/2">
                  <div className="relative w-16 h-8 border-2 border-gray-400 rounded">
                    <div className="absolute left-1 top-1 bottom-1 w-2 bg-red-400 rounded opacity-60" />
                    <div className="absolute right-1 top-1 bottom-1 left-5 bg-gray-100 rounded" />
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
                <div className="relative">
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                    <div className="w-0.5 h-6 bg-gray-300" />
                    <div className="absolute top-6 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full" />
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-2 border-2 border-gray-300 shadow-sm">
                    <Plug className="w-5 h-5 text-gray-400" strokeWidth={2} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="text-6xl md:text-7xl font-bold text-gray-300 mb-2 select-none">
            {t('code')}
          </div>
          <h1 className="text-xl md:text-2xl font-semibold text-gray-700 mb-2">
            {t('title')}
          </h1>
          <p className="text-gray-600 text-sm">{t('body')}</p>
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200 shadow-sm">
          <span className="text-sm text-gray-600">{t('redirecting')}</span>
          <span className="text-lg font-semibold text-indigo-500 tabular-nums text-center">
            {t('seconds', { seconds: countdown })}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Link
            href="/"
            prefetch={false}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-indigo-500 text-white rounded-lg font-medium hover:bg-indigo-600 transition-colors no-underline"
          >
            <Home className="w-4 h-4" />
            {t('goHome')}
          </Link>
          <Link
            href="/events"
            prefetch={false}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 rounded-lg font-medium border border-gray-200 hover:bg-gray-50 transition-colors no-underline"
          >
            {t('exploreEvents')}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </main>
  )
}
