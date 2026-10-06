import Script from 'next/script'
import { ADSENSE_PUBLISHER_ID, adsenseScriptSrc } from '@/lib/adsense'

/**
 * Loads the AdSense library on marketing pages (Auto ads + manual units).
 * Keep off /dashboard and /login.
 */
export default function AdSenseScript() {
  return (
    <Script
      id="adsense-init"
      async
      src={adsenseScriptSrc()}
      crossOrigin="anonymous"
      strategy="afterInteractive"
      data-ad-client={ADSENSE_PUBLISHER_ID}
    />
  )
}
