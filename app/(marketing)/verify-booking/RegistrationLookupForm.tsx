import { Search } from 'lucide-react'

/** Plain GET form — works without JavaScript and keeps the lookup ID-only (no email search). */
export default function RegistrationLookupForm({ defaultValue = '' }: { defaultValue?: string }) {
  return (
    <form action="/verify-booking" method="get" className="space-y-3 text-left">
      <label htmlFor="registrationId" className="block text-sm font-semibold text-slate-800">
        Registration ID
      </label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          id="registrationId"
          name="registrationId"
          type="text"
          required
          defaultValue={defaultValue}
          placeholder="REG-20261127-ABCDE"
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          className="h-12 w-full rounded-xl border-2 border-slate-200 bg-white px-4 font-mono text-base tracking-wide text-slate-900 placeholder:text-slate-400 focus:border-[#1f3a6f] focus:outline-none focus:ring-2 focus:ring-[#1f3a6f]/20"
        />
        <button
          type="submit"
          className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#1f3a6f] px-5 font-semibold text-white transition hover:bg-[#14264a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f3a6f] focus-visible:ring-offset-2"
        >
          <Search className="size-4" aria-hidden />
          Find
        </button>
      </div>
    </form>
  )
}
