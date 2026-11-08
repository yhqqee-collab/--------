'use client'

import { ChevronLeft, Search, SquarePen } from 'lucide-react'
import { useEffect, useState } from 'react'
import { AppShell } from '@/components/phone/app-shell'
import { NOTES, splitNote } from './notes-data'

const ACCENT = '#E0A100'

export function NotesApp({ open }: { open: boolean }) {
  const [openId, setOpenId] = useState<string | null>(null)
  const note = NOTES.find((n) => n.id === openId)

  useEffect(() => {
    if (!open) setOpenId(null)
  }, [open])

  return (
    <AppShell open={open} label="메모" className="bg-[#F2F2F7] text-black">
      {note ? (
        <div className="flex h-full flex-col bg-white">
          <header className="flex items-center justify-between px-3 pb-2 pt-[60px]">
            <button
              type="button"
              onClick={() => setOpenId(null)}
              className="flex items-center text-[17px] transition-opacity active:opacity-50"
              style={{ color: ACCENT }}
            >
              <ChevronLeft className="size-7" strokeWidth={2.2} aria-hidden />
              메모
            </button>
          </header>
          <article className="flex-1 overflow-y-auto px-5 pb-10 [scrollbar-width:none]">
            <p className="text-center text-[12px] text-black/40">
              {note.date} {note.time}
            </p>
            <h1 className="mt-3 text-[24px] font-bold leading-tight tracking-[-0.02em]">{splitNote(note).title}</h1>
            <p className="mt-2 whitespace-pre-line text-[16px] leading-relaxed">{splitNote(note).content}</p>
          </article>
        </div>
      ) : (
        <div className="flex h-full flex-col">
          <header className="px-5 pb-2 pt-[60px]">
            <h1 className="text-[32px] font-bold tracking-[-0.02em]">메모</h1>
            <div className="mt-2 flex items-center gap-2 rounded-[10px] bg-black/[0.06] px-2.5 py-[7px] text-black/40">
              <Search className="size-4" aria-hidden />
              <span className="text-[15px]">검색</span>
            </div>
          </header>
          <div className="flex-1 overflow-y-auto px-4 pb-6 [scrollbar-width:none]">
            {NOTES.length === 0 ? (
              <p className="py-16 text-center text-[15px] text-black/40">메모 없음</p>
            ) : (
              <h2 className="px-1 pb-1.5 pt-3 text-[18px] font-bold">최근</h2>
            )}
            <ul className="overflow-hidden rounded-[12px] bg-white">
              {NOTES.map((n, i) => {
                const { title, content } = splitNote(n)
                return (
                  <li key={n.id} className={i > 0 ? 'border-t border-black/[0.08]' : undefined}>
                    <button
                      type="button"
                      onClick={() => setOpenId(n.id)}
                      className="w-full px-4 py-[10px] text-left transition-colors active:bg-black/[0.05]"
                    >
                      <span className="block truncate text-[16px] font-semibold">{title}</span>
                      <span className="mt-[2px] flex gap-2 text-[14px]">
                        <span className="shrink-0 text-black/80">{n.date.slice(6)}</span>
                        <span className="truncate text-black/45">{content.replace(/\n/g, ' ')}</span>
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
          <footer className="flex items-center justify-between border-t border-black/[0.08] bg-[#F2F2F7] px-5 pb-[34px] pt-2.5">
            <span className="flex-1" />
            <span className="text-[11px] text-black/70">{`메모 ${NOTES.length}개`}</span>
            <span className="flex flex-1 justify-end" style={{ color: ACCENT }}>
              <SquarePen className="size-[22px]" aria-hidden />
            </span>
          </footer>
        </div>
      )}
    </AppShell>
  )
}
