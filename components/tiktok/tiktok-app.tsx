'use client'

import { Forward, Heart, Home, MessageCircle, MessageSquare, Music2, Plus, Search, User, Users, X } from 'lucide-react'
import Image from 'next/image'
import { type FormEvent, useState } from 'react'
import { AppShell } from '@/components/phone/app-shell'
import { cn } from '@/lib/utils'

const BASE_LIKES = 24812

type Comment = { id: number; name: string; text: string; time: string; likes: number }

const INITIAL_COMMENTS: Comment[] = [
  { id: 1, name: 'seoul.night', text: '여기 을지로 맞죠?? 분위기 미쳤다', time: '2시간', likes: 312 },
  { id: 2, name: 'mood_film', text: '노래 정보 알려주세요 ㅠㅠ', time: '1시간', likes: 128 },
  { id: 3, name: 'jiwoo.k', text: '비 오는 날 저장각', time: '58분', likes: 64 },
  { id: 4, name: 'neon_lover', text: '색감 어떻게 보정하셨어요?', time: '31분', likes: 22 },
  { id: 5, name: 'daily.walk', text: '나도 이런 산책 하고 싶다', time: '12분', likes: 7 },
]

const count = (n: number) => n.toLocaleString('ko-KR')

export function TikTokApp({ open }: { open: boolean }) {
  const [liked, setLiked] = useState(false)
  const [commentsOpen, setCommentsOpen] = useState(false)
  const [comments, setComments] = useState(INITIAL_COMMENTS)
  const [draft, setDraft] = useState('')

  function submitComment(event: FormEvent) {
    event.preventDefault()
    const text = draft.trim()
    if (!text) return
    setComments((prev) => [...prev, { id: Date.now(), name: 'me', text, time: '방금', likes: 0 }])
    setDraft('')
  }

  return (
    <AppShell open={open} label="틱톡" className="bg-black text-white">
      <div className="relative flex-1 overflow-hidden">
        <Image src="/images/tiktok-video.png" alt="비 내리는 밤 네온 골목을 걷는 사람" fill priority sizes="402px" className="object-cover" />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/70" />

        <div className="absolute inset-x-0 top-0 flex items-center justify-center gap-4 pt-[54px] text-[16px] font-semibold">
          <span className="text-white/60">팔로잉</span>
          <span className="border-b-2 border-white pb-1">추천</span>
          <button type="button" aria-label="검색" className="absolute right-4 top-[52px]">
            <Search className="size-6" strokeWidth={2.4} aria-hidden />
          </button>
        </div>

        <div className="absolute bottom-4 right-2 flex flex-col items-center gap-4">
          <div className="relative mb-2">
            <div className="flex size-12 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-[#FE2C55] to-[#7B2FF7] text-[16px] font-bold">
              R
            </div>
            <span className="absolute -bottom-2 left-1/2 flex size-5 -translate-x-1/2 items-center justify-center rounded-full bg-[#FE2C55]">
              <Plus className="size-3.5" strokeWidth={3.5} aria-hidden />
            </span>
          </div>

          <button
            type="button"
            aria-pressed={liked}
            aria-label={liked ? '좋아요 취소' : '좋아요'}
            onClick={() => setLiked((v) => !v)}
            className="flex flex-col items-center gap-1"
          >
            <Heart
              aria-hidden
              strokeWidth={0}
              className={cn(
                'size-9 drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)] transition-transform duration-200',
                liked ? 'scale-110 fill-[#FE2C55]' : 'fill-white',
              )}
            />
            <span className="text-[12px] font-semibold tabular-nums [text-shadow:0_1px_2px_rgba(0,0,0,0.6)]">
              {count(BASE_LIKES + (liked ? 1 : 0))}
            </span>
          </button>

          <button type="button" aria-label="댓글 열기" onClick={() => setCommentsOpen(true)} className="flex flex-col items-center gap-1">
            <MessageCircle aria-hidden strokeWidth={0} className="size-9 fill-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]" />
            <span className="text-[12px] font-semibold tabular-nums [text-shadow:0_1px_2px_rgba(0,0,0,0.6)]">{count(comments.length + 1199)}</span>
          </button>

          <button type="button" aria-label="공유" className="flex flex-col items-center gap-1">
            <Forward aria-hidden strokeWidth={0} className="size-9 fill-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]" />
            <span className="text-[12px] font-semibold [text-shadow:0_1px_2px_rgba(0,0,0,0.6)]">공유</span>
          </button>

          <span
            aria-label="음원"
            role="img"
            className="mt-1 flex size-11 animate-[spin_5s_linear_infinite] items-center justify-center rounded-full bg-[conic-gradient(#222,#444,#222,#444,#222)] ring-[6px] ring-[#1a1a1a]"
          >
            <span className="flex size-5 items-center justify-center rounded-full bg-gradient-to-br from-[#FE2C55] to-[#25F4EE]">
              <Music2 className="size-3" strokeWidth={3} aria-hidden />
            </span>
          </span>
        </div>

        <div className="absolute bottom-4 left-3 right-20 [text-shadow:0_1px_3px_rgba(0,0,0,0.6)]">
          <p className="text-[16px] font-bold">@rainy.walk</p>
          <p className="mt-1.5 text-[13.5px] leading-snug">
            비 오는 밤 을지로 골목 산책. 네온사인이 젖은 바닥에 비치는 순간이 제일 좋아요{' '}
            <span className="font-bold">#서울밤 #을지로 #비오는날 #vlog</span>
          </p>
          <p className="mt-2 flex items-center gap-1.5 text-[13px]">
            <Music2 className="size-3.5 shrink-0" strokeWidth={2.6} aria-hidden />
            <span className="truncate">오리지널 사운드 - rainy.walk</span>
          </p>
        </div>
      </div>

      <nav aria-label="틱톡 메뉴" className="grid shrink-0 grid-cols-5 items-center bg-black px-2 pb-[26px] pt-2 text-[10px]">
        <button type="button" aria-current="page" className="flex flex-col items-center gap-0.5 text-white">
          <Home className="size-6 fill-white" strokeWidth={1.8} aria-hidden />홈
        </button>
        <button type="button" className="flex flex-col items-center gap-0.5 text-white/60">
          <Users className="size-6" strokeWidth={1.8} aria-hidden />친구
        </button>
        <button type="button" aria-label="업로드" className="flex justify-center">
          <span className="relative flex h-8 w-12 items-center justify-center">
            <span aria-hidden className="absolute inset-y-0 left-0 w-10 rounded-lg bg-[#25F4EE]" />
            <span aria-hidden className="absolute inset-y-0 right-0 w-10 rounded-lg bg-[#FE2C55]" />
            <span className="relative flex h-8 w-10 items-center justify-center rounded-lg bg-white">
              <Plus className="size-5 text-black" strokeWidth={3} aria-hidden />
            </span>
          </span>
        </button>
        <button type="button" className="flex flex-col items-center gap-0.5 text-white/60">
          <MessageSquare className="size-6" strokeWidth={1.8} aria-hidden />메시지
        </button>
        <button type="button" className="flex flex-col items-center gap-0.5 text-white/60">
          <User className="size-6" strokeWidth={1.8} aria-hidden />프로필
        </button>
      </nav>

      <div
        aria-hidden
        onClick={() => setCommentsOpen(false)}
        className={cn(
          'absolute inset-0 bg-black/40 transition-opacity duration-300',
          commentsOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="댓글"
        aria-hidden={!commentsOpen}
        inert={!commentsOpen}
        className={cn(
          'absolute inset-x-0 bottom-0 flex h-[66%] flex-col rounded-t-2xl bg-white text-[#161823] transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]',
          commentsOpen ? 'translate-y-0' : 'translate-y-full',
        )}
      >
        <div className="relative flex items-center justify-center border-b border-black/5 py-3.5">
          <span className="text-[13px] font-semibold tabular-nums">댓글 {count(comments.length + 1199)}개</span>
          <button
            type="button"
            onClick={() => setCommentsOpen(false)}
            aria-label="닫기"
            className="absolute right-3 flex size-8 items-center justify-center rounded-full active:bg-black/5"
          >
            <X className="size-5" strokeWidth={2.4} aria-hidden />
          </button>
        </div>
        <ul className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
          {comments.map((comment) => (
            <li key={comment.id} className="flex gap-3">
              <span aria-hidden className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#F1F1F2] text-[12px] font-bold text-[#8A8B91]">
                {comment.name[0].toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[12px] font-semibold text-[#8A8B91]">{comment.name}</p>
                <p className="mt-0.5 break-words text-[14px] leading-snug">{comment.text}</p>
                <p className="mt-1 text-[11.5px] text-[#8A8B91]">{comment.time} · 답글</p>
              </div>
              <span className="flex flex-col items-center text-[11px] text-[#8A8B91]">
                <Heart className="size-4" strokeWidth={2} aria-hidden />
                {comment.likes}
              </span>
            </li>
          ))}
        </ul>
        <form onSubmit={submitComment} className="flex items-center gap-2 border-t border-black/5 px-3 pb-8 pt-2.5">
          <label htmlFor="tiktok-comment" className="sr-only">
            댓글 추가
          </label>
          <input
            id="tiktok-comment"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.nativeEvent.isComposing || e.keyCode === 229)) e.preventDefault()
            }}
            placeholder="댓글 추가..."
            className="h-10 flex-1 rounded-full bg-[#F1F1F2] px-4 text-[14px] outline-none placeholder:text-[#8A8B91]"
          />
          <button type="submit" disabled={!draft.trim()} className="px-2 text-[14px] font-bold text-[#FE2C55] disabled:text-[#C6C6C9]">
            게시
          </button>
        </form>
      </div>
    </AppShell>
  )
}
