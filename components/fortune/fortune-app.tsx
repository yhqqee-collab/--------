'use client'

import { Clover, Sparkles, TriangleAlert } from 'lucide-react'
import { useState } from 'react'
import { AppShell } from '@/components/phone/app-shell'
import { cn } from '@/lib/utils'

type Fortune = {
  title: string
  quote: string
  body: string
  lucky: string
  warning: string
}

const FORTUNES: Record<number, Fortune> = {}

const FALLBACK: Fortune = {
  title: '별들이 아직 침묵하는 날',
  quote: '"답은 스스로 찾아야 할 때도 있습니다."',
  body: '오늘의 운세는 아직 도착하지 않았습니다. 지금까지의 흐름을 떠올리며 신중하게 하루를 보내세요.',
  lucky: '침착하게 상황 살피기',
  warning: '성급한 판단',
}

type FortuneAppProps = {
  open: boolean
  day: number
  dateLabel: string
}

export function FortuneApp({ open, day, dateLabel }: FortuneAppProps) {
  return (
    <AppShell open={open} label="오늘의 운세" className="bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-900">
      <FortuneCard key={day} day={day} dateLabel={dateLabel} />
    </AppShell>
  )
}

function FortuneCard({ day, dateLabel }: { day: number; dateLabel: string }) {
  const [isFlipped, setIsFlipped] = useState(false)
  const fortune = FORTUNES[day] ?? FALLBACK

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden px-6 pb-10 pt-[60px]">
      <div aria-hidden className="absolute left-[-40px] top-20 size-64 animate-pulse rounded-full bg-purple-600 opacity-50 mix-blend-multiply blur-[100px]" />
      <div aria-hidden className="absolute bottom-20 right-[-40px] size-64 animate-pulse rounded-full bg-indigo-500 opacity-50 mix-blend-multiply blur-[100px] [animation-delay:700ms]" />

      <div className="z-10 mb-7 text-center">
        <p className="mb-1 text-xs font-medium tracking-widest text-purple-200/80">{"TODAY'S FORTUNE"}</p>
        <h1 className="text-xl font-bold tracking-tight text-white drop-shadow-md">{dateLabel}</h1>
      </div>

      <button
        type="button"
        aria-label={isFlipped ? '카드 다시 뒤집기' : '운세 카드 뒤집기'}
        onClick={() => setIsFlipped((flipped) => !flipped)}
        className="z-10 aspect-[2/3] w-full max-w-[300px] [perspective:1000px]"
      >
        <div
          className="relative size-full transition-transform duration-700 ease-in-out"
          style={{ transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
        >
          <div
            className="absolute flex size-full items-center justify-center overflow-hidden rounded-2xl border border-purple-400/30 bg-gradient-to-b from-indigo-900/80 to-purple-900/80 shadow-[0_0_30px_rgba(168,85,247,0.3)]"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <div className="flex h-[90%] w-[85%] items-center justify-center rounded-xl border border-purple-300/20">
              <div className="flex size-24 items-center justify-center rounded-full border border-purple-300/40 bg-purple-500/10 shadow-[0_0_20px_rgba(168,85,247,0.2)]">
                <Sparkles aria-hidden className="size-10 text-yellow-200" />
              </div>
            </div>
          </div>

          <div
            className="absolute flex size-full flex-col rounded-2xl border border-yellow-500/40 bg-gradient-to-b from-slate-900/95 to-indigo-950/95 p-5 text-left shadow-[0_0_40px_rgba(234,179,8,0.2)]"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <div className="flex flex-1 flex-col">
              <span className="mb-2 text-center text-xs font-semibold uppercase tracking-wider text-yellow-400/80">Day {day}</span>
              <h2 className="mb-3 text-balance text-center text-lg font-bold leading-snug text-yellow-300 [word-break:keep-all]">{fortune.title}</h2>
              <p className="mb-4 text-center text-sm font-medium leading-relaxed text-purple-200 [word-break:keep-all]">{fortune.quote}</p>
              <div className="mb-4 h-px w-full bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
              <p className="text-xs leading-relaxed text-slate-300 [word-break:keep-all]">{fortune.body}</p>
            </div>

            <div className="mt-3 flex flex-col gap-2">
              <div className="flex flex-col rounded-lg border border-indigo-500/30 bg-indigo-950/50 p-2.5">
                <span className="mb-1 flex items-center gap-1 text-[10px] font-bold text-indigo-300">
                  <Clover aria-hidden className="size-3" />
                  행운의 행동
                </span>
                <span className="text-xs text-indigo-100">{fortune.lucky}</span>
              </div>
              <div className="flex flex-col rounded-lg border border-rose-500/30 bg-rose-950/50 p-2.5">
                <span className="mb-1 flex items-center gap-1 text-[10px] font-bold text-rose-300">
                  <TriangleAlert aria-hidden className="size-3" />
                  주의할 행동
                </span>
                <span className="text-xs text-rose-100">{fortune.warning}</span>
              </div>
            </div>
          </div>
        </div>
      </button>

      <div className={cn('z-10 mt-8 transition-opacity duration-500', isFlipped ? 'pointer-events-none opacity-0' : 'animate-pulse opacity-100')}>
        <button
          type="button"
          tabIndex={isFlipped ? -1 : 0}
          onClick={() => setIsFlipped(true)}
          className="min-h-11 rounded-full border border-purple-500/30 bg-purple-900/20 px-6 py-2 font-medium text-purple-200 backdrop-blur-sm transition-colors hover:bg-purple-800/40"
        >
          오늘의 운세 보기
        </button>
      </div>
    </div>
  )
}
