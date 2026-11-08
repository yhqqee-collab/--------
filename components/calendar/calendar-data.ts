/*
 * 캘린더 콘텐츠.
 * CATEGORIES에서 카테고리(블록 배경색/글자색)를 정하고 WEEKS에 주차별 일정을 추가하세요.
 * WEEKS는 FIRST_DAY(월요일)부터 시작해 [월, 화, 수, 목, 금, 토, 일] 순서로 채웁니다.
 */
export type CategoryId = 'cafe' | 's' | 'r' | 'y'

export const CATEGORIES: Record<CategoryId, { label: string; color: string; bg: string; text: string }> = {
  cafe: { label: '카페 근무', color: '#6B7280', bg: '#F3F4F6', text: '#374151' },
  s: { label: 'S', color: '#3B82F6', bg: '#DBEAFE', text: '#1D4ED8' },
  r: { label: 'R', color: '#EF4444', bg: '#FEE2E2', text: '#B91C1C' },
  y: { label: 'Y', color: '#22C55E', bg: '#DCFCE7', text: '#15803D' },
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
const FIRST_DAY = 5

type DayEvent = Omit<CalendarEvent, 'id' | 'day'>

const SHIFTS = {
  오픈: ['09:00', '15:00'],
  미들: ['12:00', '18:00'],
  마감: ['16:00', '22:00'],
} as const

function cafe(shift: keyof typeof SHIFTS, memo?: string): DayEvent {
  const [start, end] = SHIFTS[shift]
  return { category: 'cafe', title: `카페 ${shift}`, short: shift, start, end, memo }
}

function plan(
  category: Exclude<CategoryId, 'cafe'>,
  title: string,
  start: string,
  end: string,
  memo?: string,
): DayEvent {
  return { category, title, start, end, memo }
}

const DAY_OFF: DayEvent = { category: 'cafe', title: '휴무', allDay: true }

const WEEKS: DayEvent[][][] = [
  [
    [cafe('오픈'), plan('r', '점심 약속', '15:30', '17:00')],
    [cafe('미들')],
    [cafe('마감'), plan('y', '심야 드라이브', '22:30', '23:30')],
    [DAY_OFF, plan('s', '저녁 식사', '18:30', '20:30')],
    [cafe('미들'), plan('r', '팝업스토어', '18:30', '20:30')],
    [cafe('오픈'), plan('s', '심야 영화', '22:00', '23:30')],
    [cafe('마감'), plan('y', '전시회 관람', '10:00', '12:30')],
  ],
  [
    [cafe('미들'), plan('s', '한강 치맥', '19:00', '21:30')],
    [cafe('오픈'), plan('r', '방탈출 카페', '15:30', '17:30')],
    [cafe('마감')],
    [DAY_OFF, plan('y', '저녁 식사', '18:30', '20:30')],
    [cafe('오픈'), plan('r', '고양이 카페', '15:30', '17:30')],
    [cafe('마감'), plan('y', '심야 영화', '22:30', '23:30')],
    [DAY_OFF, plan('s', '쇼핑 동행', '13:00', '17:00')],
  ],
  [
    [
      cafe('마감'),
      plan(
        'r',
        '리쿠랑 야식',
        '22:15',
        '23:30',
        '리쿠가 집에 있다가 근처 다른 카페에서 기다려줌.\n시온, 유우시한테 마감 빡세서 집 가자마자 씻지도 못하고 기절했다고 구라침!!',
      ),
    ],
    [
      cafe('오픈'),
      plan(
        'y',
        '유우시랑 밥 + 텔 대실',
        '18:00',
        '23:00',
        '유우시랑 저녁 먹고 텔 대실.\n시온, 리쿠한테 친한 언니 만나서 밥 먹고 바로 집 갔다고 구라침!!',
      ),
    ],
    [
      DAY_OFF,
      plan(
        's',
        '시온 집데',
        '12:00',
        '21:00',
        '리쿠, 유우시한테 하루 종일 학교 도서관에서 스터디 모임 한다고 구라침!!\n 리쿠도 휴무라 자꾸 만나자고 카톡함ㅠ 씹었더니 답장 재촉 + 의심하는 카톡 옴... 하 존나 성가셔',
      ),
    ],
    [
      cafe('오픈'),
      plan(
        'r',
        '리쿠랑 편의점 + 텔',
        '16:00',
        '22:00',
        '리쿠랑 퇴근하고 편의점 갔다가 텔 대실.\n시온, 유우시한테 알바 끝나고 피곤해서 집에서 밀린 넷플릭스 봤다고 구라침...',
      ),
    ],
    [
      cafe('마감'),
      plan(
        'y',
        '유우시랑 아웃백 저녁',
        '22:15',
        '23:30',
        '아웃백에서 저녁.\n시온, 리쿠한테 내일도 출근이라 바로 잔다고 구라\n(시온 휴무라 만나자고 했는데 피곤하다고 거절함)',
      ),
    ],
    [
      cafe('미들'),
      plan(
        's',
        '시온 더 라운지 바',
        '19:00',
        '23:00',
        '프라이빗 라운지 바 데이트.\n리쿠, 유우시한테 오랜만에 고향 친구들 만나서 술 마신다고 구라침!!\n리쿠랑 같은 미들이는었데 퇴근할 때 향수 뿌린 거 눈치채고 누구 만나냐고 캐물음 ㅠ',
      ),
    ],
    [cafe('오픈', '데이트 없음. 진짜 종일 집에서 뻗음.')],
  ],
  [
    [cafe('오픈')],
    [cafe('미들')],
    [DAY_OFF],
    [cafe('마감')],
    [cafe('미들')],
    [cafe('오픈')],
    [cafe('마감')],
  ],
]

function buildEvents(): CalendarEvent[] {
  const all = WEEKS.flatMap((week, wi) =>
    week.flatMap((events, di) => events.map((e) => ({ ...e, day: FIRST_DAY + wi * 7 + di }))),
  )

  return all
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
