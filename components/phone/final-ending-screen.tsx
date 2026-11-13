'use client'

import { useEffect, useState } from 'react'
import { ENDING_CHOICES, canUnlockHarem, resolveFinalEnding, type FinalChoice } from '@/components/kakao/endings'
import { replaceUserNameLiterary } from '@/lib/korean-name'
import { cn } from '@/lib/utils'

type FinalEndingScreenProps = {
  owner: string
  day: number
  suspicion: Record<string, number>
  hidden?: boolean
  onRetryDay: () => void
  onRestart: () => void
  onViewHistory: () => void
}

const LINE_FADE_MS = 700

export function FinalEndingScreen({ owner, day, suspicion, hidden = false, onRetryDay, onRestart, onViewHistory }: FinalEndingScreenProps) {
  const [shown, setShown] = useState(false)
  const [route, setRoute] = useState<FinalChoice | null>(null)
  const [visibleLines, setVisibleLines] = useState(0)

  useEffect(() => {
    const id = window.setTimeout(() => setShown(true), 50)
    return () => window.clearTimeout(id)
  }, [])

  const haremUnlocked = canUnlockHarem(suspicion)
  const ending = route ? resolveFinalEnding(route, suspicion) : null
  const lines = ending?.lines.map((line) => replaceUserNameLiterary(line, owner)) ?? []
  const allShown = ending !== null && visibleLines >= lines.length
  const endingStyle = {
    happy: { accent: 'text-[#ffd9e4]', badge: 'HAPPY ENDING' },
    obsessive: { accent: 'text-[#ff9a9a]', badge: 'OBSESSION ENDING' },
    breakup: { accent: 'text-[#b8c4d6]', badge: 'BREAKUP ENDING' },
    harem: { accent: 'text-[#ffd27a]', badge: 'HIDDEN ENDING' },
    catastrophe: { accent: 'text-[#ff5c5c]', badge: 'CATASTROPHE ENDING' },
  }[ending?.type ?? 'happy']
  const { accent, badge } = endingStyle

  function choose(id: FinalChoice) {
    setRoute(id)
    window.setTimeout(() => setVisibleLines(1), 1200)
  }

  function advance() {
    if (!ending || allShown) return
    setVisibleLines((count) => Math.min(lines.length, count + 1))
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={ending ? ending.title : '최종 선택'}
      className={cn(
        'absolute inset-0 z-[85] flex flex-col bg-black text-white transition-opacity duration-[2000ms] ease-in sm:rounded-[55px]',
        shown ? 'opacity-100' : 'opacity-0',
        hidden && 'hidden',
      )}
    >
      {!route && (
        <div
          className={cn(
            'flex flex-1 flex-col items-center justify-center gap-8 px-8 transition-opacity delay-[1800ms] duration-1000',
            shown ? 'opacity-100' : 'opacity-0',
          )}
        >
          <div className="flex flex-col items-center gap-3 text-center">
            <p className="rounded-xl bg-white/10 px-3 py-2 text-xs font-medium text-amber-300">
              {'🍻 [동아리 전체 뒤풀이 진행 중...] (18:00 ~ 22:00) 🍻'}
            </p>
            <p className="mt-2 text-xs font-semibold tracking-[0.4em] text-white/50">FINAL CHOICE</p>
            <h2 className="text-balance text-xl font-bold leading-relaxed">마지막 선택은?</h2>
            <p className="text-pretty text-sm leading-relaxed text-white/60">
              뒤풀이가 끝나갈 무렵, 세 사람의 시선이 당신을 향합니다.
              <br />
              오늘 밤, 누구와 함께 나가시겠습니까?
            </p>
          </div>
          <ul className="flex w-full max-w-[260px] flex-col gap-3">
            {ENDING_CHOICES.map((choice) => (
              <li key={choice.id}>
                <button
                  type="button"
                  onClick={() => choose(choice.id)}
                  className="min-h-12 w-full rounded-xl border border-white/30 px-5 py-3 text-[15px] font-semibold transition-colors hover:bg-white hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  {choice.name}에게 간다
                </button>
              </li>
            ))}
            {haremUnlocked && (
              <li className="mt-2">
                <button
                  type="button"
                  onClick={() => choose('harem')}
                  className="min-h-12 w-full rounded-xl border border-amber-300/60 bg-amber-300/10 px-5 py-3 text-[15px] font-bold text-amber-200 transition-colors hover:bg-amber-300 hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300"
                >
                  {'✨ 셋 다 놓칠 수 없어 (어장 완성)'}
                </button>
              </li>
            )}
          </ul>
        </div>
      )}

      {ending && (
        <button
          type="button"
          onClick={advance}
          disabled={allShown}
          aria-label={allShown ? undefined : '다음 문장 보기'}
          className="flex flex-1 flex-col justify-center gap-4 overflow-y-auto px-7 py-16 text-left disabled:cursor-default"
        >
          {lines.slice(0, visibleLines).map((line, index) => {
            const isDialogue = line.startsWith('"')
            return (
              <p
                key={index}
                style={{ animationDuration: `${LINE_FADE_MS}ms` }}
                className={cn(
                  'animate-in fade-in slide-in-from-bottom-1 whitespace-pre-line text-pretty text-[14px] leading-relaxed',
                  isDialogue ? 'font-semibold text-white' : 'text-white/65',
                  isDialogue && accent,
                )}
              >
                {line}
              </p>
            )
          })}
          {!allShown && visibleLines > 0 && (
            <span aria-hidden="true" className="mt-2 animate-pulse self-center text-xs text-white/40">
              화면을 눌러 계속
            </span>
          )}
        </button>
      )}

      {ending && allShown && (
        <div className="flex animate-in flex-col items-center gap-5 px-8 pb-16 pt-2 text-center fade-in duration-1000">
          <p className={cn('text-xs font-semibold tracking-[0.3em]', accent)}>{badge}</p>
          <h2 className="text-balance text-lg font-black leading-snug">{ending.title}</h2>
          <div className="flex w-full max-w-[240px] flex-col gap-3 border-t border-white/10 pt-5">
            <button
              type="button"
              onClick={onRetryDay}
              className="min-h-11 rounded-full bg-white px-7 py-3 text-sm font-bold text-black transition-colors hover:bg-white/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              {day}일차부터 다시하기
            </button>
            <button
              type="button"
              onClick={onRestart}
              className="min-h-11 rounded-full border border-white/25 px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              처음부터 다시하기
            </button>
            <button
              type="button"
              onClick={onViewHistory}
              className="min-h-11 rounded-full px-7 py-3 text-sm font-medium text-white/55 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              대화 기록 보기
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
