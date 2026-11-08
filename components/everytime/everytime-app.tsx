'use client'

import {
  Bell,
  CalendarClock,
  ChevronDown,
  ChevronLeft,
  Gift,
  Home,
  LayoutGrid,
  Library,
  ListChecks,
  Megaphone,
  MessageCircle,
  MessageCirclePlus,
  MessagesSquare,
  MoreVertical,
  Plus,
  School,
  Search,
  Settings,
  ShoppingBag,
  Smile,
  Sparkles,
  SquarePlus,
} from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'
import { AppShell } from '@/components/phone/app-shell'
import { cn } from '@/lib/utils'
import {
  CURRENT_SEMESTER,
  FAVORITE_BOARDS,
  MY_CLASSES,
  PAST_SEMESTERS,
  SCHOOL_NAME,
  type Friend,
} from './everytime-data'
import { FriendSheet } from './friend-sheet'
import { TimetableGrid } from './timetable-grid'

type Tab = 'home' | 'timetable'

const SCROLL = 'min-h-0 flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'

export function EverytimeApp({ open }: { open: boolean }) {
  const [tab, setTab] = useState<Tab>('home')
  const [friend, setFriend] = useState<Friend | null>(null)

  return (
    <AppShell open={open} label="에브리타임" className="bg-white text-[#222]">
      {friend ? (
        <FriendTimetable friend={friend} onBack={() => setFriend(null)} />
      ) : (
        <>
          {tab === 'home' ? (
            <div className={cn(SCROLL, 'bg-[#F6F6F6]')}>
              <HomeTab />
            </div>
          ) : (
            <TimetableTab onSelectFriend={setFriend} />
          )}

          <nav
            aria-label="에브리타임 메뉴"
            className="flex shrink-0 justify-around border-t border-[#EEE] bg-white pb-[24px] pt-1.5"
          >
            <TabButton label="홈" active={tab === 'home'} onClick={() => setTab('home')} icon={Home} />
            <TabButton label="시간표" active={tab === 'timetable'} onClick={() => setTab('timetable')} icon={LayoutGrid} />
            <TabButton label="게시판" icon={MessageCircle} />
            <TabButton label="채팅" icon={MessagesSquare} />
            <TabButton label="쇼핑" icon={ShoppingBag} />
          </nav>
        </>
      )}
    </AppShell>
  )
}

function TabButton({
  label,
  active = false,
  onClick,
  icon: Icon,
}: {
  label: string
  active?: boolean
  onClick?: () => void
  icon: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean }>
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'flex min-h-11 min-w-14 flex-col items-center justify-center gap-0.5 text-[11px]',
        active ? 'font-bold text-[#222]' : 'text-[#AAA]',
      )}
    >
      <Icon className={cn('size-6', active ? 'fill-[#222]' : 'fill-[#BBB]')} aria-hidden />
      {label}
    </button>
  )
}

const SHORTCUTS = [
  { label: 'AI 라운지', icon: Sparkles, color: '#6C8CF5' },
  { label: '학생할인', icon: Gift, color: '#FF8A5B' },
  { label: '모임일정 투표', icon: CalendarClock, color: '#F0464F' },
  { label: '학교 홈', icon: School, color: '#F0464F' },
  { label: '학교뉴스', icon: Megaphone, color: '#F0464F' },
  { label: '열람실 현황', icon: Library, color: '#F2A43A' },
]

