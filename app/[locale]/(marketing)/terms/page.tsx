import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'
import { buildLocalizedPageMetadata } from '@/lib/seo-metadata'
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
  return buildLocalizedPageMetadata('terms', locale, {
    path: '/terms',
    absoluteTitle: true,
  })
}

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const { t, rich, items } = await getLegalContent('terms')

  return (
    <LegalPage pageKey="terms" intro={<p>{rich('intro')}</p>}>
      <LegalSection title={t('accepting.title')}>
        <p>{rich('accepting.body')}</p>
      </LegalSection>

      <LegalSection title={t('eligibility.title')}>
        <LegalList>{items('eligibility.items')}</LegalList>
      </LegalSection>

      <LegalSection title={t('registrations.title')}>
        <LegalList>{items('registrations.items')}</LegalList>
      </LegalSection>

      <LegalSection title={t('fees.title')}>
        <p>{rich('fees.body')}</p>
      </LegalSection>

      <LegalSection title={t('eventChanges.title')}>
        <p>{rich('eventChanges.body')}</p>
      </LegalSection>

      <LegalSection title={t('competitions.title')}>
        <LegalList>{items('competitions.items')}</LegalList>
      </LegalSection>

      <LegalSection title={t('certificates.title')}>
        <p>{rich('certificates.body')}</p>
      </LegalSection>

      <LegalSection title={t('accounts.title')}>
        <p>{rich('accounts.body')}</p>
      </LegalSection>

      <LegalSection title={t('acceptableUse.title')}>
        <p>{rich('acceptableUse.intro')}</p>
        <LegalList>{items('acceptableUse.items')}</LegalList>
      </LegalSection>

      <LegalSection title={t('intellectualProperty.title')}>
        <p>{rich('intellectualProperty.body')}</p>
      </LegalSection>

      <LegalSection title={t('media.title')}>
        <p>{rich('media.body')}</p>
      </LegalSection>

      <LegalSection title={t('liability.title')}>
        <p>{rich('liability.p1')}</p>
        <p>{rich('liability.p2')}</p>
      </LegalSection>

      <LegalSection title={t('thirdParty.title')}>
        <p>{rich('thirdParty.body')}</p>
      </LegalSection>

      <LegalSection title={t('disclosure.title')} id="security">
        <p>{rich('disclosure.body')}</p>
      </LegalSection>

      <LegalSection title={t('governingLaw.title')}>
        <p>{rich('governingLaw.body')}</p>
      </LegalSection>

      <LegalSection title={t('updates.title')}>
        <p>{rich('updates.body')}</p>
      </LegalSection>

      <LegalSection title={t('contact.title')}>
        <p>{rich('contact.body')}</p>
      </LegalSection>
    </LegalPage>
  )
}
