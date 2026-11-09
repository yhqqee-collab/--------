export type MenuItem = { id: string; name: string; price: number; description: string; popular?: boolean }

export type Store = {
  id: string
  name: string
  category: CategoryId
  rating: number
  reviews: number
  minutes: [number, number]
  deliveryFee: number
  minOrder: number
  tagline: string
  thumbnail?: string
  menu: MenuItem[]
}

export type CategoryId = 'chicken' | 'bunsik' | 'burger' | 'chinese' | 'cafe' | 'meat' | 'pizza' | 'night'

/** 배달 받을 주소 — 새 스토리마다 수정하세요. */
export const DELIVERY_ADDRESS = '인가동 12-3 원룸 302호'
export const DELIVERY_LABEL = '집'

export const CATEGORIES: { id: CategoryId; label: string }[] = [
  { id: 'chicken', label: '치킨' },
  { id: 'bunsik', label: '분식' },
  { id: 'burger', label: '버거' },
  { id: 'chinese', label: '중식' },
  { id: 'cafe', label: '카페·디저트' },
  { id: 'meat', label: '고기·구이' },
  { id: 'pizza', label: '피자' },
  { id: 'night', label: '야식' },
]

export const STORES: Store[] = [
  {
    id: 'kyochon',
    name: '교촌치킨 소원대점',
    category: 'chicken',
    rating: 4.9,
    reviews: 1832,
    minutes: [25, 40],
    deliveryFee: 3000,
    minOrder: 16000,
    tagline: '허니콤보 단골 많은 집',
    thumbnail: '/images/baemin/kyochon.png',
    menu: [
      { id: 'k1', name: '허니콤보', price: 23000, description: '달콤한 허니소스 + 날개·다리', popular: true },
      { id: 'k2', name: '레드콤보', price: 23000, description: '매콤한 청양고추 소스', popular: true },
      { id: 'k3', name: '교촌오리지날', price: 19000, description: '마늘간장 소스 한 마리' },
      { id: 'k4', name: '웨지감자', price: 4000, description: '바삭한 사이드' },
      { id: 'k5', name: '콜라 1.25L', price: 2500, description: '음료' },
    ],
  },
  {
    id: 'yupdduk',
    name: '동대문엽기떡볶이 소원대점',
    category: 'bunsik',
    rating: 4.8,
    reviews: 2410,
    minutes: [30, 45],
    deliveryFee: 2500,
    minOrder: 14000,
    tagline: '시험기간 야식 1등',
    thumbnail: '/images/baemin/yupdduk.png',
    menu: [
      { id: 'y1', name: '엽기떡볶이 (오리지널)', price: 14000, description: '매운맛 단계 선택', popular: true },
      { id: 'y2', name: '엽기로제떡볶이', price: 16000, description: '크림 로제 소스', popular: true },
      { id: 'y3', name: '주먹김밥', price: 2500, description: '떡볶이 국물에 쏙' },
      { id: 'y4', name: '모둠튀김', price: 5000, description: '김말이·만두·오징어' },
      { id: 'y5', name: '쿨피스', price: 2000, description: '매운맛 중화' },
    ],
  },
  {
    id: 'momstouch',
    name: '맘스터치 소원대점',
    category: 'burger',
    rating: 4.7,
    reviews: 964,
    minutes: [20, 35],
    deliveryFee: 2000,
    minOrder: 12000,
    tagline: '싸이버거 세트 할인 중',
    thumbnail: '/images/baemin/momstouch.png',
    menu: [
      { id: 'm1', name: '싸이버거 세트', price: 8400, description: '싸이버거 + 감자튀김 + 음료', popular: true },
      { id: 'm2', name: '불싸이버거 세트', price: 8900, description: '매콤한 불싸이' },
      { id: 'm3', name: '케이준양념감자', price: 2800, description: '사이드' },
      { id: 'm4', name: '치킨너겟 6조각', price: 3500, description: '사이드' },
    ],
  },
  {
    id: 'hongkong',
    name: '홍콩반점0410 소원대점',
    category: 'chinese',
    rating: 4.6,
    reviews: 711,
    minutes: [25, 40],
    deliveryFee: 3000,
    minOrder: 15000,
    tagline: '짬뽕 국물 진한 집',
    thumbnail: '/images/baemin/hongkong.png',
    menu: [
      { id: 'h1', name: '짬뽕', price: 8500, description: '불맛 가득', popular: true },
      { id: 'h2', name: '짜장면', price: 7000, description: '기본에 충실' },
      { id: 'h3', name: '탕수육 (소)', price: 15000, description: '찍먹·부먹 선택', popular: true },
      { id: 'h4', name: '군만두', price: 5500, description: '6개' },
    ],
  },
  {
    id: 'starbucks',
    name: '스타벅스 소원대정문점',
    category: 'cafe',
    rating: 4.8,
    reviews: 532,
    minutes: [20, 30],
    deliveryFee: 3000,
    minOrder: 15000,
    tagline: '딜리버스 주문 가능',
    menu: [
      { id: 's1', name: '아이스 아메리카노 (Tall)', price: 4700, description: '진한 에스프레소', popular: true },
      { id: 's2', name: '자몽 허니 블랙 티', price: 5700, description: '상큼한 티 음료' },
      { id: 's3', name: '부드러운 생크림 카스텔라', price: 4900, description: '디저트' },
      { id: 's4', name: '돌체 라떼', price: 6100, description: '달콤한 라떼' },
    ],
  },
  {
    id: 'myeongryun',
    name: '명륜진사갈비 구서점',
    category: 'meat',
    rating: 4.5,
    reviews: 288,
    minutes: [35, 50],
    deliveryFee: 4000,
    minOrder: 20000,
    tagline: '숯불 돼지갈비 배달',
    thumbnail: '/images/baemin/myeongryun.png',
    menu: [
      { id: 'g1', name: '숯불 돼지갈비 2인', price: 26000, description: '쌈채소 포함', popular: true },
      { id: 'g2', name: '양념 목살 1인', price: 14000, description: '도시락형' },
      { id: 'g3', name: '된장찌개', price: 5000, description: '사이드' },
    ],
  },
  {
    id: 'pizza',
    name: '피자스쿨 소원대점',
    category: 'pizza',
    rating: 4.6,
    reviews: 845,
    minutes: [30, 45],
    deliveryFee: 2000,
    minOrder: 12000,
    tagline: '가성비 피자',
    thumbnail: '/images/baemin/pizzaschool.png',
    menu: [
      { id: 'p1', name: '포테이토 피자 (L)', price: 13900, description: '감자 + 베이컨', popular: true },
      { id: 'p2', name: '페퍼로니 피자 (L)', price: 12900, description: '클래식' },
      { id: 'p3', name: '치즈오븐스파게티', price: 6900, description: '사이드' },
    ],
  },
  {
    id: 'bunsik',
    name: '북문분식',
    category: 'night',
    rating: 4.7,
    reviews: 402,
    minutes: [20, 30],
    deliveryFee: 1500,
    minOrder: 10000,
    tagline: '새벽 3시까지 배달',
    menu: [
      { id: 'b1', name: '라볶이', price: 6500, description: '라면 + 떡볶이', popular: true },
      { id: 'b2', name: '참치김밥', price: 4500, description: '든든한 한 줄' },
      { id: 'b3', name: '치즈돈까스', price: 9000, description: '모짜렐라 듬뿍' },
      { id: 'b4', name: '순대 (1인분)', price: 4500, description: '간·허파 포함' },
    ],
  },
]

export const ORDER_STEPS = ['주문 접수', '조리 중', '배달 중', '배달 완료'] as const

export function won(value: number) {
  return `${value.toLocaleString('ko-KR')}원`
}
