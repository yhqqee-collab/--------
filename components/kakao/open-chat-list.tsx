import { Bell, BellOff, BookOpen, UtensilsCrossed, User } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

type OpenChat = {
  name: string
  members: number
  preview: string
  time: string
  color: string
  icon: LucideIcon
  unread?: number
  muted?: boolean
}

/** 오픈채팅 탭 배경 목록 (대화 불가, 분위기용) */
const OPEN_CHATS: OpenChat[] = [
  {
    name: '엔시티 위시 품절 MD 정보방',
    members: 1200,
    preview: '이거 풀렸어요',
    time: '오후 11:00',
    color: '#5BC8B0',
    icon: Bell,
    unread: 300,
  },
  {
    name: '[양도]',
    members: 40,
    preview: '감사합니다',
    time: '오후 9:00',
    color: '#4F7DD8',
    icon: BookOpen,
    unread: 5,
  },
  {
    name: '[티빙 쉐어 분철방]',
    members: 4,
    preview: '입금 부탁드립니다~~',
    time: '어제',
    color: '#F2A65A',
    icon: UtensilsCrossed,
    muted: true,
  },
]

function formatUnread(count: number) {
  return count > 299 ? '300+' : String(count)
}

export function OpenChatList() {
  return (
    <ul className="flex-1 overflow-y-auto pt-1 [scrollbar-width:none]">
      {OPEN_CHATS.map((chat) => {
        const Icon = chat.icon
        return (
          <li key={chat.name}>
            <div className="flex w-full items-center gap-3 px-5 py-[9px]">
              <span
                className="flex size-12 shrink-0 items-center justify-center rounded-[18px] text-white"
                style={{ backgroundColor: chat.color }}
                aria-hidden
              >
                <Icon className="size-[22px]" strokeWidth={1.9} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1">
                  <span className="truncate text-[15px] font-semibold tracking-[-0.01em]">{chat.name}</span>
                  {chat.muted && <BellOff className="size-[12px] shrink-0 text-[#B4B4B4]" aria-label="알림 꺼짐" />}
                </span>
                <span className="mt-[1px] flex items-center gap-[2px] text-[11.5px] text-[#A6A6A6]">
                  <User className="size-[11px]" strokeWidth={2.2} aria-hidden />
                  <span>
                    <span className="sr-only">참여자 </span>
                    {chat.members.toLocaleString()}
                  </span>
                </span>
                <span className="mt-[2px] line-clamp-1 text-[13px] leading-[1.35] text-[#7A7A7A]">{chat.preview}</span>
              </span>
              <span className="flex shrink-0 flex-col items-end gap-[6px] self-start pt-[2px]">
                <span className="text-[11px] text-[#9A9A9A]">{chat.time}</span>
                {chat.unread ? (
                  <span
                    className={cn(
                      'flex h-[19px] min-w-[19px] items-center justify-center rounded-full px-[5px] text-[11.5px] font-semibold leading-none text-white',
                      chat.muted ? 'bg-[#C4C4C4]' : 'bg-[#FA5A3C]',
                    )}
                    aria-label={`읽지 않은 메시지 ${chat.unread}개`}
                  >
                    {formatUnread(chat.unread)}
                  </span>
                ) : null}
              </span>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
