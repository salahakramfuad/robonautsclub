'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Home, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-6 text-center">
        <h1 className="text-2xl font-semibold text-gray-800">Something went wrong</h1>
        <p className="text-sm text-gray-600">
          We could not load this page. Try again, or return home.
        </p>
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Button type="button" onClick={reset} className="gap-2">
            <RotateCcw className="size-4" />
            Try again
          </Button>
          <Button asChild variant="outline" className="gap-2">
            <Link href="/" prefetch={false}>
              <Home className="size-4" />
              Go Home
            </Link>
          </Button>
        </div>
      </div>
    </main>
  )
}
