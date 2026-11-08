import { Bell, ChevronLeft, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CATEGORIES, MONTH, YEAR, type CalendarEvent } from './calendar-data'
import { eventTimeLabel, fullDate } from './calendar-utils'

type EventDetailSheetProps = {
  event: CalendarEvent | undefined
  open: boolean
  onClose: () => void
}

export function EventDetailSheet({ event, open, onClose }: EventDetailSheetProps) {
  const category = event ? CATEGORIES[event.category] : null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="이벤트 세부사항"
      aria-hidden={!open}
      inert={!open}
      className={cn(
        'absolute inset-0 z-30 flex flex-col bg-[#F2F2F7] transition-transform duration-[450ms] ease-[cubic-bezier(0.32,0.72,0,1)]',
        open ? 'translate-x-0 shadow-[-12px_0_30px_rgba(0,0,0,0.12)]' : 'translate-x-full',
      )}
    >
      <div className="flex items-center justify-between px-2 pb-2 pt-[56px]">
        <button
          type="button"
          onClick={onClose}
          className="flex items-center text-[17px] text-[#FF3B30] transition-opacity active:opacity-50"
        >
          <ChevronLeft className="size-[26px]" strokeWidth={2.25} aria-hidden />
          완료
        </button>
        <span className="px-3 text-[17px] text-[#FF3B30]/50">편집</span>
      </div>

      {event && category && (
        <div className="flex-1 overflow-y-auto px-4 pb-10">
          <div className="rounded-[12px] bg-white px-4 py-4">
            <h2 className="text-[21px] font-semibold leading-snug tracking-tight text-black text-pretty">
              {event.title}
            </h2>
            <p className="mt-2 text-[15px] text-black/55">
              {fullDate(new Date(YEAR, MONTH, event.day))}
            </p>
            <p className="text-[15px] text-black/55">{eventTimeLabel(event)}</p>
          </div>

          <div className="mt-5 overflow-hidden rounded-[12px] bg-white">
            <div className="flex items-center justify-between px-4 py-[13px]">
              <span className="text-[16px] text-black">캘린더</span>
              <span className="flex items-center gap-2 text-[16px] text-black/50">
                <span className="size-[10px] rounded-full" style={{ background: category.color }} aria-hidden />
                {category.label}
              </span>
            </div>
            <div className="ml-4 border-t border-black/10" />
            <div className="flex items-center justify-between px-4 py-[13px]">
              <span className="text-[16px] text-black">알림</span>
              <span className="flex items-center gap-1.5 text-[16px] text-black/50">
                <Bell className="size-[14px]" aria-hidden />
                {event.allDay ? '당일 (오전 9시)' : '30분 전'}
              </span>
            </div>
          </div>

          {event.memo && (
            <div className="mt-5">
              <p className="mb-1.5 flex items-center gap-1 px-4 text-[12.5px] font-medium text-black/45">
                <Lock className="size-[11px]" aria-hidden />
                메모 · 나만 보기
              </p>
              <div
                className="rounded-[12px] bg-white px-4 py-[13px]"
                style={{ boxShadow: `inset 3px 0 0 ${category.color}` }}
              >
                <p className="text-[15.5px] leading-relaxed text-black text-pretty">{event.memo}</p>
              </div>
            </div>
          )}

          <div className="mt-5 rounded-[12px] bg-white px-4 py-[13px] text-center text-[16px] text-[#FF3B30]/50">
            이벤트 삭제
          </div>
        </div>
      )}
    </div>
  )
}
