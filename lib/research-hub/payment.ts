/**
 * Research Hub bKash checkout lifecycle. Server-only helpers — deliberately NOT
 * in a 'use server' file, so none of these are callable from the browser.
 *
 * held (seats reserved 15 min) ──bKash success──▶ confirmed
 *     └──cancel / failure / no payment──▶ cancelled (or lapses → seats free)
 */
import {
  BkashApiError,
  bkashCreateCheckout,
  bkashExecutePayment,
  bkashQueryPayment,
  bkashRefundPayment,
  type BkashExecuteResult,
} from '@/lib/bkash'
import { collectionGet, collectionSet } from '@/lib/db/collections'
import { createNotification } from '@/lib/notifications'
import { SITE_CONFIG, resolvePublicBaseUrl } from '@/lib/site-config'
import { sendResearchHubConfirmationEmail } from './email'
import { formatRange } from './shared'
import {
  attachPaymentId,
  confirmHeldBooking,
  extendLiveHold,
  getBookingById,
  getResearchHubSettings,
  markRefunded,
  reclaimHold,
  releaseHold,
  type ResearchHubBooking,
} from './store'

export const RESEARCH_HUB_PENDING_KIND = 'researchHub'

type PendingResearchHub = {
  kind: typeof RESEARCH_HUB_PENDING_KIND
  paymentId: string
  bookingId: string
  amount: number
  status: 'pending' | 'completed' | 'failed' | 'cancelled'
  createdAt: string
  updatedAt: string
}

export type FinalizeResult =
  | { success: true; booking: ResearchHubBooking; emailSent: boolean }
  | {
      success: false
      /** Machine-readable reason for the result page. */
      reason: 'notFound' | 'slotTaken' | 'paymentFailed' | 'refunded' | 'error'
      error: string
      code?: string
    }

async function mergePending(paymentId: string, patch: Partial<PendingResearchHub>) {
  await collectionSet(
    'bkash_pending_registrations',
    paymentId,
    { ...patch, updatedAt: new Date().toISOString() },
    { merge: true },
  )
}

/** Start bKash checkout for a freshly created `held` booking. Releases the hold on failure. */
export async function startResearchHubCheckout(booking: ResearchHubBooking): Promise<string> {
  try {
    const checkout = await bkashCreateCheckout({
      amount: booking.amount,
      payerReference: booking.phone,
      callbackUrl: `${resolvePublicBaseUrl()}/api/payments/bkash/success`,
      merchantInvoiceNumber: booking.code.slice(0, 40),
    })
    const now = new Date().toISOString()
    const pending: PendingResearchHub = {
      kind: RESEARCH_HUB_PENDING_KIND,
      paymentId: checkout.paymentId,
      bookingId: booking.id,
      amount: booking.amount,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    }
    await collectionSet('bkash_pending_registrations', checkout.paymentId, pending)
    await attachPaymentId(booking.id, checkout.paymentId)
    return checkout.checkoutUrl
  } catch (error) {
    await releaseHold(booking.id).catch(() => {})
    throw error
  }
}

export async function getResearchHubPending(paymentId: string): Promise<PendingResearchHub | null> {
  if (!paymentId) return null
  const doc = await collectionGet('bkash_pending_registrations', paymentId)
  if (!doc || doc.kind !== RESEARCH_HUB_PENDING_KIND) return null
  return doc as unknown as PendingResearchHub
}

/** bKash reported cancel/failure: free the seats (only if still unpaid). */
export async function releaseResearchHubCheckout(pending: PendingResearchHub): Promise<void> {
  if (pending.status === 'completed') return
  await releaseHold(pending.bookingId)
  await mergePending(pending.paymentId, { status: 'cancelled' })
}

async function executeOrQuery(paymentId: string): Promise<BkashExecuteResult> {
  try {
    return await bkashExecutePayment(paymentId)
  } catch (executeError) {
    // Query only when execute gave no response, or when a repeat execute is rejected
    // because the payment was already executed by an earlier callback.
    const queried = await bkashQueryPayment(paymentId).catch(() => null)
    if (queried && queried.transactionStatus.toLowerCase() === 'completed') return queried
    throw executeError
  }
}

