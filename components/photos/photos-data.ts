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

export const PHOTOS: Photo[] = []
