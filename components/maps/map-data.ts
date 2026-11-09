export type PlaceKind =
  | 'home'
  | 'cafe'
  | 'school'
  | 'area'
  | 'motel'
  | 'bar'
  | 'restaurant'
  | 'friend'
  | 'pc'
  | 'store'
  | 'bakery'
  | 'bank'
  | 'karaoke'
  | 'park'
  | 'pharmacy'
  | 'subway'

export type Place = {
  id: string
  name: string
  dong: string
  address: string
  kind: PlaceKind
  /** 학생회관 기준 동쪽(+) 미터 */
  x: number
  /** 학생회관 기준 남쪽(+) 미터 */
  y: number
  description: string
  keywords?: string[]
}

export type TravelModeId = 'car' | 'transit' | 'walk' | 'bike'

export type Reservation = {
  id: string
  placeId: string
  title: string
  date: string
  time: string
  people: number
  status: '예약 확정' | '대기 중' | '방문 완료'
  note: string
}

/** 학생회관의 실제 위경도 (서울 중구 부근). 모든 x, y 는 이 점 기준 미터 단위입니다. */
export const ORIGIN_LATLNG: [number, number] = [37.5632, 126.9958]
export const METERS_PER_PX = 1
export const ROAD_FACTOR = 1.3

export const MIN_ZOOM = 6
export const MAX_ZOOM = 19
/** 앱을 열었을 때: 학생회관 최대 확대(19)에서 세 번 축소한 화면 */
export const DEFAULT_ZOOM = 16
/** 이 줌 이상에서만 가게 이름이 보입니다. (16에서는 아이콘과 학교·주요 건물 이름만) */
export const LABEL_ZOOM = 17
/** 이 줌 이상에서만 가게 아이콘이 보입니다. */
export const ICON_ZOOM = 15
/** 대한민국 전체가 보이는 범위 */
export const KOREA_BOUNDS: [[number, number], [number, number]] = [
  [32.6, 124.2],
  [38.9, 131.2],
]

export const KIND_LABELS: Record<PlaceKind, string> = {
  home: '집',
  cafe: '카페',
  school: '대학교',
  area: '지역',
  motel: '숙박',
  bar: '술집',
  restaurant: '음식점',
  friend: '지인 집',
  pc: 'PC방',
  store: '편의점·마트',
  bakery: '베이커리',
  bank: '은행',
  karaoke: '노래방',
  park: '공원',
  pharmacy: '약국',
  subway: '지하철역',
}

const HOME_PLACE: Place = {
  id: 'home',
  name: '집',
  dong: '인가동',
  address: '인가동 12-3 원룸 302호',
  kind: 'home',
  x: -330,
  y: 400,
  description: '내 위치',
  keywords: ['우리집', '내 위치', '자택', '자취방'],
}

type Seed = [id: string, name: string, kind: PlaceKind, x: number, y: number, dong: string, description: string, keywords?: string[]]

