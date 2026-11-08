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

/** 지도의 기준점(내 위치). PLACES[0] 이 항상 '집'이어야 길찾기가 동작합니다. */
const HOME_PLACE: Place = {
  id: 'home',
  name: '집',
  dong: '인가동',
  address: '인가동 12-3',
  kind: 'home',
  x: 260,
  y: 420,
  description: '내 위치',
  keywords: ['우리집', '내 위치', '자택'],
}

/*
 * 지도 핀 목록. 새 스토리마다 여기만 수정하세요.
 *  - kind: 'cafe' | 'school' | 'area' | 'motel' | 'bar' | 'restaurant' | 'friend' (아이콘 결정)
 *  - x, y: 지도 좌표 (가로 0~960, 세로 0~1180)
 *  - keywords: 검색어
 */
export const MAP_LOCATIONS: Place[] = []

export const PLACES: Place[] = [HOME_PLACE, ...MAP_LOCATIONS]

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
  /** 이 생활권에 묶을 장소 id (PLACES 의 id) */
  placeIds: [] as string[],
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
  ...MAP_LOCATIONS.map((place) => ({ id: place.id, label: place.name })),
]

export const TRAVEL_MODES: { id: TravelModeId; label: string; speedKmh: number; extraMin: number }[] = [
  { id: 'car', label: '자동차', speedKmh: 28, extraMin: 2 },
  { id: 'transit', label: '대중교통', speedKmh: 22, extraMin: 4 },
  { id: 'walk', label: '도보', speedKmh: 4.5, extraMin: 0 },
  { id: 'bike', label: '자전거', speedKmh: 14, extraMin: 0 },
]

export const RESERVATIONS: Reservation[] = []
