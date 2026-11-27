import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'
import { SITE_CONFIG } from '@/lib/site-config'
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
  return buildLocalizedPageMetadata('privacy', locale, {
    path: '/privacy',
    absoluteTitle: true,
  })
}

const { address } = SITE_CONFIG

export default async function PrivacyPolicyPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const { t, rich, items } = await getLegalContent('privacy')

  return (
    <LegalPage pageKey="privacy" intro={<p>{rich('intro')}</p>}>
      <LegalSection title={t('whoWeAre.title')}>
        <p>
          {rich('whoWeAre.body', {
            siteUrl: SITE_CONFIG.url.replace(/\/$/, ''),
            address: `${address.streetAddress}, ${address.locality}, ${address.region}`,
          })}
        </p>
      </LegalSection>

      <LegalSection title={t('collect.title')}>
        <p>{rich('collect.given')}</p>
        <LegalList>{items('collect.items')}</LegalList>
        <p>{rich('collect.payment')}</p>
        <p>{rich('collect.automatic')}</p>
        <p>{rich('collect.photos')}</p>
      </LegalSection>

      <LegalSection title={t('use.title')}>
        <LegalList>{items('use.items')}</LegalList>
      </LegalSection>

      <LegalSection title={t('legalBasis.title')}>
        <p>{rich('legalBasis.body')}</p>
      </LegalSection>

      <LegalSection title={t('verification.title')}>
        <p>{rich('verification.body')}</p>
      </LegalSection>

      <LegalSection title={t('media.title')}>
        <p>{rich('media.body')}</p>
      </LegalSection>

      <LegalSection title={t('children.title')}>
        <p>{rich('children.body')}</p>
      </LegalSection>

      <LegalSection title={t('sharing.title')}>
        <p>{rich('sharing.intro')}</p>
        <LegalList>{items('sharing.items')}</LegalList>
        <p>{rich('sharing.outside')}</p>
      </LegalSection>

      <LegalSection title={t('advertising.title')}>
        <p>{rich('advertising.p1')}</p>
        <p>{rich('advertising.p2')}</p>
      </LegalSection>

      <LegalSection title={t('retention.title')}>
        <LegalList>{items('retention.items')}</LegalList>
      </LegalSection>

      <LegalSection title={t('security.title')}>
        <p>{rich('security.body')}</p>
      </LegalSection>

      <LegalSection title={t('rights.title')}>
        <LegalList>{items('rights.items')}</LegalList>
        <p>{rich('rights.request')}</p>
      </LegalSection>

      <LegalSection title={t('changes.title')}>
        <p>{rich('changes.body')}</p>
      </LegalSection>

      <LegalSection title={t('contact.title')}>
        <p>{rich('contact.body')}</p>
      </LegalSection>
    </LegalPage>
  )
}