const SEEDS: Seed[] = [
  ['union', '학생회관', 'school', 0, 0, '소원동', '소원대학교 학생회관 · 동아리방, 학생식당', ['소원대', '동방', '학식', '학관']],
  ['main-gate', '소원대학교 정문', 'school', 0, 225, '소원동', '소원대학교 정문', ['소원대', '정문']],
  ['north-gate', '소원대학교 북문', 'school', 10, -225, '소원동', '소원대학교 북문', ['소원대', '북문']],
  ['library', '중앙도서관', 'school', -150, -110, '소원동', '소원대학교 중앙도서관 · 열람실 24시간', ['소원대', '도서관', '열람실']],
  ['engineering', '공학관', 'school', 170, -120, '소원동', '소원대학교 공학관', ['소원대']],
  ['humanities', '인문관', 'school', -175, 75, '소원동', '소원대학교 인문관', ['소원대']],
  ['business', '경영관', 'school', 25, -130, '소원동', '소원대학교 경영관 · 경영경제대학', ['소원대', '경영', '경제', '경영경제']],
  ['social-science', '사회과학관', 'school', -65, 130, '소원동', '소원대학교 사회과학관', ['소원대', '사회과학관', '사과대']],
  ['field', '대운동장', 'park', 155, 95, '소원동', '소원대학교 대운동장', ['소원대', '운동장']],

  ['mega-coffee', '메가MGC커피 소원대정문점', 'cafe', -45, 285, '구서동', '저가 커피 · 테이크아웃', ['메가커피']],
  ['starbucks', '스타벅스 소원대정문점', 'cafe', 65, 300, '구서동', '2층 좌석 넓음 · 콘센트 많음', ['스벅']],
  ['compose', '컴포즈커피 구서점', 'cafe', -95, 475, '구서동', '아아 1,500원'],

  ['paris', '파리바게뜨 소원대점', 'bakery', 115, 415, '구서동', '베이커리 · 샌드위치'],

  ['gs25', 'GS25 소원대정문점', 'store', 20, 350, '구서동', '24시 편의점'],
  ['cu', 'CU 소원대점', 'store', -125, 405, '구서동', '24시 편의점'],
  ['emart24', '이마트24 인가점', 'store', -300, 445, '인가동', '24시 편의점 · 집 앞'],

  ['pc-levelup', '레벨업 PC방', 'pc', -40, 405, '구서동', '최신 사양 · 라면 맛집', ['피씨방', '피시방', '게임']],
  ['pc-isense', '아이센스리그 PC방', 'pc', 150, 475, '구서동', '24시간 · 커플석', ['피씨방', '피시방', '게임']],

  ['seogacook', '서가앤쿡 소원대후문점', 'restaurant', -105, -310, '계림동', '파스타 · 필라프 · 데이트 맛집', ['서가앤쿡', '파스타', '양식']],
  ['ramenya', '라멘야', 'restaurant', 100, 350, '구서동', '돈코츠 라멘 · 정문 앞 골목', ['라멘', '일식']],
  ['kyochon', '교촌치킨 소원대점', 'restaurant', 85, 525, '구서동', '치킨 · 배달 가능', ['치킨']],
  ['momstouch', '맘스터치 소원대점', 'restaurant', -65, 345, '구서동', '버거 · 싸이버거', ['버거', '햄버거']],
  ['myeongryun', '명륜진사갈비 구서점', 'restaurant', 45, 625, '구서동', '돼지갈비 무한리필', ['고기']],
  ['sundae', '할매순대국', 'restaurant', 80, -325, '계림동', '24시 · 해장', ['국밥']],
  ['gogi', '맛있는고기에 송씨를더하다', 'restaurant', -280, 140, '인가동', '삼겹살 · 단체석', ['고기', '삼겹살']],

  ['beer', '역전할머니맥주 소원대점', 'bar', 135, 595, '구서동', '맥주 · 2차', ['술집', '맥주']],
  ['pocha', '소원포차', 'bar', -45, 660, '구서동', '포차 · 새벽 4시까지', ['술집']],

  ['karaoke', '별빛 코인노래방', 'karaoke', -270, 340, '인가동', '코인노래방', ['노래방', '코노']],

  ['shinhan', '신한은행 소원대지점', 'bank', 300, 235, '구서동', 'ATM 24시간'],

  ['station', '소원대역 3번 출구', 'subway', 345, 120, '계림동', '2호선 · 4호선 환승', ['지하철', '역']],
  ['park', '인가근린공원', 'park', -330, -60, '인가동', '산책로 · 농구장', ['공원']],
]

/*
 * 지도 핀 목록. 새 스토리마다 여기만 수정하세요.
 *  - x, y: 학생회관 기준 미터 (x: 동쪽 +, y: 남쪽 +)
 *  - 줌 16(기본 화면)에서 대략 가로 ±350m, 세로 ±600m 가 보입니다.
 */
export const MAP_LOCATIONS: Place[] = SEEDS.map(([id, name, kind, x, y, dong, description, keywords]) => ({
  id,
  name,
  kind,
  x,
  y,
  dong,
  address: `${dong} ${100 + Math.abs(Math.round((x * 7 + y * 3) / 10)) % 400}-${1 + Math.abs(x + y) % 30}`,
  description,
  keywords,
}))

