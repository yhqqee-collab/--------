'use client'

import { ArrowUp, ChevronLeft, ChevronRight, Mic, Plus, Search, SquarePen } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { getThreads, type Thread } from './messages-data'

function ThreadAvatar({ thread, size }: { thread: Thread; size: number }) {
  return (
    <span
      aria-hidden
      style={{ width: size, height: size }}
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full bg-gradient-to-b font-semibold text-white',
        thread.isBusiness ? 'from-[#B4B9C3] to-[#8C919B]' : 'from-[#A5ABB8] to-[#858B98]',
      )}
    >
      <span style={{ fontSize: size * 0.36 }}>{thread.initials}</span>
    </span>
  )
}

function ThreadList({ threads, onOpen }: { threads: Thread[]; onOpen: (thread: Thread) => void }) {
  return (
    <ul>
      {threads.map((thread) => (
        <li key={thread.id}>
          <button
            type="button"
            onClick={() => onOpen(thread)}
            className="flex w-full items-center gap-[10px] pl-[6px] text-left transition-colors active:bg-black/[0.05]"
          >
            <span className="flex w-[10px] shrink-0 justify-center">
              {thread.unread && <span className="size-[10px] rounded-full bg-[#0A84FF]" />}
              {thread.unread && <span className="sr-only">읽지 않음</span>}
            </span>
            <ThreadAvatar thread={thread} size={46} />
            <span className="flex min-w-0 flex-1 flex-col border-b border-black/[0.1] py-[10px] pr-4">
              <span className="flex items-center gap-2">
                <span className="min-w-0 flex-1 truncate text-[16px] font-semibold text-black">{thread.name}</span>
                <span className="shrink-0 text-[14px] text-[#8E8E93]">{thread.time}</span>
                <ChevronRight className="size-[16px] shrink-0 text-[#C4C4C7]" strokeWidth={2.5} aria-hidden />
              </span>
              <span className="mt-[1px] line-clamp-2 text-[14.5px] leading-[1.3] text-[#8E8E93]">
                {thread.messages[thread.previewIndex ?? thread.messages.length - 1].text.replace(/\n/g, ' ')}
              </span>
            </span>
          </button>
        </li>
      ))}
    </ul>
  )
}

