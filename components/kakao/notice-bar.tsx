'use client'

import { useState } from 'react'
import { ChevronDown, Megaphone } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Chat } from './chat-data'

export function NoticeBar({ notice }: { notice: NonNullable<Chat['notice']> }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative z-30 bg-[#B2C7DA]/90 px-2 pb-2 backdrop-blur">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="chat-notice-body"
        className="w-full rounded-[10px] bg-white px-3 py-[9px] text-left shadow-[0_1px_3px_rgba(0,0,0,0.08)] transition-opacity active:opacity-80"
      >
        <div className="flex items-center gap-2">
          <Megaphone className="size-[17px] shrink-0 text-[#333333]" strokeWidth={1.9} aria-hidden />
          <span className="sr-only">공지</span>
          <span className={cn('min-w-0 flex-1 text-[13.5px] font-medium tracking-[-0.01em] text-[#191919]', !open && 'truncate')}>
            {notice.title}
          </span>
          <ChevronDown
            className={cn('size-[18px] shrink-0 text-[#8A8A8A] transition-transform duration-200', open && 'rotate-180')}
            aria-hidden
          />
        </div>
        {open && (
          <div id="chat-notice-body" className="mt-2 border-t border-[#EEEEEE] pl-[25px] pt-2">
            <ul className="flex flex-col gap-[3px] text-[13px] leading-[1.45] text-[#333333]">
              {notice.lines.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
            <p className="mt-2 text-[11.5px] text-[#8A8A8A]">{`${notice.author} · 11월 5일 오후 2:42`}</p>
          </div>
        )}
      </button>
    </div>
  )
}
