'use client'

import { ChevronLeft, ChevronRight, Inbox, Plus, Search } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { MONTH, todayFor, YEAR, type CalendarEvent } from './calendar-data'
import { longDate, sameDay } from './calendar-utils'
import { EventDetailSheet } from './event-detail-sheet'
import { MonthView } from './month-view'
import { WeekView } from './week-view'

type View = 'month' | 'week'

const FIRST_MONTH = MONTH - 1

export function CalendarApp({ open, day }: { open: boolean; day: number }) {
  const today = todayFor(day)
  const [view, setView] = useState<View>('month')
  const [selected, setSelected] = useState(today)
  const [month, setMonth] = useState(today.getMonth())
  const [selectedForDay, setSelectedForDay] = useState(day)
  if (selectedForDay !== day) {
    setSelectedForDay(day)
    setSelected(today)
    setMonth(today.getMonth())
  }
  const [detail, setDetail] = useState<CalendarEvent | null>(null)
  const [lastDetail, setLastDetail] = useState<CalendarEvent | null>(null)

  function openDetail(event: CalendarEvent) {
    setDetail(event)
    setLastDetail(event)
  }

  function selectDate(date: Date) {
    if (date.getFullYear() !== YEAR) return
    setSelected(date)
    if (date.getMonth() >= FIRST_MONTH && date.getMonth() <= MONTH) setMonth(date.getMonth())
  }

  function changeMonth(next: number) {
    setMonth(next)
    setSelected(next === today.getMonth() ? today : new Date(YEAR, next, 1))
  }

  return (
    <section
      aria-label="캘린더"
      aria-hidden={!open}
      inert={!open}
      onTransitionEnd={(e) => {
        if (e.target === e.currentTarget && !open) setDetail(null)
      }}
      className={cn(
        'absolute inset-0 z-20 flex origin-[27%_24%] flex-col overflow-hidden bg-white transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] sm:rounded-[55px]',
        open ? 'scale-100 opacity-100' : 'pointer-events-none scale-[0.2] opacity-0',
      )}
    >
      <header className="shrink-0 px-4 pt-[56px]">
        <div className="flex items-center justify-between">
          <span className="-ml-2 flex items-center text-[17px] text-[#FF3B30]">
            <ChevronLeft className="size-[26px]" strokeWidth={2.25} aria-hidden />
            {YEAR}년
          </span>
          <div className="flex items-center gap-4 text-[#FF3B30]">
            <Search className="size-[21px]" strokeWidth={2.25} aria-label="검색" />
            <Plus className="size-[24px]" strokeWidth={2.25} aria-label="이벤트 추가" />
          </div>
        </div>

        <div className="mt-1.5 flex items-end justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <h2 className="whitespace-nowrap text-[28px] font-bold leading-none tracking-tight text-black">
                {YEAR}년 {month + 1}월
              </h2>
              <button
                type="button"
                aria-label="이전 달"
                onClick={() => changeMonth(month - 1)}
                disabled={month <= FIRST_MONTH}
                className="ml-1 flex size-7 items-center justify-center rounded-full text-[#FF3B30] transition-opacity active:bg-black/5 disabled:opacity-25"
              >
                <ChevronLeft className="size-5" strokeWidth={2.5} aria-hidden />
              </button>
              <button
                type="button"
                aria-label="다음 달"
                onClick={() => changeMonth(month + 1)}
                disabled={month >= MONTH}
                className="flex size-7 items-center justify-center rounded-full text-[#FF3B30] transition-opacity active:bg-black/5 disabled:opacity-25"
              >
                <ChevronRight className="size-5" strokeWidth={2.5} aria-hidden />
              </button>
            </div>
            <p className="mt-1.5 whitespace-nowrap text-[13px] font-medium text-[#FF3B30]">오늘 · {longDate(today)}</p>
          </div>

          <div role="tablist" aria-label="보기" className="flex shrink-0 rounded-[9px] bg-[#767680]/[0.12] p-[2px]">
            {(['month', 'week'] as const).map((v) => (
              <button
                key={v}
                type="button"
                role="tab"
                aria-selected={view === v}
                onClick={() => setView(v)}
                className={cn(
                  'rounded-[7px] px-3.5 py-[4px] text-[13px] font-medium transition-all',
                  view === v ? 'bg-white text-black shadow-[0_1px_4px_rgba(0,0,0,0.12)]' : 'text-black/60',
                )}
              >
                {v === 'month' ? '월' : '주'}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className={cn('mt-3 min-h-0 flex-1', view === 'month' ? 'overflow-y-auto' : 'overflow-hidden')}>
        {view === 'month' ? (
          <MonthView month={month} selected={selected} today={today} onSelectDate={selectDate} onSelectEvent={openDetail} />
        ) : (
          <WeekView selected={selected} today={today} onSelectDate={selectDate} onSelectEvent={openDetail} />
        )}
      </div>

      <nav
        aria-label="캘린더 도구"
        className="flex shrink-0 items-center justify-between border-t border-black/10 bg-white/90 px-5 pb-[34px] pt-2.5 text-[16px] text-[#FF3B30] backdrop-blur-xl"
      >
        <button
          type="button"
          onClick={() => {
            setSelected(today)
            setMonth(today.getMonth())
          }}
          disabled={sameDay(selected, today)}
          className="transition-opacity active:opacity-50 disabled:opacity-40"
        >
          오늘
        </button>
        <span>캘린더</span>
        <Inbox className="size-[21px]" strokeWidth={2} aria-label="받은 편지함" />
      </nav>

      <EventDetailSheet
        event={(detail ?? lastDetail) || undefined}
        open={detail !== null}
        onClose={() => setDetail(null)}
      />
    </section>
  )
}
