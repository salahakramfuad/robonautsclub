'use server'

import {
  collectionGet,
  collectionSet,
} from '@/lib/db/collections'
import { Event } from '@/types/event'
import { isRegistrationOpen } from '@/lib/dateUtils'
import { isFeatureEnabledFresh } from '@/lib/feature-flags'
import {
  BkashApiError,
  bkashCreateCheckout,
  bkashExecutePayment,
  bkashQueryPayment,
  bkashRefundPayment,
} from '@/lib/bkash'
import { normalizeCustomFormAnswers, validateCustomFormAnswers } from '@/lib/eventCustomForm'
import { getEventRegistrationFields } from '@/lib/registrationFields'
import {
  createBookingRecordAndSendEmail,
  hasExistingRegistration,
  normalizeSchoolValue,
  type BookingInput,
} from '@/lib/event-booking'
import { resolvePublicBaseUrl } from '@/lib/site-config'
import { getTranslations } from 'next-intl/server'
import { rememberPaymentLocale } from '@/lib/payment-locale'

export type { BookingInput } from '@/lib/event-booking'

type PendingPaidRegistration = {
  paymentId: string
  eventId: string
  name: string
  school?: string
  email: string
  phone: string
  category?: string
  information?: string
  customAnswers?: Record<string, string | string[] | number>
  amount: number
  status: 'pending' | 'completed' | 'failed'
  bookingId?: string
  createdAt: Date
  updatedAt: Date
}

function getBaseUrl(): string {
  return resolvePublicBaseUrl()
}

type ErrorTranslator = Awaited<ReturnType<typeof getTranslations>>

/** Request-locale translator for public booking errors (falls back to English). */
async function getErrorTranslator(): Promise<ErrorTranslator> {
  try {
    return await getTranslations('events.errors')
  } catch {
    return getTranslations({ locale: 'en', namespace: 'events.errors' })
  }
}

/** Translate the English messages returned by shared lib helpers (dashboard keeps English). */
function localizeLibMessage(message: string, t: ErrorTranslator): string {
  const patterns: Array<[RegExp, string]> = [
    [/^(.+) is required\.$/, 'fieldRequired'],
    [/^(.+) must be a valid number\.$/, 'fieldNumber'],
    [/^(.+) must be a valid email address\.$/, 'fieldEmail'],
    [/^(.+) must be 11 digits and start with 01\.$/, 'fieldPhone'],
    [/^(.+) contains an invalid option\.$/, 'fieldInvalidOption'],
  ]
  if (message === 'You have already registered for this event with this email address.') {
    return t('duplicate')
  }
  const emailFailed = message.match(
    /^Your registration was saved \(ID: ([^)]+)\), but we couldn't send the confirmation email\. Please contact support — our team has been notified\. Details: ([\s\S]*)$/,
  )
  if (emailFailed) return t('emailNotSent', { id: emailFailed[1], details: emailFailed[2] })
  const pdfFailed = message.match(/^Your registration was confirmed \(ID: ([^)]+)\), but we couldn't generate the confirmation PDF\./)
  if (pdfFailed) return t('pdfNotGenerated', { id: pdfFailed[1] })
  for (const [re, key] of patterns) {
    const m = message.match(re)
    if (m) return t(key, { label: m[1] })
  }
  return message
}

function localizeBookingResult<R extends { error?: string; warning?: string }>(result: R, t: ErrorTranslator): R {
  return {
    ...result,
    ...(result.error ? { error: localizeLibMessage(result.error, t) } : {}),
    ...(result.warning ? { warning: localizeLibMessage(result.warning, t) } : {}),
  }
}

/**
 * Create a booking for an event
 * This is a public action (no auth required) as users need to book events
 * IMPORTANT: Email confirmation is sent FIRST, booking is only saved if email succeeds
 */
