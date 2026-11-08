/*
 * 캘린더 콘텐츠.
 * CATEGORIES 에서 카테고리(블록 배경색/글자색)를 정하고 CALENDAR_EVENTS 에 일정을 추가하세요.
 * day 는 이번 달 1일 기준 일수입니다 (32 이상이면 다음 달로 넘어감).
 */
export type CategoryId = 'exam' | 'date' | 'club'

export const CATEGORIES: Record<CategoryId, { label: string; color: string; bg: string; text: string }> = {
  exam: { label: '시험', color: '#3B82F6', bg: '#DBEAFE', text: '#1D4ED8' },
  date: { label: '약속', color: '#F43F5E', bg: '#FFE4E6', text: '#BE123C' },
  club: { label: '동아리', color: '#F59E0B', bg: '#FEF3C7', text: '#B45309' },
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
  // 시험기간 주간 (10/30 ~ 11/05)
  { day: 30, category: 'exam', title: '영현사 과제 대체', start: '10:30' },
  { day: 30, category: 'exam', title: '대중문화 수업', start: '13:00' },
  { day: 32, category: 'date', title: '리쿠 스터디, 자취방', start: '16:00' },
  { day: 33, category: 'exam', title: '대중문화 시험', start: '13:00' },
  { day: 33, category: 'exam', title: '소비자심리학 시험', start: '15:00' },
  { day: 33, category: 'date', title: '시온 커피', start: '17:00' },
  { day: 34, category: 'exam', title: '영현사 시험', start: '10:30' },
  { day: 34, category: 'exam', title: '브랜드마케팅 시험', start: '13:00' },
  { day: 35, category: 'date', title: '유우시 재무관리 과외', start: '17:00' },
  { day: 36, category: 'exam', title: '재무관리 시험', start: '10:30' },
  { day: 36, category: 'date', title: '시온 드라이브', start: '13:00' },

  // 플레이 주간 (11/06 ~ 11/12)
  { day: 37, category: 'club', title: '동아리 주점 회의', start: '19:00' },
  { day: 38, category: 'club', title: '주점 장보기/작업', start: '15:00' },
  { day: 40, category: 'club', title: '동아리 소품 작업', start: '18:00' },
  { day: 41, category: 'club', title: '축제 주점 1일차', start: '18:00' },
  { day: 42, category: 'club', title: '축제 주점 2일차 & 회식', start: '18:00' },
  { day: 43, category: 'club', title: '주점 철거', start: '13:00' },
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
