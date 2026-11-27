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
  return buildLocalizedPageMetadata('codeOfConduct', locale, {
    path: '/code-of-conduct',
    absoluteTitle: true,
  })
}

export default async function CodeOfConductPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const { t, rich, items } = await getLegalContent('codeOfConduct')

  return (
    <LegalPage pageKey="codeOfConduct" intro={<p>{rich('intro')}</p>}>
      <LegalSection title={t('respect.title')}>
        <LegalList>{items('respect.items')}</LegalList>
      </LegalSection>

      <LegalSection title={t('safety.title')}>
        <LegalList>{items('safety.items')}</LegalList>
      </LegalSection>

      <LegalSection title={t('fairPlay.title')}>
        <LegalList>{items('fairPlay.items')}</LegalList>
      </LegalSection>

      <LegalSection title={t('safeguarding.title')} id="safeguarding">
        <LegalList>{items('safeguarding.items')}</LegalList>
        <p>{rich('safeguarding.report')}</p>
      </LegalSection>

      <LegalSection title={t('media.title')}>
        <p>{rich('media.body')}</p>
      </LegalSection>

      <LegalSection title={t('online.title')}>
        <p>{rich('online.body')}</p>
      </LegalSection>

      <LegalSection title={t('consequences.title')}>
        <p>{rich('consequences.body')}</p>
      </LegalSection>
    </LegalPage>
  )
}
