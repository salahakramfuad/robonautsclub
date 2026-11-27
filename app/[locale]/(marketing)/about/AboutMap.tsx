'use client'

import dynamic from 'next/dynamic'
import { useTranslations } from 'next-intl'

const MapClient = dynamic(() => import('./MapClient'), {
  ssr: false,
  loading: () => <MapSkeleton />,
})

function MapSkeleton() {
  const t = useTranslations('about.map')
  return (
    <div
      className="h-[420px] w-full rounded-2xl bg-slate-100 animate-pulse border border-gray-200"
      aria-busy
      aria-label={t('loading')}
    />
  )
}

export default function AboutMap() {
  return <MapClient />
}
