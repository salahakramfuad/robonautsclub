'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { CalendarCheck, Phone } from 'lucide-react'
import { FaWhatsapp } from 'react-icons/fa'
import { SITE_CONFIG } from '@/lib/site-config'

/**
 * Thumb-reach actions for phones: the three things students and parents do most.
 * On an event page with open registration, "Register" jumps to that event's form.
 * Sits below the mobile menu sheet (z-50) so an open drawer covers it.
 */
export default function MobileActionBar() {
  const pathname = usePathname() ?? ''
  // The event page marks its form container with data-open when registration is possible.
  const [canRegisterHere, setCanRegisterHere] = useState(false)

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setCanRegisterHere(Boolean(document.querySelector('#register[data-open="true"]')))
    })
    return () => cancelAnimationFrame(frame)
  }, [pathname])

  const item =
    'flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#1f3a6f]'

  return (
    <nav
      aria-label="Quick actions"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-6px_20px_-12px_rgba(15,23,42,0.35)] backdrop-blur md:hidden"
    >
      <div className="flex">
        {canRegisterHere ? (
          <a href="#register" className={`${item} bg-[#d4163f] text-white`}>
            <CalendarCheck className="size-5" aria-hidden />
            Register
          </a>
        ) : (
          <Link href="/events" prefetch={false} className={`${item} bg-[#d4163f] text-white`}>
            <CalendarCheck className="size-5" aria-hidden />
            Join an event
          </Link>
        )}
        <a href={SITE_CONFIG.social.whatsapp} target="_blank" rel="noreferrer" className={`${item} text-emerald-600`}>
          <FaWhatsapp className="size-5" aria-hidden />
          WhatsApp
        </a>
        <a href={`tel:${SITE_CONFIG.phone}`} className={`${item} text-[#1f3a6f]`}>
          <Phone className="size-5" aria-hidden />
          Call us
        </a>
      </div>
    </nav>
  )
}
