'use client'

import Link from 'next/link'
import { HelpCircle } from 'lucide-react'
import FAQAccordion from '@/components/FAQAccordion'
import Reveal from '@/components/Reveal'

type FAQItem = {
  question: string
  answer: string
}

const DEFAULT_INTRO =
  'Eligibility, ages, experience, and certificates — the essentials for families and students considering the next step.'

export default function FAQSection({ items, intro = DEFAULT_INTRO }: { items: FAQItem[]; intro?: string }) {
  return (
    <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16">
      <Reveal className="max-w-md">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-indigo-600 sm:text-xs">
          FAQ
        </p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl md:text-5xl">
          Questions?
          <span className="mt-1 block text-indigo-700">We&apos;ve Got Answers.</span>
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-gray-600 sm:text-base">{intro}</p>
        <div className="mt-6 flex items-center gap-3 lg:mt-8">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100">
            <HelpCircle className="size-6" aria-hidden />
          </span>
          <p className="text-sm text-gray-600">
            Still curious?{' '}
            <Link href="/contact" prefetch={false} className="font-semibold text-[#1f3a6f] underline-offset-4 hover:underline">
              Ask us anything
            </Link>{' '}
            — we&apos;re happy to help you find the right pathway.
          </p>
        </div>
      </Reveal>
      <Reveal delayMs={80}>
        <FAQAccordion items={items} />
      </Reveal>
    </div>
  )
}
