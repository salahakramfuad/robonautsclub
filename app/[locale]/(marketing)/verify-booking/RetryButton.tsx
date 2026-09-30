'use client'

import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'

interface RetryButtonProps {
  className?: string
}

export default function RetryButton({ className }: RetryButtonProps) {
  const t = useTranslations('verify.booking')
  return (
    <Button
      type="button"
      variant="outline"
      onClick={() => window.location.reload()}
      className={className}
    >
      {t('tryAgain')}
    </Button>
  )
}
