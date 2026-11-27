import type { Metadata } from 'next'
import { Mail, MapPin, Phone } from 'lucide-react'
import { FaWhatsapp } from 'react-icons/fa'
import { SITE_CONFIG } from '@/lib/site-config'
import { buildPageMetadata } from '@/lib/seo-metadata'
import AboutMap from '../about/AboutMap'
import ContactForm from './ContactForm'

export const metadata: Metadata = buildPageMetadata({
  title: 'Contact Us',
  description: `Talk to ${SITE_CONFIG.name} about robotics classes, Robofest, olympiad training or school workshops. WhatsApp, call, email, or send us a message.`,
  path: '/contact',
})

type Props = { searchParams: Promise<{ interest?: string }> }

export default async function ContactPage({ searchParams }: Props) {
  const { interest } = await searchParams
  const defaultInterest = typeof interest === 'string' ? interest.slice(0, 80) : ''

  return (
    <main id="main" className="min-h-screen bg-slate-50">
      <section className="relative overflow-hidden bg-[#14264a] text-white">
        <div className="bg-tech-grid pointer-events-none absolute inset-0 opacity-30" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-rose-300">Contact</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">Let&apos;s talk robots 🤖</h1>
          <p className="mt-4 max-w-xl text-base text-slate-200 sm:text-lg">
            Questions about classes, fees, age groups or Robofest? The fastest way to reach a mentor is
            WhatsApp — or leave a message below.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <a
              href={SITE_CONFIG.social.whatsapp}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 font-semibold text-white transition hover:bg-emerald-400"
            >
              <FaWhatsapp className="size-5" aria-hidden />
              Chat on WhatsApp
            </a>
            <a
              href={`tel:${SITE_CONFIG.phone}`}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/30 px-6 font-semibold text-white transition hover:bg-white/10"
            >
              <Phone className="size-5" aria-hidden />
              Call {SITE_CONFIG.phone}
            </a>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:py-16">
        <section aria-labelledby="form-heading" className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 id="form-heading" className="text-2xl font-bold text-slate-900">Send us a message</h2>
          <p className="mt-1 mb-6 text-sm text-slate-600">We reply within 1–2 working days.</p>
          <ContactForm defaultInterest={defaultInterest} />
        </section>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">Visit us</h2>
            <ul className="mt-4 space-y-3 text-sm text-slate-700">
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 size-5 shrink-0 text-[#d4163f]" aria-hidden />
                <span>
                  {SITE_CONFIG.location}, {SITE_CONFIG.address.region}
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="size-5 shrink-0 text-[#d4163f]" aria-hidden />
                <a href={`tel:${SITE_CONFIG.phone}`} className="hover:text-[#1f3a6f] hover:underline">
                  {SITE_CONFIG.phone}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="size-5 shrink-0 text-[#d4163f]" aria-hidden />
                <a href={`mailto:${SITE_CONFIG.email}`} className="break-all hover:text-[#1f3a6f] hover:underline">
                  {SITE_CONFIG.email}
                </a>
              </li>
            </ul>
          </div>
          <AboutMap />
        </aside>
      </div>
    </main>
  )
}
