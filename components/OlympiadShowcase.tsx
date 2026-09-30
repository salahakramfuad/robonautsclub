'use client'

import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { SITE_CONFIG } from '@/lib/site-config'
import InfiniteMarquee from '@/components/InfiniteMarquee'
import StatsStrip from '@/components/StatsStrip'
import Reveal from '@/components/Reveal'

const OLYMPIAD_META = [
  {
    key: 'genius' as const,
    logo: '/olympiads/genius.jpeg',
    url: 'https://www.geniusolympiad.org/',
  },
  {
    key: 'igo' as const,
    logo: '/olympiads/greenwitch.jpg',
    url: 'https://www.igo-official.org/',
  },
  {
    key: 'nasaHerc' as const,
    logo: '/olympiads/nasahover.webp',
    url: 'https://www.nasa.gov/learning-resources/nasa-human-exploration-rover-challenge/',
  },
  {
    key: 'nextgen' as const,
    logo: '/olympiads/nextgen.jpg',
    url: 'https://www.nextgenolympiad.com/',
  },
  {
    key: 'worldScholars' as const,
    logo: '/olympiads/worldscholar.png',
    url: 'https://www.scholarscup.org/',
  },
  {
    key: 'owlypia' as const,
    logo: '/olympiads/owlypia.jpeg',
    url: 'https://www.owlypia.org/',
  },
  {
    key: 'robofest' as const,
    logo: '/olympiads/robofest.png',
    url: '/robofest',
  },
] as const

const COUNTRIES_A = [
  { name: 'Bangladesh', flag: '🇧🇩' },
  { name: 'Thailand', flag: '🇹🇭' },
  { name: 'Malaysia', flag: '🇲🇾' },
  { name: 'Singapore', flag: '🇸🇬' },
  { name: 'China', flag: '🇨🇳' },
  { name: 'Japan', flag: '🇯🇵' },
  { name: 'South Korea', flag: '🇰🇷' },
  { name: 'Qatar', flag: '🇶🇦' },
  { name: 'Turkey', flag: '🇹🇷' },
  { name: 'USA', flag: '🇺🇸' },
  { name: 'Canada', flag: '🇨🇦' },
  { name: 'Australia', flag: '🇦🇺' },
  { name: 'England', flag: '🇬🇧' },
] as const

const COUNTRIES_B = [
  { name: 'India', flag: '🇮🇳' },
  { name: 'Indonesia', flag: '🇮🇩' },
  { name: 'Philippines', flag: '🇵🇭' },
  { name: 'Vietnam', flag: '🇻🇳' },
  { name: 'UAE', flag: '🇦🇪' },
  { name: 'Saudi Arabia', flag: '🇸🇦' },
  { name: 'Bangladesh', flag: '🇧🇩' },
  { name: 'Thailand', flag: '🇹🇭' },
  { name: 'Malaysia', flag: '🇲🇾' },
  { name: 'Singapore', flag: '🇸🇬' },
  { name: 'China', flag: '🇨🇳' },
  { name: 'Japan', flag: '🇯🇵' },
  { name: 'South Korea', flag: '🇰🇷' },
  { name: 'Qatar', flag: '🇶🇦' },
] as const

export default function OlympiadShowcase() {
  const t = useTranslations('home.olympiads')

  return (
    <div className="relative">
      <Reveal className="mx-auto mb-10 max-w-3xl text-center sm:mb-14">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-sky-300 sm:text-xs">
          {t('eyebrow')}
        </p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
          {t('title', { name: SITE_CONFIG.name })}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
          {t('subtitle')}
        </p>
      </Reveal>

      <div className="mb-10 sm:mb-14">
        <InfiniteMarquee duration={42} fadeClassName="from-slate-950">
          {OLYMPIAD_META.map((olympiad) => {
            const name = t(olympiad.key)
            const isExternal = olympiad.url.startsWith('http')
            return (
              <a
                key={olympiad.key}
                href={olympiad.url}
                {...(isExternal
                  ? { target: '_blank', rel: 'noopener noreferrer' }
                  : {})}
                className="group flex h-24 w-46 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-5 transition-all duration-300 hover:border-sky-300/40 hover:bg-white/10 sm:h-28 sm:w-52"
              >
                <div className="relative h-14 w-full sm:h-16">
                  <Image
                    src={olympiad.logo}
                    alt={name}
                    fill
                    className="object-contain opacity-80 transition-all duration-300 group-hover:opacity-100"
                    quality={90}
                    sizes="180px"
                  />
                </div>
                <span className="sr-only">{name}</span>
              </a>
            )
          })}
        </InfiniteMarquee>
      </div>

      <Reveal>
        <StatsStrip />
      </Reveal>

      <div className="mt-10 space-y-3 sm:mt-14">
        <p className="mb-4 text-center text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400 sm:text-xs">
          {t('countriesHeading')}
        </p>
        <InfiniteMarquee duration={38} fadeClassName="from-slate-950">
          {COUNTRIES_A.map((country) => (
            <CountryChip key={country.name} {...country} />
          ))}
        </InfiniteMarquee>
        <InfiniteMarquee reverse duration={46} fadeClassName="from-slate-950">
          {COUNTRIES_B.map((country) => (
            <CountryChip key={country.name} {...country} />
          ))}
        </InfiniteMarquee>
      </div>
    </div>
  )
}

function CountryChip({ name, flag }: { name: string; flag: string }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-sm font-medium text-slate-200">
      <span aria-hidden className="text-base leading-none">
        {flag}
      </span>
      {name}
    </span>
  )
}
