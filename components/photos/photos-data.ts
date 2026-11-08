/* 사진 앱 콘텐츠. 이미지는 public/photos/ 등에 넣고 src 경로만 바꾸세요. */
export type Photo = {
  id: string
  src: string
  alt: string
  date: string
  time: string
  place: string
}

export const PHOTOS_SUBTITLE = '2026년 10월'

export const PHOTOS: Photo[] = [
  { id: 'photo-1', src: '/photos/gallery-1.jpg', alt: '카드를 입에 문 닥스훈트', date: '10월 3일 금요일', time: '오전 11:20', place: '집' },
  { id: 'photo-2', src: '/photos/gallery-2.jpg', alt: '진흙투성이 강아지', date: '10월 5일 일요일', time: '오후 4:12', place: '마당' },
  { id: 'photo-3', src: '/photos/gallery-3.jpg', alt: '잡지가 걸린 벽 앞의 남자', date: '10월 8일 수요일', time: '오후 6:48', place: '카페' },
  { id: 'photo-4', src: '/photos/gallery-4.jpg', alt: '바나나 옷을 입은 닥스훈트', date: '10월 11일 토요일', time: '오후 2:05', place: '집' },
  { id: 'photo-5', src: '/photos/gallery-5.jpg', alt: '용산 조형물과 빌딩', date: '10월 14일 화요일', time: '오후 5:51', place: '용산' },
  { id: 'photo-6', src: '/photos/gallery-6.jpg', alt: '넥카라에 팝콘이 쌓인 닥스훈트', date: '10월 18일 토요일', time: '오후 7:42', place: '집' },
  { id: 'photo-7', src: '/photos/gallery-7.jpg', alt: '반짝이는 초록 캐릭터 그림', date: '10월 22일 수요일', time: '오후 9:03', place: '저장된 이미지' },
  { id: 'photo-8', src: '/photos/gallery-8.jpg', alt: '대형 버섯 조형물', date: '10월 23일 목요일', time: '오후 5:27', place: '성수' },
]
