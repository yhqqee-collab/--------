import type { CalendarEvent } from './calendar-data'

export const WEEKDAYS = ['월', '화', '수', '목', '금', '토', '일']
const FULL_WEEKDAYS = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일']
const SHORT_WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

export function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
  )
}

export function addDays(date: Date, days: number) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days)
}

export function startOfWeek(date: Date) {
  return addDays(date, -((date.getDay() + 6) % 7))
}

export function weekDays(start: Date) {
  return Array.from({ length: 7 }, (_, i) => addDays(start, i))
}

export function longDate(date: Date) {
  return `${date.getMonth() + 1}월 ${date.getDate()}일 ${FULL_WEEKDAYS[date.getDay()]}`
}

export function fullDate(date: Date) {
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 (${SHORT_WEEKDAYS[date.getDay()]})`
}

export function toMinutes(time: string) {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

export function formatClock(time: string) {
  const [h, m] = time.split(':').map(Number)
  const period = h < 12 ? '오전' : '오후'
  const hour = h % 12 === 0 ? 12 : h % 12
  return `${period} ${hour}:${String(m).padStart(2, '0')}`
}

export function eventTimeLabel(event: CalendarEvent) {
  if (event.allDay || !event.start) return '하루 종일'
  if (!event.end) return formatClock(event.start)
  return `${formatClock(event.start)} ~ ${formatClock(event.end)}`
}
