'use server'

import { SITE_CONFIG } from '@/lib/site-config'
import { isFeatureEnabledFresh } from '@/lib/feature-flags'
import { getTranslations } from 'next-intl/server'
import {
  createBrevoClient,
  createSendSmtpEmail,
  requireBrevoApiKey,
  resolveSender,
  validateAndNormalizeEmail,
} from '@/lib/email/shared'

export type ContactFormState = {
  status: 'idle' | 'success' | 'error'
  message?: string
  fieldErrors?: Partial<Record<'name' | 'phone' | 'email' | 'message' | 'consent', string>>
  /** Echo of what was submitted, so a failed attempt does not wipe the form. */
  values?: Partial<Record<'name' | 'phone' | 'email' | 'grade' | 'interest' | 'message', string>>
  /** Increments per attempt; used as a form key so inputs remount with `values`. */
  attempt?: number
}

/** Submissions faster than this are almost certainly bots. */
const MIN_FILL_MS = 3000

const LIMITS = { name: 80, phone: 20, email: 120, grade: 30, interest: 80, message: 2000 } as const

function field(formData: FormData, key: string, max: number): string {
  const raw = formData.get(key)
  return typeof raw === 'string' ? raw.trim().slice(0, max) : ''
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/**
 * Public contact form. Mail only ever goes to the club inbox (never to the
 * submitted address), so the endpoint cannot be used to relay mail to third parties.
 */
export async function submitContactForm(
  prev: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const result = await handleContactForm(formData)
  if (result.status !== 'error') return result
  const echo = (key: string, max: number) => field(formData, key, max)
  return {
    ...result,
    attempt: (prev.attempt ?? 0) + 1,
    values: {
      name: echo('name', LIMITS.name),
      phone: echo('phone', LIMITS.phone),
      email: echo('email', LIMITS.email),
      grade: echo('grade', LIMITS.grade),
      interest: echo('interest', LIMITS.interest),
      message: echo('message', LIMITS.message),
    },
  }
}

async function handleContactForm(formData: FormData): Promise<ContactFormState> {
  const t = await getTranslations('contact')
  if (!(await isFeatureEnabledFresh('pages.contactForm'))) {
    return { status: 'error', message: t('errors.paused', { phone: SITE_CONFIG.phone }) }
  }
  // Honeypot: real users never see or fill this field. Pretend success for bots.
  if (field(formData, 'website', 200)) {
    return { status: 'success', message: t('success.generic') }
  }
  const startedAt = Number(formData.get('startedAt'))
  if (!Number.isFinite(startedAt) || Date.now() - startedAt < MIN_FILL_MS) {
    return { status: 'error', message: t('errors.tooFast') }
  }

  const name = field(formData, 'name', LIMITS.name)
  const phone = field(formData, 'phone', LIMITS.phone).replace(/\s/g, '')
  const email = field(formData, 'email', LIMITS.email)
  const grade = field(formData, 'grade', LIMITS.grade)
  const interest = field(formData, 'interest', LIMITS.interest)
  const message = field(formData, 'message', LIMITS.message)
  const consent = formData.get('consent') === 'on'

  const fieldErrors: ContactFormState['fieldErrors'] = {}
  if (name.length < 2) fieldErrors.name = t('errors.name')
  if (!/^01\d{9}$/.test(phone)) fieldErrors.phone = t('errors.phone')
  if (email && !validateAndNormalizeEmail(email).ok) fieldErrors.email = t('errors.email')
  if (message.length < 5) fieldErrors.message = t('errors.message')
  if (!consent) fieldErrors.consent = t('errors.consent')
  if (Object.keys(fieldErrors).length > 0) {
    return { status: 'error', message: t('errors.fixFields'), fieldErrors }
  }

  const keyCheck = requireBrevoApiKey(false)
  if (!keyCheck.ok) {
    console.error('[contact] Email service not configured')
    return {
      status: 'error',
      message: t('errors.sendFailed', { phone: SITE_CONFIG.phone }),
    }
  }

  const rows: Array<[string, string]> = [
    ['Name', name],
    ['Phone', phone],
    ['Email', email || '—'],
    ['Student grade / class', grade || '—'],
    ['Interested in', interest || '—'],
  ]
  const html = `
    <h2 style="font-family:sans-serif;color:#1f3a6f">New enquiry from the website</h2>
    <table style="font-family:sans-serif;font-size:14px;border-collapse:collapse">
      ${rows
        .map(
          ([k, v]) =>
            `<tr><td style="padding:4px 12px 4px 0;color:#64748b">${k}</td><td style="padding:4px 0"><strong>${escapeHtml(v)}</strong></td></tr>`,
        )
        .join('')}
    </table>
    <p style="font-family:sans-serif;font-size:14px;white-space:pre-wrap;margin-top:16px">${escapeHtml(message)}</p>
  `

  try {
    const { senderEmail, senderName } = resolveSender()
    const mail = createSendSmtpEmail({
      senderEmail,
      senderName,
      toEmail: SITE_CONFIG.email,
      toName: SITE_CONFIG.name,
      subject: `Website enquiry: ${name}${interest ? ` — ${interest}` : ''}`.replace(/[\r\n]/g, ' '),
      htmlContent: html,
    })
    const replyTo = email ? validateAndNormalizeEmail(email) : null
    if (replyTo?.ok) mail.replyTo = { email: replyTo.email, name }
    await createBrevoClient().sendTransacEmail(mail)
    return { status: 'success', message: t('success.sent') }
  } catch (error) {
    console.error('[contact] Failed to send enquiry:', error)
    return {
      status: 'error',
      message: t('errors.sendFailed', { phone: SITE_CONFIG.phone }),
    }
  }
}
