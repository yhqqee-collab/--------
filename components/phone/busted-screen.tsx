'use client'

import { ENDINGS } from '@/lib/template-config'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

type BustedScreenProps = {
  day: number
  onRetryDay: () => void
  onRestart: () => void
  message?: string
}

export function BustedScreen({ day, onRetryDay, onRestart, message }: BustedScreenProps) {
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const id = requestAnimationFrame(() => setShown(true))
    return () => cancelAnimationFrame(id)
  }, [])

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="busted-title"
      aria-describedby="busted-desc"
      className={cn(
        'absolute inset-0 z-[80] flex flex-col items-center justify-center bg-black px-8 transition-opacity duration-[2200ms] ease-in sm:rounded-[55px]',
        shown ? 'opacity-100' : 'opacity-0',
      )}
    >
      <div
        className={cn(
          'flex flex-col items-center gap-4 text-center transition-all delay-[1600ms] duration-1000',
          shown ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0',
        )}
      >
        <h2 id="busted-title" className="text-5xl font-black tracking-[0.3em] text-red-600">
          {ENDINGS.bad.label}
        </h2>
        {message && <p className="whitespace-pre-line text-sm leading-relaxed text-white/80">{message}</p>}
        <p id="busted-desc" className="text-sm leading-relaxed text-white/60">
          {ENDINGS.bad.title}
        </p>
      </div>
      <div
        className={cn(
          'absolute bottom-16 flex w-full max-w-[240px] flex-col gap-3 transition-all delay-[2600ms] duration-700',
          shown ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
      >
        <button
          type="button"
          onClick={onRetryDay}
          className="min-h-11 rounded-full bg-white px-6 py-3 text-sm font-bold text-black transition-colors hover:bg-white/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          {day}일차부터 다시하기
        </button>
        <button
          type="button"
          onClick={onRestart}
          className="min-h-11 rounded-full border border-white/25 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          처음부터 다시하기
        </button>
      </div>
    </div>
  )
}
