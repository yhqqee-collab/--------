import { ChevronRight, StickyNote } from 'lucide-react'
import { CATEGORIES, eventsOn, type CalendarEvent } from './calendar-data'
import { eventTimeLabel, longDate, sameDay } from './calendar-utils'

type DayAgendaProps = {
  date: Date
  today: Date
  onSelect: (event: CalendarEvent) => void
}

export function DayAgenda({ date, today, onSelect }: DayAgendaProps) {
  const events = eventsOn(date)
  const isToday = sameDay(date, today)

  return (
    <div className="border-t border-black/10 bg-white px-4 pb-6 pt-3">
      <h3 className="flex items-baseline gap-2 text-[15px] font-semibold tracking-tight text-black">
        {longDate(date)}
        {isToday && <span className="text-[13px] font-semibold text-[#FF3B30]">오늘</span>}
      </h3>

      {events.length === 0 ? (
        <p className="py-6 text-center text-[14px] text-black/40">이벤트 없음</p>
      ) : (
        <ul className="mt-2 flex flex-col">
          {events.map((event) => {
            const { color } = CATEGORIES[event.category]
            return (
              <li key={event.id}>
                <button
                  type="button"
                  onClick={() => onSelect(event)}
                  className="flex w-full items-center gap-3 rounded-[10px] py-[9px] pr-1 text-left transition-colors active:bg-black/5"
                >
                  <span
                    className="h-[38px] w-[4px] shrink-0 rounded-full"
                    style={{ background: color }}
                    aria-hidden
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5">
                      <span className="truncate text-[15px] font-medium leading-tight text-black">
                        {event.title}
                      </span>
                      {event.memo && (
                        <StickyNote className="size-[13px] shrink-0 text-black/35" aria-label="메모 있음" />
                      )}
                    </span>
                    <span className="mt-[3px] block text-[13px] leading-tight text-black/50">
                      {eventTimeLabel(event)}
                    </span>
                  </span>
                  <ChevronRight className="size-4 shrink-0 text-black/25" aria-hidden />
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
