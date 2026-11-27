'use client'

import { useActionState, useState } from 'react'
import { CheckCircle2, Loader2, Send } from 'lucide-react'
import { ConsentCheckbox } from '@/components/legal/ConsentCheckbox'
import { cn } from '@/lib/utils'
import { submitContactForm, type ContactFormState } from './actions'

const INTERESTS = [
  'Robotics & STEM classes',
  'Robofest / competitions',
  'Olympiad training',
  'Workshop for my school',
  'Partnership / sponsorship',
  'Something else',
] as const

const initialState: ContactFormState = { status: 'idle' }

const inputClass = (invalid?: boolean) =>
  cn(
    'w-full rounded-xl border-2 bg-white px-4 py-3 text-base text-slate-900 placeholder:text-slate-400 transition',
    'focus:outline-none focus:ring-2 focus:ring-[#1f3a6f]/20',
    invalid ? 'border-red-400 bg-red-50 focus:border-red-500' : 'border-slate-200 focus:border-[#1f3a6f]',
  )

export default function ContactForm({ defaultInterest = '' }: { defaultInterest?: string }) {
  const [state, formAction, pending] = useActionState(submitContactForm, initialState)
  const [consent, setConsent] = useState(false)
  // Captured once on mount; the server rejects submissions that arrive implausibly fast.
  const [startedAt] = useState(() => Date.now())
  const errors = state.fieldErrors ?? {}
  const v = state.values ?? {}

  if (state.status === 'success') {
    return (
      <div role="status" className="rounded-3xl border border-emerald-200 bg-emerald-50 p-8 text-center">
        <CheckCircle2 className="mx-auto mb-3 size-12 text-emerald-500" aria-hidden />
        <h2 className="text-2xl font-bold text-slate-900">Message sent!</h2>
        <p className="mt-2 text-slate-700">{state.message}</p>
      </div>
    )
  }

  const interestOptions: readonly string[] =
    defaultInterest && !INTERESTS.includes(defaultInterest as (typeof INTERESTS)[number])
      ? [defaultInterest, ...INTERESTS]
      : INTERESTS

  return (
    <form key={state.attempt ?? 0} action={formAction} className="space-y-5">
      {state.status === 'error' && state.message ? (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {state.message}
        </p>
      ) : null}

      {/* Honeypot — hidden from people and assistive tech */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <input type="hidden" name="startedAt" value={startedAt} />

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="c-name" className="mb-1.5 block text-sm font-semibold text-slate-800">
            Your name <span className="text-red-500">*</span>
          </label>
          <input
            id="c-name"
            name="name"
            defaultValue={v.name}
            autoComplete="name"
            required
            maxLength={80}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? 'c-name-err' : undefined}
            className={inputClass(Boolean(errors.name))}
          />
          {errors.name ? <p id="c-name-err" className="mt-1 text-sm text-red-600">{errors.name}</p> : null}
        </div>
        <div>
          <label htmlFor="c-phone" className="mb-1.5 block text-sm font-semibold text-slate-800">
            Phone (WhatsApp preferred) <span className="text-red-500">*</span>
          </label>
          <input
            id="c-phone"
            name="phone"
            defaultValue={v.phone}
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            placeholder="01XXXXXXXXX"
            required
            maxLength={20}
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? 'c-phone-err' : undefined}
            className={inputClass(Boolean(errors.phone))}
          />
          {errors.phone ? <p id="c-phone-err" className="mt-1 text-sm text-red-600">{errors.phone}</p> : null}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="c-email" className="mb-1.5 block text-sm font-semibold text-slate-800">
            Email <span className="font-normal text-slate-500">(optional)</span>
          </label>
          <input
            id="c-email"
            name="email"
            defaultValue={v.email}
            type="email"
            autoComplete="email"
            maxLength={120}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'c-email-err' : undefined}
            className={inputClass(Boolean(errors.email))}
          />
          {errors.email ? <p id="c-email-err" className="mt-1 text-sm text-red-600">{errors.email}</p> : null}
        </div>
        <div>
          <label htmlFor="c-grade" className="mb-1.5 block text-sm font-semibold text-slate-800">
            Student&apos;s class / grade <span className="font-normal text-slate-500">(optional)</span>
          </label>
          <input id="c-grade" name="grade" defaultValue={v.grade} placeholder="e.g. Class 7" maxLength={30} className={inputClass()} />
        </div>
      </div>

      <div>
        <label htmlFor="c-interest" className="mb-1.5 block text-sm font-semibold text-slate-800">
          I&apos;m interested in
        </label>
        <select id="c-interest" name="interest" defaultValue={v.interest ?? defaultInterest} className={inputClass()}>
          <option value="">Choose one (optional)</option>
          {interestOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="c-message" className="mb-1.5 block text-sm font-semibold text-slate-800">
          Message <span className="text-red-500">*</span>
        </label>
        <textarea
          id="c-message"
          name="message"
          defaultValue={v.message}
          rows={5}
          required
          maxLength={2000}
          placeholder="Tell us what you'd like to know — class times, fees, age group, anything!"
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? 'c-message-err' : undefined}
          className={cn(inputClass(Boolean(errors.message)), 'resize-y')}
        />
        {errors.message ? <p id="c-message-err" className="mt-1 text-sm text-red-600">{errors.message}</p> : null}
      </div>

      <div>
        <ConsentCheckbox id="c-consent" checked={consent} onCheckedChange={setConsent} showRefund={false} />
        {consent ? <input type="hidden" name="consent" value="on" /> : null}
        {errors.consent ? <p className="mt-1 text-sm text-red-600">{errors.consent}</p> : null}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#d4163f] px-6 font-semibold text-white shadow-md transition hover:bg-[#e8335a] disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f3a6f] focus-visible:ring-offset-2 sm:w-auto"
      >
        {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Send className="size-4" aria-hidden />}
        {pending ? 'Sending…' : 'Send message'}
      </button>
    </form>
  )
}
