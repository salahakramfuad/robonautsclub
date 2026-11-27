'use server'

// Every export here is a public endpoint. Payment finalize/refund logic lives in
// lib/research-hub/payment.ts and is only reachable from the bKash callback route.

import { getLocale } from 'next-intl/server'
import { z } from 'zod'
import { checkSlotRequest, getDayAvailability } from '@/lib/research-hub/availability'
import { startResearchHubCheckout } from '@/lib/research-hub/payment'
import {
  MAX_ACTIVE_HOLDS_PER_PHONE,
  calculateAmount,
  type DayAvailability,
} from '@/lib/research-hub/shared'
import {
  countActiveHoldsForPhone,
  createBookingIfSeatsAvailable,
  getResearchHubSettings,
} from '@/lib/research-hub/store'
import { rememberPaymentLocale } from '@/lib/payment-locale'

export async function getResearchHubAvailability(date: string): Promise<DayAvailability> {
  return getDayAvailability(String(date))
}

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => v || undefined)

const checkoutSchema = z.object({
  date: z.string(),
  startHour: z.number().int().min(0).max(23),
  hours: z.number().int().min(1).max(24),
  persons: z.number().int().min(1).max(500),
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().toLowerCase().email().max(200),
  phone: z
    .string()
    .transform((v) => v.replace(/[\s-]/g, '').replace(/^\+?88/, ''))
    .pipe(z.string().regex(/^01\d{9}$/)),
  institution: optionalText(200),
  purpose: optionalText(1000),
  plannedComponents: optionalText(1000),
  groupMembers: optionalText(1000),
  acceptRules: z.literal(true),
})

export type ResearchHubCheckoutInput = z.input<typeof checkoutSchema>

export type CheckoutErrorCode =
  | 'invalid'
  | 'closed'
  | 'duration'
  | 'persons'
  | 'unavailable'
  | 'notEnoughSeats'
  | 'tooManyHolds'
  | 'paymentInit'

export async function initiateResearchHubCheckout(
  input: ResearchHubCheckoutInput,
): Promise<{ success: true; checkoutUrl: string } | { success: false; error: CheckoutErrorCode; field?: string }> {
  const parsed = checkoutSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: 'invalid', field: String(parsed.error.issues[0]?.path[0] ?? '') }
  }
  const data = parsed.data

  const settings = await getResearchHubSettings()
  const day = await getDayAvailability(data.date, { settings })
  const check = checkSlotRequest(day, data.startHour, data.hours, data.persons)
  if (!check.ok) return { success: false, error: check.reason }

  if ((await countActiveHoldsForPhone(data.phone)) >= MAX_ACTIVE_HOLDS_PER_PHONE) {
    return { success: false, error: 'tooManyHolds' }
  }

  const locale = await getLocale().catch(() => 'en')
  const booking = await createBookingIfSeatsAvailable({
    date: data.date,
    startHour: data.startHour,
    hours: data.hours,
    persons: data.persons,
    capacity: settings.seatsPerHour,
    name: data.name,
    email: data.email,
    phone: data.phone,
    institution: data.institution,
    purpose: data.purpose,
    plannedComponents: data.plannedComponents,
    groupMembers: data.groupMembers,
    rate: settings.ratePerPersonHour,
    amount: calculateAmount(settings.ratePerPersonHour, data.persons, data.hours),
    locale,
    paymentGateway: 'bkash',
    status: 'held',
  })
  if (!booking) return { success: false, error: 'notEnoughSeats' }

  try {
    await rememberPaymentLocale()
    const checkoutUrl = await startResearchHubCheckout(booking)
    return { success: true, checkoutUrl }
  } catch (error) {
    console.error('[research-hub] bKash checkout init failed', { code: booking.code, error })
    return { success: false, error: 'paymentInit' }
  }
}
