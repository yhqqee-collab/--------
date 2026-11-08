import { CHARACTERS } from '@/lib/template-config'

/*
 * 캘린더 콘텐츠.
 * CATEGORIES 에서 카테고리(블록 배경색/글자색)를 정하고 CALENDAR_EVENTS 에 일정을 추가하세요.
 * day 는 이번 달 1일 기준 일수입니다 (32 이상이면 다음 달로 넘어감).
 */
export type CategoryId = 'main' | 'a' | 'b' | 'c'

export const CATEGORIES: Record<CategoryId, { label: string; color: string; bg: string; text: string }> = {
  main: { label: '메인 일정', color: '#6B7280', bg: '#F3F4F6', text: '#374151' },
  a: { label: CHARACTERS.a.name, color: '#3B82F6', bg: '#DBEAFE', text: '#1D4ED8' },
  b: { label: CHARACTERS.b.name, color: '#EF4444', bg: '#FEE2E2', text: '#B91C1C' },
  c: { label: CHARACTERS.c.name, color: '#22C55E', bg: '#DCFCE7', text: '#15803D' },
}

export type CalendarEvent = {
  id: string
  day: number
  title: string
  short?: string
  category: CategoryId
  start?: string
  end?: string
  allDay?: boolean
  memo?: string
}

export const YEAR = 2026
export const MONTH = 9
export function todayFor(gameDay: number) {
  return new Date(YEAR, MONTH, 25 + gameDay)
}
type DayEvent = Omit<CalendarEvent, 'id'>

/** 일정 목록. 게임 1일 차 = 26일 (todayFor 참고) */
const CALENDAR_EVENTS: DayEvent[] = [
  {
    day: 26,
    category: 'main',
    title: '[샘플 일정 1 - 일정 제목 입력]',
    start: '10:00',
    end: '12:00',
    memo: '[샘플 일정 1 - 알리바이 메모 입력]',
  },
  {
    day: 27,
    category: 'a',
    title: '[샘플 일정 2 - 일정 제목 입력]',
    start: '18:00',
    end: '21:00',
    memo: '[샘플 일정 2 - 알리바이 메모 입력]',
  },
]

function buildEvents(): CalendarEvent[] {
  return [...CALENDAR_EVENTS]
    .sort((a, b) => {
      if (a.day !== b.day) return a.day - b.day
      if (Boolean(a.allDay) !== Boolean(b.allDay)) return a.allDay ? -1 : 1
      return (a.start ?? '').localeCompare(b.start ?? '')
    })
    .map((e, i) => ({ ...e, id: `evt-${i}` }))
}

export const EVENTS = buildEvents()

const MONTH_START = new Date(YEAR, MONTH, 1)

// day는 이번 달 1일 기준 일수라서 32 이상이면 다음 달로 넘어갑니다(예: 10월 32일 = 11월 1일).
export function eventsOn(date: Date) {
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const day = Math.round((target.getTime() - MONTH_START.getTime()) / 86_400_000) + 1
  return EVENTS.filter((e) => e.day === day)
}
