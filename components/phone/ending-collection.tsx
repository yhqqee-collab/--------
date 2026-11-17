'use client'

import { useEffect, useState } from 'react'
import { BookOpen, ChevronDown, Lock, X } from 'lucide-react'
import {
  ENDING_CATALOG,
  onEndingsChanged,
  readCollectedEndings,
  type CollectedEndings,
  type EndingEntry,
} from '@/lib/ending-collection'
import { replaceUserNameLiterary } from '@/lib/korean-name'
import { cn } from '@/lib/utils'

const TYPE_STYLE = {
  happy: { badge: 'HAPPY', className: 'text-[#ffd9e4] border-[#ffd9e4]/40' },
  obsessive: { badge: 'OBSESSION', className: 'text-[#ff9a9a] border-[#ff9a9a]/40' },
  breakup: { badge: 'BREAKUP', className: 'text-[#b8c4d6] border-[#b8c4d6]/40' },
  harem: { badge: 'HIDDEN', className: 'text-[#ffd27a] border-[#ffd27a]/40' },
  catastrophe: { badge: 'CATASTROPHE', className: 'text-[#ff5c5c] border-[#ff5c5c]/40' },
} as const

function formatDate(ms: number) {
  const date = new Date(ms)
  return `${date.getMonth() + 1}월 ${date.getDate()}일`
}

/** 홈 화면 아이콘 그림 */
export function EndingCollectionArt() {
  return (
    <span className="flex size-full items-center justify-center bg-[linear-gradient(145deg,#3a1630,#0b070c)]">
      <BookOpen className="size-[55%] text-[#ffd9e4]" strokeWidth={1.8} aria-hidden />
    </span>
  )
}

type EndingCollectionProps = {
  open: boolean
  owner: string
  onClose: () => void
}

export function EndingCollection({ open, owner, onClose }: EndingCollectionProps) {
  const [collected, setCollected] = useState<CollectedEndings>({})
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    const refresh = () => setCollected(readCollectedEndings())
    refresh()
    return onEndingsChanged(refresh)
  }, [])

  useEffect(() => {
    if (open) setCollected(readCollectedEndings())
    else setExpanded(null)
  }, [open])

  const total = ENDING_CATALOG.length
  const count = ENDING_CATALOG.filter((entry) => collected[entry.id]).length
  const groups = ENDING_CATALOG.reduce<{ name: string; entries: EndingEntry[] }[]>((acc, entry) => {
    const last = acc.at(-1)
    if (last?.name === entry.group) last.entries.push(entry)
    else acc.push({ name: entry.group, entries: [entry] })
    return acc
  }, [])

  return (
    <section
      aria-label="엔딩 도감"
      aria-hidden={!open}
      inert={!open}
      className={cn(
        'absolute inset-0 z-[95] flex flex-col bg-[#0b070c] text-white transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] sm:rounded-[55px]',
        open ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-6 opacity-0',
      )}
    >
      <header className="flex shrink-0 items-center justify-between px-6 pb-4 pt-[60px]">
        <div>
          <p className="text-xs font-semibold tracking-[0.3em] text-white/45">ENDING COLLECTION</p>
          <h2 className="mt-1 text-2xl font-black">엔딩 도감</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="엔딩 도감 닫기"
          className="flex size-10 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          <X className="size-5" aria-hidden />
        </button>
      </header>

      <div className="shrink-0 px-6 pb-5">
        <div className="flex items-baseline justify-between text-sm">
          <span className="text-white/60">수집한 엔딩</span>
          <span className="font-bold tabular-nums">
            <span className="text-[#ffd9e4]">{count}</span>
            <span className="text-white/40"> / {total}</span>
          </span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-[#ffd9e4] transition-[width] duration-700"
            style={{ width: `${(count / total) * 100}%` }}
          />
        </div>
        {count === total && <p className="mt-3 text-center text-sm font-semibold text-[#ffd27a]">모든 엔딩을 모았어요! 🎉</p>}
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-12">
        {groups.map((group) => (
          <div key={group.name} className="mb-6">
            <h3 className="mb-2 text-xs font-semibold tracking-wider text-white/45">{group.name}</h3>
            <ul className="flex flex-col gap-2">
              {group.entries.map((entry) => {
                const seenAt = collected[entry.id]
                const style = TYPE_STYLE[entry.scene.type]
                const isOpen = expanded === entry.id
                if (!seenAt) {
                  return (
                    <li key={entry.id} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3.5">
                      <Lock className="size-4 shrink-0 text-white/30" aria-hidden />
                      <div className="min-w-0">
                        <p className="text-[15px] font-bold tracking-widest text-white/35">???</p>
                        <p className="mt-0.5 text-xs text-white/40">{entry.hint}</p>
                      </div>
                    </li>
                  )
                }
                return (
                  <li key={entry.id} className="rounded-2xl border border-white/15 bg-white/[0.06]">
                    <button
                      type="button"
                      onClick={() => setExpanded(isOpen ? null : entry.id)}
                      aria-expanded={isOpen}
                      className="flex w-full items-center gap-3 px-4 py-3.5 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                    >
                      <div className="min-w-0 flex-1">
                        <span className={cn('inline-block rounded-full border px-2 py-0.5 text-[10px] font-bold tracking-wider', style.className)}>
                          {style.badge}
                        </span>
                        <p className="mt-1.5 text-[15px] font-bold leading-snug">{entry.scene.title}</p>
                        <p className="mt-0.5 text-xs text-white/40">{formatDate(seenAt)} 처음 봄</p>
                      </div>
                      <ChevronDown className={cn('size-4 shrink-0 text-white/50 transition-transform', isOpen && 'rotate-180')} aria-hidden />
                    </button>
                    {isOpen && (
                      <div className="flex flex-col gap-3 border-t border-white/10 px-4 pb-5 pt-4">
                        {entry.scene.lines.map((line, index) => (
                          <p
                            key={index}
                            className={cn(
                              'whitespace-pre-line text-pretty text-[13px] leading-relaxed',
                              line.startsWith('"') ? 'font-semibold text-white' : 'text-white/60',
                            )}
                          >
                            {replaceUserNameLiterary(line, owner)}
                          </p>
                        ))}
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}
