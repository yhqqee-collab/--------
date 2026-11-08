'use client'

import { CATEGORIES, eventsOn, todayFor } from '@/components/calendar/calendar-data'
import { formatClock } from '@/components/calendar/calendar-utils'
import { NOTES, splitNote } from '@/components/notes/notes-data'

function WidgetShell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="col-span-2 flex flex-col items-center gap-[5px]">
      <div className="aspect-square w-full overflow-hidden rounded-[22px] shadow-[0_4px_16px_rgba(0,0,0,0.25)]">
        {children}
      </div>
      <span className="text-[11.5px] leading-tight text-[#1c1c1e] [text-shadow:0_1px_2px_rgba(255,255,255,0.6)]">
        {label}
      </span>
    </div>
  )
}

const WEEKDAY_NAMES = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일']

export function CalendarWidget({ day, onClick }: { day: number; onClick: () => void }) {
  const today = todayFor(day)
  const events = eventsOn(today).slice(0, 3)

  return (
    <div className="col-span-2 flex flex-col items-center gap-[5px]">
      <button
        type="button"
        onClick={onClick}
        aria-label="캘린더 열기"
        className="aspect-square w-full overflow-hidden rounded-[22px] text-left shadow-[0_4px_16px_rgba(0,0,0,0.25)] outline-none transition-transform duration-150 ease-out [-webkit-tap-highlight-color:transparent] focus-visible:ring-2 focus-visible:ring-white/80 active:scale-[0.94]"
      >
        <div className="flex size-full flex-col bg-white p-[13px] text-black">
          <p className="text-[11px] font-semibold leading-none text-[#FF3B30]">{WEEKDAY_NAMES[today.getDay()]}</p>
          <p className="mt-[2px] text-[28px] font-light leading-none tracking-tight">{today.getDate()}</p>
          <ul className="mt-auto flex flex-col gap-[4px]">
            {events.map((e) => {
              const { color } = CATEGORIES[e.category]
              return (
                <li
                  key={e.id}
                  className="rounded-[5px] py-[2px] pl-[6px] pr-1"
                  style={{ borderLeft: `3px solid ${color}`, background: `${color}1f` }}
                >
                  <p className="truncate text-[10.5px] font-semibold leading-tight">{e.title}</p>
                  <p className="text-[9.5px] leading-tight text-black/50">{e.start && formatClock(e.start)}</p>
                </li>
              )
            })}
          </ul>
        </div>
      </button>
      <span className="text-[11.5px] leading-tight text-[#1c1c1e] [text-shadow:0_1px_2px_rgba(255,255,255,0.6)]">
        캘린더
      </span>
    </div>
  )
}

export function NotesWidget({ onClick }: { onClick: () => void }) {
  return (
    <div className="col-span-2 flex flex-col items-center gap-[5px]">
      <button
        type="button"
        onClick={onClick}
        aria-label="메모 열기"
        className="aspect-square w-full overflow-hidden rounded-[22px] text-left shadow-[0_4px_16px_rgba(0,0,0,0.25)] outline-none transition-transform duration-150 ease-out [-webkit-tap-highlight-color:transparent] focus-visible:ring-2 focus-visible:ring-white/80 active:scale-[0.94]"
      >
        <div className="flex size-full flex-col bg-[#FFFDF5] text-black">
          <div className="flex items-center gap-1.5 bg-[#FFCC00] px-[13px] py-[7px]">
            <span className="text-[12px] font-semibold text-black/80">메모</span>
          </div>
          <ul className="flex flex-1 flex-col gap-[5px] px-[13px] pb-[11px] pt-[9px]">
            {NOTES.slice(0, 3).map((n) => (
              <li key={n.id} className="truncate text-[10.5px] leading-snug">
                <span className="font-semibold">{splitNote(n).title}</span>
              </li>
            ))}
          </ul>
        </div>
      </button>
      <span className="text-[11.5px] leading-tight text-[#1c1c1e] [text-shadow:0_1px_2px_rgba(255,255,255,0.6)]">
        메모
      </span>
    </div>
  )
}
