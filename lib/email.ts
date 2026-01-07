import { Resend } from 'resend'
import type { Event } from '@/types/event'
import { format } from 'date-fns'

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY)

interface BookingConfirmationEmailProps {
  to: string
  name: string
  event: Event
  bookingDetails: {
    school: string
    information: string
  }
}

/**
 * Send booking confirmation email with event details
 */
export async function sendBookingConfirmationEmail({
  to,
  name,
  event,
  bookingDetails,
}: BookingConfirmationEmailProps): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if Resend API key is configured
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not configured')
      return {
        success: false,
        error: 'Email service is not configured',
      }
    }

    // Format event date
    const eventDate = event.date ? new Date(event.date) : null
    const formattedDate = eventDate ? format(eventDate, 'MMMM d, yyyy') : 'TBA'

    // Create email HTML content
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Confirmation - ${event.title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px; text-align: center;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 30px 30px; background: linear-linear(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Booking Confirmed!</h1>
              <p style="margin: 10px 0 0; color: #e0e7ff; font-size: 16px;">Thank you for registering</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 30px;">
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                Dear <strong>${name}</strong>,
              </p>
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                We're excited to confirm your booking for <strong>${event.title}</strong>! Your registration has been successfully received.
              </p>
              
              <!-- Event Details Card -->
              <div style="background-color: #f9fafb; border-left: 4px solid #667eea; padding: 20px; margin: 25px 0; border-radius: 8px;">
                <h2 style="margin: 0 0 15px; color: #111827; font-size: 22px; font-weight: 600;">Event Details</h2>
                
                <table role="presentation" style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px; width: 120px;">Event Name:</td>
                    <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600;">${event.title}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Date:</td>
                    <td style="padding: 8px 0; color: #111827; font-size: 14px;">${formattedDate}</td>
                  </tr>
                  ${event.time ? `
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Time:</td>
                    <td style="padding: 8px 0; color: #111827; font-size: 14px;">${event.time}</td>
                  </tr>
                  ` : ''}
                  ${event.venue || event.location ? `
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Venue:</td>
                    <td style="padding: 8px 0; color: #111827; font-size: 14px;">${event.venue || event.location}</td>
                  </tr>
                  ` : ''}
                  ${event.eligibility ? `
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Eligibility:</td>
                    <td style="padding: 8px 0; color: #111827; font-size: 14px;">${event.eligibility}</td>
                  </tr>
                  ` : ''}
                </table>
              </div>
              
              ${event.description ? `
              <div style="margin: 25px 0;">
                <h3 style="margin: 0 0 10px; color: #111827; font-size: 18px; font-weight: 600;">About the Event</h3>
                <p style="margin: 0; color: #374151; font-size: 15px; line-height: 1.6;">
                  ${event.fullDescription || event.description}
                </p>
              </div>
              ` : ''}
              
              ${event.agenda ? `
              <div style="margin: 25px 0;">
                <h3 style="margin: 0 0 10px; color: #111827; font-size: 18px; font-weight: 600;">Agenda</h3>
                <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px;">
                  <p style="margin: 0; color: #374151; font-size: 15px; line-height: 1.8; white-space: pre-line;">${event.agenda}</p>
                </div>
              </div>
              ` : ''}
              
              <!-- Booking Information -->
              <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; padding: 20px; margin: 25px 0; border-radius: 8px;">
                <h3 style="margin: 0 0 15px; color: #1e40af; font-size: 18px; font-weight: 600;">Your Booking Information</h3>
                <table role="presentation" style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 6px 0; color: #6b7280; font-size: 14px; width: 120px;">Name:</td>
                    <td style="padding: 6px 0; color: #111827; font-size: 14px; font-weight: 500;">${name}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #6b7280; font-size: 14px;">School:</td>
                    <td style="padding: 6px 0; color: #111827; font-size: 14px; font-weight: 500;">${bookingDetails.school}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #6b7280; font-size: 14px;">Email:</td>
                    <td style="padding: 6px 0; color: #111827; font-size: 14px; font-weight: 500;">${to}</td>
                  </tr>
                </table>
              </div>
              
              <p style="margin: 25px 0 0; color: #374151; font-size: 15px; line-height: 1.6;">
                We look forward to seeing you at the event! If you have any questions or need to make changes to your booking, please don't hesitate to contact us.
              </p>
              
              <p style="margin: 20px 0 0; color: #374151; font-size: 15px; line-height: 1.6;">
                Best regards,<br>
                <strong style="color: #667eea;">Robonauts Club Team</strong>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 20px 30px; background-color: #f9fafb; border-radius: 0 0 12px 12px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px; color: #6b7280; font-size: 12px;">
                This is an automated confirmation email. Please do not reply to this email.
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 11px;">
                © ${new Date().getFullYear()} Robonauts Club. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `

    // Determine the "from" email address
    // Priority:
    // 1. Use RESEND_FROM_EMAIL if set (must be from a verified domain)
    // 2. Fallback to a default that should work (user needs to verify domain in Resend)
    let fromEmail = process.env.RESEND_FROM_EMAIL
    
    // If no custom from email is set, use a default
    // NOTE: For production, you should verify your domain in Resend dashboard
    // and set RESEND_FROM_EMAIL to use your verified domain
    if (!fromEmail) {
      // Default fallback - user should verify their domain in Resend
      // or set RESEND_FROM_EMAIL to a verified domain
      fromEmail = 'Robonauts Club <noreply@robonautsclub.com>'
    }

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [to],
      subject: `Booking Confirmation: ${event.title}`,
      html: emailHtml,
    })

    if (error) {
      console.error('Resend email error:', error)
      
      // Provide more specific error messages based on error type
      if (error.message?.includes('domain is not verified') || error.message?.includes('not verified')) {
        return {
          success: false,
          error: 'Email domain not verified. Please verify your domain at https://resend.com/domains or contact support.',
        }
      }
      
      // Handle other Resend API errors
      if (error.statusCode === 403) {
        return {
          success: false,
          error: 'Email service access denied. Please check your Resend API key and domain verification.',
        }
      }
      
      if (error.statusCode === 422) {
        return {
          success: false,
          error: 'Invalid email configuration. Please check your RESEND_FROM_EMAIL setting.',
        }
      }
      
      return {
        success: false,
        error: error.message || 'Failed to send confirmation email. Please try again later.',
      }
    }

    if (!data || !data.id) {
      console.error('Resend returned no data or email ID')
      return {
        success: false,
        error: 'Email service returned an unexpected response',
      }
    }

    console.log('Booking confirmation email sent successfully:', data.id)
    return {
      success: true,
    }
  } catch (error) {
    console.error('Error sending booking confirmation email:', error)
    return {
      success: false,
      error: 'An unexpected error occurred while sending the email',
    }
  }
}

