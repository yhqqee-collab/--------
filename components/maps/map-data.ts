export type PlaceKind = 'home' | 'cafe' | 'school' | 'area' | 'motel' | 'bar' | 'restaurant' | 'friend'

export type Place = {
  id: string
  name: string
  dong: string
  address: string
  kind: PlaceKind
  x: number
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

export const BASE_WIDTH = 960
export const BASE_HEIGHT = 1180
export const MAP_SCALE = 1.6
export const MAP_WIDTH = BASE_WIDTH * MAP_SCALE
export const MAP_HEIGHT = BASE_HEIGHT * MAP_SCALE
export const METERS_PER_PX = 20
export const ROAD_FACTOR = 1.3

export const PLACES: Place[] = [
  {
    id: 'home',
    name: '집',
    dong: '인가동',
    address: '인가동 12-3',
    kind: 'home',
    x: 260,
    y: 420,
    description: '내 위치',
    keywords: ['우리집', '내 위치', '자택'],
  },
  {
    id: 'cafe',
    name: '카페',
    dong: '구서동',
    address: '구서동 48 1층',
    kind: 'cafe',
    x: 500,
    y: 560,
    description: '근무지 · 영업 중 · 오전 8:00~오후 10:00',
    keywords: ['알바', '근무지', '커피'],
  },
  {
    id: 'school',
    name: '대학교',
    dong: '계림동',
    address: '계림동 1 정문',
    kind: 'school',
    x: 720,
    y: 260,
    description: '캠퍼스 · 중앙도서관 · 학생회관',
    keywords: ['학교', '캠퍼스', '도서관'],
  },
  {
    id: 'ubang',
    name: '우방동',
    dong: '우방동',
    address: '우방동 일대',
    kind: 'area',
    x: 190,
    y: 800,
    description: '주거 지역 · 시장',
    keywords: ['우방', '생활권'],
  },
  {
    id: 'michu',
    name: '미추동',
    dong: '미추동',
    address: '미추동 일대',
    kind: 'area',
    x: 620,
    y: 830,
    description: '상가 · 버스 환승 정류장',
    keywords: ['미추', '생활권'],
  },
  {
    id: 'sangseong',
    name: '상성동',
    dong: '상성동',
    address: '상성동 일대',
    kind: 'area',
    x: 200,
    y: 1000,
    description: '공원 · 주거 지역',
    keywords: ['상성', '생활권'],
  },
  {
    id: 'gray-motel',
    name: '그레이 모텔',
    dong: '인가동',
    address: '인가동 87-2',
    kind: 'motel',
    x: 150,
    y: 560,
    description: '숙박 · 24시간 · 대실 가능',
    keywords: ['그레이', '모텔', '숙박'],
  },
  {
    id: 'lounge-bar',
    name: '더 라운지 바',
    dong: '우방동',
    address: '우방동 23 2층',
    kind: 'bar',
    x: 130,
    y: 750,
    description: '칵테일 바 · 영업 중 · 오후 7:00~오전 3:00',
    keywords: ['라운지', '바', '술집', '칵테일'],
  },
  {
    id: 'gooseo-jumak',
    name: '하이디라오',
    dong: '구서동',
    address: '구서동 72-4 2층',
    kind: 'restaurant',
    x: 610,
    y: 500,
    description: '훠궈 전문점 · 영업 중 · 오전 11:00~오전 2:00',
    keywords: ['하이디라오', 'haidilao', '훠궈', '마라', '샤브샤브', '식당', '맛집'],
  },
  {
    id: 'bk-restaurant',
    name: '아웃백',
    dong: '미추동',
    address: '미추동 55-1',
    kind: 'restaurant',
    x: 420,
    y: 790,
    description: '패밀리 레스토랑 · 오전 11:30~오후 10:00',
    keywords: ['아웃백', 'outback', '스테이크', '레스토랑', '식당', '맛집'],
  },
  {
    id: 'sky-motel',
    name: '스카이 모텔',
    dong: '상성동',
    address: '상성동 140',
    kind: 'motel',
    x: 350,
    y: 990,
    description: '숙박 · 24시간 · 대실 가능',
    keywords: ['스카이', '스카이모텔', '모텔', '숙박'],
  },
  {
    id: 'sion-home',
    name: '시온 집',
    dong: '계림동',
    address: '계림동 9-14 (대학교 후문 근처)',
    kind: 'friend',
    x: 820,
    y: 340,
    description: '오시온 자취방 · 대학교 도보 5분',
    keywords: ['시온', '오시온', '시온이', '자취방'],
  },
]

export const MIN_ZOOM = 1
export const MAX_ZOOM = 3
export const DEFAULT_ZOOM = 1.1

export const DISTRICTS = [
  { name: '계림동', points: '560,30 940,30 940,430 720,450 580,400', fill: '#E3ECFD' },
  { name: '인가동', points: '40,280 420,260 440,460 400,660 60,680', fill: '#FDE9E7' },
  { name: '구서동', points: '420,260 580,400 720,450 700,720 460,740 400,660 440,460', fill: '#FFF3D6' },
  { name: '우방동', points: '20,688 330,668 340,890 20,920', fill: '#EFE6FA' },
  { name: '미추동', points: '330,668 400,664 460,742 700,722 940,700 940,950 340,975 340,890', fill: '#E9E0F8' },
  { name: '상성동', points: '20,920 340,890 340,975 940,950 940,1170 20,1170', fill: '#F2EBFB' },
]

export const AREA_GROUP = {
  name: '우방·미추·상성 생활권',
  placeIds: ['ubang', 'michu', 'sangseong'],
  path: 'M20,688 L330,668 L400,664 L460,742 L700,722 L940,700 L940,1170 L20,1170 Z',
  labelX: 270,
  labelY: 690,
}

export const DISTRICT_LABELS = [
  { name: '인가동', x: 190, y: 330 },
  { name: '구서동', x: 600, y: 660 },
  { name: '계림동', x: 820, y: 110 },
  { name: '우방동', x: 180, y: 820 },
  { name: '미추동', x: 760, y: 840 },
  { name: '상성동', x: 200, y: 1040 },
]

export const QUICK_CHIPS = [
  { id: 'home', label: '집' },
  { id: 'cafe', label: '카페' },
  { id: 'school', label: '대학교' },
  { id: 'michu', label: '우방·미추·상성' },
]

export const TRAVEL_MODES: { id: TravelModeId; label: string; speedKmh: number; extraMin: number }[] = [
  { id: 'car', label: '자동차', speedKmh: 28, extraMin: 2 },
  { id: 'transit', label: '대중교통', speedKmh: 22, extraMin: 4 },
  { id: 'walk', label: '도보', speedKmh: 4.5, extraMin: 0 },
  { id: 'bike', label: '자전거', speedKmh: 14, extraMin: 0 },
]

export const RESERVATIONS: Reservation[] = [
  {
    id: 'r1',
    placeId: 'cafe',
    title: '카페 단체석',
    date: '10월 28일 (수)',
    time: '오후 2:00',
    people: 4,
    status: '예약 확정',
    note: '창가 자리 요청',
  },
  {
    id: 'r2',
    placeId: 'school',
    title: '중앙도서관 스터디룸 3',
    date: '10월 30일 (금)',
    time: '오전 10:00',
    people: 2,
    status: '대기 중',
    note: '2시간 이용',
  },
  {
    id: 'r3',
    placeId: 'michu',
    title: '미추동 미용실',
    date: '10월 20일 (화)',
    time: '오후 6:30',
    people: 1,
    status: '방문 완료',
    note: '커트',
  },
]
