import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export type BreadcrumbItem = {
  name: string
  href?: string
}

type Props = {
  items: BreadcrumbItem[]
  className?: string
  /** Lighter text for dark heroes */
  tone?: 'default' | 'onDark'
}

export default function Breadcrumbs({ items, className, tone = 'default' }: Props) {
  if (items.length === 0) return null

  return (
    <nav aria-label="Breadcrumb" className={cn('mb-4', className)}>
      <ol className="m-0 flex list-none flex-wrap items-center gap-1.5 p-0 text-sm">
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          return (
            <li key={`${item.name}-${index}`} className="flex items-center gap-1.5">
              {index > 0 ? (
                <ChevronRight
                  className={cn(
                    'size-3.5 shrink-0',
                    tone === 'onDark' ? 'text-white/50' : 'text-gray-400',
                  )}
                  aria-hidden
                />
              ) : null}
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  prefetch={false}
                  className={cn(
                    'font-medium transition-colors',
                    tone === 'onDark'
                      ? 'text-sky-200 hover:text-white'
                      : 'text-indigo-600 hover:text-indigo-800',
                  )}
                >
                  {item.name}
                </Link>
              ) : (
                <span
                  className={cn(
                    'font-medium',
                    tone === 'onDark' ? 'text-white/90' : 'text-gray-700',
                  )}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.name}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