async function refundAndCancel(
  booking: ResearchHubBooking,
  execution: BkashExecuteResult,
  reason: string,
): Promise<FinalizeResult> {
  const amount = execution.amount || booking.amount
  try {
    const refund = await bkashRefundPayment({
      paymentId: execution.paymentId,
      trxId: execution.trxId,
      amount,
      reason: reason.slice(0, 255),
      sku: 'research-hub',
    })
    await markRefunded(booking.id, refund.refundTrxId, `Auto-refunded: ${reason}`)
    await mergePending(execution.paymentId, { status: 'failed' })
    return { success: false, reason: 'refunded', error: reason, code: booking.code }
  } catch (refundError) {
    console.error('[research-hub] AUTO-REFUND FAILED — manual refund needed', {
      code: booking.code,
      paymentId: execution.paymentId,
      trxId: execution.trxId,
      refundError,
    })
    await markRefunded(
      booking.id,
      null,
      `REFUND NEEDED: paid ${amount} (TrxID ${execution.trxId}) but ${reason}`,
    ).catch(() => {})
    await mergePending(execution.paymentId, { status: 'failed' })
    return {
      success: false,
      reason: 'error',
      error: `${reason} Your payment (TrxID ${execution.trxId}) will be refunded by our team — please contact us with booking code ${booking.code}.`,
      code: booking.code,
    }
  }
}

/** bKash reported success: re-check seats, execute payment, confirm, email. Idempotent. */
export async function finalizeResearchHubPayment(pending: PendingResearchHub): Promise<FinalizeResult> {
  const booking = await getBookingById(pending.bookingId)
  if (!booking) {
    return { success: false, reason: 'notFound', error: 'Booking not found for this payment.' }
  }

  // Repeat callback after success.
  if (['confirmed', 'checked_in', 'completed'].includes(booking.status)) {
    return { success: true, booking, emailSent: true }
  }
  if (booking.status === 'cancelled' || booking.status === 'no_show') {
    return {
      success: false,
      reason: 'paymentFailed',
      error: 'This booking was cancelled. You have not been charged.',
      code: booking.code,
    }
  }

  const settings = await getResearchHubSettings()

  // Secure the seats *before* executing: extend a live hold so it can't lapse during
  // the execute call, or re-take lapsed seats if they're still free. A full slot is
  // never charged.
  const secured =
    (await extendLiveHold(booking.id)) || (await reclaimHold(booking, settings.seatsPerHour))
  if (!secured) {
    await releaseHold(booking.id)
    await mergePending(pending.paymentId, { status: 'failed' })
    return {
      success: false,
      reason: 'slotTaken',
      error: 'Your seat hold expired and the slot filled up before payment finished. You have not been charged.',
      code: booking.code,
    }
  }

  let execution: BkashExecuteResult
  try {
    execution = await executeOrQuery(pending.paymentId)
  } catch (error) {
    console.error('[research-hub] bKash execute failed', { code: booking.code, error })
    await releaseHold(booking.id)
    await mergePending(pending.paymentId, { status: 'failed' })
    return {
      success: false,
      reason: 'paymentFailed',
      error:
        error instanceof BkashApiError
          ? error.statusMessage || error.message
          : 'Failed to complete payment with bKash.',
      code: booking.code,
    }
  }

  const paid = execution.amount || 0
  if (paid + 0.01 < booking.amount) {
    return refundAndCancel(booking, execution, `Paid amount ${paid} is less than the booking total ${booking.amount}.`)
  }

  const confirmed = await confirmHeldBooking(booking.id, {
    paymentId: execution.paymentId,
    trxId: execution.trxId,
    amountPaid: paid || booking.amount,
  })
  if (!confirmed) {
    const latest = await getBookingById(booking.id)
    if (latest && ['confirmed', 'checked_in', 'completed'].includes(latest.status)) {
      return { success: true, booking: latest, emailSent: true }
    }
    return refundAndCancel(booking, execution, 'The slot is no longer available.')
  }

  await mergePending(pending.paymentId, { status: 'completed' })
  const finalBooking = (await getBookingById(booking.id)) ?? booking
  const email = await sendResearchHubConfirmationEmail(finalBooking, settings.location || SITE_CONFIG.location)

  await createNotification(
    'research_hub_booking',
    `New Research Hub booking ${finalBooking.code}: ${finalBooking.name}, ${finalBooking.persons} ${finalBooking.persons === 1 ? 'person' : 'people'}, ${finalBooking.date} ${formatRange(finalBooking.startHour, finalBooking.hours)}`,
    { uid: 'system', name: 'Research Hub', email: '', emailVerified: true, role: 'superAdmin', permissions: [] },
  )

  return { success: true, booking: finalBooking, emailSent: email.success }
}
