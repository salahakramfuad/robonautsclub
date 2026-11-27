'use client'

import { useId, useMemo, useRef, useState } from 'react'
import { Check } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { findInstitutionMatches as findMatches, normalizeInstitution as normalize } from '@/lib/institution-match'

const MIN_CHARS = 2

type Props = {
  id: string
  value: string
  onChange: (value: string) => void
  options: string[]
  placeholder?: string
  /** Shown under the list when nothing matches. */
  noMatchText: string
  /** Shown next to the field when the value is a name from the list. */
  matchedText: string
  listLabel: string
}

export default function InstitutionAutocomplete({
  id,
  value,
  onChange,
  options,
  placeholder,
  noMatchText,
  matchedText,
  listLabel,
}: Props) {
  const listId = useId()
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)

  const matches = useMemo(() => findMatches(value, options), [value, options])
  const exact = useMemo(() => {
    const n = normalize(value)
    return n ? options.find((o) => normalize(o) === n) : undefined
  }, [value, options])
  const showList = open && normalize(value).length >= MIN_CHARS && !(exact && matches.length === 1)

  function choose(name: string) {
    onChange(name)
    setOpen(false)
    setActive(-1)
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!showList || matches.length === 0) {
      if (e.key === 'ArrowDown') setOpen(true)
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((i) => (i + 1) % matches.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((i) => (i <= 0 ? matches.length - 1 : i - 1))
    } else if (e.key === 'Enter' && active >= 0) {
      e.preventDefault()
      choose(matches[active].name)
    } else if (e.key === 'Escape') {
      setOpen(false)
      setActive(-1)
    }
  }

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        id={id}
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={showList}
        aria-controls={listId}
        aria-activedescendant={showList && active >= 0 ? `${listId}-${active}` : undefined}
        autoComplete="off"
        placeholder={placeholder}
        value={value}
        className={cn(exact && 'pr-9')}
        onChange={(e) => {
          onChange(e.target.value)
          setOpen(true)
          setActive(-1)
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={onKeyDown}
      />
      {exact ? (
        <Check
          className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-emerald-600"
          aria-label={matchedText}
        />
      ) : null}

      {showList ? (
        <div className="absolute inset-x-0 top-full z-30 mt-1 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
          {matches.length > 0 ? (
            <ul id={listId} role="listbox" aria-label={listLabel} className="max-h-72 overflow-y-auto py-1">
              {matches.map((m, i) => (
                <li
                  key={m.name}
                  id={`${listId}-${i}`}
                  role="option"
                  aria-selected={i === active}
                  // mousedown (not click) so the choice lands before the input blurs.
                  onMouseDown={(e) => {
                    e.preventDefault()
                    choose(m.name)
                  }}
                  onMouseEnter={() => setActive(i)}
                  className={cn(
                    'cursor-pointer px-3 py-2 text-sm text-slate-800',
                    i === active && 'bg-sky-50 text-slate-950',
                  )}
                >
                  {m.start >= 0 ? (
                    <>
                      {m.name.slice(0, m.start)}
                      <strong className="font-semibold text-slate-950">{m.name.slice(m.start, m.end)}</strong>
                      {m.name.slice(m.end)}
                    </>
                  ) : (
                    m.name
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p id={listId} className="px-3 py-2.5 text-sm text-slate-500">
              {noMatchText}
            </p>
          )}
        </div>
      ) : null}
    </div>
  )
}
