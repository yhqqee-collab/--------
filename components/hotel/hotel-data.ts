export type Room = {
  id: string
  name: string
  detail: string
  price: number
}

export type Stay = {
  id: string
  category: string
  name: string
  area: string
  rating: number
  reviews: number
  tone: string
  image: string
  tags: string[]
  description: string
  rooms: Room[]
}

export type Booking = {
  id: string
  stayName: string
  area: string
  date: string
  time: string
  type: string
  room: string
  price: number
  tone: string
  image: string
}

export const MY_BOOKINGS: Booking[] = []

export const STAY_CATEGORIES = ['전체', '호텔', '모텔', '펜션', '게스트하우스']

export const STAY_SEARCH = {
  location: '서울 전체',
  dates: '10.25 일 - 10.26 월',
  nights: 1,
  guests: 2,
}

export const STAYS: Stay[] = [
  {
    id: 's1',
    category: '호텔',
    name: '리드 호텔',
    area: '역에서 도보 3분',
    rating: 4.8,
    reviews: 1284,
    tone: 'from-[#CFE6F7] to-[#8FC1E6]',
    image: '/images/hotel/motel-room-2.png',
    tags: ['무료 주차', '조식'],
    description: '초초역세권 가성비',
    rooms: [
      { id: 's1-r1', name: '스탠다드 더블', detail: '기준 2인 · 최대 2인', price: 98000 },
      { id: 's1-r2', name: '디럭스 트윈', detail: '기준 2인 · 최대 3인', price: 132000 },
    ],
  },
  {
    id: 's2',
    category: '모텔',
    name: '지니어스 모텔',
    area: '역에서 도보 5분',
    rating: 4.6,
    reviews: 842,
    tone: 'from-[#E4DDF5] to-[#B8A9E3]',
    image: '/images/hotel/motel-room-1.png',
    tags: ['대실 가능', '스파'],
    description: '주차 미리 연락해주세요',
    rooms: [
      { id: 's2-r1', name: '일반실', detail: '기준 2인 · 최대 2인', price: 55000 },
      { id: 's2-r2', name: '스파 특실', detail: '기준 2인 · 최대 2인', price: 79000 },
    ],
  },
  {
    id: 's3',
    category: '펜션',
    name: '센트럴 펜션',
    area: '바다 전망',
    rating: 4.9,
    reviews: 356,
    tone: 'from-[#D6EFE2] to-[#94D1B1]',
    image: '/images/hotel/pension-exterior.png',
    tags: ['바비큐', '오션뷰'],
    description: '우션뷰 우선배정',
    rooms: [
      { id: 's3-r1', name: '커플룸', detail: '기준 2인 · 최대 2인', price: 120000 },
      { id: 's3-r2', name: '패밀리룸', detail: '기준 4인 · 최대 6인', price: 180000 },
    ],
  },
  {
    id: 's4',
    category: '모텔',
    name: '비너스 호텔',
    area: ' 역에서 도보 1분',
    rating: 4.5,
    reviews: 210,
    tone: 'from-[#F7E3CF] to-[#E9B98F]',
    image: '/images/hotel/motel-exterior.png',
    tags: ['공용 라운지'],
    description: '주차타워 SUV 주차 불가, 도보 특가',
    rooms: [
      { id: 's4-r1', name: '트윈룸', detail: '기준 2인 · 최대 2인', price: 58000 },
      { id: 's4-r2', name: '더블룸', detail: '기준 2인 · 최대 3인', price: 62000 },
    ],
  },
]
