'use client'

import Image from 'next/image'
import { ChevronUp, Heart, MoreHorizontal, X } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { MY_AVATAR, MY_STORY, STORY_VIEWERS as VIEWERS } from './instagram-data'

export function StoryViewer({ open, owner, onClose }: { open: boolean; owner: string; onClose: () => void }) {
  const [sheetOpen, setSheetOpen] = useState(false)
  const [wasOpen, setWasOpen] = useState(open)
  if (wasOpen !== open) {
    setWasOpen(open)
    if (!open) setSheetOpen(false)
  }

  const close = () => {
    setSheetOpen(false)
    onClose()
  }

  return (
    <section
      aria-label="내 스토리"
      aria-hidden={!open}
      inert={!open}
      className={cn(
        'absolute inset-0 z-30 origin-top overflow-hidden bg-black transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] sm:rounded-[55px]',
        open ? 'translate-y-0 scale-100 opacity-100' : 'pointer-events-none -translate-y-6 scale-[0.92] opacity-0',
      )}
    >
      <div
        className={cn(
          'absolute inset-x-0 top-[54px] bottom-[86px] origin-top overflow-hidden rounded-[12px] transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]',
          sheetOpen && 'scale-[0.42]',
        )}
      >
        <Image
          src={MY_STORY.src}
          alt={MY_STORY.alt}
          fill
          sizes="400px"
          className="object-cover"
          priority
        />
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/50 to-transparent" />

        <div className="absolute inset-x-[10px] top-[10px]">
          <div className="h-[2.5px] overflow-hidden rounded-full bg-white/35">
            {open && (
              <div
                onAnimationEnd={close}
                style={{ animationPlayState: sheetOpen ? 'paused' : 'running' }}
                className="h-full w-0 animate-[story-progress_7s_linear_forwards] rounded-full bg-white"
              />
            )}
          </div>

          <div className="mt-[10px] flex items-center gap-[9px] text-white">
            <Image src={MY_AVATAR} alt="" width={32} height={32} className="size-[32px] rounded-full object-cover" />
            <span className="text-[14px] font-semibold">내 스토리</span>
            <span className="text-[14px] text-white/70">{MY_STORY.time}</span>
            <span className="ml-auto flex items-center gap-[14px]">
              <MoreHorizontal className="size-[22px]" aria-hidden />
              <button type="button" onClick={close} aria-label="스토리 닫기" className="active:opacity-60">
                <X className="size-[26px]" strokeWidth={2} />
              </button>
            </span>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setSheetOpen(true)}
        aria-expanded={sheetOpen}
        className="absolute inset-x-0 bottom-[30px] flex items-center gap-[10px] px-[16px] text-left text-white active:opacity-70"
      >
        <span className="flex -space-x-[9px]">
          {VIEWERS.map((viewer) => (
            viewer.src ? (
              <Image
                key={viewer.handle}
                src={viewer.src}
                alt=""
                width={28}
                height={28}
                className="size-[28px] rounded-full object-cover ring-2 ring-black"
              />
            ) : (
              <span key={viewer.handle} className="size-[28px] rounded-full bg-[#efefef] ring-2 ring-black" aria-hidden />
            )
          ))}
        </span>
        <span className="flex flex-col text-[13px] leading-tight">
          <span className="flex items-center gap-[3px] font-semibold">
            활동 <ChevronUp className="size-[14px]" strokeWidth={2.6} aria-hidden />
          </span>
          <span className="text-[12px] text-white/60">{VIEWERS[0]?.handle}님 외 {Math.max(VIEWERS.length - 1, 0)}명이 좋아합니다</span>
        </span>
      </button>

      <div
        aria-hidden={!sheetOpen}
        inert={!sheetOpen}
        className={cn(
          'absolute inset-x-0 bottom-0 top-[44%] flex flex-col rounded-t-[16px] bg-[#262626] text-white transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]',
          sheetOpen ? 'translate-y-0' : 'translate-y-full',
        )}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-[16px] pb-[10px] pt-[8px]">
          <span className="w-[44px]" aria-hidden />
          <span className="mx-auto mb-auto h-[4px] w-[36px] rounded-full bg-white/30" aria-hidden />
          <button
            type="button"
            onClick={() => setSheetOpen(false)}
            aria-label="활동 닫기"
            className="flex size-[44px] items-center justify-end active:opacity-60"
          >
            <X className="size-[22px]" />
          </button>
        </div>
        <p className="px-[16px] pb-[6px] pt-[10px] text-[14px] font-semibold">조회 {MY_STORY.views}명 · 좋아요 {VIEWERS.length}개</p>
        <ul className="min-h-0 flex-1 overflow-y-auto px-[16px] pb-[30px] [scrollbar-width:none]">
          {VIEWERS.map((viewer) => (
            <li key={viewer.handle} className="flex items-start gap-[12px] py-[9px]">
              <span className="relative shrink-0">
                {viewer.src ? (
                  <Image
                    src={viewer.src}
                    alt=""
                    width={44}
                    height={44}
                    className="size-[44px] rounded-full object-cover"
                  />
                ) : (
                  <span className="size-[44px] rounded-full bg-[#efefef]" aria-hidden />
                )}
                <Heart
                  className="absolute -bottom-[2px] -right-[3px] size-[16px] fill-[#FF3040] text-[#FF3040]"
                  aria-label="좋아요"
                />
              </span>
              <span className="min-w-0 flex-1 text-[14px] leading-tight">
                <span className="block font-semibold">{viewer.handle}</span>
                <span className="block text-white/55">{viewer.name}</span>
                {viewer.reply && (
                  <span className="mt-[6px] inline-block rounded-[14px] bg-white/10 px-[11px] py-[6px] text-[13.5px]">
                    <span className="sr-only">답장: </span>
                    {viewer.reply}
                  </span>
                )}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
