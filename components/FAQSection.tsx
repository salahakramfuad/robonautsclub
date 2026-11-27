'use client'

import { Link } from '@/i18n/navigation'
import { HelpCircle } from 'lucide-react'
import FAQAccordion from '@/components/FAQAccordion'
import Reveal from '@/components/Reveal'
import { useTranslations } from 'next-intl'

type FAQItem = {
  question: string
  answer: string
}

export default function FAQSection({ items, intro }: { items: FAQItem[]; intro?: string }) {
  const t = useTranslations('faq.section')
  return (
    <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16">
      <Reveal className="max-w-md">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-indigo-600 sm:text-xs">
          {t('eyebrow')}
        </p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl md:text-5xl">
          {t('title')}
          <span className="mt-1 block text-indigo-700">{t('titleAccent')}</span>
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-gray-600 sm:text-base">{intro ?? t('defaultIntro')}</p>
        <div className="mt-6 flex items-center gap-3 lg:mt-8">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100">
            <HelpCircle className="size-6" aria-hidden />
          </span>
          <p className="text-sm text-gray-600">
            {t.rich('stillCurious', {
              link: (chunks) => (
                <Link href="/contact" prefetch={false} className="font-semibold text-[#1f3a6f] underline-offset-4 hover:underline">
                  {chunks}
                </Link>
              ),
            })}
          </p>
        </div>
      </Reveal>
      <Reveal delayMs={80}>
        <FAQAccordion items={items} />
      </Reveal>
    </div>
  )
}
