'use client'

import { useState } from 'react'
import {
  BellOff,
  Ellipsis,
  MessageCircle,
  MessageCirclePlus,
  Pin,
  Search,
  ShoppingBag,
  User,
  Users,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar } from './avatar'
import { BACKGROUND_CHATS, type Chat } from './chat-data'
import { FriendList } from './friend-list'
import { OpenChatList } from './open-chat-list'
import { ShoppingTab } from './shopping-tab'

type ChatListProps = {
  chats: Chat[]
  owner: string
  onOpen: (id: string) => void
}

const TABS = [
  { label: '친구', icon: User, switchable: true },
  { label: '채팅', icon: MessageCircle, switchable: true },
  { label: '오픈채팅', icon: Users, switchable: true },
  { label: '쇼핑', icon: ShoppingBag, switchable: true },
  { label: '더보기', icon: Ellipsis },
] as const

type SwitchableTab = '친구' | '채팅' | '오픈채팅' | '쇼핑'


export function ChatList({ chats, owner, onOpen }: ChatListProps) {
  const [tab, setTab] = useState<SwitchableTab>('채팅')

  return (
    <div className="flex h-full flex-col bg-white text-[#191919]">
      <header className="flex items-center justify-between px-5 pb-2 pt-[60px]">
        <h1 className="text-[22px] font-bold tracking-[-0.02em]">{tab}</h1>
        <div className="flex items-center gap-4">
          <button type="button" aria-label="검색" className="transition-transform active:scale-90">
            <Search className="size-[23px]" strokeWidth={1.9} />
          </button>
          <button type="button" aria-label="새로운 채팅" className="transition-transform active:scale-90">
            <MessageCirclePlus className="size-[24px]" strokeWidth={1.9} />
          </button>
        </div>
      </header>

      {tab === '친구' ? (
        <FriendList chats={chats} owner={owner} />
      ) : tab === '쇼핑' ? (
        <ShoppingTab />
      ) : tab === '오픈채팅' ? (
        <OpenChatList />
      ) : (
      <ul className="flex-1 overflow-y-auto pt-1 [scrollbar-width:none]">
        {chats.map((chat) => (
          <li key={chat.id}>
            <button
              type="button"
              onClick={() => onOpen(chat.id)}
              className="flex w-full items-center gap-3 px-5 py-[9px] text-left transition-colors active:bg-black/[0.05]"
            >
              <Avatar src={chat.avatar} name={chat.name} size={48} />
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1">
                  <span className="truncate text-[15px] font-semibold tracking-[-0.01em]">{chat.name}</span>
                  {chat.members && (
                    <span className="shrink-0 text-[13px] font-medium text-[#A6A6A6]">{chat.members}</span>
                  )}
                  {chat.self && (
                    <span className="flex size-[15px] items-center justify-center rounded-full bg-[#5D5D5D] text-[9px] font-bold text-white">
                      나
                    </span>
                  )}
                  {chat.pinned && (
                    <Pin className="size-[13px] rotate-45 fill-[#9A9A9A] text-[#9A9A9A]" aria-label="고정됨" />
                  )}
                </span>
                <span className="mt-[2px] line-clamp-2 text-[13px] leading-[1.35] text-[#7A7A7A]">
                  {chat.preview}
                </span>
              </span>
              <span className="flex shrink-0 flex-col items-end gap-[6px] self-start pt-[2px]">
                <span className="text-[11px] text-[#9A9A9A]">{chat.time}</span>
                {chat.unread ? (
                  <span
                    className="flex h-[19px] min-w-[19px] items-center justify-center rounded-full bg-[#FA5A3C] px-[5px] text-[11.5px] font-semibold leading-none text-white"
                    aria-label={`읽지 않은 메시지 ${chat.unread}개`}
                  >
                    {chat.unread}
                  </span>
                ) : null}
              </span>
            </button>
          </li>
        ))}
        {BACKGROUND_CHATS.map((chat) => (
          <li key={chat.name}>
            <div className="flex w-full items-center gap-3 px-5 py-[9px]">
              <Avatar name={chat.name} size={48} style={{ backgroundColor: chat.color }} />
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1">
                  <span className="truncate text-[15px] font-semibold tracking-[-0.01em]">{chat.name}</span>
                  {chat.members && (
                    <span className="shrink-0 text-[13px] font-medium text-[#A6A6A6]">{chat.members}</span>
                  )}
                  {chat.muted && <BellOff className="size-[12px] shrink-0 text-[#B4B4B4]" aria-label="알림 꺼짐" />}
                </span>
                <span className="mt-[2px] line-clamp-2 text-[13px] leading-[1.35] text-[#7A7A7A]">
                  {chat.preview}
                </span>
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
                    {chat.unread}
                  </span>
                ) : null}
              </span>
            </div>
          </li>
        ))}
      </ul>
      )}

      <nav
        aria-label="카카오톡 탭"
        className="grid grid-cols-5 border-t border-black/[0.06] bg-white/95 pb-[26px] pt-[8px] backdrop-blur"
      >
        {TABS.map(({ label, icon: Icon, ...rest }) => {
          const active = label === tab
          const switchable = 'switchable' in rest
          return (
          <button
            key={label}
            type="button"
            onClick={switchable ? () => setTab(label as SwitchableTab) : undefined}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'flex flex-col items-center gap-[3px] text-[10px] transition-transform active:scale-90',
              active ? 'font-semibold text-[#191919]' : 'text-[#A6A6A6]',
            )}
          >
            <Icon
              className={cn('size-[24px]', active && 'fill-[#191919]')}
              strokeWidth={active ? 1.6 : 1.8}
              aria-hidden
            />
            {label}
          </button>
          )
        })}
      </nav>
    </div>
  )
}
