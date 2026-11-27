'use client'

import { Button } from '@/components/ui/button'
import { useTranslations } from 'next-intl'

interface RetryButtonProps {
  className?: string
}

export default function RetryButton({ className }: RetryButtonProps) {
  const t = useTranslations('verify')
  return (
    <Button
      type="button"
      variant="outline"
      onClick={() => window.location.reload()}
      className={className}
    >
      {t('retry')}
    </Button>
  )
}
