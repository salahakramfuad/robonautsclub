import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import AdSenseScript from '@/components/ads/AdSenseScript'

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <AdSenseScript />
      <Navbar />
      {children}
      <Footer />
    </>
  )
}
