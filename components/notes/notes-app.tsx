'use client'

import { Check, ChevronLeft, Pin, Search, SquarePen } from 'lucide-react'
import { Fragment, useEffect, useState, type ReactNode } from 'react'
import { AppShell } from '@/components/phone/app-shell'
import { NOTES, previewText, splitNote, type Note } from './notes-data'

const ACCENT = '#E0A100'

function renderInline(text: string): ReactNode {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith('**') && part.endsWith('**') ? (
      <strong key={i} className="font-semibold">
        {part.slice(2, -2)}
      </strong>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  )
}

function NoteBody({
  content,
  checked,
  onToggle,
}: {
  content: string
  checked: Record<number, boolean>
  onToggle: (line: number) => void
}) {
  return (
    <div className="mt-3 flex flex-col gap-1.5 text-[16px] leading-relaxed">
      {content.split('\n').map((line, i) => {
        if (line.trim() === '') return <div key={i} className="h-2" />
        if (line.trim() === '---') return <hr key={i} className="my-2 border-black/10" />

        const task = line.match(/^-\s\[( |x)\]\s(.*)$/)
        if (task) {
          const done = checked[i] ?? task[1] === 'x'
          return (
            <button
              key={i}
              type="button"
              role="checkbox"
              aria-checked={done}
              onClick={() => onToggle(i)}
              className="flex items-start gap-2.5 text-left"
            >
              <span
                className="mt-[3px] flex size-[22px] shrink-0 items-center justify-center rounded-full border-[1.5px] transition-colors"
                style={done ? { backgroundColor: ACCENT, borderColor: ACCENT } : { borderColor: 'rgba(0,0,0,0.25)' }}
              >
                {done && <Check className="size-3.5 text-white" strokeWidth={3} aria-hidden />}
              </span>
              <span className={done ? 'text-black/40 line-through' : undefined}>{renderInline(task[2])}</span>
            </button>
          )
        }

        const nested = line.match(/^\s{2,}-\s(.*)$/)
        if (nested) {
          return (
            <div key={i} className="flex gap-2 pl-6">
              <span className="shrink-0 text-black/50" aria-hidden>
                ◦
              </span>
              <span>{renderInline(nested[1])}</span>
            </div>
          )
        }

        const bullet = line.match(/^-\s(.*)$/)
        if (bullet) {
          return (
            <div key={i} className="mt-1 flex gap-2">
              <span className="shrink-0" aria-hidden>
                •
              </span>
              <span>{renderInline(bullet[1])}</span>
            </div>
          )
        }

        return <p key={i}>{renderInline(line)}</p>
      })}
    </div>
  )
}

function NoteList({ title, notes, onOpen }: { title: ReactNode; notes: Note[]; onOpen: (id: string) => void }) {
  if (notes.length === 0) return null
  return (
    <section>
      <h2 className="flex items-center gap-1 px-1 pb-1.5 pt-4 text-[18px] font-bold">{title}</h2>
      <ul className="overflow-hidden rounded-[12px] bg-white">
        {notes.map((n, i) => {
          const { title: noteTitle, content } = splitNote(n)
          return (
            <li key={n.id} className={i > 0 ? 'border-t border-black/[0.08]' : undefined}>
              <button
                type="button"
                onClick={() => onOpen(n.id)}
                className="w-full px-4 py-[10px] text-left transition-colors active:bg-black/[0.05]"
              >
                <span className="block truncate text-[16px] font-semibold">{noteTitle}</span>
                <span className="mt-[2px] flex gap-2 text-[14px]">
                  <span className="shrink-0 text-black/80">{n.date.slice(6)}</span>
                  <span className="truncate text-black/45">{previewText(content)}</span>
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

export function NotesApp({ open }: { open: boolean }) {
  const [openId, setOpenId] = useState<string | null>(null)
  const [checks, setChecks] = useState<Record<string, Record<number, boolean>>>({})
  const note = NOTES.find((n) => n.id === openId)

  useEffect(() => {
    if (!open) setOpenId(null)
  }, [open])

  const toggle = (noteId: string, line: number) =>
    setChecks((prev) => ({
      ...prev,
      [noteId]: { ...prev[noteId], [line]: !prev[noteId]?.[line] },
    }))

  const pinned = NOTES.filter((n) => n.pinned)
  const recent = NOTES.filter((n) => !n.pinned)

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
            <NoteBody
              content={splitNote(note).content}
              checked={checks[note.id] ?? {}}
              onToggle={(line) => toggle(note.id, line)}
            />
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
            {NOTES.length === 0 && <p className="py-16 text-center text-[15px] text-black/40">메모 없음</p>}
            <NoteList
              title={
                <>
                  <Pin className="size-4" style={{ color: ACCENT }} aria-hidden />
                  고정됨
                </>
              }
              notes={pinned}
              onOpen={setOpenId}
            />
            <NoteList title="최근" notes={recent} onOpen={setOpenId} />
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
