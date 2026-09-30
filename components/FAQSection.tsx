'use client'

import { HelpCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'
import FAQAccordion from '@/components/FAQAccordion'
import Reveal from '@/components/Reveal'

type FAQItem = {
  question: string
  answer: string
}

export default function FAQSection({ items }: { items: FAQItem[] }) {
  const t = useTranslations('home.faq.section')

  return (
    <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16">
      <Reveal className="max-w-md">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-indigo-600 sm:text-xs">
          {t('eyebrow')}
        </p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl md:text-5xl">
          {t('titleLine1')}
          <span className="mt-1 block text-indigo-700">{t('titleLine2')}</span>
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-gray-600 sm:text-base">
          {t('intro')}
        </p>
        <div className="mt-8 hidden items-center gap-3 lg:flex">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100">
            <HelpCircle className="size-6" />
          </span>
          <p className="text-sm text-gray-500">{t('sidebar')}</p>
        </div>
      </Reveal>
      <Reveal delayMs={80}>
        <FAQAccordion items={items} />
      </Reveal>
    </div>
  )
}
