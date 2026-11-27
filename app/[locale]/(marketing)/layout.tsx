import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import MobileActionBar from '@/components/MobileActionBar'
import AnnouncementBanner from '@/components/AnnouncementBanner'
import AdSenseScript from '@/components/ads/AdSenseScript'
import { AdsEnabledProvider } from '@/components/ads/AdsEnabledContext'
import { getFeatureFlags } from '@/lib/feature-flags'
import { parseAnnouncement } from '@/lib/feature-flags-shared'
import { setRequestLocale } from 'next-intl/server'

export default async function MarketingLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const flags = await getFeatureFlags()
  const adsEnabled = flags['ads.enabled'].enabled
  const announcement = flags['banner.announcement'].enabled
    ? parseAnnouncement(flags['banner.announcement'].value)
    : null
  const hiddenHrefs = flags['pages.courses'].enabled ? [] : ['/courses']

  return (
    <AdsEnabledProvider enabled={adsEnabled}>
      {adsEnabled ? <AdSenseScript /> : null}
      {announcement ? <AnnouncementBanner announcement={announcement} /> : null}
      <Navbar hiddenHrefs={hiddenHrefs} />
      {children}
      <Footer hiddenHrefs={hiddenHrefs} reserveMobileBar={flags['ui.mobileActionBar'].enabled} />
      {flags['ui.mobileActionBar'].enabled ? <MobileActionBar /> : null}
    </AdsEnabledProvider>
  )
}