export async function createBooking(
  formData: BookingInput
): Promise<{
  success: boolean
  error?: string
  warning?: string
  bookingId?: string
  registrationId?: string
}> {
  const t = await getErrorTranslator()
  try {
    const eventDoc = await collectionGet('events', formData.eventId)
    if (!eventDoc) {
      return { success: false, error: t('eventNotFound') }
    }
    const eventData = eventDoc as Record<string, unknown>
    const event: Event = {
      id: String(eventDoc.id),
      ...eventData,
      createdAt: (typeof eventData.createdAt === 'string' || eventData.createdAt instanceof Date)
        ? eventData.createdAt
        : String(eventData.createdAt ?? ''),
      updatedAt: (typeof eventData.updatedAt === 'string' || eventData.updatedAt instanceof Date)
        ? eventData.updatedAt
        : String(eventData.updatedAt ?? ''),
    } as Event

    if (!(await isFeatureEnabledFresh('registration.events'))) {
      return { success: false, error: t('paused') }
    }
    if (!isRegistrationOpen(event)) {
      return { success: false, error: t('closed') }
    }

    const defaultRegistrationFields = getEventRegistrationFields(event)

    if (!formData.eventId || !formData.name || !formData.email || !formData.phone?.trim()) {
      return { success: false, error: t('requiredFields') }
    }
    const normalizedSchool = normalizeSchoolValue(formData.school)
    if (defaultRegistrationFields.school.enabled && defaultRegistrationFields.school.required && !normalizedSchool) {
      return { success: false, error: t('schoolRequired') }
    }
    if (defaultRegistrationFields.information.enabled && defaultRegistrationFields.information.required && !formData.information?.trim()) {
      return { success: false, error: t('informationRequired') }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      return { success: false, error: t('invalidEmail') }
    }

    const normalizedPhone = formData.phone.trim().replace(/\s/g, '')
    if (normalizedPhone.length !== 11 || !normalizedPhone.startsWith('01')) {
      return { success: false, error: t('invalidPhone') }
    }

    if (event.isPaid) {
      return {
        success: false,
        error: t('paidNeedsCheckout'),
      }
    }

    const categories = Array.isArray(event.categories) ? event.categories : []
    if (defaultRegistrationFields.category.enabled && categories.length > 0) {
      const selectedCategory = formData.category?.trim()
      if (defaultRegistrationFields.category.required && !selectedCategory) {
        return { success: false, error: t('selectCategory') }
      }
      if (selectedCategory) {
        const categoryExists = categories.some(
          (category) => category.name.trim().toLowerCase() === selectedCategory.toLowerCase()
        )
        if (!categoryExists) {
          return { success: false, error: t('invalidCategory') }
        }
      }
    }

    const customAnswerError = validateCustomFormAnswers(event.customFormFields, formData.customAnswers)
    if (customAnswerError) {
      return { success: false, error: localizeLibMessage(customAnswerError, t) }
    }

    return localizeBookingResult(await createBookingRecordAndSendEmail(event, formData), t)
  } catch (error) {
    console.error('Error creating booking:', error)
    return {
      success: false,
      error: t('createFailed'),
    };
  }
}

