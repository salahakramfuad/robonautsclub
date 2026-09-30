'use client'

import { useLocale, useTranslations } from 'next-intl'
import { usePathname } from '@/i18n/navigation'
import { cn } from '@/lib/utils'
import type { AppLocale } from '@/i18n/routing'

type Props = {
  className?: string
  /** Compact style for navbar; default is a pill toggle. */
  variant?: 'navbar' | 'standalone'
}

function localeHref(pathname: string, locale: AppLocale): string {
  const path = pathname || '/'
  if (locale === 'bn') {
    return path === '/' ? '/bn' : `/bn${path}`
  }
  return path
}

export default function LanguageToggle({ className, variant = 'navbar' }: Props) {
  const t = useTranslations('nav')
  const locale = useLocale() as AppLocale
  const pathname = usePathname()

  return (
    <div
      role="group"
      aria-label={t('languageToggleAria')}
      className={cn(
        'inline-flex items-center rounded-full border border-indigo-200/80 bg-white/90 p-0.5 text-xs font-semibold shadow-sm backdrop-blur',
        variant === 'standalone' && 'shadow-md',
        className,
      )}
    >
      <a
        href={localeHref(pathname, 'en')}
        className={cn(
          'rounded-full px-2.5 py-1.5 transition no-underline hover:no-underline',
          locale === 'en'
            ? 'bg-indigo-600 text-white shadow-sm'
            : 'text-gray-600 hover:text-indigo-700',
        )}
        aria-pressed={locale === 'en'}
        hrefLang="en"
      >
        {t('english')}
      </a>
      <a
        href={localeHref(pathname, 'bn')}
        className={cn(
          'rounded-full px-2.5 py-1.5 transition no-underline hover:no-underline',
          locale === 'bn'
            ? 'bg-indigo-600 text-white shadow-sm'
            : 'text-gray-600 hover:text-indigo-700',
        )}
        aria-pressed={locale === 'bn'}
        hrefLang="bn"
      >
        {t('bangla')}
      </a>
    </div>
  )
}
