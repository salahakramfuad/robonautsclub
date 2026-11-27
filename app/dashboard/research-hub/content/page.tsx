import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { requireCreateOrEdit } from '@/lib/auth'
import { getResearchHubContent } from '@/lib/research-hub/store'
import ContentForm from './ContentForm'

export const dynamic = 'force-dynamic'

export default async function ResearchHubContentPage() {
  await requireCreateOrEdit('researchHub')
  const content = await getResearchHubContent()

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <div>
        <Link
          href="/dashboard/research-hub"
          className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900"
        >
          <ChevronLeft className="size-4" aria-hidden /> Research Hub
        </Link>
        <h2 className="mt-2 text-2xl font-bold text-slate-900">Public page content</h2>
        <p className="mt-1 text-sm text-slate-600">
          What visitors see on{' '}
          <Link href="/research-hub" target="_blank" className="text-sky-700 underline">
            /research-hub
          </Link>
          : photos of the space, the parts and kits you have, and your house rules. Empty sections fall back to the
          default text.
        </p>
      </div>
      <ContentForm initial={content} />
    </div>
  )
}
