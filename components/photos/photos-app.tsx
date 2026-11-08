'use client'

import { ChevronLeft, ChevronRight, Heart, Info, Search, Share, Trash2 } from 'lucide-react'
import Image from 'next/image'
import { useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { PHOTOS, PHOTOS_SUBTITLE } from './photos-data'

function PhotoViewer({
  index,
  onClose,
  onChange,
  liked,
  onToggleLike,
}: {
  index: number | null
  onClose: () => void
  onChange: (index: number) => void
  liked: boolean
  onToggleLike: () => void
}) {
  const open = index !== null
  const [lastIndex, setLastIndex] = useState(0)
  if (index !== null && index !== lastIndex) setLastIndex(index)
  const current = index ?? lastIndex
  const photo = PHOTOS[current]
  const touchX = useRef<number | null>(null)

  const go = (delta: number) => {
    const next = current + delta
    if (next >= 0 && next < PHOTOS.length) onChange(next)
  }

  if (!photo) return null

  return (
    <div
      role="dialog"
      aria-label="사진 보기"
      aria-hidden={!open}
      inert={!open}
      className={cn(
        'absolute inset-0 z-10 flex flex-col bg-white transition-all duration-[400ms] ease-[cubic-bezier(0.32,0.72,0,1)]',
        open ? 'scale-100 opacity-100' : 'pointer-events-none scale-90 opacity-0',
      )}
    >
      <header className="relative flex shrink-0 items-center px-2 pb-2 pt-[54px]">
        <button
          type="button"
          onClick={onClose}
          aria-label="보관함으로 돌아가기"
          className="flex size-11 items-center justify-center rounded-full bg-black/[0.05] text-black active:scale-95"
        >
          <ChevronLeft className="size-6" strokeWidth={2.2} aria-hidden />
        </button>
        <div className="flex min-w-0 flex-1 flex-col items-center px-2 text-center">
          <span className="truncate text-[16px] font-semibold text-black">{photo.date}</span>
          <span className="truncate text-[12.5px] text-[#8E8E93]">
            {photo.place} · {photo.time}
          </span>
        </div>
        <span className="size-11 shrink-0" aria-hidden />
      </header>

      <div
        className="relative min-h-0 flex-1 touch-pan-y"
        onTouchStart={(e) => {
          touchX.current = e.touches[0].clientX
        }}
        onTouchEnd={(e) => {
          if (touchX.current === null) return
          const dx = e.changedTouches[0].clientX - touchX.current
          touchX.current = null
          if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1)
        }}
      >
        <Image
          key={photo.id}
          src={photo.src || '/placeholder.svg'}
          alt={photo.alt}
          fill
          sizes="402px"
          className="animate-in fade-in object-contain duration-300"
        />
        {current > 0 && (
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="이전 사진"
            className="absolute left-2 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/70 text-black shadow-sm backdrop-blur-md active:scale-95"
          >
            <ChevronLeft className="size-5" strokeWidth={2.4} aria-hidden />
          </button>
        )}
        {current < PHOTOS.length - 1 && (
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="다음 사진"
            className="absolute right-2 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/70 text-black shadow-sm backdrop-blur-md active:scale-95"
          >
            <ChevronRight className="size-5" strokeWidth={2.4} aria-hidden />
          </button>
        )}
      </div>

      <div className="flex shrink-0 items-center justify-center gap-[6px] py-3" aria-hidden>
        {PHOTOS.map((p, i) => (
          <span
            key={p.id}
            className={cn(
              'relative h-[38px] overflow-hidden rounded-[4px] transition-all duration-300',
              i === current ? 'w-[38px] ring-2 ring-[#0A84FF]' : 'w-[24px] opacity-70',
            )}
          >
            <Image src={p.src || '/placeholder.svg'} alt="" fill sizes="40px" className="object-cover" />
          </span>
        ))}
      </div>

      <nav aria-label="사진 도구" className="flex shrink-0 items-center justify-between px-6 pb-[34px] pt-1">
        <button
          type="button"
          aria-label="공유"
          className="flex size-11 items-center justify-center rounded-full text-[#0A84FF] active:scale-95"
        >
          <Share className="size-[22px]" strokeWidth={2} aria-hidden />
        </button>
        <button
          type="button"
          onClick={onToggleLike}
          aria-label={liked ? '즐겨찾기 해제' : '즐겨찾기'}
          aria-pressed={liked}
          className="flex size-11 items-center justify-center rounded-full text-[#0A84FF] active:scale-95"
        >
          <Heart className={cn('size-[22px]', liked && 'fill-[#0A84FF]')} strokeWidth={2} aria-hidden />
        </button>
        <button
          type="button"
          aria-label="정보"
          className="flex size-11 items-center justify-center rounded-full text-[#0A84FF] active:scale-95"
        >
          <Info className="size-[22px]" strokeWidth={2} aria-hidden />
        </button>
        <button
          type="button"
          aria-label="삭제"
          className="flex size-11 items-center justify-center rounded-full text-[#0A84FF] active:scale-95"
        >
          <Trash2 className="size-[22px]" strokeWidth={2} aria-hidden />
        </button>
      </nav>
    </div>
  )
}

