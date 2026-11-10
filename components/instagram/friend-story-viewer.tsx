'use client'

import Image from 'next/image'
import { Heart, MoreHorizontal, Send, X } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

export type StoryReply = {
  suggestion: string
  responses: string[]
  delayMs: number
}

export type FriendStory = {
  handle: string
  avatar: string
  time: string
  image: { src: string; alt: string }
  /** 여러 장 스토리일 때 순서대로 넘어가는 이미지들 (없으면 image 한 장) */
  images?: { src: string; alt: string }[]
  reply?: StoryReply
  /** 스토리에 태그(@멘션)된 아이디 */
  mention?: string
}

export function FriendStoryViewer({
  story,
  onClose,
  onReply,
  replied = false,
  onOpenProfile,
}: {
  story: FriendStory | null
  onClose: () => void
  onOpenProfile?: (handle: string) => void
  onReply?: (story: FriendStory) => void
  replied?: boolean
}) {
  const [liked, setLiked] = useState(false)
  const [replying, setReplying] = useState(false)
  const [justSent, setJustSent] = useState(false)
  const [shown, setShown] = useState(story)
  const [frame, setFrame] = useState(0)
  if (story && story !== shown) {
    setShown(story)
    setFrame(0)
    setLiked(false)
    setReplying(false)
    setJustSent(false)
  }
  const open = story !== null
  const frames = shown ? (shown.images?.length ? shown.images : [shown.image]) : []
  const current = frames[Math.min(frame, frames.length - 1)]
  const next = () => (frame < frames.length - 1 ? setFrame(frame + 1) : onClose())
  const prev = () => setFrame((f) => Math.max(f - 1, 0))
  const canReply = Boolean(shown?.reply && onReply && !replied)

  const sendReply = () => {
    if (!shown || !canReply) return
    onReply?.(shown)
    setReplying(false)
    setJustSent(true)
  }

  return (
    <section
      aria-label={shown ? `${shown.handle}님의 스토리` : '스토리'}
      aria-hidden={!open}
      inert={!open}
      className={cn(
        'absolute inset-0 z-30 origin-top overflow-hidden bg-black transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] sm:rounded-[55px]',
        open ? 'translate-y-0 scale-100 opacity-100' : 'pointer-events-none -translate-y-6 scale-[0.92] opacity-0',
      )}
    >
      {shown && (
        <>
          <div className="absolute inset-x-0 top-[54px] bottom-[86px] overflow-hidden rounded-[12px]">
            <Image key={current.src} src={current.src} alt={current.alt} fill sizes="400px" className="object-cover" />
            <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/50 to-transparent" />
            {shown.mention && (
              <span className="pointer-events-none absolute left-1/2 top-[64%] -translate-x-1/2 -rotate-[4deg] rounded-[8px] bg-white px-[12px] py-[6px] shadow-[0_2px_10px_rgba(0,0,0,0.25)]">
                <span className="bg-gradient-to-r from-[#f58529] via-[#dd2a7b] to-[#8134af] bg-clip-text text-[17px] font-extrabold uppercase tracking-tight text-transparent">
                  {`@${shown.mention}`}
                </span>
              </span>
            )}

            {frames.length > 1 && (
              <div className="absolute inset-x-0 top-[60px] bottom-0 flex">
                <button type="button" aria-label="이전 스토리" onClick={prev} className="h-full w-1/3" />
                <button type="button" aria-label="다음 스토리" onClick={next} className="h-full flex-1" />
              </div>
            )}

            <div className="absolute inset-x-[10px] top-[10px]">
              <div className="flex gap-[3px]">
                {frames.map((f, i) => (
                  <div key={f.src} className="h-[2.5px] flex-1 overflow-hidden rounded-full bg-white/35">
                    {i < frame && <div className="h-full w-full rounded-full bg-white" />}
                    {i === frame && open && (
                      <div
                        key={`${shown.handle}-${i}`}
                        onAnimationEnd={next}
                        style={{ animationPlayState: replying ? 'paused' : 'running' }}
                        className="h-full w-0 animate-[story-progress_7s_linear_forwards] rounded-full bg-white"
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-[10px] flex items-center gap-[9px] text-white">
                {onOpenProfile ? (
                  <button
                    type="button"
                    onClick={() => onOpenProfile(shown.handle)}
                    aria-label={`${shown.handle}님의 프로필 보기`}
                    className="flex items-center gap-[9px] active:opacity-60"
                  >
                    <Image
                      src={shown.avatar}
                      alt=""
                      width={32}
                      height={32}
                      className="size-[32px] rounded-full object-cover"
                    />
                    <span className="text-[14px] font-semibold">{shown.handle}</span>
                  </button>
                ) : (
                  <>
                    <Image
                      src={shown.avatar}
                      alt=""
                      width={32}
                      height={32}
                      className="size-[32px] rounded-full object-cover"
                    />
                    <span className="text-[14px] font-semibold">{shown.handle}</span>
                  </>
                )}
                <span className="text-[14px] text-white/70">{shown.time}</span>
                <span className="ml-auto flex items-center gap-[14px]">
                  <MoreHorizontal className="size-[22px]" aria-hidden />
                  <button
                    type="button"
                    onClick={onClose}
                    aria-label="스토리 닫기"
                    className="flex size-[44px] items-center justify-end active:opacity-60"
                  >
                    <X className="size-[26px]" strokeWidth={2} />
                  </button>
                </span>
              </div>
            </div>

            {justSent && (
              <p
                role="status"
                className="absolute inset-x-0 bottom-[18px] mx-auto w-fit rounded-full bg-black/60 px-[14px] py-[7px] text-[13px] font-medium text-white backdrop-blur-sm"
              >
                메시지를 보냈습니다
              </p>
            )}
          </div>

          {replying && (
            <button
              type="button"
              aria-label="답장 취소"
              onClick={() => setReplying(false)}
              className="absolute inset-0 bg-black/55"
            />
          )}

          {replying && shown.reply && (
            <div className="absolute inset-x-0 bottom-[86px] flex flex-col items-start gap-[8px] px-[14px] pb-[12px]">
              <span className="text-[12px] font-medium text-white/70">빠른 답장</span>
              <button
                type="button"
                onClick={sendReply}
                className="flex items-center gap-[8px] rounded-full bg-white px-[16px] py-[10px] text-[15px] font-medium text-black shadow-lg transition-transform active:scale-95"
              >
                {shown.reply.suggestion}
                <Send className="size-[16px] text-[#3797F0]" strokeWidth={2.2} aria-hidden />
              </button>
            </div>
          )}

          <div className="absolute inset-x-0 bottom-[30px] flex items-center gap-[12px] px-[14px] text-white">
            {canReply ? (
              <button
                type="button"
                onClick={() => setReplying((v) => !v)}
                aria-expanded={replying}
                className={cn(
                  'flex h-[44px] flex-1 items-center rounded-full border px-[16px] text-left text-[14px] transition-colors',
                  replying ? 'border-white text-white' : 'border-white/50 text-white/80',
                )}
              >
                답장 보내기...
              </button>
            ) : (
              <span className="flex h-[44px] flex-1 items-center rounded-full border border-white/50 px-[16px] text-[14px] text-white/80">
                {replied && shown.reply ? '답장을 보냈습니다' : '메시지 보내기'}
              </span>
            )}
            <button
              type="button"
              onClick={() => setLiked((v) => !v)}
              aria-label={liked ? '좋아요 취소' : '좋아요'}
              aria-pressed={liked}
              className="flex size-[44px] items-center justify-center transition-transform active:scale-75"
            >
              <Heart
                className={cn('size-[26px] transition-colors', liked && 'fill-[#FF3040] text-[#FF3040]')}
                strokeWidth={1.9}
              />
            </button>
            <Send className="size-[25px]" strokeWidth={1.9} aria-hidden />
          </div>
        </>
      )}
    </section>
  )
}
