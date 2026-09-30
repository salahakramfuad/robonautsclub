import Link from 'next/link'
import { AlertTriangle, CheckCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

type SuccessPageProps = {
  searchParams: Promise<{
    bookingId?: string
    registrationDocId?: string
    registrationId?: string
    source?: string
    emailSent?: string
    emailWarning?: string
  }>
}

export default async function BkashSuccessPage({ searchParams }: SuccessPageProps) {
  const params = await searchParams
  const bookingId = params.bookingId || ''
  const registrationId = params.registrationId || ''
  const isRobofest = params.source === 'robofest'
  const emailSent = params.emailSent !== '0'
  const emailWarning = params.emailWarning?.trim() || ''

  return (
    <main className="min-h-[60vh] flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-2xl border-2 border-green-200 shadow-lg">
        <CardContent className="p-8">
          <h1 className="text-2xl font-bold text-green-700 mb-3">Payment Successful</h1>
          <Alert className="mb-4 border-green-200 bg-green-50">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <AlertTitle className="text-green-900">
              Registration Confirmed
            </AlertTitle>
            <AlertDescription className="text-green-800 space-y-2">
              {isRobofest ? (
                <>
                  <p>
                    Your payment is completed and your registration for RoboFest
                    Bangladesh 2026 is officially confirmed.
                  </p>
                  {emailSent && !emailWarning ? (
                    <p>
                      A confirmation email has been sent to all team members with
                      your team details, along with a PDF of your registration.
                    </p>
                  ) : null}
                  <p className="font-medium text-green-900">
                    You can safely leave this page once you have noted your
                    Registration ID below.
                  </p>
                </>
              ) : (
                <p>
                  Your payment is completed and your event registration is now
                  confirmed. A confirmation email has been sent to your email
                  address with all details.
                </p>
              )}
            </AlertDescription>
          </Alert>
          {isRobofest && (!emailSent || emailWarning) ? (
            <Alert className="mb-4 border-amber-200 bg-amber-50">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <AlertTitle className="text-amber-900">
                {emailSent
                  ? 'Email delivery incomplete'
                  : 'Confirmation email not sent'}
              </AlertTitle>
              <AlertDescription className="text-amber-900 space-y-2">
                <p>
                  {emailWarning ||
                    'We could not send the confirmation email automatically. Your registration and payment are still valid.'}
                </p>
                <p>
                  Please check spam/junk folders, or contact support with your
                  Registration ID so we can resend the confirmation.
                </p>
              </AlertDescription>
            </Alert>
          ) : null}
          {registrationId ? (
            <p className="text-sm text-gray-500 mb-2">
              Registration ID: <span className="font-mono font-semibold">{registrationId}</span>
            </p>
          ) : null}
          {bookingId && !isRobofest ? (
            <p className="text-sm text-gray-500 mb-6">Booking ID: {bookingId}</p>
          ) : (
            <div className="mb-6" />
          )}
          <Button asChild className="bg-indigo-600 hover:bg-indigo-700 text-white">
            <Link href={isRobofest ? '/robofest' : '/events'} prefetch={false}>
              {isRobofest ? 'Back to Robofest' : 'Back to Events'}
            </Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  )
}
