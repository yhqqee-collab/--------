'use client'

import { Bell, CalendarDays, Heart, Home, MessageCircle, Search, User } from 'lucide-react'
import { useState } from 'react'
import { AppShell } from '@/components/phone/app-shell'
import { cn } from '@/lib/utils'
import {
  CLASSES,
  FAVORITE_BOARDS,
  POSTS,
  SCHOOL_NAME,
  TIMETABLE_DAYS,
  TIMETABLE_END_HOUR,
  TIMETABLE_START_HOUR,
  type BoardPost,
} from './everytime-data'

type Tab = 'home' | 'timetable'

const HOUR_HEIGHT = 52

export function EverytimeApp({ open }: { open: boolean }) {
  const [tab, setTab] = useState<Tab>('home')

  return (
    <AppShell open={open} label="에브리타임" className="bg-white text-[#222]">
      <div className="min-h-0 flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {tab === 'home' ? <HomeTab /> : <TimetableTab />}
      </div>

      <nav aria-label="에브리타임 메뉴" className="flex shrink-0 justify-around border-t border-[#EEE] bg-white pb-[26px] pt-2">
        <TabButton label="홈" active={tab === 'home'} onClick={() => setTab('home')}>
          <Home className="size-6" aria-hidden />
        </TabButton>
        <TabButton label="시간표" active={tab === 'timetable'} onClick={() => setTab('timetable')}>
          <CalendarDays className="size-6" aria-hidden />
        </TabButton>
        <TabButton label="알림">
          <Bell className="size-6" aria-hidden />
        </TabButton>
        <TabButton label="내 정보">
          <User className="size-6" aria-hidden />
        </TabButton>
      </nav>
    </AppShell>
  )
}

function TabButton({
  label,
  active = false,
  onClick,
  children,
}: {
  label: string
  active?: boolean
  onClick?: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-current={active ? 'page' : undefined}
      className={cn('flex min-h-11 min-w-11 items-center justify-center', active ? 'text-[#C62917]' : 'text-[#AAA]')}
    >
      {children}
    </button>
  )
}

function HomeTab() {
  return (
    <>
      <header className="flex items-end justify-between px-5 pb-3 pt-[62px]">
        <div>
          <p className="text-[11px] font-semibold text-[#C62917]">에브리타임</p>
          <h1 className="text-[22px] font-bold tracking-tight">{SCHOOL_NAME}</h1>
        </div>
        <div className="flex items-center gap-1">
          <span className="flex size-10 items-center justify-center" aria-hidden>
            <Search className="size-6" />
          </span>
          <span className="flex size-10 items-center justify-center" aria-hidden>
            <User className="size-6" />
          </span>
        </div>
      </header>

      <section aria-labelledby="et-favorites" className="mx-4 rounded-2xl border border-[#EEE] p-4">
        <h2 id="et-favorites" className="mb-2 text-[15px] font-bold">
          즐겨찾는 게시판
        </h2>
        <ul className="flex flex-col">
          {FAVORITE_BOARDS.map((board) => {
            const latest = POSTS.find((post) => post.board === board)
            return (
              <li key={board} className="flex items-center gap-3 py-[7px] text-[13px]">
                <span className="w-[76px] shrink-0 font-semibold">{board}</span>
                <span className="truncate text-[#888]">{latest?.title ?? '새 글이 없습니다'}</span>
              </li>
            )
          })}
        </ul>
      </section>

      <section aria-labelledby="et-recent" className="mx-4 mb-6 mt-4 rounded-2xl border border-[#EEE]">
        <h2 id="et-recent" className="px-4 pb-1 pt-4 text-[15px] font-bold">
          실시간 인기 글
        </h2>
        <ul className="divide-y divide-[#F2F2F2]">
          {POSTS.map((post) => (
            <PostRow key={post.id} post={post} />
          ))}
        </ul>
      </section>
    </>
  )
}

function PostRow({ post }: { post: BoardPost }) {
  return (
    <li className="px-4 py-3">
      <p className="text-[14px] font-semibold">{post.title}</p>
      <p className="mt-0.5 line-clamp-2 text-[13px] leading-snug text-[#666]">{post.body}</p>
      <div className="mt-1.5 flex items-center gap-2 text-[11px] text-[#AAA]">
        <span>{post.board}</span>
        <span>{post.time}</span>
        <span className="ml-auto flex items-center gap-0.5 text-[#C62917]">
          <Heart className="size-3" aria-hidden />
          <span className="sr-only">공감</span>
          {post.likes}
        </span>
        <span className="flex items-center gap-0.5 text-[#0CA5B0]">
          <MessageCircle className="size-3" aria-hidden />
          <span className="sr-only">댓글</span>
          {post.comments}
        </span>
      </div>
    </li>
  )
}

function TimetableTab() {
  const hours = Array.from({ length: TIMETABLE_END_HOUR - TIMETABLE_START_HOUR }, (_, i) => TIMETABLE_START_HOUR + i)

  return (
    <>
      <header className="px-5 pb-3 pt-[62px]">
        <p className="text-[11px] font-semibold text-[#C62917]">2026년 2학기</p>
        <h1 className="text-[22px] font-bold tracking-tight">시간표 1</h1>
      </header>

      <div className="mx-4 mb-6 overflow-hidden rounded-xl border border-[#EEE]">
        <div className="flex border-b border-[#EEE] text-[11px] text-[#888]">
          <span className="w-6 shrink-0" />
          {TIMETABLE_DAYS.map((day) => (
            <span key={day} className="flex-1 border-l border-[#EEE] py-1.5 text-center">
              {day}
            </span>
          ))}
        </div>
        <div className="flex">
          <div className="w-6 shrink-0">
            {hours.map((hour) => (
              <div key={hour} style={{ height: HOUR_HEIGHT }} className="border-b border-[#F2F2F2] pr-1 pt-0.5 text-right text-[10px] text-[#AAA]">
                {hour > 12 ? hour - 12 : hour}
              </div>
            ))}
          </div>
          {TIMETABLE_DAYS.map((day, dayIndex) => (
            <div key={day} className="relative flex-1 border-l border-[#EEE]">
              {hours.map((hour) => (
                <div key={hour} style={{ height: HOUR_HEIGHT }} className="border-b border-[#F2F2F2]" />
              ))}
              {CLASSES.filter((item) => item.day === dayIndex).map((item) => (
                <div
                  key={item.id}
                  className="absolute inset-x-0 overflow-hidden px-1 py-1 text-white"
                  style={{
                    top: (item.start - TIMETABLE_START_HOUR) * HOUR_HEIGHT,
                    height: (item.end - item.start) * HOUR_HEIGHT,
                    backgroundColor: item.color,
                  }}
                >
                  <p className="text-[10px] font-bold leading-tight">{item.name}</p>
                  <p className="mt-0.5 text-[9px] leading-tight opacity-90">{item.room}</p>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
