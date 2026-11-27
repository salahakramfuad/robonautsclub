'use client'

import type { ReactNode } from 'react'
import { useTranslations } from 'next-intl'
import { Checkbox } from '@/components/ui/checkbox'
import { Link } from '@/i18n/navigation'

const LINK_CLASS =
  'font-semibold text-indigo-600 underline underline-offset-2 hover:text-indigo-700'

function PolicyLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={LINK_CLASS}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </Link>
  )
}

function policyLink(href: string) {
  return function RichPolicyLink(chunks: ReactNode) {
    return <PolicyLink href={href}>{chunks}</PolicyLink>
  }
}

type ConsentCheckboxProps = {
  id: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  disabled?: boolean
  /** Show the refund policy link (paid registrations). */
  showRefund?: boolean
}

/**
 * Required agreement to Terms / Privacy (and Refund policy for paid events)
 * before a public registration can be submitted.
 */
export function ConsentCheckbox({
  id,
  checked,
  onCheckedChange,
  disabled,
  showRefund = true,
}: ConsentCheckboxProps) {
  const t = useTranslations('legal.consent')
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3"
    >
      <Checkbox
        id={id}
        checked={checked}
        disabled={disabled}
        onCheckedChange={(value) => onCheckedChange(value === true)}
        className="mt-0.5"
        aria-required="true"
      />
      <span className="text-sm leading-snug text-slate-700">
        {t.rich(showRefund ? 'withRefund' : 'withoutRefund', {
          terms: policyLink('/terms'),
          privacy: policyLink('/privacy'),
          refund: policyLink('/refund-policy'),
          conduct: policyLink('/code-of-conduct'),
        })}
      </span>
    </label>
  )
}
