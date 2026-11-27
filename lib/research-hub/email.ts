import {
  createBrevoClient,
  createSendSmtpEmail,
  requireBrevoApiKey,
  resolveBaseUrl,
  resolveSender,
  validateAndNormalizeEmail,
} from '@/lib/email/shared'
import { SITE_CONFIG } from '@/lib/site-config'
import { formatRange } from './shared'
import type { ResearchHubBooking } from './store'

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/** Public pass page with QR code; token keeps it private to the booker. */
export function researchHubPassUrl(booking: Pick<ResearchHubBooking, 'code' | 'manageToken' | 'locale'>): string {
  const prefix = booking.locale === 'bn' ? '/bn' : ''
  return `${resolveBaseUrl()}${prefix}/research-hub/booking/${encodeURIComponent(booking.code)}?t=${booking.manageToken}`
}

export function formatBookingDate(date: string): string {
  const [y, m, d] = date.split('-').map(Number)
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(y, m - 1, d)))
}

function row(label: string, value: string): string {
  return `<tr>
    <td style="padding:8px 0;color:#6b7280;font-size:14px;width:40%;vertical-align:top;">${escapeHtml(label)}</td>
    <td style="padding:8px 0;color:#111827;font-size:14px;font-weight:600;">${escapeHtml(value)}</td>
  </tr>`
}

function buildHtml(booking: ResearchHubBooking, location: string): string {
  const passUrl = researchHubPassUrl(booking)
  const rows = [
    row('Booking code', booking.code),
    row('Date', formatBookingDate(booking.date)),
    row('Time', formatRange(booking.startHour, booking.hours)),
    row('People', String(booking.persons)),
    row('Amount paid', `৳${(booking.amountPaid ?? booking.amount).toLocaleString('en-US')}`),
    booking.trxId ? row('bKash TrxID', booking.trxId) : '',
    location ? row('Location', location) : '',
  ].join('')

  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Research Hub booking ${escapeHtml(booking.code)}</title></head>
<body style="margin:0;padding:0;background:#f5f7fa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:#374151;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;background:#f5f7fa;"><tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border-radius:16px;overflow:hidden;">
  <tr><td style="background:#1f3a6f;padding:32px 32px 24px;text-align:center;">
    <h1 style="margin:0 0 8px;color:#fff;font-size:26px;">Your Research Hub seat is booked</h1>
    <p style="margin:0;color:rgba(255,255,255,.85);font-size:15px;">${escapeHtml(SITE_CONFIG.name)} Research Hub</p>
  </td></tr>
  <tr><td style="padding:32px;">
    <p style="margin:0 0 20px;font-size:16px;">Hi <strong>${escapeHtml(booking.name)}</strong>, your payment is complete and your slot is confirmed.</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #e5e7eb;border-bottom:1px solid #e5e7eb;margin-bottom:24px;">${rows}</table>
    <p style="margin:0 0 24px;text-align:center;">
      <a href="${passUrl}" style="display:inline-block;background:#1f3a6f;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;">View my pass (QR code)</a>
    </p>
    <p style="margin:0 0 8px;font-size:14px;"><strong>When you arrive:</strong> show your booking code or QR pass at the front desk. Seating, kits and components are included in your booking.</p>
    <p style="margin:0 0 8px;font-size:14px;">Please arrive on time. Your slot ends at ${escapeHtml(formatRange(booking.startHour, booking.hours).split('–')[1])}.</p>
    <p style="margin:16px 0 0;font-size:13px;color:#6b7280;">Need to change something? Contact us at ${escapeHtml(SITE_CONFIG.email)} or ${escapeHtml(SITE_CONFIG.phone)} with your booking code.</p>
  </td></tr>
</table></td></tr></table></body></html>`
}

export async function sendResearchHubConfirmationEmail(
  booking: ResearchHubBooking,
  location: string,
): Promise<{ success: boolean; error?: string }> {
  const emailCheck = validateAndNormalizeEmail(booking.email)
  if (!emailCheck.ok) return { success: false, error: emailCheck.error }
  const keyCheck = requireBrevoApiKey()
  if (!keyCheck.ok) return { success: false, error: keyCheck.error }

  try {
    const { senderEmail, senderName } = resolveSender()
    const api = createBrevoClient()
    const message = createSendSmtpEmail({
      senderEmail,
      senderName,
      toEmail: emailCheck.email,
      toName: booking.name,
      subject: `Research Hub booking confirmed: ${formatBookingDate(booking.date)}, ${formatRange(booking.startHour, booking.hours)} (${booking.code})`,
      htmlContent: buildHtml(booking, location),
    })
    await api.sendTransacEmail(message)
    return { success: true }
  } catch (error) {
    console.error('[research-hub] confirmation email failed', { code: booking.code, error })
    return { success: false, error: error instanceof Error ? error.message : 'Email failed' }
  }
}
