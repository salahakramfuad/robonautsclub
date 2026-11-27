'use client'

import { useLocale, useTranslations } from 'next-intl'
import { Languages } from 'lucide-react'
import { Link, usePathname } from '@/i18n/navigation'
import { cn } from '@/lib/utils'

/** Toggles between English and Bangla, keeping the current page. */
export default function LanguageSwitcher({ className }: { className?: string }) {
  const locale = useLocale()
  const pathname = usePathname() || '/'
  const t = useTranslations('common.language')
  const target = locale === 'bn' ? 'en' : 'bn'

  return (
    <Link
      href={pathname}
      locale={target}
      prefetch={false}
      hrefLang={target}
      lang={target}
      aria-label={t('switchTo')}
      title={t('switchTo')}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-[#1f3a6f] shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50 no-underline hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f3a6f] focus-visible:ring-offset-2',
        className,
      )}
    >
      <Languages className="size-4" aria-hidden />
      <span>{t('short')}</span>
    </Link>
  )
}
