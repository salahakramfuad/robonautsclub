import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'
import { buildLocalizedPageMetadata } from '@/lib/seo-metadata'
import { REFUND_POLICY } from '@/lib/legal'
import {
  LegalList,
  LegalPage,
  LegalSection,
  getLegalContent,
} from '@/components/legal/LegalPage'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  return buildLocalizedPageMetadata('refund', locale, {
    path: '/refund-policy',
    absoluteTitle: true,
  })
}

const r = REFUND_POLICY
const POLICY_VALUES = {
  fullDays: r.fullRefundDays,
  partialDays: r.partialRefundDays,
  partialMaxDays: r.fullRefundDays - 1,
  percent: r.partialRefundPercent,
  processingDays: r.processingBusinessDays,
  reportDays: r.paymentIssueReportDays,
}

export default async function RefundPolicyPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const { t, rich, items } = await getLegalContent('refund')

  return (
    <LegalPage pageKey="refund" intro={<p>{rich('intro')}</p>}>
      <LegalSection title={t('weCancel.title')}>
        <LegalList>{items('weCancel.items')}</LegalList>
      </LegalSection>

      <LegalSection title={t('youCancel.title')}>
        <LegalList>{items('youCancel.items', POLICY_VALUES)}</LegalList>
      </LegalSection>

      <LegalSection title={t('transfers.title')}>
        <p>{rich('transfers.body', POLICY_VALUES)}</p>
      </LegalSection>

      <LegalSection title={t('paymentIssues.title')}>
        <p>{rich('paymentIssues.body', POLICY_VALUES)}</p>
      </LegalSection>

      <LegalSection title={t('disqualification.title')}>
        <p>{rich('disqualification.body')}</p>
      </LegalSection>

      <LegalSection title={t('request.title')}>
        <p>{rich('request.intro')}</p>
        <LegalList>{items('request.items')}</LegalList>
        <p>{rich('request.processing', POLICY_VALUES)}</p>
      </LegalSection>

      <LegalSection title={t('contact.title')}>
        <p>{rich('contact.body')}</p>
      </LegalSection>
    </LegalPage>
  )
}
