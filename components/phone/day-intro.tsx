'use client'

import { useEffect, useState } from 'react'

type DayIntroProps = {
  day: number
  dateLabel: string
  onDone: () => void
}

type Phase = 'enter' | 'show' | 'leave'

export function DayIntro({ day, dateLabel, onDone }: DayIntroProps) {
  const [phase, setPhase] = useState<Phase>('enter')

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase('show'), 100),
      setTimeout(() => setPhase('leave'), 3200),
      setTimeout(onDone, 4200),
    ]
    return () => timers.forEach(clearTimeout)
  }, [onDone])

  return (
    <section
      aria-label={`${day}일차`}
      aria-live="polite"
      className={`absolute inset-0 z-[70] flex flex-col items-center justify-center bg-black text-white transition-opacity duration-1000 ${
        phase === 'leave' ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div
        className={`flex flex-col items-center gap-3 transition-all duration-1000 ${
          phase === 'show' ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
        }`}
      >
        <h2 className="text-[30px] font-semibold tracking-tight">{`${day}일차`}</h2>
        <p className="text-[15px] text-white/70">{`오늘은 ${dateLabel}입니다`}</p>
      </div>
    </section>
  )
}
