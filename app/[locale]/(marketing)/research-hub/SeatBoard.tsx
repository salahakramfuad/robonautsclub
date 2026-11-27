import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/utils'
import type { DayAvailability } from '@/lib/research-hub/shared'

/** Seats are drawn one block each up to this capacity; above it, as a bar. */
const MAX_SEAT_BLOCKS = 20

export default async function SeatBoard({
  day,
  isToday,
  dateLabel,
  locale,
}: {
  day: DayAvailability
  isToday: boolean
  dateLabel: string
  locale: string
}) {
  const t = await getTranslations('researchHub.board')
  const num = new Intl.NumberFormat(locale === 'bn' ? 'bn-BD' : 'en-US')
  const hourFmt = new Intl.DateTimeFormat(locale === 'bn' ? 'bn-BD' : 'en-US', { hour: 'numeric', timeZone: 'UTC' })
  const hourLabel = (h: number) => hourFmt.format(new Date(Date.UTC(2000, 0, 1, h % 24)))
  const blocks = day.capacity <= MAX_SEAT_BLOCKS

  return (
    <div className="min-w-0 rounded-2xl bg-white/[0.06] p-5 ring-1 ring-white/15 backdrop-blur-sm sm:p-6">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-lg font-semibold">{isToday ? t('today') : t('onDate', { date: dateLabel })}</h2>
        <span className="flex items-center gap-1.5 text-xs text-white/60">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-60 motion-reduce:hidden" />
            <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
          </span>
          {isToday ? dateLabel : null}
        </span>
      </div>

      {day.hours.length === 0 ? (
        <p className="mt-6 text-white/70">{t('closedToday')}</p>
      ) : (
        <ol className="mt-5 space-y-1">
          {day.hours.map((slot) => {
            const taken = day.capacity - slot.seatsLeft
            const full = slot.seatsLeft === 0
            const row = (
              <>
                <span className="w-14 shrink-0 text-sm tabular-nums text-white/80">{hourLabel(slot.hour)}</span>
                <span className="flex min-w-0 flex-1 items-center" aria-hidden>
                  {blocks ? (
                    <span className="flex flex-1 gap-[3px]">
                      {Array.from({ length: day.capacity }, (_, i) => (
                        <span
                          key={i}
                          className={cn(
                            'h-3.5 flex-1 rounded-[3px]',
                            i < taken ? 'bg-white/15' : slot.bookable ? 'bg-sky-400' : 'bg-white/25',
                          )}
                        />
                      ))}
                    </span>
                  ) : (
                    <span className="h-3.5 flex-1 overflow-hidden rounded bg-white/15">
                      <span
                        className={cn('block h-full', slot.bookable ? 'bg-sky-400' : 'bg-white/25')}
                        style={{ width: `${(slot.seatsLeft / Math.max(1, day.capacity)) * 100}%` }}
                      />
                    </span>
                  )}
                </span>
                <span
                  className={cn(
                    'w-24 shrink-0 text-right text-sm tabular-nums',
                    !slot.bookable ? 'text-white/45' : full ? 'text-white/45' : slot.seatsLeft <= 2 ? 'font-semibold text-amber-300' : 'text-white',
                  )}
                >
                  {slot.bookable || full ? t('free', { count: slot.seatsLeft }) : t('notBookable')}
                </span>
              </>
            )
            return (
              <li key={slot.hour}>
                {slot.bookable ? (
                  <Link
                    href={`/research-hub?date=${day.date}&start=${slot.hour}#book`}
                    className="-mx-2 flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-white/10 focus-visible:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
                    aria-label={`${hourLabel(slot.hour)}: ${t('free', { count: slot.seatsLeft })} ${t('of', { capacity: num.format(day.capacity) })}`}
                  >
                    {row}
                  </Link>
                ) : (
                  <div className="-mx-2 flex items-center gap-3 px-2 py-1.5 opacity-70">{row}</div>
                )}
              </li>
            )
          })}
        </ol>
      )}
      <p className="mt-4 text-xs text-white/55">{t('note')}</p>
    </div>
  )
}
