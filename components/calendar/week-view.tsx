'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { CATEGORIES, eventsOn, MONTH, YEAR, type CalendarEvent } from './calendar-data'
import { addDays, sameDay, startOfWeek, toMinutes, weekDays, WEEKDAYS } from './calendar-utils'

const FIRST_HOUR = 8
const LAST_HOUR = 23
const HOUR_HEIGHT = 46
const POINT_EVENT_MINUTES = 35
const FIRST_WEEK = startOfWeek(new Date(YEAR, MONTH, 1))
const LAST_WEEK = startOfWeek(new Date(YEAR, MONTH + 1, 0))

type WeekViewProps = {
  selected: Date
  today: Date
  onSelectDate: (date: Date) => void
  onSelectEvent: (event: CalendarEvent) => void
}

function hourLabel(h: number) {
  if (h === 12) return '정오'
  return `${h < 12 ? '오전' : '오후'} ${h % 12 === 0 ? 12 : h % 12}시`
}

export function WeekView({ selected, today, onSelectDate, onSelectEvent }: WeekViewProps) {
  const weekStart = startOfWeek(selected)
  const days = weekDays(weekStart)
  const weekEnd = days[6]
  const scrollRef = useRef<HTMLDivElement>(null)

  const canPrev = weekStart > FIRST_WEEK
  const canNext = weekStart < LAST_WEEK

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: (11.5 - FIRST_HOUR) * HOUR_HEIGHT })
  }, [])

  const rangeLabel =
    weekStart.getMonth() === weekEnd.getMonth()
      ? `${weekStart.getMonth() + 1}월 ${weekStart.getDate()}일 – ${weekEnd.getDate()}일`
      : `${weekStart.getMonth() + 1}월 ${weekStart.getDate()}일 – ${weekEnd.getMonth() + 1}월 ${weekEnd.getDate()}일`

  const hasAllDay = days.some((d) => eventsOn(d).some((e) => e.allDay))
  const hours = Array.from({ length: LAST_HOUR - FIRST_HOUR + 1 }, (_, i) => FIRST_HOUR + i)

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-3 pb-2">
        <button
          type="button"
          onClick={() => onSelectDate(addDays(selected, -7))}
          disabled={!canPrev}
          aria-label="이전 주"
          className="flex size-8 items-center justify-center rounded-full text-[#FF3B30] transition-opacity active:opacity-50 disabled:opacity-25"
        >
          <ChevronLeft className="size-5" strokeWidth={2.5} />
        </button>
        <span className="text-[14px] font-semibold tabular-nums text-black">{rangeLabel}</span>
        <button
          type="button"
          onClick={() => onSelectDate(addDays(selected, 7))}
          disabled={!canNext}
          aria-label="다음 주"
          className="flex size-8 items-center justify-center rounded-full text-[#FF3B30] transition-opacity active:opacity-50 disabled:opacity-25"
        >
          <ChevronRight className="size-5" strokeWidth={2.5} />
        </button>
      </div>

      <div className="flex border-b border-black/10 pb-2 pl-[42px] pr-1">
        {days.map((d, i) => {
          const isToday = sameDay(d, today)
          const isSelected = sameDay(d, selected)
          const inMonth = d.getMonth() === MONTH
          return (
            <button
              key={i}
              type="button"
              onClick={() => onSelectDate(d)}
              aria-pressed={isSelected}
              aria-label={`${d.getMonth() + 1}월 ${d.getDate()}일`}
              className="flex flex-1 flex-col items-center gap-[3px] transition-opacity active:opacity-60"
            >
              <span className={cn('text-[10.5px] font-medium', i >= 5 ? 'text-black/35' : 'text-black/55')}>
                {WEEKDAYS[i]}
              </span>
              <span
                className={cn(
                  'flex size-[26px] items-center justify-center rounded-full text-[14.5px] tabular-nums',
                  isSelected && isToday && 'bg-[#FF3B30] font-semibold text-white',
                  isSelected && !isToday && 'bg-black font-semibold text-white',
                  !isSelected && isToday && 'font-semibold text-[#FF3B30]',
                  !isSelected && !isToday && (inMonth ? 'text-black' : 'text-black/30'),
                )}
              >
                {d.getDate()}
              </span>
            </button>
          )
        })}
      </div>

      {hasAllDay && (
        <div className="flex border-b border-black/10 py-1 pr-1">
          <span className="w-[42px] shrink-0 pr-1.5 pt-[3px] text-right text-[9.5px] text-black/45">종일</span>
          {days.map((d, i) => (
            <div key={i} className="flex min-w-0 flex-1 flex-col gap-[2px] px-[1.5px]">
              {eventsOn(d)
                .filter((e) => e.allDay)
                .map((e) => (
                  <EventChip key={e.id} event={e} onSelect={onSelectEvent} />
                ))}
            </div>
          ))}
        </div>
      )}

      <div ref={scrollRef} className="relative flex-1 overflow-y-auto overscroll-contain">
        <div className="relative flex pr-1" style={{ height: hours.length * HOUR_HEIGHT }}>
          <div className="w-[42px] shrink-0" aria-hidden>
            {hours.map((h) => (
              <span
                key={h}
                className="block -translate-y-[6px] pr-1.5 text-right text-[9.5px] leading-none text-black/40"
                style={{ height: HOUR_HEIGHT }}
              >
                {h === FIRST_HOUR ? '' : hourLabel(h)}
              </span>
            ))}
          </div>

          <div className="relative flex flex-1">
            {hours.map((h, i) => (
              <span
                key={h}
                aria-hidden
                className="pointer-events-none absolute inset-x-0 border-t border-black/[0.07]"
                style={{ top: i * HOUR_HEIGHT }}
              />
            ))}

            {days.map((d, i) => {
              const isToday = sameDay(d, today)
              return (
                <div
                  key={i}
                  className={cn('relative flex-1 border-l border-black/[0.05]', isToday && 'bg-[#FF3B30]/[0.035]')}
                >
                  {eventsOn(d)
                    .filter((e) => !e.allDay && e.start)
                    .map((e) => {
                      const start = toMinutes(e.start!)
                      const end = e.end ? toMinutes(e.end) : start + POINT_EVENT_MINUTES
                      return (
                        <EventBlock
                          key={e.id}
                          event={e}
                          top={((start - FIRST_HOUR * 60) / 60) * HOUR_HEIGHT}
                          height={((end - start) / 60) * HOUR_HEIGHT - 2}
                          onSelect={onSelectEvent}
                        />
                      )
                    })}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

function EventChip({ event, onSelect }: { event: CalendarEvent; onSelect: (e: CalendarEvent) => void }) {
  const { color } = CATEGORIES[event.category]
  return (
    <button
      type="button"
      onClick={() => onSelect(event)}
      className="truncate rounded-[4px] px-[3px] py-[2px] text-left text-[9px] font-semibold leading-tight text-black/80 transition-transform active:scale-95"
      style={{ background: `${color}33` }}
    >
      {event.title}
    </button>
  )
}

type EventBlockProps = {
  event: CalendarEvent
  top: number
  height: number
  onSelect: (e: CalendarEvent) => void
}

function EventBlock({ event, top, height, onSelect }: EventBlockProps) {
  const { color } = CATEGORIES[event.category]
  return (
    <button
      type="button"
      onClick={() => onSelect(event)}
      aria-label={event.title}
      className="absolute inset-x-[1.5px] overflow-hidden rounded-[5px] py-[2px] pl-[4px] pr-[2px] text-left transition-transform active:scale-95"
      style={{ top, height, background: `${color}2e`, borderLeft: `2.5px solid ${color}` }}
    >
      <span className="line-clamp-4 break-all text-[9px] font-semibold leading-[1.2] text-black/80">
        {event.title}
      </span>
      {event.start && (
        <span className="mt-[1px] block text-[8.5px] leading-none text-black/50 tabular-nums">{event.start}</span>
      )}
    </button>
  )
}
