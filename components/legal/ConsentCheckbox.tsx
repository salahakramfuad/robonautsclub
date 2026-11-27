'use client'

import type { ReactNode } from 'react'
import { Checkbox } from '@/components/ui/checkbox'

const LINK_CLASS =
  'font-semibold text-indigo-600 underline underline-offset-2 hover:text-indigo-700'

function PolicyLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={LINK_CLASS}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </a>
  )
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
        I agree to the <PolicyLink href="/terms">Terms &amp; Conditions</PolicyLink>
        {showRefund ? ', ' : ' and '}
        <PolicyLink href="/privacy">Privacy Policy</PolicyLink>
        {showRefund ? (
          <>
            {' '}and <PolicyLink href="/refund-policy">Refund &amp; Cancellation Policy</PolicyLink>
          </>
        ) : null}
        , and to follow the <PolicyLink href="/code-of-conduct">Code of Conduct</PolicyLink>. If
        the participant is under 18, I am their parent/guardian or have their parent/guardian&apos;s
        consent to register.
      </span>
    </label>
  )
}
