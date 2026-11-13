'use client'

import { Heart, Volume2, X } from 'lucide-react'
import { useState } from 'react'
import { AppShell } from '@/components/phone/app-shell'
import { cn } from '@/lib/utils'
import { DUOLINGO_QUESTIONS } from './duolingo-data'

type Lesson = {
  badge: string
  prompt: string
  answer: string[]
  tiles: string[]
  tip?: string
}

function seededShuffle<T>(items: T[], seed: number): T[] {
  const result = [...items]
  let state = seed * 9301 + 49297
  for (let i = result.length - 1; i > 0; i--) {
    state = (state * 9301 + 49297) % 233280
    const j = Math.floor((state / 233280) * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

const LESSONS: Lesson[] = DUOLINGO_QUESTIONS.map((q) => {
  const toEnglish = q.id % 2 === 1
  const answer = toEnglish ? q.answerWordsEn : q.answerWordsKo
  const distractors = toEnglish ? q.distractorsEn : q.distractorsKo
  return {
    badge: toEnglish ? '영작' : '한역',
    prompt: toEnglish ? q.korean : q.english,
    answer,
    tiles: seededShuffle([...answer, ...distractors], q.id),
    tip: q.owlTip,
  }
})

const TOTAL_STEPS = LESSONS.length
const MAX_HEARTS = 3

type Result = 'correct' | 'wrong' | null

export function DuolingoApp({ open }: { open: boolean }) {
  const [picked, setPicked] = useState<number[]>([])
  const [result, setResult] = useState<Result>(null)
  const [hearts, setHearts] = useState(MAX_HEARTS)
  const [step, setStep] = useState(1)

  const lesson = LESSONS[step - 1]
  const singleWord = lesson.answer.length === 1
  const outOfHearts = hearts === 0
  const isLast = step === TOTAL_STEPS
  const progress = (step - 1 + (result === 'correct' ? 1 : 0)) / TOTAL_STEPS

  function pick(index: number) {
    if (result || outOfHearts) return
    setPicked((current) => {
      if (current.includes(index)) return current.filter((i) => i !== index)
      return singleWord ? [index] : [...current, index]
    })
  }

  function check() {
    if (picked.length === 0 || result) return
    const attempt = picked.map((i) => lesson.tiles[i]).join(' ')
    setResult(attempt === lesson.answer.join(' ') ? 'correct' : 'wrong')
  }

  function proceed() {
    if (result === 'correct') setStep((s) => (s >= TOTAL_STEPS ? 1 : s + 1))
    if (result === 'wrong') setHearts((h) => Math.max(h - 1, 0))
    setPicked([])
    setResult(null)
  }

  function restart() {
    setHearts(MAX_HEARTS)
    setStep(1)
    setPicked([])
    setResult(null)
  }

  return (
    <AppShell open={open} label="듀오링고" className="bg-white text-[#4B4B4B]">
      <header className="flex items-center gap-3 px-4 pb-3 pt-[54px]">
        <button
          type="button"
          onClick={restart}
          aria-label="레슨 다시 시작"
          className="flex size-8 items-center justify-center rounded-full text-[#AFAFAF] active:scale-90"
        >
          <X className="size-6" strokeWidth={3} aria-hidden />
        </button>
        <div
          role="progressbar"
          aria-label="레슨 진행도"
          aria-valuemin={0}
          aria-valuemax={TOTAL_STEPS}
          aria-valuenow={step - 1}
          className="h-4 flex-1 overflow-hidden rounded-full bg-[#E5E5E5]"
        >
          <div
            className="relative h-full rounded-full bg-green-500 transition-[width] duration-500"
            style={{ width: `${Math.max(progress * 100, 6)}%` }}
          >
            <span className="absolute inset-x-2 top-1 h-1 rounded-full bg-white/35" />
          </div>
        </div>
        <span className="flex items-center gap-1 text-[16px] font-extrabold text-[#FF4B4B]" aria-label={`남은 하트 ${hearts}개`}>
          <Heart className="size-6 fill-[#FF4B4B]" strokeWidth={0} aria-hidden />
          {hearts}
        </span>
      </header>

      <main className="flex flex-1 flex-col overflow-y-auto px-5 pt-3">
        <div className="flex items-center gap-2">
          <span className="w-fit rounded-xl bg-[#F3E8FF] px-2.5 py-1 text-[12px] font-extrabold uppercase tracking-wide text-[#A855F7]">
            {lesson.badge}
          </span>
          <span className="text-[12px] font-bold text-[#AFAFAF]">
            {step} / {TOTAL_STEPS}
          </span>
        </div>
        <h2 className="mt-2 text-balance text-[22px] font-extrabold leading-snug text-[#3C3C3C]">다음 문장을 번역하세요</h2>

        <div className="mt-5 flex items-end gap-3">
          <div aria-hidden className="flex size-16 shrink-0 items-center justify-center rounded-3xl bg-green-500 text-[26px] font-black text-white">
            D
          </div>
          <div className="relative flex items-center gap-2 rounded-2xl border-2 border-[#E5E5E5] px-4 py-3">
            <Volume2 className="size-5 shrink-0 text-sky-500" strokeWidth={2.6} aria-hidden />
            <span className="text-pretty text-[17px] font-bold">{lesson.prompt}</span>
            <span aria-hidden className="absolute -left-[9px] bottom-4 size-4 rotate-45 border-b-2 border-l-2 border-[#E5E5E5] bg-white" />
          </div>
        </div>

        <div className="mt-6 flex min-h-[64px] flex-wrap content-start items-center gap-2 border-y-2 border-[#E5E5E5] py-2" aria-live="polite">
          {picked.length > 0 ? (
            picked.map((i) => (
              <button
                key={i}
                type="button"
                onClick={() => pick(i)}
                disabled={result !== null}
                className="rounded-2xl border-2 border-b-4 border-[#E5E5E5] px-3 py-1.5 text-[15px] font-bold"
              >
                {lesson.tiles[i]}
              </button>
            ))
          ) : (
            <span className="text-[14px] font-semibold text-[#AFAFAF]">
              {singleWord ? '단어를 선택하세요' : '단어를 순서대로 눌러 문장을 만드세요'}
            </span>
          )}
        </div>

        <div
          className={cn('mt-6 pb-4', singleWord ? 'grid grid-cols-2 gap-3' : 'flex flex-wrap justify-center gap-2')}
          role="group"
          aria-label="단어 선택"
        >
          {lesson.tiles.map((word, i) => {
            const isPicked = picked.includes(i)
            return (
              <button
                key={`${step}-${i}`}
                type="button"
                aria-pressed={isPicked}
                disabled={result !== null || outOfHearts || (!singleWord && isPicked)}
                onClick={() => pick(i)}
                className={cn(
                  'rounded-2xl border-2 border-b-4 font-bold transition-all active:translate-y-[2px] active:border-b-2',
                  singleWord ? 'px-3 py-3.5 text-[17px]' : 'px-3 py-2 text-[15px]',
                  singleWord && isPicked && 'border-[3px] border-b-[5px] border-sky-500 bg-sky-50 text-sky-600',
                  !singleWord && isPicked && 'border-[#E5E5E5] bg-[#E5E5E5] text-transparent',
                  !isPicked && 'border-[#E5E5E5] bg-white text-[#4B4B4B]',
                )}
              >
                {word}
              </button>
            )
          })}
        </div>
      </main>

      <footer className="border-t-2 border-[#E5E5E5] px-5 pb-9 pt-4">
        {outOfHearts ? (
          <button
            type="button"
            onClick={restart}
            className="w-full rounded-2xl border-b-4 border-sky-600 bg-sky-500 py-3.5 text-[16px] font-extrabold uppercase tracking-wide text-white active:translate-y-[2px] active:border-b-2"
          >
            하트 채우고 다시 시작
          </button>
        ) : (
          <button
            type="button"
            onClick={check}
            disabled={picked.length === 0}
            className="w-full rounded-2xl border-b-4 border-green-600 bg-green-500 py-3.5 text-[16px] font-extrabold uppercase tracking-wide text-white active:translate-y-[2px] active:border-b-2 disabled:border-[#E5E5E5] disabled:bg-[#E5E5E5] disabled:text-[#AFAFAF]"
          >
            정답 확인
          </button>
        )}
      </footer>

      <div
        role="status"
        aria-hidden={result === null}
        inert={result === null}
        className={cn(
          'absolute inset-x-0 bottom-0 rounded-t-3xl px-5 pb-9 pt-5 transition-transform duration-300 ease-out',
          result === 'wrong' ? 'bg-red-100' : 'bg-green-100',
          result ? 'translate-y-0' : 'translate-y-full',
        )}
      >
        <p className={cn('text-[22px] font-extrabold', result === 'wrong' ? 'text-red-600' : 'text-green-600')}>
          {result === 'wrong' ? '틀렸습니다!' : isLast ? '레슨 완료!' : '정답입니다!'}
        </p>
        <p className={cn('mt-1 text-pretty text-[14px] font-bold', result === 'wrong' ? 'text-red-500' : 'text-green-600')}>
          {result === 'wrong'
            ? `정답: ${lesson.answer.join(' ')}`
            : isLast
              ? '모든 단계를 끝냈어요. 처음부터 다시 복습해요!'
              : '훌륭해요, 다음은 조금 더 어려워요!'}
        </p>
        {lesson.tip && (
          <p className="mt-2 text-pretty text-[13px] font-semibold text-neutral-600">{lesson.tip}</p>
        )}
        <button
          type="button"
          onClick={proceed}
          className={cn(
            'mt-4 w-full rounded-2xl border-b-4 py-3.5 text-[16px] font-extrabold uppercase tracking-wide text-white active:translate-y-[2px] active:border-b-2',
            result === 'wrong' ? 'border-red-700 bg-red-500' : 'border-green-600 bg-green-500',
          )}
        >
          계속하기
        </button>
      </div>
    </AppShell>
  )
}