export const PLACES: Place[] = [HOME_PLACE, ...MAP_LOCATIONS]

/** 학생회관 기준 미터 좌표로 그린 캠퍼스 영역 */
export const CAMPUS = {
  name: '소원대학교',
  points: [
    [-265, -215],
    [-60, -240],
    [270, -215],
    [285, 205],
    [40, 220],
    [-270, 215],
  ] as [number, number][],
}

/** 캠퍼스 건물 사각형. x, y 는 건물 중심, w, h 는 가로·세로 미터 */
export const CAMPUS_BUILDINGS: { id: string; x: number; y: number; w: number; h: number; kind?: 'field' }[] = [
  { id: 'union', x: 0, y: 0, w: 70, h: 50 },
  { id: 'library', x: -150, y: -110, w: 95, h: 60 },
  { id: 'engineering', x: 170, y: -120, w: 100, h: 55 },
  { id: 'humanities', x: -175, y: 75, w: 80, h: 55 },
  { id: 'business', x: 25, y: -130, w: 85, h: 50 },
  { id: 'social-science', x: -65, y: 130, w: 70, h: 55 },
  { id: 'field', x: 155, y: 95, w: 150, h: 95, kind: 'field' },
]

/** 캠퍼스 내부 도로. width 는 실제 도로 폭(미터)이라 줌에 따라 굵기가 함께 변합니다. */
export const CAMPUS_ROADS: { points: [number, number][]; width: number }[] = [
  {
    width: 18,
    points: [
      [10, -232], [10, -214], [62, -206], [92, -186], [100, -150], [100, -95],
      [92, -62], [72, -38], [68, 0], [68, 150], [60, 182], [30, 206], [4, 214], [0, 232],
    ],
  },
  {
    width: 16,
    points: [
      [10, -214], [-80, -204], [-170, -190], [-222, -160], [-240, -100], [-244, 0],
      [-238, 110], [-210, 160], [-150, 192], [-60, 208], [4, 214],
    ],
  },
  { width: 14, points: [[-242, -58], [-160, -58], [-95, -54], [-55, -40], [-32, -28]] },
  { width: 14, points: [[-243, 30], [-170, 30], [-90, 32], [-40, 42], [68, 42]] },
  { width: 14, points: [[96, -76], [180, -76], [262, -76], [264, 165]] },
  { width: 14, points: [[68, 165], [160, 166], [264, 165]] },
  { width: 9, points: [[25, -105], [25, -25]] },
  { width: 9, points: [[-150, -58], [-150, -80]] },
  { width: 9, points: [[-175, 30], [-175, 47]] },
  { width: 9, points: [[-12, 42], [-30, 72], [-48, 102]] },
  { width: 9, points: [[170, -76], [170, -92]] },
]

export const AREA_GROUP = {
  name: '소원대 정문 상권',
  placeIds: [] as string[],
}

export const QUICK_CHIPS = [
  { query: '음식점', label: '음식점', kind: 'restaurant' },
  { query: '카페', label: '카페', kind: 'cafe' },
  { query: 'PC방', label: 'PC방', kind: 'pc' },
  { query: '편의점', label: '편의점', kind: 'store' },
  { query: '술집', label: '술집', kind: 'bar' },
  { query: '노래방', label: '노래방', kind: 'karaoke' },
] satisfies { query: string; label: string; kind: PlaceKind }[]

export const TRAVEL_MODES: { id: TravelModeId; label: string; speedKmh: number; extraMin: number }[] = [
  { id: 'car', label: '자동차', speedKmh: 28, extraMin: 2 },
  { id: 'transit', label: '대중교통', speedKmh: 22, extraMin: 4 },
  { id: 'walk', label: '도보', speedKmh: 4.5, extraMin: 0 },
  { id: 'bike', label: '자전거', speedKmh: 14, extraMin: 0 },
]

export const RESERVATIONS: Reservation[] = []
