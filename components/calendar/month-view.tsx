import { cn } from '@/lib/utils'
import { CATEGORIES, eventsOn, MONTH, YEAR, type CalendarEvent } from './calendar-data'
import { sameDay, WEEKDAYS } from './calendar-utils'
import { DayAgenda } from './day-agenda'

type MonthViewProps = {
  month?: number
  selected: Date
  today: Date
  onSelectDate: (date: Date) => void
  onSelectEvent: (event: CalendarEvent) => void
}

export function MonthView({ month = MONTH, selected, today, onSelectDate, onSelectEvent }: MonthViewProps) {
  const first = new Date(YEAR, month, 1)
  const offset = (first.getDay() + 6) % 7
  const daysInMonth = new Date(YEAR, month + 1, 0).getDate()
  const cells: (Date | null)[] = [
    ...Array.from({ length: offset }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(YEAR, month, i + 1)),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  const weeks = Array.from({ length: cells.length / 7 }, (_, i) => cells.slice(i * 7, i * 7 + 7))

  return (
    <div className="flex flex-col">
      <div className="grid grid-cols-7 px-2 pb-1.5" aria-hidden>
        {WEEKDAYS.map((d, i) => (
          <span
            key={d}
            className={cn('text-center text-[11px] font-medium', i >= 5 ? 'text-black/35' : 'text-black/60')}
          >
            {d}
          </span>
        ))}
      </div>

      <div role="grid" aria-label={`${YEAR}년 ${month + 1}월`} className="px-2 pb-2">
        {weeks.map((week, wi) => (
          <div key={wi} role="row" className="grid grid-cols-7 border-t border-black/[0.08]">
            {week.map((date, di) => {
              if (!date) return <span key={di} role="gridcell" className="h-[52px]" />

              const events = eventsOn(date)
              const isToday = sameDay(date, today)
              const isSelected = sameDay(date, selected)
              const weekend = di >= 5

              return (
                <button
                  key={di}
                  type="button"
                  role="gridcell"
                  aria-selected={isSelected}
                  aria-label={`${date.getMonth() + 1}월 ${date.getDate()}일, 이벤트 ${events.length}개`}
                  onClick={() => onSelectDate(date)}
                  className={cn(
                    'flex h-[72px] min-w-0 flex-col items-center gap-[3px] px-[1.5px] pt-[4px] transition-colors active:bg-black/5',
                    isSelected && 'bg-black/[0.035]',
                  )}
                >
                  <span
                    className={cn(
                      'flex size-[24px] shrink-0 items-center justify-center rounded-full text-[14px] tabular-nums leading-none',
                      isSelected && isToday && 'bg-[#FF3B30] font-semibold text-white',
                      isSelected && !isToday && 'bg-black font-semibold text-white',
                      !isSelected && isToday && 'font-semibold text-[#FF3B30]',
                      !isSelected && !isToday && (weekend ? 'text-black/45' : 'text-black'),
                    )}
                  >
                    {date.getDate()}
                  </span>
                  <span className="flex w-full min-w-0 flex-col gap-[2px]" aria-hidden>
                    {events.slice(0, 3).map((e) => {
                      const { bg, text } = CATEGORIES[e.category]
                      return (
                        <span
                          key={e.id}
                          className="block truncate rounded-[3px] px-[2px] py-[1.5px] text-center text-[8px] font-semibold leading-[10px]"
                          style={{ background: bg, color: text }}
                        >
                          {e.short ?? e.title}
                        </span>
                      )
                    })}
                  </span>
                </button>
              )
            })}
          </div>
        ))}
      </div>

      <DayAgenda date={selected} today={today} onSelect={onSelectEvent} />
    </div>
  )
}
