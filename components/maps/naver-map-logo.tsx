import { cn } from '@/lib/utils'

/** 네이버 지도 스타일의 초록 핀 + N 마크 */
export function NaverMapLogo({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 48 48" className={cn('size-6', className)}>
      <path d="M24 3C14.6 3 7 10.4 7 19.6 7 31.4 24 45 24 45s17-13.6 17-25.4C41 10.4 33.4 3 24 3Z" fill="#03C75A" />
      <path d="M17 12.5h5.4l4.4 7.2v-7.2H32V27h-5.4l-4.4-7.2V27H17Z" fill="#FFFFFF" />
    </svg>
  )
}
