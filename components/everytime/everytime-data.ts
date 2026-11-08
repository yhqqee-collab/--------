export type ClassBlock = {
  name: string
  room: string
  day: number
  start: number
  end: number
}

export type Friend = {
  id: string
  name: string
  starred: boolean
  free?: boolean
  classes?: ClassBlock[]
}

export const SCHOOL_NAME = '소원대'
export const CURRENT_SEMESTER = '2026년 2학기'
export const PAST_SEMESTERS = ['2026년 1학기', '2025년 겨울학기', '2025년 2학기']

export const FAVORITE_BOARDS = [
  { board: '자유게시판', latest: '중도 4층 콘센트 자리 다 찼네요' },
  { board: '비밀게시판', latest: '친구 애인 봤는데 말해야 할까' },
  { board: '졸업생게시판', latest: '입사한 지 1년 조금 넘었는데 가면 갈수록…' },
  { board: '새내기게시판', latest: '동아리 아직 신입 받는 곳 있나요' },
  { board: '시사·이슈', latest: '오늘 발표된 등록금 동결 관련 정리' },
]

export const TIMETABLE_DAYS = ['월', '화', '수', '목', '금']
export const TIMETABLE_START_HOUR = 9
export const TIMETABLE_END_HOUR = 18

export const MY_CLASSES: ClassBlock[] = [
  { name: '대중문화의 이해', room: '대강당 101호', day: 0, start: 13, end: 15 },
  { name: '소비자행동론', room: '경영관 302호', day: 0, start: 15, end: 17 },
  { name: '영화와 현대사회', room: '인문관 204호', day: 1, start: 10.5, end: 12 },
  { name: '브랜드마케팅', room: '경영관 401호', day: 1, start: 13, end: 15 },
  { name: '재무관리원론', room: '경영관 201호', day: 3, start: 10.5, end: 12 },
  { name: '브랜드마케팅', room: '경영관 401호', day: 3, start: 15, end: 17 },
  { name: '영화와 현대사회', room: '인문관 204호', day: 4, start: 10.5, end: 12 },
  { name: '대중문화의 이해', room: '대강당 101호', day: 4, start: 13, end: 15 },
]

const DAEYOUNG_CLASSES: ClassBlock[] = [
  { name: '대중문화의 이해', room: '대강당 101호', day: 0, start: 13, end: 15 },
  { name: '경영학원론', room: '경영관 101호', day: 1, start: 10.5, end: 12 },
  { name: '회계원리', room: '경영관 102호', day: 2, start: 13, end: 15 },
  { name: '경영학원론', room: '경영관 101호', day: 3, start: 10.5, end: 12 },
  { name: '대중문화의 이해', room: '대강당 101호', day: 4, start: 13, end: 15 },
]

const CHARACTERS: Friend[] = [
  {
    id: 'sion',
    name: '오시온',
    starred: true,
    classes: [
      { name: '소비자행동론', room: '경영관 302호', day: 0, start: 15, end: 17 },
      { name: '졸업논문세미나', room: '경영관 501호', day: 3, start: 10.5, end: 12 },
      { name: '경영전략특강', room: '경영관 502호', day: 3, start: 13, end: 15 },
    ],
  },
  {
    id: 'riku',
    name: '마에다 리쿠',
    starred: true,
    classes: [
      { name: '광고크리에이티브', room: '경영관 205호', day: 0, start: 10.5, end: 12 },
      { name: '글로벌마케팅', room: '경영관 402호', day: 0, start: 15, end: 16.5 },
      { name: '브랜드마케팅', room: '경영관 401호', day: 1, start: 13, end: 15 },
      { name: '디지털미디어실습', room: '조형관 102호', day: 2, start: 10.5, end: 12 },
      { name: '광고크리에이티브', room: '경영관 205호', day: 2, start: 13, end: 15 },
      { name: '브랜드마케팅', room: '경영관 401호', day: 3, start: 15, end: 17 },
      { name: '디지털미디어실습', room: '조형관 102호', day: 4, start: 10.5, end: 12 },
      { name: '글로벌마케팅', room: '경영관 402호', day: 4, start: 13, end: 14.5 },
    ],
  },
  {
    id: 'yushi',
    name: '토쿠노 유우시',
    starred: true,
    classes: [
      { name: '거시경제학', room: '사회과학관 201호', day: 0, start: 10.5, end: 12 },
      { name: '계량경제분석', room: '사회과학관 305호', day: 0, start: 14, end: 16 },
      { name: '영화와 현대사회', room: '인문관 204호', day: 1, start: 10.5, end: 12 },
      { name: '금융시장론', room: '사회과학관 302호', day: 1, start: 15, end: 17 },
      { name: '미시경제학', room: '사회과학관 202호', day: 2, start: 13, end: 15 },
      { name: '거시경제학', room: '사회과학관 201호', day: 3, start: 13, end: 15 },
      { name: '금융시장론', room: '사회과학관 302호', day: 3, start: 15, end: 17 },
      { name: '영화와 현대사회', room: '인문관 204호', day: 4, start: 10.5, end: 12 },
    ],
  },
  { id: 'daeyoung', name: '김대영', starred: true, classes: DAEYOUNG_CLASSES },
  { id: 'ryo', name: '히로세 료', starred: true, classes: DAEYOUNG_CLASSES },
  {
    id: 'sakuya',
    name: '후지나가 사쿠야',
    starred: true,
    classes: [
      { name: '거시경제학', room: '사회과학관 201호', day: 0, start: 10.5, end: 12 },
      { name: '경제학원론', room: '사회과학관 101호', day: 1, start: 13, end: 15 },
      { name: '거시경제학', room: '사회과학관 201호', day: 3, start: 13, end: 15 },
      { name: '경제학원론', room: '사회과학관 101호', day: 4, start: 13, end: 15 },
    ],
  },
]

const FREE_NAMES = new Set(['고영훈', '고태림', '김민서', '박하은', '송민재', '이하린', '최수아'])

const CLASSMATE_NAMES = [
  '강다현', '고영훈', '고태림', '곽세은', '김나연', '김민서', '김민지', '김유민', '김준호', '남궁현',
  '문서윤', '박지훈', '박하은', '배수빈', '서정우', '손예린', '송민재', '신유나', '안도윤', '양지수',
  '오승현', '윤채원', '이건우', '이서진', '이하린', '장태오', '정다은', '조현우', '최수아', '한지민',
]

const CLASSMATES: Friend[] = CLASSMATE_NAMES.map((name, index) => ({
  id: `classmate-${index}`,
  name,
  starred: false,
  free: FREE_NAMES.has(name),
}))

export const FRIENDS: Friend[] = [...CHARACTERS, ...CLASSMATES]

const PALETTE = ['#F08A78', '#A8CB6E', '#7DD0BE', '#EBC46B', '#7BA6E8', '#C59BE0', '#F2A65A', '#6FC3D9', '#E39BB8', '#9DB0C9']

const subjectColors = new Map<string, string>()
for (const block of [...MY_CLASSES, ...FRIENDS.flatMap((friend) => friend.classes ?? [])]) {
  if (!subjectColors.has(block.name)) {
    subjectColors.set(block.name, PALETTE[subjectColors.size % PALETTE.length])
  }
}

export function subjectColor(name: string) {
  return subjectColors.get(name) ?? PALETTE[0]
}
