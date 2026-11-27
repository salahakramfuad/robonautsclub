import { Link } from '@/i18n/navigation'
import { Megaphone } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { isSafeBannerHref, type AnnouncementValue } from '@/lib/feature-flags-shared'

/** Site-wide strip controlled from Dashboard → Feature flags. */
export default async function AnnouncementBanner({ announcement }: { announcement: AnnouncementValue }) {
  const t = await getTranslations('common.announcement')
  const href = announcement.href && isSafeBannerHref(announcement.href) ? announcement.href : null
  const content = (
    <>
      <Megaphone className="size-4 shrink-0" aria-hidden />
      <span>{announcement.message}</span>
      {href ? <span className="font-semibold underline underline-offset-2">{t('learnMore')}</span> : null}
    </>
  )
  const className =
    'flex items-center justify-center gap-2 bg-[#d4163f] px-4 py-2 text-center text-sm font-medium text-white'

  if (!href) {
    return (
      <div role="region" aria-label={t('label')} className={className}>
        {content}
      </div>
    )
  }
  return href.startsWith('/') ? (
    <Link href={href} prefetch={false} className={`${className} hover:bg-[#e8335a]`}>
      {content}
    </Link>
  ) : (
    <a href={href} target="_blank" rel="noreferrer" className={`${className} hover:bg-[#e8335a]`}>
      {content}
    </a>
  )
}
