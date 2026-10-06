'use client'

import { useEffect, useRef } from 'react'
import { ADSENSE_PUBLISHER_ID } from '@/lib/adsense'

declare global {
  interface Window {
    adsbygoogle?: Record<string, unknown>[]
  }
}

type AdUnitProps = {
  slot: string
  format?: 'auto' | 'fluid' | 'rectangle' | 'horizontal' | 'vertical'
  responsive?: boolean
  className?: string
  /** Accessible label for the ad region */
  label?: string
}

/**
 * Manual AdSense display unit. Renders nothing if `slot` is empty
 * (set NEXT_PUBLIC_ADSENSE_SLOT_* after creating units in AdSense).
 */
export default function AdUnit({
  slot,
  format = 'auto',
  responsive = true,
  className = '',
  label = 'Advertisement',
}: AdUnitProps) {
  const pushed = useRef(false)

  useEffect(() => {
    if (!slot || pushed.current) return
    try {
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
      pushed.current = true
    } catch {
      // Ad blockers or incomplete script load — fail silently
    }
  }, [slot])

  if (!slot) return null

  return (
    <aside
      className={`ad-unit my-6 flex min-h-[90px] w-full justify-center overflow-hidden ${className}`}
      aria-label={label}
    >
      <ins
        className="adsbygoogle"
        style={{ display: 'block', width: '100%' }}
        data-ad-client={ADSENSE_PUBLISHER_ID}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
    </aside>
  )
}