export function PhotosApp({ open }: { open: boolean }) {
  const [viewIndex, setViewIndex] = useState<number | null>(null)
  const [likedIds, setLikedIds] = useState<string[]>([])
  const viewing = open ? viewIndex : null
  const currentId = viewIndex !== null ? PHOTOS[viewIndex].id : null

  return (
    <section
      aria-label="사진"
      aria-hidden={!open}
      inert={!open}
      className={cn(
        'absolute inset-0 z-20 flex origin-[16%_40%] flex-col overflow-hidden bg-white transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] sm:rounded-[55px]',
        open ? 'scale-100 opacity-100' : 'pointer-events-none scale-[0.2] opacity-0',
      )}
    >
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        <header className="flex shrink-0 items-end justify-between px-4 pb-3 pt-[58px]">
          <div>
            <h1 className="text-[32px] font-bold leading-tight tracking-tight text-black">보관함</h1>
            <p className="text-[14px] text-[#8E8E93]">사진 {PHOTOS.length}장 · {PHOTOS_SUBTITLE}</p>
          </div>
          <div className="mb-1 flex items-center gap-2">
            <button
              type="button"
              aria-label="검색"
              className="flex size-11 items-center justify-center rounded-full bg-black/[0.05] text-black active:scale-95"
            >
              <Search className="size-[18px]" strokeWidth={2.4} aria-hidden />
            </button>
            <button
              type="button"
              className="h-11 rounded-full bg-black/[0.05] px-4 text-[15px] font-semibold text-black active:scale-95"
            >
              선택
            </button>
          </div>
        </header>

        {PHOTOS.length === 0 && (
          <p className="px-4 py-16 text-center text-[15px] text-[#8E8E93]">사진 또는 비디오 없음</p>
        )}
        <ul className="grid grid-cols-3 gap-[2px]">
          {PHOTOS.map((photo, i) => (
            <li key={photo.id}>
              <button
                type="button"
                onClick={() => setViewIndex(i)}
                aria-label={`${photo.date} 사진 열기`}
                className="relative block aspect-square w-full overflow-hidden bg-[#F2F2F7] transition-transform active:scale-[0.97]"
              >
                <Image src={photo.src || '/placeholder.svg'} alt={photo.alt} fill sizes="134px" className="object-cover" />
                {likedIds.includes(photo.id) && (
                  <Heart
                    className="absolute bottom-[5px] left-[5px] size-[14px] fill-white text-white drop-shadow"
                    aria-label="즐겨찾기됨"
                  />
                )}
              </button>
            </li>
          ))}
        </ul>

        <div className="mt-auto px-4 pb-[40px] pt-8">
          <div className="mx-auto flex w-fit items-center gap-1 rounded-full bg-[#F2F2F7] p-1 text-[14px] font-semibold">
            <span className="rounded-full px-4 py-[7px] text-[#8E8E93]">년</span>
            <span className="rounded-full px-4 py-[7px] text-[#8E8E93]">월</span>
            <span className="rounded-full bg-white px-4 py-[7px] text-black shadow-sm">전체</span>
          </div>
        </div>
      </div>

      <PhotoViewer
        index={viewing}
        onClose={() => setViewIndex(null)}
        onChange={setViewIndex}
        liked={currentId !== null && likedIds.includes(currentId)}
        onToggleLike={() => {
          if (!currentId) return
          setLikedIds((ids) => (ids.includes(currentId) ? ids.filter((id) => id !== currentId) : [...ids, currentId]))
        }}
      />
    </section>
  )
}