function ThreadDetail({ open, thread, onBack }: { open: boolean; thread: Thread | null; onBack: () => void }) {
  const isSms = thread?.isBusiness

  return (
    <div
      aria-hidden={!open}
      inert={!open}
      className={cn(
        'absolute inset-0 z-10 flex flex-col bg-white transition-transform duration-[450ms] ease-[cubic-bezier(0.32,0.72,0,1)]',
        open ? 'translate-x-0' : 'translate-x-full',
      )}
    >
      {thread && (
        <>
          <header className="relative shrink-0 border-b border-black/[0.08] bg-[#F7F7F7]/95 pb-[8px] pt-[54px] backdrop-blur-xl">
            <button
              type="button"
              onClick={onBack}
              className="absolute left-[6px] top-[58px] flex h-[44px] items-center text-[17px] text-[#0A84FF] active:opacity-50"
            >
              <ChevronLeft className="size-[28px]" strokeWidth={2.4} aria-hidden />
              메시지
            </button>
            <div className="flex flex-col items-center gap-[4px] pt-[2px]">
              <ThreadAvatar thread={thread} size={52} />
              <h2 className="flex items-center text-[12px] text-black">
                {thread.name}
                <ChevronRight className="size-[12px] text-[#8E8E93]" strokeWidth={2.5} aria-hidden />
              </h2>
            </div>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto px-[14px] pb-4 pt-3 [scrollbar-width:none]">
            <p className="mb-3 text-center text-[11.5px] font-medium text-[#8E8E93]">
              {isSms ? '문자 메시지' : 'iMessage'}
              <br />
              <span className="font-normal">{thread.dateLabel}</span>
            </p>
            <div className="flex flex-col gap-[6px]">
              {thread.messages.map((message, i) => (
                <p
                  key={i}
                  className={cn(
                    'max-w-[75%] whitespace-pre-line break-keep rounded-[18px] px-[12px] py-[7px] text-[16px] leading-[1.32]',
                    message.from === 'me'
                      ? 'self-end rounded-br-[5px] bg-[#0A84FF] text-white'
                      : 'self-start rounded-bl-[5px] bg-[#E9E9EB] text-black',
                  )}
                >
                  {message.text}
                </p>
              ))}
            </div>
            {thread.messages[thread.messages.length - 1].from === 'me' && (
              <p className="mt-[3px] text-right text-[11px] font-medium text-[#8E8E93]">읽음</p>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-[8px] px-[10px] pb-[34px] pt-[8px]">
            <span className="flex size-[34px] items-center justify-center rounded-full bg-[#E9E9EB]" aria-hidden>
              <Plus className="size-[20px] text-[#7C7C80]" strokeWidth={2.4} />
            </span>
            <span className="flex h-[36px] min-w-0 flex-1 items-center justify-between rounded-full border border-black/[0.15] pl-[14px] pr-[4px] text-[16px] text-[#C4C4C7]">
              {isSms ? '문자 메시지' : 'iMessage'}
              {isSms ? (
                <Mic className="mr-[6px] size-[18px] text-[#C4C4C7]" aria-hidden />
              ) : (
                <span className="flex size-[28px] items-center justify-center rounded-full bg-[#C4C4C7]" aria-hidden>
                  <ArrowUp className="size-[18px] text-white" strokeWidth={3} />
                </span>
              )}
            </span>
          </div>
        </>
      )}
    </div>
  )
}

export function MessagesApp({ open, owner }: { open: boolean; owner: string }) {
  const threads = getThreads(owner)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [lastId, setLastId] = useState<string | null>(null)
  const [readIds, setReadIds] = useState<string[]>([])

  const listThreads = threads.map((t) => (readIds.includes(t.id) ? { ...t, unread: false } : t))
  const lastThread = threads.find((t) => t.id === lastId) ?? null

  const openThread = (thread: Thread) => {
    setSelectedId(thread.id)
    setLastId(thread.id)
    setReadIds((ids) => (ids.includes(thread.id) ? ids : [...ids, thread.id]))
  }

  return (
    <section
      aria-label="메시지"
      aria-hidden={!open}
      inert={!open}
      className={cn(
        'absolute inset-0 z-20 flex origin-[38%_93%] flex-col overflow-hidden bg-white transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] sm:rounded-[55px]',
        open ? 'scale-100 opacity-100' : 'pointer-events-none scale-[0.2] opacity-0',
      )}
    >
      <div
        inert={selectedId !== null}
        className={cn(
          'flex min-h-0 flex-1 flex-col transition-transform duration-[450ms] ease-[cubic-bezier(0.32,0.72,0,1)]',
          selectedId !== null && '-translate-x-[30%]',
        )}
      >
        <header className="shrink-0 px-4 pt-[54px]">
          <div className="flex h-[44px] items-center justify-between">
            <span className="text-[17px] text-[#0A84FF]">편집</span>
            <span className="sr-only">새 메시지 작성</span>
            <SquarePen className="size-[22px] text-[#0A84FF]" strokeWidth={2} aria-hidden />
          </div>
          <h1 className="pb-2 text-[34px] font-bold tracking-tight text-black">메시지</h1>
          <div className="mb-2 flex h-[36px] items-center gap-[6px] rounded-[10px] bg-[#767680]/[0.12] px-[8px] text-[17px] text-[#8E8E93]">
            <Search className="size-[17px]" strokeWidth={2.4} aria-hidden />
            검색
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto pb-[34px] [scrollbar-width:none]">
          <ThreadList threads={listThreads} onOpen={openThread} />
        </div>
      </div>

      <ThreadDetail open={selectedId !== null} thread={lastThread} onBack={() => setSelectedId(null)} />
    </section>
  )
}
