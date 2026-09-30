import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { SITE_CONFIG } from '@/lib/site-config'
import { Link } from '@/i18n/navigation'
import NavbarScrollShell from '@/components/NavbarScrollShell'
import NavbarDesktopMenu from '@/components/NavbarDesktopMenu'
import NavbarMobileMenu from '@/components/NavbarMobileMenu'
import LanguageToggle from '@/components/LanguageToggle'

const NAV_HREF_KEYS = [
  { href: '/', key: 'Home' as const },
  { href: '/events', key: 'Events' as const },
  { href: '/news', key: 'News' as const },
  { href: '/robofest', key: 'Robofest' as const },
  { href: '/gallery', key: 'Gallery' as const },
  { href: '/about', key: 'AboutUs' as const },
]

export default async function Nav() {
  const t = await getTranslations('nav')
  const menuItems = NAV_HREF_KEYS.map(({ href, key }) => ({
    title: t(key),
    href,
  }))

  return (
    <NavbarScrollShell>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:inset-x-0 focus:top-2 mx-auto w-max rounded-lg bg-indigo-500 px-3 py-2 text-white"
      >
        {t('skipToContent')}
      </a>

      <nav aria-label={t('primaryAria')} className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <Link
            href="/"
            prefetch={false}
            className="flex items-center gap-3 group no-underline hover:no-underline focus:no-underline"
          >
            <Image
              src={SITE_CONFIG.assets.logo}
              alt={SITE_CONFIG.name}
              width={48}
              height={48}
              priority
              className="rounded-full object-contain ring-1 ring-gray-200 group-hover:ring-indigo-200 transition"
            />
            <span className="hidden md:block text-2xl font-semibold leading-tight text-gray-900 tracking-tight">
              {SITE_CONFIG.name}
            </span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <NavbarDesktopMenu menuItems={menuItems} />
            <LanguageToggle className="shrink-0" />
            <NavbarMobileMenu menuItems={menuItems} />
          </div>
        </div>
      </nav>
    </NavbarScrollShell>
  )
}