function HomeTab() {
  return (
    <>
      <header className="flex items-center justify-between bg-white px-5 pb-2 pt-[58px]">
        <Image src="/images/icons/everytime.png" alt="에브리타임" width={40} height={40} className="size-10" />
        <div className="flex items-center gap-1" aria-hidden>
          <span className="flex size-10 items-center justify-center">
            <Search className="size-6" />
          </span>
          <span className="relative flex size-10 items-center justify-center">
            <Bell className="size-6" />
            <span className="absolute right-0 top-0.5 rounded-full bg-[#F0302B] px-1.5 text-[10px] font-bold leading-4 text-white">
              49
            </span>
          </span>
          <span className="ml-1 flex size-9 items-center justify-center rounded-full bg-[#D9F0D9]">
            <Smile className="size-6 text-[#7AC47A]" />
          </span>
        </div>
      </header>

      <div className="bg-white px-5 pb-5">
        <h1 className="mt-3 text-[24px] font-bold tracking-tight">{SCHOOL_NAME}</h1>

        <section aria-label="할 일" className="mt-3 w-[58%] rounded-2xl border border-[#EAEAEA] p-4">
          <p className="text-[16px] font-bold">할 일</p>
          <p className="text-[13px] text-[#777]">11월 8일 (일)</p>
          <div className="mt-7 flex items-center gap-3 text-[13px] font-semibold text-[#666]">
            <span className="flex items-center gap-1">
              <SquarePlus className="size-4" aria-hidden /> 추가
            </span>
            <span className="flex items-center gap-1">
              <ListChecks className="size-4" aria-hidden /> 더보기
            </span>
          </div>
        </section>

        <ul className="mt-6 grid grid-cols-6 gap-1">
          {SHORTCUTS.map(({ label, icon: Icon, color }) => (
            <li key={label} className="flex flex-col items-center gap-1.5 text-center">
              <Icon className="size-8" style={{ color }} aria-hidden />
              <span className="text-[11px] leading-tight text-[#444]">{label}</span>
            </li>
          ))}
        </ul>

        <div className="mt-5 rounded-2xl bg-[#F8DFC4] px-5 py-5">
          <p className="text-[17px] font-extrabold">학생이면 묻고 더블로 할인</p>
          <p className="mt-0.5 text-[14px] font-bold text-[#7A6656]">통신사 할인 + 교육할인 받기</p>
        </div>
      </div>

      <section aria-labelledby="et-favorites" className="px-5 pb-6 pt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 id="et-favorites" className="text-[20px] font-bold">
            즐겨찾는 게시판
          </h2>
          <span className="text-[13px] font-semibold text-[#999]">더보기</span>
        </div>
        <ul className="rounded-2xl border border-[#EAEAEA] bg-white px-4 py-2">
          {FAVORITE_BOARDS.map(({ board, latest }) => (
            <li key={board} className="flex items-center gap-3 py-2.5 text-[14px]">
              <span className="shrink-0">{board}</span>
              <span className="min-w-0 flex-1 truncate text-[13px] text-[#888]">{latest}</span>
              <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-[#F0302B] text-[9px] font-bold text-white">
                N<span className="sr-only">새 글</span>
              </span>
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}

function TimetableTab({ onSelectFriend }: { onSelectFriend: (friend: Friend) => void }) {
  return (
    <div className="relative min-h-0 flex-1 overflow-hidden">
      <div className={cn(SCROLL, 'h-full pb-[210px]')}>
        <header className="flex items-end justify-between px-5 pb-3 pt-[58px]">
          <div>
            <p className="text-[12px] font-semibold text-[#C62917]">{CURRENT_SEMESTER}</p>
            <h1 className="flex items-center gap-1 text-[24px] font-bold tracking-tight">
              시간표 <ChevronDown className="size-5" aria-hidden />
            </h1>
          </div>
          <div className="flex items-center gap-3" aria-hidden>
            <Plus className="size-6" />
            <Settings className="size-6" />
          </div>
        </header>
        <div className="px-3">
          <TimetableGrid classes={MY_CLASSES} />
        </div>
      </div>
      <FriendSheet onSelect={onSelectFriend} />
    </div>
  )
}

function FriendTimetable({ friend, onBack }: { friend: Friend; onBack: () => void }) {
  const semesters = [CURRENT_SEMESTER, ...PAST_SEMESTERS]

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <header className="flex shrink-0 items-center justify-between px-2 pb-2 pt-[54px]">
        <button type="button" onClick={onBack} aria-label="뒤로" className="flex size-11 items-center justify-center">
          <ChevronLeft className="size-7" aria-hidden />
        </button>
        <h1 className="text-[18px] font-bold">{friend.name}</h1>
        <span className="flex size-11 items-center justify-center" aria-hidden>
          <MoreVertical className="size-5" />
        </span>
      </header>

      <div className="flex shrink-0 gap-5 overflow-x-auto border-b border-[#EEE] px-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {semesters.map((semester, index) => (
          <span
            key={semester}
            className={cn(
              'shrink-0 whitespace-nowrap pb-2.5 pt-1 text-[15px]',
              index === 0 ? 'border-b-2 border-[#222] font-bold text-[#222]' : 'text-[#AAA]',
            )}
          >
            {semester}
          </span>
        ))}
      </div>

      <div className={cn(SCROLL, 'px-3 pb-24 pt-4')}>
        <TimetableGrid classes={friend.classes ?? []} />
      </div>

      <span
        className="absolute bottom-8 right-5 flex size-14 items-center justify-center rounded-full bg-[#2B2B2B] shadow-lg"
        aria-hidden
      >
        <MessageCirclePlus className="size-6 text-white" />
      </span>
    </div>
  )
}