export async function initiatePaidEventCheckout(
  formData: BookingInput
): Promise<{ success: boolean; error?: string; checkoutUrl?: string }> {
  const t = await getErrorTranslator()
  try {
    const eventDoc = await collectionGet('events', formData.eventId)
    if (!eventDoc) {
      return { success: false, error: t('eventNotFound') }
    }

    const eventData = eventDoc as Record<string, unknown>
    const event: Event = {
      id: String(eventDoc.id),
      ...eventData,
      createdAt: eventData.createdAt,
      updatedAt: eventData.updatedAt,
    } as Event

    if (!event.isPaid) {
      return { success: false, error: t('notPaid') }
    }
    if (!(await isFeatureEnabledFresh('registration.events'))) {
      return { success: false, error: t('paused') }
    }
    if (!isRegistrationOpen(event)) {
      return { success: false, error: t('closed') }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const normalizedPhone = formData.phone.trim().replace(/\s/g, '')
    const normalizedEmail = formData.email.trim().toLowerCase()
    const normalizedSchool = normalizeSchoolValue(formData.school)
    const defaultRegistrationFields = getEventRegistrationFields(event)

    if (!formData.name.trim() || !normalizedEmail || !normalizedPhone) {
      return { success: false, error: t('requiredFields') }
    }
    if (defaultRegistrationFields.school.enabled && defaultRegistrationFields.school.required && !normalizedSchool) {
      return { success: false, error: t('schoolRequired') }
    }
    if (defaultRegistrationFields.information.enabled && defaultRegistrationFields.information.required && !formData.information?.trim()) {
      return { success: false, error: t('informationRequired') }
    }
    if (!emailRegex.test(normalizedEmail)) {
      return { success: false, error: t('invalidEmail') }
    }
    if (normalizedPhone.length !== 11 || !normalizedPhone.startsWith('01')) {
      return { success: false, error: t('invalidPhone') }
    }

    const categories = Array.isArray(event.categories) ? event.categories : []
    let amountToPay = Number(event.amount || 0)
    let selectedCategoryName = formData.category?.trim() || ''
    if (defaultRegistrationFields.category.enabled && categories.length > 0) {
      if (!selectedCategoryName) {
        return { success: false, error: t('selectCategory') }
      }
      const selectedCategory = categories.find(
        (category) => category.name.trim().toLowerCase() === selectedCategoryName.toLowerCase()
      )
      if (!selectedCategory) {
        return { success: false, error: t('invalidCategory') }
      }
      selectedCategoryName = selectedCategory.name.trim()
      if (selectedCategory.amount == null || selectedCategory.amount <= 0) {
        return { success: false, error: t('categoryNoFee') }
      }
      amountToPay = Number(selectedCategory.amount)
    } else if (!amountToPay || amountToPay <= 0) {
      return { success: false, error: t('amountNotConfigured') }
    }

    const customAnswerError = validateCustomFormAnswers(event.customFormFields, formData.customAnswers)
    if (customAnswerError) {
      return { success: false, error: localizeLibMessage(customAnswerError, t) }
    }

    const duplicate = await hasExistingRegistration(formData.eventId, normalizedEmail)
    if (duplicate) {
      return {
        success: false,
        error: t('duplicate'),
      }
    }

    await rememberPaymentLocale()
    const callbackUrl = `${getBaseUrl()}/api/payments/bkash/success`
    const checkout = await bkashCreateCheckout({
      amount: amountToPay,
      payerReference: normalizedPhone,
      callbackUrl,
      merchantInvoiceNumber: `${event.id}-${Date.now()}`.slice(0, 40),
    })

    const now = new Date()
    const pending: PendingPaidRegistration = {
      paymentId: checkout.paymentId,
      eventId: formData.eventId,
      name: formData.name.trim(),
      school: defaultRegistrationFields.school.enabled ? normalizedSchool : '',
      email: normalizedEmail,
      phone: normalizedPhone,
      category: defaultRegistrationFields.category.enabled ? selectedCategoryName || undefined : undefined,
      information: defaultRegistrationFields.information.enabled ? (formData.information ? formData.information.trim() : '') : '',
      customAnswers: normalizeCustomFormAnswers(event.customFormFields, formData.customAnswers),
      amount: amountToPay,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    }

    await collectionSet('bkash_pending_registrations', checkout.paymentId, {
      ...pending,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    })
    return { success: true, checkoutUrl: checkout.checkoutUrl }
  } catch (error) {
    console.error('Error initiating bKash checkout:', error)
    return { success: false, error: t('bkashInitFailed') }
  }
}

export async function finalizePaidEventBooking(paymentId: string): Promise<{
  success: boolean
  error?: string
  warning?: string
  bookingId?: string
}> {
  try {
    const pendingSnap = await collectionGet('bkash_pending_registrations', paymentId)
    if (!pendingSnap) {
      return { success: false, error: 'Payment session not found or expired.' }
    }

    const pending = pendingSnap as PendingPaidRegistration
    const mergePending = (patch: Record<string, unknown>) =>
      collectionSet('bkash_pending_registrations', paymentId, patch, { merge: true })
    if (pending.status === 'completed' && pending.bookingId) {
      return { success: true, bookingId: pending.bookingId }
    }

    let execution
    try {
      execution = await bkashExecutePayment(paymentId)
    } catch (executeError) {
      const isNoResponseFromExecute =
        executeError instanceof BkashApiError
          ? executeError.noResponse
          : false

      if (!isNoResponseFromExecute) {
        await mergePending({ status: 'failed', updatedAt: new Date().toISOString() })
        return {
          success: false,
          error:
            executeError instanceof BkashApiError
              ? executeError.statusMessage || executeError.message
              : 'Failed to execute payment with bKash.',
        }
      }

      // Query API is only used when execute returned no response (timeout/unknown).
      try {
        const queried = await bkashQueryPayment(paymentId)
        const queriedStatus = queried.transactionStatus.toLowerCase()
        if (queriedStatus !== 'completed') {
          await mergePending({ status: 'failed', updatedAt: new Date().toISOString() })
          return {
            success: false,
            error: queried.statusMessage || `Payment is not successful (${queried.transactionStatus}).`,
          }
        }
        execution = queried
      } catch (queryError) {
        console.error('bKash execute timeout and query failed', {
          paymentId,
          executeError: executeError instanceof Error ? executeError.message : String(executeError),
          queryError: queryError instanceof Error ? queryError.message : String(queryError),
        })
        await mergePending({ status: 'failed', updatedAt: new Date().toISOString() })
        return {
          success: false,
          error:
            queryError instanceof BkashApiError
              ? queryError.statusMessage || queryError.message
              : 'Failed to verify payment status with bKash. Please contact support.',
        }
      }
    }

    const transactionStatus = execution.transactionStatus.toLowerCase()
    if (transactionStatus !== 'completed' ) {
      await mergePending({ status: 'failed', updatedAt: new Date().toISOString() })
      return {
        success: false,
        error: execution.statusMessage || `Payment is not successful (${execution.transactionStatus}).`,
      }
    }

    const eventDoc = await collectionGet('events', String(pending.eventId))
    if (!eventDoc) {
      await mergePending({ status: 'failed', updatedAt: new Date().toISOString() })
      return { success: false, error: 'Event no longer exists.' }
    }

    const eventData = eventDoc as Record<string, unknown>
    const event: Event = {
      id: String(eventDoc.id),
      ...eventData,
      createdAt: (typeof eventData.createdAt === 'string' || eventData.createdAt instanceof Date)
        ? eventData.createdAt
        : String(eventData.createdAt ?? ''),
      updatedAt: (typeof eventData.updatedAt === 'string' || eventData.updatedAt instanceof Date)
        ? eventData.updatedAt
        : String(eventData.updatedAt ?? ''),
    } as Event

    if (!isRegistrationOpen(event)) {
      await mergePending({ status: 'failed', updatedAt: new Date().toISOString() })
      return { success: false, error: 'Registration for this event is closed.' }
    }

    const result = await createBookingRecordAndSendEmail(
      event,
      {
        eventId: pending.eventId,
        name: pending.name,
        school: pending.school,
        email: pending.email,
        phone: pending.phone,
        category: pending.category,
        information: pending.information,
        customAnswers: pending.customAnswers,
      },
      {
        paymentId: execution.paymentId,
        trxId: execution.trxId,
        amountPaid: execution.amount || pending.amount,
      }
    )

    if (!result.success) {
      await mergePending({ status: 'failed', updatedAt: new Date().toISOString() })
      return result
    }

    await mergePending({
      status: 'completed',
      bookingId: result.bookingId,
      updatedAt: new Date().toISOString(),
      trxId: execution.trxId,
    })

    return result
  } catch (error) {
    console.error('Error finalizing paid booking:', error)
    return { success: false, error: 'Failed to finalize payment. Please contact support.' }
  }
}

export async function refundPaidEventPayment(input: {
  paymentId: string
  trxId: string
  amount: number
  reason: string
  sku?: string
}): Promise<{ success: boolean; error?: string; refundTrxId?: string }> {
  try {
    const result = await bkashRefundPayment({
      paymentId: input.paymentId,
      trxId: input.trxId,
      amount: input.amount,
      reason: input.reason,
      sku: input.sku,
    })

    return { success: true, refundTrxId: result.refundTrxId }
  } catch (error) {
    return {
      success: false,
      error: error instanceof BkashApiError ? error.statusMessage || error.message : 'Failed to refund payment.',
    }
  }
}
