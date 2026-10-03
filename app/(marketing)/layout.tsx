import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Script from 'next/script'

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {/* Lazy-load AdSense so it does not compete with LCP on every marketing page */}
      <Script
        id="adsense"
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1079258526503093"
        crossOrigin="anonymous"
        strategy="lazyOnload"
      />
      <Navbar />
      {children}
      <Footer />
    </>
  )
}
